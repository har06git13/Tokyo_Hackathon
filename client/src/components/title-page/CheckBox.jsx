import PropTypes from "prop-types";
import React from "react";
import { CheckIcon } from "../icons";
import { Flex } from "@chakra-ui/react";

export const CheckBox = ({ isChecked, onChange }) => {
  return (
    <Flex
      className="check-box"
      onClick={() => onChange(!isChecked)}
      aspectRatio={1}
      height="2.4vh"
      backgroundColor={
        isChecked ? "var(--color-theme10)" : "var(--color-base10)"
      }
      paddingX="0.6vh"
      borderRadius="0.4vh"
      alignItems="center"
      justifyContent="center"
      cursor="pointer"
    >
      <CheckIcon
        className="check-icon"
        color={isChecked ? "var(--color-base10)" : "var(--color-base13)"}
      />
    </Flex>
  );
};

CheckBox.propTypes = {
  isChecked: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
};
