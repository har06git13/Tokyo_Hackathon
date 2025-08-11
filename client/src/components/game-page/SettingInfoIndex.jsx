import React from "react";
import PropTypes from "prop-types";
import { Text, Flex } from "@chakra-ui/react";

export const SettingInfoIndex = ({ text = "ゲームの目的" }) => {
  return (
    <Flex
      className="setting-info-index"
      width={"100%"}
      borderBottom={"0.4vh solid var(--color-theme10)"}
      height={"4vh"}
      alignItems={"center"}
      justifyContent={"space-between"}
    >
      <Text className="text-sectiontitle">{text}</Text>
    </Flex>
  );
};

SettingInfoIndex.propTypes = {
  text: PropTypes.string,
};
