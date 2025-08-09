import React, { useState } from "react";
import { Flex, Text, Image } from "@chakra-ui/react";
import { Button } from "../../components/common";
import { useNavigate } from "react-router-dom";
import { CheckBox, TitleInputField } from "../../components/title-page";
import { ageTypes, genderTypes, residenceTypes } from "../../TypeList";
import { useSetAtom } from "jotai";
import {
  playerNameAtom,
  playerAgeAtom,
  playerGenderAtom,
  playerResidenceAtom,
} from "../../atoms/playerAtoms";

export const ProfilePage = () => {
  const navigate = useNavigate();

  const [playerName, setPlayerName] = useState("");
  const [selectedAgeValue, setSelectedAgeValue] = useState("");
  const [selectedGenderValue, setSelectedGenderValue] = useState("");
  const [selectedResidenceValue, setSelectedResidenceValue] = useState("");
  const [agreed, setAgreed] = useState(false);

  const setPlayerNameAtom = useSetAtom(playerNameAtom);
  const setPlayerAgeAtom = useSetAtom(playerAgeAtom);
  const setPlayerGenderAtom = useSetAtom(playerGenderAtom);
  const setPlayerResidenceAtom = useSetAtom(playerResidenceAtom);

  const ageOptions = toSelectOptions(ageTypes);
  const genderOptions = toSelectOptions(genderTypes);
  const residenceOptions = toSelectOptions(residenceTypes);

  const handleClick = () => {
    if (isFormComplete) {
      // atomにセット
      setPlayerNameAtom(playerName || "Default Player");
      setPlayerAgeAtom(selectedAgeValue || "20代");
      setPlayerGenderAtom(selectedGenderValue || "男性");
      setPlayerResidenceAtom(selectedResidenceValue || "渋谷区在学");

      // プロローグに遷移
      navigate("/game/monologue");
    }
  };

  // 必要事項が入力されているかの確認
  const isFormComplete =
    playerName !== "" &&
    selectedAgeValue !== "" &&
    selectedGenderValue !== "" &&
    selectedResidenceValue !== "" &&
    agreed;

  return (
    <Flex
      className="page-container"
      width={"100vw"}
      minHeight={"100vh"}
      flexDirection={"column"}
      justifyContent={"center"}
      alignItems={"center"}
      backgroundColor={"var(--color-base12)"}
      gap={"6vw"}
      paddingBottom={"28vw"}
    >
      <Image src="/assets/svg/titlesvg-2.svg" width={"60vw"} height={"25vw"} />

      <Text className="text-pagetitle">プロフィール入力</Text>

      <Flex flexDirection={"column"}>
        <TitleInputField
          type="top"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
        />
        <TitleInputField
          type="center"
          isSelect
          label="年代"
          placeholder="年代を選択..."
          value={selectedAgeValue}
          onChange={(e) => setSelectedAgeValue(e.target.value)}
          options={ageOptions}
        />
        <TitleInputField
          type="center"
          isSelect
          label="性別"
          placeholder="性別を選択..."
          value={selectedGenderValue}
          onChange={(e) => setSelectedGenderValue(e.target.value)}
          options={genderOptions}
        />
        <TitleInputField
          type="bottom"
          isSelect
          label="生活拠点"
          placeholder="生活拠点を選択..."
          value={selectedResidenceValue}
          onChange={(e) => setSelectedResidenceValue(e.target.value)}
          options={residenceOptions}
        />
      </Flex>

      <Flex alignItems={"center"} gap={"2vw"} paddingY={"2vw"}>
        <CheckBox isChecked={agreed} onChange={setAgreed} />
        <Text className="text-subtext">
          <span
            style={{
              textDecoration: "underline",
              color: "var(--color-theme10)",
              cursor: "pointer",
            }}
            onClick={() => alert("利用規約を表示（仮）")}
          >
            利用規約
          </span>
          、
          <span
            style={{
              textDecoration: "underline",
              color: "var(--color-theme10)",
              cursor: "pointer",
            }}
            onClick={() => alert("プライバシーポリシーを表示（仮）")}
          >
            プライバシーポリシー
          </span>
          に同意する。
        </Text>
      </Flex>

      <Button
        width="90vw"
        height="10.6vw"
        text="プロローグへ"
        isAvailable={isFormComplete}
        onClick={handleClick}
      />
    </Flex>
  );
};

const toSelectOptions = (obj) =>
  Object.entries(obj).map(([value, label]) => ({
    value,
    label,
  }));
