import PropTypes from "prop-types";
import React from "react";
import { LifeGauge } from "../common";
import { Flex, Text } from "@chakra-ui/react";
import { useAtom } from "jotai";
import { playerNameAtom } from "../../atoms/playerAtoms";
import { spotTypes, eventTypes } from "../TypeList";

export const LogElement = ({
  eventtype,
  spot = "施設の名前",
  spottype,
  time = "14:30",
  eventtime = "0時間30分",
  text = "イベントの内容",
}) => {
  const [playerName] = useAtom(playerNameAtom);

  const getDescriptionByType = () => {
    switch (eventtype) {
      case "time":
        return "毎時00分に体力・精神力・電源を5%消費します";
      case "event":
        return text;
      case "walk":
        return undefined;
      case "sns":
        return "いくつかの情報を手に入れた。";
      default:
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
          {time}
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
            {eventTypes[eventtype] ?? eventTypes.default}
          </Text>
          <Text className="text-subtext" color="var(--color-base13)">
            地点：{spot}
          </Text>
        </Flex>
        {/* 施設タイプ & イベント内容 */}
        <Flex flexDirection="column">
          {eventtype === "event" && (
            <Text className="text-maintext">
              施設タイプ：{spotTypes[spottype] ?? spotTypes.default}
            </Text>
          )}
          {getDescriptionByType() && (
            <Text className="text-subtext" color="var(--color-base13)">
              {getDescriptionByType()}
            </Text>
          )}
        </Flex>
        {/* ゲージ */}
        <Flex flexDirection="column" gap="1vw">
          <Text className="text-subtext">変動後ゲージ</Text>
          <LifeGauge howto={false} />
        </Flex>
        {/* 所要時間 */}
        <Text className="text-maintext">所要時間：{eventtime}</Text>
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
