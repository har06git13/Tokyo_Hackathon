# タスク: 「世界の選択」セクションの実装

## ステータス: 実装済み（レビュー待ち）

## 概要

リザルトページに「世界の選択」セクションを追加する。
他プレイヤーの統計を DB の Results コレクションから取得し、円グラフ・ドーナツグラフで表示する。

---

## UI 仕様

```
┌─────────────────────────────────┐
│ みんなの選択                      │
├─────────────────────────────────┤
│         最終到達地点              │
│       [円グラフ（SVG）]           │
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

- 「すべての世界の選択を見る」ボタンは **実装しない**
- データ取得中はローディング表示
- 取得失敗・total=0 の場合は「データがまだありません」を **左詰め** で表示
- エラーテキストも **左詰め** で表示
- セクション配置: 「防災に向けてのヒント」の **直前**（セクション 6 と入れ替え）

---

## データ定義

### 施設 → エリア マッピング（サーバー側で定義）

| facilityId | エリア名 | 色 |
|-----------|---------|---|
| fac_000, fac_001 | 渋谷駅周辺 | #e63946 |
| fac_002 | 道玄坂エリア | #393994 |
| fac_003 | 青山エリア | #74c6cc |
| fac_004 | 代々木エリア | #f4a261 |
| fac_005 | 原宿エリア | #f1a7b5 |

### ドーナツグラフ 4 項目の定義

| ラベル | 定義 |
|-------|------|
| 同一の最終到達地点 {施設名} | 全 Results のうち、クエリパラメータ `finalDestination` と同じ最終到達施設だった割合 |
| モバイルバッテリーをレンタルした | EventHistory に `event_walk_001`（fac_001）を含む割合 |
| 現金を下ろした | EventHistory に `event_walk_003`（fac_003）を含む割合 |
| 人と一度も話さなかった | EventHistory に `event_sns_*` を **1件も含まない** 割合 |

### 最終到達地点の算出

DB の `EventHistory` は `{id: string, time: ISODate}` のみを保持し、`type` や `locationId` は格納されていない。
サーバー側で以下のマッピングテーブルを使い、`id` から施設 ID を導出する。

```js
// id に含まれないイベント（event_prologue_*, event_sns_*, event_time_*）はマップに存在しないため自動的に除外される
const EVENT_LOCATION_MAP = {
  event_walk_001: "fac_001",
  event_walk_002: "fac_002",
  event_walk_003: "fac_003",
  event_walk_004: "fac_004",
  event_epilogue_001: "fac_005",
};
```

`EventHistory` を `time` 昇順ソート後、末尾から走査して最初に `EVENT_LOCATION_MAP` にヒットした `id` の施設 ID を最終到達地点とする。

---

## バックエンド実装

### エンドポイント

`GET /api/results/stats?finalDestination=fac_005`

#### レスポンス（JSON）

```json
{
  "total": 100,
  "finalDestinationDist": [
    { "area": "渋谷駅周辺", "count": 40, "rate": 40 },
    { "area": "道玄坂エリア", "count": 20, "rate": 20 },
    { "area": "青山エリア", "count": 18, "rate": 18 },
    { "area": "代々木エリア", "count": 10, "rate": 10 },
    { "area": "原宿エリア", "count": 12, "rate": 12 }
  ],
  "sameDestinationRate": 12,
  "batteryRentalRate": 44,
  "cashWithdrawRate": 37,
  "noSnsRate": 4,
  "sameDestinationFacilityName": "ウィズ原宿"
}
```

#### 実装場所

`server/index.js` に追加:

```js
// 施設→エリア マッピング
const FAC_AREA_MAP = {
  fac_000: "渋谷駅周辺", fac_001: "渋谷駅周辺",
  fac_002: "道玄坂エリア", fac_003: "青山エリア",
  fac_004: "代々木エリア", fac_005: "原宿エリア",
};

// イベントID→施設ID マッピング（最終到達地点算出用）
const EVENT_LOCATION_MAP = {
  event_walk_001: "fac_001", event_walk_002: "fac_002",
  event_walk_003: "fac_003", event_walk_004: "fac_004",
  event_epilogue_001: "fac_005",
};

// 施設ID→施設名
const FAC_NAME_MAP = {
  fac_000: "渋谷駅前", fac_001: "渋谷センター街",
  fac_002: "道玄坂", fac_003: "公園通り",
  fac_004: "代々木公園", fac_005: "ウィズ原宿",
};

