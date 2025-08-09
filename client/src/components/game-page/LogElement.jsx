import PropTypes from "prop-types";
import React from "react";
import { LifeGauge } from "../common";
import { Flex, Text } from "@chakra-ui/react";
import { useAtom } from "jotai";
import { playerNameAtom, gaugeHistoryAtom } from "../../atoms/playerAtoms";
import { eventTypes } from "../../TypeList";
import { eventList, facilityList } from "../../temporary-database";

export const LogElement = ({ id, time }) => {
  const [playerName] = useAtom(playerNameAtom);
  const [gaugeHistory] = useAtom(gaugeHistoryAtom);

  const event = eventList.find((e) => e.id === id);
  const facility = event
    ? facilityList.find((f) => f.id === event.locationId)
    : null;

  const formatTime = (date) => {
    if (!(date instanceof Date)) return "";
    const hh = String(date.getHours()).padStart(2, "0");
    const mm = String(date.getMinutes()).padStart(2, "0");
    return `${hh}:${mm}`;
  };

  // timeに一致するゲージ履歴を探す
  const gauge = gaugeHistory.find((g) => g.time.getTime() === time.getTime());

  const getDescriptionByType = () => {
    switch (event?.type) {
      case "time":
        return "毎時00分に体力・精神力・電源を5%消費します";
      case "walk":
        return event.text;
      case "sns":
        return "いくつかの情報を手に入れた。";
      case "prologue":
        return `${playerName}は被災した。`;
    }
  };

  return (
    <Flex className="log-element" width="90vw" alignItems="center">
      {/* 時間表示 */}
      <Flex
        width="10vw"
        backgroundColor="var(--color-base12)"
        height="8vw"
        alignItems="center"
      >
        <Text className="text-subtext" color="var(--color-base13)">
          {formatTime(time)}
        </Text>
      </Flex>

      {/* メインログ表示 */}
      <Flex
        width="80vw"
        flexDirection="column"
        px="4vw"
        py="3vw"
        backgroundColor="var(--color-base10)"
        borderRadius="3vw"
        gap="2vw"
      >
        {/* ログタイトル & 地点 */}

        <Flex flexDirection="column">
          <Text className="text-sectiontitle">
            {event ? eventTypes[event.type] : "不明なイベント"}
          </Text>
          {event?.type !== "time" && event?.type !== "sns" && (
            <Text className="text-subtext" color="var(--color-base13)">
              移動先：{facility?.name}
            </Text>
          )}
        </Flex>

        {/* 施設タイプ & イベント内容 */}
        <Flex flexDirection="column">
          {event?.type === "walk" && (
            <Text className="text-maintext">
              施設タイプ：
              {facility.type}
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
          <Flex flexDirection="column" gap="1vw">
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
            所要時間：{event?.requiredDuration}分
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
  time: PropTypes.string,
  eventtime: PropTypes.string,
  text: PropTypes.string,
};
