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
  title = "体力",
  text = "行動全般で消費。0%になると移動や操作が不能になり、避難失敗(ゲームオーバー)。",
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
        {title}
      </Text>

      <Text className="text-maintext" width="66vw">
        {text}
      </Text>
    </Flex>
  );
};

LifeGaugeListElement.propTypes = {
  type: PropTypes.oneOf(["life", "mental", "charge", "money"]),
  title: PropTypes.string,
  text: PropTypes.string,
};
