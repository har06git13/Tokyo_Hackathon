import React from "react";
import { Flex, Box, Text } from "@chakra-ui/react";
import { Header } from "../../components/common";
import { Footer } from "../../components/game-page";
import { useNavigate } from "react-router-dom";

export const CheckInPage = () => {
  const navigate = useNavigate();

  return (
    <Flex className="page-container" backgroundColor={"var(--color-base12)"}>
      <Header currentPage="チェックイン" />
      <Flex className="page-contents">
        <Flex className="page-contents">
          <Box
            className={"dummy-code-reader"}
            width={"100%"}
            height={"133vw"}
            backgroundColor={"var(--color-accent11)"}
          />
          <Flex
            flexDirection={"column"}
            backgroundColor={"var(--color-base10)"}
            width={"90%"}
            paddingX={"4vw"}
            flex={1}
            marginTop={"4vw"}
            borderRadius={"3vw 3vw 0 0 "}
            paddingY={"4vw"}
          >
            <Text
              className="text-sectiontitle"
              color={"var(--color-accent10)"}
              onClick={() => navigate("/game/monologue")}
            >
              現行ではこのあたりをタップで遷移するよ
            </Text>
            <Box
              height="0.08px"
              backgroundColor="var(--color-base12)"
              my="2vw"
              width="100%"
            />
            <Text className="text-maintext">
              施設に到着したら、「渋谷歪譚」のロゴを探しましょう。
              <br />
              ※移動中以外はチェックインを行うことができません。
            </Text>
          </Flex>
        </Flex>
      </Flex>
      <Footer isWalking />
    </Flex>
  );
};
