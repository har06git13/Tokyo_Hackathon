import React from "react";
import { Flex, Text, Box } from "@chakra-ui/react";
import { Header } from "../../components/common";
import { Footer, LogElement } from "../../components/game-page";

export const LogPage = () => {
  return (
    <Flex
      className="page-container"
      backgroundColor={"var(--color-base12)"}
      zIndex={0}
      position={"relative"}
    >
      <Box
        position="absolute"
        height={"100%"}
        width={"0.1px"}
        backgroundColor={"var(--color-base13)"}
        left={"8vw"}
        zIndex={-1}
      />
      <Header prevPage={false} currentPage="行動履歴" />

      <Flex
        className="page-contents"
        gap={"2vw"}
        flex={1}
        paddingTop={"4vw"}
        overflowY={"auto"}
        zIndex={2}
      >
        <LogElement />
        <LogElement />
        <LogElement />
        <LogElement />
        <LogElement />
        <LogElement />
        <LogElement />
        <LogElement />
        <LogElement />
      </Flex>
      <Footer type="log" />
    </Flex>
  );
};
