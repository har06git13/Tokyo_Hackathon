import { useAtom } from "jotai";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
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
//import { eventList } from "../temporary-database";

export const useMonologueLogic = () => {
  const navigate = useNavigate();
  const { eventId } = useParams();
  // URL直指定時の補完用
  const [fetchedEvent, setFetchedEvent] = useState(null);
  const [timeEvent, setTimeEvent] = useState(null);

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


  // selectedEvent が無い場合だけ API から取得（/api/events/:id）
  useEffect(() => {
    let aborted = false;
    (async () => {
      if (selectedEvent || !eventId) return;
      try {
        const res = await fetch(`/api/events/${encodeURIComponent(eventId)}`);
        if (!res.ok) throw new Error('not found');
        const data = await res.json(); // {_id, ...}
        // 既存ロジック互換のため _id → id に正規化
        if (!aborted) setFetchedEvent({ id: data._id, ...data });
      } catch {
        if (!aborted) setFetchedEvent(null);
      }
    })();
    return () => { aborted = true; };
  }, [selectedEvent, eventId]);

  // 時間イベントはDBから取得（固定ID: event_time_001）
  useEffect(() => {
    let aborted = false;
    (async () => {
      try {
        const res = await fetch('/api/events/event_time_001');
        if (!res.ok) return;
        const data = await res.json();
        // こちらも id に正規化
        if (!aborted) setTimeEvent({ id: data._id, ...data });
      } catch {}
    })();
    return () => { aborted = true; };
  }, []);

  // 実際に使うイベント（Jotai優先、無ければAPI）
  const effectiveEvent = selectedEvent ?? fetchedEvent;

  //if (!selectedEvent) {
  if (!effectiveEvent) {
    return { selectedEvent: null };
  }

  // 死亡フラグ設定
  //const isEvacuationFailure = life + selectedEvent.gaugeChange.life <= 0;
  const isEvacuationFailure = life + (effectiveEvent.gaugeChange?.life ?? 0) <= 0;
  if (isEvacuationFailure) {
    setSurvived(false);
  }

  // 時間経過によるゲージ変動の設定
  //const timeEvent = eventList.find((e) => e.id === "event_time_001");
  const isTimeEventActive =
    currentTime.getMinutes() === 0 && currentTime.getHours() !== 14;

  // 表示テキストの結合
  const combinedTexts =
    survived === false
      ? [
          //...selectedEvent.texts,
          ...effectiveEvent.texts,
          { type: "system", isDecrease: true, text: "体力が0になった。" },
          {
            type: "system",
            isDecrease: true,
            text: `${playerName}は避難に失敗した。`,
          },
        ]
      : isTimeEventActive && timeEvent
      ? [...(timeEvent?.texts ?? []), ...effectiveEvent.texts]
      : effectiveEvent.texts;

  // ゲージ変動計算関数
  const getSafeValue = (value) => (value ? value : 0);
  const combinedGaugeChange = {
    life:
      getSafeValue(effectiveEvent.gaugeChange?.life) +
      (isTimeEventActive ? getSafeValue(timeEvent?.gaugeChange?.life) : 0),
    mental:
      getSafeValue(effectiveEvent.gaugeChange?.mental) +
      (isTimeEventActive ? getSafeValue(timeEvent?.gaugeChange?.mental) : 0),
    battery:
      getSafeValue(effectiveEvent.gaugeChange?.battery) +
      (isTimeEventActive ? getSafeValue(timeEvent?.gaugeChange?.battery) : 0),
    money:
      getSafeValue(effectiveEvent.gaugeChange?.money) +
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
    survived === false ? "epilogue" : effectiveEvent.type;
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
    if (effectiveEvent.type !== "prologue") {
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
        { id: effectiveEvent.id, time: currentTime },
      ]);
    } else {
      setEventHistory((prev) => [
        ...prev,
        { id: effectiveEvent.id, time: currentTime },
      ]);
    }

    // 時間更新
    if (effectiveEvent.requiredDuration) {
      const newTime = new Date(currentTime.getTime());
      newTime.setMinutes(newTime.getMinutes() + effectiveEvent.requiredDuration);
      setCurrentTime(newTime);
    }

    // 訪問施設更新
    if (effectiveEvent.locationId) {
      setVisitedFacilities((prev) =>
        prev.includes(effectiveEvent.locationId)
          ? prev
          : [...prev, effectiveEvent.locationId]
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
    selectedEvent: effectiveEvent,
    currentTime,
    combinedTexts,
    buttonText,
    handleButtonClick,
  };
};
