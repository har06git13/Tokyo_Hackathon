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
import {
  SettingElement,
  SettingInfoIndex,
  LifeGaugeListElement,
} from "../components/game-page";
import { MonologueLine } from "../components/game-page/MonologueLine";
import { LogElement } from "../components/game-page/LogElement";
import { MapMarkerLegend } from "../components/game-page/MapMarkerLegend";
import { MapSpotInfo } from "../components/game-page/MapSpotInfo";
import { EventText } from "../components/game-page/EventText";
import { ActionTab } from "../components/game-page/ActionTab";
import { ActionConfirmDialog } from "../components/game-page/ActionConfirmDialog";
import { CheckinButton } from "../components/game-page/CheckinButton";
import { TweetCard } from "../components/game-page/TweetCard";
import { Footer } from "../components/game-page/Footer";

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
        <Footer />
        <TweetCard />
        <CheckinButton />
        <ActionConfirmDialog />
        <ActionTab />
        <EventText />
        <MapSpotInfo life={+10} mental={-10} charge={0} money={0} />
        <MapMarkerLegend />
        <LogElement
          eventtype="event"
          spottype="battery"
          text="モバイルバッテリーをレンタルした。"
        />
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
        <SettingElement type="top" />
        <SettingElement type="center" />
        <SettingElement type="bottom" />
        <SettingInfoIndex />
        <LifeGaugeListElement />
        <MonologueLine />
        <MonologueLine type="talk" />
      </Flex>
    </Flex>
  );
};
