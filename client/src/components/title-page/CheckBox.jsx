import PropTypes from "prop-types";
import React, { useReducer } from "react";
import { CheckIcon } from "../icons";
import { Flex } from "@chakra-ui/react";

/**
 * チェックボックスコンポーネント（内部状態で制御）
 *
 * @component
 * @param {Object} props
 * @param {boolean} props.isChecked - 初期状態でチェックされているかどうか
 */
export const CheckBox = ({ isChecked }) => {
  const [state, dispatch] = useReducer(reducer, {
    isChecked: isChecked || false,
  });

  return (
    <Flex
      className="check-box"
      onClick={() => dispatch({ type: "toggle" })}
      width="5vw"
      height="5vw"
      backgroundColor={
        state.isChecked ? "var(--color-theme10)" : "var(--color-base10)"
      }
      paddingX="1vw"
      borderRadius="1vw"
      alignItems="center"
      justifyContent="center"
      cursor="pointer"
    >
      <CheckIcon
        className="check-icon"
        color={state.isChecked ? "var(--color-base10)" : "var(--color-base13)"}
      />
    </Flex>
  );
};

function reducer(state, action) {
  switch (action.type) {
    case "toggle":
      return { isChecked: !state.isChecked };
    default:
      return state;
  }
}

CheckBox.propTypes = {
  isChecked: PropTypes.bool,
};
