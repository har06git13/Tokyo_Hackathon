import React, { useState, useCallback, useRef } from 'react';
import { GoogleMap, Marker, InfoWindow, useJsApiLoader, Circle } from '@react-google-maps/api';
import { Box, VStack } from '@chakra-ui/react';
import { facilityList, eventList } from '../../temporary-database';
import { useAtom } from 'jotai';
import { deviceLocationAtom, geolocationErrorAtom } from '../../atoms/playerAtoms';
import { useGeolocation } from '../../hooks/useGeolocation';

// マップのスタイル設定（デフォルト）
const defaultMapContainerStyle = {
  width: "100%",
  height: "100%",
  borderRadius: "8px",
};

// 渋谷駅周辺の初期座標
const center = {
  lat: 35.6581, // 渋谷駅の緯度
  lng: 139.7017, // 渋谷駅の経度
};

// マップオプション
const options = {
  disableDefaultUI: false,
  zoomControl: true,
  streetViewControl: false,
  mapTypeControl: false,
  fullscreenControl: false,
};

// 凡例と同一のSVGパス（MapmarkerIcon と同じ形状）
const MAPMARKER_SVG_PATH =
  "M17.5 0C7.83477 0 0 7.83628 0 17.5031C0 27.1685 15.5673 51.5313 17.5 51.5313C19.4343 51.5313 35 27.1684 35 17.5031C35 7.83628 27.1652 0 17.5 0ZM17.5 24.1961C13.8043 24.1961 10.807 21.1988 10.807 17.5031C10.807 13.8043 13.8043 10.807 17.5 10.807C21.1957 10.807 24.1946 13.8043 24.1946 17.5031C24.1946 21.1988 21.1957 24.1961 17.5 24.1961Z";

// マーカーアイコン（凡例と形・大きさを統一）
const getMarkerIcon = (facility, isSelected, isVisited, isCurrentLocation) => {
  // 色は凡例と合わせる
  const color = isCurrentLocation
    ? "#393994" // 現在地: var(--color-accent10)
    : isSelected
    ? "#e63946" // 選択中: var(--color-theme10)
    : isVisited
    ? "#a6a6a6" // 来訪済み: var(--color-base13)
    : "#f4a261"; // 移動可能: var(--color-accent20)

  // 大きさは全て統一（凡例と視覚的整合が取れる程度のサイズ）
  const scale = 0.6; // viewBox高さ52に対して ~31px 程度

  return {
    path: MAPMARKER_SVG_PATH,
    scale,
    fillColor: color,
    fillOpacity: 1,
    strokeWeight: 2,
    strokeColor: "#FFFFFF",
    strokeOpacity: 1,
    // 先端が座標に合うようにアンカーをパスの先端（中央下）に設定
    anchor: new window.google.maps.Point(17.5, 51.5313),
  };
};

