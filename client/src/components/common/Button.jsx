import PropTypes from "prop-types";
import React from "react";
import { Text } from "@chakra-ui/react";

export const Button = ({
  isAvairable,
  text = "Button",
  width = "100%",
  height = "100%",
  color = "var(--color-theme10)",
}) => {
  return (
    <button
      className="button"
      style={{
        width,
        height,
        backgroundColor: isAvairable ? color : "var(--color-base13)",
        borderRadius: "9999px",
        padding: "1% 0",
      }}
      disabled={!isAvairable}
    >
      <Text className="text-basetext" color={"var(--color-base10)"}>
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
