import PropTypes from "prop-types";
import React from "react";
import {
  HelpIcon,
  LifeIcon,
  MentalIcon,
  MoneyIcon,
  ChargeIcon,
} from "../icons";
import { Flex, Text } from "@chakra-ui/react";

// typeごとの設定マップ
const gaugeConfig = {
  life: {
    color: "var(--color-life10)",
    Icon: LifeIcon,
  },
  mental: {
    color: "var(--color-mental10)",
    Icon: MentalIcon,
  },
  charge: {
    color: "var(--color-charge10)",
    Icon: ChargeIcon,
  },
  money: {
    color: "var(--color-money10)",
    Icon: MoneyIcon,
  },
  howto: {
    color: "var(--color-base13)",
    Icon: HelpIcon,
  },
};

export const LifeGaugeElement = ({ type, amount = 0, onClick }) => {
  const { color, Icon } = gaugeConfig[type] || gaugeConfig["life"];

  return (
    <Flex
      className="life-gauge-element"
      border="1px solid"
      height="2.8vh"
      width="16.7vw"
      borderRadius="99px"
      borderColor={color}
      backgroundColor="var(--color-base10)"
      alignItems="center"
      justifyContent="space-between"
      onClick={onClick}
    >
      <Icon height="100%" width="2.8vh" />
      <Flex gap={"1vw"} paddingRight={"1.8vw"}>
        <Text className="text-subtext">{amount}</Text>
        <Text className="text-subtext">%</Text>
      </Flex>
    </Flex>
  );
};

LifeGaugeElement.propTypes = {
  type: PropTypes.oneOf(["mental", "charge", "howto", "money", "life"]),
  amount: PropTypes.number,
};
