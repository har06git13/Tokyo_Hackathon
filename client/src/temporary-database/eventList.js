export const eventList = [
  {
    id: "event_prologue_001",
    type: "prologue", // "walk","sns","prologue","epilogue"
    requiredDuration: 0, // 単位: 分 デモでは30分固定
    locationId: null, // type === 'walk' の時だけ後で動的に設定する想定
    gaugeChange: { health: 0, mental: 0, battery: 0, money: 0 },
    texts: [
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
        text: "(待ち合わせまで、あと30分か……。合流したらカフェとか行くかもだし、このままここで待ってようっと。)",
      },
      {
        type: "system",
        text: "突然、足元が大きく揺れ始めた。建物の窓ガラスがきしみ、通行人がざわつく。スマホから緊急地震速報の警告音が響き渡る。",
      },
      {
        type: "talk",
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
        text: "(これ……ほんとに非常事態じゃん。)",
      },
      {
        type: "system",
        text: "周囲には泣き出す人も見える。道路は混雑し、助け合う声も聞こえる。",
      },
      {
        type: "talk",
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
        text: "……動くしか、ないか。",
      },
    ],
  },
  {
    id: "event_epilogue_001",
    type: "epilogue",
    requiredDuration: 0,
    locationId: null,
    gaugeChange: { health: 0, mental: 0, battery: 0, money: 0 },
    texts: [
      {
        type: "system",
        text: "ウィズ原宿に到着した。\n 施設タイプ：帰宅困難者受け入れ施設",
      },
      {
        type: "system",
        isDecrease: true,
        text: "移動で体力を5%消費した。",
      },
      {
        type: "system",
        text: " 受付で氏名と連絡先を記入し、毛布と水を受け取る。",
      },
      {
        type: "system",
        text: "施設内では、避難してきた人たちが床に座ったり、壁にもたれたりして静かに過ごしている。\n誰もが疲れた表情をしていた。",
      },
      {
        type: "talk",
        text: "(とりあえず、今日はここで一息つける…… \n 毛布があるだけで、ちょっと安心するな。)",
      },
      {
        type: "talk",
        text: "(電車、明日になったら動くかな。\n 水も……まだ足りるかわからない。)",
      },
      {
        type: "talk",
        text: "(でも今は、ここが安全な場所でよかった。)",
      },
      {
        type: "system",
        text: "非常時の渋谷の一日が、静かに終わろうとしている。",
      },
      {
        type: "system",
        isCritical: true,
        text: "あなたは生還した。",
      },
    ],
  },
  {
    id: "event_sns_001",
    type: "sns",
    requiredDuration: 30,
    locationId: null,
    gaugeChange: { health: 0, mental: -5, battery: -5, money: 0 },
    texts: [
      {
        type: "system",
        isCritical: true,
        text: "時間経過で体力・精神力・電源を5%消費した。",
      },
      { type: "system", isDecrease: true, text: "SNSで電源を5%消費した。" },
      { type: "system", text: "SNSでいくつかの情報を入手した。" },
      {
        type: "talk",
        text: "(ガス漏れってマジ？どこまでがデマなんだ……本当の情報が見えない。)",
      },
      {
        type: "talk",
        text: "(バズ狙いの投稿と、切実な助けを求める声が入り混じってる。)",
      },
      {
        type: "system",
        text: "何が正しいのかわからないまま、スマホをスクロールし続けてしまった。",
      },
      {
        type: "talk",
        text: "(ただ、じわじわと不安と焦りが染み込んでくる。)",
      },
      {
        type: "talk",
        text: "……怖すぎる。",
      },
      { type: "system", isDecrease: true, text: "精神を5%消費した。" },
    ],
  },
  {
    id: "event_sns_002",
    type: "sns",
    requiredDuration: 30,
    locationId: null,
    gaugeChange: { health: 0, mental: 0, battery: -5, money: 0 },
    texts: [
      {
        type: "system",
        isDecrease: true,
        text: "時間経過で体力・精神力・電源を5%消費した。",
      },
      { type: "system", isDecrease: true, text: "SNSで電源を5%消費した。" },
      { type: "system", text: "SNSでいくつかの情報を入手した。" },
      {
        type: "talk",
        text: "(みんなそれぞれで動いてるな……)",
      },
      {
        type: "talk",
        text: "(高層ビル全部崩れるはさすがにデマだろうな、でも本当だったらどうしよう。)",
      },
      {
        type: "talk",
        text: "(それにグラフィティの矢印って何だ？ 見落とさないようにしなきゃ。)",
      },
      {
        type: "system",
        isDecrease: true,
        text: "電源を5%消費した。",
      },
    ],
  },
  {
    id: "event_walk_001",
    type: "walk",
    requiredDuration: 30,
    locationId: "fac_001", // CHARGESPOT HUB 渋谷センター街店
    gaugeChange: { health: -5, mental: +5, battery: +50, money: 0 },
    texts: [
      {
        type: "system",
        text: "CHARGESPOT HUB 渋谷センター街店に到着した。\n 施設タイプ：モバイルバッテリースタンド",
      },
      {
        type: "system",
        isDecrease: true,
        text: "移動で体力を5%消費した。",
      },
      {
        type: "talk",
        text: "(店舗の灯りが心強い。)",
      },
      {
        type: "system",
        text: "設置されたモバイルバッテリースタンドに、まだかろうじてバッテリーが残っていた。",
      },
      {
        type: "talk",
        text: "ーー助かった。",
      },
      {
        type: "system",
        text: "すぐにレンタル手続きを済ませ、スマホがじわじわと充電されていくのを見守る。",
      },
      {
        type: "talk",
        text: "(電源が回復するのと同時に、胸の奥に少しだけ余裕が戻ってきた気がした。)",
      },
      {
        type: "system",
        isCritical: true,
        text: "電源が50%回復した。",
      },
      {
        type: "system",
        isCritical: true,
        text: "精神が5%回復した。",
      },
    ],
  },
  {
    id: "event_walk_002",
    type: "walk",
    requiredDuration: 30,
    locationId: "fac_002", // 薬 マツモトキヨシ SHIBUYA DOGENZAKA FLAG
    gaugeChange: { health: -5, mental: 0, battery: 0, money: 0 },
    texts: [
      {
        type: "system",
        text: "薬 マツモトキヨシ SHIBUYA DOGENZAKA FLAGに到着した。 \n 施設タイプ：渋谷アロープロジェクト",
      },
      {
        type: "system",
        isDecrease: true,
        text: "移動で体力を5%消費した。",
      },
      {
        type: "system",
        text: "混雑した店内を歩き回り、水とチョコレートを見つけた。",
      },
      {
        type: "talk",
        text: "(あまりお腹の足しにはならないけど、ないよりはましかな。)",
      },
      {
        type: "system",
        text: "会計しようとレジに並んだが、通信障害でQR決済が使えず購入できなかった。",
      },
      {
        type: "talk",
        text: "そんな！",
      },
      {
        type: "talk",
        text: "(現金、持ち歩いていればよかったな...。)",
      },
      {
        type: "system",
        isDecrease: true,
        text: "精神を5%消費した。",
      },
      {
        type: "system",
        text: "仕方なく、店舗の外に出ると、壁面に矢印のグラフィティを発見した。道案内になっているようだ。",
      },
      {
        type: "talk",
        text: "(これはなんだろう。こっちに行けってこと？)",
      },
      {
        type: "talk",
        text: "(矢印の先に進めばなにかあるかもしれない。手がかりがつかめた！)",
      },
      {
        type: "system",
        isCritical: true,
        text: "精神が5%回復した。",
      },
    ],
  },
  {
    id: "event_walk_003",
    type: "walk",
    requiredDuration: 30,
    locationId: "fac_003", // ファミリーマート 渋谷公園通り店
    gaugeChange: { health: +5, mental: +15, battery: 0, money: +4000 },
    texts: [
      {
        type: "system",
        text: "ファミリーマート 渋谷公園通り店に到着した。\n 施設タイプ：飲食店・小売店",
      },
      {
        type: "system",
        isDecrease: true,
        text: "移動で体力を5%消費した。",
      },
      {
        type: "talk",
        text: "(コンビニがこんなに混んでるなんて。\n 改めて、今って非常事態なんだな。)",
      },
      {
        type: "system",
        text: "ATMの長蛇の列に並び、現金5000円を引き出した。",
      },
      {
        type: "system",
        isCritical: true,
        text: "現金が5000円増加した。",
      },
      {
        type: "talk",
        text: "(災害時って、現金を手に入れるだけでもこんなに大変なんだな。)",
      },
      {
        type: "system",
        text: "手に入れた現金で、品切れスレスレの水とパンを購入した。",
      },
      {
        type: "system",
        isDecrease: true,
        text: "現金を1000円消費した。",
      },
      {
        type: "talk",
        text: "(水と食料が手に入って一安心だ。食べよう！！)",
      },
      {
        type: "system",
        text: "食べ慣れた、安心できる味が口いっぱいに広がる。",
      },
      {
        type: "talk",
        text: "(.......おいしい。)",
      },
      {
        type: "system",
        isCritical: true,
        text: "体力が10%回復した。",
      },
      {
        type: "system",
        isCritical: true,
        text: "精神が10%回復した。",
      },
    ],
  },
  {
    id: "event_walk_004",
    type: "walk",
    requiredDuration: 30,
    locationId: "fac_004", // 代々木公園
    gaugeChange: { health: +5, mental: +10, battery: 0, money: 0 },
    texts: [
      {
        type: "system",
        text: "代々木公園に到着した。\n 施設タイプ：一時避難場所",
      },
      {
        type: "system",
        isDecrease: true,
        text: "移動で体力を5%消費した。",
      },
      {
        type: "system",
        text: "多くの人が避難してきている。",
      },
      {
        type: "talk",
        text: "(家族や友達との再会を喜ぶ人もいるみたいだ。)",
      },
      {
        type: "talk",
        text: "(LINEを送ってみたけど、まだ返信のない人もいる。家族は大丈夫かな...)",
      },
      {
        isPlayer: false,
        name: "見知らぬ大人",
        type: "talk",
        text: "あの、大丈夫ですか？",
      },
      {
        type: "talk",
        text: "え？",
      },
      {
        isPlayer: false,
        name: "見知らぬ大人",
        type: "talk",
        text: "あっあの急にすみません！おひとりで困っているように見えたので...",
      },
      {
        type: "system",
        text: "久しぶりの誰かとの会話。なんだか心が温まるような気がした。",
      },
      {
        type: "talk",
        text: "そうなんです。ひとりで、電車が動かなくて、家に帰れなくなってしまって...。",
      },
      {
        isPlayer: false,
        name: "見知らぬ大人",
        type: "talk",
        text: "やっぱりそうだ！急なことで不安ですよね。何か力になれればなと思って！\n良ければこれ見てください！",
      },
      {
        type: "system",
        text: "見知らぬ大人は地図のようなものを広げた。",
      },
      {
        isPlayer: false,
        name: "見知らぬ大人",
        type: "talk",
        text: "これ、帰宅困難者受け入れ施設のマップなんです。電車が動き始めるまではここで過ごせるかもしれません！",
      },
      {
        type: "talk",
        text: "へえ、そんな施設が...",
      },
      {
        isPlayer: false,
        name: "見知らぬ大人",
        type: "talk",
        text: "もう定員になっちゃってるところもあるみたいなんですけど、公園よりは安心して夜を明かせるかと思います！",
      },

      {
        type: "system",
        isCritical: true,
        text: "マップに「帰宅困難者受け入れ施設」が表示されるようになった。",
      },
      {
        type: "talk",
        text: "教えてくださってありがとうございます！少し休憩したら向かってみます！",
      },
      {
        isPlayer: false,
        name: "見知らぬ大人",
        type: "talk",
        text: "お互い気を付けて家に帰りましょうね！それでは！",
      },
      {
        type: "system",
        text: "親切な人のおかげで、とても有用な情報を得た。",
      },
      {
        type: "system",
        text: "また、トイレで顔を洗い、ベンチで座って休むことができた。",
      },
      {
        type: "system",
        isCritical: true,
        text: "体力が10%回復した。",
      },
      {
        type: "system",
        isCritical: true,
        text: "精神が10%回復した。",
      },
    ],
  },
];
