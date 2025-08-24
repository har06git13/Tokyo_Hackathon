import PropTypes from "prop-types";
import React, { useEffect, useMemo, useState } from "react";
import { LifeGauge } from "../common";
import { Flex, Text } from "@chakra-ui/react";
import { useAtom } from "jotai";
import { playerNameAtom, gaugeHistoryAtom } from "../../atoms/playerAtoms";
import { eventTypeList, spotTypeList } from "../../temporary-database";

export const LogElement = ({ id, time }) => {
  const BASE_URL = process.env.REACT_APP_API_URL;
  const [playerName] = useAtom(playerNameAtom);
  const [gaugeHistory] = useAtom(gaugeHistoryAtom);

  // --- API state ---
  const [facilities, setFacilities] = useState([]);
  const [facErr, setFacErr] = useState(null);
  const [eventDoc, setEventDoc] = useState(null);
  const [evErr, setEvErr] = useState(null);

  // 施設一覧を取得
  useEffect(() => {
    let aborted = false;
    (async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/facilities`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const list = await res.json();
        const normalized = Array.isArray(list)
          ? list.map((f) => ({ id: f.id ?? f._id, ...f }))
          : [];
        if (!aborted) setFacilities(normalized);
      } catch (e) {
        if (!aborted) setFacErr(e.message);
      }
    })();
    return () => {
      aborted = true;
    };
  }, []);

  // イベント詳細を取得
  useEffect(() => {
    if (!id) return;
    let aborted = false;
    (async () => {
      try {
        const res = await fetch(
          `${BASE_URL}/api/events/${encodeURIComponent(id)}`
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!aborted) setEventDoc({ id: data._id ?? data.id, ...data });
      } catch (e) {
        if (!aborted) setEvErr(e.message);
        setEventDoc(null);
      }
    })();
    return () => {
      aborted = true;
    };
  }, [id]);

  // 施設参照インデックス
  const facIndex = useMemo(
    () => Object.fromEntries((facilities ?? []).map((f) => [f.id ?? f._id, f])),
    [facilities]
  );

  // 以降、従来の変数名に合わせる
  const event = eventDoc;
  const facility = event?.locationId ? facIndex[event.locationId] : null;

  const formatTime = (date) => {
    if (!(date instanceof Date)) return "";
    const hh = String(date.getHours()).padStart(2, "0");
    const mm = String(date.getMinutes()).padStart(2, "0");
    return `${hh}:${mm}`;
  };

  // time に一致するゲージ履歴
  const gauge = gaugeHistory.find((g) => g.time.getTime() === time.getTime());

  const getDescriptionByType = () => {
    switch (event?.type) {
      case "time":
        return "毎時00分に体力・精神力・電源を5%消費します";
      case "walk":
        return "施設に移動した";
      case "sns":
        return "いくつかの情報を手に入れた";
      case "prologue":
        return `${playerName}は被災した`;
    }
  };

  return (
    <Flex
      className="log-element"
      width="90%"
      alignItems="center"
      justifyContent={"space-between"}
    >
      {/* 時間表示 */}
      <Flex
        width="10%"
        backgroundColor="var(--color-base12)"
        height="4vh"
        alignItems="center"
      >
        <Text className="text-subtext" color="var(--color-base13)">
          {formatTime(time)}
        </Text>
      </Flex>

      {/* メインログ表示 */}
      <Flex
        width="90%"
        flexDirection="column"
        px="2vh"
        py="2vh"
        backgroundColor="var(--color-base10)"
        borderRadius="1vh"
        gap="1vh"
      >
        {/* ログタイトル & 地点 */}
        <Flex flexDirection="column">
          <Text className="text-sectiontitle">
            {event ? eventTypeList[event.type] ?? "イベント" : "不明なイベント"}
          </Text>
          {event?.type !== "time" && event?.type !== "sns" && (
            <Text className="text-subtext" color="var(--color-base13)">
              移動先：{facility?.name ?? "不明な施設"}
            </Text>
          )}
        </Flex>

        {/* 施設タイプ & イベント内容 */}
        <Flex flexDirection="column">
          {event?.type === "walk" && (
            <Text className="text-maintext">
              施設タイプ：
              {spotTypeList[facility?.type]?.name ?? spotTypeList.default.name}
            </Text>
          )}
          {getDescriptionByType() && (
            <Text className="text-subtext" color="var(--color-base13)">
              {getDescriptionByType()}
            </Text>
          )}
        </Flex>

        {/* ゲージ */}
        {event?.type === "time" || event?.type === "prologue" ? undefined : (
          <Flex flexDirection="column" gap="0.6vh">
            <Text className="text-subtext">変動後ゲージ</Text>
            <LifeGauge
              howto={false}
              life={gauge?.life}
              mental={gauge?.mental}
              charge={gauge?.charge}
              money={gauge?.money}
            />
          </Flex>
        )}

        {/* 所要時間 */}
        {event?.type === "time" || event?.type === "prologue" ? undefined : (
          <Text className="text-maintext">
            所要時間：{event?.requiredDuration ?? 0}分
          </Text>
        )}
      </Flex>
    </Flex>
  );
};

LogElement.propTypes = {
  eventtype: PropTypes.oneOf(["time", "event", "walk", "sns", "monologue"]),
  spot: PropTypes.string,
  spottype: PropTypes.string,
  time: PropTypes.instanceOf(Date),
  eventtime: PropTypes.string,
  text: PropTypes.string,
  id: PropTypes.string, // ← 追加しておくと良い
};
