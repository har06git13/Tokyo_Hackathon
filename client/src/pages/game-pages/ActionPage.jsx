import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Flex, Box } from "@chakra-ui/react";
import { Header, LifeGauge } from "../../components/common";
import {
  EventText,
  ActionTab,
  MapMarkerLegend,
  MapSpotInfo,
  Footer,
  ActionConfirmDialog,
} from "../../components/game-page";
import { SnsLogoIcon } from "../../components/icons";

export const ActionPage = () => {
  const [spotSelected, setSpotSelected] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [actionType, setActionType] = useState("walk");

  const navigate = useNavigate();

  useEffect(() => {
    setSpotSelected(false);
  }, [actionType]);

  return (
    <Flex
      className="page-container"
      backgroundColor={"var(--color-base12)"}
      position="relative"
    >
      <Header prevPage={false} currentPage="アクション" />
      <Flex className="page-contents" gap={"2vw"} paddingTop={"4vw"}>
        <LifeGauge />
        <EventText />
        <ActionTab
          type={actionType}
          onSnsClick={() => setActionType("sns")}
          onWalkClick={() => setActionType("walk")}
        />
        {actionType === "walk" && (
          <Flex
            className="map"
            backgroundColor={"var(--color-theme11)"}
            flex={1}
            width={"100%"}
            flexDirection={"column"}
            alignItems={"center"}
            justifyContent={"space-between"}
            onClick={() => setSpotSelected((prev) => !prev)}
            position="relative"
          >
            <MapMarkerLegend />
            {spotSelected && (
              <MapSpotInfo
                onClick={(e) => {
                  setShowConfirmDialog(true);
                }}
              />
            )}
            {showConfirmDialog && (
              <>
                <Box
                  position="absolute"
                  top={0}
                  left={0}
                  w="100%"
                  h="100%"
                  bg="rgba(0,0,0,0.5)"
                  zIndex={1}
                />
                <Flex
                  position="absolute"
                  top="50%"
                  left="50%"
                  transform="translate(-50%, -50%)"
                  zIndex={2}
                >
                  <ActionConfirmDialog
                    actionType="walk"
                    onBackClick={() => {
                      setShowConfirmDialog(false);
                    }}
                    onClick={() => navigate("../walk")}
                  />
                </Flex>
              </>
            )}
          </Flex>
        )}
        {actionType === "sns" && (
          <Flex
            className="sns"
            backgroundColor={"var(--color-theme10)"}
            flex={1}
            width={"100%"}
            flexDirection={"column"}
            alignItems={"center"}
            justifyContent={"end"}
          >
            <SnsLogoIcon color="var(--color-base10)" width="20%" />
            <ActionConfirmDialog onClick={() => navigate("/game/sns")} />
          </Flex>
        )}
      </Flex>
      <Footer />
    </Flex>
  );
};
