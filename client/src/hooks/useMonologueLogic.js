import { useAtom } from "jotai";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
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
  playerAgeAtom,
  playerGenderAtom,
  playerResidenceAtom,
} from "../atoms/playerAtoms";
import { eventList } from "../temporary-database";

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
  const [eventHistory, setEventHistory] = useAtom(eventHistoryAtom);
  const [, setVisitedFacilities] = useAtom(visitedFacilitiesAtom);
  const [, setGaugeHistory] = useAtom(gaugeHistoryAtom);
  const [playerAge] = useAtom(playerAgeAtom);
  const [playerGender] = useAtom(playerGenderAtom);
  const [playerResidence] = useAtom(playerResidenceAtom);

  const BASE_URL = process.env.REACT_APP_API_URL;

  // DB の money 値（円単位）を百円単位に正規化し、ローカル eventList の gaugeSteps をマージするヘルパー
  // DB には gaugeSteps を持たせない方針のため、クライアント側でマージする
  const normalizeApiEvent = (ev) => {
    if (!ev) return ev;
    const localEvent = eventList.find((e) => e.id === ev.id);
    return {
      ...ev,
      gaugeChange: ev.gaugeChange
        ? { ...ev.gaugeChange, money: Math.round((ev.gaugeChange.money || 0) / 100) }
        : ev.gaugeChange,
      // gaugeSteps はローカル定義を使用（DB には保持しない）
      ...(localEvent?.gaugeSteps ? { gaugeSteps: localEvent.gaugeSteps } : {}),
    };
  };

  // selectedEvent が無い場合だけ API から取得（/api/events/:id）
  useEffect(() => {
    let aborted = false;
    (async () => {
      if (selectedEvent || !eventId) return;
      try {
        const res = await fetch(
          `${BASE_URL}/api/events/${encodeURIComponent(eventId)}`
        );
        if (!res.ok) throw new Error("not found");
        const data = await res.json(); // {_id, ...}
        // 既存ロジック互換のため _id → id に正規化 / money を百円単位に変換
        if (!aborted) setFetchedEvent(normalizeApiEvent({ id: data._id, ...data }));
      } catch {
        if (!aborted) setFetchedEvent(null);
      }
    })();
    return () => {
      aborted = true;
    };
  }, [selectedEvent, eventId]);

  // 時間イベントはDBから取得（固定ID: event_time_001）
  useEffect(() => {
    let aborted = false;
    (async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/events/event_time_001`);
        if (!res.ok) return;
        const data = await res.json();
        // こちらも id に正規化
        if (!aborted) setTimeEvent({ id: data._id, ...data });
      } catch {}
    })();
    return () => {
      aborted = true;
    };
  }, []);

  const postResultIfNeeded = useCallback(
    async (pathAfter) => {
      if (pathAfter !== "/result") return;
      const payload = {
        AgeType: playerAge ?? null,
        Gender: playerGender ?? null,
        ResidenceType: playerResidence ?? null,
        EventHistory:
          eventHistory?.map((e) => ({
            id: e.id,
            time:
              typeof e.time === "string"
                ? e.time
                : new Date(e.time).toISOString(),
          })) ?? [],
      };
      try {
        const res = await fetch(`${BASE_URL}/api/results`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) console.warn("Save result failed:", await res.text());
      } catch (err) {
        console.warn("Save result error:", err);
      }
    },
    [playerAge, playerGender, playerResidence, eventHistory]
  );

  // 実際に使うイベント（Jotai優先、無ければAPI）
  const effectiveEvent = selectedEvent ?? fetchedEvent;

  // 時間経過によるゲージ変動の設定
  const isTimeEventActive =
    currentTime.getMinutes() === 0 && currentTime.getHours() !== 14;

  const getSafeValue = (value) => (value ? value : 0);

  //if (!selectedEvent) {
  if (!effectiveEvent) {
    return { selectedEvent: null };
  }

  // 死亡フラグ設定（時間イベントも併せて判定）
  // gaugeSteps がある場合は life の合計を使う（gaugeChange は後方互換用のため信頼しない）
  const eventLifeChange = effectiveEvent.gaugeSteps
    ? effectiveEvent.gaugeSteps.reduce((sum, s) => sum + (s.life || 0), 0)
    : getSafeValue(effectiveEvent.gaugeChange?.life);
  const totalLifeChange =
    eventLifeChange +
    (isTimeEventActive ? getSafeValue(timeEvent?.gaugeChange?.life) : 0);

  const isEvacuationFailure = life + totalLifeChange <= 0;

  if (isEvacuationFailure) {
    setSurvived(false);
  }

  // 表示テキストの結合
  const combinedTexts =
    survived === false
      ? [
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
  const handleButtonClick = async () => {
    // gaugeSteps がある場合はそれを使用、timeEvent が発火中なら先頭に追加
    // gaugeSteps がない場合は combinedGaugeChange（timeEvent 込み）を1ステップとして扱う
    let steps;
    if (effectiveEvent.gaugeSteps) {
      steps = isTimeEventActive && timeEvent?.gaugeChange
        ? [timeEvent.gaugeChange, ...effectiveEvent.gaugeSteps]
        : [...effectiveEvent.gaugeSteps];
    } else {
      steps = [combinedGaugeChange];
    }

    let currentLife = life;
    let currentMental = mental;
    let currentCharge = charge;
    let currentMoney = money;

    // プロローグの初期データポイント記録
    if (effectiveEvent.type === "prologue") {
      setGaugeHistory([
        {
          time: currentTime,
          life,
          mental,
          charge,
          money,
        },
      ]);
    } else {
      // 各ステップを順次処理して gaugeHistory に記録
      for (const step of steps) {
        currentLife = clampGauge(currentLife + (step.life || 0));
        currentMental = clampGauge(currentMental + (step.mental || 0));
        currentCharge = clampGauge(currentCharge + (step.battery || 0));
        currentMoney = clampGauge(currentMoney + (step.money || 0));

        // スナップショット const に退避して no-loop-func を回避
        const snapLife = currentLife;
        const snapMental = currentMental;
        const snapCharge = currentCharge;
        const snapMoney = currentMoney;
        setGaugeHistory((prev) => [
          ...prev,
          {
            time: currentTime,
            life: snapLife,
            mental: snapMental,
            charge: snapCharge,
            money: snapMoney,
          },
        ]);
      }
    }

    // 最終的なゲージ値を Atom に反映
    setLife(currentLife);
    setMental(currentMental);
    setCharge(currentCharge);
    setMoney(currentMoney);

    // イベント履歴追加
    if (isTimeEventActive && timeEvent) {
      setEventHistory((prev) => [
        ...prev,
        { id: timeEvent.id ?? timeEvent._id, time: currentTime },
        { id: effectiveEvent.id ?? effectiveEvent._id, time: currentTime },
      ]);
    } else {
      setEventHistory((prev) => [
        ...prev,
        { id: effectiveEvent.id ?? effectiveEvent._id, time: currentTime },
      ]);
    }

    // 時間更新
    if (effectiveEvent.requiredDuration) {
      const newTime = new Date(currentTime.getTime());
      newTime.setMinutes(
        newTime.getMinutes() + effectiveEvent.requiredDuration
      );
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

    // リザルト遷移時のみ結果を保存（失敗しても遷移は続ける）
    try {
      await postResultIfNeeded(nextPath);
    } finally {
      navigate(nextPath);
    }
  };

  return {
    selectedEvent: effectiveEvent,
    currentTime,
    combinedTexts,
    buttonText,
    handleButtonClick,
  };
};
