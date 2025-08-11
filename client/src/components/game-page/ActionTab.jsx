import PropTypes from "prop-types";
import React from "react";
import { Flex, Text } from "@chakra-ui/react";

export const ActionTab = ({ type = "walk", onWalkClick, onSnsClick }) => {
  return (
    <Flex
      className={"action-tab"}
      backgroundColor={"var(--color-base10)"}
      borderRadius={"1.6vw"}
      width={"90%"}
      height={"4.4%"}
      padding={"0.4%"}
    >
      <Flex
        backgroundColor={
          type === "walk" ? "var(--color-theme10)" : "var(--color-base10)"
        }
        borderRadius={"1.6vw"}
        width={"50%"}
        justifyContent={"center"}
        alignItems={"center"}
        onClick={onWalkClick}
      >
        <Text
          className="text-maintext"
          color={
            type === "walk" ? "var(--color-base10)" : "var(--color-base13)"
          }
        >
          移動する
        </Text>
      </Flex>

      <Flex
        backgroundColor={
          type === "sns" ? "var(--color-theme10)" : "var(--color-base10)"
        }
        borderRadius={"1.6vw"}
        width={"50%"}
        justifyContent={"center"}
        alignItems={"center"}
        onClick={onSnsClick}
      >
        <Text
          className="text-maintext"
          color={type === "sns" ? "var(--color-base10)" : "var(--color-base13)"}
        >
          SNSを見る
        </Text>
      </Flex>
    </Flex>
  );
};

ActionTab.propTypes = {
  type: PropTypes.oneOf(["sns", "walk"]),
};
