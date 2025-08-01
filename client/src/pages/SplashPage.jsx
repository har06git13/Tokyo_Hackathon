import React from "react";
import { Flex, Box, Text } from "@chakra-ui/react";
import { Header } from "../components/common/Header";
import { Button } from "../components/common/Button";

export const SplashPage = () => {
  return (
    <Flex
      className="page-container"
      width={"100vw"}
      minHeight={"100vh"}
      flexDirection={"column"}
      justifyContent={"center"}
      backgroundColor={"blue"}
    >
      <Header />
      <Flex
        className="page-contents"
        flex={1}
        flexDirection={"column"}
        justifyContent={"center"}
      >
        <Text>This is SplashPage</Text>
        <Button
          text="Start"
          isAvairable
          color="var(--color-theme10)"
          width="40%"
        />
      </Flex>
    </Flex>
  );
};
