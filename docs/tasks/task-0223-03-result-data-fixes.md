# タスク: リザルトページ データ不整合の修正（総合管理）

## ステータス: 🔧 一部完了・分割対応中

## 概要

TDD テスト（`src/__tests__/resultPageLogic.test.js`）による検証で発見された
リザルトページのデータ表示に関する不整合を修正する。

> **このファイルは総合管理用**。個別の Issue は専用タスクファイルに分割して対応する。

## 背景

task-0223-02（ダミーデータ削除・実データ切替）完了後、
実際のゲームプレイデータが結果ページに正しく反映されるかを TDD で検証した結果、
以下の5つの不整合が確認された。

---

## 発見された不整合

### 🔴 Issue A: gaugeHistory に初期データポイント（t=0）が欠落

**現象:**
`useMonologueLogic.js` の `handleButtonClick` 内で
`if (effectiveEvent.type !== "prologue")` の条件があり、
プロローグイベント処理時に `gaugeHistory` への記録がスキップされる。

**影響:**
- 初期ゲージ状態（life=70, mental=70, charge=60, money=0 @ 14:00）が `gaugeHistory` に含まれない
- GaugeChart の開始点がゲーム開始時の値ではなく、最初の非プロローグイベント後の値から始まる
- チャートのグラフが1データポイント分短くなり、初期→最初のイベント間の変化が不可視

**修正方針:**
プロローグイベント完了時に初期ゲージ状態を `gaugeHistory` の先頭に記録する。

```js
// useMonologueLogic.js handleButtonClick 内
// ゲージ変動履歴に記録（プロローグ時は初期値を記録）
if (effectiveEvent.type === "prologue") {
  setGaugeHistory([{
    time: currentTime,
    life: life,       // 変動前の初期値
    mental: mental,
    charge: charge,
    money: money,
  }]);
} else {
  setGaugeHistory((prev) => [
    ...prev,
    { time: currentTime, life: newLife, mental: newMental, charge: newCharge, money: newMoney },
  ]);
}
```

**変更ファイル:** `client/src/hooks/useMonologueLogic.js`

---

### 🔴 Issue B: money ゲージの単位不整合

**現象:**
`eventList.js` の `event_walk_003` で `gaugeChange.money: +4000`（円ベース）が設定されているが、
ゲージシステムは 0-100 スケールを前提としている。

- `clampGauge(0 + 4000) = 100` → money ゲージが即座にMAXになる
- 他のゲージ値（life/mental/battery）は全て -5〜+50 の範囲で一貫
- money だけ桁が3桁以上大きい

**影響:**
- GaugeChart で money の折れ線が常に100で平坦に表示される
- ゲーム中の所持金変化が可視化できない

**修正方針（2案）:**
1. **案A（推奨）**: `gaugeChange.money` を 0-100 スケールに統一
   - 例: `+4000` → `+40`（概算: 5000円→40%, 1000円消費→ net +40）
2. **案B**: money のみゲージではなく実数値として扱い、表示時にスケーリング

**変更ファイル:** `client/src/temporary-database/eventList.js`

---

### 🟡 Issue C: StatsSummary「使用したお金」のラベルと値の不一致

**現象:**
- ラベル: 「使用したお金」
- 実際の値: `moneyAtom`（現在の所持金ゲージ値 0-100）
- 使用総額でも円表示でもなく、ユーザーに意味が伝わらない

**修正方針（2案）:**
1. **案A（最小変更）**: ラベルを「所持金」に変更
2. **案B（理想）**: `gaugeHistoryAtom` の差分から消費額を算出して表示

**変更ファイル:** `client/src/components/game-page/StatsSummary.jsx`, `client/src/pages/ResultPage.jsx`

---

### 🟡 Issue D: visitedCount に初期地点・ゴール地点が含まれる

**現象:**
- `visitedFacilitiesAtom` の初期値に `"fac_000"`（渋谷駅前＝ゲーム開始地点）が含まれる
- エピローグイベントの `locationId: "fac_005"` も `visitedFacilities` に追加される
- どちらもプレイヤーが意図的に選択した施設ではない

**影響:**
- 「訪問施設数」が実際のプレイヤー選択数より常に +1〜+2 多い
- 例: walk で3施設訪問 → 表示は「5 箇所」（fac_000 + 3 + fac_005）

**修正方針:**
ResultPage 側で除外フィルタを適用:
```js
const playerVisitedCount = visitedFacilities
  .filter(id => id !== "fac_000") // 開始地点を除外
  .length;
```
※ エピローグ地点の扱いは要検討（ゴール到達も成果として含めるべきか）

**変更ファイル:** `client/src/pages/ResultPage.jsx`

---

### 🟢 Issue E: fac_004 の施設タイプ名の不一致

**現象:**
- `facilityList` の `fac_004`（代々木公園）: `type: "evacuation"`
- `spotTypeList["evacuation"].name`: `"避難所"`
- `event_walk_004` のテキスト: `"施設タイプ：一時避難場所"`
- 結果ページのタイムラインでは「避難所」と表示されるが、イベントテキストでは「一時避難場所」

**背景:**
実際の東京都防災計画では、代々木公園は「一時避難場所」に分類される。
`spotTypeList` には `temporary: { name: "一時避難場所" }` が別途定義されている。

**修正方針:**
`facilityList` の `fac_004.type` を `"evacuation"` → `"temporary"` に修正。

**変更ファイル:** `client/src/temporary-database/facilityList.js`

---

## 優先度

| Issue | 重要度 | 状態 | タスクファイル |
|-------|--------|------|---------------|
| A     | 🔴 高  | ✅ 完了 | `task-0223-04-gauge-initial-point.md` |
| B     | 🔴 高  | ✅ 完了 | `task-0223-05-money-unit-fix.md` |
| C     | 🟡 中  | ✅ 完了 | `task-0223-05-money-unit-fix.md`（B と統合） |
| D     | 🟡 中  | 🔲 未着手 | （未分割） |
| E     | 🟢 低  | 🔲 未着手 | （未分割） |

## 変更ファイル一覧

| ファイル | 対応 Issue |
|----------|------------|
| `client/src/hooks/useMonologueLogic.js` | A |
| `client/src/temporary-database/eventList.js` | B |
| `client/src/components/game-page/StatsSummary.jsx` | C |
| `client/src/pages/ResultPage.jsx` | C, D |
| `client/src/temporary-database/facilityList.js` | E |

## テストファイル

- `client/src/__tests__/resultPageLogic.test.js` — ⚠ マーク付きテストが各 Issue に対応
- `client/src/utils/resultPageLogic.js` — テスト用に抽出した純粋ロジック関数

## 実装チェックリスト

- [x] Issue A: `useMonologueLogic.js` でプロローグ時に初期ゲージ状態を記録 → **task-0223-04 で完了**
- [x] Issue B: money ゲージを百円単位に正規化 → **task-0223-05 で完了**
- [x] Issue C: StatsSummary のラベル/値を修正 → **task-0223-05 で完了**
- [ ] Issue D: ResultPage で visitedCount の除外フィルタ適用
- [ ] Issue E: `facilityList.js` の fac_004.type を "temporary" に修正
- [x] 全テスト通過を確認（39/39 tests PASS）
- [x] 仕様書 (`docs/result-page-spec.md`) の該当箇所を更新
