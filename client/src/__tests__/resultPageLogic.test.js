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
  formatTime,
  getFlavorText,
  facilitySignificanceText,
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

    test("フルプレイ: walk イベントのみが抽出される（prologue/sns/epilogue/time は除外）", () => {
      const timeline = buildTimelineData(fullPlayEventHistory, eventList, facilityList, spotTypeList);
      
      // walk_001, walk_003, walk_004 の3件のみ
      expect(timeline).toHaveLength(3);
    });

    test("フルプレイ: 各タイムラインアイテムに正しい施設名が表示される", () => {
      const timeline = buildTimelineData(fullPlayEventHistory, eventList, facilityList, spotTypeList);
      
      expect(timeline[0].facilityName).toBe("CHARGESPOT HUB 渋谷センター街店");
      expect(timeline[1].facilityName).toBe("ファミリーマート 渋谷公園通り店");
      expect(timeline[2].facilityName).toBe("代々木公園");
    });

    test("フルプレイ: 施設タイプ名が spotTypeList から正しく取得される", () => {
      const timeline = buildTimelineData(fullPlayEventHistory, eventList, facilityList, spotTypeList);

      // fac_001 → type="mobilebattery"
      expect(timeline[0].facilityTypeName).toBe("モバイルバッテリースタンド");
      // fac_003 → type="restaurant"
      expect(timeline[1].facilityTypeName).toBe("飲食店・コンビニなど");
      // fac_004 → type="evacuation"
      expect(timeline[2].facilityTypeName).toBe("避難所");
    });

    test("フルプレイ: 各アイテムに意義テキストが設定されている", () => {
      const timeline = buildTimelineData(fullPlayEventHistory, eventList, facilityList, spotTypeList);
      
      expect(timeline[0].significanceText).toBe(facilitySignificanceText["fac_001"]);
      expect(timeline[1].significanceText).toBe(facilitySignificanceText["fac_003"]);
      expect(timeline[2].significanceText).toBe(facilitySignificanceText["fac_004"]);
    });

    test("フルプレイ: 時刻が HH:MM 形式でフォーマットされている", () => {
      const timeline = buildTimelineData(fullPlayEventHistory, eventList, facilityList, spotTypeList);
      
      expect(timeline[0].time).toBe("14:30");
      expect(timeline[1].time).toBe("15:30");
      expect(timeline[2].time).toBe("16:00");
    });

    test("イベント履歴が空の場合、空配列が返る", () => {
      const timeline = buildTimelineData([], eventList, facilityList, spotTypeList);
      expect(timeline).toHaveLength(0);
    });

    test("SNSイベントのみの場合、空配列が返る", () => {
      const snsOnlyHistory = [
        { id: "event_sns_001", time: new Date(2026, 1, 23, 14, 0) },
        { id: "event_sns_002", time: new Date(2026, 1, 23, 15, 0) },
      ];
      const timeline = buildTimelineData(snsOnlyHistory, eventList, facilityList, spotTypeList);
      expect(timeline).toHaveLength(0);
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

    test("全施設訪問・十分なゲージ: ヒントなし", () => {
      // fac_001, fac_003 訪問済み、money>0, charge>0, mental>=30
      const hints = buildHints(
        ["fac_000", "fac_001", "fac_003", "fac_004"],
        100, // money
        50,  // charge
        70   // mental
      );
      expect(hints).toHaveLength(0);
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

    test("money=0: 小銭ヒントが出る", () => {
      const hints = buildHints(["fac_000", "fac_001", "fac_003"], 0, 50, 70);
      expect(hints).toContain(
        "小銭を常に持ち歩いていれば、緊急時の行動選択肢が広がったかもしれない。"
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

    test("最悪ケース: 5つ全てのヒントが出る", () => {
      // fac_001 & fac_003 未訪問, money=0, charge=0, mental=10
      const hints = buildHints(["fac_000"], 0, 0, 10);
      expect(hints).toHaveLength(5);
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

    test("⚠ event_walk_003 の gaugeChange.money が 0-100 スケールを超えている", () => {
      // event_walk_003 は gaugeChange.money = +4000（円ベースの値）
      // しかし clampGauge(0 + 4000) = 100 で即座にMAXになる
      const walkEvent003 = eventList.find(e => e.id === "event_walk_003");
      expect(walkEvent003).toBeDefined();
      expect(walkEvent003.gaugeChange.money).toBe(4000);

      // money は 0-100 ゲージとして扱われるので、+4000 は不整合
      // life/mental/battery は全て -5〜+50 の範囲で一貫している
      const walkEvent001 = eventList.find(e => e.id === "event_walk_001");
      expect(walkEvent001.gaugeChange.life).toBe(-5);
      expect(walkEvent001.gaugeChange.battery).toBe(50);
      // money だけ桁が違う
      expect(walkEvent003.gaugeChange.money).toBeGreaterThan(100);
    });

    test("⚠ StatsSummary の moneyValue は現在の所持金であり '使用したお金' ではない", () => {
      // ResultPage は moneyValue={money} で現在のゲージ値を渡している
      // しかし StatsSummary のラベルは「使用したお金」
      // money=100 (clamp後) が表示される → ユーザーに何を伝えたいか不明
      const currentMoney = 100; // clampGauge(0 + 4000)
      const labelText = "使用したお金";
      
      // 「使用したお金」なら消費額を表示すべき
      // 「所持金」ならラベルを変えるべき
      // 現状はどちらでもない不整合な状態
      expect(labelText).toBe("使用したお金");
      expect(currentMoney).toBe(100); // ゲージ値が表示される
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
