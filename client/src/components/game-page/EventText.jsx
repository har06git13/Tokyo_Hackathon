import React from "react";
import { Flex, Text, Box } from "@chakra-ui/react";
import { currentTimeAtom, playerNameAtom } from "../../atoms/playerAtoms";
import { useAtom } from "jotai";

export const EventText = () => {
  const [currenttime] = useAtom(currentTimeAtom);
  const [playername] = useAtom(playerNameAtom);

  return (
    <Flex
      className="event-text"
      width={"90vw"}
      backgroundColor={"var(--color-base10)"}
      border="0.1vw solid var(--color-theme10)"
      borderRadius={"9999px"}
      height={"8vw"}
      alignItems={"center"}
      justifyContent={"flex-start"}
      paddingX={"6vw"}
    >
      <Text className="text-maintext" color={"var(--color-theme10)"}>
        {currenttime}
      </Text>
      <Box
        height={"50%"}
        width={"0.1vw"}
        backgroundColor={"var(--color-theme10)"}
        marginX={"4vw"}
      />
      <Text className="text-maintext" color={"var(--color-theme10)"}>
        {playername}はどうする？
      </Text>
    </Flex>
  );
};
