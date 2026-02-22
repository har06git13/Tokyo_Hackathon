# Task 3: ゲージ推移チャートコンポーネント作成

> 仕様: [../result-page-spec.md](../result-page-spec.md) セクション 3

## ステータス: ✅ 完了

## 対象ファイル

- `client/src/components/game-page/GaugeChart.jsx`（新規作成）
- `client/src/components/game-page/GaugeChangeSummary.jsx`（削除）
- `client/src/components/game-page/index.js`（export変更）
- `client/src/pages/ResultPage.jsx`（組み込み変更）

## 内容

### 1. GaugeChart.jsx 新規作成
- `gaugeHistoryAtom` の時系列データを**折れ線グラフ**で可視化
- **カード形式のUI**（プレイ統計と同じスタイル）
- **縦軸**: ゲージ値 0〜100%（目盛り: 0, 25, 50, 75, 100）
- **横軸**: ゲーム内時刻（14:00〜ゲーム終了時刻、開始と終了のみ表示）
- 4ゲージ（life・mental・charge・money）を異なる色で1グラフに重ねて表示
- SVG `<polyline>` で描画（外部ライブラリ不使用）
- 0 になった点は赤い丸マーカーでハイライト
- 凡例（legend）を表示
- Atom を直接読まず props で値を受け取る
- 🔴 **フォールバック**: `gaugeHistory` が空配列の場合、「ゲージ推移データがありません」＋凡例のみ表示（パーセント値は含めない）

**レイアウトイメージ:**
```
┌───────────────────────────────────────┐
│  ゲージ推移                            │
├───────────────────────────────────────┤
│ 100│                                  │
│  75│──╮                               │
│  50│  ╰──╮   life                     │
│  25│     ╰──╮                         │
│   0│────────●                         │
│    └──────────────────                │
│     14:00  16:00  18:00  20:00        │
│                                       │
│  ■ 体力  ■ 精神力  ■ 充電  ■ お金     │
└───────────────────────────────────────┘
```

**UIスタイル:**
- 幅 `90%`、背景 `var(--color-base10)`、角丸 `2vh`
- ヘッダー: `text-maintext`
- グラフ領域: 高さ `30vh`、背景 `var(--color-base12)`
- 凡例: グラフ下部に配置

### 2. GaugeChangeSummary.jsx の削除
- 変動量の数値表示は不要になったため削除

### 3. index.js の export 変更
- `export { default as GaugeChangeSummary } from "./GaugeChangeSummary";` を削除
- `export { default as GaugeChart } from "./GaugeChart";` を追加

### 4. ResultPage.jsx の組み込み変更
- `GaugeChangeSummary` import を `GaugeChart` に変更
- `gaugeHistoryAtom` を import
- StatsSummary の直下に配置

```jsx
<GaugeChart
  gaugeHistory={gaugeHistory}  // gaugeHistoryAtom の値
/>
```

## 色定義

| ゲージ | 色変数                    |
| ------ | ------------------------- |
| life   | `var(--color-life10)`     |
| mental | `var(--color-mental10)`   |
| charge | `var(--color-charge10)`   |
| money  | `var(--color-money10)`    |

## レビューポイント

- プレイ統計と同じカードUIになっているか
- 外部ライブラリを使わず SVG で実装できているか
- 横軸が時刻、縦軸が % の折れ線グラフになっているか
- 4ゲージが色分けされて重ねて表示されるか
- 0 になった点に赤マーカーが表示されるか
- 凡例が表示されているか
- `gaugeHistory` が空配列のときにフォールバックUIが表示されるか
- スマホ画面幅でのレスポンシブ対応

## 作業ログ

### 2026-02-22

**初回実装（折れ線グラフ形式）**

1. GaugeChart.jsx 新規作成（SVG折れ線グラフ）
2. index.js に export 追加
3. ResultPage.jsx に組み込み
4. フォールバック表示の修正（パーセント削除）
5. コミット: 9df79e0

**仕様変更（カード形式・内容大幅変更）**

1. セクション3を「ゲージの変動（カード形式）」→「ゲージ推移（折れ線グラフ内蔵カード）」に変更
2. GaugeChangeSummary は不要（削除済み）
3. GaugeChart を「カード形式の折れ線グラフ」として新規作成
4. 以前のGaugeChart.jsxは削除済み

**SVGグラフの文字サイズ修正**

- 問題: viewBox `0 0 100 100`（正方形）に対しコンテナが横長（100% × 30vh ≈ 1.4:1）でアスペクト比不一致。テキストが歪んで大きく表示されていた
- 修正: viewBox を `0 0 140 100` に変更（コンテナのアスペクト比に合わせ）
- `preserveAspectRatio="xMidYMid meet"` を明示指定
- padding を `{top:5, right:5, bottom:8, left:12}` に調整（左側は縦軸ラベル分を確保）
- fontSize を `3` に設定（viewBox 140×100 に対して適切なサイズ）
- 横グリッド線（点線）を追加
- 折れ線ストローク幅を 0.6 → 0.8 に変更
- 0値マーカー半径を 1 → 1.2 に変更
- ResultPage にUI確認用ダミーデータを追加（本番前に削除予定）
