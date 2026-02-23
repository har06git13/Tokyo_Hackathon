# タスク: money ゲージの単位系不整合とラベル修正（Issue B / C）

## ステータス: ✅ 完了

## 概要

money ゲージのデータフロー全体に単位系の不整合がある。
イベントデータは**円単位**で定義されているが、ゲージシステムは**0-100 スケール**を前提としており、
`clampGauge()` で金額情報が失われる。
併せて StatsSummary の「使用したお金」ラベルと表示値の不一致も修正する。

## 背景

TDD テスト（`src/__tests__/resultPageLogic.test.js`）で発見された Issue B / Issue C に対応する。
Issue A（gaugeHistory 初期データポイント）は task-0223-04 で解決済み。

---

## 調査結果

### データフローの現状

```
eventList.js                useMonologueLogic.js       playerAtoms.js         表示
─────────────────          ──────────────────────     ──────────────         ────
event_walk_003:            newMoney =                 moneyAtom              LifeGaugeElement:
  money: +4000 (円)   →     clampGauge(0 + 4000)  →    = 100             →   "100円"
                              = Math.min(100, 4000)                          GaugeChart:
                              = 100  ← 情報消失!                              100 (常に平坦)
                                                                            StatsSummary:
                                                                              "使用したお金: 100"
```

### 不整合の証拠

| コンポーネント | 発見事項 | 設計意図 |
|--------------|---------|---------|
| `LifeGaugeElement.jsx` | `{type === "money" ? "円" : "%"}` | money は**円単位** |
| `eventList.js` event_walk_003 | `money: +4000`、テキスト「現金5000円」「1000円消費」| ゲージ値は**円** |
| `clampGauge()` | `Math.max(0, Math.min(100, val))` — 全ゲージ一律適用 | 0-100 スケール前提 |
| `GaugeChart.jsx` 凡例 | `"お金 (百円)"` | 百円単位を想定（最近の変更） |

### 他ゲージとの比較

| ゲージ | 単位 | gaugeChange 範囲 | clampGauge 適合 |
|--------|------|-----------------|----------------|
| life   | %    | -70 〜 +5       | ✅ 適切 |
| mental | %    | -5 〜 +15       | ✅ 適切 |
| charge | %    | -5 〜 +50       | ✅ 適切 |
| money  | 円   | +4000           | ❌ 即座に100に飽和 |

### 影響を受けるイベント

`eventList.js` 全12件の money 値を調査:
- `money: 0` — 11件（影響なし）
- `money: +4000` — 1件（event_walk_003 のみ）

---

## 推奨修正方針: 百円単位への正規化

GaugeChart の凡例が既に「お金 (百円)」となっていることを踏まえ、
**money ゲージを百円単位（0-100 = 0-10,000円）に正規化**する。

### 理由

1. `clampGauge()` の 0-100 スケールとの整合が取れる
2. 他ゲージ（life/mental/charge）と同じスケール体系になる
3. GaugeChart 凡例「お金 (百円)」と完全に一致する
4. 変更箇所が最小限（eventList の 1 行 + LifeGaugeElement の表示補正）

### 変換表

| 現在の値 | 変換後 | 意味 |
|----------|--------|------|
| `+4000` (円) | `+40` (百円) | 4,000円 = 40百円 |

---

## 修正手順

### Step 1: eventList.js — money 値を百円単位に変更

**ファイル:** `client/src/temporary-database/eventList.js`

```diff
- gaugeChange: { life: +5, mental: +15, battery: 0, money: +4000 },
+ gaugeChange: { life: +5, mental: +15, battery: 0, money: +40 },
```

> 他の11件は `money: 0` のため変更不要。

### Step 2: LifeGaugeElement.jsx — 表示を百円 → 円に変換

**ファイル:** `client/src/components/common/LifeGaugeElement.jsx`

money の表示値を `value * 100` して「円」接尾辞を維持する。
これにより money=40 → 「4,000円」と自然な日本語表示になる。

```jsx
// 現在
{type === "money" ? "円" : type === "howto" ? "" : "%"}

// 修正案（表示値の変換も必要）
// money 型の場合: value を百円→円に変換して表示
```

> ※ value の変換方法は LifeGaugeElement の実装に依存。
> ゲージバーの幅（%表示）は 0-100 のままで良い。
> 数値テキストのみ `value * 100` + "円" にする。

### Step 3: StatsSummary.jsx — ラベルと値の修正

**ファイル:** `client/src/components/game-page/StatsSummary.jsx`

**案A（最小変更・推奨）:**
- ラベル: 「使用したお金」→「所持金」に変更
- 値: `moneyValue * 100` + "円" で表示（百円→円変換）

**案B（理想的）:**
- ラベル: 「使用したお金」のまま
- 値: `gaugeHistoryAtom` の money 差分（減少分の合計）を算出
  - ※ 現在のイベントデータでは消費イベントが無いため、将来課題

### Step 4: テスト更新

**ファイル:** `client/src/__tests__/resultPageLogic.test.js`

- Issue B / Issue C の ⚠ マーク付きテストを正規仕様に更新
- money 値が 0-100（百円単位）になることを検証

---

## 変更ファイル一覧

| ファイル | 変更内容 |
|----------|---------|
| `client/src/temporary-database/eventList.js` | `money: +4000` → `money: +40` |
| `client/src/components/common/LifeGaugeElement.jsx` | money 表示値を百円→円変換 |
| `client/src/components/game-page/StatsSummary.jsx` | ラベル/値の修正 |
| `client/src/pages/ResultPage.jsx` | 必要に応じて money 値の変換処理追加 |
| `client/src/__tests__/resultPageLogic.test.js` | ⚠テストを正規仕様に更新 |
| `docs/result-page-spec.md` | ⚠注釈を解消、正式仕様に更新 |

## テスト確認

- [ ] 全 39 テスト PASS
- [ ] GaugeChart で money 折れ線が 0→40 に変化することを確認
- [ ] LifeGaugeElement で money が「4,000円」と表示されることを確認
- [ ] StatsSummary で money が正しいラベル・値で表示されることを確認

## 仕様書参照

- `docs/result-page-spec.md` — セクション3（プレイ統計）、セクション4（ゲージ推移）
- `docs/tasks/task-0223-03-result-data-fixes.md` — Issue B/C の概要
