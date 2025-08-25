import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  GoogleMap,
  Marker,
  InfoWindow,
  useJsApiLoader,
  Circle,
} from "@react-google-maps/api";
import { Box, VStack } from "@chakra-ui/react";
import { useAtom } from "jotai";
import {
  deviceLocationAtom,
  geolocationErrorAtom,
} from "../../atoms/playerAtoms";
import { useGeolocation } from "../../hooks/useGeolocation";

// マップのスタイル設定（デフォルト）
const defaultMapContainerStyle = {
  width: "100%",
  height: "100%",
};

// 渋谷駅周辺の初期座標
const center = { lat: 35.6581, lng: 139.7017 };

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

// マーカーアイコン
const getMarkerIcon = (facility, isSelected, isVisited, isCurrentLocation) => {
  const color = isCurrentLocation
    ? "#393994" // 現在地
    : isSelected
    ? "#e63946" // 選択中
    : isVisited
    ? "#a6a6a6" // 来訪済み
    : "#f4a261"; // 移動可能

  const scale = 0.6; // viewBox高さ52に対して ~31px 程度
  return {
    path: MAPMARKER_SVG_PATH,
    scale,
    fillColor: color,
    fillOpacity: 1,
    strokeWeight: 2,
    strokeColor: "#FFFFFF",
    strokeOpacity: 1,
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
  facilityStatusMap = {}, // { [facilityId]: { isVisited, isCurrentLocation, isCheckedIn } }
  containerStyle,
  showControls = true,
}) => {
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const mapRef = useRef();

  // 端末GPS（Jotai）
  const [deviceLocation] = useAtom(deviceLocationAtom);
  const [geoError] = useAtom(geolocationErrorAtom);
  useGeolocation(true);

  // === API: facilities ===
  const [facilities, setFacilities] = useState([]);
  const [facLoading, setFacLoading] = useState(true);
  const [facError, setFacError] = useState(null);

  useEffect(() => {
    let aborted = false;
    (async () => {
      setFacLoading(true);
      setFacError(null);
      try {
        const res = await fetch("/api/facilities");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const list = await res.json();
        const normalized = Array.isArray(list)
          ? list.map((d) => ({ ...d, id: d.id ?? d._id }))
          : [];
        if (!aborted) setFacilities(normalized);
      } catch (e) {
        if (!aborted) setFacError(e.message);
      } finally {
        if (!aborted) setFacLoading(false);
      }
    })();
    return () => {
      aborted = true;
    };
  }, []);

  // === API: walk events index (locationId -> event) for visited inference fallback ===
  const [walkIndex, setWalkIndex] = useState({});
  const [walkLoading, setWalkLoading] = useState(true);
  const [walkError, setWalkError] = useState(null);

  useEffect(() => {
    let aborted = false;
    (async () => {
      setWalkLoading(true);
      setWalkError(null);
      try {
        const res = await fetch("/api/events?type=walk");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const arr = await res.json();
        const idx = {};
        if (Array.isArray(arr)) {
          for (const ev of arr) {
            if (ev.locationId && !idx[ev.locationId]) idx[ev.locationId] = ev;
          }
        }
        if (!aborted) setWalkIndex(idx);
      } catch (e) {
        if (!aborted) setWalkError(e.message);
      } finally {
        if (!aborted) setWalkLoading(false);
      }
    })();
    return () => {
      aborted = true;
    };
  }, []);

  // Google Maps JS API Loader
  const { isLoaded: isApiLoaded, loadError: apiLoadError } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY || "",
    libraries: ["places"],
  });

  const onLoad = useCallback((map) => {
    mapRef.current = map;
    setIsLoaded(true);
  }, []);
  const onUnmount = useCallback(() => {
    mapRef.current = null;
    setIsLoaded(false);
  }, []);

  const handleMarkerClick = useCallback(
    (spot) => {
      if (onSpotSelect) onSpotSelect(spot);
      if (onSelectFacility) onSelectFacility(spot);
    },
    [onSpotSelect, onSelectFacility]
  );

  const handleInfoWindowClose = useCallback(() => {
    setSelectedMarker(null);
  }, []);

  // eventHistory から DBイベントIDの集合
  const visitedEventIds = Array.isArray(eventHistory)
    ? eventHistory.map((e) => e.id)
    : [];

  // walkIndex と eventHistory を突合して「訪問した locationId」を導出
  const visitedLocationIdsFromHistory = new Set(
    Object.values(walkIndex)
      .filter((ev) => visitedEventIds.includes(ev._id))
      .map((ev) => ev.locationId)
  );

  // APIキー未設定表示
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
          <Box fontSize="xl" color="red.600">
            API Key が設定されていません
          </Box>
          <Box fontSize="sm" color="red.500">
            .env に REACT_APP_GOOGLE_MAPS_API_KEY を設定してください
          </Box>
        </VStack>
      </Box>
    );
  }

  const effectiveLoadError = apiLoadError;
  const hasDeviceGps =
    deviceLocation &&
    typeof deviceLocation.lat === "number" &&
    typeof deviceLocation.lng === "number" &&
    !geoError;

  const finalMapOptions = {
    ...options,
    disableDefaultUI: !showControls,
    zoomControl: showControls,
    fullscreenControl: showControls,
  };

  return (
    <Box width="100%" height="100%" position="relative" style={{ zIndex: 0 }}>
      {!isApiLoaded && (
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
            <Box fontSize="xl" color="red.600">
              マップの読み込みに失敗しました
            </Box>
            <Box fontSize="sm" color="red.500">
              Error: {effectiveLoadError?.message || "Unknown error"}
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
          options={finalMapOptions}
        >
          {/* 施設マーカー（facilities取得済みのときだけ） */}
          {isLoaded &&
            !facLoading &&
            !facError &&
            facilities
              .filter((f) => f.id !== "fac_000")
              .map((facility) => {
                // ステータスは facilityStatusMap を優先、無ければローカルで推定
                const status = facilityStatusMap?.[facility.id];
                const isVisited =
                  status?.isVisited ??
                  (visitedFacilities.includes(facility.id) ||
                    visitedLocationIdsFromHistory.has(facility.id));
                const isSelected = selectedSpot?.id === facility.id;

                const isCurrentLocation =
                  status?.isCurrentLocation ??
                  (currentLocation?.id
                    ? currentLocation.id === facility.id
                    : currentLocation?.name === facility.name);

                const pos = facility.coordinates
                  ? {
                      lat: Number(facility.coordinates.lat),
                      lng: Number(facility.coordinates.lng),
                    }
                  : undefined;

                if (
                  !pos ||
                  !Number.isFinite(pos.lat) ||
                  !Number.isFinite(pos.lng)
                )
                  return null;

                return (
                  <Marker
                    key={facility.id}
                    position={pos}
                    title={facility.name}
                    icon={getMarkerIcon(
                      facility,
                      isSelected,
                      isVisited,
                      isCurrentLocation
                    )}
                    onClick={() => handleMarkerClick(facility)}
                  />
                );
              })}

          {/* 端末GPS（青ドット + 精度円） */}
          {isLoaded && hasDeviceGps && (
            <>
              {Number.isFinite(deviceLocation.accuracy) &&
                deviceLocation.accuracy > 0 && (
                  <Circle
                    center={{
                      lat: deviceLocation.lat,
                      lng: deviceLocation.lng,
                    }}
                    radius={deviceLocation.accuracy}
                    options={{
                      fillColor: "#393994",
                      fillOpacity: 0.15,
                      strokeColor: "#393994",
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
                  fillColor: "#393994",
                  fillOpacity: 1,
                  strokeColor: "#FFFFFF",
                  strokeWeight: 2,
                }}
                zIndex={10}
              />
            </>
          )}

          {/* InfoWindowは未使用 */}
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

      {/* 施設読み込みの軽いステータス（必要ならUI調整） */}
      {facLoading && isApiLoaded && (
        <Box
          position="absolute"
          top="8px"
          right="8px"
          px={2}
          py={1}
          bg="rgba(0,0,0,0.5)"
          color="#fff"
          borderRadius="6px"
          fontSize="12px"
        >
          施設読み込み中…
        </Box>
      )}
      {facError && (
        <Box
          position="absolute"
          top="8px"
          right="8px"
          px={2}
          py={1}
          bg="rgba(255,0,0,0.6)"
          color="#fff"
          borderRadius="6px"
          fontSize="12px"
        >
          施設取得失敗：{facError}
        </Box>
      )}
      {walkError && (
        <Box
          position="absolute"
          top="32px"
          right="8px"
          px={2}
          py={1}
          bg="rgba(255,140,0,0.7)"
          color="#fff"
          borderRadius="6px"
          fontSize="12px"
        >
          イベント索引取得失敗：{walkError}
        </Box>
      )}
    </Box>
  );
};
