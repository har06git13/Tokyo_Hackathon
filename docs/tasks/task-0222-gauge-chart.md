# Task 4: ゲージ推移チャートコンポーネント作成

> 仕様: [../result-page-spec.md](../result-page-spec.md) セクション 3

## ステータス: ⬜ 未着手

## 対象ファイル

- `client/src/components/game-page/GaugeChart.jsx`（新規）
- `client/src/pages/ResultPage.jsx`

## 内容

- `gaugeHistoryAtom` の時系列データをステップバーで可視化
- 0 になったゲージのハイライト表示
- 🔴 **フォールバック対応**: `gaugeHistoryAtom` が空配列の場合、最終ゲージ値のみ1行表示 + 「ゲージ推移データがありません」注記

## レビューポイント

- 外部ライブラリを使わず実装できているか
- レスポンシブ対応（スマホ画面幅での見え方）
- `gaugeHistoryAtom` が空配列のときにフォールバックUIが表示されるか

## 作業ログ

> （着手時に記録）
