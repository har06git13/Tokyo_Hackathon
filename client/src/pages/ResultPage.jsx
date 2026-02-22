import React from "react";
import { Flex, Text, Link } from "@chakra-ui/react";
import {
  survivedAtom,
  criticalReasonAtom,
  lifeAtom,
  mentalAtom,
  chargeAtom,
  moneyAtom,
  currentTimeAtom,
  visitedFacilitiesAtom,
  eventHistoryAtom,
  gaugeHistoryAtom,
  resetAllAtom,
} from "../atoms/playerAtoms";
import { useAtom, useSetAtom } from "jotai";
import { LifeGauge, Header, Button } from "../components/common";
import { StatsSummary, GaugeChart, ResultTimelineItem } from "../components/game-page";
import { facilityList, spotTypeList } from "../temporary-database";
import { useNavigate } from "react-router-dom";

// criticalReason → フレーバーテキスト対応表
const flavorTextMap = {
  // survived === false
  lowLife: "体力が限界に達し、倒れてしまった…",
  timeup: "時間切れ。避難場所に辿り着くことができなかった…",
};
const defaultSuccessText =
  "ギリギリの判断を重ね、無事に一時避難場所に辿り着くことができた。電源確保・現金取得・人とのつながり、どれもが生存に直結する選択だった。";
const defaultFailureText = "避難に失敗してしまった…";

const getFlavorText = (survived, criticalReason) => {
  if (survived) return defaultSuccessText;
  return flavorTextMap[criticalReason] || defaultFailureText;
};

// 施設ごとの生存上の意義テキスト定義
const facilitySignificanceText = {
  fac_001: "電源を確保。精神を回復し、後のSNS利用やマップ閲覧が可能に。",
  fac_002: "壁の矢印が示す避難方向を確認。土地勘がなくても正しい方角を把握できた。",
  fac_003: "水や食料を調達。体力と気力を回復し、次の行動に備えた。",
  fac_004: "受け入れ施設の情報を取得し、行動範囲が広がった。",
  fac_005: "施設が満員になる寸前に滑り込み、夜の安全を確保。",
};

