# タスク: ResultPage ロジック重複解消（resultPageLogic.js への集約）

## ステータス: 実装完了（レビュー待ち）

## 背景

`ResultPage.jsx` 内に `facilityHintMap`・`buildHints`・`getFlavorText`・`flavorTextMap` などが
インライン定義されており、`resultPageLogic.js` の同名エクスポートと乖離が生じていた。
また `calcElapsedTime`・`createStartTime` も重複ロジックを持つ。

仕様書 §12.2「ロジック集約ルール（重複禁止）」に従い、全ロジックを `resultPageLogic.js` に一本化する。

## 変更内容

### `client/src/utils/resultPageLogic.js`

1. `facilityHintMap` に fac_002 / fac_004 / fac_005 エントリを追加（仕様書 §4.8.2 正規定義）
2. `buildHints` を仕様書 §4.8.1 に合わせて修正:
   - `visited` / `notVisited` が存在する場合のみプッシュ（fac_005 notVisited はスキップ）
   - 3件以上はシャッフル後に2件選択
   - フォールバック（`fallbackHints`）を削除（0件時は空配列を返す）
3. `fallbackHints` 定数を削除

### `client/src/pages/ResultPage.jsx`

1. インライン定義を削除: `facilityHintMap`, `flavorTextMap`, `defaultSuccessText`, `defaultFailureText`, `getFlavorText`, `buildHints`（内部関数）
2. `resultPageLogic.js` から `buildHints`, `getFlavorText`, `calcElapsedTime` をインポート
3. `useMemo` で `startTime`（当日14:00）を固定
4. `calcElapsedTime(currentTime, startTime)` を使用
5. `hintsData` の算出: `timelineData.length === 0` の場合は `buildHints` を呼ばず空配列

## 受け入れ条件

- `ResultPage.jsx` に `facilityHintMap` / `buildHints` / `getFlavorText` のインライン定義が存在しない
- ヒント表示ロジックが resultPageLogic.js の実装と一致する
- 経過時間の計算が `calcElapsedTime` を使っている
