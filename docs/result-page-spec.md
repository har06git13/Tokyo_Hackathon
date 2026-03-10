# リザルトページ仕様書（確定仕様）

- 文書ID: `result-page-spec`
- バージョン: `3.0`
- 最終更新: `2026-03-10`
- 対象画面: `Route /result`

## 0. この文書の位置づけ

本書は、リザルトページの**現時点での確定仕様（What）**のみを定義する。

- 本書に含める: 画面要件、データソース、ルーティング、API契約、責務分担、受け入れ条件
- 本書に含めない: 実装コード例、Issue修正履歴、将来構想、テスト詳細

履歴（Issue対応・作業ログ）は `docs/tasks/` 配下のタスクファイルで管理する。
本書は「確定仕様（What）」と「設計（How）」を1ファイルで扱う。

## 1. スコープ

### 1.1 今回リリースの対象

1. `ResultPage` の表示（結果ヘッダー、想定地震情報、統計サマリー、ゲージ推移、行動タイムライン、みんなの選択、防災ヒント、アプリ紹介、ボタン群）
2. `ShareModal` の表示と画像保存
3. 結果保存API `POST /api/results` の送信
4. 統計取得API `GET /api/results/stats` の取得

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
| みんなの選択 | `GET /api/results/stats` | `visitedFacilitiesAtom`（finalDestination算出） | サーバー集計値 |
| 防災ヒント | `visitedFacilitiesAtom`, `moneyAtom`, `chargeAtom`, `mentalAtom` | 施設ヒント定義（第4.7.3節） | 最大2件表示 |
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
6. みんなの選択
7. 防災に向けてのヒント
8. アプリ紹介
9. ボタン群（SNS共有、タイトルに戻る）

注記: 開発用ダミー画像（`dummy-result.png`）は**非表示**とする（コードは保持し、表示のみ無効化する）。

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

### 4.7 みんなの選択

#### 4.7.1 概要

他プレイヤーの統計を `GET /api/results/stats` から取得し、円グラフ・ドーナツグラフで表示する。

#### 4.7.2 UI構成

```
┌─────────────────────────────────┐
│ みんなの選択                      │
├─────────────────────────────────┤
│         最終到達地点              │
│       [円グラフ（SVG）]           │
│      [エリア凡例（wrap）]         │
│                                 │
│  [ドーナツ]   [ドーナツ]          │
│  同一到達地点  バッテリー          │
│    XX%         XX%              │
│                                 │
│  [ドーナツ]   [ドーナツ]          │
│  現金を下ろした 誰とも話さなかった  │
│    XX%          XX%             │
└─────────────────────────────────┘
```

- データ取得中はローディングテキストを表示する。
- 取得失敗時は `データを取得できませんでした` を**左詰め**で表示する。
- `total === 0` の場合は `データがまだありません` を**左詰め**で表示する。
- 「すべての選択を見る」ボタンは実装しない。

#### 4.7.2.1 円グラフ レイアウト制約

- スライス内にエリア名テキストは**表示しない**。
- スライス内に**割合（%）の数値のみ**表示する（例: `40%`）。
- スライスが小さすぎる場合（`rate < 10`）は数値を省略する。
- エリアの識別は凡例（下部 wrap 行）で行う。
- グラフ直上に `「全 {total} 人のデータ」` を小テキスト・**デフォルト文字色（黒）**で表示する。

#### 4.7.2.3 凡例 レイアウト制約

- 各凡例アイテムは `● {エリア名}` 形式で表示する（rate% は表示しない）。
- 「その他」の色ドット（灰色）は白背景との判別のため細いボーダーを付ける。

#### 4.7.2.2 ドーナツグラフ レイアウト制約

- 4つを**必ず2×2グリッド**で配置する（1列縦並び禁止）。
- 横並び2列を実現するため、各ドーナツの幅は gap を考慮した `calc(50% - <half-gap>)` とする。
- `width="50%"` をそのまま使い、かつ `gap` を持つ flex コンテナに入れてはならない（100%超えによる折り返しが発生するため）。

