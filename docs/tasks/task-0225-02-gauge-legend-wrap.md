# タスク: GaugeChart 凡例のスマホ幅オーバーフロー修正

## ステータス: ✅ 完了

## 概要

`GaugeChart` の凡例が `flexWrap="nowrap"` のため、320px 幅の端末（iPhone SE 等）で
4項目が横に収まらずオーバーフローする問題を修正する。

## 背景

### 問題

```jsx
// GaugeChart.jsx:230（現状）
<Flex gap="1vh" flexWrap="nowrap" justifyContent="center">
  {/* 体力 (%) / 精神力 (%) / 充電 (%) / お金 (百円) */}
```

4 項目の合計幅が 320px を超えるため、最後の「お金 (百円)」が切れる。

### 仕様根拠

仕様書 §4.5.2:
> 凡例ラベルは `体力 (%)` / `精神力 (%)` / `充電 (%)` / `お金 (百円)`

全凡例ラベルが表示されることが要件。320px 幅スマホで全件表示するには折り返しが必要。

## 実装手順

### Step 1: GaugeChart.jsx の凡例 Flex を修正

```jsx
// 変更前（:230）
<Flex gap="1vh" flexWrap="nowrap" justifyContent="center">

// 変更後
<Flex gap="1vh" flexWrap="wrap" justifyContent="center">
```

空データ時（フォールバック表示）も同様に修正（:49）。

## 変更ファイル

| ファイル | 変更内容 |
|----------|---------|
| `client/src/components/game-page/GaugeChart.jsx` | 凡例 Flex の `flexWrap="nowrap"` → `flexWrap="wrap"` （2箇所） |

## 実装チェックリスト

- [ ] 通常表示の凡例（:230）を `flexWrap="wrap"` に変更
- [ ] 空データ時の凡例（:49）を `flexWrap="wrap"` に変更
- [ ] 動作確認: 320px 幅で全4凡例が表示される
- [ ] 動作確認: 広い画面では1行に収まる（wrap しない）

## 関連

- 仕様書 §4.5.2 ゲージ推移 表示要件
- task-0222-03: GaugeChart 初期実装
