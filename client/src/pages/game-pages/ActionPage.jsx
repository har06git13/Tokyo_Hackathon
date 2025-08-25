// src/pages/game-pages/ActionPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Flex, Box } from "@chakra-ui/react";
import { Header, LifeGauge } from "../../components/common";
import {
  EventText,
  ActionTab,
  MapMarkerLegend,
  MapSpotInfo,
  Footer,
  ActionConfirmDialog,
  GoogleMapComponent,
  FacilityList,
} from "../../components/game-page";
import { SnsLogoIcon } from "../../components/icons";
import { useAtom } from "jotai";
import {
  currentTimeAtom,
  currentTimeSlotAtom,
  selectedFacilityAtom,
  selectedEventAtom,
  eventHistoryAtom,
  currentEventStatusAtom,
  currentLocationAtom,
  visitedFacilitiesAtom,
} from "../../atoms/playerAtoms";

export const ActionPage = () => {
  const [spotSelected, setSpotSelected] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [actionType, setActionType] = useState("walk");

  const navigate = useNavigate();
  const [selectedFacility, setSelectedFacility] = useAtom(selectedFacilityAtom);
  const [selectedEvent, setSelectedEvent] = useAtom(selectedEventAtom);
  const [currentTime] = useAtom(currentTimeAtom);
  const [currentTimeSlot] = useAtom(currentTimeSlotAtom);
  const [eventHistory] = useAtom(eventHistoryAtom);
  const [, setCurrentEventStatus] = useAtom(currentEventStatusAtom);
  const [currentLocationName] = useAtom(currentLocationAtom);
  const [visitedFacilities] = useAtom(visitedFacilitiesAtom);

  useEffect(() => {
    setSpotSelected(false);
    setShowConfirmDialog(false);
  }, [actionType]);

  // ---- facilities (API) ----
  const [facilities, setFacilities] = useState([]);
  const [facLoading, setFacLoading] = useState(true);
  const [facError, setFacError] = useState(null);

  // ---- walk events index for visited check (API) ----
  // locationId -> walkEvent（{ _id, locationId, ... }）
  const [walkIndex, setWalkIndex] = useState({});
  const [walkLoading, setWalkLoading] = useState(true);
  const [walkError, setWalkError] = useState(null);

  const BASE_URL = process.env.REACT_APP_API_URL;

  // facilities を取得
  useEffect(() => {
    let aborted = false;
    (async () => {
      setFacLoading(true);
      setFacError(null);
      try {
        const res = await fetch(`${BASE_URL}/api/facilities`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const list = await res.json();
        const normalized = Array.isArray(list)
          ? list.map((d) => ({ ...d, id: d._id ?? d.id }))
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

  // walk イベントを取得して locationId -> walkEvent の索引を作成
  useEffect(() => {
    let aborted = false;
    (async () => {
      setWalkLoading(true);
      setWalkError(null);
      try {
        const res = await fetch(`${BASE_URL}/api/events?type=walk`);
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

  // 現在地の施設（名前一致で検索）
  const currentLocationFacility =
    facilities.find((f) => f.name === currentLocationName) ?? null;

  // チェックイン状態を判定（visited は walkIndex と eventHistory を突合）
  const visitedEventIds = eventHistory.map((e) => e.id); // DBイベントID（_id）が入っている想定
  const getFacilityStatus = (facilityId) => {
    const walkEv = walkIndex[facilityId];
    const isVisited = !!(walkEv && visitedEventIds.includes(walkEv._id));
    const isCurrentLocation = currentLocationFacility?.id === facilityId;
    const isCheckedIn = visitedFacilities.includes(facilityId);
    return { isVisited, isCurrentLocation, isCheckedIn };
  };

  // 施設の状態情報をマップして渡す（GoogleMapComponent向け）
  const facilityStatusMap = facilities.reduce((acc, facility) => {
    acc[facility.id] = getFacilityStatus(facility.id);
    return acc;
  }, {});

  useEffect(() => {
    console.log("spotSelected changed:", spotSelected);
  }, [spotSelected]);

  // 施設選択（GoogleMapComponentからは facility オブジェクトが来る想定。ID文字列でもOK）
  const onSelectFacility = async (facilityData) => {
    const facilityId =
      typeof facilityData === "string" ? facilityData : facilityData?.id;
    const facData =
      typeof facilityData === "string"
        ? facilities.find((f) => f.id === facilityId)
        : facilityData;

    console.log("facilityId", facilityId, facData);

    if (!facilityId || facilityId === "fac_000" || !facData) return;

    setSelectedFacility(facData);
    setSpotSelected(true);

    try {
      // walk を優先
      const walkRes = await fetch(
        `${BASE_URL}/api/events?type=walk&locationId=${encodeURIComponent(
          facilityId
        )}`
      );
      if (!walkRes.ok) throw new Error(`walk fetch HTTP ${walkRes.status}`);
      const walkArr = await walkRes.json();

      // 見つからなければ epilogue にフォールバック
      let evData = Array.isArray(walkArr) && walkArr[0] ? walkArr[0] : null;
      if (!evData) {
        const epiRes = await fetch(`${BASE_URL}/api/events?type=epilogue`);
        if (!epiRes.ok) throw new Error(`epilogue fetch HTTP ${epiRes.status}`);
        const epiArr = await epiRes.json();
        evData = Array.isArray(epiArr) ? epiArr[0] : null;
      }

      if (!evData) {
        console.warn("該当イベントが見つかりませんでした");
        return;
      }
      setSelectedEvent(evData);
    } catch (e) {
      console.warn("イベント取得に失敗:", e);
    }
  };

  // SNS（API）
  const onSelectSnsEvent = async () => {
    try {
      const res = await fetch(
        `${BASE_URL}/api/events?type=sns&timeSlot=${encodeURIComponent(
          currentTimeSlot
        )}`
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const arr = await res.json();
      const ev = Array.isArray(arr) ? arr[0] : null;
      if (ev) setSelectedEvent(ev);
      else console.warn("該当するSNSイベントが見つかりませんでした");
    } catch (e) {
      console.warn("SNSイベント取得に失敗:", e);
    }
  };

  // 到着時刻
  const calcArrivalTime = (now, requiredMinutes = 0) => {
    const arrival = new Date(now.getTime());
    arrival.setMinutes(arrival.getMinutes() + (requiredMinutes || 0));
    const hh = String(arrival.getHours()).padStart(2, "0");
    const mm = String(arrival.getMinutes()).padStart(2, "0");
    return `${hh}:${mm}`;
  };
  const requiredDuration =
    actionType === "sns" ? 30 : selectedEvent?.requiredDuration ?? 0;
  const arrivalTime = selectedEvent
    ? calcArrivalTime(currentTime, requiredDuration)
    : null;

  return (
    <Flex
      className="page-container"
      backgroundColor={"var(--color-base12)"}
      position="relative"
      direction="column"
      minH="100vh"
    >
      <Header prevPage={false} currentPage="アクション" />

      {/* -------- ページ本体 -------- */}
      <Flex
        className="page-contents"
        gap={"1.6%"}
        paddingTop={"4%"}
        onClick={() => {
          if (spotSelected) setSpotSelected(false);
        }}
      >
        <LifeGauge />
        <EventText />

        <ActionTab
          type={actionType}
          onSnsClick={() => {
            setActionType("sns");
            onSelectSnsEvent();
          }}
          onWalkClick={() => setActionType("walk")}
        />

        {/* ===== WALK モード ===== */}
        {actionType === "walk" && (
          <Flex
            className="map"
            backgroundColor={"var(--color-theme11)"}
            flex={1}
            width={"100%"}
            flexDirection={"column"}
            alignItems={"center"}
            justifyContent={"center"}
            position="relative"
          >
            {/* Google Map（相手ブランチを採用） */}
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
                facilityStatusMap={facilityStatusMap}
                showControls={false}
              />
            </Box>

            {/* マップ凡例 */}
            <Box
              className="legend"
              position="absolute"
              top="1vh"
              width="90%"
              zIndex={100}
            >
              <MapMarkerLegend />
            </Box>

            {/* （開発用）仮のリストUIを見たいときは true に */}
            {process.env.NODE_ENV === "development" && false && (
              <FacilityList
                currentTimeSlot={currentTimeSlot}
                onSelect={onSelectFacility}
              />
            )}

            {/* 選択カード */}
            {spotSelected && (
              <Box
                position="absolute"
                bottom="0"
                left="50%"
                transform="translateX(-50%)"
                zIndex={10}
                width="90%"
              >
                <MapSpotInfo
                  spotName={selectedFacility.name}
                  spotType={selectedFacility.type}
                  life={selectedEvent?.gaugeChange?.life}
                  mental={selectedEvent?.gaugeChange?.mental}
                  charge={selectedEvent?.gaugeChange?.battery}
                  money={selectedEvent?.gaugeChange?.money}
                  arrivalTime={arrivalTime}
                  onClick={() => setShowConfirmDialog(true)}
                />
              </Box>
            )}

            {/* 確認ダイアログ */}
            {showConfirmDialog && selectedFacility && (
              <>
                <Box
                  position="absolute"
                  top={0}
                  left={0}
                  w="100%"
                  h="100%"
                  bg="rgba(0,0,0,0.5)"
                  zIndex={20}
                />
                <Flex
                  position="absolute"
                  top="50%"
                  left="50%"
                  transform="translate(-50%, -50%)"
                  zIndex={21}
                  w="100%"
                  h="100%"
                  alignItems={"center"}
                  justifyContent={"center"}
                >
                  <ActionConfirmDialog
                    actionType="walk"
                    spotName={selectedFacility.name}
                    arrivalTime={arrivalTime}
                    life={selectedEvent?.gaugeChange?.life}
                    mental={selectedEvent?.gaugeChange?.mental}
                    charge={selectedEvent?.gaugeChange?.battery}
                    money={selectedEvent?.gaugeChange?.money}
                    onBackClick={() => setShowConfirmDialog(false)}
                    onClick={() => {
                      setCurrentEventStatus("walk");
                      navigate("/game/walk");
                    }}
                  />
                </Flex>
              </>
            )}
          </Flex>
        )}

        {/* ===== SNS モード ===== */}
        {actionType === "sns" && (
          <Flex
            className="sns"
            backgroundColor={"var(--color-theme10)"}
            flex={1}
            width={"100%"}
            minH="60vh"
            flexDirection={"column"}
            alignItems={"center"}
            justifyContent={"end"}
            gap={6}
          >
            <SnsLogoIcon color="var(--color-base10)" width="20%" />
            <ActionConfirmDialog
              arrivalTime={arrivalTime}
              life={selectedEvent?.gaugeChange?.life}
              mental={selectedEvent?.gaugeChange?.mental}
              charge={selectedEvent?.gaugeChange?.battery}
              money={selectedEvent?.gaugeChange?.money}
              onClick={() => {
                setCurrentEventStatus("sns");
                navigate("/game/sns");
              }}
            />
          </Flex>
        )}
      </Flex>

      <Footer />
    </Flex>
  );
};
