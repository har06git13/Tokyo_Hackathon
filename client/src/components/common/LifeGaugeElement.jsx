import PropTypes from "prop-types";
import React from "react";
import {
  HelpIcon,
  LifeIcon,
  MentalIcon,
  MoneyIcon,
  ChargeIcon,
} from "../icons";
import { Flex, Text, Box } from "@chakra-ui/react";

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

export const LifeGaugeElement = ({ type, amount, onClick }) => {
  const { color, Icon } = gaugeConfig[type] || gaugeConfig["life"];

  return (
    <Flex
      className="life-gauge-element"
      border="0.1vh solid"
      width="100%"
      borderRadius="99px"
      borderColor={color}
      backgroundColor="var(--color-base10)"
      alignItems="center"
      justifyContent="space-between"
      onClick={onClick}
    >
      <Box height="100%" aspectRatio={1}>
        <Icon height="100%" width="100%" />
      </Box>

      <Flex gap={"0.6%"} paddingRight={"14%"}>
        <Text className="text-subtext" whiteSpace="nowrap">
          {type === "howto" ? "説明" : amount}
        </Text>
        <Text className="text-subtext">
          {type === "money" ? "円" : type === "howto" ? "" : "%"}
        </Text>
      </Flex>
    </Flex>
  );
};

LifeGaugeElement.propTypes = {
  type: PropTypes.oneOf(["mental", "charge", "howto", "money", "life"]),
  amount: PropTypes.number,
};
