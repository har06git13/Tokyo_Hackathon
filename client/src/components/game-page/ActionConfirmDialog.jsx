import PropTypes from "prop-types";
import React from "react";
import { Button } from "../common";
import { HelpIcon } from "../icons";
import { LifeGauge } from "../common";
import { Flex, Text } from "@chakra-ui/react";
import { chargeAtom } from "../../atoms/playerAtoms";
import { useAtom } from "jotai";

export const ActionConfirmDialog = ({
  actionType = "sns", // "walk","sns"
  spotName = "施設名を設定",
  arrivalTime = "00:00",
  life = 999,
  mental = 999,
  charge = 999,
  money = 999,
  onBackClick,
  onClick,
}) => {
  const [currentCharge] = useAtom(chargeAtom);
  const isLowCharge = currentCharge === 0 ? true : false;

  // 数値が0で来ている場合は±0と表示
  const formatValue = (val) => (val === 0 ? "±0" : val);

  return (
    <Flex
      className="action-confirm-dialog"
      flexDirection="column"
      width={actionType === "sns" ? "100%" : "90%"}
      backgroundColor={"var(--color-base10)"}
      paddingX={actionType === "sns" ? "9%" : "5%"}
      paddingY={actionType === "sns" ? "5%" : "2vh"}
      borderRadius={actionType === "sns" ? "10vw 10vw 0 0" : "1vh"}
      justifyContent={"space-between"}
      gap={"1vh"}
    >
      <Flex width={"100%"} alignItems={"center"} gap={"4%"}>
        <HelpIcon width="12%" />
        <Flex flexDirection={"column"}>
          {actionType === "walk" ? (
            <Text className="text-subtext">この場所に移動しますか？</Text>
          ) : undefined}
          <Text className="text-sectiontitle">
            {actionType === "walk" ? spotName : "SNSを見ますか？"}
          </Text>
        </Flex>
      </Flex>

      <Flex flexDirection={"column"} gap={"0.6vh"}>
        <Text className="text-maintext">想定所要ゲージ</Text>
        <LifeGauge
          howto={false}
          life={formatValue(life)}
          mental={formatValue(mental)}
          charge={formatValue(charge)}
          money={formatValue(money)}
        />
        <Text className="text-subtext">
          ※想定外の変動が起こることがあります。災害時は予測不能な事態が起こりうるため、ご注意ください。
        </Text>
      </Flex>

      <Flex>
        <Text className="text-maintext" color={"var(--color-accent10)"}>
          {actionType === "walk"
            ? `到着予定時刻：${arrivalTime}`
            : `終了予定時刻：${arrivalTime}`}
        </Text>
      </Flex>

      <Flex>
        <Text className={"text-subtext"} color={"var(--color-theme10)"}>
          {actionType === "walk" ? (
            <>
              「移動」を押すと、目的地の変更はできません。
              <br />
              移動や、移動中の時間経過によって体力が0%になると、避難失敗(ゲームオーバー)となります。
              体力に注意して行動しましょう。
            </>
          ) : actionType === "sns" ? (
            isLowCharge ? (
              <>充電が足りないため、SNSを見ることができません。</>
            ) : (
              <>
                「見る」を押すと、アクションの変更はできません。
                <br />
                SNSを見ている途中の時間経過によって体力が0%になると、避難失敗(ゲームオーバー)となります。
                体力に注意して行動しましょう。
              </>
            )
          ) : null}
        </Text>
      </Flex>

      <Flex width={"100%"} justifyContent={"space-between"} gap={"4%"}>
        {actionType === "walk" && (
          <Button
            text="戻る"
            isAvailable
            color="var(--color-base13)"
            onClick={onBackClick}
            width="100%"
            height="3.6vh"
          />
        )}
        <Button
          text={actionType === "walk" ? "移動する" : "見る"}
          isAvailable={isLowCharge ? false : true}
          color="var(--color-theme10)"
          onClick={onClick}
          width="100%"
          height="3.6vh"
        />
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
