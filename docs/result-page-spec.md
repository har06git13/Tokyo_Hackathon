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

プレイ内容を数値で振り返るカード形式のセクション。

| 表示項目     | データソース                                         |
| ------------ | ---------------------------------------------------- |
| 経過時間     | `currentTimeAtom` − 開始時刻（14:00）                |
| 訪問施設数   | `visitedFacilitiesAtom.length`                       |
| イベント数   | `eventHistoryAtom.length`                            |
| 最終体力     | `lifeAtom`                                           |
| 最終精神力   | `mentalAtom`                                         |
| 最終充電     | `chargeAtom`                                         |
| 最終所持金   | `moneyAtom`                                          |

---

### セクション 3: ゲージ推移

`gaugeHistoryAtom` のデータをもとに、ゲージの時系列変化を可視化する。

#### データ構造（gaugeHistoryAtom）

```js
[
  { time: Date, life: number, mental: number, charge: number, money: number },
  ...
]
```

#### 表示方式

- **ステップバー形式**（ライブラリ不要・既存UIに馴染む）
- 各時刻ごとに横棒グラフで4ゲージを表示
- ゲージが 0 になった箇所は赤くハイライト
- **`gaugeHistoryAtom` が空配列の場合**: 最終ゲージ値のみ1行で表示し、「ゲージ推移データがありません」と注記

> ⚠️ `gaugeHistoryAtom` にデータが蓄積されるかはゲームロジック側に依存。Task 4 で空配列時のフォールバックUIを実装する。

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


