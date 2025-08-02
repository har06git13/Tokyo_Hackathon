import React, { useState } from "react";
import { Flex, Text } from "@chakra-ui/react";
import {
  Header,
  Button,
  LifeGauge,
  LifeGaugeElement,
  Toggle,
} from "../components/common";
import { TitleInputField, CheckBox } from "../components/title-page";

export const SplashPage = () => {
  const [selectedValue, setSelectedValue] = useState("");

  const sampleOptions = [
    { value: "apple", label: "りんご" },
    { value: "banana", label: "バナナ" },
    { value: "orange", label: "オレンジ" },
  ];

  return (
    <Flex
      className="page-container"
      width={"100vw"}
      minHeight={"100vh"}
      flexDirection={"column"}
      justifyContent={"center"}
      backgroundColor={"blue"}
    >
      <Header />
      <Flex
        className="page-contents"
        flex={1}
        flexDirection={"column"}
        justifyContent={"center"}
        alignItems={"center"}
      >
        <Text>This is SplashPage</Text>
        <Button
          text="Start"
          isAvairable
          color="var(--color-theme10)"
          width="40%"
        />
        <LifeGaugeElement />
        <LifeGauge />
        <Toggle />
        <TitleInputField
          isSelect={true}
          value={selectedValue}
          onChange={(e) => setSelectedValue(e.target.value)}
          options={sampleOptions}
          label="フルーツを選んでね"
          placeholder="選択してください"
        />
        <TitleInputField />
        <CheckBox />
      </Flex>
    </Flex>
  );
};
