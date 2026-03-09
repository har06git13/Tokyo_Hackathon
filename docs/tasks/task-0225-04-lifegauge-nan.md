# タスク: LifeGaugeElement NaN children 警告の修正

## ステータス: ✅ 完了

## 概要

ブラウザコンソールに `Received NaN for the 'children' attribute` (LifeGaugeElement.jsx:55) が表示される問題を修正する。
リザルト画面の結果ヘッダー内 `<LifeGauge howto={false}>` に影響するため対処する。

## 根本原因

`LifeGauge.jsx` の `howto=false` 用 props に `life / mental / charge / money` のデフォルト値がない。
`amount={undefined}` が `LifeGaugeElement` に渡ると、`money` 型で `undefined * 100 = NaN` になる。

```js
// LifeGaugeElement.jsx:57（問題箇所）
{type === "howto" ? "説明" : type === "money" ? amount * 100 : amount}
//                                              ↑ amount が undefined だと NaN
```

呼び出し側の例（LogElement.jsx:158）:
```jsx
<LifeGauge howto={false} life={gauge?.life} ...>  // gauge が undefined の場合 life=undefined
```

## 修正方針

`LifeGauge.jsx` の `howto=false` 用 props にデフォルト値 `= 0` を追加する（最小変更）。
LifeGaugeElement 側でも防衛的に `?? 0` フォールバックを追加し、呼び出し元に依存しない堅牢な実装にする。

## 実装手順

### Step 1: LifeGauge.jsx — props デフォルト値追加

```jsx
// 変更前
export const LifeGauge = ({ howto = true, life, mental, charge, money }) => {

// 変更後
export const LifeGauge = ({ howto = true, life = 0, mental = 0, charge = 0, money = 0 }) => {
```

### Step 2: LifeGaugeElement.jsx — amount フォールバック追加

```jsx
// 変更前（:57）
{type === "howto" ? "説明" : type === "money" ? amount * 100 : amount}

// 変更後
{type === "howto" ? "説明" : type === "money" ? (amount ?? 0) * 100 : (amount ?? 0)}
```

## 変更ファイル

| ファイル | 変更内容 |
|----------|---------|
| `client/src/components/common/LifeGauge.jsx` | `life/mental/charge/money` props にデフォルト `= 0` |
| `client/src/components/common/LifeGaugeElement.jsx` | amount に `?? 0` フォールバック追加 |

## リザルト画面への影響

- ResultPage はアトムから確定値を渡すため実害なし
- 修正により undefined が渡るケース全体で NaN 警告が消える

## 実装チェックリスト

- [ ] LifeGauge.jsx: デフォルト値追加
- [ ] LifeGaugeElement.jsx: `?? 0` フォールバック追加
- [ ] ビルド確認: NaN 警告が消えること

## 関連

- 仕様書 §4.2 結果ヘッダー（LifeGauge 使用）
