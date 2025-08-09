import { atom } from "jotai";
import { eventList } from "../temporary-database";

// ユーザー基本情報
export const playerNameAtom = atom("Default Player");
export const playerAgeAtom = atom("20代");
export const playerGenderAtom = atom("男性");
export const playerResidenceAtom = atom("渋谷区在学"); // 生活拠点

// ゲーム進行用
const createStartTime = () => {
  const now = new Date();
  // 今日の日付で時刻だけ14:00にセット
  return new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    14, // 時
    0, // 分
    0, // 秒
    0 // ミリ秒
  );
};
export const currentTimeAtom = atom(createStartTime()); // 現在時刻(ゲーム内)
export const currentTimeSlotAtom = atom((get) => {
  const now = get(currentTimeAtom);
  const hour = now.getHours();
  const min = now.getMinutes();
  const totalMin = hour * 60 + min;

  if (totalMin >= 14 * 60 && totalMin < 16 * 60) return "2h";
  if (totalMin >= 16 * 60 && totalMin < 18 * 60) return "4h";
  if (totalMin >= 18 * 60 && totalMin < 20 * 60) return "6h";
  if (totalMin >= 20 * 60 && totalMin < 22 * 60) return "8h";
  if (totalMin >= 22 * 60 && totalMin < 24 * 60) return "10h";

  return "";
}); // ゲーム開始からの経過時間
export const currentLocationAtom = atom("渋谷駅前"); // 現在地

// ライフゲージ
export const lifeAtom = atom(70);
export const mentalAtom = atom(70);
export const chargeAtom = atom(60);
export const moneyAtom = atom(0);
export const gaugeHistoryAtom = atom([]); // 30分ごとのゲージログ

// 現在の選択に関する情報
export const selectedFacilityAtom = atom(null);
const prologueEvent = eventList.find((e) => e.type === "prologue");
export const selectedEventAtom = atom(prologueEvent);

// 現在のイベントに関する状態管理
export const currentEventStatusAtom = atom(null); // "null","walk","sns","monologue"

// イベント履歴
export const eventHistoryAtom = atom([]); // イベントid,イベント時刻を保存

// 訪問済み施設
export const visitedFacilitiesAtom = atom(["fac_000"]); /// 施設idを保存、最初は被災した地点のみ

// 生存または避難失敗
export const survivedAtom = atom(null); // true/false/null（未確定）

// 生存ポイントまたは死因(暫定) あとでProptypesしたい
export const criticalReasonList = [
  "lowLife",
  "timeup",
  "batteryRental",
  "goodMeal",
  "getInfo",
];
export const criticalReasonAtom = atom("lowHealth"); // Listから1つ自動でセットされる
