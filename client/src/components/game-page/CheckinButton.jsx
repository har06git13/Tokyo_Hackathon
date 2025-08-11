import React from "react";
import { Flex, Text } from "@chakra-ui/react";

export const CheckinButton = ({ onClick }) => {
  return (
    <Flex className="checkin-button" width={"100%"} height={"5vh"}>
      <Flex
        backgroundColor="var(--color-base12)"
        borderRadius="1vh 0 0 1vh"
        width={"30%"}
        alignItems={"center"}
        justifyContent={"center"}
      >
        <Text className="text-subtext">
          QRコードを探して
          <br />
          チェックイン！
        </Text>
      </Flex>

      <Flex
        backgroundColor={"var(--color-accent10)"}
        borderRadius="0 1vh 1vh 0"
        width={"70%"}
        alignItems={"center"}
        justifyContent={"center"}
      >
        <button className="button" onClick={onClick}>
          <Text className="text-sectiontitle" color={"var(--color-base10)"}>
            スキャン
          </Text>
        </button>
      </Flex>
    </Flex>
  );
};
