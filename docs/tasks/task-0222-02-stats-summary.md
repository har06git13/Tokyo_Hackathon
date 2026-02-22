# Task 2: 統計サマリーコンポーネント作成

> 仕様: [../result-page-spec.md](../result-page-spec.md) セクション 2

## ステータス: ✅ 完了

## 対象ファイル

- `client/src/components/game-page/StatsSummary.jsx`（新規）
- `client/src/components/game-page/index.js`（export追加）
- `client/src/pages/ResultPage.jsx`（組み込み）

## 内容

### 1. StatsSummary.jsx 新規作成
- 5項目（総移動距離・訪問施設数・経過時間・使用したお金・SNS利用回数）をカード形式で表示
- Atom を直接読まず、props で値を受け取る純粋表示コンポーネント
- `expected-earthquake` セクションと同じカードスタイルに準拠
- `null` 値のフォールバック表示（「— km」等）

**レイアウトイメージ:**
```
┌──────────────────────────────────────────┐
│ プレイ統計                                │
├──────────────────────────────────────────┤
│                                          │
│  総移動距離     経過時間      訪問施設数 │ ← ラベル（text-maintext）
│  — km         0時間0分       1 箇所   │ ← 数値（text-sectiontitle、赤、太字）
│                                          │
│  使用したお金  SNS利用回数           │
│  0             0 回                   │
│                                          │
└──────────────────────────────────────────┘

※ 順番: 総移動距離 → 経過時間 → 訪問施設数 → 使用したお金 → SNS利用回数
※ ラベルが上（text-maintext、ヘッダーと同じサイズ・色）、数値が下
※ flexWrap で2行配置
```

### 2. index.js に export 追加
- `export { StatsSummary } from "./StatsSummary";`

### 3. ResultPage.jsx に組み込み
- 追加 import: `currentTimeAtom`, `visitedFacilitiesAtom`, `eventHistoryAtom`
- 算出ロジック:
  - **経過時間**: `currentTime - 当日14:00`
  - **総移動距離**: 🟡 暫定 `null`（「— km」表示）
  - **使用したお金**: 🟡 暫定 `moneyAtom` の現在値をそのまま表示
  - **SNS利用回数**: `eventHistoryAtom.filter(e => e.id.startsWith("event_sns_")).length`
- ダミー画像の直下、想定地震セクションの直前に `<StatsSummary>` を配置

## レビューポイント

- 経過時間: `createStartTime()` と同じロジックを使っているか
- SNS利用回数: `event_sns_` プレフィックス一致でカウントしているか
- StatsSummary が Atom を直接参照していないか（props 経由のみ）
- UIパターン: `vh` 単位、CSS変数、既存カードと同じ borderRadius/padding
- ダミー項目（総移動距離・使用したお金）が「— km」「moneyゲージ値」で正しく表示されるか
- エッジケース: 訪問0施設、経過0分、SNS 0回

## 作業ログ

### StatsSummary.jsx
- 新規作成：5項目（総移動距離・訪問施設数・経過時間・使用したお金・SNS利用回数）をカード形式で表示
- props 駆動の純粋表示コンポーネント（Atom直接参照なし）
- 既存カードスタイル（expected-earthquake）に準拠：borderRadius `2vh`、padding `4%`、backgroundColor `var(--color-base10)`
- null フォールバック：totalDistance が null の場合は「— km」と表示
- flexWrap で5項目をレスポンシブ配置（2行：上3項目、下2項目）
- 項目順序：総移動距離 → 経過時間 → 訪問施設数 → 使用したお金 → SNS利用回数
- レイアウト：ラベル（text-maintext）が上、数値（text-sectiontitle、赤、太字）が下

### index.js
- `export { StatsSummary } from "./StatsSummary";` を追加

### ResultPage.jsx
- import 追加：`currentTimeAtom`, `visitedFacilitiesAtom`, `eventHistoryAtom`, `StatsSummary`
- 算出ロジック：
  - 経過時間：`currentTime - createStartTime()` で時分を計算
  - 訪問施設数：`visitedFacilities.length`
  - SNS利用回数：`eventHistory.filter(e => e.id?.startsWith("event_sns_")).length`（安全な参照）
  - 総移動距離：暫定 `null`（「— km」表示）
  - 使用したお金：暫定 `money` ゲージ値をそのまま表示
- 配置：ダミー画像の直下、想定地震セクションの直前に `<StatsSummary>` を挿入
- ダミー画像は保持（削除せず）
