# タスク: イベント内段階的ゲージ変動の実装（gaugeSteps）

## ステータス: ✅ 完了（2026-02-23 全実装・テスト完了）

## 概要

1つのイベント内で複数のゲージ変動が発生する場合（例: event_walk_003 で「5000円受け取り → 1000円消費」）、
それぞれのステップを個別に `gaugeHistory` に記録し、GaugeChart で正確な推移を可視化する。

## 背景

task-0223-05 で money ゲージを百円単位に正規化したが、event_walk_003 のストーリーとデータに不整合が残っている：

| 要素 | 内容 |
|------|------|
| **テキスト** | 「ATM で5000円引き出した」→「現金が5000円増加した」→「水とパンを購入」→「現金を1000円消費した」|
| **gaugeChange** | `money: +40`（net の結果のみ） |
| **期待される推移** | 0 → 50（+5000円）→ 40（-1000円） |
| **実際の推移** | 0 → 40（一気にジャンプ） |

ユーザーの指摘：「5000円受け取って1000円使って、残り4000円みたいなのが反映できていない」

## 解決方針: gaugeSteps の導入

### 新データ構造

イベントに `gaugeSteps` 配列を追加し、段階的変動を定義する：

```js
{
  id: "event_walk_003",
  gaugeSteps: [
    { life: -5, mental: 0, battery: 0, money: 0 },     // Step 1: 移動で体力消費
    { life: 0, mental: +15, battery: 0, money: +50 },  // Step 2: ATM (5000円) + 精神回復
    { life: +10, mental: 0, battery: 0, money: -10 },  // Step 3: 食事 (1000円消費) + 体力回復
  ],
}
```

### GaugeChart での表示

**従来:**
```
time: 14:00, money: 0
time: 14:30, money: 40  ← 一気に 40
```

**修正後:**
```
time: 14:00, money: 0
time: 14:30, money: 0   ← Step 1
time: 14:30, money: 50  ← Step 2 (+5000円)
time: 14:30, money: 40  ← Step 3 (-1000円)
```

同一時刻に複数データポイントがプロットされ、「0 → 50 → 40」の推移が可視化される。

---

## 実装手順

### Step 1: eventList.js の修正

**ファイル:** `client/src/temporary-database/eventList.js`

`event_walk_003` に `gaugeSteps` を追加：

```js
{
  id: "event_walk_003",
  type: "walk",
  requiredDuration: 30,
  timeSlot: null,
  locationId: "fac_003",
  
  // gaugeChange は削除または後方互換用に残す
  gaugeChange: { life: +5, mental: +15, battery: 0, money: +40 },
  
  // 新: 段階的ゲージ変動
  gaugeSteps: [
    { life: -5, mental: 0, battery: 0, money: 0 },     // 移動で体力消費
    { life: 0, mental: +15, battery: 0, money: +50 },  // ATM + 精神回復
    { life: +10, mental: 0, battery: 0, money: -10 },  // 食事 + 1000円消費
  ],
  
  texts: [ /* 既存のまま */ ]
}
```

### Step 2: useMonologueLogic.js の修正

**ファイル:** `client/src/hooks/useMonologueLogic.js`

`handleButtonClick` 内でループ処理を追加：

```js
const handleButtonClick = async () => {
  // gaugeSteps がある場合はそれを使用、なければ gaugeChange を1ステップとして扱う
  const steps = effectiveEvent.gaugeSteps || [combinedGaugeChange];
  
  let currentLife = life;
  let currentMental = mental;
  let currentCharge = charge;
  let currentMoney = money;
  
  // プロローグの初期データポイント記録は従来通り
  if (effectiveEvent.type === "prologue") {
    setGaugeHistory([{
      time: currentTime,
      life, mental, charge, money,
    }]);
  } else {
    // 各ステップを順次処理して gaugeHistory に記録
    for (const step of steps) {
      currentLife = clampGauge(currentLife + (step.life || 0));
      currentMental = clampGauge(currentMental + (step.mental || 0));
      currentCharge = clampGauge(currentCharge + (step.battery || 0));
      currentMoney = clampGauge(currentMoney + (step.money || 0));
      
      // 各ステップ後の状態を記録
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
  }
  
  // 最終的なゲージ値を Atom に反映
  setLife(currentLife);
  setMental(currentMental);
  setCharge(currentCharge);
  setMoney(currentMoney);
  
  // イベント履歴追加（従来通り）
  // ...
};
```

### Step 3: テスト追加

**ファイル:** `client/src/__tests__/resultPageLogic.test.js`

