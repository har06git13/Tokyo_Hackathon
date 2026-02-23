# result-page-spec.md への追加仕様: イベント内段階的ゲージ変動

## 概要

1つのイベント内で複数のゲージ変動が発生する場合（例: 5000円受け取り → 1000円消費）、
それぞれのステップを `gaugeHistory` に記録し、GaugeChart で推移を可視化できるようにする。

## 現状の問題

`event_walk_003` のストーリー：
```
1. ATM で 5000円引き出した → "現金が5000円増加した"
2. 水とパンを購入した → "現金を1000円消費した"
```

しかし現在の実装：
```js
gaugeChange: { life: +5, mental: +15, battery: 0, money: +40 }
```

- `gaugeChange` は net の結果（+50 - 10 = +40）のみ
- GaugeChart では「0 → 40」の1ステップしか見えない
- 「0 → 50 → 40」という実際の推移が失われている

## 新仕様: gaugeSteps

### データ構造

イベントに `gaugeSteps` 配列を追加し、段階的な変動を定義する：

```js
{
  id: "event_walk_003",
  type: "walk",
  requiredDuration: 30,
  locationId: "fac_003",
  
  // 従来の gaugeChange は後方互換のため残す（または削除して gaugeSteps のみ）
  gaugeChange: { life: +5, mental: +15, battery: 0, money: +40 },
  
  // 新: 段階的ゲージ変動（複数ステップ）
  gaugeSteps: [
    { life: -5, mental: 0, battery: 0, money: 0 },     // Step 1: 移動で体力消費
    { life: 0, mental: +15, battery: 0, money: +50 },  // Step 2: ATM で 5000円入手、精神回復
    { life: +10, mental: 0, battery: 0, money: -10 },  // Step 3: 食事で体力回復、1000円消費
  ],
  
  texts: [ /* ... */ ]
}
```

### gaugeSteps の仕様

1. **配列の各要素**: 1つのゲージ変動ステップ
2. **時刻**: 全ステップは同一時刻（`currentTime`）で記録される
3. **gaugeHistory への記録**: 各ステップ後のゲージ状態を記録
4. **texts との対応**: 
   - `isCritical: true` のテキストがゲージ変動に対応
   - ステップ数とクリティカルテキスト数は一致すべき（推奨）
5. **後方互換性**: 
   - `gaugeSteps` が未定義の場合、従来通り `gaugeChange` を使用
   - `gaugeSteps` が定義されている場合、`gaugeChange` は無視

### event_walk_003 の修正例

```js
{
  id: "event_walk_003",
  type: "walk",
  requiredDuration: 30,
  locationId: "fac_003",
  
  gaugeSteps: [
    { life: -5, mental: 0, battery: 0, money: 0 },     // "移動で体力を5%消費した"
    { life: 0, mental: +15, battery: 0, money: +50 },  // "現金が5000円増加した"
    { life: +10, mental: 0, battery: 0, money: -10 },  // "現金を1000円消費した" + 食事で体力回復
  ],
  
  texts: [
    { type: "system", text: "ファミリーマート 渋谷公園通り店に到着した。\n 施設タイプ：飲食店・小売店" },
    { type: "system", isDecrease: true, text: "移動で体力を5%消費した。" },  // Step 1
    { type: "talk", text: "(コンビニがこんなに混んでるなんて。\n 改めて、今って非常事態なんだな。)" },
    { type: "system", text: "ATMの長蛇の列に並び、現金5000円を引き出した。" },
    { type: "system", isCritical: true, text: "現金が5000円増加した。" },  // Step 2 (money)
    { type: "talk", text: "(災害時って、現金を手に入れるだけでもこんなに大変なんだな。)" },
    { type: "system", text: "手に入れた現金で、品切れスレスレの水とパンを購入した。" },
    { type: "system", isDecrease: true, text: "現金を1000円消費した。" },  // Step 3 (money)
    { type: "talk", text: "(水と食料が手に入って一安心だ。食べよう！！)" },
    { type: "system", text: "食べ慣れた、安心できる味が口いっぱいに広がる。" },
    { type: "system", isCritical: true, text: "精神が15%回復した。" },  // Step 2 (mental)
    { type: "system", isCritical: true, text: "体力が10%回復した。" },  // Step 3 (life)
  ],
}
```

> **注意**: 上記の例では「精神15%回復」のテキストが Step 2 に対応していますが、
> texts 配列の順序では後方にあります。これはストーリーテリングの都合です。
> gaugeSteps の各ステップは texts の順序に厳密に対応する必要はありません。

### useMonologueLogic.js の実装

```js
const handleButtonClick = async () => {
  const steps = effectiveEvent.gaugeSteps || [effectiveEvent.gaugeChange || {}];
  
  let currentLife = life;
  let currentMental = mental;
  let currentCharge = charge;
  let currentMoney = money;
  
  // 各ステップを順次処理
  for (const step of steps) {
    currentLife = clampGauge(currentLife + (step.life || 0));
    currentMental = clampGauge(currentMental + (step.mental || 0));
    currentCharge = clampGauge(currentCharge + (step.battery || 0));
    currentMoney = clampGauge(currentMoney + (step.money || 0));
    
    // 各ステップ後の状態を gaugeHistory に記録
    setGaugeHistory((prev) => [
      ...prev,
      {
        time: currentTime,
        life: currentLife,
        mental: currentMental,
        charge: currentCharge,
        money: currentMoney,
      },
    ]);
  }
  
  // 最終的なゲージ値を Atom に反映
  setLife(currentLife);
  setMental(currentMental);
  setCharge(currentCharge);
  setMoney(currentMoney);
  
  // ... 残りの処理
};
```

