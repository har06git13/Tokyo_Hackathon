/*
 * Map tiles: Esri World Street Map — © Esri, HERE, Garmin, FAO, NOAA, USGS, © OpenStreetMap contributors
 *   Terms: https://www.esri.com/en-us/legal/terms/full-master-agreement (free for non-commercial / dev use)
 * Map library: Leaflet (BSD 2-Clause) https://leafletjs.com
 *              react-leaflet (Hippocratic License 3.0) https://react-leaflet.js.org
 */
import React, { useState, useEffect } from 'react';
import L from 'leaflet';
import { MapContainer, TileLayer, Marker, Circle } from 'react-leaflet';
import { Box, VStack } from '@chakra-ui/react';
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
const MAP_CENTER = [35.6581, 139.7017];

// 凡例と同一のSVGパス（MapmarkerIcon と同じ形状）
const MAPMARKER_SVG_PATH =
  "M17.5 0C7.83477 0 0 7.83628 0 17.5031C0 27.1685 15.5673 51.5313 17.5 51.5313C19.4343 51.5313 35 27.1684 35 17.5031C35 7.83628 27.1652 0 17.5 0ZM17.5 24.1961C13.8043 24.1961 10.807 21.1988 10.807 17.5031C10.807 13.8043 13.8043 10.807 17.5 10.807C21.1957 10.807 24.1946 13.8043 24.1946 17.5031C24.1946 21.1988 21.1957 24.1961 17.5 24.1961Z";

// 施設マーカー（色分け）
const getMarkerIcon = (facility, isSelected, isVisited, isCurrentLocation) => {
  const color = isCurrentLocation
    ? "#393994" // 現在地
    : isSelected
    ? "#e63946" // 選択中
    : isVisited
    ? "#a6a6a6" // 来訪済み
    : "#f4a261"; // 移動可能

  return L.divIcon({
    html: `<div style="filter:drop-shadow(0 2px 4px rgba(0,0,0,0.35))">
             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 35 51.5313" width="21" height="31">
               <path d="${MAPMARKER_SVG_PATH}" fill="${color}" stroke="#fff" stroke-width="1.2"/>
             </svg>
           </div>`,
    className: '',
    iconSize: [21, 31],
    iconAnchor: [10.5, 31],
  });
};

// GPS ドットアイコン
const GPS_DOT_ICON = L.divIcon({
  html: '<div style="width:16px;height:16px;border-radius:50%;background:#393994;border:2px solid #fff;box-sizing:border-box;filter:drop-shadow(0 2px 4px rgba(57,57,148,0.5));"></div>',
  className: '',
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

export const GoogleMapComponent = ({
  onSpotSelect,
  onSelectFacility,
  selectedSpot,
  eventHistory = [],
  currentLocation = null,
  visitedFacilities = [],
  facilityStatusMap = {},
  containerStyle,
  showControls = true,
}) => {
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
        const res = await fetch('/api/facilities');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const list = await res.json();
        const normalized = Array.isArray(list)
          ? list.map(d => ({ ...d, id: d.id ?? d._id }))
          : [];
        if (!aborted) setFacilities(normalized);
      } catch (e) {
        if (!aborted) setFacError(e.message);
      } finally {
        if (!aborted) setFacLoading(false);
      }
    })();
    return () => { aborted = true; };
  }, []);

  // === API: walk events index (locationId -> event) for visited inference fallback ===
  const [walkIndex, setWalkIndex] = useState({});
  const [walkError, setWalkError] = useState(null);

  useEffect(() => {
    let aborted = false;
    (async () => {
      try {
        const res = await fetch('/api/events?type=walk');
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
      }
    })();
    return () => { aborted = true; };
  }, []);

  const handleMarkerClick = (facility) => {
    if (onSpotSelect) onSpotSelect(facility);
    if (onSelectFacility) onSelectFacility(facility);
  };

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

  const hasDeviceGps =
    deviceLocation &&
    typeof deviceLocation.lat === 'number' &&
    typeof deviceLocation.lng === 'number' &&
    !geoError;

  return (
    <Box width="100%" height="100%" position="relative" style={{ zIndex: 0 }}>
      <MapContainer
        center={MAP_CENTER}
        zoom={14}
        zoomControl={showControls}
        attributionControl={false}
        style={containerStyle || defaultMapContainerStyle}
      >
        <TileLayer
          attribution='Tiles &copy; <a href="https://www.esri.com">Esri</a> &mdash; Source: Esri, HERE, Garmin, &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}"
        />

        {/* 施設マーカー */}
        {!facLoading && !facError && facilities
          .filter((f) => f.id !== 'fac_000')
          .map((facility) => {
            const status = facilityStatusMap?.[facility.id];
            const isVisited = status?.isVisited ?? (
              visitedFacilities.includes(facility.id) ||
              visitedLocationIdsFromHistory.has(facility.id)
            );
            const isSelected = selectedSpot?.id === facility.id;
            const isCurrentLocation = status?.isCurrentLocation ??
              (currentLocation?.id
                ? currentLocation.id === facility.id
                : currentLocation?.name === facility.name);

            const pos = facility.coordinates
              ? { lat: Number(facility.coordinates.lat), lng: Number(facility.coordinates.lng) }
              : undefined;

            if (!pos || !Number.isFinite(pos.lat) || !Number.isFinite(pos.lng)) return null;

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

      {/* 施設読み込みのステータス */}
      {facLoading && (
        <Box position="absolute" top="8px" right="8px" px={2} py={1} bg="rgba(0,0,0,0.5)" color="#fff" borderRadius="6px" fontSize="12px">
          施設読み込み中…
        </Box>
      )}
      {facError && (
        <Box position="absolute" top="8px" right="8px" px={2} py={1} bg="rgba(255,0,0,0.6)" color="#fff" borderRadius="6px" fontSize="12px">
          施設取得失敗：{facError}
        </Box>
      )}
      {walkError && (
        <Box position="absolute" top="32px" right="8px" px={2} py={1} bg="rgba(255,140,0,0.7)" color="#fff" borderRadius="6px" fontSize="12px">
          イベント索引取得失敗：{walkError}
        </Box>
      )}
    </Box>
  );
};
