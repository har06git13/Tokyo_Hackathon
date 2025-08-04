import PropTypes from "prop-types";
import React from "react";
import { Text } from "@chakra-ui/react";

export const Button = ({
  isAvailable,
  text = "Button",
  width = "100%",
  height = "100%",
  color = "var(--color-theme10)",
  onClick,
}) => {
  return (
    <button
      className="button"
      style={{
        width,
        height,
        backgroundColor: isAvailable ? color : "var(--color-base13)",
        borderRadius: "9999px",
        padding: "1% 0",
      }}
      disabled={!isAvailable}
      oncClick={onClick}
    >
      <Text className="text-maintext" color={"var(--color-base10)"}>
        {text}
      </Text>
    </button>
  );
};

Button.propTypes = {
  isAvairable: PropTypes.bool,
  text: PropTypes.string,
  width: PropTypes.string,
  height: PropTypes.string,
  color: PropTypes.string,
};
