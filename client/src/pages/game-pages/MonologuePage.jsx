import React from "react";
import { Flex, Box } from "@chakra-ui/react";
import { Header } from "../../components/common";
import { MonologueViewer } from "../../components/game-page/MonologueViewer";
import { useMonologueLogic } from "../../hooks/useMonologueLogic";
import { eventTypeList } from "../../temporary-database";
import { useParams } from "react-router-dom";

export const MonologuePage = () => {
  const { eventId } = useParams();
  const { selectedEvent, combinedTexts, buttonText, handleButtonClick } =
    useMonologueLogic(eventId);

  if (!selectedEvent) {
    return <div>イベントデータが見つかりませんでした</div>;
  }

  return (
    <Flex className="page-container" backgroundColor={"#00000000"} zIndex={1}>
      <Box
        className="background-image"
        style={{
          backgroundImage: "url('/assets/image/monologue-back.png')",
          filter: "brightness(1.2) contrast(0.9) blur(4px) opacity(0.7)",
        }}
      />
      <Header
        prevPage={false}
        currentPage={
          selectedEvent ? eventTypeList[selectedEvent.type] : "不明なイベント"
        }
      />

      <MonologueViewer
        texts={combinedTexts}
        buttonText={buttonText}
        onButtonClick={handleButtonClick}
      />
    </Flex>
  );
};
