# OSM移行計画書

- 文書ID: `osm-migration-plan`
- バージョン: `1.0`
- 作成日: `2026-03-09`
- 担当: しま
- 作業ブランチ: `feature_osm-migration_shima`（`feature_resultpage_shima` から分岐）

---

## 1. 目的

Google Maps JavaScript API から OpenStreetMap（Leaflet）に移行し、APIキー不要の地図機能を実現する。

---

## 2. 対象コンポーネント

| コンポーネント | ファイル | 用途 |
|--------------|---------|------|
| GoogleMapComponent | `client/src/components/game-page/GoogleMap.jsx` | ゲーム画面メインマップ（施設マーカー・GPS表示） |
| RouteMap | `client/src/components/game-page/RouteMap.jsx` | リザルト画面の移動経路（ポリライン） |

---

## 3. ライブラリ変更

| 操作 | ライブラリ |
|------|-----------|
| 削除 | `@react-google-maps/api` |
| 追加 | `leaflet` + `react-leaflet` |

```bash
cd client
npm uninstall @react-google-maps/api
npm install leaflet react-leaflet
```

---

## 4. API 対応表

| Google Maps | Leaflet | 備考 |
|-------------|---------|------|
| `useJsApiLoader` | 不要 | Leaflet はバンドル同梱 |
| `<GoogleMap>` | `<MapContainer>` + `<TileLayer>` | OSMタイル URL 指定 |
| `<Marker icon={symbol}>` | `<Marker icon={L.divIcon(...)}>` | SVGをインライン埋め込み |
| `<Circle options>` | `<Circle pathOptions>` | props名変更のみ |
| `<Polyline path={[{lat,lng}]}>` | `<Polyline positions={[[lat,lng]]}>` | 座標形式変換必要 |
| `map.fitBounds()` | `useMap().fitBounds()` | `BoundsFitter` 子コンポーネントで実装 |
| `gestureHandling:"none"` | `dragging={false} scrollWheelZoom={false}` 等 | MapContainer の props |

---

## 5. 変更ファイル一覧

| ファイル | 変更内容 |
|---------|---------|
| `client/package.json` | ライブラリ入れ替え |
| `client/src/index.js` | `import 'leaflet/dist/leaflet.css'` を先頭に追加（必須） |
| `client/src/components/game-page/GoogleMap.jsx` | react-leaflet に全面書き換え |
| `client/src/components/game-page/RouteMap.jsx` | react-leaflet に全面書き換え |
| `client/.env` | 変更なし（APIキーは残す） |
| `client/.env.example` | 変更なし（APIキーは残す） |

---

## 6. 実装上の注意点

### 6.1 Leaflet CSS の必須インポート

`client/src/index.js` の先頭に追加しないと地図タイルが崩れる。

```js
import 'leaflet/dist/leaflet.css';
```

### 6.0 タイルレイヤー仕様

**OSM 標準タイル** を使用する（APIキー不要・無償）。

- 実世界の建物名・施設名・街路名が表示されるため、渋谷エリアの地理的文脈が出る
- `GoogleMap.jsx` と `RouteMap.jsx` の両方に適用する

```js
// TileLayer 設定
url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
```

### 6.1.1 マーカースタイル仕様

- 施設名ラベルは**表示しない**（タップ時の MapSpotInfo カードで確認する）
- ピンに `drop-shadow` フィルタを付与してモダンな見た目にする
- GPS ドットも `drop-shadow` を付与する

```js
// ピン SVG に CSS drop-shadow を追加
`<div style="filter:drop-shadow(0 2px 4px rgba(0,0,0,0.35))">
   <svg ...>ピン</svg>
 </div>`

### 6.2 カスタムマーカー → `L.divIcon`

現行の `getMarkerIcon()` は Google Maps SVG Symbol 形式。Leaflet は `L.divIcon` でインライン SVG を使用する。

```js
// 施設マーカー（色分け）
L.divIcon({
  html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 35 51.5313" width="21" height="31">
           <path d="${MAPMARKER_SVG_PATH}" fill="${color}" stroke="#fff" stroke-width="1.2"/>
         </svg>`,
  className: '',
  iconSize: [21, 31],
  iconAnchor: [10.5, 31],
})

// GPS ドット
L.divIcon({
  html: '<div style="width:16px;height:16px;border-radius:50%;background:#393994;border:2px solid #fff;box-sizing:border-box;"></div>',
  className: '',
  iconSize: [16, 16],
  iconAnchor: [8, 8],
})
```

### 6.3 fitBounds の実装（RouteMap）

`useMap()` は MapContainer の子コンポーネント内でしか使えないため、専用の内部コンポーネントを作る。

```jsx
const BoundsFitter = ({ points }) => {
  const map = useMap();
  useEffect(() => {
    if (points.length < 1) return;
    const bounds = L.latLngBounds(points.map(({ lat, lng }) => [lat, lng]));
    map.fitBounds(bounds, { padding: [40, 30] });
  }, [map, points]);
  return null;
};
```

### 6.4 Polyline 座標形式の変換

```js
// 変更前（Google Maps）
const polylinePath = points.map(({ lat, lng }) => ({ lat, lng }));

// 変更後（Leaflet）
const polylinePositions = points.map(({ lat, lng }) => [lat, lng]);
```

### 6.5 マーカーイベントハンドラ

```jsx
// 変更前
<Marker onClick={() => handleClick(facility)} />

// 変更後
<Marker eventHandlers={{ click: () => handleClick(facility) }} />
```

---

## 7. タスク管理

| タスク | ファイル | ステータス |
|--------|---------|-----------|
| RouteMap + GoogleMap 同時移行 | `docs/tasks/task-0309-01-osm-migration.md` | 未着手 |

> **注意:** `GoogleMap.jsx` と `RouteMap.jsx` は `useJsApiLoader` の `id: "google-map-script"` を共有しているため、**2ファイルを同一コミットでまとめて移行する**。片方だけ移行した中間状態ではビルドが壊れる。

---

## 8. 検証項目

### GoogleMap（ゲーム画面）

| 確認項目 | 期待結果 |
|---------|---------|
| ActionPage・MapPage で地図表示 | OSM タイルが渋谷エリアに表示される |
| 施設マーカーの色分け | 現在地=紫 / 選択中=赤 / 訪問済み=グレー / 移動可能=オレンジ |
| マーカークリック | 施設選択が動作する |
| GPS位置表示 | 青ドット + 精度円が表示される |

### RouteMap（リザルト画面）

| 確認項目 | 期待結果 |
|---------|---------|
| 地図表示 | OSM タイルが表示される |
| ポリライン表示 | 赤線（#e63946）が正しいルートで表示される |
| fitBounds | 全訪問施設が画面内に収まる |
| 操作無効 | ドラッグ・スクロールズーム不可 |
| フォールバック | 訪問施設1件以下で「移動記録がありません」 |

### 共通

| 確認項目 | 期待結果 |
|---------|---------|
| ビルドエラーなし | `npm start` が通る |
| `window.google` 参照なし | コード内に残存なし・コンソールエラーなし |
