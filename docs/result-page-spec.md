# リザルトページ仕様書

## 概要

ゲーム終了後に表示されるリザルト画面。プレイヤーの行動履歴・ゲージ推移・結果を動的にレンダリングし、プレイ内容を振り返ることができる。また、結果をサーバーに保存し、統計データとして活用する。

---

## 画面遷移

```
ゲーム終了イベント（epilogue / life===0 / timeup）
  → /result（ResultPage）
      → /（タイトル画面）※全データリセット
```

---

## 画面構成（上から順）

### セクション 1: 結果ヘッダー

| 項目             | 内容                                                     |
| ---------------- | -------------------------------------------------------- |
| ヘッダー中央     | 「結果発表」                                             |
| 成功/失敗        | `survivedAtom` の値で表示を切り替え                      |
| フレーバー文     | `criticalReasonAtom` に応じた動的テキスト（下表参照）    |
| 最終ゲージ       | `LifeGauge` コンポーネント（`life`, `mental`, `charge`, `money`） |

#### criticalReason → テキスト対応表

**survived === true（成功時）:**

一律で以下のテキストを表示:

> ギリギリの判断を重ね、無事に一時避難場所に辿り着くことができた。電源確保・現金取得・人とのつながり、どれもが生存に直結する選択だった。

**survived === false（失敗時）:**

| criticalReason | 表示テキスト                                         |
| -------------- | ---------------------------------------------------- |
| lowLife        | 体力が限界に達し、倒れてしまった…                    |
| timeup         | 時間切れ。避難場所に辿り着くことができなかった…       |
| （フォールバック） | 避難に失敗してしまった…                          |

> ※ テキストは今後調整可能。`criticalReasonList`（playerAtoms.js）と対応させる。

---

### セクション 2: 統計サマリー

プレイ内容を数値で振り返るカード形式のセクション。セクション1の `LifeGauge` と重複するゲージ値は含めない。

#### 画面構成（ASCII図）

```
┌─────────────────────────────────────────────┐
│ プレイ統計                                  │ ← ヘッダー（text-maintext）
├─────────────────────────────────────────────┤
│                                             │
│  総移動距離       経過時間       訪問施設数  │ ← ラベル（text-maintext）
│  — km           0時間0分        1 箇所    │ ← 数値（text-sectiontitle）
│                                             │
│  使用したお金   SNS利用回数              │
│  0              0 回                      │
│                                             │
└─────────────────────────────────────────────┘

※ 5項目を上記の順番で表示（総移動距離 → 経過時間 → 訪問施設数 → 使用したお金 → SNS利用回数）
※ flexWrap で2行に配置（1行目3項目、2行目2項目）
※ 数値とラベルは縦組み（Flex column）、ラベルが上、数値が下
※ ラベルは `text-maintext` （ヘッダーと同じサイズ・色）
※ 説明文・補足テキストは現時点では含めない（将来拡張可能）
```

| 表示項目       | データソース                                           | 表示例           |
| -------------- | ------------------------------------------------------ | ---------------- |
| 総移動距離     | `visitedFacilitiesAtom` の施設座標から算出              | 「約 2.3 km」    |
| 訪問施設数     | `visitedFacilitiesAtom.length`                         | 「5 箇所」       |
| 経過時間       | `currentTimeAtom` − 開始時刻（14:00）                  | 「3時間30分」    |
| 使用したお金   | `gaugeHistoryAtom` の `money` 差分（減少分の合計）      | 「2,000 円」     |
| SNS利用回数    | `eventHistoryAtom` で `id.startsWith("event_sns_")` のカウント | 「3 回」  |

#### 各項目の算出ロジック

**経過時間:**
```js
const elapsedMs = currentTime.getTime() - createStartTime().getTime();
const hours = Math.floor(elapsedMs / (1000 * 60 * 60));
const minutes = Math.floor((elapsedMs % (1000 * 60 * 60)) / (1000 * 60));
// → "3時間30分" / "0時間0分"（ゲーム未進行時）
```

