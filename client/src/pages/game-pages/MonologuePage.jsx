import React from "react";
import { Flex, Box } from "@chakra-ui/react";
import { Header } from "../../components/common";
import { MonologueViewer } from "../../components/game-page/MonologueViewer";
import { useMonologueLogic } from "../../hooks/useMonologueLogic";

export const MonologuePage = () => {
  const { selectedEvent, combinedTexts, buttonText, handleButtonClick } =
    useMonologueLogic();

  if (!selectedEvent) {
    return <div>イベントデータが見つかりませんでした</div>;
  }

  return (
    <Flex className="page-container" backgroundColor={"#00000000"}>
      <Box
        className="background-image"
        style={{ backgroundImage: "url('/assets/image/monologue-back.png')" }}
      />
      <Header prevPage={false} currentPage={selectedEvent.type} />

      <MonologueViewer
        texts={combinedTexts}
        buttonText={buttonText}
        onButtonClick={handleButtonClick}
      />
    </Flex>
  );
};
