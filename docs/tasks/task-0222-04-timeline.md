# Task 4: 生死を分けた選択コンポーネント作成

> 仕様: [../result-page-spec.md](../result-page-spec.md) セクション 4

## ステータス: ✅ 実装完了（仕様確認済み）

## 対象ファイル

- `client/src/components/game-page/ResultTimelineItem.jsx`（新規）
- `client/src/pages/ResultPage.jsx`

## 概要

`eventHistoryAtom` から `walk` イベントのみ抽出し、プレイヤーの重大な移動選択を時系列で振り返るセクション。  
API 呼び出しは不要。ローカルの `facilityList` / `spotTypeList` のみで完結。

## 実装内容

### 1. `facilitySignificanceText` の定義

ResultPage 内に施設ごとの意義テキストを定義:

```js
const facilitySignificanceText = {
  fac_001: "電源を確保。精神を回復し、後のSNS利用やマップ閲覧が可能に。",
  fac_002: "壁の矢印が示す避難方向を確認。土地勘がなくても正しい方角を把握できた。",
  fac_003: "水や食料を調達。体力と気力を回復し、次の行動に備えた。",
  fac_004: "受け入れ施設の情報を取得し、行動範囲が広がった。",
  fac_005: "施設が満員になる寸前に滑り込み、夜の安全を確保。",
};
```

### 2. `ResultTimelineItem.jsx`（新規）

- props: `{ time, facilityTypeName, facilityName, significanceText, isLast }`
- レイアウト:
  - 時刻（`text-subtext`）
  - 施設タイプ名 + "へ移動"（赤太字, `text-maintext`）
  - "地点：" + 施設名（`text-subtext`）
  - 意義テキスト（`text-subtext`）
  - `isLast` が false なら `borderBottom` で区切り

### 3. ResultPage への統合

- `eventHistoryAtom` から `walk` イベントのみフィルタ
- イベントの `locationId` → `facilityList` で施設情報取得
- 施設の `type` → `spotTypeList[type].name` で施設タイプ名取得
- `facilitySignificanceText[facility.id]` で意義テキスト取得
- データを組み立てて `ResultTimelineItem` に props で渡す
- カードヘッダー: "生死を分けた選択"（他セクションと統一のスタイル）
- 履歴 0 件時は「行動履歴がありません」と表示

## データフロー

```
eventHistoryAtom (walk のみ)
  ↓ event.locationId
facilityList (ローカル)
  ↓ facility.type
spotTypeList (ローカル) → 施設タイプ名
  ↓ facility.id
facilitySignificanceText → 意義テキスト
  ↓
ResultTimelineItem (props)
```

## レビューポイント

- `walk` イベントのみフィルタされているか
- API 呼び出しが一切ないか（ローカルデータのみ）
- カードスタイルが StatsSummary / GaugeChart と統一されているか
- `fac_000`（渋谷駅前）が表示されないか

## 作業ログ

### 2026-02-23 実装完了・仕様確認

#### 1. コンポーネント作成
- **ResultTimelineItem.jsx** 新規作成
  - props: `time`, `facilityTypeName`, `facilityName`, `significanceText`, `isLast`
  - レイアウト：時刻（text-subtext）→ アクション名（赤太字, text-maintext）→ 地点（text-subtext）→ 意義テキスト（text-subtext）
  - `isLast` の場合 `borderBottom` なし

#### 2. ResultPage.jsx 統合
- `facilitySignificanceText` 定義：5施設ぶんの意義テキスト
- `buildTimelineData()` 実装：eventHistory から walk イベントのみをフィルタ
  - ローカルの `facilityList` / `spotTypeList` でデータ取得（API呼び出しなし）
  - 施設タイプ名 + "へ移動" で赤太字アクション名生成
- ダミータイムラインデータ定義：UI確認用の3エントリ
- 仕様に合わせたカード形式（ヘッダー + ボディ）の実装

#### 3. 仕様確認（ダミーデータ）
✅ **時刻** — HH:mm 形式で表示（15:00 など）
✅ **赤太字アクション名** — "モバイルバッテリースタンドへ移動" など CSS色 `--color-theme10` で赤く表示
✅ **地点表示** — "地点：CHARGESPOT HUB 渋谷センター街店" という形式
✅ **意義テキスト** — 各施設の生存上の意義を 1-2 行で表示
✅ **ボーダー区切り** — エントリ間の `borderBottom`、最後のエントリは区切りなし
✅ **カード統一性** — StatsSummary / GaugeChart と同じヘッダー + ボディ構造

#### 4. 動作確認
- コンパイル ✅（エラーなし）
- 開発サーバー起動 ✅（https://localhost:3000）
- `/result` ページでダミータイムラインデータ表示確認 ✅

#### 5. 実装との仕様整合性
| 項目 | 仕様 | 実装 | 確認 |
|------|------|------|------|
| walk イベント抽出 | walk のみ表示 | `filter(e => e.type === "walk")` | ✅ |
| API依存 | なし（ローカルのみ） | `facilityList`, `spotTypeList` 参照 | ✅ |
| fac_000 除外 | 起点なので非表示 | 自動的に除外（fac_001-fac_005 のみ）| ✅ |
| 色 | 赤太字 | `color="var(--color-theme10)"` | ✅ |
| 空時表示 | "行動履歴がありません" | 実装済み | ✅ |

#### 6. 残務
- [ ] ダミーデータの削除（gameplayflow で実イベント生成時に切り替え）
- [ ] 統合テスト（Task 5 の resetAllAtom フロー確認）
