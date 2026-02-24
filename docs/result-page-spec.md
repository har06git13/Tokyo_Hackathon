# リザルトページ仕様書（確定仕様）

- 文書ID: `result-page-spec`
- バージョン: `2.0`
- 最終更新: `2026-02-24`
- 対象画面: `Route /result`

## 0. この文書の位置づけ

本書は、リザルトページの**現時点での確定仕様（What）**のみを定義する。

- 本書に含める: 画面要件、データソース、ルーティング、API契約、責務分担、受け入れ条件
- 本書に含めない: 実装コード例、Issue修正履歴、将来構想、テスト詳細

履歴（Issue対応・作業ログ）は `docs/tasks/` 配下のタスクファイルで管理する。
本書は「確定仕様（What）」と「設計（How）」を1ファイルで扱う。

## 1. スコープ

### 1.1 今回リリースの対象

1. `ResultPage` の表示（結果ヘッダー、想定地震情報、統計サマリー、ゲージ推移、行動タイムライン、防災ヒント、アプリ紹介、ボタン群）
2. `ShareModal` の表示と画像保存
3. 結果保存API `POST /api/results` の送信

### 1.2 今回リリースの非対象

1. `SharePage` の新規作成
2. `/result/share` ルート
3. リザルト画面での `GET /api/events/:id` / `GET /api/facilities` 呼び出し
4. Share画像への地図埋め込み（Static Maps連携）

## 2. ソースオブトゥルース（SoT）

### 2.1 機能別の正式データソース

| 機能 | 正式データソース | 補助データ | 備考 |
| --- | --- | --- | --- |
| 成功/失敗表示 | `survivedAtom`, `criticalReasonAtom` | - | 画面表示用 |
| 統計サマリー | `visitedFacilitiesAtom`, `currentTimeAtom`, `moneyAtom`, `eventHistoryAtom` | `facilityList`（ローカル） | 距離はローカル座標で算出 |
| ゲージ推移 | `gaugeHistoryAtom` | - | 表示キーは `life/mental/charge/money` |
| 生死を分けた選択 | `eventHistoryAtom` | `eventList` + `facilityList` + `spotTypeList`（ローカル） | `walk/epilogue/sns` を抽出 |
| 防災ヒント | `visitedFacilitiesAtom`, `moneyAtom`, `chargeAtom`, `mentalAtom` | 施設ヒント定義 | 最大2件表示 |
| ShareModal表示内容 | ResultPageで計算した値（props） | - | ShareModalはAtomを直接読まない |
| 結果保存 | `POST /api/results` | - | 送信仕様は第6章 |

### 2.2 命名の正規化ルール

1. 表示・記録用ゲージキーは `life`, `mental`, `charge`, `money` を正とする。
2. イベント定義の `gaugeChange` / `gaugeSteps` で使う `battery` は、ゲームロジックで `charge` に反映する入力キーとして扱う。
3. ResultPage配下で `battery` を直接参照しない。

### 2.3 確定仕様と将来対応の扱い

1. 本書本文に記載のある値・挙動は**すべて今回リリースの必須仕様**とする。
2. 将来対応は第11章に記載し、本書の要件判断に使わない。
3. 暫定値（例: `totalDistance={null}`）は本書に記載しない。

## 3. 画面遷移・ルーティング

### 3.1 画面遷移

```text
ゲーム終了イベント（epilogue / life===0 / timeup）
  -> /result（ResultPage）
  -> /（タイトル、全データリセット時）
```

### 3.2 ルーティング要件

1. リザルト関連のルートは `/result` のみ。
2. `/result/share` は存在しない。
3. SNS共有は遷移ではなく `ShareModal`（オーバーレイ）で実行する。

## 4. 画面仕様

### 4.1 セクション順序（上から）

1. 結果ヘッダー
2. 想定地震情報
3. 統計サマリー
4. ゲージ推移
5. 生死を分けた選択
6. 防災に向けてのヒント
7. アプリ紹介
8. ボタン群（SNS共有、タイトルに戻る）
9. ダミー画像（開発用のみ）

### 4.2 結果ヘッダー

- ヘッダー中央: `結果発表`
- 成功失敗文言: `survivedAtom` で切替（成功: `避難成功!` / 失敗: `避難失敗…`）
- フレーバー文: `criticalReasonAtom` 対応
- 最終ゲージ表示: `LifeGauge`（`life`, `mental`, `charge`, `money`）

