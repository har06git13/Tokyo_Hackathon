import PropTypes from "prop-types";
import React from "react";
import { ArrowIcon, MenuIcon } from "../icons";
import { Flex, Text, Image } from "@chakra-ui/react";

export const Header = ({
  prevPage = true,
  backGround = true,
  isSetting = false,
  currentPage = "画面名",
}) => {
  return (
    <Flex
      className="header"
      height={"10vh"}
      width={"100%"}
      paddingTop={"5vh"}
      paddingX={"4%"}
      backgroundColor={backGround ? "var(--color-base10)" : undefined}
    >
      <Flex className="left" height={"100%"} flex={1}>
        {prevPage && (
          <Flex
            alignItems={"center"}
            justifyContent={"flex-start"}
            width={"100%"}
            gap={"12%"}
          >
            <ArrowIcon width="14%" color="var(--color-theme10)" />
            <Text
              className="text-maintext"
              whiteSpace="nowrap"
              color="var(--color-theme10)"
            >
              戻る
            </Text>
          </Flex>
        )}
        {!prevPage && (
          <Image
            src="/assets/svg/applogo-mini.svg"
            alt="AppLogo"
            objectFit="contain"
            height={"100%"}
            width={"70%"}
          />
        )}
      </Flex>
      <Flex
        className="current-page"
        height={"100%"}
        width={"50%"}
        alignItems={"center"}
        justifyContent={"center"}
      >
        <Text
          className="text-sectiontitle"
          color={backGround ? "var(--color-font10)" : "var(--color-base10)"}
        >
          {currentPage}
        </Text>
      </Flex>
      <Flex
        className="right"
        height={"100%"}
        flex={1}
        justifyContent={"flex-end"}
      >
        {!isSetting && (
          <MenuIcon
            color={backGround ? "var(--color-theme10)" : "var(--color-base10)"}
            width="22%"
          />
        )}
      </Flex>
    </Flex>
  );
};

Header.propTypes = {
  prevPage: PropTypes.bool,
  backGround: PropTypes.bool,
  isSetting: PropTypes.bool,
};
