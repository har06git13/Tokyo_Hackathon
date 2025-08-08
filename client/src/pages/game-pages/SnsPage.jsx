import React from "react";
import { useNavigate } from "react-router-dom";
import { Flex } from "@chakra-ui/react";
import { Header, LifeGauge, Button } from "../../components/common";
import { EventText, Footer, TweetCard } from "../../components/game-page";
import { SnsIcon } from "../../components/icons";
import { snsPostList } from "../../temporary-database";
import { useAtom } from "jotai";
import { currentTimeSlotAtom } from "../../atoms/playerAtoms";

export const SnsPage = () => {
  const navigate = useNavigate();
  const [currentTimeSlot] = useAtom(currentTimeSlotAtom);

  const shuffleArray = (array) => {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };

  const filteredPosts = snsPostList.filter(
    (post) => post.timeSlot === currentTimeSlot
  ); // 時間帯でツイートを絞り込み
  const shuffledPosts = shuffleArray(filteredPosts);

  console.log("typeof currentTimeSlot:", typeof currentTimeSlot);
  console.log("currentTimeSlot value:", currentTimeSlot);
  console.log("filteredPosts:", filteredPosts);
  console.log("shuffledPosts:", shuffledPosts);

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
            {shuffledPosts.map((post, index) => (
              <TweetCard
                userName={post.userName}
                userId={post.userId}
                text={post.text}
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