`criticalReasonAtom` 対応:

- `lowLife`: `体力が限界に達し、倒れてしまった…`
- `timeup`: `時間切れ。避難場所に辿り着くことができなかった…`
- その他失敗時: `避難に失敗してしまった…`
- 成功時は固定文

### 4.3 想定地震情報

- 既存の地震情報カードを維持する。
- セクション間隔は `mt=2vh`。

### 4.4 統計サマリー

#### 4.4.1 表示項目

| 項目 | 算出 | 表示例 |
| --- | --- | --- |
| 総移動距離 | `visitedFacilitiesAtom` を訪問順で走査し、`facilityList.coordinates` を使って Haversine 合算 | `2.3 km` |
| 経過時間 | `currentTimeAtom - createStartTime(当日14:00)` | `3時間30分` |
| 訪問施設数 | `visitedFacilitiesAtom` から `fac_000` を除外して件数化 | `5 箇所` |
| 使用したお金 | `moneyAtom * 100`（百円 -> 円） | `4,000 円` |
| SNS利用回数 | `eventHistoryAtom` の `id.startsWith("event_sns_")` 件数 | `3 回` |

#### 4.4.2 必須ルール

1. 総移動距離は必ずローカル算出し、`null` を許容しない。
2. 距離算出で施設IDが不明なセグメントはスキップする。
3. `money` はゲージ内部値 0-100（百円単位）を維持し、表示時のみ円換算する。
4. RouteMapはPolylineのみ表示し、ピンは表示しない。

#### 4.4.3 RouteMapフォールバック

- `visitedFacilities` が1件以下（実質移動なし）の場合は地図の代わりにフォールバック文言を表示する。

### 4.5 ゲージ推移

#### 4.5.1 入力データ

`gaugeHistoryAtom` は以下の配列。

```text
[{ time: Date, life: number, mental: number, charge: number, money: number }, ...]
```

#### 4.5.2 表示要件

1. 折れ線グラフで `life/mental/charge/money` を同時表示する。
2. 凡例ラベルは `体力 (%)` / `精神力 (%)` / `充電 (%)` / `お金 (百円)`。
3. 同時刻の複数ポイント（`gaugeSteps` 由来）をそのまま描画する。

#### 4.5.3 空データ時の扱い

- 正常系前提: `gaugeHistoryAtom` は1件以上存在する。
- 例外系: 空配列の場合は `ゲージ推移データがありません` を表示し、凡例のみ表示する。
- QA上は「例外系」として扱う。

### 4.6 生死を分けた選択

#### 4.6.1 抽出ルール

1. `eventHistoryAtom` を時系列で走査する。
2. `eventList` と突合し、`type` が `walk` / `epilogue` / `sns` のみ採用する。
3. `walk` / `epilogue` は `facilityList` と `spotTypeList` で施設名・施設種別名を解決する。

#### 4.6.2 1エントリ表示

- 時刻: `HH:mm`
- アクション名:
  - `walk/epilogue`: `{施設タイプ名}へ移動`
  - `sns`: `SNS を確認`
- 地点:
  - `walk/epilogue`: `地点：{施設名}`
  - `sns`: 非表示
- 意義テキスト: 施設IDまたはSNS固定文から取得

#### 4.6.3 空データ時

- `行動履歴がありません` を表示する。

### 4.7 防災に向けてのヒント

#### 4.7.1 生成ルール

0. **行動履歴がない場合（`timelineData.length === 0`）は空配列を返す**（ヒントを生成しない）。
1. 施設訪問ヒント（訪問/未訪問）を評価する。
2. ゲージ条件ヒント（money/charge/mental）を評価する。
3. 重複テーマを避ける条件（例: money=0 と `fac_003` 未訪問）を適用する。
4. 候補が3件以上の場合はランダムシャッフル後に2件採用する。

#### 4.7.2 空データ時

- `生存のヒントがありません` を表示する。

### 4.8 アプリ紹介

- 既存表示を維持する（本文、外部リンク）。

### 4.9 ボタン群

1. SNS共有ボタン
- 文言: `避難の記録をSNSに投稿する`
- 動作: `setIsShareOpen(true)`

2. タイトルに戻るボタン
- 文言: `タイトルに戻る`
- 動作: 確認ダイアログ -> `resetAllAtom` -> `/` へ遷移

### 4.10 ダミー画像

- `dummy-result.png` は開発用表示。
- 本番リリースでは削除対象。

