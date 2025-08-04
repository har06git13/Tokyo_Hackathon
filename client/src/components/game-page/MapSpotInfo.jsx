import PropTypes from "prop-types";
import React from "react";
import { Button, LifeGauge } from "../common";
import { Flex, Text } from "@chakra-ui/react";
import { spotTypes, spotStatusTypes } from "../TypeList";

export const MapSpotInfo = ({
  type = "action", // "map" or "action"
  spotstatus = "default",
  spottype,
  spotname = "施設名を設定",
  arrivaltime = "14:30",
  life,
  mental,
  charge,
  money,
  onClick,
}) => {
  return (
    <Flex
      className={"map-spot-info"}
      flexDirection={"column"}
      width={"90vw"}
      backgroundColor={"var(--color-base10)"}
      marginBottom={type === "map" ? "4vw" : 0}
      borderRadius={type === "map" ? "3vw" : "3vw 3vw 0 0"}
      paddingX={"4vw"}
      paddingY={"5vw"}
      gap={"4vw"}
    >
      <Flex flexDirection={"column"} gap={"2vw"}>
        <Flex flexDirection={"column"}>
          <Flex width={"100%"} justifyContent={"space-between"}>
            <Text
              className="text-maintext"
              color={
                spotstatus === "default"
                  ? "var(--color-accent20)"
                  : "var(--color-base13)"
              }
            >
              {spotStatusTypes[spotstatus] ?? spotStatusTypes.default}
            </Text>

            <Text className="text-maintext" color={"var(--color-base13)"}>
              施設タイプ：{spotTypes[spottype] ?? spotTypes.default}
            </Text>
          </Flex>

          <Text className="text-sectiontitle">{spotname}</Text>
        </Flex>

        {type === "action" && (
          <>
            <Flex flexDirection={"column"} gap={"1vw"}>
              <Text className="text-maintext">想定所要ゲージ</Text>
              <LifeGauge
                howto={false}
                life={life}
                mental={mental}
                charge={charge}
                money={money}
              />
            </Flex>

            <Flex flexDirection={"column"} gap={"1vw"}>
              <Text className="text-maintext" color={"var(--color-accent10)"}>
                到着予定時刻：{arrivaltime}
              </Text>

              <Text className="text-subtext" color={"var(--color-base13)"}>
                ※想定外の変動が起こることがあります。災害時は予測不能な事態が起こりうるため、ご注意ください。
              </Text>
            </Flex>
          </>
        )}
      </Flex>

      {type === "action" && (
        <Button
          isAvailable
          text="ここに移動する"
          height="7.6vw"
          onClick={onClick}
        />
      )}
    </Flex>
  );
};

MapSpotInfo.propTypes = {
  type: PropTypes.oneOf(["map", "action"]),
  spotstatus: PropTypes.oneOf(Object.keys(spotStatusTypes)),
  spottype: PropTypes.oneOf(Object.keys(spotTypes)),
  spotname: PropTypes.string,
  arrivaltime: PropTypes.string,
  life: PropTypes.number,
  mental: PropTypes.number,
  charge: PropTypes.number,
  money: PropTypes.number,
  onClick: PropTypes.func,
};
