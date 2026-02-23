# タスク: gaugeHistory に初期データポイント（t=0）を記録する

## ステータス: ✅ 完了

## 概要

GaugeChart（セクション4）のグラフ描画において、ゲーム開始時点（14:00）の初期ゲージ状態が
`gaugeHistoryAtom` に記録されないため、グラフの開始点が欠落している問題を修正する。

## 背景

`useMonologueLogic.js` の `handleButtonClick` 内で、プロローグイベント処理時に
`gaugeHistory` への記録がスキップされている:

```js
// 現状コード
if (effectiveEvent.type !== "prologue") {
  setGaugeHistory((prev) => [...prev, { time, life, mental, charge, money }]);
}
```

プロローグの `gaugeChange` は全て 0 のためゲージ値自体は変わらないが、
`gaugeHistory` に初期データポイントが入らないことで以下の問題が発生する:

- GaugeChart の折れ線が「最初の非プロローグイベント後」から始まる
- ゲーム開始時のゲージ状態（life=70, mental=70, charge=60, money=0）が可視化されない
- 開始時刻（14:00）が横軸に表示されない

## 仕様（result-page-spec.md に追記済み）

> プロローグイベント完了時に、**ゲージ変動前**の初期値を `gaugeHistory` の先頭データポイントとして記録する。
> 記録データ: `{ time: currentTime, life, mental, charge, money }`（変動前の Atom 値）

## 変更内容

### `client/src/hooks/useMonologueLogic.js`

**修正前:**
```js
if (effectiveEvent.type !== "prologue") {
  setGaugeHistory((prev) => [
    ...prev,
    { time: currentTime, life: newLife, mental: newMental, charge: newCharge, money: newMoney },
  ]);
}
```

**修正後:**
```js
if (effectiveEvent.type === "prologue") {
  // 初期データポイント: ゲーム開始時のゲージ状態を記録（変動前の値）
  setGaugeHistory([
    { time: currentTime, life, mental, charge, money },
  ]);
} else {
  setGaugeHistory((prev) => [
    ...prev,
    { time: currentTime, life: newLife, mental: newMental, charge: newCharge, money: newMoney },
  ]);
}
```

**ポイント:**
- プロローグ時は `prev` を使わず新規配列で初期化（リプレイ対応）
- 変動前の値（`life`, `mental`, `charge`, `money`）を記録
- 非プロローグ時は従来通り変動後の値（`newLife` 等）を追記

## 変更ファイル

| ファイル | 変更内容 |
|---|---|
| `client/src/hooks/useMonologueLogic.js` | prologue 時に初期ゲージを gaugeHistory に記録 |
| `docs/result-page-spec.md` | セクション4 に初期データポイント仕様を追記、⚠注記を削除 |
| `client/src/__tests__/resultPageLogic.test.js` | Issue A のテストを修正（不整合→仕様通りを検証） |

## チェックリスト

- [x] 仕様書に正式な仕様として追記
- [x] `useMonologueLogic.js` を修正
- [x] テストを更新・実行して通過確認（39/39 passed）
- [x] コンパイル確認