## 5. ShareModal仕様

### 5.1 表示方式

1. ResultPage内オーバーレイ（ボトムシート）で表示する。
2. 別ページ遷移はしない。
3. ルート追加はしない。

### 5.2 コンポーネント契約

`ShareModal` は以下を props で受け取る。

- `isOpen: boolean`
- `onClose: () => void`
- `shareData`:
  - `survived`
  - `visitedCount`
  - `totalDistance`
  - `elapsedTime: { hours, minutes }`
  - `snsCount`
  - `money`
  - `life`, `mental`, `charge`
  - `playDate`

### 5.3 画像生成仕様

1. Canvasサイズは `1080x1920`（9:16）固定。
2. レイアウトは絶対座標の固定値ではなく、キャンバス比率ベースで配置する。
3. 文言可変に備え、各セクションに最小余白と折り返し上限を持たせる。
4. 生成画像にはRouteMapを含めない。

### 5.4 フォント仕様

1. 描画前に `document.fonts.ready` を待機する。
2. 指定フォント未読込時はフォールバックフォントで描画する。
3. フォールバック時も要素が重ならないよう、テキスト幅再計測で配置を再計算する。

### 5.5 保存仕様

1. 二重押下防止として `isSaving` を使う。
2. デスクトップは `download` 属性で保存する。
3. iOS Safari ではプレビュー表示 + 長押し保存案内を出す。

## 6. サーバー連携仕様（`POST /api/results`）

### 6.1 送信タイミング

1. 送信は「`/result` への遷移確定時」に1回行う。
2. ResultPageの初回描画では送信しない。
3. `/result` 再訪問・リロード時に自動再送しない。

### 6.2 リクエスト

`Content-Type: application/json`

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

#### 6.2.1 フィールド定義

| フィールド | 型 | 必須 | 備考 |
| --- | --- | --- | --- |
| `AgeType` | `string \| null` | 任意 | Atom値をそのまま送信 |
| `Gender` | `string \| null` | 任意 | Atom値をそのまま送信 |
| `ResidenceType` | `string \| null` | 任意 | Atom値をそのまま送信 |
| `EventHistory` | `Array<{id:string,time:string}>` | 任意 | `time` は ISO8601 UTC |

### 6.3 レスポンス

| HTTP | body | 意味 |
| --- | --- | --- |
| `201` | `{ "_id": "..." }` | 保存成功 |
| `500` | `{ "error": "..." }` | 保存失敗 |

### 6.4 通信失敗時の挙動

1. 結果保存失敗でも画面遷移は継続する（UIはブロックしない）。
2. 自動リトライは行わない。
3. タイムアウトはブラウザ標準設定（明示指定なし）を使う。

### 6.5 冪等性と重複

1. 現行仕様では `Idempotency-Key` を使用しない。
2. 同一プレイの重複送信をサーバー側で完全排除する仕様は持たない。
3. 分析時の重複排除は別系統で扱う（本画面仕様の対象外）。

### 6.6 データ取り扱い

1. 送信対象は年齢区分・性別区分・居住属性・イベント履歴のみ。
2. `playerName` 等の個人識別に近い情報は送信しない。
3. `EventHistory.time` はUTC基準で扱う。

## 7. コンポーネント責務

| コンポーネント | 責務 | Atom直接参照 |
| --- | --- | --- |
| `ResultPage` | 画面コンテナ、Atom読取、値算出、props受け渡し、ルーティング | あり |
| `StatsSummary` | 統計表示（純粋表示） | なし |
| `GaugeChart` | グラフ表示（純粋表示） | なし |
| `ResultTimelineItem` | タイムライン1行表示（純粋表示） | なし |
| `ShareModal` | モーダルUI・画像生成（純粋表示） | なし |
| `resultPageLogic` | 純粋関数群（算出・整形） | なし |

## 8. 依存リソース

### 8.1 Atom

- `survivedAtom`
- `criticalReasonAtom`
- `lifeAtom`
- `mentalAtom`
- `chargeAtom`
- `moneyAtom`
- `currentTimeAtom`
- `eventHistoryAtom`
- `gaugeHistoryAtom`
- `visitedFacilitiesAtom`
- `resetAllAtom`

### 8.2 ローカルマスタ

- `eventList`
- `facilityList`
- `spotTypeList`

### 8.3 API

- `POST /api/results`

注記:

