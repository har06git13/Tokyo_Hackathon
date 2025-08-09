import React from "react";
import { Flex, Box, Text } from "@chakra-ui/react";
import { Header } from "../../components/common";
import { Footer, CheckinButton } from "../../components/game-page";
import { useNavigate } from "react-router-dom";
import { useAtom } from "jotai";
import { selectedFacilityAtom } from "../../atoms/playerAtoms";

export const WalkPage = () => {
  const navigate = useNavigate();
  const [selectedFacility] = useAtom(selectedFacilityAtom);

  return (
    <Flex
      className="page-container"
      backgroundColor={"var(--color-base12)"}
      zIndex={0}
    >
      <Box position="relative" width="100%" height="131vw">
        <Header prevPage={false} currentPage="移動中" backGround={false} />
        <Box
          position="absolute"
          top={0}
          left={0}
          width="100%"
          height="131vw"
          backgroundImage="url('/assets/image/walk-back.png')"
          backgroundSize="cover"
          backgroundColor="var(--color-accent11)"
          borderRadius="0 0 10vw 10vw"
          zIndex={-1}
        />
      </Box>
      <Flex
        className="page-contents"
        justifyContent={"space-between"}
        alignItems={"flex-start"}
        paddingX={"9vw"}
        paddingTop={"4vw"}
        paddingBottom={"5vw"}
        borderRadius="10vw 10vw 0 0"
        backgroundColor={"var(--color-base10)"}
      >
        <Flex
          backgroundColor={"var(--color-accent10)"}
          paddingY={"0.8vw"}
          paddingX={"4vw"}
          borderRadius={"999px"}
        >
          <Text className="text-subtext" color={"var(--color-base10)"}>
            移動中...
          </Text>
        </Flex>
        <Text className="text-subtext">この場所に移動しています……</Text>
        <Text className="text-sectiontitle">{selectedFacility?.name}</Text>
        <Text className="text-subtext">
          災害時の移動には、落下物やガラス片など、思わぬ危険がひそんでいます。
          スマートフォンの操作は控え、足元や周囲に注意しながら移動しましょう。
        </Text>
        <Text className="text-subtext">
          安全第一で、慌てず落ち着いた行動を。
        </Text>
        <Text className="text-maintext">
          現地に着いたら、QRコードでチェックイン！
        </Text>
        <CheckinButton onClick={() => navigate("/game/checkin")} />
      </Flex>
      <Footer isWalking />
    </Flex>
  );
};
