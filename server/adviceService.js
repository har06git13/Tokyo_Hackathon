/**
 * adviceService.js
 * Gemini アドバイス生成ロジックをテスト可能な形で切り出したモジュール。
 * 依存（genaiClient, geminiFiles, cache）はすべて引数で受け取る。
 */
const crypto = require('crypto');

const ADVICE_SYSTEM_PROMPT =
  'あなたは防災アドバイザーです。' +
  '添付の防災資料のみを根拠にして、ユーザーの体験をもとにアドバイスしてください。' +
  '文体は「〜行動できた。〜しよう！」形式で、' +
  '過去の行動を事実として端的に述べたあと、今後すべき備えを「〜しよう」「〜確認しよう」「〜準備しよう」などの命令形・促し形で締めてください。' +
  '改行・箇条書き・段落分けを一切使わず、100字前後のワンセンテンスで返してください。' +
  '資料名やページ番号は出力に含めないでください。';
const ADVICE_SCENARIO =
  '【状況】土曜の午後14時、渋谷駅ハチ公前で都心南部直下地震（M7.3、震度6強）が発生。' +
  'あなたは帰宅困難者として次の行動を取りました。';

const RATE_LIMIT_MS = 2000;
const MAX_RETRIES = 3;

/**
 * actions 文字列から SHA-256 キャッシュキーを生成する。
 * @param {string} actions
 * @returns {string}
 */
function cacheKey(actions) {
  return crypto.createHash('sha256').update(actions.trim()).digest('hex');
}

/**
 * Gemini API を呼び出してアドバイスを取得する。
 *
 * @param {string} actions - ユーザー行動サマリー文字列
 * @param {object} deps - 依存オブジェクト
 * @param {object|null} deps.genaiClient - GoogleGenAI インスタンス（null なら LLM 無効）
 * @param {Array}  deps.geminiFiles - アップロード済みファイルオブジェクト配列
 * @param {object} deps.cache - { [key: string]: string } キャッシュオブジェクト（参照渡し）
 * @param {Function} deps.saveCache - (cache) => void キャッシュ永続化関数
 * @param {Function} [deps.getLastCallTime] - () => number レートリミット用（省略可）
 * @param {Function} [deps.setLastCallTime] - (t: number) => void （省略可）
 * @returns {Promise<string|null>} アドバイステキスト、または null
 */
async function getAdvice(actions, deps) {
  const {
    genaiClient,
    geminiFiles,
    cache,
    saveCache,
    getLastCallTime = () => 0,
    setLastCallTime = () => {},
  } = deps;

  const trimmed = (actions || '').trim();
  if (!trimmed) return null;

  // キャッシュヒット
  const key = cacheKey(trimmed);
  if (cache[key]) return cache[key];

  // Gemini 未初期化 or PDFなし → null
  if (!genaiClient || !Array.isArray(geminiFiles) || geminiFiles.length === 0) {
    return null;
  }

  // レートリミット
  const elapsed = Date.now() - getLastCallTime();
  if (elapsed < RATE_LIMIT_MS) {
    await new Promise(r => setTimeout(r, RATE_LIMIT_MS - elapsed));
  }

  const parts = [
    { text: ADVICE_SYSTEM_PROMPT },
    ...geminiFiles.map(f => ({ fileData: { fileUri: f.uri, mimeType: 'application/pdf' } })),
    { text: `${ADVICE_SCENARIO}\n【ユーザーの行動】${trimmed}\n\n100字前後でアドバイスしてください。` },
  ];

  let response;
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      response = await genaiClient.models.generateContent({
        model: 'gemini-2.5-flash-lite',
        contents: [{ role: 'user', parts }],
        config: { temperature: 0.2, thinkingConfig: { thinkingBudget: 0 }, maxOutputTokens: 500 },
      });
      break;
    } catch (e) {
      const status = e?.status || e?.code;
      if ((status === 503 || status === 429) && attempt < MAX_RETRIES) {
        await new Promise(r => setTimeout(r, 5000 * (2 ** (attempt - 1))));
      } else {
        throw e;
      }
    }
  }

  setLastCallTime(Date.now());
  const raw = response?.text;
  const rawText = (typeof raw === 'function' ? raw() : raw) || '';
  const advice = rawText.replace(/\n+/g, '').trim() || null;

  if (advice) {
    cache[key] = advice;
    saveCache(cache);
  }

  return advice;
}

module.exports = { getAdvice, cacheKey };