> ※ 開始時刻は `playerAtoms.js` の `createStartTime()`（当日14:00）と同じロジックで算出する。

**総移動距離:**
- 🟡 **暫定**: ダミー値（`"— km"`）を表示。座標データ取得・Haversine 計算は将来タスクで対応
- 将来: `visitedFacilitiesAtom` の施設IDリストを `/api/facilities` の座標と突合 → 訪問順に距離合算

**使用したお金:**
- 🟡 **暫定**: `moneyAtom`（現在の所持金ゲージ値）をそのまま表示
- 将来: `gaugeHistoryAtom` の差分から使用総額を算出する場合は別タスクで対応

**SNS利用回数:**
- `eventHistoryAtom` 内のイベントIDが `"event_sns_"` で始まるエントリをカウント
- 0回の場合は「0 回」と表示

#### UIパターン

- 既存の `expected-earthquake` セクションのカードスタイルに準拠
- ヘッダー（`text-maintext`）＋ ボディの2段構成
- ボディ内は項目を `flexWrap="wrap"` で配置、各項目は以下の構成:
  - ラベル：`text-maintext` （ヘッダーと同じサイズ・色）
  - 数値：`text-sectiontitle` + `color="var(--color-theme10)"` + `fontWeight="bold"`
- 幅 `90%`、背景 `var(--color-base10)`、角丸 `2vh`

#### コンポーネント設計

- `StatsSummary` は **Atom を直接読み取らない**（純粋な表示コンポーネント）
- 親の `ResultPage` から props で値を渡す

```jsx
<StatsSummary
  totalDistance={null}              // 🟡 暫定null（将来API連携で算出）
  visitedCount={visitedCount}       // number
  elapsedTime={elapsedTime}         // { hours: number, minutes: number }
  moneyValue={money}                // 🟡 暫定: moneyAtomの現在値をそのまま表示
  snsCount={snsCount}               // number
/>
```

---

### セクション 3: ゲージ推移

`gaugeHistoryAtom` のデータをもとに、ゲージの時系列変化をカード形式で可視化する。セクション2（プレイ統計）と同じUIパターンを使用。

#### 画面構成（ASCII図）

```
┌─────────────────────────────────────────────┐
│ ゲージ推移                                  │ ← ヘッダー（text-maintext）
├─────────────────────────────────────────────┤
│                                             │
│  100│ ┌──────────────────────────┐          │
│   75│ │        折れ線グラフ       │          │
│   50│ └──────────────────────────┘          │
│    0│  14:00                16:00           │
│                                             │
│  ■ 体力  ■ 精神力  ■ 充電  ■ お金          │
│                                             │
└─────────────────────────────────────────────┘

※ グラフ領域の下に凡例を配置
※ フォールバック: gaugeHistoryAtom が空配列の場合、「ゲージ推移データがありません」＋凡例のみ表示
```

#### データ構造（gaugeHistoryAtom）

```js
[
  { time: Date, life: number, mental: number, charge: number, money: number },
  ...
]
```

#### 表示方式

- **折れ線グラフ形式**（ライブラリ不要・SVG で実装）
- **縦軸**: ゲージ値（0〜100%）、目盛り: 0, 25, 50, 75, 100
- **横軸**: ゲーム内時刻（14:00〜ゲーム終了時刻）
- 4ゲージ（life・mental・charge・money）をそれぞれ異なる色で1つのグラフに重ねて表示
- ゲージが 0 になった点は赤い丸マーカーでハイライト
- 凡例（legend）を表示：各ゲージ名＋**ヘッダーと同じアイコン表示**

#### 色定義

| ゲージ | 色変数                    |
| ------ | ------------------------- |
| life   | `var(--color-life10)`     |
| mental | `var(--color-mental10)`   |
| charge | `var(--color-charge10)`   |
| money  | `var(--color-money10)`    |

#### UIパターン

