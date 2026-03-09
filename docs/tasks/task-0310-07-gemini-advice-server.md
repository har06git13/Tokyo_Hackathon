# task-0310-07: Gemini Advice API サーバー実装

## 概要
`server/index.js` に `GET /api/advice` エンドポイントを追加する。
PDF の Gemini Files API へのアップロードはサーバー起動時に1回だけ行い、
`server/gemini-files.js` に分離する。

## 関連仕様
- 仕様書 §4.8.0〜§4.8.2

## 変更ファイル
| ファイル | 種別 | 内容 |
|----------|------|------|
| `server/gemini-files.js` | 新規 | PDF アップロード・再利用ロジック（起動時1回） |
| `server/index.js` | 修正 | `/api/advice` エンドポイント追加、起動時 `initGeminiFiles()` 呼び出し |
| `server/advice_cache.json` | 新規（自動生成） | SHA-256 キャッシュ |
| `server/.env` | 修正 | `GEMINI_API_KEY` を追加 |
| `server/package.json` | 修正 | `@google/genai` 依存追加 |

## 実装仕様

### server/gemini-files.js
```js
// PDF の Gemini Files API アップロードを1回だけ行い fileUri 群を返す
// state が ACTIVE なら再利用、PROCESSING なら待機、それ以外は再アップロード
```

- `initGeminiFiles()` → `Promise<fileObj[]>`
- `display_name` は ASCII セーフ名（`gemini-set/advice_filesapi_test.py` の `safe_display_name` と同じ変換ルール）
- `knowledge/` ディレクトリは `gemini-set/knowledge/` の PDF を参照

### /api/advice エンドポイント
- `GET /api/advice?actions=<urlencoded_string>`
- キャッシュキー: `crypto.createHash('sha256').update(actions.trim()).digest('hex')`
- キャッシュファイル: `server/advice_cache.json`（JSON read/write）
- Gemini API 呼び出しパラメータ:
  - `model`: `gemini-2.5-flash`
  - `temperature`: 0.2
  - `thinking_budget`: 0
  - `max_output_tokens`: 500
- システムプロンプト（`advice_filesapi_test.py` の `SYSTEM_PROMPT` と同内容）
- シナリオ文（`SCENARIO` と同内容）＋ユーザー行動文: `「${actions}」`
- レスポンス: `{ advice: string|null, fromCache: boolean }`
- エラー時: `{ advice: null, fromCache: false }`（500 にしない → クライアントがフォールバック判定できるよう 200 で返す）

### レートリミット・ガードレール
- `RATE_LIMIT_SEC = 2`（前回呼び出しから2秒未満なら待機）
- リトライ: 503/429 のみ最大3回、指数バックオフ（初期5秒）

## 完了条件
- [ ] `GET /api/advice?actions=食料と現金を確保した` がアドバイス文字列を返す
- [ ] 同一 actions の2回目リクエストが `fromCache: true` を返す
- [ ] Gemini API キー未設定時でも起動が落ちない（警告ログのみ）
- [ ] PDF アップロードがサーバー起動時1回のみ実行される（リクエストごとに実行されない）
