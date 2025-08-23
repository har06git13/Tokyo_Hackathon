// src/pages/NotFoundPage.js
import React from "react";
import { Flex, Box } from "@chakra-ui/react";
import { Header } from "../components/common";
import { MonologueViewer } from "../components/game-page/MonologueViewer";
import { useNavigate } from "react-router-dom";

export const NotFoundPage = () => {
  const navigate = useNavigate();

  // 404用のテキストをここで定義
  const texts = [
    { type: "system", text: "⚠️ 404 Not Found ⚠️" },
    { type: "system", text: "8×9≠24の開発室に迷い込んだ…！" },
    { type: "system", text: "大慌ての開発チームが飛び出してきた！" },
    {
      type: "talk",
      text: "あれ！？誰か迷い込んでる…！？😱",
      name: "はらちゃん",
      isPlayer: false,
    },
    {
      type: "talk",
      text: "え、もしかして…プレイヤーさん！？😳",
      name: "しまゆう",
      isPlayer: false,
    },
    {
      type: "talk",
      text: "ってことは…404エラー…！？💥\n指定したページが存在しないアレだーっ！",
      name: "はらちゃん",
      isPlayer: false,
    },
    {
      type: "talk",
      text: "や、やばい！実装ミスかも！？ごめんなさい！！！🙏",
      name: "いお",
      isPlayer: false,
    },
    {
      type: "talk",
      text: "落ち着け…！とりあえずトップに戻れ〜！🏃‍♀️🏃‍♂️",
      name: "しまゆう",
      isPlayer: false,
    },
    { type: "system", text: "※以下のボタンでトップへ戻れます" },
  ];

  const handleButtonClick = () => {
    navigate("/"); // トップに戻る
  };

  return (
    <Flex className="page-container" backgroundColor={"#00000000"} zIndex={1}>
      <Box
        className="background-image"
        style={{
          backgroundImage: "url('/assets/image/404-back.png')",
          filter: "brightness(1.2) contrast(0.9) blur(1px) opacity(0.7)",
        }}
      />

      <Header prevPage={false} currentPage="404 Not Found" />

      <MonologueViewer
        texts={texts}
        buttonText="トップに戻る"
        onButtonClick={handleButtonClick}
      />
    </Flex>
  );
};
