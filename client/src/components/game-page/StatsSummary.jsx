import React from "react";
import { Flex, Text } from "@chakra-ui/react";
import PropTypes from "prop-types";

/**
 * StatsSummary - プレイ統計をカード形式で表示するコンポーネント
 *
 * @param {number|null} totalDistance - 総移動距離（km）、nullの場合は「— km」と表示
 * @param {number} visitedCount - 訪問施設数
 * @param {Object} elapsedTime - 経過時間 { hours: number, minutes: number }
 * @param {number} moneyValue - 使用した（所有）お金（ゲージ値 0-100）
 * @param {number} snsCount - SNS利用回数
 */
export const StatsSummary = ({
  totalDistance,
  visitedCount,
  elapsedTime,
  moneyValue,
  snsCount,
}) => {
  // 表示項目（順番：総移動距離 → 経過時間 → 訪問施設数 → 使用したお金 → SNS利用回数）
  const stats = [
    {
      label: "総移動距離",
      value: totalDistance !== null ? `${totalDistance.toFixed(1)} km` : "— km",
    },
    {
      label: "経過時間",
      value: `${elapsedTime.hours}時間${elapsedTime.minutes}分`,
    },
    {
      label: "訪問施設数",
      value: `${visitedCount} 箇所`,
    },
    {
      label: "使用したお金",
      value: `${moneyValue}`,
    },
    {
      label: "SNS利用回数",
      value: `${snsCount} 回`,
    },
  ];

  return (
    <Flex
      className="stats-summary"
      width={"90%"}
      flexDirection={"column"}
      mt={"2vh"}
    >
      {/* ヘッダー行 */}
      <Flex
        paddingY={"1vh"}
        paddingX={"4%"}
        borderBottom="0.1vh solid var(--color-base131)"
        borderRadius={"2vh 2vh 0 0 "}
        backgroundColor={"var(--color-base10)"}
      >
        <Text className="text-maintext">プレイ統計</Text>
      </Flex>

      {/* ボディ行 - 5項目をwrap表示 */}
      <Flex
        paddingTop={"1vh"}
        paddingBottom={"2vh"}
        paddingX={"4%"}
        flexDirection="column"
        backgroundColor={"var(--color-base10)"}
        borderRadius={"0 0 2vh 2vh"}
        gap="1.5vh"
      >
        {/* 5項目を flexWrap で2行配置（ラベル上、数値下） */}
        <Flex flexWrap="wrap" gap="2%" width="100%">
          {stats.map((stat, index) => (
            <Flex
              key={index}
              flexDirection="column"
              gap="0.3vh"
              flex={{ base: "1 1 45%", md: "1 1 30%" }}
              minWidth="100px"
            >
              <Text className="text-maintext">
                {stat.label}
              </Text>
              <Text
                className="text-sectiontitle"
                color={"var(--color-theme10)"}
                fontWeight="bold"
              >
                {stat.value}
              </Text>
            </Flex>
          ))}
        </Flex>
      </Flex>
    </Flex>
  );
};

StatsSummary.propTypes = {
  totalDistance: PropTypes.number,
  visitedCount: PropTypes.number.isRequired,
  elapsedTime: PropTypes.shape({
    hours: PropTypes.number.isRequired,
    minutes: PropTypes.number.isRequired,
  }).isRequired,
  moneyValue: PropTypes.number.isRequired,
  snsCount: PropTypes.number.isRequired,
};
