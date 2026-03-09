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

// SNS イベントの意義テキスト（施設に紐づかない固定テキスト）
export const snsSignificanceText = "SNSで情報を収集した。デマと正確な情報が混在する中、冷静な判断力が求められた。";

// 施設ベースのヒント（訪問有無で内容が変わる）
// notVisited が undefined の施設（fac_005）は未訪問時のヒントをスキップする
export const facilityHintMap = {
  fac_001: {
    visited: "充電スポットを確保しました！停電時でもスマートフォンが使えるよう、日頃からモバイルバッテリーを満充電にしておきましょう。",
    notVisited: "モバイルバッテリーを持ち歩いていれば、電源を心配する場面を減らせたかもしれない。",
  },
  fac_002: {
    visited: "避難方向の目印を確認しました。日頃から地域のハザードマップや避難誘導サインを意識しておくと、緊急時も迷わず行動できます。",
    notVisited: "避難誘導サインは見えても見落としやすい。平時から街中の避難経路を意識して歩く習慣をつけておきましょう。",
  },
  fac_003: {
    visited: "食料と現金を確保しました！非常時に備えて、水・非常食（3日分）と現金を日頃から備蓄しておきましょう。",
    notVisited: "現金があれば、キャッシュレス決済が使えなくなっても慌てずに済んだかもしれない。",
  },
  fac_004: {
    visited: "受け入れ施設の情報を取得しました。平時から地域の一時避難場所の場所を確認しておけば、緊急時も素早く行動できます。",
    notVisited: "避難先の情報を事前に調べておけば、混乱した状況でも迷わず行動できたかもしれない。",
  },
  fac_005: {
    visited: "一時避難場所に辿り着きました！地域の避難訓練への参加や、家族との避難場所の事前共有が、いざという時に命を救います。",
    // notVisited なし: ゲームの目的地のため未訪問時はヒントを表示しない
  },
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
 * 「生死を分けた選択」セクション用 - walk / epilogue イベントをフィルタして時系列データを組み立て
 * epilogue イベントは帰宅困難者受け入れ施設への到達を表し、タイムラインに含める。
 * @param {Array} eventHistory - [{id, time}]
 * @param {Array} eventList - ローカルイベント定義
 * @param {Array} facilityList - ローカル施設定義
 * @param {Object} spotTypeList - 施設タイプ名マップ
 * @returns {Array} タイムラインデータ
 */
export const buildTimelineData = (eventHistory, eventList, facilityList, spotTypeList) => {
  const timelineEvents = eventHistory.filter(e => {
    const eventDef = eventList.find(ev => ev.id === e.id);
    return eventDef && (eventDef.type === "walk" || eventDef.type === "epilogue" || eventDef.type === "sns");
  });

  return timelineEvents.map(event => {
    const eventDef = eventList.find(ev => ev.id === event.id);
    if (!eventDef) return null;

    // SNS イベント: 施設に紐づかないため専用データを返す
    if (eventDef.type === "sns") {
      return {
        time: formatTime(event.time),
        isSns: true,
        facilityTypeName: null,
        facilityName: null,
        significanceText: snsSignificanceText,
      };
    }

    const facility = facilityList.find(f => f.id === eventDef.locationId);
    if (!facility) return null;

    const facilityType = facility.type;
    const facilityTypeName = spotTypeList[facilityType]?.name || "不明";

    return {
      time: formatTime(event.time),
      isSns: false,
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

/** ゲーム開始地点（fac_000）は自動セットのため除外 */
const STARTING_FACILITY_ID = "fac_000";

/**
 * プレイヤーが選択して訪問した施設数を返す（スタート地点 fac_000 を除外）
 * @param {string[]} visitedFacilities - 訪問済み施設ID配列
 * @returns {number}
 */
export const calcVisitedCount = (visitedFacilities) => {
  return visitedFacilities.filter((id) => id !== STARTING_FACILITY_ID).length;
};

/**
 * 「防災に向けてのヒント」セクション用 - 条件に基づいてヒントを生成
 * 行動履歴がない場合（timelineData.length === 0）の判定は呼び出し元で行い、
 * その場合はこの関数を呼ばずに空配列を使うこと。
 * @param {Array} visitedFacilities - 訪問済み施設IDの配列
 * @param {number} money - 最終所持金（ゲージ値）
 * @param {number} charge - 最終充電（ゲージ値）
 * @param {number} mental - 最終精神力（ゲージ値）
 * @returns {Array<string>} ヒントテキストの配列（0件時は空配列）
 */
export const buildHints = (visitedFacilities, money, charge, mental) => {
  const hints = [];

  // ① 施設ベースのヒント（訪問有無で内容が変わる）
  for (const [facilityId, hintDef] of Object.entries(facilityHintMap)) {
    const isVisited = visitedFacilities.includes(facilityId);
    if (isVisited && hintDef.visited) {
      hints.push(hintDef.visited);
    } else if (!isVisited && hintDef.notVisited) {
      hints.push(hintDef.notVisited);
    }
    // notVisited が未定義の施設（fac_005 など）はスキップ
  }

  // ② ゲージ条件ヒント
  // money=0 は fac_003 訪問済みの場合のみ（未訪問時は① の notVisited と重複するため）
  if (money === 0 && visitedFacilities.includes("fac_003")) hints.push("小銭を常に持ち歩いていれば、緊急時の行動選択肢が広がったかもしれない。");
  if (charge === 0) hints.push("スマートフォンの充電を日ごろから心がけていれば、情報収集が途絶えなかったかもしれない。");
  if (mental < 30) hints.push("複数の避難場所を事前に把握していれば、精神的な余裕が生まれたかもしれない。");

  // ③ 3件以上はランダムシャッフル後に2件採用
  if (hints.length > 2) {
    for (let i = hints.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [hints[i], hints[j]] = [hints[j], hints[i]];
    }
    return hints.slice(0, 2);
  }

  return hints;
};

/**
 * 訪問施設間の直線距離（Haversine）を km 単位で返す
 */
const haversineKm = (lat1, lng1, lat2, lng2) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLng = (lng2 - lng1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * 訪問施設間の累積直線距離を算出（Haversine）
 * @param {string[]} visitedFacilities - 訪問順の施設ID配列
 * @param {Array} facilityList - 座標付き施設定義（{ id, coordinates: { lat, lng } }）
 * @returns {number} 総移動距離 km（小数点1桁）
 */
export const calcTotalDistance = (visitedFacilities, facilityList) => {
  if (!visitedFacilities || visitedFacilities.length < 2) return 0;
  let total = 0;
  for (let i = 0; i < visitedFacilities.length - 1; i++) {
    const from = facilityList.find((f) => f.id === visitedFacilities[i]);
    const to = facilityList.find((f) => f.id === visitedFacilities[i + 1]);
    if (!from?.coordinates || !to?.coordinates) continue;
    total += haversineKm(
      from.coordinates.lat,
      from.coordinates.lng,
      to.coordinates.lat,
      to.coordinates.lng
    );
  }
  return Math.round(total * 10) / 10;
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
