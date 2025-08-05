import React from "react";
import { Flex, Text, Image, Box } from "@chakra-ui/react";
import { Button } from "../../components/common";
import { useNavigate } from "react-router-dom";

export const TitlePage = () => {
  const navigate = useNavigate();
  return (
    <Box
      className="page-container"
      position="relative"
      width="100vw"
      minHeight="100vh"
      backgroundColor="var(--color-base12)"
    >
      <Box
        backgroundColor="var(--color-theme10)"
        position="absolute"
        top={0}
        left={0}
        width="100vw"
        height="148vw"
        zIndex={0}
      />
      <Image
        src="/assets/svg/titlesvg-1.svg"
        width={"32vw"}
        height={"26.4vw"}
        position="absolute"
        top={"122vw"}
        left={"34vw"}
      />
      <Flex
        className="page-contents"
        flex={1}
        height="100vh"
        flexDirection="column"
        justifyContent="space-between"
        alignItems="center"
        zIndex={1}
        position="relative"
        paddingBottom={"10vw"}
        paddingTop={"40vw"}
      >
        <Image src="/assets/svg/applogo.svg" />
        <Flex
          flexDirection={"column"}
          alignItems={"center"}
          justifyContent={"space-between"}
          height={"18vw"}
        >
          <Text className="text-subtext">
            生き延びるには、選ぶしかない。混乱の渋谷を、自分の判断で。
          </Text>
          <Button
            text="ゲームを始める"
            isAvailable
            width="90vw"
            height="10.6vw"
            onClick={() => navigate("/title/profile")}
          />
        </Flex>
      </Flex>
    </Box>
  );
};
