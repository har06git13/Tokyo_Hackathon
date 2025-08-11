import React, { useEffect, useState } from "react";
import { Flex, Box } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const MotionImage = motion.img;
const MotionBox = motion(Box);

export const SplashPage = () => {
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // ロード完了フラグ(とりあえず時間で管理)
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!loading) {
      // ロード完了後0.1秒待ってから画面非表示＆遷移
      const navTimer = setTimeout(() => {
        setVisible(false);
        navigate("/title/gamestart");
      }, 100);
      return () => clearTimeout(navTimer);
    }
  }, [loading, navigate]);

  if (!visible) return null;

  return (
    <Flex
      className="page-container"
      backgroundColor={"var(--color-theme10)"}
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      height="100vh"
      gap="3vh"
    >
      {/* ロゴ */}
      <MotionImage
        src="/assets/svg/applogo.svg"
        style={{ width: "20%" }}
        initial={{ scale: 1 }}
        animate={{ scale: [1, 1.08, 1] }}
        transition={{
          duration: 1.2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* ローディングバー */}
      <Box
        width="40%"
        height="2vh"
        background="rgba(255,255,255,0.3)"
        borderRadius="9999px"
      >
        <MotionBox
          height="100%"
          background="var(--color-base10)"
          borderRadius="9999px"
          initial={{ width: "0%" }}
          animate={{ width: ["0%", "100%"] }}
          transition={{ duration: 1.8, ease: "easeInOut" }}
        />
      </Box>
    </Flex>
  );
};
