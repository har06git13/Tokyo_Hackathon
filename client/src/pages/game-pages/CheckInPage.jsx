import React from "react";
import { Flex, Box, Text } from "@chakra-ui/react";
import { Header } from "../../components/common";
import { Footer } from "../../components/game-page";
import { useNavigate } from "react-router-dom";
import { useAtom } from "jotai";
import { selectedEventAtom } from "../../atoms/playerAtoms";

export const CheckInPage = () => {
  const navigate = useNavigate();
  const [selectedEvent] = useAtom(selectedEventAtom);
  const eventId = selectedEvent?._id || selectedEvent?.id; // DBは _id、メモリは id の互換

  return (
    <Flex className="page-container" backgroundColor={"var(--color-base12)"}>
      <Header currentPage="チェックイン" />
      <Flex className="page-contents">
        <Flex className="page-contents">
          <Box
            className={"dummy-code-reader"}
            width={"100%"}
            height={"60vh"}
            backgroundColor={"var(--color-accent11)"}
          />
          <Flex
            flexDirection={"column"}
            backgroundColor={"var(--color-base10)"}
            width={"90%"}
            paddingX={"4%"}
            flex={1}
            marginTop={"2vh"}
            borderRadius={"1vh 1vh 0 0 "}
            paddingY={"2vh"}
          >
            <Text
              className="text-sectiontitle"
              color={"var(--color-accent10)"}
              onClick={() => {
                if (eventId) {
                  navigate(`/game/monologue/${eventId}`);
                } else {
                  // フォールバック（想定外：イベント未設定）
                  alert("モノローグ用のイベントが見つかりませんでした。アクション画面に戻ります。");
                  navigate("/game/action");
                }
              }}
            >
              現行ではこのあたりをタップで遷移
            </Text>
            <Box
              height="0.08px"
              backgroundColor="var(--color-base12)"
              my="1.6vh"
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
