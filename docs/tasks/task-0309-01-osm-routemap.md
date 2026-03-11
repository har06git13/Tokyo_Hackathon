# タスク: RouteMap を react-leaflet に移行

## ステータス: 未着手

## 概要

`RouteMap.jsx` の地図ライブラリを `@react-google-maps/api` から `react-leaflet` に移行する。

> **注意:** `task-0309-02-osm-googlemap.md` と**同一コミット**でまとめて反映する。
> 片方だけ移行した中間状態では `useJsApiLoader` の競合でビルドが壊れる。

## 変更ファイル

| ファイル | 変更内容 |
|---------|---------|
| `client/package.json` | `@react-google-maps/api` 削除、`leaflet` + `react-leaflet` 追加 |
| `client/src/index.js` | `import 'leaflet/dist/leaflet.css'` を先頭に追加 |
| `client/src/components/game-page/RouteMap.jsx` | react-leaflet に書き換え |

## 現状コードの削除箇所

| 行 | 削除する内容 |
|----|------------|
| 3 | `import { GoogleMap, Polyline, useJsApiLoader } from "@react-google-maps/api"` |
| 8 | `const ROUTE_MAP_LIBRARIES = ["places"]` |
| 14–19 | `MAP_OPTIONS`（Leaflet では MapContainer の props で代替） |
| 27–31 | `useJsApiLoader` フック |
| 44 | `const polylinePath = ...`（`polylinePositions` に変換） |
| 47–55 | `handleMapLoad`（`BoundsFitter` に置換） |
| 73–92 | `isLoaded` / `loadError` の表示ブロック |
| 95–116 | `<GoogleMap>` ブロック（`<MapContainer>` に置換） |

## 実装後のコード構成

```jsx
import React, { useEffect } from "react";
import { Text, Box } from "@chakra-ui/react";
import L from "leaflet";
import { MapContainer, TileLayer, Polyline, useMap } from "react-leaflet";
import PropTypes from "prop-types";

const MAP_CENTER = [35.6581, 139.7017];

// fitBounds 用内部コンポーネント（useMap は MapContainer の子でしか使えない）
const BoundsFitter = ({ points }) => {
  const map = useMap();
  useEffect(() => {
    if (points.length < 1) return;
    const bounds = L.latLngBounds(points.map(({ lat, lng }) => [lat, lng]));
    map.fitBounds(bounds, { padding: [40, 30] });
  }, [map, points]);
  return null;
};

const RouteMap = ({ visitedFacilities, facilityList, mapBorderRadius = "1vh" }) => {
  const MAP_CONTAINER_STYLE_BASE = { width: "100%", height: "22vh" };

  const points = visitedFacilities
    .map((id) => facilityList.find((f) => f.id === id))
    .filter((f) => f?.coordinates)
    .map((f) => ({
      id: f.id,
      name: f.name,
      lat: Number(f.coordinates.lat),
      lng: Number(f.coordinates.lng),
    }));

  const polylinePositions = points.map(({ lat, lng }) => [lat, lng]);

  if (visitedFacilities.length <= 1) {
    return (
      <Box width="100%" display="flex" justifyContent="center" alignItems="center">
        <Text className="text-maintext" color="var(--color-base13)">
          移動記録がありません
        </Text>
      </Box>
    );
  }

  return (
    <Box width="100%" display="flex" justifyContent="center" alignItems="center">
      <MapContainer
        center={MAP_CENTER}
        zoom={14}
        dragging={false}
        scrollWheelZoom={false}
        doubleClickZoom={false}
        zoomControl={false}
        touchZoom={false}
        keyboard={false}
        style={{ ...MAP_CONTAINER_STYLE_BASE, borderRadius: mapBorderRadius }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <BoundsFitter points={points} />
        {polylinePositions.length >= 2 && (
          <Polyline
            positions={polylinePositions}
            pathOptions={{
              color: "#e63946",
              weight: 4,
              opacity: 0.8,
            }}
          />
        )}
      </MapContainer>
    </Box>
  );
};

RouteMap.propTypes = {
  visitedFacilities: PropTypes.arrayOf(PropTypes.string).isRequired,
  facilityList: PropTypes.array.isRequired,
  mapBorderRadius: PropTypes.string,
};

export default RouteMap;
```

## 実装チェックリスト

- [ ] npm でライブラリ入れ替え（task-0309-02 と同時）
- [ ] `leaflet/dist/leaflet.css` を index.js に追加
- [ ] RouteMap.jsx を react-leaflet に書き換え
- [ ] OSM タイルが表示される
- [ ] ポリラインが赤線（#e63946）で表示される
- [ ] fitBounds で全施設が収まる
- [ ] マップ操作が無効（ドラッグ不可）
- [ ] `visitedFacilities.length <= 1` でフォールバック文言が表示される

## 関連

- 計画書: `docs/osm-migration-plan.md`
- 同時コミット対象: `docs/tasks/task-0309-02-osm-googlemap.md`
