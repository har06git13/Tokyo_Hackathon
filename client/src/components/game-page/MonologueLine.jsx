import PropTypes from "prop-types";
import React from "react";
import { Flex, Text } from "@chakra-ui/react";
import { useAtom } from "jotai";
import { playerNameAtom } from "../../atoms/playerAtoms";

export const MonologueLine = ({
  type = "system", // "system" or "talk"
  isCritical = false, // true: critical, false: normal
  isPlayer = true, // true: player, false: other
  isDecrease = false, // true: decrease, false: normal
  text = "Default text デフォルトテキスト Default text デフォルトテキスト Default text デフォルトテキスト Default text デフォルトテキスト ",
  name = "若者",
}) => {
  const [playername] = useAtom(playerNameAtom);
  return (
    <Flex
      className={"monologue-line"}
      width={"100%"}
      justifyContent={"center"}
      alignItems={"center"}
      whiteSpace={"pre-line"}
    >
      {type === "system" && (
        <Flex
          backgroundColor={"var(--color-base101)"}
          paddingX={"8%"}
          borderRadius={"9999px"}
          justifyContent={"center"}
          alignItems={"center"}
          width={"80%"}
          paddingY={"1.4%"}
        >
          <Text
            className="text-subtext"
            color={
              isCritical
                ? "var(--color-accent10)"
                : isDecrease
                ? "var(--color-theme10)"
                : "var(--color-font11)"
            }
          >
            {text}
          </Text>
        </Flex>
      )}

      {type === "talk" && (
        <Flex
          flexDirection={"column"}
          width={"100%"}
          alignItems={isPlayer ? "flex-end" : "flex-start"}
          gap={"0.6vh"}
          paddingY={"2%"}
        >
          <Text className="text-maintext" color={"var(--color-base10)"}>
            {isPlayer ? playername : name}
          </Text>

          <Flex
            backgroundColor={
              isPlayer ? "var(--color-theme11)" : "var(--color-base10)"
            }
            paddingX={"4%"}
            paddingY={"2%"}
            borderRadius={"3vw"}
            maxWidth={"100%"}
          >
            <Text className="text-maintext">{text} </Text>
          </Flex>
        </Flex>
      )}
    </Flex>
  );
};

MonologueLine.propTypes = {
  type: PropTypes.oneOf(["system", "talk"]),
  isCritical: PropTypes.bool,
  isPlayer: PropTypes.bool,
  isDecrease: PropTypes.bool,
  text: PropTypes.string,
};