### GaugeChart での表示

**従来（Issue B 修正前）:**
```
time: 14:00, money: 0
time: 14:30, money: 40  ← 一気に 40 に
```

**修正後:**
```
time: 14:00, money: 0
time: 14:30, money: 0   ← Step 1: 移動（money 変化なし）
time: 14:30, money: 50  ← Step 2: ATM で +50（5000円）
time: 14:30, money: 40  ← Step 3: 購入で -10（1000円）
```

グラフでは同一時刻に複数のデータポイントがプロットされるため、
「0 → 50 → 40」という縦方向の変化が見えるようになります。

### 後方互換性の考慮

- 既存の `gaugeChange` のみのイベントは従来通り動作
- `gaugeSteps` を持つイベントのみ新しい挙動
- 段階的に移行可能（全イベントを一度に変更する必要なし）

## 適用対象イベント

現時点で `gaugeSteps` が必要なのは `event_walk_003` のみ：
- **event_walk_003**: 5000円入手 → 1000円消費（残り4000円）

将来的に他のイベントでも複雑なゲージ変動が発生する場合に拡張可能。

---

## 残存問題（task-0223-06 レビュー）→ 全件修正済み

| ID | 重大度 | 内容 | 対象ファイル | 対応状況 |
|----|--------|------|--------------|----------|
| Issue A | 🔴 バグ | 死亡判定が `gaugeSteps` を無視し `gaugeChange` を参照 | `useMonologueLogic.js` | ✅ 修正済み |
| Issue B | 🔴 バグ | `gaugeSteps` + `isTimeEventActive` 同時発火で `timeEvent` 効果が `gaugeHistory` に未記録 | `useMonologueLogic.js` | ✅ 修正済み |
| Issue C | 🟡 不整合 | `event_walk_003` テキスト「10%回復」vs `gaugeSteps[1].mental=+15` | `eventList.js` | ✅ 修正済み（クライアント側テキストを15%に変更） |
| Issue D | 🟡 テスト不足 | `handleButtonClick` の gaugeSteps ループ処理のユニットテストが未存在 | テスト追加 | ✅ 修正済み（`applyGaugeSteps` 純粋関数テスト 6件追加、49/49 PASS） |

### Issue A 修正内容（`useMonologueLogic.js`）

```js
// 修正後: gaugeSteps がある場合は life の合計を使う
const eventLifeChange = effectiveEvent.gaugeSteps
  ? effectiveEvent.gaugeSteps.reduce((sum, s) => sum + (s.life || 0), 0)
  : getSafeValue(effectiveEvent.gaugeChange?.life);
```

### Issue B 修正内容（`useMonologueLogic.js`）

```js
// 修正後: timeEvent を gaugeSteps の先頭ステップとして挿入
let steps;
if (effectiveEvent.gaugeSteps) {
  steps = isTimeEventActive && timeEvent?.gaugeChange
    ? [timeEvent.gaugeChange, ...effectiveEvent.gaugeSteps]
    : [...effectiveEvent.gaugeSteps];
} else {
  steps = [combinedGaugeChange];
}
```

### DB 非保有ポリシー（task-0223-06 追加仕様）

**DB の `events` コレクションには `gaugeSteps` を持たせない。**
クライアント側の `normalizeApiEvent()` が以下を担当する：

1. `money` を ÷100 して百円単位に変換（DB は円単位で保持）
2. ローカル `eventList.js` の `gaugeSteps` を ID でルックアップしてマージ

```js
const normalizeApiEvent = (ev) => {
  if (!ev) return ev;
  const localEvent = eventList.find((e) => e.id === ev.id);
  return {
    ...ev,
    gaugeChange: ev.gaugeChange
      ? { ...ev.gaugeChange, money: Math.round((ev.gaugeChange.money || 0) / 100) }
      : ev.gaugeChange,
    // gaugeSteps はローカル定義を使用（DB には保持しない）
    ...(localEvent?.gaugeSteps ? { gaugeSteps: localEvent.gaugeSteps } : {}),
  };
};
```

適用ファイル: `useMonologueLogic.js`、`ActionPage.jsx`

## テスト（49/49 PASS）

```
gaugeSteps - イベント内段階的ゲージ変動
  ✓ event_walk_003 に gaugeSteps が定義されている
  ✓ gaugeSteps の合計が正しい net 値になる
  ✓ gaugeSteps がない他のイベントは従来通り動作する
  ✓ event_walk_003 の各ステップが期待通りの値を持つ

gaugeSteps ループ処理ロジック
  ✓ event_walk_003: money が 0 → 50 → 50 → 40 と3ステップで推移する
  ✓ event_walk_003: life が 70 → 65 → 65 → 75 と3ステップで推移する
  ✓ event_walk_003: 最終ゲージ値が gaugeChange の net 値と一致する
  ✓ 100 を超える値は 100 にクランプされる
  ✓ 0 を下回る値は 0 にクランプされる
  ✓ timeEvent ステップを先頭に加えた場合も正しく処理される（Issue B 対応確認）
```
