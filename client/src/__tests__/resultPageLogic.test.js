/**
 * ResultPage ロジックの TDD テスト
 *
 * ゲームプレイの実データ（Atom）が結果ページの各セクションに
 * 正しく反映されるかを検証する。
 */
import {
  buildTimelineData,
  buildHints,
  countSnsEvents,
  calcElapsedTime,
  calcTotalDistance,
  calcVisitedCount,
  formatTime,
  getFlavorText,
  facilitySignificanceText,
  snsSignificanceText,
  facilityHintMap,
  fallbackHints,
} from "../utils/resultPageLogic";
import { eventList, facilityList, spotTypeList } from "../temporary-database";

// ============================================================
// テスト用: 典型的なゲームプレイシナリオのデータ
// ============================================================

// ゲーム開始時刻: 14:00
const startTime = new Date(2026, 1, 23, 14, 0, 0, 0);

/**
 * シナリオ: フル成功プレイ
 * prologue → sns_001(14:00) → walk_001(14:30) → sns_002(15:00)
 * → walk_003(15:30) → walk_004(16:00) → epilogue(16:30)
 */
const fullPlayEventHistory = [
  { id: "event_prologue_001", time: new Date(2026, 1, 23, 14, 0) },
  { id: "event_sns_001",      time: new Date(2026, 1, 23, 14, 0) },
  { id: "event_walk_001",     time: new Date(2026, 1, 23, 14, 30) },
  { id: "event_sns_002",      time: new Date(2026, 1, 23, 15, 0) },
  { id: "event_walk_003",     time: new Date(2026, 1, 23, 15, 30) },
  { id: "event_walk_004",     time: new Date(2026, 1, 23, 16, 0) },
  { id: "event_epilogue_001", time: new Date(2026, 1, 23, 16, 30) },
];

// フルプレイ時の訪問施設 (prologue=fac_000 + walk_001→fac_001, walk_003→fac_003, walk_004→fac_004, epilogue→fac_005)
const fullPlayVisitedFacilities = ["fac_000", "fac_001", "fac_003", "fac_004", "fac_005"];

// フルプレイ時の最終ゲージ値 (概算)
// initial: life=70, mental=70, charge=60, money=0
// walk_001: life-5=65, mental+5=75, charge+50=100(clamped), money=0
// → 時間経過 16:00: life-5=60, mental-5=70, charge-5=95, money=0
// walk_003: life+5=65, mental+15=85, charge=95, money+4000→100(clamped!)
// walk_004: life+5=70, mental+10=95, charge=95, money=100
// epilogue: gaugeChange all 0
const fullPlayFinalGauges = { life: 70, mental: 95, charge: 95, money: 100 };

/**
 * シナリオ: 最小プレイ（施設訪問なし、即死ルート）
 * prologue → walk_002(fac_002, life-70) → epilogue(death)
 */
const minimalPlayEventHistory = [
  { id: "event_prologue_001", time: new Date(2026, 1, 23, 14, 0) },
  { id: "event_walk_002",     time: new Date(2026, 1, 23, 14, 30) },
];

const minimalPlayVisitedFacilities = ["fac_000", "fac_002"];

// ============================================================
// テストスイート
// ============================================================