export const ResultPage = () => {
  const [survived] = useAtom(survivedAtom);
  const [criticalReason] = useAtom(criticalReasonAtom);
  const [life] = useAtom(lifeAtom);
  const [mental] = useAtom(mentalAtom);
  const [charge] = useAtom(chargeAtom);
  const [money] = useAtom(moneyAtom);
  const [currentTime] = useAtom(currentTimeAtom);
  const [visitedFacilities] = useAtom(visitedFacilitiesAtom);
  const [eventHistory] = useAtom(eventHistoryAtom);
  const [gaugeHistory] = useAtom(gaugeHistoryAtom);
  const setAll = useSetAtom(resetAllAtom);

  const navigate = useNavigate();

  // 統計サマリーの算出
  const createStartTime = () => {
    const now = new Date();
    return new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      14,
      0,
      0,
      0
    );
  };

  const elapsedMs = currentTime.getTime() - createStartTime().getTime();
  const elapsedHours = Math.floor(elapsedMs / (1000 * 60 * 60));
  const elapsedMinutes = Math.floor((elapsedMs % (1000 * 60 * 60)) / (1000 * 60));

  const visitedCount = visitedFacilities.length;
  const snsCount = eventHistory.filter(e => e.id && e.id.startsWith("event_sns_")).length;

  // 「生死を分けた選択」セクション用 - walk イベントをフィルタして時系列データを組み立て
  const buildTimelineData = () => {
    const walkEvents = eventHistory.filter(e => e.type === "walk");
    
    return walkEvents.map(event => {
      const facility = facilityList.find(f => f.id === event.locationId);
      if (!facility) return null;
      
      const facilityType = facility.type;
      const facilityTypeName = spotTypeList[facilityType]?.name || "不明";
      
      const formatTime = (date) => {
        if (!date) return "";
        const d = new Date(date);
        const hours = String(d.getHours()).padStart(2, "0");
        const minutes = String(d.getMinutes()).padStart(2, "0");
        return `${hours}:${minutes}`;
      };
      
      return {
        time: formatTime(event.time),
        facilityTypeName,
        facilityName: facility.name,
        significanceText: facilitySignificanceText[facility.id] || "行動の詳細が記録されていません。",
      };
    }).filter(Boolean); // null を除外
  };

  const timelineData = buildTimelineData();

  // UI確認用ダミータイムラインデータ
  const dummyTimelineData = [
    {
      time: "15:00",
      facilityTypeName: "モバイルバッテリースタンド",
      facilityName: "CHARGESPOT HUB 渋谷センター街店",
      significanceText: "電源を確保。精神を回復し、後のSNS利用やマップ閲覧が可能に。",
    },
    {
      time: "17:30",
      facilityTypeName: "飲食店・コンビニなど",
      facilityName: "ファミリーマート 渋谷公園通り店",
      significanceText: "水や食料を調達。体力と気力を回復し、次の行動に備えた。",
    },
    {
      time: "19:15",
      facilityTypeName: "一時避難場所",
      facilityName: "代々木公園",
      significanceText: "受け入れ施設の情報を取得し、行動範囲が広がった。",
    },
  ];

  // eventHistory が空の場合はダミータイムラインを使用、そうでない場合は実データを使用
  const displayTimelineData = timelineData.length > 0 ? timelineData : dummyTimelineData;

  // 「防災に向けてのヒント」セクション用 - 条件に基づいてヒントを生成
  const buildHints = () => {
    const hints = [];

    // 条件1：コンビニ（fac_003）未訪問
    if (!visitedFacilities.includes("fac_003")) {
      hints.push("現金があれば、キャッシュレス決済が使えなくなっても慌てずに済んだかもしれない。");
    }

    // 条件2：モバイルバッテリー（fac_001）未訪問
    if (!visitedFacilities.includes("fac_001")) {
      hints.push("モバイルバッテリーを持ち歩いていれば、電源を心配する場面を減らせたかもしれない。");
    }

    // 条件3：最終所持金が 0
    if (money === 0) {
      hints.push("小銭を常に持ち歩いていれば、緊急時の行動選択肢が広がったかもしれない。");
    }

    // 条件4：最終充電が 0
    if (charge === 0) {
      hints.push("スマートフォンの充電を日ごろから心がけていれば、情報収集が途絶えなかったかもしれない。");
    }

    // 条件5：最終精神力が 30 未満
    if (mental < 30) {
      hints.push("複数の避難場所を事前に把握していれば、精神的な余裕が生まれたかもしれない。");
    }

    return hints;
  };

  const hintsData = buildHints();

  // UI確認用ダミーヒントデータ
  const dummyHints = [
    "現金があれば、キャッシュレス決済が使えなくなっても慌てずに済んだかもしれない。",
    "モバイルバッテリーを持ち歩いていれば、電源を心配する場面を減らせたかもしれない。",
  ];

  // hintsData が空の場合はダミーヒントを使用、そうでない場合は実データを使用
  const displayHints = hintsData.length > 0 ? hintsData : dummyHints;
  const dummyGaugeHistory = [
    { time: new Date(createStartTime().getTime() + 0 * 60000), life: 70, mental: 70, charge: 60, money: 0 },
    { time: new Date(createStartTime().getTime() + 30 * 60000), life: 65, mental: 68, charge: 55, money: 5 },
    { time: new Date(createStartTime().getTime() + 60 * 60000), life: 60, mental: 65, charge: 50, money: 10 },
    { time: new Date(createStartTime().getTime() + 90 * 60000), life: 50, mental: 60, charge: 40, money: 15 },
    { time: new Date(createStartTime().getTime() + 120 * 60000), life: 45, mental: 55, charge: 30, money: 20 },
  ];
  
  const displayGaugeHistory = gaugeHistory && gaugeHistory.length > 0 ? gaugeHistory : dummyGaugeHistory;

  // タイトルに戻るボタンの処理
  const handleReturnToTitle = () => {
    const ok = window.confirm(
      "これまでのプレイデータは削除されます。\n本当に最初からやり直しますか？"
    );
    if (ok) {
      setAll(); // ここで全リセット
      navigate("/");
    }
  };

  return (
    <Flex className="page-container" backgroundColor={"var(--color-base12)"}>
      <Header prevPage={false} currentPage="結果発表" />
      <Flex
        className="page-contents"
        overflowY={"auto"}
        scrollbar={"hidden"}
        paddingBottom={"6vh"}
      >
        <Flex
          className="result-title"
          width={"100%"}
          flexDirection={"column"}
          backgroundColor={"var(--color-theme10)"}
          alignItems={"center"}
          gap={"2vh"}
          paddingY={"3vh"}
        >
          <Text
            fontFamily={"Dela Gothic One"}
            fontSize={"360%"}
            color={"var(--color-base10)"}
            letterSpacing={"0.6vh"}
            lineHeight={"8vh"}
          >
            {survived ? "避難成功!" : "避難失敗…"}
          </Text>
          <Flex width={"78%"}>
            <LifeGauge
              howto={false}
              life={life}
              mental={mental}
              charge={charge}
              money={money}
            />
          </Flex>

          <Text
            className="text-maintext"
            color={"var(--color-base10)"}
            width={"90%"}
          >
            {getFlavorText(survived, criticalReason)}
          </Text>
        </Flex>

        {/* セクション 2: 想定地震情報 */}
        <Flex
          className="expected-earthquake"
          width={"90%"}
          flexDirection={"column"}
          mt={"2vh"}
        >
          <Flex
            paddingY={"1vh"}
            paddingX={"4%"}
            borderBottom="0.1vh solid var(--color-base131)"
            borderRadius={"2vh 2vh 0 0 "}
            backgroundColor={"var(--color-base10)"}
          >
            <Text className="text-maintext">今回の想定地震</Text>
          </Flex>
          <Flex
            paddingTop={"1vh"}
            paddingBottom={"2vh"}
            paddingX={"4%"}
            flexDirection="column"
            backgroundColor={"var(--color-base10)"}
            borderRadius={"0 0 2vh 2vh"}
          >
            <Text
              className="text-sectiontitle"
              color={"var(--color-theme10)"}
              fontWeight="bold"
            >
              都心南部直下地震（M7.3）
            </Text>
            <Text className="text-subtext" color={"var(--color-base13)"}>
              区部の約6割で震度6強以上
            </Text>

            <Text className="text-maintext" marginTop={"1vh"}>
              想定される被害
            </Text>

            <Flex flexWrap="wrap" gap="2%">
              <Text className="text-subtext">建物被害：約19万棟</Text>
              <Text className="text-subtext">死者：約6,000人</Text>
              <Text className="text-subtext">負傷者：約9万人</Text>
              <Text className="text-subtext">避難者：約299万人</Text>
              <Text className="text-subtext">帰宅困難者：約453万人</Text>
            </Flex>
            <Text
              className="text-subtext"
              mt="1vh"
              fontSize="0.9vh"
              color="var(--color-base13)"
            >
              出典：東京都防災会議「新たな東京の被害想定」{" "}
              <Link
                href="https://www.bousai.metro.tokyo.lg.jp/taisaku/torikumi/1000902/1021571.html"
                isExternal
                textDecoration="underline"
              >
                外部リンク
              </Link>
            </Text>
          </Flex>
        </Flex>

        {/* セクション 3: 統計サマリー */}
        <StatsSummary
          totalDistance={null}
          visitedCount={visitedCount}
          elapsedTime={{ hours: elapsedHours, minutes: elapsedMinutes }}
          moneyValue={money}
          snsCount={snsCount}
        />

        {/* セクション 4: ゲージ推移 */}
        <GaugeChart gaugeHistory={displayGaugeHistory} />

        {/* セクション 5: 生死を分けた選択 */}
        <Flex
          className="result-timeline"
          width={"90%"}
          flexDirection={"column"}
          mt={"2vh"}
        >
          {/* ヘッダー行 */}
          <Flex
            paddingY={"1vh"}
            paddingX={"4%"}
            borderBottom="0.1vh solid var(--color-base131)"
            borderRadius={"2vh 2vh 0 0 "}
            backgroundColor={"var(--color-base10)"}
          >
            <Text className="text-maintext">生死を分けた選択</Text>
          </Flex>

          {/* ボディ行 */}
          <Flex
            paddingTop={"1vh"}
            paddingBottom={"2vh"}
            paddingX={"4%"}
            flexDirection="column"
            backgroundColor={"var(--color-base10)"}
            borderRadius={"0 0 2vh 2vh"}
            gap="0.5vh"
          >
            {displayTimelineData.length > 0 ? (
              displayTimelineData.map((item, index) => (
                <ResultTimelineItem
                  key={index}
                  time={item.time}
                  facilityTypeName={item.facilityTypeName}
                  facilityName={item.facilityName}
                  significanceText={item.significanceText}
                  isLast={index === displayTimelineData.length - 1}
                />
              ))
            ) : (
              <Text className="text-maintext" color="var(--color-base13)">
                行動履歴がありません
              </Text>
            )}
          </Flex>
        </Flex>

        {/* セクション 6: 防災に向けてのヒント */}
        <Flex
          className="disaster-hints"
          width={"90%"}
          flexDirection={"column"}
          mt={"2vh"}
        >
          {/* ヘッダー行 */}
          <Flex
            paddingY={"1vh"}
            paddingX={"4%"}
            borderBottom="0.1vh solid var(--color-base131)"
            borderRadius={"2vh 2vh 0 0 "}
            backgroundColor={"var(--color-base10)"}
          >
            <Text className="text-maintext">防災に向けて～生存のヒント～</Text>
          </Flex>

          {/* ボディ行 */}
          <Flex
            paddingTop={"1vh"}
            paddingBottom={"2vh"}
            paddingX={"4%"}
            flexDirection="column"
            backgroundColor={"var(--color-base10)"}
            borderRadius={"0 0 2vh 2vh"}
            gap="1vh"
          >
            {displayHints.length > 0 ? (
              displayHints.map((hint, index) => (
                <Text
                  key={index}
                  className="text-maintext"
                >
                  {hint}
                </Text>
              ))
            ) : (
              <Text className="text-maintext" color="var(--color-base13)">
                防災へのヒントがこのプレイには含まれていません
              </Text>
            )}
          </Flex>
        </Flex>

        {/* セクション 7: アプリ紹介 */}
        <Flex
          className="app-introduction"
          width={"90%"}
          flexDirection={"column"}
          mt={"2vh"}
        >
          <Flex
            paddingY={"1vh"}
            paddingX={"4%"}
            borderBottom="0.1vh solid var(--color-base131)"
            borderRadius={"2vh 2vh 0 0 "}
            backgroundColor={"var(--color-base10)"}
          >
            <Text className="text-maintext">このアプリに関して</Text>
          </Flex>
          <Flex
            paddingTop={"1vh"}
            paddingBottom={"2vh"}
            paddingX={"4%"}
            flexDirection="column"
            backgroundColor={"var(--color-base10)"}
            borderRadius={"0 0 2vh 2vh"}
            gap="1vh"
          >
            <Text className="text-maintext">
              『渋谷歪譚』は、東京都や渋谷区が公開しているオープンデータをもとに作られています。
            </Text>
            <Text className="text-maintext">
              オープンデータとは、国や自治体が持っている「誰でも使える情報」のこと。
            </Text>
            <Text className="text-maintext">
              渋谷区では、「帰宅困難者受け入れ施設一覧」といった防災情報はもちろん、
              「この時間帯に一番人が多いエリアはどこ？」や「このエリアでバズっているSNS投稿は？」など、身近な情報まで公開されています。
            </Text>
            <Text className="text-maintext">
              公開データは法律で利用が推奨されていて、利用許諾に沿えば自由に加工したり、ゲームに活かしたりもOK！
              <br />
              『渋谷歪譚』のように遊びながら防災を学べるアプリも作れます。
            </Text>
            <Text className="text-maintext">
              眺めているだけでも面白いので、興味がある人は、
              <Link
                href="https://www.city.shibuya.tokyo.jp/contents/kusei/shibuya-data/"
                isExternal
                color="var(--color-theme10)"
                textDecoration="underline"
                display="inline"
              >
                SHIBUYA CITY DASHBOARD
              </Link>
              や
              <Link
                href="https://catalog.data.metro.tokyo.lg.jp/"
                isExternal
                color="var(--color-theme10)"
                textDecoration="underline"
                display="inline"
              >
                東京都オープンデータカタログサイト
              </Link>
              をチェックしてみてください！
            </Text>
          </Flex>
        </Flex>

        {/* セクション 8: タイトルに戻るボタン */}
        <Flex width="90%" mt={"2vh"}>
          <Button
            width="100%"
            height="3.6vh"
            text="タイトルに戻る"
            isAvailable
            onClick={handleReturnToTitle}
          />
        </Flex>

        {/* ダミー画像（開発用・最終削除予定） */}
        <img src="/assets/image/dummy-result.png" alt="リザルト" style={{ width: "100%" }} />
      </Flex>
    </Flex>
  );
};