```js
describe("gaugeSteps - イベント内段階的ゲージ変動", () => {
  test("event_walk_003 に gaugeSteps が定義されている", () => {
    const event = eventList.find(e => e.id === "event_walk_003");
    expect(event.gaugeSteps).toBeDefined();
    expect(event.gaugeSteps).toHaveLength(3);
  });
  
  test("gaugeSteps の合計が正しい net 値になる", () => {
    const event = eventList.find(e => e.id === "event_walk_003");
    const totalLife = event.gaugeSteps.reduce((sum, step) => sum + (step.life || 0), 0);
    const totalMental = event.gaugeSteps.reduce((sum, step) => sum + (step.mental || 0), 0);
    const totalMoney = event.gaugeSteps.reduce((sum, step) => sum + (step.money || 0), 0);
    
    expect(totalLife).toBe(5);    // -5 + 0 + 10 = +5
    expect(totalMental).toBe(15);  // 0 + 15 + 0 = +15
    expect(totalMoney).toBe(40);   // 0 + 50 - 10 = +40
  });
  
  test("gaugeSteps がない他のイベントは従来通り動作する", () => {
    const event = eventList.find(e => e.id === "event_walk_001");
    expect(event.gaugeSteps).toBeUndefined();
    expect(event.gaugeChange).toBeDefined();
  });
});
```

---

## 後方互換性

- `gaugeSteps` が未定義のイベント → 従来通り `gaugeChange` を1ステップとして処理
- 既存のイベント（prologue, walk_001, walk_002 など）はそのまま動作
- event_walk_003 のみ新構造に変更

---

## 変更ファイル一覧

| ファイル | 変更内容 |
|----------|---------|
| `client/src/temporary-database/eventList.js` | event_walk_003 に gaugeSteps 追加 |
| `client/src/hooks/useMonologueLogic.js` | gaugeSteps 処理ループ / normalizeApiEvent でローカル gaugeSteps をマージ |
| `client/src/pages/game-pages/ActionPage.jsx` | normalizeApiEvent でローカル gaugeSteps をマージ |
| `client/src/__tests__/resultPageLogic.test.js` | gaugeSteps のテスト追加 |
| `docs/result-page-spec-gauge-steps.md` | 仕様書（新規作成済み） |

### 設計方針: DB に gaugeSteps を持たせない

```
DB (events.mjs)        クライアント (eventList.js)
money: +4000 (円)      gaugeSteps: [ ... ]  ← ここだけで管理
     ↓                       ↓
     API          normalizeApiEvent()
      └──────────────────────┘
              マージ
       { money: 40 (百円), gaugeSteps: [...] }
```

- **DB**: `money` は円単位のまま保持。`gaugeSteps` は持たない
- **クライアント**: API レスポンス取得後に `normalizeApiEvent` で  
  ① `money` を ÷100 して百円単位に変換  
  ② ローカル `eventList.js` の `gaugeSteps` を ID でルックアップしてマージ

---

## 期待される結果

### GaugeChart
- money の折れ線が「0 → 50 → 40」と2段階で変化する（同一時刻に3点プロット）
- life も「70 → 65 → 65 → 75」と段階的に変化

### 検証方法
1. event_walk_003 までプレイ
2. リザルトページの GaugeChart を確認
3. money の折れ線が14:30で「上昇→下降」のパターンを描く

---

## 実装チェックリスト

- [x] eventList.js: event_walk_003 に gaugeSteps 追加
- [x] useMonologueLogic.js: gaugeSteps 処理ロジック実装
- [x] resultPageLogic.test.js: gaugeSteps テスト追加（43/43 PASS）
- [x] 全テスト PASS 確認
- [x] 仕様書: result-page-spec-gauge-steps.md に残存問題セクション追記
- [x] **Issue A 修正**: 死亡判定を gaugeSteps.life 合計に対応（useMonologueLogic.js）
- [x] **Issue B 修正**: timeEvent + gaugeSteps 同時発火時に timeEvent を先頭ステップとして追加（useMonologueLogic.js）
- [x] **Issue C 修正**: event_walk_003 テキスト「精神が10%回復した」→「精神が15%回復した」（eventList.js）
- [x] **Issue D 追加**: gaugeSteps ループ処理ロジックのテスト 6件追加（49/49 PASS）
- [x] 手動確認: GaugeChart で money が 0→50→40 と推移する  
  → 自動テスト `applyGaugeSteps` で代替検証済み（history[0]=0, history[1]=50, history[2]=40 を assert）

---

## レビューで発見された残存問題

| ID | 重大度 | 内容 | 対象ファイル | 対応状況 |
|----|--------|------|--------------|----------|
| Issue A | 🔴 バグ | 死亡判定が `gaugeSteps` を無視し `gaugeChange` を参照していた | `useMonologueLogic.js` | ✅ 修正済み |
| Issue B | 🔴 バグ | `gaugeSteps` + `isTimeEventActive` 同時発火で `timeEvent` の効果が `gaugeHistory` に未記録 | `useMonologueLogic.js` | ✅ 修正済み |
| Issue C | 🟡 不整合 | `event_walk_003` のテキスト「精神が10%回復した」と `gaugeSteps[1].mental = +15` が矛盾 | `eventList.js` | ✅ 修正済み（テキストを15%に変更） |
| Issue D | 🟡 テスト不足 | `handleButtonClick` の gaugeSteps ループ処理自体のユニットテストが未存在 | テスト追加必要 | ✅ 修正済み（6件追加、49/49 PASS） |

---

## 関連タスク

- task-0223-05: money ゲージの百円単位正規化（完了）
- task-0223-04: gaugeHistory 初期データポイント（完了）
- Issue D/E: visitedCount, 施設タイプ名（未着手）
