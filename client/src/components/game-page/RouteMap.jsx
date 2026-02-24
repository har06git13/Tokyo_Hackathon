import React, { useCallback } from "react";
import { Text, Box } from "@chakra-ui/react";
import { GoogleMap, Polyline, useJsApiLoader } from "@react-google-maps/api";
import PropTypes from "prop-types";

// コンポーネント外でライブラリを定義（レンダリング毎の配列再生成を防ぐ）
// GoogleMapComponent（ゲームページ）と同じ id・libraries を使用し競合を防ぐ
const ROUTE_MAP_LIBRARIES = ["places"];



// マップ設定
const MAP_CENTER = { lat: 35.6581, lng: 139.7017 };
const MAP_OPTIONS = {
  disableDefaultUI: true,
  gestureHandling: "none",
  clickableIcons: false,
  keyboardShortcuts: false,
};
const RouteMap = ({ visitedFacilities, facilityList, mapBorderRadius = "1vh" }) => {
const MAP_CONTAINER_STYLE_BASE = {
  width: "100%",
  height: "22vh",
};

//
  const { isLoaded, loadError } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY || "",
    libraries: ROUTE_MAP_LIBRARIES,
  });

  // 訪問施設の座標リストを構築（Hooks のルール: 条件分岐前に計算）
  const points = visitedFacilities
    .map((id) => facilityList.find((f) => f.id === id))
    .filter((f) => f?.coordinates)
    .map((f) => ({
      id: f.id,
      name: f.name,
      lat: Number(f.coordinates.lat),
      lng: Number(f.coordinates.lng),
    }));

  const polylinePath = points.map(({ lat, lng }) => ({ lat, lng }));

  // マップロード時に全マーカーが収まるよう fitBounds で自動調整（仕様書 3.4）
  const handleMapLoad = useCallback(
    (map) => {
      if (points.length < 1) return;
      const bounds = new window.google.maps.LatLngBounds();
      points.forEach(({ lat, lng }) => bounds.extend({ lat, lng }));
      map.fitBounds(bounds, { top: 40, right: 30, bottom: 30, left: 30 });
    },
    [points]
  );

  // フォールバック: 移動なし（fac_000 のみ）
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
      {/* ローディング */}
      {!isLoaded && !loadError && (
        <Box width="100%" height="22vh" display="flex" alignItems="center" justifyContent="center"
          backgroundColor="var(--color-base12)" borderRadius="1vh"
        >
          <Text className="text-maintext" color="var(--color-base13)">
            🗺️ Loading Google Maps...
          </Text>
        </Box>
      )}

      {/* API ロードエラー */}
      {loadError && (
        <Box width="100%" height="22vh" display="flex" alignItems="center" justifyContent="center"
          backgroundColor="var(--color-base12)" borderRadius="1vh"
        >
          <Text className="text-maintext" color="var(--color-base13)">
            マップの読み込みに失敗しました
          </Text>
        </Box>
      )}

      {/* マップ表示 */}
      {isLoaded && !loadError && (
        <GoogleMap
          mapContainerStyle={{ ...MAP_CONTAINER_STYLE_BASE, borderRadius: mapBorderRadius }}
          center={MAP_CENTER}
          zoom={14}
          options={MAP_OPTIONS}
          onLoad={handleMapLoad}
        >
          {/* 移動ルートポリライン */}
          {polylinePath.length >= 2 && (
            <Polyline
              path={polylinePath}
              options={{
                strokeColor: "#e63946",
                strokeWeight: 4,
                strokeOpacity: 0.8,
                geodesic: false,
              }}
            />
          )}
        </GoogleMap>
      )}
    </Box>
  );
};

RouteMap.propTypes = {
  visitedFacilities: PropTypes.arrayOf(PropTypes.string).isRequired,
  facilityList: PropTypes.array.isRequired,
  mapBorderRadius: PropTypes.string,
};

export default RouteMap;
