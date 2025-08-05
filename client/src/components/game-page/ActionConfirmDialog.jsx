import PropTypes from "prop-types";
import React from "react";
import { Button } from "../common";
import { HelpIcon } from "../icons";
import { LifeGauge } from "../common";
import { Flex, Text } from "@chakra-ui/react";

export const ActionConfirmDialog = ({
  actionType = "sns", // "walk","sns"
  spotName = "施設名を設定",
  arrivalTime = "00:00",
  life = 99,
  mental = 99,
  charge = 99,
  money = 99,
  onBackClick,
  onClick,
}) => {
  return (
    <Flex
      className="action-confirm-dialog"
      flexDirection="column"
      width={"90vw"}
    >
      <Flex
        flexDirection={"column"}
        width={"100%"}
        backgroundColor={"var(--color-base10)"}
        paddingX={"4vw"}
        paddingY={"4vw"}
        borderRadius={"3vw"}
        gap={"2vw"}
      >
        <Flex width={"100%"} alignItems={"center"} gap={"2vw"}>
          <HelpIcon width="9vw" />
          <Flex flexDirection={"column"}>
            {actionType === "walk" ? (
              <Text className="text-subtext">この場所に移動しますか？</Text>
            ) : undefined}
            <Text className="text-sectiontitle">
              {actionType === "walk" ? spotName : "SNSを見ますか？"}
            </Text>
          </Flex>
        </Flex>

        <Flex flexDirection={"column"} gap={"1vw"}>
          <Text className="text-maintext">想定所要ゲージ</Text>
          <LifeGauge
            howto={false}
            life={life}
            mental={mental}
            charge={charge}
            money={money}
          />
          <Text className="text-subtext">
            ※想定外の変動が起こることがあります。災害時は予測不能な事態が起こりうるため、ご注意ください。
          </Text>
        </Flex>

        <Flex>
          <Text className="text-maintext" color={"var(--color-accent10)"}>
            到着予定時刻：{arrivalTime}
          </Text>
        </Flex>

        <Flex>
          <Text className={"text-subtext"} color={"var(--color-theme10)"}>
            {actionType === "walk" ? (
              <>
                「移動」を押すと、目的地の変更はできません。
                <br />
                移動や、移動中の時間経過によって体力が0%になると、避難失敗となります。
                体力に注意して行動しましょう。
              </>
            ) : actionType === "sns" ? (
              <>
                「見る」を押すと、アクションの変更はできません。
                <br />
                SNSを見ている途中の時間経過によって体力が0%になると、避難失敗となります。
                体力に注意して行動しましょう。
              </>
            ) : null}
          </Text>
        </Flex>

        <Flex
          width={"100%"}
          justifyContent={"space-between"}
          paddingTop={"2vw"}
        >
          <Button text="戻る" onClick={onBackClick} width="48%" height="7vw" />
          <Button
            text={actionType === "walk" ? "移動する" : "見る"}
            isAvailable
            color="var(--color-theme10)"
            onClick={onClick}
            width="48%"
            height="7vw"
          />
        </Flex>
      </Flex>
    </Flex>
  );
};

ActionConfirmDialog.propTypes = {
  actionType: PropTypes.oneOf(["walk", "sns"]),
  spotName: PropTypes.string,
  arrivalTime: PropTypes.string,
  life: PropTypes.number,
  mental: PropTypes.number,
  charge: PropTypes.number,
  money: PropTypes.number,
  onBackClick: PropTypes.func,
  onClick: PropTypes.func,
};
