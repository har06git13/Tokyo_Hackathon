// src/pages/game-pages/MapPage.jsx
import React, { useEffect, useState } from "react";
import { Flex, Box } from "@chakra-ui/react";
import { Header } from "../../components/common";
import {
  Footer,
  GoogleMapComponent,
  MapMarkerLegend,
  MapSpotInfo,
} from "../../components/game-page";
import { useAtom } from "jotai";
import {
  eventHistoryAtom,
  currentLocationAtom,
  selectedFacilityAtom,
  selectedEventAtom,
  visitedFacilitiesAtom,
} from "../../atoms/playerAtoms";

export const MapPage = () => {
  // グローバル state
  const [selectedFacility, setSelectedFacility] = useAtom(selectedFacilityAtom);
  const [, setSelectedEvent] = useAtom(selectedEventAtom);
  const [eventHistory] = useAtom(eventHistoryAtom);
  const [currentLocationName] = useAtom(currentLocationAtom);
  const [visitedFacilities] = useAtom(visitedFacilitiesAtom);

  // facilities(API)
  const [facilities, setFacilities] = useState([]);
  const [facLoading, setFacLoading] = useState(true);
  const [facError, setFacError] = useState(null);

  // 施設一覧を取得
  useEffect(() => {
    let aborted = false;
    (async () => {
      setFacLoading(true);
      setFacError(null);
      try {
        const res = await fetch("/api/facilities");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const list = await res.json();
        // DBの _id を id に寄せて正規化
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
    return () => { aborted = true; };
  }, []);

  // 現在地の施設オブジェクト（名前一致）
  const currentLocationFacility =
    facilities.find((fac) => fac.name === currentLocationName) ?? null;

  // 施設選択（GoogleMapComponent から facility オブジェクト or 文字列IDが来る）
  const onSelectFacility = async (facilityData) => {
    const facilityId =
      typeof facilityData === "string" ? facilityData : facilityData?.id;
    const facData =
      typeof facilityData === "string"
        ? facilities.find((f) => f.id === facilityId)
        : facilityData;

    if (!facilityId || facilityId === "fac_000" || !facData) return;

    setSelectedFacility(facData);

    // イベントをAPIから取得（walk優先 → epilogueフォールバック）
    try {
      const walkRes = await fetch(
        `/api/events?type=walk&locationId=${encodeURIComponent(facilityId)}`
      );
      if (!walkRes.ok) throw new Error(`walk fetch HTTP ${walkRes.status}`);
      const walkArr = await walkRes.json();

      let evData = Array.isArray(walkArr) && walkArr[0] ? walkArr[0] : null;
      if (!evData) {
        const epiRes = await fetch("/api/events?type=epilogue");
        if (!epiRes.ok) throw new Error(`epilogue fetch HTTP ${epiRes.status}`);
        const epiArr = await epiRes.json();
        evData = Array.isArray(epiArr) ? epiArr[0] : null;
      }

      if (evData) setSelectedEvent(evData);
    } catch (e) {
      // 失敗時は何もしない（UI は選択施設の表示のみ）
      console.warn("イベント取得に失敗:", e);
    }
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

      <Flex className="page-contents" gap={"1.6%"}>
        <Box
          className="map"
          backgroundColor={"var(--color-theme11)"}
          flex={1}
          width={"100%"}
          position="relative"
          height={{ base: "70vh", md: "70vh" }}
        >
          {/* 読み込み/エラー表示（簡易） */}
          {facLoading && (
            <Box
              position="absolute"
              inset={0}
              display="flex"
              alignItems="center"
              justifyContent="center"
              color="var(--color-base1)"
              zIndex={10}
            >
              施設を読み込み中…
            </Box>
          )}
          {facError && (
            <Box
              position="absolute"
              inset={0}
              display="flex"
              alignItems="center"
              justifyContent="center"
              color="tomato"
              zIndex={10}
            >
              施設取得に失敗：{facError}
            </Box>
          )}

          {/* Google Map Component */}
          {!facLoading && !facError && (
            <Box position="absolute" top={0} left={0} width="100%" height="100%" zIndex={1}>
              <GoogleMapComponent
                onSelectFacility={onSelectFacility}
                selectedSpot={selectedFacility}
                eventHistory={eventHistory}
                currentLocation={currentLocationFacility}
                visitedFacilities={visitedFacilities}
                showControls={false}
              />
            </Box>
          )}

          {/* マップ凡例 */}
          <Box position="absolute" top="16px" left="16px" zIndex={100}>
            <MapMarkerLegend />
          </Box>

          {/* 選択中の施設カード */}
          {selectedFacility && (
            <Flex
              position="absolute"
              pointerEvents="auto"
              justifyContent="center"
              width="100%"
              px={"4%"}
              zIndex={200}
              bottom={0}
            >
              <MapSpotInfo
                type="map"
                spotStatus="default"
                spotType={selectedFacility.type}
                spotName={selectedFacility.name}
              />
            </Flex>
          )}
        </Box>
      </Flex>

      <Footer type="map" />
    </Flex>
  );
};
