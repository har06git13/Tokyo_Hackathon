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

  // ---- facilities (API) ----
  const [facilities, setFacilities] = useState([]);
  const [facLoading, setFacLoading] = useState(true);
  const [facError, setFacError] = useState(null);

  // ---- walk events index for visited check (API) ----
  const [walkIndex, setWalkIndex] = useState({}); // locationId -> walkEvent
  const [walkLoading, setWalkLoading] = useState(true);
  const [walkError, setWalkError] = useState(null);

  useEffect(() => {
    setSpotSelected(false);
    setShowConfirmDialog(false);
  }, [actionType]);

  // fetch facilities
  useEffect(() => {
    let aborted = false;
    (async () => {
      setFacLoading(true);
      setFacError(null);
      try {
        const res = await fetch("/api/facilities");
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

  // fetch walk events -> build index
  useEffect(() => {
    let aborted = false;
    (async () => {
      setWalkLoading(true);
      setWalkError(null);
      try {
        const res = await fetch("/api/events?type=walk");
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

  // --- 仮の施設選択リスト（表示は同じだがデータはAPI由来） ---
  const FacilityList = ({ currentTimeSlot, onSelect }) => {
    const visitedEventIds = eventHistory.map((e) => e.id); // DBのevent _id が入っている想定

    const filtered = facilities.filter((fac) => {
      if (fac.id === "fac_000") return false;

      // 避難所は時間帯で出す/隠す（元仕様踏襲）
      if (fac.type === "shelter" && !["6h", "8h", "10h"].includes(currentTimeSlot))
        return false;

      // その施設の walk イベントID をインデックスから取得して既訪問チェック
      const walkEv = walkIndex[fac.id]; // walkEv?._id が該当施設のwalkイベントID
      if (walkEv && visitedEventIds.includes(walkEv._id)) return false;

      return true;
    });

    if (facLoading || walkLoading) return <div style={{ color: "var(--color-base1)" }}>読み込み中...</div>;
    if (facError) return <div style={{ color: "tomato" }}>施設の取得に失敗：{facError}</div>;
    if (walkError) return <div style={{ color: "tomato" }}>イベント索引の取得に失敗：{walkError}</div>;

    return (
      <div>
        {filtered.map((fac) => (
          <button
            key={fac.id}
            onClick={() => onSelect(fac.id)}
            style={{ display: "block", margin: "8px 0" }}
          >
            {fac.name}
          </button>
        ))}
      </div>
    );
  };

  // 施設選択時：イベントはAPIから取得
  const onSelectFacility = async (facilityId) => {
    if (!facilityId || facilityId === "fac_000") return;

    const facData = facilities.find((f) => f.id === facilityId);
    if (!facData) return;

    setSelectedFacility(facData);

    try {
      // walk を優先
      const walkRes = await fetch(
        `/api/events?type=walk&locationId=${encodeURIComponent(facilityId)}`
      );
      if (!walkRes.ok) throw new Error(`walk fetch HTTP ${walkRes.status}`);
      const walkArr = await walkRes.json();

      // なければ epilogue
      let evData = Array.isArray(walkArr) && walkArr[0] ? walkArr[0] : null;
      if (!evData) {
        const epiRes = await fetch("/api/events?type=epilogue");
        if (!epiRes.ok) throw new Error(`epilogue fetch HTTP ${epiRes.status}`);
        const epiArr = await epiRes.json();
        evData = Array.isArray(epiArr) ? epiArr[0] : null;
      }

      if (!evData) {
        console.warn("該当イベントが見つかりませんでした");
        return;
      }
      setSelectedEvent(evData);
      setSpotSelected(true);
    } catch (e) {
      console.warn("イベント取得に失敗:", e);
    }
  };

  // SNS 選択：API 化
  const onSelectSnsEvent = async () => {
    try {
      const res = await fetch(
        `/api/events?type=sns&timeSlot=${encodeURIComponent(currentTimeSlot)}`
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
      minH="100dvh"
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
            justifyContent={"space-between"}
            position="relative"
          >
            {/* マップ土台（実マップをここに差し替え予定） */}
            <Box
              className="mapUI"
              position="absolute"
              inset={0}
              zIndex={0}
              width={"100%"}
              height={"100%"}
              backgroundColor={"var(--color-accent10)"}
            >
              {/* 仮の施設選択リスト（マップ実装後はロジックだけ移植） */}
              <FacilityList
                currentTimeSlot={currentTimeSlot}
                onSelect={onSelectFacility}
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
              onClick={() => {
                if (spotSelected) setSpotSelected(false);
              }}
            >
              <MapMarkerLegend />
              {spotSelected && selectedFacility && (
                <Flex
                  pointerEvents="auto"
                  width={"100%"}
                  justifyContent="center"
                  onClick={(e) => e.stopPropagation()}
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
                </Flex>
              )}
            </Flex>

            {/* 確認ダイアログ（モーダル） */}
            {showConfirmDialog && selectedFacility && (
              <>
                <Box
                  position="absolute"
                  top={0}
                  left={0}
                  w="100%"
                  h="100%"
                  bg="rgba(0,0,0,0.5)"
                  zIndex={2}
                />
                <Flex
                  position="absolute"
                  top="50%"
                  left="50%"
                  transform="translate(-50%, -50%)"
                  zIndex={3}
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
