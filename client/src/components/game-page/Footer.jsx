import PropTypes from "prop-types";
import React from "react";
import { ActionIcon, FootprintIcon, MapIcon } from "../icons";
import { Flex, Text } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

export const Footer = ({ type = "action", isWalking = false }) => {
  const getColor = (target) => {
    if (target === "action" && isWalking) return "var(--color-accent10)";
    if (type === target) return "var(--color-theme10)";
    return "var(--color-base13)";
  };

  const navigate = useNavigate();

  return (
    <Flex
      className={"footer"}
      width={"100vw"}
      boxShadow="inset 0 0.4px 0 rgba(0, 0, 0, 0.6)"
      backgroundColor={"var(--color-base11)"}
      paddingX={"7vw"}
      paddingTop={"2vw"}
      paddingBottom={"8vw"}
      alignItems={"center"}
      justifyContent={"space-between"}
    >
      <Flex
        flexDirection={"column"}
        height={"11vw"}
        width={"16vw"}
        alignItems={"center"}
        justifyContent={"space-between"}
        onClick={() => navigate("/game/log")}
      >
        <FootprintIcon color={getColor("log")} height="6vw" />
        <Text className={"text-subtext"} color={getColor("log")}>
          行動履歴
        </Text>
      </Flex>

      <Flex
        flexDirection={"column"}
        height={"11vw"}
        width={"16vw"}
        alignItems={"center"}
        justifyContent={"space-between"}
        onClick={() => navigate("/game/action")}
      >
        <ActionIcon color={getColor("action")} height="6vw" />
        <Text className={"text-subtext"} color={getColor("action")}>
          アクション
        </Text>
      </Flex>

      <Flex
        flexDirection={"column"}
        height={"11vw"}
        width={"16vw"}
        alignItems={"center"}
        justifyContent={"space-between"}
        onClick={() => navigate("/game/map")}
      >
        <MapIcon color={getColor("map")} height={"5.4vw"} />
        <Text className={"text-subtext"} color={getColor("map")}>
          マップ
        </Text>
      </Flex>
    </Flex>
  );
};

Footer.propTypes = {
  type: PropTypes.oneOf(["log", "map", "action"]),
  isWalking: PropTypes.bool,
};
