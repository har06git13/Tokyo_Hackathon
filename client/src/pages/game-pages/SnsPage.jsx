import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Flex } from "@chakra-ui/react";
import { Header, LifeGauge, Button } from "../../components/common";
import { EventText, Footer, TweetCard } from "../../components/game-page";
import { SnsIcon } from "../../components/icons";
//import { snsPostList } from "../../temporary-database";
import { useAtom } from "jotai";
import {
  currentTimeSlotAtom,
  selectedEventAtom,
} from "../../atoms/playerAtoms";

export const SnsPage = () => {
  const navigate = useNavigate();
  const [currentTimeSlot] = useAtom(currentTimeSlotAtom);
  const [selectedEvent] = useAtom(selectedEventAtom);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const BASE_URL = process.env.REACT_APP_API_URL;

  const SNS_ID_BY_SLOT = {
    "2h": "event_sns_001",
    "4h": "event_sns_002",
    "6h": "event_sns_003",
    "8h": "event_sns_004",
    "10h": "event_sns_005",
  };

  // 取得（時間帯でサーバー側フィルタ）
  useEffect(() => {
    let aborted = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `${BASE_URL}/api/sns?timeSlot=${encodeURIComponent(currentTimeSlot)}`
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!aborted) setPosts(Array.isArray(data) ? data : []);
      } catch (e) {
        if (!aborted) setError(e.message);
      } finally {
        if (!aborted) setLoading(false);
      }
    })();
    return () => {
      aborted = true;
    };
  }, [currentTimeSlot]);

  // 表示順をシャッフル
  const shuffledPosts = useMemo(() => {
    const arr = [...posts];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }, [posts]);

  return (
    <Flex className="page-container" backgroundColor={"var(--color-base12)"}>
      <Header prevPage={false} currentPage="SNS" />
      <Flex className="page-contents" gap={"1.6%"} paddingTop={"4%"}>
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
          paddingY={"2vh"}
        >
          <SnsIcon color="var(--color-base10)" height="6vh" />
          <Flex
            width={"90%"}
            flexDirection={"column"}
            overflowY={"auto"}
            height={"50vh"}
            scrollbar={"hidden"}
          >
            {loading && (
              <div style={{ color: "var(--color-base1)" }}>読み込み中...</div>
            )}
            {error && (
              <div style={{ color: "tomato" }}>
                読み込みに失敗しました：{error}
              </div>
            )}
            {!loading &&
              !error &&
              shuffledPosts.map((post) => (
                <TweetCard
                  key={post._id /* DBは _id を返します */}
                  userName={post.userName}
                  userId={post.userId}
                  text={post.text}
                />
              ))}
          </Flex>
          <Button
            text="次へ"
            width="90%"
            height="4vh"
            isAvailable
            onClick={() => {
              const eventId =
                selectedEvent?._id ||
                selectedEvent?.id ||
                SNS_ID_BY_SLOT[currentTimeSlot];

              if (!eventId) {
                console.warn("SNSイベントIDが特定できませんでした");
                return;
              }
              navigate(`/game/monologue/${eventId}`);
            }}
          />
        </Flex>
      </Flex>
      <Footer />
    </Flex>
  );
};
