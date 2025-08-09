import React from "react";
import PropTypes from "prop-types";
import { LifeIcon, MentalIcon, ChargeIcon, MoneyIcon } from "../icons";
import { Flex, Text } from "@chakra-ui/react";

const iconMap = {
  life: LifeIcon,
  mental: MentalIcon,
  charge: ChargeIcon,
  money: MoneyIcon,
};

export const LifeGaugeListElement = ({
  type = "life", // life, mental, charge, money
}) => {
  const IconComponent = iconMap[type] || LifeIcon;

  return (
    <Flex
      className="life-gauge-list"
      width="90vw"
      height="fit-content"
      paddingY="2vw"
      alignItems="center"
      justifyContent="space-between"
    >
      <IconComponent width="9.1vw" height="9.1vw" />

      <Text className="text-maintext" width="10vw">
        {type === "life"
          ? "体力"
          : type === "mental"
          ? "精神力"
          : type === "charge"
          ? "電源"
          : "現金"}
      </Text>

      <Text className="text-maintext" width="66vw">
        {type === "life" ? (
          <>
            時間経過、移動などで消費。食事や水分補給、座って休むなどで回復。
            <br />
            0%になると移動や操作が不能になり、避難失敗(ゲームオーバー)。
          </>
        ) : type === "mental" ? (
          <>
            時間経過、恐怖やストレスなどで減少。食事や人と話すなどで回復。
            <br />
            低下すると正常な判断ができなくなることがある。
          </>
        ) : type === "charge" ? (
          <>
            時間経過やスマホ使用などで消費。充電すると回復。
            <br />
            なくなるとSNSやマップの一部機能などが使用不可に。
          </>
        ) : (
          <>
            物資の購入に使用できる。ATMやコンビニなどで入手できる場合がある。
            <br />
            0円になると、キャッシュレス決済が使えない場合に物資の購入ができなくなる。
          </>
        )}
      </Text>
    </Flex>
  );
};

LifeGaugeListElement.propTypes = {
  type: PropTypes.oneOf(["life", "mental", "charge", "money"]),
  title: PropTypes.string,
  text: PropTypes.string,
};
