import React from "react";
import { Flex, Text, Box } from "@chakra-ui/react";

const getRandomColor = () => {
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

export const TweetCard = ({
  userName = "バズジャンキー",
  userId = "@buzz__junkie",
  text = "🚨地震やばすぎて草 無事バズりました🫡",
}) => {
  const randomColor = getRandomColor();

  return (
    <Flex
      className="tweet-card"
      width={"100%"}
      backgroundColor={"var(--color-base10)"}
      paddingX={"5%"}
      paddingTop={"1vh"}
      paddingBottom={"1.6vh"}
      gap={"1vh"}
      justifyContent={"space-between"}
      boxShadow="inset 0 0.6px 0 rgba(0, 0, 0, 0.1)"
    >
      <Box
        width={"4.6vh"}
        height={"4.6vh"}
        borderRadius={"9999px"}
        backgroundColor={randomColor}
      />

      <Flex flexDirection={"column"} width={"86%"}>
        <Flex alignItems={"center"} gap={"0.6vh"} width={"100%"}>
          <Text className="text-maintext">{userName}</Text>
          <Text className="text-subtext" color={"var(--color-base13)"}>
            {userId}
          </Text>
        </Flex>

        <Text className="text-maintext">{text}</Text>
      </Flex>
    </Flex>
  );
};
