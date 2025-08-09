export const spotTypeList = {
  shelter: {
    name: "帰宅困難者受け入れ施設",
    description: [
      "公共施設や大規模ビルなど。災害時に開放されることがある。",
      "→ ゆっくり休んだり、スマホを充電できることも。",
    ],
  },
  evacuation: {
    name: "避難所",
    description: [
      "学校や地域センターなど。安全だが、支援物資はあまり期待できないかも。",
      "→ ひとまず落ち着きたいときに便利。",
    ],
  },
  temporary: {
    name: "一時避難場所",
    description: [
      "渋谷区が指定する、ひらけた屋外スペース。",
      "→ 周囲の人と助け合えることもあれば、少し心細いことも…。",
    ],
  },
  restaurant: {
    name: "飲食店・コンビニなど",
    description: [
      "ちょっとした物資を手に入れたり、トイレを借りられるかも。",
      "→ 立ち寄れば、必要なものが見つかるかも？",
    ],
  },
  atm: {
    name: "銀行・ATM",
    description: [
      "現金の入手手段。ただし、すでに人だかりになってる可能性あり。",
    ],
  },
  phone: {
    name: "公衆電話",
    description: [
      "スマホが使えない時の頼みの綱。",
      "→ 落ち着いた気持ちでいれば、使い慣れていないものも落ち着いて使えるかも。",
    ],
  },
  mobilebattery: {
    name: "モバイルバッテリースタンド",
    description: [
      "電源が心もとないときはここへ。",
      "→ 在庫切れや使えない場合もあるので、余裕を持って探すのが吉。",
    ],
  },
  arrow: {
    name: "渋谷アロープロジェクト",
    description: [
      "壁に描かれたグラフィティ。よく見ると矢印はだいたい同じ方向を指しているかも...?",
      "→ 正しい方向を見つけると、ちょっと安心できるかも。",
    ],
  },
  default: {
    name: "不明",
    description: ["情報がありません。"],
  },
};

export const eventTypeList = {
  time: "時間経過によるゲージ消費",
  walk: "移動",
  sns: "SNS",
  prologue: "プロローグ：被災",
  epilogue: "エピローグ",
};

export const spotStatusTypeList = {
  default: "移動可能",
  unavailable: "来訪済み",
};

export const ageTypeList = {
  y10: "10代以下",
  y20: "20代",
  y30: "30代",
  y40: "40代",
  y50: "50代",
  y60: "60代",
  y70: "70代以上",
};

export const genderTypeList = {
  male: "男性",
  female: "女性",
  other: "それ以外",
  undefined: "回答しない",
};

export const residenceTypeList = {
  school: "渋谷区在学",
  live: "渋谷区在住",
  work: "渋谷区在勤",
  weekly: "週1回以上渋谷区に来訪",
  few_per_month: "月2〜3回程度来訪",
  monthly: "月1回程度来訪",
  rarely: "それ以下の頻度で来訪",
};
