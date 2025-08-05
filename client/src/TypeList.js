export const spotTypes = {
  mobilebattery: "モバイルバッテリースタンド",
  shelter: "帰宅困難者受け入れ施設",
  evacuation: "避難所",
  temporary: "一時避難場所",
  atm: "銀行/ATM",
  phone: "公衆電話",
  restaurant: "飲食店・小売店",
  toilet: "公衆トイレ",
  arrow: "渋谷アロープロジェクト",
  default: "不明",
};

export const eventTypes = {
  time: "時間経過によるゲージ消費",
  event: "移動先にて",
  walk: "移動",
  sns: "SNS",
  prologue: "プロローグ：被災",
  default: "イベントを設定",
};

export const spotStatusTypes = {
  default: "移動可能",
  unavailable: "来訪済み",
};

export const ageTypes = {
  y10: "10代以下",
  y20: "20代",
  y30: "30代",
  y40: "40代",
  y50: "50代",
  y60: "60代",
  y70: "70代以上",
};

export const genderTypes = {
  male: "男性",
  female: "男性",
  other: "それ以外",
  undefined: "回答しない",
};

export const residenceTypes = {
  school: "渋谷区在学",
  live: "渋谷区在住",
  work: "渋谷区在勤",
  weekly: "週1回以上渋谷区に来訪",
  few_per_month: "月2〜3回程度来訪",
  monthly: "月1回程度来訪",
  rarely: "それ以下の頻度で来訪",
};
