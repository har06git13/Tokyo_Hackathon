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
  const [, setCurrentEventStatus] = useAtom(currentEventStatusAtom);
  const [currentLocationName] = useAtom(currentLocationAtom);
  const [visitedFacilities] = useAtom(visitedFacilitiesAtom);

  // 現在地の施設オブジェクトを取得
  const currentLocationFacility = facilityList.find(fac => fac.name === currentLocationName);

  // チェックイン状態を判定する関数
  const getFacilityStatus = (facilityId) => {
    const visitedEventIds = eventHistory.map((e) => e.id);
    const hasVisited = eventList.some(
      (ev) => ev.locationId === facilityId && visitedEventIds.includes(ev.id)
    );
    const isCurrentLocation = currentLocationFacility?.id === facilityId;
    
    return {
      isVisited: hasVisited,
      isCurrentLocation: isCurrentLocation,
      isCheckedIn: visitedFacilities.includes(facilityId)
    };
  };

  // 施設の状態情報をマップして渡す
  const facilityStatusMap = facilityList.reduce((acc, facility) => {
    acc[facility.id] = getFacilityStatus(facility.id);
    return acc;
  }, {});

  useEffect(() => {
    setSpotSelected(false);
  }, [actionType]);

  // マップAPIが実装されるまでの仮の施設選択リスト
  const FacilityList = ({ currentTimeSlot, onSelect }) => {
    const visitedEventIds = eventHistory.map((e) => e.id);
    const filteredFacilities = facilityList.filter((fac) => {
      if (fac.id === "fac_000") return false;
      if (fac.type === "shelter") {
        return ["6h", "8h", "10h"].includes(currentTimeSlot);
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
  const onSelectFacility = (facilityData) => {
    // facilityDataが文字列（ID）かオブジェクトかを判定
    let facilityId, facData;
    
    if (typeof facilityData === 'string') {
      facilityId = facilityData;
      facData = facilityList.find((fac) => fac.id === facilityId);
    } else {
      // オブジェクトの場合
      facilityId = facilityData.id;
      facData = facilityData;
    }
    
    if (facilityId === "fac_000") return; // ここで即リターンして無視

    const evData =
      eventList.find(
        (ev) => ev.locationId === facilityId && ev.type === "walk"
      ) || eventList.find((ev) => ev.type === "epilogue");

    setSelectedFacility(facData);
    setSelectedEvent(evData);
    setSpotSelected(true);
    console.log(selectedFacility);
    console.log(selectedEvent);
  };

  // snsを選択した場合のイベントセット
  const onSelectSnsEvent = () => {
    const evData = eventList.find(
      (ev) => ev.type === "sns" && ev.timeSlot === currentTimeSlot
    );
    if (evData) {
      setSelectedEvent(evData);
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
      <Flex className="page-contents" gap={"1.6%"} paddingTop={"4%"}>
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
            {/* Google Map Component */}
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
              />
            </Box>

            {/* マップ凡例 - 絶対配置で上に表示 */}
            <Box
              position="absolute"
              top="16px"
              left="16px"
              zIndex={100}
            >
              <MapMarkerLegend />
            </Box>

            {/* デバッグ用：仮の施設選択リスト */}
            {process.env.NODE_ENV === 'development' && false && (
              <FacilityList
                currentTimeSlot={currentTimeSlot}
                onSelect={onSelectFacility}
              />
            )}

            {spotSelected && !showConfirmDialog && (
              <Box
                position="absolute"
                bottom="16px"
                left="50%"
                transform="translateX(-50%)"
                zIndex={10}
                width="90%" 
                maxWidth="400px"
              >
                <MapSpotInfo
                  spotName={selectedFacility.name}
                  spotType={selectedFacility.type}
                  life={selectedEvent?.gaugeChange.life}
                  mental={selectedEvent?.gaugeChange.mental}
                  charge={selectedEvent?.gaugeChange.battery}
                  money={selectedEvent?.gaugeChange.money}
                  arrivalTime={arrivalTime}
                  onClick={() => setShowConfirmDialog(true)}
                />
              </Box>
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
                    life={selectedEvent.gaugeChange.life}
                    mental={selectedEvent.gaugeChange.mental}
                    charge={selectedEvent.gaugeChange.battery}
                    money={selectedEvent.gaugeChange.money}
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
              life={selectedEvent?.gaugeChange.life}
              mental={selectedEvent?.gaugeChange.mental}
              charge={selectedEvent?.gaugeChange.battery}
              money={selectedEvent?.gaugeChange.money}
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