#### 4.7.3 色定義・表示順

エリアの表示順（円グラフ・凡例とも）は以下の固定順に従う。APIレスポンスの順序に依存しない。

| 順 | エリア表示名 | 色 | APIレスポンス値 |
|----|------------|-----|--------------|
| 1 | 渋谷駅周辺 | `#e63946` | `"渋谷駅周辺"` |
| 2 | 道玄坂エリア | `#393994` | `"道玄坂エリア"` |
| 3 | 代々木エリア | `#f4a261` | `"代々木エリア"` |
| 4 | 青山エリア | `#74c6cc` | `"青山エリア"` |
| 5 | その他 | `#cccccc` | `"不明"`（クライアントで変換） |

注記: APIは `"不明"` を返すが、クライアント側で `"その他"` に変換して表示する。

#### 4.7.4 ドーナツグラフ4項目

| ラベル | APIフィールド | 表示値の算出 |
|-------|-------------|------------|
| 同じ避難先だった\n{施設名} | `sameDestinationRate` | そのまま |
| 充電スポットに立ち寄った | `batteryRentalRate` | そのまま |
| 現金を確保した | `cashWithdrawRate` | そのまま |
| SNSで情報を集めた | `noSnsRate` | `100 - noSnsRate`（クライアントで反転） |

#### 4.7.5 `finalDestination` の算出（クライアント側）

`visitedFacilitiesAtom` を末尾から走査し、`fac_000` 以外の最初の施設IDを `finalDestination` とする。
訪問施設が `fac_000` のみの場合は `"fac_000"` を使用する。

### 4.8 防災に向けてのヒント

#### 4.8.0 方針（LLM 主経路 + ルールベース フォールバック）

1. **主経路（LLM）**: サーバーの `GET /api/advice` が Gemini API（`gemini-2.0-flash-lite`）で防災ナレッジPDFを参照し、ユーザーの行動履歴をもとに **100字程度のアドバイス1件** を生成する。
2. **フォールバック（ルールベース）**: API 呼び出しが失敗・タイムアウトした場合、または行動履歴が空の場合は従来の `buildHints()` を使用する（最大2件）。
3. **キャッシュ**: サーバー側 `server/advice_cache.json` に SHA-256 キーで保存し、同一アクションサマリーへの重複 API 呼び出しを防ぐ。
4. **キーワード赤字表示**: アドバイステキスト中の防災関連キーワード（§4.8.5 参照）を赤字（`color: red`）でハイライトする。

#### 4.8.1 アクションサマリー生成

`buildActionSummary(visitedFacilities, eventHistory)` → `string`（`resultPageLogic.js` に実装）

| 条件 | サマリーへの追加文言 |
|------|------------------|
| `fac_001` 訪問 | 「充電スポットで充電した」 |
| `fac_002` 訪問 | 「避難誘導サインを確認した」 |
| `fac_003` 訪問 | 「食料と現金を確保した」 |
| `fac_004` 訪問 | 「帰宅困難者受け入れ施設の情報を取得した」 |
| `fac_005` 訪問 | 「一時避難場所（ウィズ原宿）に到達した」 |
| SNS イベントあり（`event_sns_` 前置詞） | 「SNSで安否情報を発信・収集した」 |
| 上記いずれも該当しない | 「行動せずに移動した」 |

各条件に該当するものを `「、」` で結合した文字列を返す。空の場合は空文字列。

#### 4.8.2 サーバー API 仕様（`GET /api/advice`）

**クエリパラメータ**: `actions` (string) — アクションサマリー文字列（URLエンコード済み）

**レスポンス**:
```json
{ "advice": "string または null", "fromCache": true }
```

| フィールド | 説明 |
|-----------|------|
| `advice` | 生成されたアドバイス文字列。失敗時は `null` |
| `fromCache` | キャッシュから返した場合 `true` |

