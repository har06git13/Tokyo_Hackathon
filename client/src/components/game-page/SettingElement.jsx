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
  alertMessage,
  onClick,
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    // onClick が渡されてたらそれ優先
    if (onClick) {
      onClick();
      return;
    }

    if (alertMessage) {
      alert(alertMessage);
    }
    if (operation === "button" && to) {
      navigate(to);
    }
  };

  let borderRadiusValue = "0";
  if (type === "top") borderRadiusValue = "1vh 1vh 0 0";
  else if (type === "bottom") borderRadiusValue = "0 0 1vh 1vh";
  else if (type === "alone") borderRadiusValue = "1vh";

  return (
    <Flex
      className={"setting-element"}
      backgroundColor={"var(--color-base10)"}
      width={"90%"}
      height={"4.6vh"}
      borderRadius={borderRadiusValue}
      boxShadow={
        type === "center"
          ? "inset 0 0.05vh 0 var(--color-base13), inset 0 -0.05vh 0 var(--color-base13)"
          : type === "top"
          ? "inset 0 -0.05vh 0 var(--color-base13)"
          : type === "bottom"
          ? "inset 0 0.05vh 0 var(--color-base13)"
          : "none"
      }
      alignItems={"center"}
      justifyContent={"space-between"}
      paddingX={"2vh"}
      onClick={handleClick}
    >
      <Text className="text-maintext" color={textColor}>
        {text}
      </Text>

      {operation === "button" && (
        <ArrowIcon height="100%" width="2%" color="var(--color-base13)" />
      )}

      {operation === "toggle" && <Toggle />}
    </Flex>
  );
};

SettingElement.propTypes = {
  operation: PropTypes.oneOf(["toggle", "button"]),
  type: PropTypes.oneOf(["center", "alone", "top", "bottom"]),
  text: PropTypes.string,
  to: PropTypes.string,
  textColor: PropTypes.string,
  alertMessage: PropTypes.string,
};