- セクション2（プレイ統計）と同じカードスタイル
- 幅 `90%`、背景 `var(--color-base10)`、角丸 `2vh`
- ヘッダー（`text-maintext`）＋ グラフ領域 ＋ 凡例（`text-subtext`）の3段構成
- ヘッダー行はプレイ統計と同じ（`paddingX: 4%`, `paddingY: 1vh`）
- ヘッダー下線はプレイ統計と同じ（`borderBottom: 0.1vh solid var(--color-base131)`）
- ボディ行は `paddingX: 4%`, `paddingTop: 1vh`, `paddingBottom: 2vh`
- ヘッダーとグラフ領域の間隔: `0.8vh`
- グラフ領域と凡例の間隔: `0.8vh`

#### フォールバック時の表示

- 状況: `gaugeHistoryAtom` が空配列
- UI: 同じカード形式を保持
- 内容:
  1. ヘッダー: 「ゲージ推移」（text-maintext）
  2. メッセージ: 「ゲージ推移データがありません」（text-maintext）
  3. 凡例: グラフの代わりに凡例のみを表示

#### 実装方針

- 外部ライブラリ不使用：SVG の `<polyline>` で描画
#### 実装方針

- グラフ領域のサイズ：幅 `100%`、高さ `15vh`、背景色 `var(--color-base12)`、角丸 `1vh`
- グラフ領域の枠線：**外側描画**で線端を隠さない（`outline` または `box-shadow` で描画）
- SVG viewBox: `0 0 500 350`
- `preserveAspectRatio="none"` でコンテナ全体に引き伸ばし（**左右余白ゼロ**）
- **左右余白**：折れ線の端が枠に触れない程度に小さく確保（`padding.left/right = 10`）
- 目盛り/時刻ラベルは **SVGの外** に配置して可読性を確保
  - 縦軸ラベル：左カラムの左側に別要素で縦並び
  - 横軸ラベル：グラフ直下に別要素で左右配置
- 上下の可読性確保のため `padding.top/bottom` は維持
- **XY軸の罫線は表示しない**
- 横グリッド線：**視認性を優先**して不透明にする（`opacity: 1`）
- ゲージ折れ線：各ゲージ色で描画、線幅は **2倍（現状比）**
- 0値マーカー：赤い円でハイライト
- 凡例：グラフ下部に、`flexWrap` で配置（**ヘッダーと同じアイコン表示**）

#### コンポーネント設計

- `GaugeChart` として新規作成
- Atom を直接読み取らない（純粋な表示コンポーネント）
- 親の `ResultPage` から props で値を渡す

```jsx
<GaugeChart
  gaugeHistory={gaugeHistory}  // gaugeHistoryAtom の値
/>
```

---

### セクション 4: 行動タイムライン

`eventHistoryAtom` のイベントID・時刻をもとに、施設一覧とイベント詳細を取得し時系列表示。

#### API呼び出し方針（N+1 問題の回避）

- 施設: `/api/facilities` で一括取得 → IDでインデックス化
- イベント: `/api/events/:id` を `Promise.all` で並列取得（ResultPage マウント時に1回だけ）
- 取得済みデータをコンポーネントに props で渡す（子コンポーネントから個別APIを呼ばない）

#### データ構造（eventHistoryAtom）

```js
[
  { id: "event_xxx", time: Date },
  ...
]
```

#### 表示内容（1行あたり）

| 表示項目       | データソース                                  |
| -------------- | --------------------------------------------- |
| 時刻           | `eventHistory[i].time`                        |
| イベント種別   | `event.type` → `eventTypeList` で日本語変換   |
| 移動先施設名   | `event.locationId` → `/api/facilities/:id`    |
| 施設タイプ     | `facility.type` → `spotTypeList` で日本語変換 |
| ゲージ変動     | `gaugeHistoryAtom` の該当時刻エントリ         |

> ※ 既存の `LogElement` コンポーネントの簡易版として新規作成（ResultTimelineItem）

---

### セクション 5: 想定地震情報（既存維持）

変更なし。現在のハードコードされた地震情報をそのまま表示。

