import React from "react";
import { Flex, Text, Image, Box } from "@chakra-ui/react";
import { Button } from "../../components/common";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export const TitlePage = () => {
  const navigate = useNavigate();
  return (
    <Box className="page-container" backgroundColor="var(--color-base12)">
      <Box
        backgroundColor="var(--color-theme10)"
        position="absolute"
        top={0}
        left={0}
        width="100%"
        height="70%"
        zIndex={0}
      />
      <Image
        src="/assets/svg/titlesvg-1.svg"
        width={"32%"}
        position="absolute"
        top={"58%"}
        left={"34%"}
      />
      <Flex
        className="page-contents"
        justifyContent="space-between"
        zIndex={1}
        position="relative"
        paddingBottom={"10%"}
        paddingTop={"40%"}
      >
        <motion.img
          src="/assets/svg/applogo.svg"
          style={{ width: "30%" }}
          initial={{ opacity: 0, scale: 0.8, y: -20 }}
          animate={{
            opacity: 1,
            scale: 1,
            y: [0, -5, 0], // 上下にふわふわ
          }}
          transition={{
            duration: 1,
            ease: "easeOut",
            y: {
              repeat: Infinity,
              duration: 2,
              ease: "easeInOut",
            },
          }}
        />
        <Flex
          flexDirection={"column"}
          alignItems={"center"}
          justifyContent={"space-between"}
          height={"12%"}
          width={"90%"}
        >
          <Text className="text-subtext">
            生き延びるには、選ぶしかない。混乱の渋谷を、自分の判断で。
          </Text>
          <Button
            text="ゲームを始める"
            isAvailable
            width="100%"
            height="50%"
            onClick={() => navigate("/title/profile")}
          />
        </Flex>
      </Flex>
    </Box>
  );
};
