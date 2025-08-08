import React from "react";
import { Flex, Box } from "@chakra-ui/react";
import { Header } from "../../components/common";
import { MonologueViewer } from "../../components/game-page/MonologueViewer";
import { useNavigate } from "react-router-dom";
import { eventList } from "../../temporary-database";

export const EpiloguePage = () => {
  const navigate = useNavigate();

  const eventId = "event_epilogue_001";
  const event = eventList.find((e) => e.id === eventId);
  if (!event) {
    return <div>イベントデータが見つかりませんでした</div>;
  }

  return (
    <Flex className="page-container" backgroundColor={"#00000000"}>
      <Box
        className="background-image"
        style={{ backgroundImage: "url('/assets/image/monologue-back.png')" }}
      />
      <Header prevPage={false} currentPage="エピローグ" />

      <MonologueViewer
        texts={event.texts}
        buttonText="リザルトを見る"
        onButtonClick={() => navigate("../../result")}
      />
    </Flex>
  );
};
