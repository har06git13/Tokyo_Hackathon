import { useAtom } from "jotai";
import { useNavigate } from "react-router-dom";
import {
  selectedEventAtom,
  selectedFacilityAtom,
  currentEventStatusAtom,
  currentTimeAtom,
  lifeAtom,
  mentalAtom,
  chargeAtom,
  moneyAtom,
  eventHistoryAtom,
  visitedFacilitiesAtom,
  gaugeHistoryAtom,
} from "../atoms/playerAtoms";
import { eventList } from "../temporary-database";

export const useMonologueLogic = () => {
  const navigate = useNavigate();
  const [selectedEvent, setSelectedEvent] = useAtom(selectedEventAtom);
  const [, setSelectedFacility] = useAtom(selectedFacilityAtom);
  const [, setCurrentEventStatus] = useAtom(currentEventStatusAtom);
  const [currentTime, setCurrentTime] = useAtom(currentTimeAtom);
  const [life, setLife] = useAtom(lifeAtom);
  const [mental, setMental] = useAtom(mentalAtom);
  const [charge, setCharge] = useAtom(chargeAtom);
  const [money, setMoney] = useAtom(moneyAtom);
  const [, setEventHistory] = useAtom(eventHistoryAtom);
  const [, setVisitedFacilities] = useAtom(visitedFacilitiesAtom);
  const [, setGaugeHistory] = useAtom(gaugeHistoryAtom);

  setCurrentEventStatus("monologue");

  if (!selectedEvent) {
    // ここはhook内でreturnしちゃうか、外側で条件チェックしてもOK
    return { selectedEvent: null };
  }

  const timeEvent = eventList.find((e) => e.id === "event_time_001");
  const isTimeEventActive =
    !(currentTime.getHours() === 14) && currentTime.getMinutes() === 0;

  const combinedTexts =
    isTimeEventActive && timeEvent
      ? [...timeEvent.texts, ...selectedEvent.texts]
      : selectedEvent.texts;

  const combinedGaugeChange = {
    life:
      selectedEvent.gaugeChange.life +
      (isTimeEventActive && timeEvent?.gaugeChange?.life),
    mental:
      selectedEvent.gaugeChange.mental +
      (isTimeEventActive && timeEvent?.gaugeChange?.mental),
    battery:
      selectedEvent.gaugeChange.battery +
      (isTimeEventActive && timeEvent?.gaugeChange?.battery),
    money:
      selectedEvent.gaugeChange?.money +
      (isTimeEventActive && timeEvent?.gaugeChange?.money),
  };

  const buttonConfig = {
    prologue: { text: "避難を開始する", next: "../action" },
    epilogue: { text: "リザルトを見る", next: "../../result" },
    sns: { text: "閉じる", next: "../" },
    walk: { text: "閉じる", next: "../" },
  };

  const { text: buttonText } = buttonConfig[selectedEvent.type] || {};

  const handleButtonClick = () => {
    const newLife = Math.max(0, Math.min(100, life + combinedGaugeChange.life));
    const newMental = Math.max(
      0,
      Math.min(100, mental + combinedGaugeChange.mental)
    );
    const newCharge = Math.max(
      0,
      Math.min(100, charge + combinedGaugeChange.battery)
    );
    const newMoney = Math.max(
      0,
      Math.min(100, money + combinedGaugeChange.money)
    );

    setLife(newLife);
    setMental(newMental);
    setCharge(newCharge);
    setMoney(newMoney);

    if (selectedEvent.type !== "prologue") {
      setGaugeHistory((prev) => [
        ...prev,
        {
          time: currentTime,
          life: newLife,
          mental: newMental,
          charge: newCharge,
          money: newMoney,
        },
      ]);
    }

    if (isTimeEventActive && timeEvent) {
      setEventHistory((prev) => [
        ...prev,
        { id: timeEvent.id, time: currentTime },
        { id: selectedEvent.id, time: currentTime },
      ]);
    } else {
      setEventHistory((prev) => [
        ...prev,
        { id: selectedEvent.id, time: currentTime },
      ]);
    }

    if (selectedEvent.requiredDuration) {
      const newTime = new Date(currentTime.getTime());
      newTime.setMinutes(newTime.getMinutes() + selectedEvent.requiredDuration);
      setCurrentTime(newTime);
    }

    if (selectedEvent.locationId) {
      setVisitedFacilities((prev) => {
        if (prev.includes(selectedEvent.locationId)) return prev;
        return [...prev, selectedEvent.locationId];
      });
    }

    // 選択をリセット
    setSelectedEvent(null);
    setSelectedFacility(null);
    setCurrentEventStatus(null);

    navigate("/game/action");
  };

  return {
    selectedEvent,
    currentTime,
    combinedTexts,
    buttonText,
    handleButtonClick,
  };
};
