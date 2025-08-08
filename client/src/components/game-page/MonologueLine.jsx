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
      width={"90vw"}
      justifyContent={"center"}
      alignItems={"center"}
      whiteSpace={"pre-line"}
    >
      {type === "system" && (
        <Flex
          backgroundColor={"var(--color-base101)"}
          paddingX={"6vw"}
          borderRadius={"9999px"}
          justifyContent={"center"}
          alignItems={"center"}
          width={"74vw"}
          paddingY={"1.6vw"}
        >
          <Text
            className="text-subtext"
            color={
              isCritical
                ? "var(--color-theme10)"
                : isDecrease
                ? "var(--color-accent10)"
                : "currentcolor"
            }
          >
            {text}
          </Text>
        </Flex>
      )}

      {type === "talk" && (
        <Flex
          flexDirection={"column"}
          width={"90vw"}
          alignItems={isPlayer ? "flex-end" : "flex-start"}
          gap={"1vw"}
          paddingY={"2vw"}
        >
          <Text className="text-maintext" color={"var(--color-base10)"}>
            {isPlayer ? playername : name}
          </Text>

          <Flex
            backgroundColor={
              isPlayer ? "var(--color-theme11)" : "var(--color-base10)"
            }
            paddingX={"3vw"}
            paddingY={"2vw"}
            borderRadius={"3vw"}
            maxWidth={"81.6vw"}
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
