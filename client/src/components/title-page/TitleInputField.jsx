import PropTypes from "prop-types";
import React from "react";
import { Flex, Text, Input } from "@chakra-ui/react";

/**
 * TitleInputFieldコンポーネント
 *
 * @param {Object} props
 * @param {'center' | 'top' | 'bottom'} props.type - 角丸スタイルの種類
 * @param {string} props.label - ラベルテキスト
 * @param {string} props.placeholder - 入力欄のプレースホルダー
 * @param {string} props.value - 入力値
 * @param {function} props.onChange - 入力変更時のコールバック
 * @param {boolean} props.isSelect - セレクトモードかどうか
 * @param {Array<{value: string, label: string}>} props.options - セレクトの選択肢リスト
 */
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
  if (type === "top") borderRadiusValue = "3vw 3vw 0 0";
  else if (type === "bottom") borderRadiusValue = "0 0 3vw 3vw";

  return (
    <Flex
      className={"title-input-field"}
      width={"90vw"}
      height={"10.6vw"}
      backgroundColor={"var(--color-base10)"}
      borderRadius={borderRadiusValue}
      justifyContent={"space-between"}
      alignItems={"center"}
      paddingX={"4vw"}
      paddingY={"3vw"}
      boxShadow={"0 0 0 0.1vw var(--color-base13)"}
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
