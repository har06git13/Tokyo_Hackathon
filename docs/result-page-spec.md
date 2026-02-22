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

### セクション 2: 想定地震情報

今回のゲームで想定した地震の情報を表示するカード形式のセクション。
セクション1（結果ヘッダー）の直後に配置し、プレイヤーにゲームの前提となる災害規模を認識させる。

変更なし。現在のハードコードされた地震情報をそのまま表示。
セクション間隔: `mt="2vh"`

---

### セクション 3: 統計サマリー

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

### セクション 4: ゲージ推移

`gaugeHistoryAtom` のデータをもとに、ゲージの時系列変化をカード形式で可視化する。セクション3（統計サマリー）と同じUIパターンを使用。

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

- セクション3（プレイ統計）と同じカードスタイル
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

### セクション 5: 生死を分けた選択

`eventHistoryAtom` から `type === "walk"` のイベントのみ抽出し、プレイヤーの重大な移動選択を時系列で振り返る。

#### デザイン

- 他セクションと同じカード形式（ヘッダー + ボディ）
- ヘッダーテキスト: `"生死を分けた選択"`
- 各エントリは `borderBottom` で区切り（最後のエントリは区切りなし）

#### データソース

- `eventHistoryAtom`（Jotai）から `walk` イベントのみフィルタ
- イベントの `locationId` → `facilityList` でローカル参照（APIコール不要）
- 施設の `type` → `spotTypeList` で日本語名を取得
- 施設ごとの意義テキスト → `facilitySignificanceText`（後述）で取得

#### 表示内容（1エントリあたり）

```
15:00                          ← 時刻（text-subtext）
モバイルバッテリースタンドへ移動  ← 施設タイプ名 + "へ移動"（赤太字, text-maintext）
地点：CHARGESPOT HUB 渋谷センター街店  ← "地点：" + 施設名（text-subtext）
                               ← 空行
電源を確保。精神を回復し、...    ← 意義テキスト（text-subtext）
```

| 表示項目       | データソース                                              | スタイル                              |
| -------------- | --------------------------------------------------------- | ------------------------------------- |
| 時刻           | `eventHistory[i].time` を `HH:mm` フォーマット            | `text-subtext`                        |
| アクション名   | `spotTypeList[facility.type].name` + `"へ移動"`           | `text-maintext`, `color: red`, `bold` |
| 地点           | `"地点：" + facility.name`                                | `text-subtext`                        |
| 意義テキスト   | `facilitySignificanceText[facility.id]`                   | `text-subtext`                        |

#### 施設ごとの意義テキスト定義（`facilitySignificanceText`）

ResultPage 内、または `temporary-database` 内に以下のマッピングを定義する。

```js
const facilitySignificanceText = {
  fac_001: "電源を確保。精神を回復し、後のSNS利用やマップ閲覧が可能に。",
  fac_002: "壁の矢印が示す避難方向を確認。土地勘がなくても正しい方角を把握できた。",
  fac_003: "水や食料を調達。体力と気力を回復し、次の行動に備えた。",
  fac_004: "受け入れ施設の情報を取得し、行動範囲が広がった。",
  fac_005: "施設が満員になる寸前に滑り込み、夜の安全を確保。",
};
```

> ※ `fac_000`（渋谷駅前）はゲーム開始地点のため、タイムラインには表示しない。

#### コンポーネント構成

- 新規: `ResultTimelineItem.jsx`（1エントリ分の表示）
- props: `{ time, facilityTypeName, facilityName, significanceText }`
- ResultPage 側でデータを組み立てて props で渡す

---

### セクション 6: 防災に向けてのヒント

ゲーム中のプレイヤーの選択に基づいて、現実の防災に活かせるヒントを動的に表示するセクション。「あれば～かもしれない」という反事実的な視点で学習を促進。

#### デザイン

- 他セクションと同じカード形式（ヘッダー + ボディ）
- ヘッダーテキスト: `"防災に向けて～生存のヒント～"`
- ボディ：赤太字テキストで1～複数のヒントを表示

#### データソース

- `visitedFacilitiesAtom` に基づく：特定の施設を訪問したかどうか
- `gaugeHistoryAtom` に基づく：ゲージが 0 になった項目の有無

#### 表示内容（例）

```
防災に向けて～生存のヒント～

現金があれば、キャッシュレス決済が使えなくなっても皮てすぐに済んだかもしれない。

モバイルバッテリーを持ち歩いていれば、電源を心配する場面を減少させたかもしれない。
```

#### ヒント生成ロジック

各条件に応じたヒントを定義し、該当する条件がある場合のみ表示。

| 条件                                           | ヒントテキスト                                               |
| ---------------------------------------------- | ------------------------------------------------------------ |
| `visitedFacilities` に `fac_003` (コンビニ) **なし** | 「現金があれば、キャッシュレス決済が使えなくなっても皮てすぐに済んだかもしれない。」 |
| `visitedFacilities` に `fac_001` (モバイルバッテリー) **なし** | 「モバイルバッテリーを持ち歩いていれば、電源を心配する場面を減らせたかもしれない。」 |
| 最終 `moneyAtom` が 0 | 「小銭を常に持ち歩いていれば、緊急時の行動選択肢が広がったかもしれない。」 |
| 最終 `chargeAtom` が 0 | 「スマートフォンの充電を日ごろから心がけていれば、情報収集が途絶えなかったかもしれない。」 |
| 最終 `mentalAtom` が 30 未満 | 「複数の避難場所を事前に把握していれば、精神的な余裕が生まれたかもしれない。」 |

#### UIパターン

- セクション5（生死を分けた選択）と同じカードスタイル
- 幅 `90%`、背景 `var(--color-base10)`、角丸 `2vh`
- ヘッダー行：`text-maintext`、`paddingX: 4%`, `paddingY: 1vh`, `borderBottom: 0.1vh solid var(--color-base131)`
- ボディ行：`paddingX: 4%`, `paddingTop: 1vh`, `paddingBottom: 2vh`、`flexDirection: column`, `gap: 1vh`
- 各ヒントテキスト：`text-maintext`、黒字（デフォルトのテキスト色）

#### コンポーネント構成

- ResultPage 内で直接レンダリング（新規コンポーネント不要）
- ヒント配列を動的に生成してマッピング表示

---

### セクション 7: アプリ紹介（既存維持）

変更なし。オープンデータに関する説明と外部リンク。
セクション間隔: `mt="2vh"`

---

### セクション 8: タイトルに戻るボタン（既存維持）

- 確認ダイアログ → `resetAllAtom` で全リセット → `/` に遷移
- セクション間隔: `mt="2vh"`
- ※ `Button` コンポーネントは Chakra UI コンポーネントではないため `mt` props を受け取れない。`Flex` で囲んで `mt` を適用すること。

---

### ダミー画像（開発用・最終削除予定）

- タイトルに戻るボタンの**下**に配置
- 最終リリース前に削除予定
- `<img src="/assets/image/dummy-result.png" />`

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
| `resetAllAtom`          | 全リセット             |

---

## 使用する API

| メソッド | エンドポイント       | 用途                 |
| -------- | -------------------- | -------------------- |
| GET      | `/api/events/:id`    | イベント詳細取得     |
| GET      | `/api/facilities`    | 施設一覧取得         |

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


