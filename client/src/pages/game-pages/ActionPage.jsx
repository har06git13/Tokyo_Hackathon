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
} from "../../atoms/playerAtoms";
import { facilityList, eventList } from "../../temporary-database";

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

  useEffect(() => {
    setSpotSelected(false);
  }, [actionType]);

  // マップAPIが実装されるまでの仮の施設選択リスト
  const FacilityList = ({ currentTime, onSelect }) => {
    const visitedEventIds = eventHistory.map((e) => e.id);
    const filteredFacilities = facilityList.filter((fac) => {
      if (fac.type === "shelter") {
        return ["6h", "8h", "10h"].includes(currentTime);
      }
      // IDチェックして、訪問済みを除外
      const hasVisited = eventList.some(
        (ev) => ev.locationId === fac.id && visitedEventIds.includes(ev.id)
      );
      if (hasVisited) return false;
      return true;
    });

    return (
      <div>
        {filteredFacilities.map((fac) => (
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

  // 選択した施設を、グローバルなstateにセット
  const onSelectFacility = (facilityId) => {
    const facData = facilityList.find((fac) => fac.id === facilityId);
    const evData = eventList.find(
      (ev) => ev.locationId === facilityId && ev.type === "walk"
    );

    setSelectedFacility(facData);
    setSelectedEvent(evData);
    setSpotSelected(true);
  };

  // snsを選択した場合のイベントセット
  const onSelectSnsEvent = () => {
    const evData = eventList.find(
      (ev) => ev.type === "sns" && ev.timeSlot === currentTimeSlot
    );
    if (evData) {
      setSelectedEvent(evData);
      navigate("/game/sns");
    } else {
      console.warn("該当するSNSイベントが見つからなかったよ");
    }
  };

  // 到着時刻の計算
  const calcArrivalTime = (currentTime, requiredDuration) => {
    const arrival = new Date(currentTime.getTime());
    arrival.setMinutes(arrival.getMinutes() + requiredDuration);

    const hh = String(arrival.getHours()).padStart(2, "0");
    const mm = String(arrival.getMinutes()).padStart(2, "0");
    return `${hh}:${mm}`;
  };
  const requiredDuration =
    actionType === "sns" ? 30 : selectedEvent?.requiredDuration;
  const arrivalTime = selectedEvent
    ? calcArrivalTime(currentTime, requiredDuration)
    : null;

  return (
    <Flex
      className="page-container"
      backgroundColor={"var(--color-base12)"}
      position="relative"
    >
      <Header prevPage={false} currentPage="アクション" />
      <Flex className="page-contents" gap={"2vw"} paddingTop={"4vw"}>
        <LifeGauge />
        <EventText />
        <ActionTab
          type={actionType}
          onSnsClick={() => setActionType("sns")}
          onWalkClick={() => setActionType("walk")}
        />
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
            <MapMarkerLegend />

            {/* 仮リスト */}
            <FacilityList
              currentTime={currentTime}
              onSelect={onSelectFacility}
            />

            {spotSelected && (
              <MapSpotInfo
                spotName={selectedFacility.name}
                spotType={selectedFacility.type}
                life={selectedEvent.gaugeChange.life}
                mental={selectedEvent.gaugeChange.mental}
                charge={selectedEvent.gaugeChange.battery}
                money={selectedEvent.gaugeChange.money}
                arrivalTime={arrivalTime}
                onClick={() => setShowConfirmDialog(true)}
              />
            )}
            {showConfirmDialog && (
              <>
                <Box
                  position="absolute"
                  top={0}
                  left={0}
                  w="100%"
                  h="100%"
                  bg="rgba(0,0,0,0.5)"
                  zIndex={1}
                />
                <Flex
                  position="absolute"
                  top="50%"
                  left="50%"
                  transform="translate(-50%, -50%)"
                  zIndex={2}
                >
                  <ActionConfirmDialog
                    actionType="walk"
                    spotName={selectedFacility.name}
                    arrivalTime={arrivalTime}
                    life={selectedEvent.gaugeChange.life}
                    mental={selectedEvent.gaugeChange.mental}
                    charge={selectedEvent.gaugeChange.battery}
                    money={selectedEvent.gaugeChange.money}
                    onBackClick={() => setShowConfirmDialog(false)}
                    onClick={() => navigate("/game/walk")}
                  />
                </Flex>
              </>
            )}
          </Flex>
        )}
        {actionType === "sns" && (
          <Flex
            className="sns"
            backgroundColor={"var(--color-theme10)"}
            flex={1}
            width={"100%"}
            flexDirection={"column"}
            alignItems={"center"}
            justifyContent={"end"}
          >
            <SnsLogoIcon color="var(--color-base10)" width="20%" />
            <ActionConfirmDialog
              arrivalTime={arrivalTime}
              life={selectedEvent.gaugeChange.life}
              mental={selectedEvent.gaugeChange.mental}
              charge={selectedEvent.gaugeChange.battery}
              money={selectedEvent.gaugeChange.money}
              onClick={onSelectSnsEvent}
            />
          </Flex>
        )}
      </Flex>
      <Footer />
    </Flex>
  );
};
