import React from "react";
import { Flex } from "@chakra-ui/react";
import { useMonologue } from "../../hooks/useMonologue";
import { MonologueLine } from "./MonologueLine";
import { Button } from "../common";

export const MonologueViewer = ({
  texts,
  onComplete,
  buttonText = "次へ進む",
  onButtonClick,
}) => {
  const { currentIndex, showButton, handleClick, bottomRef } = useMonologue(
    texts,
    onComplete
  );

  return (
    <Flex
      className="monologue"
      flexDirection="column"
      gap="3vw"
      onClick={handleClick}
      alignItems="center"
      overflowY="auto"
      height="90vh"
      paddingY="4vw"
      width="90%"
    >
      {texts.slice(0, currentIndex + 1).map((line, index) => (
        <MonologueLine key={index} {...line} />
      ))}

      {showButton && (
        <Button
          text={buttonText}
          height="10.6vw"
          isAvailable
          onClick={onButtonClick}
        />
      )}

      <div ref={bottomRef} />
    </Flex>
  );
};
