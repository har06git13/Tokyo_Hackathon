import React from "react";
import { MapmarkerIcon, MapUserIcon } from "../icons";
import { Flex, Text } from "@chakra-ui/react";

const MarkerItem = ({ icon, label }) => (
  <Flex
    className="spotstatusinfo"
    backgroundColor={"var(--color-base10)"}
    borderRadius={"9999px"}
    alignItems={"center"}
    gap={"6%"}
    height={"100%"}
    paddingX={"3%"}
    paddingY={"1.4%"}
    width={"100%"}
  >
    {icon}
    <Text className="text-subtext" whiteSpace={"nowrap"}>
      {label}
    </Text>
  </Flex>
);

export const MapMarkerLegend = () => {
  return (
    <Flex
      className="map-marker-legend"
      width={"90%"}
      height={"3vh"}
      gap={"2%"}
      alignItems={"center"}
      paddingRight={"10%"}
      marginY={"2%"}
    >
      <MarkerItem
        icon={<MapUserIcon height="100%" width="30%" />}
        label="現在地"
      />
      <MarkerItem
        icon={
          <MapmarkerIcon
            height="100%"
            width="30%"
            color="var(--color-theme10)"
          />
        }
        label="選択中"
      />
      <MarkerItem
        icon={
          <MapmarkerIcon
            height="100%"
            width="30%"
            color="var(--color-accent20)"
          />
        }
        label="移動可能"
      />
      <MarkerItem
        icon={
          <MapmarkerIcon
            height="100%"
            width="30%"
            color="var(--color-base13)"
          />
        }
        label="来訪済み"
      />
    </Flex>
  );
};
