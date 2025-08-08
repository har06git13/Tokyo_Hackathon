import React from "react";
import { Flex } from "@chakra-ui/react";
import { Header } from "../../components/common";
import { SettingElement, SettingInfoIndex } from "../../components/game-page";

export const SettingPage = () => {
  return (
    <Flex className="page-container" backgroundColor={"var(--color-base12)"}>
      <Header prevPage={false} currentPage="設定" />
      <Flex className="page-contents" flex={1} paddingTop={"6vw"} gap={"6vw"}>
        <Flex flexDirection={"column"}>
          <SettingElement
            type="top"
            operation="button"
            text="ルール・基本操作"
          />
          <SettingElement operation="button" text="ライフゲージ説明" />
          <SettingElement
            type="bottom"
            operation="button"
            text="施設タイプ一覧"
          />
        </Flex>
        <Flex flexDirection={"column"}>
          <SettingElement type="top" text="BGM" />
          <SettingElement type="bottom" text="SE" />
        </Flex>
        <Flex flexDirection={"column"}>
          <SettingElement
            type="top"
            operation="button"
            text="利用規約"
            alertMessage={"利用規約を表示（仮）"}
          />
          <SettingElement
            type="bottom"
            operation="button"
            text="プライバシーポリシー"
            alertMessage={"プライバシーポリシーを表示（仮）"}
            onClick={() => alert("プライバシーポリシーを表示（仮）")}
          />
        </Flex>
        <Flex flexDirection={"column"}>
          <SettingElement
            type="top"
            operation="button"
            text="このゲームについて"
            alertMessage={"ゲームについて(外部サイトに遷移？)"}
          />
          <SettingElement
            type="bottom"
            operation="button"
            text="フィードバック・バグ報告"
            alertMessage={"フィードバック・バグ報告(外部サイトに遷移？)"}
          />
        </Flex>

        <SettingElement
          type="alone"
          operation="button"
          text="ゲームを最初からやり直す"
          textColor={"var(--color-theme10)"}
        />
      </Flex>
    </Flex>
  );
};