export const GoogleMapComponent = ({ 
  onSpotSelect, 
  onSelectFacility, 
  selectedSpot,
  eventHistory = [],
  currentLocation = null,
  visitedFacilities = [],
  facilityStatusMap = {},
  containerStyle
}) => {
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const mapRef = useRef();
  // 端末GPS（Jotai）
  const [deviceLocation] = useAtom(deviceLocationAtom);
  const [geoError] = useAtom(geolocationErrorAtom);
  // Mapページ側からもGPSウォッチを起動して、必ず許可ダイアログが表示されるようにする
  useGeolocation(true);

  // JS API Loader（LoadScript より安定）
  const { isLoaded: isApiLoaded, loadError: apiLoadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY || '',
    libraries: ['places']
  });

  // マップロード時のコールバック
  const onLoad = useCallback((map) => {
    mapRef.current = map;
    setIsLoaded(true);
  }, []);

  // マップロードエラー用の明示的なハンドラは未使用のため削除（apiLoadErrorを利用）

  // マップアンロード時のコールバック
  const onUnmount = useCallback(() => {
    mapRef.current = null;
    setIsLoaded(false);
  }, []);

  // マーカークリック時の処理
  const handleMarkerClick = useCallback((spot) => {
    // InfoWindowは使用しないのでselectedMarkerは設定しない
    // setSelectedMarker(spot);
    
    // 両方のコールバックに対応
    if (onSpotSelect) {
      onSpotSelect(spot);
    }
    if (onSelectFacility) {
      onSelectFacility(spot);
    }
  }, [onSpotSelect, onSelectFacility]);

  // InfoWindow閉じる処理
  const handleInfoWindowClose = useCallback(() => {
    setSelectedMarker(null);
  }, []);

  // eventHistory から訪問済みの locationId セットを導出
  const visitedLocationIdsFromHistory = (() => {
    if (!eventHistory || eventHistory.length === 0) return new Set();
    const eventIdSet = new Set(eventHistory.map((e) => e.id));
    const ids = eventList
      .filter((ev) => ev.locationId && eventIdSet.has(ev.id))
      .map((ev) => ev.locationId);
    return new Set(ids);
  })();
  
  // テスト: コンポーネントが読み込まれているかの確認
  if (!process.env.REACT_APP_GOOGLE_MAPS_API_KEY) {
    return (
      <Box 
        width="100%" 
        height="100%" 
        display="flex" 
        alignItems="center" 
        justifyContent="center"
        bg="red.100"
        border="2px solid red"
      >
        <VStack spacing={4}>
          <Box fontSize="xl" color="red.600">API Key が設定されていません</Box>
          <Box fontSize="sm" color="red.500">
            .env ファイルにREACT_APP_GOOGLE_MAPS_API_KEYを設定してください
          </Box>
        </VStack>
      </Box>
    );
  }

  // エラー状態を表示（APIローダーのエラーのみ判定）
  if (apiLoadError) {
    return (
      <Box 
        width="100%" 
        height="100%" 
        display="flex" 
        alignItems="center" 
        justifyContent="center"
        bg="red.50"
        border="1px solid"
        borderColor="red.200"
      >
        <VStack spacing={4}>
          <Box fontSize="xl" color="red.600">マップの読み込みに失敗しました</Box>
          <Box fontSize="sm" color="red.500">
            Error: {apiLoadError?.message || 'Unknown error'}
          </Box>
        </VStack>
      </Box>
    );
  }

  // 事前のエラーチェック
  const effectiveLoadError = apiLoadError;
  const hasDeviceGps =
    deviceLocation &&
    typeof deviceLocation.lat === 'number' &&
    typeof deviceLocation.lng === 'number' &&
    !geoError;

  return (
    <Box width="100%" height="100%" position="relative" style={{ zIndex: 0 }}>
      {(!isApiLoaded) && (
        <Box 
          width="100%" 
          height="100%" 
          display="flex" 
          alignItems="center" 
          justifyContent="center"
          backgroundColor="var(--color-theme11)"
          fontSize="18px"
        >
          🗺️ Loading Google Maps...
        </Box>
      )}

      {effectiveLoadError && (
        <Box 
          width="100%" 
          height="100%" 
          display="flex" 
          alignItems="center" 
          justifyContent="center"
          bg="red.50"
          border="1px solid"
          borderColor="red.200"
        >
          <VStack spacing={4}>
            <Box fontSize="xl" color="red.600">マップの読み込みに失敗しました</Box>
            <Box fontSize="sm" color="red.500">
              Error: {effectiveLoadError?.message || 'Unknown error'}
            </Box>
          </VStack>
        </Box>
      )}

      {isApiLoaded && !effectiveLoadError && (
        <GoogleMap
          mapContainerStyle={containerStyle || defaultMapContainerStyle}
          center={center}
          zoom={14}
          onLoad={onLoad}
          onUnmount={onUnmount}
          options={options}
        >
          {/* 施設マーカー */}
          {isLoaded && facilityList.filter((f) => f.id !== 'fac_000').map((facility) => {
            // 訪問済みかどうかを判定（visitedFacilities または eventHistory を使用）
            const isVisited =
              visitedFacilities.includes(facility.id) ||
              visitedLocationIdsFromHistory.has(facility.id);
            
            // デバッグログは削除
            
            // 選択中かどうかを判定
            const isSelected = selectedSpot?.id === facility.id;
            // 現在地（GPS）表示に切替えたため、施設を現在地としては強調しない
            const isCurrentLocation = false;
            
            return (
              <Marker
                key={facility.id}
                position={facility.coordinates}
                title={facility.name}
        icon={getMarkerIcon(facility, isSelected, isVisited, isCurrentLocation)}
                onClick={() => handleMarkerClick(facility)}
              />
            );
          })}

          {/* 端末GPSによる現在地（Googleデフォルト風: 青いシングルドット + 精度サークル） */}
          {isLoaded && hasDeviceGps && (
            <>
              {Number.isFinite(deviceLocation.accuracy) && deviceLocation.accuracy > 0 && (
                <Circle
                  center={{ lat: deviceLocation.lat, lng: deviceLocation.lng }}
                  radius={deviceLocation.accuracy}
                  options={{
                    fillColor: '#393994',
                    fillOpacity: 0.15,
                    strokeColor: '#393994',
                    strokeOpacity: 0.4,
                    strokeWeight: 1,
                    clickable: false,
                    zIndex: 5,
                  }}
                />
              )}
              <Marker
                key="device-location"
                position={{ lat: deviceLocation.lat, lng: deviceLocation.lng }}
                title="現在地 (GPS)"
                icon={{
                  path: window.google.maps.SymbolPath.CIRCLE,
                  scale: 8,
                  fillColor: '#393994',
                  fillOpacity: 1,
                  strokeColor: '#FFFFFF',
                  strokeWeight: 2,
                }}
                zIndex={10}
              />
            </>
          )}

          {/* InfoWindowは使用しない - 独自のUIコンポーネントを使用 */}
          {false && selectedMarker && (
            <InfoWindow
              position={selectedMarker.coordinates}
              onCloseClick={handleInfoWindowClose}
            >
              <div>
                <h3>{selectedMarker.name}</h3>
                <p>Type: {selectedMarker.type}</p>
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      )}

  {/* 現在地が非表示時の追加表示は行わない（凡例側で無効化表現） */}
    </Box>
  );
};