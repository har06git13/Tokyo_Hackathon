import React from "react";
import { Flex, Box } from "@chakra-ui/react";
import { Header } from "../../components/common";
import { Footer, LogElement } from "../../components/game-page";
import { useAtom } from "jotai";
import { eventHistoryAtom } from "../../atoms/playerAtoms";

export const LogPage = () => {
  const [eventHistory] = useAtom(eventHistoryAtom);

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
        {eventHistory.map(({ id, time }, index) => (
          <LogElement
            key={`${id}-${time.getTime()}-${index}`}
            id={id}
            time={time}
          />
        ))}
      </Flex>
      <Footer type="log" />
    </Flex>
  );
};
