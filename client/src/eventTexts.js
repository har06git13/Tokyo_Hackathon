// プロローグのテキスト(本来は開始地点とか状況によって変えたい)
export const prologueTexts = [
  {
    type: "system",
    text: "土曜の午後、渋谷は買い物や観光客でにぎわっていた。",
  },
  {
    type: "system",
    text: "ハチ公前には人がたくさん集まり、スマホを操作する人、友達を待つ人の姿が見える。",
  },
  {
    type: "system",
    text: "街角のカフェからは、笑い声や話し声が聞こえてくる。",
  },
  {
    type: "talk",
    isPlayer: true,
    text: "(待ち合わせまで、あと30分か……。合流したらカフェとか行くかもだし、このままここで待ってようっと。)",
  },
  {
    type: "system",
    text: "突然、足元が大きく揺れ始めた。建物の窓ガラスがきしみ、通行人がざわつく。スマホから緊急地震速報の警告音が響き渡る。",
  },
  {
    type: "talk",
    isPlayer: true,
    text: "え、地震？嘘でしょ……",
  },
  {
    type: "system",
    text: "数十秒後、揺れは収まる。",
  },
  {
    type: "system",
    text: "街頭ビジョンは消え、駅へ向かう人々の流れが乱れる。",
  },
  {
    type: "talk",
    isPlayer: false,
    name: "女子高生",
    text: "マジで？わりとデカくない？",
  },
  {
    type: "talk",
    isPlayer: false,
    text: "え、どうする？どうしよう！？",
  },
  {
    type: "talk",
    isPlayer: true,
    text: "(これ……ほんとに非常事態じゃん。)",
  },
  {
    type: "system",
    text: "周囲には泣き出す人も見える。道路は混雑し、助け合う声も聞こえる。",
  },
  {
    type: "talk",
    isPlayer: true,
    text: "(家、帰りたいけど……このまま動いても危ないかも。)",
  },
  {
    type: "system",
    text: "災害時、むやみに帰宅しようとすることで、二次災害に巻き込まれるケースも多いという。",
  },
  {
    type: "system",
    text: "立ち止まり、今できる行動を考える必要がある。",
  },
  {
    type: "system",
    text: "スマホのバッテリーは60%。\n 現金は………………運悪く持ち合わせていない。",
  },
  {
    type: "talk",
    isPlayer: true,
    text: "……動くしか、ないか。",
  },
];

// エピローグのテキスト(本来は終了地点とか状況によって変えたい)
export const epilogueTexts = [
  {
    type: "system",
    text: "帰宅困難者受け入れ施設として開放されたウィズ原宿にたどり着いた。",
  },
  {
    type: "system",
    text: "受付で氏名と連絡先を記入し、毛布と水を受け取る。",
  },
  {
    type: "system",
    text: "施設内では、避難してきた人たちが床に座ったり、壁にもたれたりして静かに過ごしている。",
  },
  {
    type: "system",
    text: "誰もが疲れた表情をしていた。",
  },
  {
    type: "talk",
    isPlayer: true,
    text: "とりあえず、今日はここで一息つける……",
  },
  {
    type: "talk",
    isPlayer: true,
    text: "(毛布があるだけで、ちょっと安心するな。)",
  },
  {
    type: "talk",
    isPlayer: true,
    text: "(明日、電車は動くのかな。水も……まだ足りるかわからない。)",
  },
  {
    type: "talk",
    isPlayer: true,
    text: "(でも今は、ここが安全な場所でよかった。)",
  },
  {
    type: "system",
    text: "非常時の渋谷の一日が、静かに終わろうとしている。",
  },
];
