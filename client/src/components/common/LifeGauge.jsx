import PropTypes from "prop-types";
import React from "react";
import { LifeGaugeElement } from "./LifeGaugeElement";
import { Flex } from "@chakra-ui/react";
import { useAtomValue } from "jotai";
import {
  lifeAtom,
  mentalAtom,
  chargeAtom,
  moneyAtom,
} from "../../atoms/playerAtoms";

export const LifeGauge = ({ howto = true }) => {
  const life = useAtomValue(lifeAtom);
  const mental = useAtomValue(mentalAtom);
  const charge = useAtomValue(chargeAtom);
  const money = useAtomValue(moneyAtom);

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
      {howto ? (
        <Flex
          className={"life-gauge"}
          width={"90vw"}
          justifyContent={"space-between"}
        >
          <LifeGaugeElement type={"life"} amount={life} />
          <LifeGaugeElement type={"mental"} amount={mental} />
          <LifeGaugeElement type={"charge"} amount={charge} />
          <LifeGaugeElement type={"money"} amount={money} />
          <LifeGaugeElement type="howto" onClick={handleClick} />
        </Flex>
      ) : (
        <Flex className={"life-gauge"} gap={"1.8vw"} width={"fit-content"}>
          <LifeGaugeElement type={"life"} amount={life} />
          <LifeGaugeElement type={"mental"} amount={mental} />
          <LifeGaugeElement type={"charge"} amount={charge} />
          <LifeGaugeElement type={"money"} amount={money} />
        </Flex>
      )}
    </>
  );
};

LifeGauge.propTypes = {
  howto: PropTypes.bool,
};