- **キャッシュキー**: `SHA-256(actions.trim())`
- **キャッシュファイル**: `server/advice_cache.json`
- **PDF管理**: `server/gemini-files.js` が **サーバー起動時に1回だけ** `server/knowledge/` のPDFを Gemini Files API にアップロードし、取得した `fileUri` 群をメモリ内に保持する。`/api/advice` はそれを参照するだけでアップロードを行わない。
- **モデル**: `gemini-2.0-flash-lite`, `temperature=0.2`, `thinking_budget=0`（Free Tier: 30 RPM / 1,500 RPD）
- **システムプロンプト**: 渋谷での地震避難体験者へのフィードバック。防災資料のみ根拠とし、改行・箇条書きなしで100字前後のワンセンテンスで返す。口調は「〜行動できた。〜しよう！」形式（過去行動を事実として述べ、今後の備えを「〜しよう」「〜確認しよう」などの命令形・促し形で締める）。
- **環境変数**: `server/.env` に `GEMINI_API_KEY` を追加する（`gemini-set/.env` から転記）。

#### 4.8.3 クライアント表示ルール

1. `ResultPage` マウント時に `useEffect` で `/api/advice?actions=<encoded>` を fetch する。
2. ローディング中: `「アドバイスを生成中...」` を表示する。
3. LLM 成功: アドバイス1件を防災キーワード赤字ハイライトで表示する。
4. LLM 失敗（fetch error / advice=null）または行動履歴が空: フォールバックとして `buildHints()` 結果（最大2件）を通常テキストで表示する。
5. 0件時: `「生存のヒントがありません」` を表示する。

#### 4.8.4 施設ヒント定義（フォールバック用正規定義）

以下が `facilityHintMap` の正規定義。`resultPageLogic.js` のみで定義し、フォールバック時に `buildHints()` が参照する。

| 施設ID | visited（訪問済み） | notVisited（未訪問） |
|--------|-------------------|------------------|
| `fac_001` | 充電スポットを確保しました！停電時でもスマートフォンが使えるよう、日頃からモバイルバッテリーを満充電にしておきましょう。 | モバイルバッテリーを持ち歩いていれば、電源を心配する場面を減らせたかもしれない。 |
| `fac_002` | 避難方向の目印を確認しました。日頃から地域のハザードマップや避難誘導サインを意識しておくと、緊急時も迷わず行動できます。 | 避難誘導サインは見えても見落としやすい。平時から街中の避難経路を意識して歩く習慣をつけておきましょう。 |
| `fac_003` | 食料と現金を確保しました！非常時に備えて、水・非常食（3日分）と現金を日頃から備蓄しておきましょう。 | 現金があれば、キャッシュレス決済が使えなくなっても慌てずに済んだかもしれない。 |
| `fac_004` | 受け入れ施設の情報を取得しました。平時から地域の一時避難場所の場所を確認しておけば、緊急時も素早く行動できます。 | 避難先の情報を事前に調べておけば、混乱した状況でも迷わず行動できたかもしれない。 |
| `fac_005` | 一時避難場所に辿り着きました！地域の避難訓練への参加や、家族との避難場所の事前共有が、いざという時に命を救います。 | （なし：ゲームの目的地のため未訪問ヒントを表示しない） |

フォールバック `buildHints()` のゲージ条件ヒント:

| 条件 | ヒントテキスト |
|------|------------|
| `money === 0` かつ `fac_003` 訪問済み | 小銭を常に持ち歩いていれば、緊急時の行動選択肢が広がったかもしれない。 |
| `charge === 0` | スマートフォンの充電を日ごろから心がけていれば、情報収集が途絶えなかったかもしれない。 |
| `mental < 30` | 複数の避難場所を事前に把握していれば、精神的な余裕が生まれたかもしれない。 |

#### 4.8.5 防災キーワードリスト（赤字ハイライト対象）

```
["モバイルバッテリー", "充電", "現金", "食料", "飲料水", "避難場所",
 "ハザードマップ", "帰宅困難", "SNS", "安否", "備蓄", "非常食",
 "防災", "避難訓練", "情報収集", "一時避難"]
```

