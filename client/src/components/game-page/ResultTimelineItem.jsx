import React from "react";
import { Flex, Text } from "@chakra-ui/react";
import PropTypes from "prop-types";

/**
 * ResultTimelineItem - 「生死を分けた選択」セクション内の1つのタイムラインエントリ
 *
 * @param {string} time - 時刻（HH:mm形式）
 * @param {boolean} isSns - SNSイベントかどうか（true の場合、アクション名を "SNS を確認" にし地点行を非表示）
 * @param {string|null} facilityTypeName - 施設タイプの日本語名（isSns=false の場合のみ使用）
 * @param {string|null} facilityName - 施設名（isSns=false の場合のみ使用）
 * @param {string} significanceText - 行動の意義テキスト
 * @param {boolean} isLast - 最後のエントリかどうか（true の場合 borderBottom なし）
 */
export const ResultTimelineItem = ({
  time,
  isSns = false,
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

      {/* アクション名（赤太字）: SNS は固定テキスト、walk/epilogue は施設タイプ名 */}
      <Text
        className="text-maintext"
        color="var(--color-theme10)"
        fontWeight="bold"
      >
        {isSns ? "SNS を確認" : `${facilityTypeName}へ移動`}
      </Text>

      {/* 地点: SNS は locationId が null のため非表示 */}
      {!isSns && (
        <Text className="text-subtext" color="var(--color-base13)">
          地点：{facilityName}
        </Text>
      )}

      {/* 意義テキスト */}
      <Text className="text-maintext">
        {significanceText}
      </Text>
    </Flex>
  );
};

ResultTimelineItem.propTypes = {
  time: PropTypes.string.isRequired,
  isSns: PropTypes.bool,
  facilityTypeName: PropTypes.string,
  facilityName: PropTypes.string,
  significanceText: PropTypes.string.isRequired,
  isLast: PropTypes.bool,
};
