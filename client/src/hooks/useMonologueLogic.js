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
  survivedAtom,
  playerNameAtom,
} from "../atoms/playerAtoms";
import { eventList } from "../temporary-database";

export const useMonologueLogic = () => {
  const navigate = useNavigate();

  // state読み込み
  const [survived, setSurvived] = useAtom(survivedAtom);
  const [playerName] = useAtom(playerNameAtom);
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

  if (!selectedEvent) {
    return { selectedEvent: null };
  }

  // 死亡フラグ設定
  const isEvacuationFailure = life + selectedEvent.gaugeChange.life <= 0;
  if (isEvacuationFailure) {
    setSurvived(false);
  }

  // 時間経過によるゲージ変動の設定
  const timeEvent = eventList.find((e) => e.id === "event_time_001");
  const isTimeEventActive =
    currentTime.getMinutes() === 0 && currentTime.getHours() !== 14;

  // 表示テキストの結合
  const combinedTexts =
    survived === false
      ? [
          ...selectedEvent.texts,
          { type: "system", isDecrease: true, text: "体力が0になった。" },
          {
            type: "system",
            isDecrease: true,
            text: `${playerName}は避難に失敗した。`,
          },
        ]
      : isTimeEventActive && timeEvent
      ? [...timeEvent.texts, ...selectedEvent.texts]
      : selectedEvent.texts;

  // ゲージ変動計算関数
  const getSafeValue = (value) => (value ? value : 0);
  const combinedGaugeChange = {
    life:
      getSafeValue(selectedEvent.gaugeChange.life) +
      (isTimeEventActive ? getSafeValue(timeEvent?.gaugeChange?.life) : 0),
    mental:
      getSafeValue(selectedEvent.gaugeChange.mental) +
      (isTimeEventActive ? getSafeValue(timeEvent?.gaugeChange?.mental) : 0),
    battery:
      getSafeValue(selectedEvent.gaugeChange.battery) +
      (isTimeEventActive ? getSafeValue(timeEvent?.gaugeChange?.battery) : 0),
    money:
      getSafeValue(selectedEvent.gaugeChange.money) +
      (isTimeEventActive ? getSafeValue(timeEvent?.gaugeChange?.money) : 0),
  };

  // ボタン表示設定
  const buttonConfig = {
    prologue: { text: "避難を開始する", next: "/game/action" },
    epilogue: { text: "リザルトを見る", next: "/result" },
    sns: { text: "閉じる", next: "/game/action" },
    walk: { text: "閉じる", next: "/game/action" },
  };
  const currentButtonType =
    survived === false ? "epilogue" : selectedEvent.type;
  const { text: buttonText, next: nextPath } =
    buttonConfig[currentButtonType] || {};

  // ゲージの増減反映用ヘルパー
  const clampGauge = (val) => Math.max(0, Math.min(100, val));

  // === ボタンクリック処理 ===
  const handleButtonClick = () => {
    // ゲージ値計算
    const newLife = clampGauge(life + combinedGaugeChange.life);
    const newMental = clampGauge(mental + combinedGaugeChange.mental);
    const newCharge = clampGauge(charge + combinedGaugeChange.battery);
    const newMoney = clampGauge(money + combinedGaugeChange.money);

    // ゲージ更新
    setLife(newLife);
    setMental(newMental);
    setCharge(newCharge);
    setMoney(newMoney);

    // ゲージ変動履歴に記録
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

    // イベント履歴追加
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

    // 時間更新
    if (selectedEvent.requiredDuration) {
      const newTime = new Date(currentTime.getTime());
      newTime.setMinutes(newTime.getMinutes() + selectedEvent.requiredDuration);
      setCurrentTime(newTime);
    }

    // 訪問施設更新
    if (selectedEvent.locationId) {
      setVisitedFacilities((prev) =>
        prev.includes(selectedEvent.locationId)
          ? prev
          : [...prev, selectedEvent.locationId]
      );
    }

    // 選択リセット
    setSelectedEvent(null);
    setSelectedFacility(null);
    setCurrentEventStatus(null);

    // 遷移先へ
    navigate(nextPath);
  };

  return {
    selectedEvent,
    currentTime,
    combinedTexts,
    buttonText,
    handleButtonClick,
  };
};