#### 4.8.6 空データ時

- `生存のヒントがありません` を表示する。

#### 4.8.7 免責事項表示

- アドバイス（LLM・フォールバック問わず）が1件以上表示されている場合、その直下に免責テキストを小文字・グレーで表示する。
- 表示テキスト（LLM・ルールベース共通）: `※このアドバイスは不正確な情報を含む場合があります。実際の避難行動は自治体・公的機関の指示に従ってください。`
- スタイル: `text-subtext` クラス、`color: var(--color-base13)`（グレー）

### 4.9 アプリ紹介

- 既存表示を維持する（本文、外部リンク）。

### 4.10 ボタン群

1. SNS共有ボタン
   - 文言: `避難の記録をSNSに投稿する`
   - 動作: `setIsShareOpen(true)`

2. タイトルに戻るボタン
   - 文言: `タイトルに戻る`
   - 動作: 確認ダイアログ -> `resetAllAtom` -> `/` へ遷移

3. 確認ダイアログ
   - 全画面オーバーレイ（`position: fixed`）で表示する。
   - ダイアログ外タップでキャンセル。
   - ボタン: `キャンセル` / `やり直す`

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

## 7. サーバー連携仕様（`GET /api/results/stats`）

### 7.1 エンドポイント

```
GET /api/results/stats?finalDestination={facilityId}
```

- `finalDestination` は任意。省略時は `sameDestinationRate` を `0` で返す。

### 7.2 レスポンス

```json
{
  "total": 100,
  "finalDestinationDist": [
    { "area": "渋谷駅周辺", "count": 40, "rate": 40 },
    { "area": "道玄坂エリア", "count": 20, "rate": 20 }
  ],
  "sameDestinationRate": 12,
  "batteryRentalRate": 44,
  "cashWithdrawRate": 37,
  "noSnsRate": 4,
  "sameDestinationFacilityName": "ウィズ原宿"
}
```

- `total === 0` の場合: `finalDestinationDist: []`, 各rate `0`, `sameDestinationFacilityName: null`

### 7.3 施設マッピング定義（サーバー管理）

```js
// イベントID → 施設ID（最終到達地点算出用）
EVENT_LOCATION_MAP = {
  event_walk_001: "fac_001",
  event_walk_002: "fac_002",
  event_walk_003: "fac_003",
  event_walk_004: "fac_004",
  event_epilogue_001: "fac_005",
}

// 施設ID → エリア名
FAC_AREA_MAP = {
  fac_000: "渋谷駅周辺", fac_001: "渋谷駅周辺",
  fac_002: "道玄坂エリア", fac_003: "青山エリア",
  fac_004: "代々木エリア", fac_005: "原宿エリア",
}

// 施設ID → 施設名
FAC_NAME_MAP = {
  fac_000: "渋谷駅前", fac_001: "渋谷センター街",
  fac_002: "道玄坂", fac_003: "公園通り",
  fac_004: "代々木公園", fac_005: "ウィズ原宿",
}
```

### 7.4 最終到達地点の算出ロジック（サーバー）

`EventHistory` を `time` 昇順ソート後、末尾から走査して最初に `EVENT_LOCATION_MAP` にヒットした `id` の施設IDを最終到達地点とする。

### 7.5 通信失敗時の挙動

- API失敗時はエラー状態として `データを取得できませんでした` を表示する。
- ページ全体の表示はブロックしない。

## 8. コンポーネント責務

| コンポーネント | 責務 | Atom直接参照 |
| --- | --- | --- |
| `ResultPage` | 画面コンテナ、Atom読取、値算出、props受け渡し、ルーティング | あり |
| `StatsSummary` | 統計表示（純粋表示） | なし |
| `GaugeChart` | グラフ表示（純粋表示） | なし |
| `ResultTimelineItem` | タイムライン1行表示（純粋表示） | なし |
| `WorldChoices` | みんなの選択表示、API取得（副作用あり） | なし |
| `ShareModal` | モーダルUI・画像生成（純粋表示） | なし |
| `resultPageLogic` | 純粋関数群（算出・整形）の**唯一の定義場所** | なし |

