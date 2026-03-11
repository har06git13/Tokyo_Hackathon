/*
 * Map tiles: Esri World Street Map — © Esri, HERE, Garmin, FAO, NOAA, USGS, © OpenStreetMap contributors
 *   Terms: https://www.esri.com/en-us/legal/terms/full-master-agreement (free for non-commercial / dev use)
 * Map library: Leaflet (BSD 2-Clause) https://leafletjs.com
 *              react-leaflet (Hippocratic License 3.0) https://react-leaflet.js.org
 */
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
  const MAP_CONTAINER_STYLE = { width: "100%", height: "22vh" };

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
      <MapContainer
        center={MAP_CENTER}
        zoom={14}
        dragging={false}
        scrollWheelZoom={false}
        doubleClickZoom={false}
        zoomControl={false}
        touchZoom={false}
        keyboard={false}
        attributionControl={false}
        style={{ ...MAP_CONTAINER_STYLE, borderRadius: mapBorderRadius }}
      >
        <TileLayer
          attribution='Tiles &copy; <a href="https://www.esri.com">Esri</a> &mdash; Source: Esri, HERE, Garmin, &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}"
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
