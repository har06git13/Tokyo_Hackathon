import PropTypes from "prop-types";
import React from "react";
import { Flex, Text, Input } from "@chakra-ui/react";

export const TitleInputField = ({
  type = "center",
  label = "プレイヤー名",
  placeholder = "渋谷だいごろう",
  value,
  onChange,
  isSelect = false,
  options = [], // 選択肢リスト
}) => {
  let borderRadiusValue = "0";
  if (type === "top") borderRadiusValue = "1vh 1vh 0 0";
  else if (type === "bottom") borderRadiusValue = "0 0 1vh 1vh";

  return (
    <Flex
      className={"title-input-field"}
      width={"100%"}
      height={"100%"}
      backgroundColor={"var(--color-base10)"}
      borderRadius={borderRadiusValue}
      justifyContent={"space-between"}
      alignItems={"center"}
      paddingX={"4%"}
      boxShadow={"0 0 0 0.1vh var(--color-base13)"}
    >
      <Text className="text-maintext" width={"40%"}>
        {label}
      </Text>
      {isSelect ? (
        // ドロップダウンセレクトフィールド
        <select
          className="text-maintext"
          style={{
            backgroundColor: "transparent",
            border: "none",
            outline: "none",
            textAlign: "right",
            width: "60%",
            padding: 0,
            height: "100%",
          }}
          value={value}
          onChange={onChange}
        >
          <option value="" disabled>
            {/* 初期値(選択不可) */}
            {placeholder}
          </option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : (
        // テキスト入力フィールド
        <Input
          className="text-maintext"
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          bg="transparent"
          border="none"
          outline="none"
          textAlign="right"
          width="60%"
          _placeholder={{ color: "var(--color-base13)" }}
          padding={0}
          maxLength={10}
          height={"100%"}
        />
      )}
    </Flex>
  );
};

TitleInputField.propTypes = {
  type: PropTypes.oneOf(["center", "top", "bottom"]),
  label: PropTypes.string,
  placeholder: PropTypes.string,
  isSelect: PropTypes.bool,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    })
  ),
};
