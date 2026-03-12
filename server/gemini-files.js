/**
 * gemini-files.js
 * Gemini Files API へのPDFアップロードを管理する。
 * サーバー起動時に1回だけ initGeminiFiles() を呼び、
 * 以降は /api/advice エンドポイントが返却値を参照する。
 */
const fs = require('fs');
const path = require('path');
const os = require('os');

const KNOWLEDGE_DIR = path.resolve(__dirname, 'knowledge');

const NAME_MAP = {
  '東京防災.pdf': 'tokyo_bousai.pdf',
  '東京くらし防災.pdf': 'tokyo_kurashi_bousai.pdf',
};

function safeDisplayName(filename) {
  return NAME_MAP[filename] || filename.replace(/[^\x00-\x7F]/g, '_');
}

/**
 * PDFを Gemini Files API にアップロード（または既存ファイルを再利用）し、
 * ファイルオブジェクトの配列を返す。
 * @param {GoogleGenAI} ai - Gemini client
 * @returns {Promise<Array>} アップロード済みファイルオブジェクトの配列
 */
async function initGeminiFiles(ai) {
  const pdfPaths = fs.readdirSync(KNOWLEDGE_DIR)
    .filter(f => f.endsWith('.pdf'))
    .sort()
    .map(f => path.join(KNOWLEDGE_DIR, f));

  if (pdfPaths.length === 0) {
    console.warn('[gemini-files] knowledge/ にPDFが見つかりません:', KNOWLEDGE_DIR);
    return [];
  }

  // 既存アップロード済みファイル一覧を取得（Pager は for-await で反復）
  const existingMap = {};
  try {
    const pager = await ai.files.list();
    for await (const f of pager) {
      if (f.displayName) existingMap[f.displayName] = f;
    }
  } catch (e) {
    console.warn('[gemini-files] files.list() 失敗（続行します）:', e.message);
  }

  const uploaded = [];
  for (const pdfPath of pdfPaths) {
    const original = path.basename(pdfPath);
    const displayName = safeDisplayName(original);

    const existing = existingMap[displayName];
    if (existing && existing.state === 'ACTIVE') {
      console.log(`[gemini-files] ♻️  再利用: ${original}`);
      uploaded.push(existing);
      continue;
    }

    console.log(`[gemini-files] 📤 アップロード中: ${original}`);
    // 日本語ファイル名を避けるため一時ファイルにコピー
    const tmpPath = path.join(os.tmpdir(), displayName);
    fs.copyFileSync(pdfPath, tmpPath);

    try {
      let fileObj = await ai.files.upload({
        file: tmpPath,
        config: { displayName, mimeType: 'application/pdf' },
      });

      // PROCESSING → ACTIVE になるまで待機
      while (fileObj.state === 'PROCESSING') {
        await new Promise(r => setTimeout(r, 2000));
        fileObj = await ai.files.get({ name: fileObj.name });
      }

      console.log(`[gemini-files] ✅ 完了: ${displayName} (${fileObj.uri})`);
      uploaded.push(fileObj);
    } finally {
      try { fs.unlinkSync(tmpPath); } catch (_) {}
    }
  }

  return uploaded;
}

module.exports = { initGeminiFiles };
