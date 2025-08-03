import React from "react";
import PropTypes from "prop-types";
import { Text, Flex } from "@chakra-ui/react";

export const SettingInfoIndex = ({ text = "ゲームの目的" }) => {
  return (
    <Flex
      className="setting-info-index"
      width={"90vw"}
      borderBottom={"0.8vw solid var(--color-theme10)"}
      height={"10.6vw"}
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
