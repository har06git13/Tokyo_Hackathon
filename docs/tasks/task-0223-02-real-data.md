# タスク: プレイ統計・ゲージ推移・タイムライン・ヒントを実データに切り替え

## ステータス: ✅ 完了

## 概要

セクション3（プレイ統計）、セクション4（ゲージ推移）、セクション5（生死を分けた選択）、
セクション6（防災ヒント）で使用しているダミーデータ・暫定値を削除し、
実際のゲームプレイデータ（Atom）のみを使用するように切り替える。

## 背景

現在、複数セクションで「実データが空の場合にダミーデータで表示」するフォールバック構造を持つ。
ゲームプレイ後は必ず実データが存在するため、ダミーデータは不要。

## 問題点

### セクション5（タイムライン）の buildTimelineData() にバグあり

**現在のコード:**
```js
const walkEvents = eventHistory.filter(e => e.type === "walk");
```

**問題:** `eventHistoryAtom` のデータ構造は `{ id, time }` のみ。
`type` フィールドは存在しないため、`e.type === "walk"` は常に `false` となり空配列が返る。

**修正方針（暫定）:** `eventList`（ローカルデータ）と突合して walk イベントを判別する。

```js
// 修正後のロジック
const walkEvents = eventHistory.filter(e => {
  const eventDef = eventList.find(ev => ev.id === e.id);
  return eventDef && eventDef.type === "walk";
});
```

さらに `locationId` も `eventList` から取得する必要がある:

```js
return walkEvents.map(event => {
  const eventDef = eventList.find(ev => ev.id === event.id);
  if (!eventDef) return null;
  const facility = facilityList.find(f => f.id === eventDef.locationId);
  if (!facility) return null;
  // ...以降は同じ
});
```

### 📘 将来の改善方針

> MongoDB の `events` コレクションには `type` フィールドが含まれているため、
> 将来的にバックエンド連携を行う際は以下の設計変更を推奨：
>
> 1. **`eventHistoryAtom` の構造を拡張**: `{ id, time }` → `{ id, time, type, locationId }`
> 2. **`useMonologueLogic.js` の修正**: イベント追加時に `type` と `locationId` も保存
> 3. **`buildTimelineData()` の簡素化**: `eventList` 突合が不要になり、`e.type === "walk"` で直接フィルタ可能
>
> この変更により：
> - MongoDB から取得したデータを Atom にそのまま格納できる
> - ローカルデータとの突合処理が不要になり、コードがシンプルに
> - フィルタ処理のパフォーマンスが向上
>
> **現在の実装は暫定的な回避策であり、将来のリファクタリングを前提としている。**

## 変更内容

### 1. プレイ統計（セクション3）

現在のダミー・暫定値:
- `totalDistance={null}` → `"— km"` と表示（暫定）
- `moneyValue={money}` → 現在の所持金をそのまま表示（暫定、本来は使用総額）

修正内容:
- `totalDistance`: 暫定のまま維持（座標データ/Haversine計算が将来タスクのため）
- `moneyValue`: 暫定のまま維持（gaugeHistory 差分計算が将来タスクのため）
- → **今回は変更なし**（ダミーフォールバックではなく仕様上の暫定値のため）

### 2. ゲージ推移（セクション4）

- `dummyGaugeHistory` 定数を削除
- `displayGaugeHistory` の三項演算子を削除
- `gaugeHistory` を直接 `GaugeChart` に渡す
- GaugeChart コンポーネント内のフォールバック表示（空配列時メッセージ）はそのまま維持

### 3. タイムライン（セクション5）

- `dummyTimelineData` 定数を削除
- `displayTimelineData` の三項演算子を削除
- `buildTimelineData()` のフィルタロジックを修正:
  - `e.type === "walk"` → `eventList` と突合して `type === "walk"` を判定
  - `event.locationId` → `eventDef.locationId` から取得
- `eventList` を import に追加
- `timelineData` を直接 JSX に使用

### 4. ヒント（セクション6）

- `dummyHints` 定数を削除
- `displayHints` の三項演算子を削除
- `hintsData` を直接 JSX に使用
- ヒント生成ロジック（`buildHints()`）は Atom の値を直接参照しており変更不要
- ヒントが0件の場合のフォールバックメッセージ（「防災へのヒントがこのプレイには含まれていません」）はそのまま維持

## 変更ファイル

| ファイル                          | 変更内容                                    |
| --------------------------------- | ------------------------------------------- |
| `client/src/pages/ResultPage.jsx` | ダミーデータ全削除、buildTimelineData() 修正、eventList import 追加 |
| `docs/result-page-spec.md`        | セクション4・5のデータソース記述を更新（済） |

## 実装チェックリスト

### タイムライン修正
- [x] `eventList` を import に追加
- [x] `buildTimelineData()` の walk フィルタを `eventList` 突合に修正
- [x] `buildTimelineData()` の `locationId` 取得を `eventDef` 経由に修正
- [x] `dummyTimelineData` を削除
- [x] `displayTimelineData` を削除し `timelineData` を直接使用
- [x] JSX 内の `displayTimelineData` → `timelineData` に置換

### ゲージ推移修正
- [x] `dummyGaugeHistory` を削除
- [x] `displayGaugeHistory` を削除し `gaugeHistory` を直接使用
- [x] JSX 内の `displayGaugeHistory` → `gaugeHistory` に置換

### ヒント修正
- [x] `dummyHints` を削除
- [x] `displayHints` を削除し `hintsData` を直接使用
- [x] JSX 内の `displayHints` → `hintsData` に置換

### 確認
- [x] コンパイル確認
