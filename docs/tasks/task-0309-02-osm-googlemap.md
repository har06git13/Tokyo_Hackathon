# タスク: GoogleMapComponent を react-leaflet に移行

## ステータス: 未着手

## 概要

`GoogleMap.jsx` の地図ライブラリを `@react-google-maps/api` から `react-leaflet` に移行する。

> **注意:** `task-0309-01-osm-routemap.md` と**同一コミット**でまとめて反映する。
> 片方だけ移行した中間状態では `useJsApiLoader` の競合でビルドが壊れる。

## 変更ファイル

| ファイル | 変更内容 |
|---------|---------|
| `client/src/components/game-page/GoogleMap.jsx` | react-leaflet に書き換え |

## 現状コードの削除箇所

| 行 | 削除する内容 |
|----|------------|
| 2 | `import { GoogleMap, Marker, InfoWindow, useJsApiLoader, Circle } from '@react-google-maps/api'` |
| 16 | `const GOOGLE_MAPS_LIBRARIES = ['places']` |
| 35–55 | `getMarkerIcon()`（`L.divIcon` 版に書き換え） |
| 135–139 | `useJsApiLoader` フック |
| 141–148 | `onLoad` / `onUnmount` の `useCallback` |
| 172–181 | APIキー未設定エラー表示ブロック |
| 183 | `effectiveLoadError` |
| 199–203 | `!isApiLoaded` のローディング表示 |
| 205–212 | `effectiveLoadError` のエラー表示 |
| 214 | `isApiLoaded && !effectiveLoadError &&` のガード |
| 280–287 | `window.google.maps.SymbolPath.CIRCLE` を使った GPS ドットアイコン |
| 293–303 | `InfoWindow`（未使用だが削除） |

## 主要な書き換え内容

### getMarkerIcon() → L.divIcon

```js
import L from 'leaflet';

const getMarkerIcon = (facility, isSelected, isVisited, isCurrentLocation) => {
  const color = isCurrentLocation
    ? "#393994"
    : isSelected
    ? "#e63946"
    : isVisited
    ? "#a6a6a6"
    : "#f4a261";

  return L.divIcon({
    html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 35 51.5313" width="21" height="31">
             <path d="${MAPMARKER_SVG_PATH}" fill="${color}" stroke="#fff" stroke-width="1.2"/>
           </svg>`,
    className: '',
    iconSize: [21, 31],
    iconAnchor: [10.5, 31],
  });
};
```

### GPS ドットアイコン（window.google.maps.SymbolPath.CIRCLE を置換）

```js
const GPS_DOT_ICON = L.divIcon({
  html: '<div style="width:16px;height:16px;border-radius:50%;background:#393994;border:2px solid #fff;box-sizing:border-box;"></div>',
  className: '',
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});
```

### MapContainer の構成

```jsx
import { MapContainer, TileLayer, Marker, Circle } from 'react-leaflet';

<MapContainer
  center={[35.6581, 139.7017]}
  zoom={14}
  zoomControl={showControls}
  scrollWheelZoom={showControls}
  style={containerStyle || defaultMapContainerStyle}
>
  <TileLayer
    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
  />

  {/* 施設マーカー */}
  {facilities
    .filter((f) => f.id !== 'fac_000')
    .map((facility) => {
      // ... ステータス判定ロジックは既存を流用 ...
      return (
        <Marker
          key={facility.id}
          position={[pos.lat, pos.lng]}
          title={facility.name}
          icon={getMarkerIcon(facility, isSelected, isVisited, isCurrentLocation)}
          eventHandlers={{ click: () => handleMarkerClick(facility) }}
        />
      );
    })}

  {/* GPS精度円 */}
  {hasDeviceGps && Number.isFinite(deviceLocation.accuracy) && deviceLocation.accuracy > 0 && (
    <Circle
      center={[deviceLocation.lat, deviceLocation.lng]}
      radius={deviceLocation.accuracy}
      pathOptions={{
        fillColor: '#393994',
        fillOpacity: 0.15,
        color: '#393994',
        opacity: 0.4,
        weight: 1,
      }}
    />
  )}

  {/* GPS ドット */}
  {hasDeviceGps && (
    <Marker
      key="device-location"
      position={[deviceLocation.lat, deviceLocation.lng]}
      title="現在地 (GPS)"
      icon={GPS_DOT_ICON}
      zIndexOffset={1000}
    />
  )}
</MapContainer>
```

### マーカークリックイベント

```jsx
// 変更前
<Marker onClick={() => handleMarkerClick(facility)} />

// 変更後
<Marker eventHandlers={{ click: () => handleMarkerClick(facility) }} />
```

### isLoaded state の削除

`mapRef` / `isLoaded` state（`setIsLoaded`）は `onLoad` callback 用だったため不要になる。削除する。
`mapRef` を使っている箇所がないことを確認してから削除する。

## 実装チェックリスト

- [ ] `import` を react-leaflet + leaflet に変更
- [ ] `useJsApiLoader` / `onLoad` / `onUnmount` / `isLoaded` state を削除
- [ ] APIキー未設定エラー表示ブロックを削除
- [ ] `getMarkerIcon()` を `L.divIcon` に書き換え
- [ ] `GPS_DOT_ICON` を `L.divIcon` で定義
- [ ] `<GoogleMap>` → `<MapContainer>` + `<TileLayer>` に変更
- [ ] `<Marker onClick>` → `eventHandlers={{ click }}` に変更
- [ ] `<Circle options>` → `<Circle pathOptions>` に変更
- [ ] `<InfoWindow>` ブロック（false && ...）を削除
- [ ] ActionPage・MapPage で OSM タイルが渋谷エリアに表示される
- [ ] 施設マーカーの色分けが正しい（紫/赤/グレー/オレンジ）
- [ ] マーカークリックで施設選択が動作する
- [ ] GPS 青ドット + 精度円が表示される
- [ ] `showControls={false}` でズーム UI が非表示になる

## 関連

- 計画書: `docs/osm-migration-plan.md`
- 同時コミット対象: `docs/tasks/task-0309-01-osm-routemap.md`
