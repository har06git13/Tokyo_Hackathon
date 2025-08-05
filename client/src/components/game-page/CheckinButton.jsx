import React from "react";
import { Flex, Text } from "@chakra-ui/react";

export const CheckinButton = ({ onClick }) => {
  return (
    <Flex className="checkin-button" width={"90vw"} height={"10vw"}>
      <Flex
        backgroundColor="var(--color-base12)"
        borderRadius="3vw 0 0 3vw"
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
        borderRadius="0 3vw 3vw 0"
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