- `GET /api/events/:id` と `GET /api/facilities` はゲーム進行側の仕様であり、ResultPage仕様の依存APIには含めない。

## 9. 受け入れ条件（QA）

1. 目次・章本文・ルーティング定義の間で `/result/share` の記述不整合がない。
2. 統計サマリーの総移動距離が `null` にならない。
3. `fac_000` は訪問施設数に含まれない。
4. `money` が百円単位で表示時に円換算される。
5. `gaugeHistory` 空配列時に例外系フォールバック表示となる。
6. タイムラインで `sns` は地点行を表示しない。
7. ShareModalはルーティング遷移なしで開閉できる。
8. Result保存失敗時でも `/result` へ遷移する。

## 10. 文書運用ルール

1. 仕様変更時は本書（What）を先に更新する。
2. 実装詳細変更時は本書の第11章（設計）を更新する。
3. Issue対応やテスト結果は `docs/tasks/` の該当タスクに追記する。
4. 本書に「完了済みIssue履歴」や「テスト実行ログ」を混在させない。

## 11. 設計（How）

### 11.1 設計方針

1. 算出ロジックは `client/src/utils/resultPageLogic.js` に集約し、UIコンポーネントから分離する。
2. `ResultPage` はコンテナとして Atom を読み、表示コンポーネントへ props を渡す。
3. 表示コンポーネントは副作用を持たない（`ShareModal` も同様）。

### 11.2 データフロー

```text
Atom / ローカルマスタ
  -> ResultPage（算出・整形）
    -> StatsSummary / GaugeChart / ResultTimelineItem / ShareModal
```

- 施設名・施設タイプは `eventHistoryAtom` 単体では復元できないため、`eventList` / `facilityList` / `spotTypeList` を突合する。

### 11.3 算出ロジック設計

#### 11.3.1 総移動距離

1. `visitedFacilities` の隣接ペアごとに Haversine 距離（km）を合算する。
2. 小数点1桁で丸める。
3. 不正IDまたは座標欠損セグメントはスキップする。

#### 11.3.2 訪問施設数

- `fac_000` は開始地点なので除外する。

#### 11.3.3 ヒント選定

1. 施設系ヒント + 条件ヒントを作成する。
2. 3件以上はシャッフルして2件選択する。

### 11.4 `gaugeSteps` と `charge` / `battery` の扱い

#### 11.4.1 背景

- イベント定義（`eventList` / API `gaugeChange`）は `battery` キーを使用。
- 表示系（`gaugeHistory`, ResultPage, GaugeChart）は `charge` キーを使用。

#### 11.4.2 実装ルール

1. イベント処理段階で `battery` を `charge` に適用して確定値を作る。
2. `gaugeHistory` への記録は常に `charge` キーで保存する。
3. ResultPage 配下は `battery` を直接参照しない。

#### 11.4.3 後方互換

1. `gaugeSteps` がないイベントは `gaugeChange` を1ステップとして扱う。
2. `gaugeSteps` があるイベントは各ステップを同一時刻で順次適用する。

### 11.5 ShareModal 実装設計

#### 11.5.1 Canvas 生成

1. 画像サイズは `1080x1920`。
2. 出力形式は PNG。
3. 地図は含めない。

#### 11.5.2 レイアウト設計

1. 固定座標値への依存を避け、比率ベースでレイアウトする。
2. セクションごとに高さ比率を定義し、縦方向フローで配置する。

#### 11.5.3 フォントロード

1. 描画前に `document.fonts.ready` を待機する。
2. フォールバック時は `ctx.measureText` で再レイアウトして重なりを防ぐ。

#### 11.5.4 保存挙動

1. 通常ブラウザは `a[download]` 経由。
2. iOS Safari はプレビューURL表示 + 長押し保存誘導。
3. `isSaving` フラグで多重起動防止。

### 11.6 API送信の実装設計

1. 送信箇所は `useMonologueLogic` の `postResultIfNeeded(nextPath)`。
2. `/result` 遷移時のみ送信する。
3. 失敗時は警告ログのみで遷移を継続する。

### 11.7 将来対応（非対象）

1. `eventHistoryAtom` に `type`, `locationId` を保持し、`eventList` 突合を減らす。
2. `POST /api/results` に冪等性キーを導入する。
3. Share画像に地図を含める場合は Static Maps API 等の別設計を行う。
4. `AgeType/Gender/ResidenceType` の送信値を表示ラベルから正規化キーへ統一する。
