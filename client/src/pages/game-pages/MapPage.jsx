import React, { useState, useEffect } from "react";
import { Flex } from "@chakra-ui/react";
import { Header } from "../../components/common";
import { Footer } from "../../components/game-page";
import { MapMarkerLegend, MapSpotInfo } from "../../components/game-page";

export const MapPage = () => {
  const [spotSelected, setSpotSelected] = useState(false);
  useEffect(() => {
    setSpotSelected(false);
  }, []);

  return (
    <Flex
      className="page-container"
      backgroundColor={"var(--color-base12)"}
      zIndex={0}
      position={"relative"}
    >
      <Header prevPage={false} currentPage="マップ" />
      <Flex
        className="page-contents"
        flex={1}
        backgroundColor={"var(--color-theme11)"}
        justifyContent={"space-between"}
        onClick={() => setSpotSelected((prev) => !prev)}
      >
        <MapMarkerLegend />
        {spotSelected && <MapSpotInfo type="map" />}
      </Flex>
      <Footer type="map" />
    </Flex>
  );
};
