import React from "react";
import { Flex, Box } from "@chakra-ui/react";
import { Header } from "../../components/common";
import { MonologueViewer } from "../../components/game-page/MonologueViewer";
import { useNavigate } from "react-router-dom";
import { prologueTexts } from "../../eventTexts";

export const ProloguePage = () => {
  const navigate = useNavigate();

  return (
    <Flex className="page-container" backgroundColor={"#00000000"}>
      <Box
        className="background-image"
        style={{ backgroundImage: "url('/assets/image/monologue-back.png')" }}
      />
      <Header prevPage={false} currentPage="プロローグ" />

      <MonologueViewer
        texts={prologueTexts}
        buttonText="避難を開始する"
        onButtonClick={() => navigate("../action")}
      />
    </Flex>
  );
};
