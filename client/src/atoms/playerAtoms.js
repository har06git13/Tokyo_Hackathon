import { atom } from "jotai";

// ユーザー基本情報
export const playerNameAtom = atom("");
export const playerAgeAtom = atom("");
export const playerGenderAtom = atom("");
export const playerResidenceAtom = atom(""); // 生活拠点

// ゲーム進行用
export const currentTimeAtom = atom(""); // 現在時刻
export const currentLocationAtom = atom(""); // 現在地

// ライフゲージ（個別でも全体でも）
export const healthAtom = atom(70);
export const mentalAtom = atom(70);
export const chargeAtom = atom(60);
export const moneyAtom = atom(0);
export const lifeGaugeAtom = atom((get) => ({
  health: get(healthAtom),
  mental: get(mentalAtom),
  charge: get(chargeAtom),
  money: get(moneyAtom),
}));

// イベント履歴
export const sampleEvent = {
  id: "event001",
  time: "09:00",
};
export const eventHistoryAtom = atom([sampleEvent]); // イベントid,イベント時刻を保存

// 訪問済み施設
export const visitedFacilitiesAtom = atom([]); // 施設idを保存、最初は未訪問

// 生存または避難失敗
export const survivedAtom = atom(null); // true/false/null（未確定）

// 生存ポイントまたは死因(暫定) あとでProptypesしたい
export const criticalReasonList = [
  "lowHealth",
  "timeup",
  "batteryRental",
  "goodMeal",
  "getInfo",
];
export const criticalReasonAtom = atom("lowHealth"); // Listから1つ自動でセットされる