---

### セクション 6: アプリ紹介（既存維持）

変更なし。オープンデータに関する説明と外部リンク。

---

### セクション 7: タイトルに戻るボタン（既存維持）

- 確認ダイアログ → `resetAllAtom` で全リセット → `/` に遷移

---

## サーバー連携

### 結果保存

ResultPage の **初回レンダリング時** に `POST /api/results` を呼び出す。

#### リクエストボディ

```json
{
  "AgeType": "20代",
  "Gender": "男性",
  "ResidenceType": "渋谷区在学",
  "EventHistory": [
    { "id": "event_xxx", "time": "2026-02-22T14:30:00.000Z" }
  ]
}
```

> ⚠️ Atom は日本語文字列（`"20代"`, `"男性"`）を保持しており、`staticDataList` のキー（`y20`, `male`）とは異なる。  
> 現時点では **Atom の値をそのまま送信** する。統計集計時にサーバー側で正規化する方針とする。  
> 将来的に Atom 自体をキーで保持するよう統一する場合は別タスクで対応。

#### Atom → フィールド対応

| API フィールド | Atom                  | 値の形式               |
| -------------- | --------------------- | ---------------------- |
| AgeType        | `playerAgeAtom`       | 日本語文字列（`"20代"`） |
| Gender         | `playerGenderAtom`    | 日本語文字列（`"男性"`） |
| ResidenceType  | `playerResidenceAtom` | 日本語文字列（`"渋谷区在学"`） |
| EventHistory   | `eventHistoryAtom`    | `[{ id, time }]`      |

#### 注意事項

- 二重送信防止: `useRef` で送信済みフラグを管理
- エラー時: コンソールに警告のみ（リザルト表示には影響させない）

---

## 使用する Atom 一覧

| Atom                    | 用途                   |
| ----------------------- | ---------------------- |
| `survivedAtom`          | 成功/失敗判定          |
| `criticalReasonAtom`    | 死因/サバイバルポイント |
| `lifeAtom`              | 最終体力               |
| `mentalAtom`            | 最終精神力             |
| `chargeAtom`            | 最終充電               |
| `moneyAtom`             | 最終所持金             |
| `currentTimeAtom`       | ゲーム内現在時刻       |
| `eventHistoryAtom`      | イベント履歴           |
| `gaugeHistoryAtom`      | ゲージ推移履歴         |
| `visitedFacilitiesAtom` | 訪問済み施設ID一覧     |
| `playerAgeAtom`         | プレイヤー年代         |
| `playerGenderAtom`      | プレイヤー性別         |
| `playerResidenceAtom`   | プレイヤー生活拠点     |
| `playerNameAtom`        | プレイヤー名           |
| `resetAllAtom`          | 全リセット             |

---

## 使用する API

| メソッド | エンドポイント       | 用途                 |
| -------- | -------------------- | -------------------- |
| GET      | `/api/events/:id`    | イベント詳細取得     |
| GET      | `/api/facilities`    | 施設一覧取得         |
| POST     | `/api/results`       | 結果保存             |

---

## ファイル構成（変更対象）

| ファイル                                        | 変更種別 | 内容                         |
| ----------------------------------------------- | -------- | ---------------------------- |
| `client/src/pages/ResultPage.jsx`               | 改修     | 全面改修                     |
| `client/src/components/game-page/ResultTimelineItem.jsx` | 新規 | タイムライン1行コンポーネント |
| `client/src/components/game-page/GaugeChart.jsx`         | 新規 | ゲージ推移の可視化           |
| `client/src/components/game-page/StatsSummary.jsx`       | 新規 | 統計サマリーカード           |
| `client/src/components/game-page/index.js`      | 改修     | 新規コンポーネントの export  |
| `client/src/atoms/playerAtoms.js`               | 修正     | `criticalReasonAtom` 初期値修正・`resetAllAtom` に追加 |
| `server/index.js`                               | 修正     | エラーハンドラ重複削除       |


