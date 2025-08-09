import React from "react";
import { Flex, Text } from "@chakra-ui/react";
import { Header } from "../../../components/common";
import { SettingInfoIndex } from "../../../components/game-page";
import { spotTypeList } from "../../../temporary-database";

export const SpotTypeInfoPage = () => {
  return (
    <Flex className="page-container" backgroundColor={"var(--color-base12)"}>
      <Header isSetting currentPage="施設タイプ一覧" />
      <Flex
        className="page-contents"
        flex={1}
        paddingTop={"6vw"}
        paddingBottom={"18vw"}
        gap={"6vw"}
        overflowY={"auto"}
      >
        <Flex flexDirection={"column"} width={"90%"} gap={"3vw"}>
          <SettingInfoIndex text="移動できる施設タイプ" />
          <Text className="text-maintext">
            渋谷の街には、さまざまな施設があります。
          </Text>
          <Text className="text-maintext">
            それぞれできることや得られる効果が違うので、状況に合わせて使い分けてみましょう。
          </Text>
        </Flex>

        <Flex flexDirection={"column"} width={"90%"} gap={"3vw"}>
          <SettingInfoIndex text="施設タイプ一覧" />
          <Text className="text-maintext">
            状況によって使える施設が変化したり、混雑したりすることもあります。
            <br />
            「今どこに行くべきか？」を考えるのが、生き延びるカギ！
          </Text>
          <Text className="text-maintext">
            それぞれできることや得られる効果が違うので、状況に合わせて使い分けてみましょう。
          </Text>

          {Object.values(spotTypeList).map((spot, idx) => (
            <Flex key={idx} flexDirection="column" gap="1vw">
              <Text className="text-maintext" color={"var(--color-accent10)"}>
                {spot.name}
              </Text>
              {spot.description.map((line, lineIdx) => (
                <Text key={lineIdx} className="text-maintext">
                  {line}
                </Text>
              ))}
            </Flex>
          ))}
        </Flex>
      </Flex>
    </Flex>
  );
};
