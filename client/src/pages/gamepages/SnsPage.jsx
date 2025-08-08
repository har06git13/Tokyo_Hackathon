import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Flex, Box } from "@chakra-ui/react";
import { Header, LifeGauge, Button } from "../../components/common";
import {
  EventText,
  ActionTab,
  MapMarkerLegend,
  MapSpotInfo,
  Footer,
  ActionConfirmDialog,
  TweetCard,
} from "../../components/game-page";
import { SnsIcon } from "../../components/icons";
import { dummyTweets1430 } from "../../eventTexts";

export const SnsPage = () => {
  const navigate = useNavigate();

  return (
    <Flex
      className="page-container"
      backgroundColor={"var(--color-base12)"}
      position="relative"
    >
      <Header prevPage={false} currentPage="SNS" />
      <Flex className="page-contents" gap={"2vw"} paddingTop={"4vw"}>
        <LifeGauge />
        <EventText />
        <Flex
          className="sns"
          backgroundColor={"var(--color-theme11)"}
          flex={1}
          width={"100%"}
          flexDirection={"column"}
          alignItems={"center"}
          justifyContent={"space-between"}
          overflowY={"auto"}
          height={"109vw"}
          paddingY={"4vw"}
        >
          <SnsIcon color="var(--color-base10)" height="14vw" />
          <Flex
            width={"90%"}
            flexDirection={"column"}
            overflowY={"auto"}
            height={"109vw"}
          >
            {dummyTweets1430.map((tweet, index) => (
              <TweetCard
                key={index}
                userName={tweet.userName}
                userId={tweet.userId}
                text={tweet.text}
              />
            ))}
          </Flex>
          <Button text="次へ" width="90%" height="10.6vw" isAvailable />
        </Flex>
      </Flex>
      <Footer />
    </Flex>
  );
};