## 9. 依存リソース

### 9.1 Atom

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

### 9.2 ローカルマスタ

- `eventList`
- `facilityList`
- `spotTypeList`

### 9.3 API

- `POST /api/results`（結果保存）
- `GET /api/results/stats`（統計取得）

注記:

- `GET /api/events/:id` と `GET /api/facilities` はゲーム進行側の仕様であり、ResultPage仕様の依存APIには含めない。

## 10. 受け入れ条件（QA）

1. 目次・章本文・ルーティング定義の間で `/result/share` の記述不整合がない。
2. 統計サマリーの総移動距離が `null` にならない。
3. `fac_000` は訪問施設数に含まれない。
4. `money` が百円単位で表示時に円換算される。
5. `gaugeHistory` 空配列時に例外系フォールバック表示となる。
6. タイムラインで `sns` は地点行を表示しない。
7. ShareModalはルーティング遷移なしで開閉できる。
8. Result保存失敗時でも `/result` へ遷移する。
9. `WorldChoices` がデータ取得中・失敗・zero件それぞれで正しく表示される。
9a. ドーナツグラフが2×2グリッドで表示される（1列縦並びにならない）。
9b. 円グラフのスライス内にエリア名ではなく % 数値が表示される（rate < 10 のスライスは省略）。
9b2. 円グラフ上部に「全 N 人のデータ」が表示される。
9b3. 凡例が `エリア名` のみで表示される（rate% は表示しない）。
9c. 円グラフ・凡例のエリア表示順が「渋谷駅周辺→道玄坂エリア→代々木エリア→青山エリア→その他」になっている。
9d. API の `"不明"` が `"その他"` として表示される。
9e. ドーナツの「SNSで情報を集めた」が `100 - noSnsRate` の値で表示される。
10. 確認ダイアログがスクロール位置に依存せず画面中央に表示される。
11. `resultPageLogic.js` 以外に `facilityHintMap` / `buildHints` / `getFlavorText` の実装が存在しない。
12. ダミー画像（`dummy-result.png`）が非表示（`display: none` 相当）になっている。

## 11. 文書運用ルール

1. 仕様変更時は本書（What）を先に更新する。
2. 実装詳細変更時は本書の第12章（設計）を更新する。
3. Issue対応やテスト結果は `docs/tasks/` の該当タスクに追記する。
4. 本書に「完了済みIssue履歴」や「テスト実行ログ」を混在させない。

## 12. 設計（How）

### 12.1 設計方針

1. 算出ロジックは `client/src/utils/resultPageLogic.js` に集約し、UIコンポーネントから分離する。
2. `ResultPage` はコンテナとして Atom を読み、表示コンポーネントへ props を渡す。
3. 表示コンポーネントは副作用を持たない（`WorldChoices` を除く）。

### 12.2 ロジック集約ルール（重複禁止）

以下の関数・定数は `resultPageLogic.js` のみで定義し、`ResultPage.jsx` はインポートして使う。
`ResultPage.jsx` 内にインライン再定義を行わない。

| 対象 | 定義場所 |
|------|---------|
| `facilityHintMap` | `resultPageLogic.js` |
| `buildHints` | `resultPageLogic.js` |
| `getFlavorText` | `resultPageLogic.js` |
| `flavorTextMap` | `resultPageLogic.js`（内部使用） |
| `calcElapsedTime` | `resultPageLogic.js` |
| `buildTimelineData` | `resultPageLogic.js` |
| `calcTotalDistance` | `resultPageLogic.js` |
| `calcVisitedCount` | `resultPageLogic.js` |

### 12.3 データフロー

```text
Atom / ローカルマスタ
  -> ResultPage（算出・整形）
    -> StatsSummary / GaugeChart / ResultTimelineItem / WorldChoices / ShareModal
```

- 施設名・施設タイプは `eventHistoryAtom` 単体では復元できないため、`eventList` / `facilityList` / `spotTypeList` を突合する。

