# task-0310-08: Gemini Advice クライアント統合

## 概要
ResultPage の「防災に向けてのヒント」セクションを LLM 生成アドバイスに置換する。
アクションサマリー生成ロジックを `resultPageLogic.js` に追加し、
`ResultPage.jsx` でフェッチ・表示・フォールバックを実装する。

## 関連仕様
- 仕様書 §4.8.1 / §4.8.3 / §4.8.5

## 変更ファイル
| ファイル | 種別 | 内容 |
|----------|------|------|
| `client/src/utils/resultPageLogic.js` | 修正 | `buildActionSummary()` を追加 |
| `client/src/pages/ResultPage.jsx` | 修正 | LLM フェッチ + フォールバック表示 + キーワード赤字 |

## 実装仕様

### buildActionSummary(visitedFacilities, eventHistory) → string
`resultPageLogic.js` に追加。

```
fac_001 訪問 → "充電スポットで充電した"
fac_002 訪問 → "避難誘導サインを確認した"
fac_003 訪問 → "食料と現金を確保した"
fac_004 訪問 → "帰宅困難者受け入れ施設の情報を取得した"
fac_005 訪問 → "一時避難場所（ウィズ原宿）に到達した"
event_sns_ 前置詞のイベントが1件以上 → "SNSで安否情報を発信・収集した"
すべて空 → "行動せずに移動した"
```

該当項目を `「、」` で結合して返す。

### ResultPage.jsx 変更
1. `useEffect` で `/api/advice?actions=<encoded>` を fetch
2. ステート: `adviceState = { text: null, loading: false, isLLM: false }`
3. 行動履歴が空（`timelineData.length === 0`）の場合は fetch せずフォールバック直行
4. fetch 成功 + `advice !== null` → `text = advice, isLLM = true`
5. fetch 失敗 / `advice === null` → フォールバック: `buildHints()` の結果を `text` に格納
6. ローディング中は `「アドバイスを生成中...」` を表示

### キーワード赤字ハイライト
```js
const ADVICE_KEYWORDS = [
  "モバイルバッテリー", "充電", "現金", "食料", "飲料水", "避難場所",
  "ハザードマップ", "帰宅困難", "SNS", "安否", "備蓄", "非常食",
  "防災", "避難訓練", "情報収集", "一時避難",
];
```
- テキストを `ADVICE_KEYWORDS` でトークン分割し、マッチ部分を `<Text as="span" color="red.500">` で囲む
- ヘルパー関数 `highlightKeywords(text)` → JSX 要素配列（`resultPageLogic.js` または `ResultPage.jsx` 内）

## 完了条件
- [ ] LLM アドバイスが1件表示される
- [ ] 防災キーワードが赤字でハイライトされる
- [ ] フェッチ中に「アドバイスを生成中...」が表示される
- [ ] API 失敗時にルールベースヒントが表示される（フォールバック動作）
- [ ] 行動履歴が空の場合は「生存のヒントがありません」が表示される
