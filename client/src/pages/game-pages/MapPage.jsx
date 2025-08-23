import React, { useState } from "react";
import { Flex, Box } from "@chakra-ui/react";
import { Header } from "../../components/common";
import { Footer } from "../../components/game-page";
import { MapMarkerLegend, MapSpotInfo } from "../../components/game-page";
import { facilityList, eventList } from "../../temporary-database";
import { currentTimeSlotAtom } from "../../atoms/playerAtoms";

export const MapPage = () => {
  const [selectedFacility, setSelectedFacility] = useState(null);
  const [currentTimeSlot, setCurrentTimeSlot] = useState(currentTimeSlotAtom);

  const FacilityList = ({ currentTimeSlot, onSelect }) => {
    const filteredFacilities = facilityList.filter((fac) => {
      if (fac.id === "fac_000") return false;

      if (fac.type === "shelter") {
        return ["6h", "8h", "10h"].includes(currentTimeSlot);
      }

      return true;
    });

    return (
      <Box position="absolute" top="0" left="0" p="2" zIndex={2}>
        {filteredFacilities.map((fac) => (
          <button
            key={fac.id}
            onClick={(e) => {
              e.stopPropagation();
              onSelect(fac.id);
            }}
            style={{ display: "block", margin: "8px 0" }}
          >
            {fac.name}
          </button>
        ))}
      </Box>
    );
  };

  const onSelectFacility = (facilityId) => {
    const facData = facilityList.find((fac) => fac.id === facilityId);
    setSelectedFacility(facData);
  };

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
        position="relative"
        onClick={() => setSelectedFacility(null)}
      >
        <Box
          className="mapUI"
          width={"100%"}
          height={"100%"}
          backgroundColor={"var(--color-accent10)"}
          zIndex={0}
          position="absolute"
        >
          {/* ここにマップ入れてほしい！ */}
          {/* ↓仮の施設選択リスト、マップ実装したらロジックだけ移植して消してね */}
          <FacilityList
            currentTimeSlot={currentTimeSlot}
            onSelect={(id) => {
              onSelectFacility(id);
            }}
          />
        </Box>

        <Flex
          className="map-overlay"
          position="absolute"
          inset={0}
          zIndex={1}
          flexDirection="column"
          alignItems="center"
          justifyContent="space-between"
          pointerEvents="none"
        >
          <MapMarkerLegend />

          {selectedFacility && (
            <Flex pointerEvents="auto" justifyContent="center" width="100%">
              <MapSpotInfo
                type="map"
                spotStatus="default"
                spotType={selectedFacility.type}
                spotName={selectedFacility.name}
              />
            </Flex>
          )}
        </Flex>
      </Flex>

      <Footer type="map" />
    </Flex>
  );
};
