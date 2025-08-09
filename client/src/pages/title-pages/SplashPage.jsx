import React, { useEffect } from "react";
import { Flex, Image } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const MotionImage = motion(Image);

export const SplashPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/title/gamestart");
    }, 1000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <Flex
      className="page-container"
      backgroundColor={"var(--color-theme10)"}
      justifyContent={"center"}
      paddingBottom={"40vw"}
    >
      <MotionImage
        src="/assets/svg/applogo.svg"
        width="20%"
        initial={{ scale: 1.04 }}
        animate={{ scale: 1.0 }}
        transition={{
          ease: "easeInOut",
        }}
      />
    </Flex>
  );
};