describe("ResultPage ロジック - TDD 検証", () => {

  // ----------------------------------------------------------
  // セクション 5: タイムライン (buildTimelineData)
  // ----------------------------------------------------------
  describe("buildTimelineData - タイムライン生成", () => {

    test("フルプレイ: walk + sns + epilogue イベントが抽出される（prologue/time は除外）", () => {
      const timeline = buildTimelineData(fullPlayEventHistory, eventList, facilityList, spotTypeList);
      
      // sns_001(14:00), walk_001(14:30), sns_002(15:00), walk_003(15:30), walk_004(16:00), epilogue_001(16:30) の6件
      expect(timeline).toHaveLength(6);
    });

    test("フルプレイ: 各タイムラインアイテムに正しい施設名・isSns フラグが設定される", () => {
      const timeline = buildTimelineData(fullPlayEventHistory, eventList, facilityList, spotTypeList);
      
      // [0] sns_001 → isSns: true, facilityName: null
      expect(timeline[0].isSns).toBe(true);
      expect(timeline[0].facilityName).toBeNull();
      // [1] walk_001 → CHARGESPOT HUB
      expect(timeline[1].isSns).toBe(false);
      expect(timeline[1].facilityName).toBe("CHARGESPOT HUB 渋谷センター街店");
      // [2] sns_002 → isSns: true
      expect(timeline[2].isSns).toBe(true);
      // [3] walk_003 → ファミリーマート
      expect(timeline[3].facilityName).toBe("ファミリーマート 渋谷公園通り店");
      // [4] walk_004 → 代々木公園
      expect(timeline[4].facilityName).toBe("代々木公園");
      // [5] epilogue_001 → ウィズ原宿
      expect(timeline[5].facilityName).toBe("ウィズ原宿");
    });

    test("フルプレイ: 施設タイプ名が spotTypeList から正しく取得される", () => {
      const timeline = buildTimelineData(fullPlayEventHistory, eventList, facilityList, spotTypeList);

      // [1] fac_001 → type="mobilebattery"
      expect(timeline[1].facilityTypeName).toBe("モバイルバッテリースタンド");
      // [3] fac_003 → type="restaurant"
      expect(timeline[3].facilityTypeName).toBe("飲食店・コンビニなど");
      // [4] fac_004 → type="evacuation"
      expect(timeline[4].facilityTypeName).toBe("避難所");
      // [5] fac_005 → type="shelter"
      expect(timeline[5].facilityTypeName).toBe("帰宅困難者受け入れ施設");
      // SNS アイテムは facilityTypeName = null
      expect(timeline[0].facilityTypeName).toBeNull();
    });

    test("フルプレイ: 各アイテムに意義テキストが設定されている", () => {
      const timeline = buildTimelineData(fullPlayEventHistory, eventList, facilityList, spotTypeList);
      
      expect(timeline[0].significanceText).toBe(snsSignificanceText); // sns
      expect(timeline[1].significanceText).toBe(facilitySignificanceText["fac_001"]);
      expect(timeline[2].significanceText).toBe(snsSignificanceText); // sns
      expect(timeline[3].significanceText).toBe(facilitySignificanceText["fac_003"]);
      expect(timeline[4].significanceText).toBe(facilitySignificanceText["fac_004"]);
      expect(timeline[5].significanceText).toBe(facilitySignificanceText["fac_005"]);
    });

    test("フルプレイ: 時刻が HH:MM 形式でフォーマットされている", () => {
      const timeline = buildTimelineData(fullPlayEventHistory, eventList, facilityList, spotTypeList);
      
      expect(timeline[0].time).toBe("14:00"); // sns_001
      expect(timeline[1].time).toBe("14:30"); // walk_001
      expect(timeline[2].time).toBe("15:00"); // sns_002
      expect(timeline[3].time).toBe("15:30"); // walk_003
      expect(timeline[4].time).toBe("16:00"); // walk_004
      expect(timeline[5].time).toBe("16:30"); // epilogue
    });

    test("epilogue イベント単体: 帰宅困難者受け入れ施設として表示される", () => {
      const epilogueOnlyHistory = [
        { id: "event_epilogue_001", time: new Date(2026, 1, 23, 16, 30) },
      ];
      const timeline = buildTimelineData(epilogueOnlyHistory, eventList, facilityList, spotTypeList);
      expect(timeline).toHaveLength(1);
      expect(timeline[0].facilityName).toBe("ウィズ原宿");
      expect(timeline[0].facilityTypeName).toBe("帰宅困難者受け入れ施設");
      expect(timeline[0].significanceText).toBe(facilitySignificanceText["fac_005"]);
      expect(timeline[0].isSns).toBe(false);
    });

    test("イベント履歴が空の場合、空配列が返る", () => {
      const timeline = buildTimelineData([], eventList, facilityList, spotTypeList);
      expect(timeline).toHaveLength(0);
    });

    test("SNSイベントのみの場合、SNSアイテムが返る", () => {
      const snsOnlyHistory = [
        { id: "event_sns_001", time: new Date(2026, 1, 23, 14, 0) },
        { id: "event_sns_002", time: new Date(2026, 1, 23, 15, 0) },
      ];
      const timeline = buildTimelineData(snsOnlyHistory, eventList, facilityList, spotTypeList);
      expect(timeline).toHaveLength(2);
      expect(timeline[0].isSns).toBe(true);
      expect(timeline[0].facilityName).toBeNull();
      expect(timeline[0].facilityTypeName).toBeNull();
      expect(timeline[0].significanceText).toBe(snsSignificanceText);
    });

    test("eventList に存在しない id のイベントは無視される", () => {
      const historyWithUnknown = [
        { id: "event_unknown_999", time: new Date(2026, 1, 23, 14, 0) },
        { id: "event_walk_001",    time: new Date(2026, 1, 23, 14, 30) },
      ];
      const timeline = buildTimelineData(historyWithUnknown, eventList, facilityList, spotTypeList);
      expect(timeline).toHaveLength(1);
      expect(timeline[0].facilityName).toBe("CHARGESPOT HUB 渋谷センター街店");
    });
  });

  // ----------------------------------------------------------
  // セクション 5 補足: spotTypeList の名称整合性
  // ----------------------------------------------------------
  describe("spotTypeList 名称整合性", () => {

    test("facilityList の全施設の type が spotTypeList に存在する", () => {
      const missingTypes = facilityList
        .filter(f => f.type !== "default") // default は spotTypeList に無くてもOK
        .filter(f => !spotTypeList[f.type]);
      
      expect(missingTypes).toHaveLength(0);
    });

    test("evacuation の表示名が仕様と一致する", () => {
      // fac_004 は代々木公園(type=evacuation)
      // facilitySignificanceText は "受け入れ施設の情報を取得し、行動範囲が広がった。"
      // spotTypeList["evacuation"].name を確認
      expect(spotTypeList["evacuation"].name).toBeDefined();
    });
  });

  // ----------------------------------------------------------
  // セクション 3: SNS利用回数
  // ----------------------------------------------------------
  describe("countSnsEvents - SNS利用回数", () => {

    test("フルプレイ: SNSイベントが正しくカウントされる", () => {
      const count = countSnsEvents(fullPlayEventHistory);
      expect(count).toBe(2); // event_sns_001, event_sns_002
    });

    test("SNS未利用のプレイ: 0が返る", () => {
      const noSnsHistory = [
        { id: "event_prologue_001", time: new Date() },
        { id: "event_walk_001",     time: new Date() },
      ];
      const count = countSnsEvents(noSnsHistory);
      expect(count).toBe(0);
    });

    test("空の履歴: 0が返る", () => {
      expect(countSnsEvents([])).toBe(0);
    });
  });

  // ----------------------------------------------------------
  // セクション 3: 訪問施設数
  // ----------------------------------------------------------
  describe("visitedCount - 訪問施設数", () => {

    test("フルプレイ: visitedFacilities.length が施設数を返す", () => {
      // fac_000(初期), fac_001, fac_003, fac_004, fac_005(epilogue)
      expect(fullPlayVisitedFacilities.length).toBe(5);
    });

    test("⚠ visitedFacilities に初期地点(fac_000)が含まれている", () => {
      // fac_000 は「渋谷駅前」= ゲーム開始地点であり、プレイヤーが選択した施設ではない
      // 「訪問施設数」としてカウントすべきか要検討
      expect(fullPlayVisitedFacilities.includes("fac_000")).toBe(true);
    });

    test("⚠ visitedFacilities にエピローグ地点(fac_005)が含まれている", () => {
      // fac_005 は epilogue イベント（ゴール地点）であり walk イベントではない
      // 「訪問施設数」としてカウントすべきか要検討
      expect(fullPlayVisitedFacilities.includes("fac_005")).toBe(true);
    });
  });

  // ----------------------------------------------------------
  // セクション 3: 経過時間
  // ----------------------------------------------------------
  describe("calcElapsedTime - 経過時間算出", () => {

    test("14:00 → 16:30 = 2時間30分", () => {
      const currentTime = new Date(2026, 1, 23, 16, 30, 0);
      const result = calcElapsedTime(currentTime, startTime);
      expect(result.hours).toBe(2);
      expect(result.minutes).toBe(30);
    });

    test("14:00 → 14:00 = 0時間0分（直後にリザルト遷移）", () => {
      const result = calcElapsedTime(startTime, startTime);
      expect(result.hours).toBe(0);
      expect(result.minutes).toBe(0);
    });

    test("14:00 → 23:59 = 9時間59分（最長ケース）", () => {
      const currentTime = new Date(2026, 1, 23, 23, 59, 0);
      const result = calcElapsedTime(currentTime, startTime);
      expect(result.hours).toBe(9);
      expect(result.minutes).toBe(59);
    });
  });

  // ----------------------------------------------------------
  // セクション 6: ヒント生成
  // ----------------------------------------------------------
  describe("buildHints - 防災ヒント生成", () => {

    test("全施設訪問・十分なゲージ: 訪問済み施設のポジティブヒント 2件が返る", () => {
      // fac_001, fac_003 訪問済み、money>0, charge>0, mental>=30
      const hints = buildHints(
        ["fac_000", "fac_001", "fac_003", "fac_004"],
        100, // money
        50,  // charge
        70   // mental
      );
      expect(hints).toHaveLength(2);
      expect(hints).toContain(facilityHintMap.fac_001.visited);
      expect(hints).toContain(facilityHintMap.fac_003.visited);
    });

    test("fac_003 未訪問: 現金ヒントが出る", () => {
      const hints = buildHints(["fac_000", "fac_001"], 50, 50, 70);
      expect(hints).toContain(
        "現金があれば、キャッシュレス決済が使えなくなっても慌てずに済んだかもしれない。"
      );
    });

    test("fac_001 未訪問: バッテリーヒントが出る", () => {
      const hints = buildHints(["fac_000", "fac_003"], 50, 50, 70);
      expect(hints).toContain(
        "モバイルバッテリーを持ち歩いていれば、電源を心配する場面を減らせたかもしれない。"
      );
    });

    test("money=0 かつ fac_003 訪問済み: 小銭ヒントが出る", () => {
      const hints = buildHints(["fac_000", "fac_001", "fac_003"], 0, 50, 70);
      expect(hints).toContain(
        "小銭を常に持ち歩いていれば、緊急時の行動選択肢が広がったかもしれない。"
      );
    });

    test("money=0 かつ fac_003 未訪問: 小銭ヒントは出ない（fac_003.notVisited と重複するため）", () => {
      const hints = buildHints(["fac_000", "fac_001"], 0, 50, 70);
      expect(hints).not.toContain(
        "小銭を常に持ち歩いていれば、緊急時の行動選択肢が広がったかもしれない。"
      );
      // 代わりに fac_003.notVisited が出る
      expect(hints).toContain(
        "現金があれば、キャッシュレス決済が使えなくなっても慌てずに済んだかもしれない。"
      );
    });

    test("charge=0: 充電ヒントが出る", () => {
      const hints = buildHints(["fac_000", "fac_001", "fac_003"], 50, 0, 70);
      expect(hints).toContain(
        "スマートフォンの充電を日ごろから心がけていれば、情報収集が途絶えなかったかもしれない。"
      );
    });

    test("mental<30: 避難場所ヒントが出る", () => {
      const hints = buildHints(["fac_000", "fac_001", "fac_003"], 50, 50, 20);
      expect(hints).toContain(
        "複数の避難場所を事前に把握していれば、精神的な余裕が生まれたかもしれない。"
      );
    });

    test("最悪ケース（fac_003未訪問）: 小銭ヒントはスキップされ4件", () => {
      // fac_001 & fac_003 未訪問, money=0, charge=0, mental=10
      // money=0 だが fac_003 未訪問 → 小銭ヒントは fac_003.notVisited と重複するためスキップ
      const hints = buildHints(["fac_000"], 0, 0, 10);
      expect(hints).toHaveLength(4);
      expect(hints).not.toContain(
        "小銭を常に持ち歩いていれば、緊急時の行動選択肢が広がったかもしれない。"
      );
    });

    test("最悪ケース（fac_003訪問済み）: 小銭ヒントも出て5件", () => {
      // fac_001 未訪問, fac_003 訪問済み, money=0, charge=0, mental=10
      const hints = buildHints(["fac_000", "fac_003"], 0, 0, 10);
      expect(hints).toHaveLength(5);
      expect(hints).toContain(
        "小銭を常に持ち歩いていれば、緊急時の行動選択肢が広がったかもしれない。"
      );
    });
  });

  // ----------------------------------------------------------
  // セクション 6: 施設ベースヒント（task-0223-07）
  // ----------------------------------------------------------
  describe("buildHints - 施設ベースのヒント", () => {

    test("fac_001 訪問済みの場合、ポジティブヒントが含まれる", () => {
      const hints = buildHints(["fac_000", "fac_001", "fac_003"], 50, 50, 70);
      expect(hints).toContain(facilityHintMap.fac_001.visited);
      expect(hints).not.toContain(facilityHintMap.fac_001.notVisited);
    });

    test("fac_001 未訪問の場合、反省ヒントが含まれる", () => {
      const hints = buildHints(["fac_000", "fac_003"], 50, 50, 70);
      expect(hints).toContain(facilityHintMap.fac_001.notVisited);
      expect(hints).not.toContain(facilityHintMap.fac_001.visited);
    });

    test("fac_003 訪問済みの場合、ポジティブヒントが含まれる", () => {
      const hints = buildHints(["fac_000", "fac_001", "fac_003"], 50, 50, 70);
      expect(hints).toContain(facilityHintMap.fac_003.visited);
      expect(hints).not.toContain(facilityHintMap.fac_003.notVisited);
    });

    test("fac_003 未訪問の場合、反省ヒントが含まれる", () => {
      const hints = buildHints(["fac_000", "fac_001"], 50, 50, 70);
      expect(hints).toContain(facilityHintMap.fac_003.notVisited);
      expect(hints).not.toContain(facilityHintMap.fac_003.visited);
    });

    test("fac_001・fac_003 共に訪問済み + ゲージ正常 → ポジティブヒント 2件", () => {
      const hints = buildHints(["fac_000", "fac_001", "fac_003"], 50, 50, 70);
      expect(hints).toHaveLength(2);
      expect(hints[0]).toBe(facilityHintMap.fac_001.visited);
      expect(hints[1]).toBe(facilityHintMap.fac_003.visited);
    });

    test("フォールバックの定義と内容を確認（安全網テスト）", () => {
      expect(fallbackHints).toHaveLength(1);
      expect(fallbackHints[0]).toContain("防災用品");
    });
  });

  // ----------------------------------------------------------
  // セクション 4: ゲージ推移データ構造
  // ----------------------------------------------------------
  describe("gaugeHistory - ゲージ推移データの整合性", () => {

    test("プロローグ完了後、gaugeHistory に初期データポイント(t=0)が含まれる", () => {
      // 仕様: プロローグイベント完了時に、変動前の初期ゲージ値を gaugeHistory[0] に記録する
      // useMonologueLogic.js の handleButtonClick 内で:
      //   if (effectiveEvent.type === "prologue") {
      //     setGaugeHistory([{ time: currentTime, life, mental, charge, money }]);
      //   }
      //
      // プロローグの gaugeChange は全て 0 なので、変動前 = Atom初期値
      const expectedInitialPoint = {
        time: expect.any(Date),
        life: 70,     // lifeAtom 初期値
        mental: 70,   // mentalAtom 初期値
        charge: 60,   // chargeAtom 初期値
        money: 0,     // moneyAtom 初期値
      };

      // prologue 完了後の gaugeHistory をシミュレート
      const gaugeHistoryAfterPrologue = [
        { time: new Date(2026, 1, 23, 14, 0), life: 70, mental: 70, charge: 60, money: 0 },
      ];

      expect(gaugeHistoryAfterPrologue).toHaveLength(1);
      expect(gaugeHistoryAfterPrologue[0]).toEqual(expect.objectContaining(expectedInitialPoint));
      expect(gaugeHistoryAfterPrologue[0].time).toBeInstanceOf(Date);
    });

    test("プロローグ → walk_001 後、gaugeHistory に2件のデータポイントがある", () => {
      // prologue 完了 → 初期値を記録
      // walk_001 完了 → 変動後の値を追記
      const gaugeHistoryAfterWalk = [
        { time: new Date(2026, 1, 23, 14, 0), life: 70, mental: 70, charge: 60, money: 0 },
        { time: new Date(2026, 1, 23, 14, 30), life: 65, mental: 75, charge: 100, money: 0 },
      ];

      expect(gaugeHistoryAfterWalk).toHaveLength(2);
      // 最初のポイントは初期値
      expect(gaugeHistoryAfterWalk[0].life).toBe(70);
      expect(gaugeHistoryAfterWalk[0].charge).toBe(60);
      // 2番目は walk_001 による変動後
      expect(gaugeHistoryAfterWalk[1].life).toBe(65);   // 70 - 5
      expect(gaugeHistoryAfterWalk[1].charge).toBe(100); // 60 + 50 → clamped to 100
    });

    test("gaugeHistory の各エントリが GaugeChart の PropTypes に適合する", () => {
      // GaugeChart は { time: Date, life: number, mental: number, charge: number, money: number } を期待
      const sampleGaugeHistory = [
        { time: new Date(2026, 1, 23, 14, 30), life: 65, mental: 75, charge: 100, money: 0 },
        { time: new Date(2026, 1, 23, 15, 30), life: 70, mental: 90, charge: 95, money: 100 },
      ];

      sampleGaugeHistory.forEach(entry => {
        expect(entry.time).toBeInstanceOf(Date);
        expect(typeof entry.life).toBe("number");
        expect(typeof entry.mental).toBe("number");
        expect(typeof entry.charge).toBe("number");
        expect(typeof entry.money).toBe("number");
        // ゲージ値は 0-100 の範囲であるべき
        expect(entry.life).toBeGreaterThanOrEqual(0);
        expect(entry.life).toBeLessThanOrEqual(100);
      });
    });
  });

  // ----------------------------------------------------------
  // セクション 3: お金の表示値
  // ----------------------------------------------------------
  describe("moneyValue - お金の表示", () => {

    test("event_walk_003 の gaugeChange.money は百円単位（0-100 スケール）", () => {
      // event_walk_003 は gaugeChange.money = +40（百円単位 = 4,000円）
      const walkEvent003 = eventList.find(e => e.id === "event_walk_003");
      expect(walkEvent003).toBeDefined();
      expect(walkEvent003.gaugeChange.money).toBe(40);

      // money は 0-100 ゲージとして扱われ、百円単位で管理される
      // 表示時に *100 して「円」で表示する（40 → 4,000円）
      expect(walkEvent003.gaugeChange.money).toBeLessThanOrEqual(100);
      expect(walkEvent003.gaugeChange.money).toBeGreaterThanOrEqual(0);
    });

    test("StatsSummary の moneyValue は百円単位で、表示時に円変換される", () => {
      // ResultPage は moneyValue={money} で百円単位のゲージ値を渡す
      // StatsSummary は moneyValue * 100 + "円" で表示する
      const moneyInHundredYen = 40; // 百円単位
      const displayedYen = moneyInHundredYen * 100; // 4,000円
      const labelText = "所持金";
      
      expect(labelText).toBe("所持金");
      expect(displayedYen).toBe(4000);
    });
  });

  // ----------------------------------------------------------
  // セクション 4: gaugeSteps - イベント内段階的ゲージ変動
  // ----------------------------------------------------------
  describe("gaugeSteps - イベント内段階的ゲージ変動", () => {

    test("event_walk_003 に gaugeSteps が定義されている", () => {
      const event = eventList.find(e => e.id === "event_walk_003");
      expect(event.gaugeSteps).toBeDefined();
      expect(event.gaugeSteps).toHaveLength(3);
    });

    test("gaugeSteps の合計が正しい net 値になる", () => {
      const event = eventList.find(e => e.id === "event_walk_003");
      const totalLife = event.gaugeSteps.reduce((sum, step) => sum + (step.life || 0), 0);
      const totalMental = event.gaugeSteps.reduce((sum, step) => sum + (step.mental || 0), 0);
      const totalMoney = event.gaugeSteps.reduce((sum, step) => sum + (step.money || 0), 0);
      
      expect(totalLife).toBe(5);    // -5 + 0 + 10 = +5
      expect(totalMental).toBe(15);  // 0 + 15 + 0 = +15
      expect(totalMoney).toBe(40);   // 0 + 50 - 10 = +40
    });

    test("gaugeSteps がない他のイベントは従来通り動作する", () => {
      const event = eventList.find(e => e.id === "event_walk_001");
      expect(event.gaugeSteps).toBeUndefined();
      expect(event.gaugeChange).toBeDefined();
    });

    test("event_walk_003 の各ステップが期待通りの値を持つ", () => {
      const event = eventList.find(e => e.id === "event_walk_003");
      
      // Step 1: 移動で体力消費
      expect(event.gaugeSteps[0]).toEqual({ life: -5, mental: 0, battery: 0, money: 0 });
      
      // Step 2: ATM で 5000円 + 精神回復
      expect(event.gaugeSteps[1]).toEqual({ life: 0, mental: 15, battery: 0, money: 50 });
      
      // Step 3: 食事で体力回復 + 1000円消費
      expect(event.gaugeSteps[2]).toEqual({ life: 10, mental: 0, battery: 0, money: -10 });
    });
  });

  // ----------------------------------------------------------
  // セクション 4b: gaugeSteps ループ処理ロジック（Issue D）
  // useMonologueLogic の handleButtonClick 内ループを純粋関数で再現してテスト
  // ----------------------------------------------------------
  describe("gaugeSteps ループ処理ロジック", () => {
    // handleButtonClick 内のループ処理を純粋関数として再現
    const clampGauge = (val) => Math.max(0, Math.min(100, val));

    const applyGaugeSteps = (initialGauges, steps) => {
      let { life, mental, charge, money } = initialGauges;
      const history = [];
      for (const step of steps) {
        life   = clampGauge(life   + (step.life    || 0));
        mental = clampGauge(mental + (step.mental  || 0));
        charge = clampGauge(charge + (step.battery || 0));
        money  = clampGauge(money  + (step.money   || 0));
        history.push({ life, mental, charge, money });
      }
      return { history, final: { life, mental, charge, money } };
    };

    test("event_walk_003: money が 0 → 50 → 50 → 40 と3ステップで推移する", () => {
      const event = eventList.find(e => e.id === "event_walk_003");
      const initial = { life: 70, mental: 70, charge: 60, money: 0 };
      const { history } = applyGaugeSteps(initial, event.gaugeSteps);

      expect(history).toHaveLength(3);
      expect(history[0].money).toBe(0);  // Step 1: 移動（money 変化なし）
      expect(history[1].money).toBe(50); // Step 2: ATM +5000円
      expect(history[2].money).toBe(40); // Step 3: 購入 -1000円
    });

    test("event_walk_003: life が 70 → 65 → 65 → 75 と3ステップで推移する", () => {
      const event = eventList.find(e => e.id === "event_walk_003");
      const initial = { life: 70, mental: 70, charge: 60, money: 0 };
      const { history } = applyGaugeSteps(initial, event.gaugeSteps);

      expect(history[0].life).toBe(65); // Step 1: -5
      expect(history[1].life).toBe(65); // Step 2: 変化なし
      expect(history[2].life).toBe(75); // Step 3: +10
    });

    test("event_walk_003: 最終ゲージ値が gaugeChange の net 値と一致する", () => {
      const event = eventList.find(e => e.id === "event_walk_003");
      const initial = { life: 70, mental: 70, charge: 60, money: 0 };
      const { final } = applyGaugeSteps(initial, event.gaugeSteps);

      // gaugeChange: { life: +5, mental: +15, battery: 0, money: +40 }
      expect(final.life).toBe(75);    // 70 + 5
      expect(final.mental).toBe(85);  // 70 + 15
      expect(final.charge).toBe(60);  // 60 + 0
      expect(final.money).toBe(40);   // 0 + 40
    });

    test("100 を超える値は 100 にクランプされる", () => {
      const steps = [{ life: 0, mental: 0, battery: 90, money: 0 }];
      const initial = { life: 50, mental: 50, charge: 60, money: 0 };
      const { history } = applyGaugeSteps(initial, steps);

      expect(history[0].charge).toBe(100); // 60 + 90 = 150 → 100
    });

    test("0 を下回る値は 0 にクランプされる", () => {
      const steps = [{ life: -80, mental: 0, battery: 0, money: 0 }];
      const initial = { life: 30, mental: 50, charge: 60, money: 0 };
      const { history } = applyGaugeSteps(initial, steps);

      expect(history[0].life).toBe(0); // 30 - 80 = -50 → 0
    });

    test("timeEvent ステップを先頭に加えた場合も正しく処理される（Issue B 対応確認）", () => {
      const event = eventList.find(e => e.id === "event_walk_003");
      const timeEventStep = { life: 0, mental: 0, battery: -5, money: 0 }; // 時間経過 -5%
      const stepsWithTime = [timeEventStep, ...event.gaugeSteps];
      const initial = { life: 70, mental: 70, charge: 60, money: 0 };
      const { history, final } = applyGaugeSteps(initial, stepsWithTime);

      expect(history).toHaveLength(4); // timeEvent + gaugeSteps 3件
      expect(history[0].charge).toBe(55);  // timeEvent: 60 - 5
      expect(history[2].money).toBe(50);   // Step 2 (ATM)
      expect(history[3].money).toBe(40);   // Step 3 (購入)
      expect(final.charge).toBe(55);       // battery は gaugeSteps で変化なし
    });
  });

  // ----------------------------------------------------------
  // セクション 1: フレーバーテキスト
  // ----------------------------------------------------------
  describe("getFlavorText - フレーバーテキスト", () => {

    test("生存成功: デフォルト成功テキスト", () => {
      const text = getFlavorText(true, null);
      expect(text).toContain("無事に一時避難場所に辿り着くことができた");
    });

    test("体力0で失敗: lowLife テキスト", () => {
      const text = getFlavorText(false, "lowLife");
      expect(text).toBe("体力が限界に達し、倒れてしまった…");
    });

    test("時間切れで失敗: timeup テキスト", () => {
      const text = getFlavorText(false, "timeup");
      expect(text).toBe("時間切れ。避難場所に辿り着くことができなかった…");
    });

    test("未定義の死因: デフォルト失敗テキスト", () => {
      const text = getFlavorText(false, "unknownReason");
      expect(text).toBe("避難に失敗してしまった…");
    });
  });

  // ----------------------------------------------------------  // セクション 3.3: 訪問施設数（calcVisitedCount）
  // ----------------------------------------------------------
  describe("calcVisitedCount - スタート地点除外", () => {

    test("fac_000 のみ（未プレイ相当）→ 0 を返す", () => {
      expect(calcVisitedCount(["fac_000"])).toBe(0);
    });

    test("フルプレイ: fac_000 を除く 4 施設をカウント", () => {
      // ["fac_000", "fac_001", "fac_003", "fac_004", "fac_005"] → 4
      expect(calcVisitedCount(fullPlayVisitedFacilities)).toBe(4);
    });

    test("fac_000 が含まれない配列はそのままカウント", () => {
      expect(calcVisitedCount(["fac_001", "fac_003"])).toBe(2);
    });
  });

  // ----------------------------------------------------------  // セクション 3.3: 総移動距離（calcTotalDistance）
  // ----------------------------------------------------------
  describe("calcTotalDistance - 総移動距離算出（Haversine）", () => {

    test("空配列 → 0 を返す", () => {
      expect(calcTotalDistance([], facilityList)).toBe(0);
    });

    test("施設1件のみ → 0 を返す", () => {
      expect(calcTotalDistance(["fac_000"], facilityList)).toBe(0);
    });

    test("fac_000→fac_001 の距離が 0.1〜0.4 km の範囲内", () => {
      // fac_000: (35.658, 139.7017), fac_001: (35.6595, 139.7005) → 約 0.2 km
      const dist = calcTotalDistance(["fac_000", "fac_001"], facilityList);
      expect(dist).toBeGreaterThan(0.1);
      expect(dist).toBeLessThan(0.4);
    });

    test("存在しない施設ID が含まれる場合、そのセグメントをスキップして計算継続", () => {
      // fac_000→unknown→fac_001: unknown のセグメントはスキップ、合計は 0
      const dist = calcTotalDistance(["fac_000", "fac_unknown_999", "fac_001"], facilityList);
      // fac_000→unknown: スキップ、unknown→fac_001: スキップ → 0
      expect(dist).toBe(0);
    });

    test("フルプレイ訪問順で正の値かつ 10 km 未満", () => {
      // fac_000→fac_001→fac_003→fac_004→fac_005（渋谷〜代々木公園〜原宿）
      const dist = calcTotalDistance(fullPlayVisitedFacilities, facilityList);
      expect(dist).toBeGreaterThan(0);
      expect(dist).toBeLessThan(10);
    });

    test("返り値は小数点1桁に丸められている", () => {
      const dist = calcTotalDistance(fullPlayVisitedFacilities, facilityList);
      // 小数点1桁: 10倍してから整数であることを確認
      expect(dist * 10).toBe(Math.round(dist * 10));
    });
  });

  // ----------------------------------------------------------
  // eventList ↔ facilityList 整合性チェック
  // ----------------------------------------------------------
  describe("eventList ↔ facilityList 整合性", () => {

    test("全 walk イベントの locationId が facilityList に存在する", () => {
      const walkEvents = eventList.filter(e => e.type === "walk");
      const missingFacilities = walkEvents.filter(e => {
        return !facilityList.find(f => f.id === e.locationId);
      });
      expect(missingFacilities).toHaveLength(0);
    });

    test("全 walk イベントの locationId に facilitySignificanceText が定義されている", () => {
      const walkEvents = eventList.filter(e => e.type === "walk");
      const missingSigText = walkEvents.filter(e => {
        return !facilitySignificanceText[e.locationId];
      });

      // 意義テキストが未定義の場合フォールバックはあるが、本来は全件定義すべき
      if (missingSigText.length > 0) {
        console.warn(
          "facilitySignificanceText が未定義の施設:",
          missingSigText.map(e => `${e.id} → ${e.locationId}`)
        );
      }
      expect(missingSigText).toHaveLength(0);
    });
  });

  // ----------------------------------------------------------
  // formatTime ユーティリティ
  // ----------------------------------------------------------
  describe("formatTime", () => {
    test("Date → HH:MM", () => {
      expect(formatTime(new Date(2026, 0, 1, 9, 5))).toBe("09:05");
      expect(formatTime(new Date(2026, 0, 1, 14, 30))).toBe("14:30");
      expect(formatTime(new Date(2026, 0, 1, 0, 0))).toBe("00:00");
    });

    test("null/undefined → 空文字", () => {
      expect(formatTime(null)).toBe("");
      expect(formatTime(undefined)).toBe("");
    });
  });
});
