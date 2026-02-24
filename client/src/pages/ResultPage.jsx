import React, { useState } from "react";
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
import { StatsSummary, GaugeChart, ResultTimelineItem, ShareModal } from "../components/game-page";
import { eventList, facilityList, spotTypeList } from "../temporary-database";
import { useNavigate } from "react-router-dom";
import { buildTimelineData, calcTotalDistance, calcVisitedCount } from "../utils/resultPageLogic";

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

// 施設ベースのヒント（訪問有無で内容が変わる）
const facilityHintMap = {
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
  const [isShareOpen, setIsShareOpen] = useState(false);

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

  const visitedCount = calcVisitedCount(visitedFacilities);
  const snsCount = eventHistory.filter(e => e.id && e.id.startsWith("event_sns_")).length;
  const totalDistance = calcTotalDistance(visitedFacilities, facilityList);

  // 「生死を分けた選択」セクション用 - walk / epilogue / sns イベントをフィルタして時系列データを組み立て
  // resultPageLogic.js の buildTimelineData を使用（SNS対応済み）
  const timelineData = buildTimelineData(eventHistory, eventList, facilityList, spotTypeList);

  // 「防災に向けてのヒント」セクション用 - 条件に基づいてヒントを生成
  const buildHints = () => {
    // 行動履歴がない場合はヒントを生成しない（visitedFacilities が初期値のみで全未訪問扱いになるため）
    if (timelineData.length === 0) return [];

    const hints = [];

    // ① 施設ベースのヒント（訪問有無で内容が変わる）
    for (const [facilityId, hintDef] of Object.entries(facilityHintMap)) {
      const isVisited = visitedFacilities.includes(facilityId);
      if (isVisited && hintDef.visited) {
        hints.push(hintDef.visited);
      } else if (!isVisited && hintDef.notVisited) {
        hints.push(hintDef.notVisited);
      }
      // notVisited が未定義の場合（fac_005 など）はヒントをスキップ
    }

    // ② ゲージ条件ヒント
    // money=0 は fac_003 訪問済みの場合のみ（未訪問時は① の notVisited と重複するため）
    if (money === 0 && visitedFacilities.includes("fac_003")) hints.push("小銭を常に持ち歩いていれば、緊急時の行動選択肢が広がったかもしれない。");
    if (charge === 0) hints.push("スマートフォンの充電を日ごろから心がけていれば、情報収集が途絶えなかったかもしれない。");
    if (mental < 30) hints.push("複数の避難場所を事前に把握していれば、精神的な余裕が生まれたかもしれない。");

    // ③ ランダムに2件を選択して返す（2件以下の場合はそのまま）
    if (hints.length > 2) {
      for (let i = hints.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [hints[i], hints[j]] = [hints[j], hints[i]];
      }
      return hints.slice(0, 2);
    }
    // ヒントが 0 件の場合は空配列のまま返す（JSX 側で「生存のヒントがありません」を表示）
    return hints;
  };

  const hintsData = buildHints();

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


        {/* セクション 3: 統計サマリー＋経路地図 */}
        <StatsSummary
          totalDistance={totalDistance}
          visitedCount={visitedCount}
          elapsedTime={{ hours: elapsedHours, minutes: elapsedMinutes }}
          moneyValue={money}
          snsCount={snsCount}
          visitedFacilities={visitedFacilities}
          facilityList={facilityList}
        />

        {/* セクション 5: ゲージ推移 */}
        <GaugeChart gaugeHistory={gaugeHistory} />

        {/* セクション 6: 生死を分けた選択 */}
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
            {timelineData.length > 0 ? (
              timelineData.map((item, index) => (
                <ResultTimelineItem
                  key={index}
                  time={item.time}
                  isSns={item.isSns}
                  facilityTypeName={item.facilityTypeName}
                  facilityName={item.facilityName}
                  significanceText={item.significanceText}
                  isLast={index === timelineData.length - 1}
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
            {hintsData.length > 0 ? (
              hintsData.map((hint, index) => (
                <Text key={index} className="text-maintext">
                  {hint}
                </Text>
              ))
            ) : (
              <Text className="text-maintext" color="var(--color-base13)">
                生存のヒントがありません
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

        {/* セクション 8: ボタン群（SNS共有・タイトル遷移） */}
        {/* ① SNS 共有ボタン */}
        <Flex width="90%" mt={"2vh"}>
          <Button
            width="100%"
            height="3.6vh"
            text="避難の記録をSNSに投稿する"
            isAvailable
            onClick={() => setIsShareOpen(true)}
          />
        </Flex>

        {/* ② タイトルに戻るボタン（色: インディゴ） */}
        <Flex width="90%" mt={"2vh"}>
          <Button
            width="100%"
            height="3.6vh"
            text="タイトルに戻る"
            color="var(--color-accent10)"
            isAvailable
            onClick={handleReturnToTitle}
          />
        </Flex>

        {/* ダミー画像（開発用・最終削除予定） */}
        <img src="/assets/image/dummy-result.png" alt="リザルト" style={{ width: "100%" }} />
      </Flex>

      {/* SNS シェアモーダル（page-container 直下でオーバーレイ） */}
      <ShareModal isOpen={isShareOpen} onClose={() => setIsShareOpen(false)} />
    </Flex>
  );
};
