import React from "react";
import { Flex, Text, Box } from "@chakra-ui/react";
import PropTypes from "prop-types";

/**
 * ResultTimelineItem - 「生死を分けた選択」セクション内の1つのタイムラインエントリ
 *
 * @param {string} time - 時刻（HH:mm形式）
 * @param {string} facilityTypeName - 施設タイプの日本語名（例："モバイルバッテリースタンド"）
 * @param {string} facilityName - 施設名（例："CHARGESPOT HUB 渋谷センター街店"）
 * @param {string} significanceText - 移動の生存上の意義テキスト
 * @param {boolean} isLast - 最後のエントリかどうか（true の場合 borderBottom なし）
 */
export const ResultTimelineItem = ({
  time,
  facilityTypeName,
  facilityName,
  significanceText,
  isLast = false,
}) => {
  return (
    <Flex
      className="result-timeline-item"
      flexDirection="column"
      gap="0.5vh"
      paddingY="1.2vh"
      borderBottom={isLast ? "none" : "0.05vh solid var(--color-base131)"}
      width="100%"
    >
      {/* 時刻 */}
      <Text className="text-subtext" color="var(--color-base13)">
        {time}
      </Text>

      {/* アクション名（赤太字） */}
      <Text
        className="text-maintext"
        color="var(--color-theme10)"
        fontWeight="bold"
      >
        {facilityTypeName}へ移動
      </Text>

      {/* 地点 */}
      <Text className="text-subtext" color="var(--color-base13)">
        地点：{facilityName}
      </Text>

      {/* 意義テキスト */}
      <Text className="text-subtext" color="var(--color-base13)">
        {significanceText}
      </Text>
    </Flex>
  );
};

ResultTimelineItem.propTypes = {
  time: PropTypes.string.isRequired,
  facilityTypeName: PropTypes.string.isRequired,
  facilityName: PropTypes.string.isRequired,
  significanceText: PropTypes.string.isRequired,
  isLast: PropTypes.bool,
};
