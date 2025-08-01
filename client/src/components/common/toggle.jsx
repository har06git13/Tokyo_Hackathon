import PropTypes from "prop-types";
import React, { useReducer } from "react";
import { Flex } from "@chakra-ui/react";

export const Toggle = ({ status = true }) => {
  // データの状態管理は行わない
  const [state, dispatch] = useReducer(reducer, {
    status: status || false,
  });

  return (
    <Flex
      className={"toggle"}
      onClick={() => dispatch({ type: "click" })}
      backgroundColor={
        state.status ? "var(--color-theme10)" : "var(--color-base13)"
      }
      width={"12.2vw"}
      borderRadius={"9999px"}
      padding={"0.6vw"}
      alignItems={"center"}
      justifyContent={state.status ? "flex-end" : "flex-start"}
    >
      <Flex
        className="toggle-elemtnt"
        backgroundColor={"var(--color-base10)"}
        width={"6vw"}
        height={"6vw"}
        borderRadius={"9999px"}
      />
    </Flex>
  );
};

function reducer(state, action) {
  switch (action.type) {
    case "click":
      return {
        status: !state.status,
      };
    default:
      return state;
  }
}

Toggle.propTypes = {
  status: PropTypes.bool,
};
