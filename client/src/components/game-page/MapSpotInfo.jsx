import PropTypes from "prop-types";
import React from "react";
import { Button, LifeGauge } from "../common";
import { Flex, Text } from "@chakra-ui/react";
import { spotTypeList, spotStatusTypeList } from "../../temporary-database";

export const MapSpotInfo = ({
  type = "action", // "map" or "action"
  spotStatus = "default",
  spotType,
  spotName = "施設名を設定",
  arrivalTime = "14:30",
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
      width={"100%"}
      backgroundColor={"var(--color-base10)"}
      marginBottom={type === "map" ? "2vh" : 0}
      borderRadius={type === "map" ? "1vh" : "3vh 3vh 0 0"}
      paddingX={"3vh"}
      paddingTop={"3vh"}
      paddingBottom={"2vh"}
      gap={"1vh"}
      marginLeft="auto"
      marginRight="auto"
      boxSizing="border-box"
    >
      <Flex flexDirection={"column"} width={"100%"} gap={"1.6vh"}>
        <Flex flexDirection={"column"}>
          <Flex width={"100%"} justifyContent={"space-between"}>
            <Text
              className="text-maintext"
              color={
                spotStatus === "default"
                  ? "var(--color-accent20)"
                  : "var(--color-base13)"
              }
            >
              {spotStatusTypeList[spotStatus] ?? spotStatusTypeList.default}
            </Text>

            <Text className="text-maintext" color={"var(--color-base13)"}>
              施設タイプ：
              {spotTypeList[spotType]?.name ?? spotTypeList.default.name}
            </Text>
          </Flex>

          <Text className="text-sectiontitle">{spotName}</Text>
        </Flex>

        {type === "action" && (
          <>
            <Flex flexDirection={"column"} gap={"4%"} width={"100%"}>
              <Text className="text-maintext">想定所要ゲージ</Text>
              <LifeGauge
                howto={false}
                life={life}
                mental={mental}
                charge={charge}
                money={money}
              />
            </Flex>

            <Flex flexDirection={"column"} width={"100%"}>
              <Text className="text-maintext" color={"var(--color-accent10)"}>
                到着予定時刻：{arrivalTime}
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
          height="4vh"
          onClick={onClick}
        />
      )}
    </Flex>
  );
};

MapSpotInfo.propTypes = {
  type: PropTypes.oneOf(["map", "action"]),
  spotStatus: PropTypes.oneOf(Object.keys(spotStatusTypeList)),
  spotType: PropTypes.oneOf(Object.keys(spotTypeList)),
  spotName: PropTypes.string,
  arrivalTime: PropTypes.string,
  life: PropTypes.number,
  mental: PropTypes.number,
  charge: PropTypes.number,
  money: PropTypes.number,
  onClick: PropTypes.func,
};
