import PropTypes from "prop-types";
import React from "react";
import { ArrowIcon } from "../icons";
import { Toggle } from "../common";
import { Flex, Text } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

export const SettingElement = ({
  operation = "toggle", // "toggle" or "button"
  type = "center", // "center", "alone", "top", "bottom"
  text = "基本操作",
  to, // 遷移先のパス（operationが"button"の場合のみ必要）
  textColor,
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (operation === "button" && to) {
      navigate(to);
    }
  };

  let borderRadiusValue = "0";
  if (type === "top") borderRadiusValue = "3vw 3vw 0 0";
  else if (type === "bottom") borderRadiusValue = "0 0 3vw 3vw";
  else if (type === "alone") borderRadiusValue = "3vw";

  return (
    <Flex
      className={"setting-element"}
      backgroundColor={"var(--color-base10)"}
      width={"90vw"}
      height={"10.6vw"}
      borderRadius={borderRadiusValue}
      borderTop={type === "center" ? "0.1vw solid var(--color-base13)" : "0"}
      borderBottom={type === "center" ? "0.1vw solid var(--color-base13)" : "0"}
      alignItems={"center"}
      justifyContent={"space-between"}
      paddingX={"4vw"}
      onClick={handleClick}
    >
      <Text className="text-maintext" color={textColor}>
        {text}
      </Text>

      {operation === "button" && (
        <ArrowIcon height="3vw" width="1.7vw" color="var(--color-base13)" />
      )}

      {operation === "toggle" && <Toggle />}
    </Flex>
  );
};

SettingElement.propTypes = {
  operation: PropTypes.oneOf(["toggle", "button"]),
  type: PropTypes.oneOf(["center", "alone", "top", "bottom"]),
  text: PropTypes.string,
};
