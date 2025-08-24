import React from "react";
import { Flex, Box } from "@chakra-ui/react";
import { Header } from "../../components/common";
import { Footer, GoogleMapComponent, MapMarkerLegend } from "../../components/game-page";
import { useAtom } from "jotai";
import { 
  eventHistoryAtom, 
  currentLocationAtom, 
  selectedFacilityAtom,
  selectedEventAtom,
  visitedFacilitiesAtom
} from "../../atoms/playerAtoms";
import { facilityList, eventList } from "../../temporary-database";

export const MapPage = () => {
  // ActionPage と同じ挙動でグローバル選択のみ使用
  const [selectedFacility, setSelectedFacility] = useAtom(selectedFacilityAtom);
  const [, setSelectedEvent] = useAtom(selectedEventAtom);
  const [eventHistory] = useAtom(eventHistoryAtom);
  const [currentLocationName] = useAtom(currentLocationAtom);
  const [visitedFacilities] = useAtom(visitedFacilitiesAtom);

  // 現在地の施設オブジェクトを取得
  const currentLocationFacility = facilityList.find(fac => fac.name === currentLocationName);

  // ActionPage と同一: 選択した施設をグローバルに設定
  const onSelectFacility = (facilityData) => {
    let facilityId, facData;
    if (typeof facilityData === 'string') {
      facilityId = facilityData;
      facData = facilityList.find((fac) => fac.id === facilityId);
    } else {
      facilityId = facilityData.id;
      facData = facilityData;
    }
    if (facilityId === "fac_000") return;
    const evData =
      eventList.find((ev) => ev.locationId === facilityId && ev.type === "walk") ||
      eventList.find((ev) => ev.type === "epilogue");
    setSelectedFacility(facData);
    setSelectedEvent(evData);
  };

  return (
    <Flex
      className="page-container"
      backgroundColor={"var(--color-base12)"}
      zIndex={0}
      position={"relative"}
      direction="column"
      height="100vh"
    >
      <Header prevPage={false} currentPage="マップ" />
      
      <Flex className="page-contents" gap={"1.6%"} paddingTop={"4%"}>
        <Box
          className="map"
          backgroundColor={"var(--color-theme11)"}
          flex={1}
          width={"100%"}
          position="relative"
          height={{ base: "70vh", md: "70vh" }}
        >
          {/* Google Map Component - ActionPage と同じ構造 */}
          <Box
            position="absolute"
            top={0}
            left={0}
            width="100%"
            height="100%"
            zIndex={1}
          >
            <GoogleMapComponent 
              onSelectFacility={onSelectFacility}
              selectedSpot={selectedFacility}
              eventHistory={eventHistory}
              currentLocation={currentLocationFacility}
              visitedFacilities={visitedFacilities}
              showControls={false}
            />
          </Box>
          {/* マップ凡例 */}
          <Box position="absolute" top="16px" left="16px" zIndex={100}>
            <MapMarkerLegend />
          </Box>
          {/* GPS 情報オーバーレイは非表示（削除） */}
        </Box>
      </Flex>
      
      <Footer type="map" />
    </Flex>
  );
};
