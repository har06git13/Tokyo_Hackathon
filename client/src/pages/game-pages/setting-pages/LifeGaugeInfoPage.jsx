import React from "react";
import { Flex, Text } from "@chakra-ui/react";
import { Header } from "../../../components/common";
import {
  SettingInfoIndex,
  LifeGaugeListElement,
} from "../../../components/game-page";

export const LifeGaugeInfoPage = () => {
  return (
    <Flex className="page-container" backgroundColor={"var(--color-base12)"}>
      <Header isSetting currentPage="ライフゲージ説明" />
      <Flex
        className="page-contents"
        flex={1}
        paddingTop={"6vw"}
        paddingBottom={"18vw"}
        gap={"6vw"}
        overflowY={"auto"}
      >
        <Flex flexDirection={"column"} width={"90%"} gap={"3vw"}>
          <SettingInfoIndex text="ライフゲージについて" />
          <Text className="text-maintext" color={"var(--color-theme10)"}>
            災害下では「体力」「精神」「電源」「現金」などのリソース（＝ライフゲージ）を管理しながら行動します。
          </Text>
          <Text className="text-maintext">
            それぞれのゲージが減ると、できることが限られたり、不利な状況に陥ったりします。
          </Text>
          <Text className="text-maintext">
            各ライフゲージは、プレイヤーの行動によって変動するほか、体力・精神力・電源は毎時00分に5%ずつ消費します。
          </Text>
          <Text className="text-maintext" color={"var(--color-theme10)"}>
            体力が0%になると、避難失敗(即ゲームオーバー)になるので注意！
          </Text>
        </Flex>

        <Flex flexDirection={"column"} width={"90%"} gap={"3vw"}>
          <SettingInfoIndex text="ライフゲージ一覧" />
          <Text className="text-maintext">
            ゲージを確認しながら、状況を見極めて行動を選びましょう。
          </Text>
          <Flex flexDirection={"column"}>
            <LifeGaugeListElement type="life" />
            <LifeGaugeListElement type="mental" />
            <LifeGaugeListElement type="charge" />
            <LifeGaugeListElement type="money" />
          </Flex>
        </Flex>
      </Flex>
    </Flex>
  );
};