app.get('/api/results/stats', async (req, res, next) => {
  try {
    const finalDestination = req.query.finalDestination ?? null;
    const allResults = await Results.find({}).toArray();
    const total = allResults.length;
    if (total === 0) return res.json({ total: 0, finalDestinationDist: [], sameDestinationRate: 0, batteryRentalRate: 0, cashWithdrawRate: 0, noSnsRate: 0, sameDestinationFacilityName: null });

    // 各 Result の最終到達施設を算出
    const getFinalFac = (hist) => {
      if (!Array.isArray(hist)) return null;
      // time 昇順ソート後、最後の walk/epilogue イベントを取得
      const sorted = [...hist].sort((a, b) => new Date(a.time) - new Date(b.time));
      for (let i = sorted.length - 1; i >= 0; i--) {
        const fac = EVENT_LOCATION_MAP[sorted[i].id];
        if (fac) return fac;
      }
      return null;
    };

    // 最終到達地点分布
    const areaCounts = {};
    for (const r of allResults) {
      const fac = getFinalFac(r.EventHistory);
      const area = FAC_AREA_MAP[fac] ?? "不明";
      areaCounts[area] = (areaCounts[area] ?? 0) + 1;
    }
    const finalDestinationDist = Object.entries(areaCounts).map(([area, count]) => ({
      area, count, rate: Math.round(count / total * 100),
    }));

    // ドーナツ: 同一最終到達地点
    const sameCount = finalDestination
      ? allResults.filter(r => getFinalFac(r.EventHistory) === finalDestination).length
      : 0;

    // ドーナツ: バッテリー
    const batteryCount = allResults.filter(r =>
      Array.isArray(r.EventHistory) && r.EventHistory.some(e => e.id === "event_walk_001")
    ).length;

    // ドーナツ: 現金
    const cashCount = allResults.filter(r =>
      Array.isArray(r.EventHistory) && r.EventHistory.some(e => e.id === "event_walk_003")
    ).length;

    // ドーナツ: SNS なし（誰とも話さなかった）
    const noSnsCount = allResults.filter(r =>
      !Array.isArray(r.EventHistory) || !r.EventHistory.some(e => e.id?.startsWith("event_sns_"))
    ).length;

    res.json({
      total,
      finalDestinationDist,
      sameDestinationRate: Math.round(sameCount / total * 100),
      batteryRentalRate: Math.round(batteryCount / total * 100),
      cashWithdrawRate: Math.round(cashCount / total * 100),
      noSnsRate: Math.round(noSnsCount / total * 100),
      sameDestinationFacilityName: FAC_NAME_MAP[finalDestination] ?? null,
    });
  } catch (e) { next(e); }
});
```

---

## フロントエンド実装

### 新規ファイル

`client/src/components/game-page/WorldChoices.jsx`

#### Props

```js
WorldChoices.propTypes = {
  finalDestination: PropTypes.string,  // 現在のプレイヤーの最終到達施設ID（例: "fac_005"）
};
```

#### データ取得

```js
useEffect(() => {
  fetch(`/api/results/stats?finalDestination=${finalDestination}`)
    .then(r => r.json())
    .then(setStats)
    .catch(() => setError(true));
}, [finalDestination]);
```

#### グラフ（SVG）

**円グラフ（PieChart）:**
- 外部ライブラリなし、raw SVG で実装
- 各スライスは `<path>` の arc コマンドで描画
- スライス内にエリア名テキストを表示（小さいスライスは省略）

**ドーナツグラフ（DonutChart）:**
- 外部ライブラリなし、raw SVG で実装
- `strokeDasharray` / `strokeDashoffset` を使った円環
- 中央に大きな % 数値
- 下部にラベル

#### 色定義

```js
const AREA_COLORS = {
  "渋谷駅周辺": "#e63946",
  "道玄坂エリア": "#393994",
  "青山エリア": "#74c6cc",
  "代々木エリア": "#f4a261",
  "原宿エリア": "#f1a7b5",
  "不明": "#cccccc",
};
```

### ResultPage.jsx への統合

`visitedFacilitiesAtom`（Jotai）の末尾の要素（`fac_000` を除く）を `finalDestination` として渡す。
これは DB の Results から算出する最終到達地点と同じ施設 ID になる。

```jsx
const finalDestination = [...visitedFacilities].reverse().find(id => id !== "fac_000") ?? "fac_000";

// セクション 6（防災に向けてのヒント）の直前に追加
<WorldChoices finalDestination={finalDestination} />
```

### export 追加

`client/src/components/game-page/index.js` に `WorldChoices` を追加。

---

## 変更ファイル一覧

| ファイル | 変更内容 |
|---------|---------|
| `server/index.js` | `GET /api/results/stats` エンドポイントを追加 |
| `client/src/components/game-page/WorldChoices.jsx` | 新規作成 |
| `client/src/components/game-page/index.js` | WorldChoices を export に追加 |
| `client/src/pages/ResultPage.jsx` | WorldChoices をインポート・配置 |

---

## 検証方法

1. DB に Results が 0 件のとき「データがまだありません」が表示される
2. DB に Results が存在するとき円グラフ・ドーナツグラフが表示される
3. 各ドーナツの % が DB の実データと一致する
4. ローディング中はスピナー/テキストが表示される
5. API エラー時は「データを取得できませんでした」が表示される
