import React from "react";
import { MapmarkerIcon, MapUserIcon } from "../icons";
import { Flex, Text } from "@chakra-ui/react";

const MarkerItem = ({ icon, label }) => (
  <Flex
    className="spotstatusinfo"
    backgroundColor={"var(--color-base10)"}
    borderRadius={"9999px"}
    alignItems={"center"}
    gap={"1vw"}
    height={"6vw"}
    paddingX={"3vw"}
    paddingY={"1vw"}
  >
    {icon}
    <Text className="text-subtext">{label}</Text>
  </Flex>
);

export const MapMarkerLegend = () => {
  return (
    <Flex
      className="map-marker-legend"
      width={"90vw"}
      height={"10.6vw"}
      paddingX={"4vw"}
      gap={"1vw"}
      alignItems={"center"}
      justifyContent={"space-between"}
    >
      <MarkerItem
        icon={<MapUserIcon width="3vw" height="100%" />}
        label="現在地"
      />
      <MarkerItem
        icon={<MapmarkerIcon width="3vw" color="var(--color-theme10)" />}
        label="選択中"
      />
      <MarkerItem
        icon={<MapmarkerIcon width="3vw" color="var(--color-accent20)" />}
        label="移動可能"
      />
      <MarkerItem
        icon={<MapmarkerIcon width="3vw" color="var(--color-base13)" />}
        label="来訪済み"
      />
    </Flex>
  );
};
