/**
 * ResultPage の純粋ロジック関数
 * コンポーネントから抽出してテスト可能にしたもの
 */

// 施設ごとの生存上の意義テキスト定義
export const facilitySignificanceText = {
  fac_001: "電源を確保。精神を回復し、後のSNS利用やマップ閲覧が可能に。",
  fac_002: "壁の矢印が示す避難方向を確認。土地勘がなくても正しい方角を把握できた。",
  fac_003: "水や食料を調達。体力と気力を回復し、次の行動に備えた。",
  fac_004: "受け入れ施設の情報を取得し、行動範囲が広がった。",
  fac_005: "施設が満員になる寸前に滑り込み、夜の安全を確保。",
};

// criticalReason → フレーバーテキスト対応表
const flavorTextMap = {
  lowLife: "体力が限界に達し、倒れてしまった…",
  timeup: "時間切れ。避難場所に辿り着くことができなかった…",
};
const defaultSuccessText =
  "ギリギリの判断を重ね、無事に一時避難場所に辿り着くことができた。電源確保・現金取得・人とのつながり、どれもが生存に直結する選択だった。";
const defaultFailureText = "避難に失敗してしまった…";

export const getFlavorText = (survived, criticalReason) => {
  if (survived) return defaultSuccessText;
  return flavorTextMap[criticalReason] || defaultFailureText;
};

/**
 * 時刻フォーマット (Date → "HH:MM")
 */
export const formatTime = (date) => {
  if (!date) return "";
  const d = new Date(date);
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
};

/**
 * 「生死を分けた選択」セクション用 - walk イベントをフィルタして時系列データを組み立て
 * @param {Array} eventHistory - [{id, time}]
 * @param {Array} eventList - ローカルイベント定義
 * @param {Array} facilityList - ローカル施設定義
 * @param {Object} spotTypeList - 施設タイプ名マップ
 * @returns {Array} タイムラインデータ
 */
export const buildTimelineData = (eventHistory, eventList, facilityList, spotTypeList) => {
  const walkEvents = eventHistory.filter(e => {
    const eventDef = eventList.find(ev => ev.id === e.id);
    return eventDef && eventDef.type === "walk";
  });

  return walkEvents.map(event => {
    const eventDef = eventList.find(ev => ev.id === event.id);
    if (!eventDef) return null;

    const facility = facilityList.find(f => f.id === eventDef.locationId);
    if (!facility) return null;

    const facilityType = facility.type;
    const facilityTypeName = spotTypeList[facilityType]?.name || "不明";

    return {
      time: formatTime(event.time),
      facilityTypeName,
      facilityName: facility.name,
      significanceText: facilitySignificanceText[facility.id] || "行動の詳細が記録されていません。",
    };
  }).filter(Boolean);
};

/**
 * SNS利用回数を算出
 * @param {Array} eventHistory - [{id, time}]
 * @returns {number}
 */
export const countSnsEvents = (eventHistory) => {
  return eventHistory.filter(e => e.id && e.id.startsWith("event_sns_")).length;
};

/**
 * 「防災に向けてのヒント」セクション用 - 条件に基づいてヒントを生成
 * @param {Array} visitedFacilities - 訪問済み施設IDの配列
 * @param {number} money - 最終所持金（ゲージ値）
 * @param {number} charge - 最終充電（ゲージ値）
 * @param {number} mental - 最終精神力（ゲージ値）
 * @returns {Array<string>} ヒントテキストの配列
 */
export const buildHints = (visitedFacilities, money, charge, mental) => {
  const hints = [];

  if (!visitedFacilities.includes("fac_003")) {
    hints.push("現金があれば、キャッシュレス決済が使えなくなっても慌てずに済んだかもしれない。");
  }
  if (!visitedFacilities.includes("fac_001")) {
    hints.push("モバイルバッテリーを持ち歩いていれば、電源を心配する場面を減らせたかもしれない。");
  }
  if (money === 0) {
    hints.push("小銭を常に持ち歩いていれば、緊急時の行動選択肢が広がったかもしれない。");
  }
  if (charge === 0) {
    hints.push("スマートフォンの充電を日ごろから心がけていれば、情報収集が途絶えなかったかもしれない。");
  }
  if (mental < 30) {
    hints.push("複数の避難場所を事前に把握していれば、精神的な余裕が生まれたかもしれない。");
  }

  return hints;
};

/**
 * 経過時間を算出
 * @param {Date} currentTime - ゲーム内現在時刻
 * @param {Date} startTime - ゲーム開始時刻
 * @returns {{ hours: number, minutes: number }}
 */
export const calcElapsedTime = (currentTime, startTime) => {
  const elapsedMs = currentTime.getTime() - startTime.getTime();
  const hours = Math.floor(elapsedMs / (1000 * 60 * 60));
  const minutes = Math.floor((elapsedMs % (1000 * 60 * 60)) / (1000 * 60));
  return { hours, minutes };
};
