import React from "react";
import { Flex, Text } from "@chakra-ui/react";
import { Header } from "../../../components/common";
import { SettingInfoIndex } from "../../../components/game-page";

export const RuleInfoPage = () => {
  return (
    <Flex className="page-container" backgroundColor={"var(--color-base12)"}>
      <Header isSetting currentPage="ルール・基本操作" />
      <Flex
        className="page-contents"
        flex={1}
        paddingTop={"3vh"}
        gap={"3vh"}
        overflowY={"auto"}
        scrollbar={"hidden"}
      >
        <Flex flexDirection={"column"} width={"90%"} gap={"1vh"}>
          <SettingInfoIndex text="ゲームの目的" />
          <Text className="text-maintext" color={"var(--color-theme10)"}>
            災害直後の渋谷を歩き回って生き延び、24:00までに受け入れ可能な避難施設へ到着することが目標です。
          </Text>
          <Text className="text-maintext">
            序盤（15:00〜18:00頃）は、混乱や施設の閉鎖で避難所は使えません。移動しながら情報を集め、状況が落ち着くタイミングを見極めましょう。
          </Text>
        </Flex>

        <Flex flexDirection={"column"} width={"90%"} gap={"1vh"}>
          <SettingInfoIndex text="基本の流れ" />
          <Text className="text-maintext">
            「移動する」で渋谷エリア内の施設を訪れ、物資の確保や人との会話ができます。
            <br />
            「SNSを見る」では、現地の最新情報を収集できます。
          </Text>
        </Flex>

        <Flex flexDirection={"column"} width={"90%"} gap={"1vh"}>
          <SettingInfoIndex text="画面の説明" />
          <Text className="text-maintext">【アクション画面】</Text>
          <Text className="text-maintext">
            「移動する」または「SNSを見る」のどちらかを選んで行動します。
          </Text>
          <Text className="text-maintext">
            移動では、マップから次に向かう施設を選び、実際に渋谷の街を歩いて目的地に移動します。移動先の施設に設置されたQRコードを読み取ることで、ゲーム内でもその施設にチェックインすることができます。
            <br />
            SNSを見ると、その場にとどまり、現地の声や噂を収集できます。
          </Text>
          <Text className="text-maintext" color={"var(--color-theme10)"}>
            行動によってライフゲージが変化するので、状況を見極めて選びましょう。
          </Text>
          <Text className="text-maintext">【行動履歴画面】</Text>
          <Text className="text-maintext">
            これまでの移動・イベント・ゲージの変化を時系列で確認できます。
            <br />
            「さっきどこ行ったっけ？」「どの選択で精神が減った？」といった、振り返りに役立ちます。
          </Text>
          <Text className="text-maintext">【マップ画面】</Text>
          <Text className="text-maintext">
            渋谷エリアの現在地・移動可能な施設が表示されます。
            訪れた場所や移動履歴も確認可能で、「どこを通ってきたか」「次にどこへ行けるか」を整理したいときに便利です。
          </Text>
        </Flex>
      </Flex>
    </Flex>
  );
};
