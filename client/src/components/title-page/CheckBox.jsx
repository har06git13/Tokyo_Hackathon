import PropTypes from "prop-types";
import React from "react";
import { CheckIcon } from "../icons";
import { Flex } from "@chakra-ui/react";

export const CheckBox = ({ isChecked, onChange }) => {
  return (
    <Flex
      className="check-box"
      onClick={() => onChange(!isChecked)}
      width="5vw"
      height="5vw"
      backgroundColor={
        isChecked ? "var(--color-theme10)" : "var(--color-base10)"
      }
      paddingX="1vw"
      borderRadius="1vw"
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