### 12.4 算出ロジック設計

#### 12.4.1 総移動距離

1. `visitedFacilities` の隣接ペアごとに Haversine 距離（km）を合算する。
2. 小数点1桁で丸める。
3. 不正IDまたは座標欠損セグメントはスキップする。

#### 12.4.2 訪問施設数

- `fac_000` は開始地点なので除外する。

#### 12.4.3 経過時間

- `resultPageLogic.js` の `calcElapsedTime(currentTime, startTime)` を使う。
- `startTime` は `ResultPage` マウント時に1回だけ生成する（`useMemo` で固定）。
- 毎レンダリングで `new Date()` を呼んで再生成しない。

#### 12.4.4 ヒント選定

1. `resultPageLogic.js` の `buildHints(visitedFacilities, money, charge, mental)` を使う。
2. `timelineData.length === 0` の場合は `buildHints` を呼ばず空配列を返す（呼び出し元 `ResultPage` で制御）。
3. 3件以上はシャッフルして2件選択する。
4. 0件の場合は `生存のヒントがありません` を表示する（フォールバックヒントは使わない）。

### 12.5 `gaugeSteps` と `charge` / `battery` の扱い

#### 12.5.1 背景

- イベント定義（`eventList` / API `gaugeChange`）は `battery` キーを使用。
- 表示系（`gaugeHistory`, ResultPage, GaugeChart）は `charge` キーを使用。

#### 12.5.2 実装ルール

1. イベント処理段階で `battery` を `charge` に適用して確定値を作る。
2. `gaugeHistory` への記録は常に `charge` キーで保存する。
3. ResultPage 配下は `battery` を直接参照しない。

#### 12.5.3 後方互換

1. `gaugeSteps` がないイベントは `gaugeChange` を1ステップとして扱う。
2. `gaugeSteps` があるイベントは各ステップを同一時刻で順次適用する。

### 12.6 確認ダイアログ実装

- `position: fixed` を使い、スクロール位置に依存しない全画面オーバーレイを実現する。
- `position: absolute` は使用しない。

### 12.7 `WorldChoices` コンポーネント設計

1. `finalDestination` を props として受け取り、`useEffect` で `GET /api/results/stats` を取得する。
2. `sameDestinationFacilityName` を含むラベルの改行は、`<Text whiteSpace="pre-line">` + 文字列中の `\n` で表現する。
3. 円グラフ・ドーナツグラフは外部ライブラリなし raw SVG で実装する。

### 12.8 ShareModal 実装設計

#### 12.8.1 Canvas 生成

1. 画像サイズは `1080x1920`。
2. 出力形式は PNG。
3. 地図は含めない。

#### 12.8.2 レイアウト設計

1. 固定座標値への依存を避け、比率ベースでレイアウトする。
2. セクションごとに高さ比率を定義し、縦方向フローで配置する。

#### 12.8.3 フォントロード

1. 描画前に `document.fonts.ready` を待機する。
2. フォールバック時は `ctx.measureText` で再レイアウトして重なりを防ぐ。

#### 12.8.4 保存挙動

1. 通常ブラウザは `a[download]` 経由。
2. iOS Safari はプレビューURL表示 + 長押し保存誘導。
3. `isSaving` フラグで多重起動防止。

### 12.9 API送信の実装設計

1. 送信箇所は `useMonologueLogic` の `postResultIfNeeded(nextPath)`。
2. `/result` 遷移時のみ送信する。
3. 失敗時は警告ログのみで遷移を継続する。

### 12.10 将来対応（非対象）

1. `eventHistoryAtom` に `type`, `locationId` を保持し、`eventList` 突合を減らす。
2. `POST /api/results` に冪等性キーを導入する。
3. Share画像に地図を含める場合は Static Maps API 等の別設計を行う。
4. `AgeType/Gender/ResidenceType` の送信値を表示ラベルから正規化キーへ統一する。
5. `GET /api/results/stats` のパフォーマンス改善（データ増加時のメモリ対策）。
