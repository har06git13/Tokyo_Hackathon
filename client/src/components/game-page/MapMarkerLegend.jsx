import React from "react";
import { MapmarkerIcon } from "../icons";
import { useAtom } from "jotai";
import {
  deviceLocationAtom,
  geolocationErrorAtom,
} from "../../atoms/playerAtoms";
import { Flex, Text } from "@chakra-ui/react";

const MarkerItem = ({ icon, label, disabled = false, onClick }) => (
  <Flex
    className="spotstatusinfo"
    backgroundColor={"var(--color-base10)"}
    borderRadius={"9999px"}
    alignItems={"center"}
    gap={"6%"}
    height={"100%"}
    width={"100%"}
    justifyContent={"center"}
    opacity={disabled ? 0.4 : 1}
    cursor={disabled && onClick ? "pointer" : "default"}
    onClick={disabled ? onClick : undefined}
    role={disabled && onClick ? "button" : undefined}
    tabIndex={disabled && onClick ? 0 : undefined}
    onKeyDown={(e) => {
      if (!disabled || !onClick) return;
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onClick();
      }
    }}
  >
    <div style={{ height: "60%", flexShrink: 0 }}>{icon}</div>
    <Text className="text-maintext" whiteSpace={"nowrap"}>
      {label}
    </Text>
  </Flex>
);

export const MapMarkerLegend = () => {
  const [loc] = useAtom(deviceLocationAtom);
  const [geoError] = useAtom(geolocationErrorAtom);
  const [, setLoc] = useAtom(deviceLocationAtom);
  const [, setGeoError] = useAtom(geolocationErrorAtom);
  const hasDeviceGps =
    loc &&
    typeof loc.lat === "number" &&
    typeof loc.lng === "number" &&
    !geoError;

  const requestGeolocation = () => {
    try {
      if (!("geolocation" in navigator)) {
        setGeoError("Geolocation not available");
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude, accuracy } = pos.coords;
          setLoc({
            lat: latitude,
            lng: longitude,
            accuracy,
            timestamp: pos.timestamp,
          });
          setGeoError(null);
        },
        (err) => {
          setGeoError(err?.message || "Geolocation error");
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } catch (e) {
      setGeoError("Failed to request geolocation");
    }
  };
  return (
    <Flex
      className="map-marker-legend"
      width={"100%"}
      height={"3.4vh"}
      gap={"2%"}
      alignItems={"center"}
    >
      <MarkerItem
        icon={
          <MapmarkerIcon
            height="100%"
            width="100%"
            style={{ color: "var(--color-accent10)" }}
          />
        }
        label="現在地"
        disabled={!hasDeviceGps}
        onClick={requestGeolocation}
      />
      <MarkerItem
        icon={
          <MapmarkerIcon
            height="100%"
            width="100%"
            style={{ color: "var(--color-theme10)" }}
          />
        }
        label="選択中"
      />
      <MarkerItem
        icon={
          <MapmarkerIcon
            height="100%"
            width="100%"
            style={{ color: "var(--color-accent20)" }}
          />
        }
        label="移動可能"
      />
      <MarkerItem
        icon={
          <MapmarkerIcon
            height="100%"
            width="100%"
            style={{ color: "var(--color-base13)" }}
          />
        }
        label="来訪済み"
      />
    </Flex>
  );
};
