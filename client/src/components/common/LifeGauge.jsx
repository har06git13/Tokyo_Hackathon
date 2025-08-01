import PropTypes from "prop-types";
import React from "react";
import { LifeGaugeElement } from "./LifeGaugeElement";
import { Flex } from "@chakra-ui/react";

export const LifeGauge = ({ howto = true }) => {
  const handleClick = () => {
    alert(
      "体力(life)、精神(mental)、充電(charge)、お金(money)のゲージです。\n" +
        "時間経過やイベント等で減少します。\n" +
        "体力が0になると即時に避難失敗(ゲームオーバー)となります。\n" +
        "他のゲージは、0になっても即死にはなりませんが、イベント等で不利になる可能性があります。\n" +
        "ゲージ管理をしっかり行いながら行動しましょう。"
    );
  };

  return (
    <>
      {howto && (
        // 説明も表示
        <Flex
          className={"life-gauge"}
          width={"90vw"}
          justifyContent={"space-between"}
        >
          <LifeGaugeElement type={"life"} />
          <LifeGaugeElement type={"mental"} />
          <LifeGaugeElement type={"charge"} />
          <LifeGaugeElement type={"money"} />
          <LifeGaugeElement type="howto" onClick={handleClick} />
        </Flex>
      )}
      {!howto && (
        // 説明なしで、ライフゲージのみ表示
        <Flex className={"life-gauge"} gap={"1.8vw"} width={"fit-content"}>
          <LifeGaugeElement type={"life"} />
          <LifeGaugeElement type={"mental"} />
          <LifeGaugeElement type={"charge"} />
          <LifeGaugeElement type={"money"} />
        </Flex>
      )}
    </>
  );
};

LifeGauge.propTypes = {
  howto: PropTypes.bool,
};
