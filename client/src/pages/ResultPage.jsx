import React, { useState, useMemo, useEffect, useRef } from "react";
import { Flex, Text, Link, Box } from "@chakra-ui/react";
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
import {
  StatsSummary,
  GaugeChart,
  ResultTimelineItem,
  ShareModal,
  WorldChoices,
} from "../components/game-page";
import { eventList, facilityList, spotTypeList } from "../temporary-database";
import { useNavigate } from "react-router-dom";
import {
  buildTimelineData,
  calcTotalDistance,
  calcVisitedCount,
  calcElapsedTime,
  buildHints,
  getFlavorText,
  buildActionSummary,
} from "../utils/resultPageLogic";

const ADVICE_KEYWORDS = [
  "モバイルバッテリー",
  "充電",
  "現金",
  "食料",
  "飲料水",
  "避難場所",
  "ハザードマップ",
  "帰宅困難",
  "SNS",
  "安否",
  "備蓄",
  "非常食",
  "防災",
  "避難訓練",
  "情報収集",
  "一時避難",
];

// テキスト中の防災キーワードを赤字 span で囲んだ JSX 配列を返す
function highlightKeywords(text) {
  if (!text) return null;
  const pattern = new RegExp(
    `(${ADVICE_KEYWORDS.map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`,
    "g",
  );
  const parts = text.split(pattern);
  return parts.map((part, i) =>
    ADVICE_KEYWORDS.includes(part) ? (
      <span
        key={i}
        style={{ color: "var(--color-accent10, #e53e3e)", fontWeight: "bold" }}
      >
        {part}
      </span>
    ) : (
      part
    ),
  );
}

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
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const BASE_URL = process.env.REACT_APP_API_URL;

  // 統計サマリーの算出
  // startTime はマウント時に1回だけ生成する（毎レンダリングで new Date() を呼ばない）
  const startTime = useMemo(() => {
    const now = new Date();
    return new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      14,
      0,
      0,
      0,
    );
  }, []);

  const { hours: elapsedHours, minutes: elapsedMinutes } = calcElapsedTime(
    currentTime,
    startTime,
  );

  const finalDestination =
    [...visitedFacilities].reverse().find((id) => id !== "fac_000") ??
    "fac_000";

  const visitedCount = calcVisitedCount(visitedFacilities);
  const snsCount = eventHistory.filter(
    (e) => e.id && e.id.startsWith("event_sns_"),
  ).length;
  const totalDistance = calcTotalDistance(visitedFacilities, facilityList);

  // 「生死を分けた選択」セクション用 - walk / epilogue / sns イベントをフィルタして時系列データを組み立て
  // resultPageLogic.js の buildTimelineData を使用（SNS対応済み）
  const timelineData = buildTimelineData(
    eventHistory,
    eventList,
    facilityList,
    spotTypeList,
  );

  // 「防災に向けてのヒント」セクション用
  // 主経路: Gemini LLM アドバイス / フォールバック: ルールベース buildHints()
  const [adviceState, setAdviceState] = useState({
    text: null,
    loading: false,
    isLLM: false,
  });
  const adviceRequested = useRef(false);

  useEffect(() => {
    if (adviceRequested.current) return;
    adviceRequested.current = true;

    if (timelineData.length === 0) {
      // 行動履歴なし → アドバイスなし
      return;
    }
    const summary = buildActionSummary(visitedFacilities, eventHistory);
    setAdviceState({ text: null, loading: true, isLLM: false });
    fetch(`${BASE_URL}/api/advice?actions=${encodeURIComponent(summary)}`)
      .then((r) => r.json())
      .then(({ advice }) => {
        if (advice) {
          setAdviceState({ text: advice, loading: false, isLLM: true });
        } else {
          const fallback = buildHints(visitedFacilities, money, charge, mental);
          setAdviceState({
            text: fallback.join("\n"),
            loading: false,
            isLLM: false,
          });
        }
      })
      .catch(() => {
        const fallback = buildHints(visitedFacilities, money, charge, mental);
        setAdviceState({
          text: fallback.join("\n"),
          loading: false,
          isLLM: false,
        });
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // タイトルに戻るボタンの処理
  const handleReturnToTitle = () => {
    setIsConfirmOpen(true);
  };

  const handleConfirmReset = () => {
    setIsConfirmOpen(false);
    setAll();
    navigate("/");
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
            fontSize={"8vh"}
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

        {/* セクション 4: ゲージ推移 */}
        <GaugeChart gaugeHistory={gaugeHistory} />

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
              <Text
                className="text-maintext"
                color="var(--color-base13)"
                textAlign="center"
              >
                行動履歴がありません
              </Text>
            )}
          </Flex>
        </Flex>

        {/* セクション 6: みんなの選択 */}
        <WorldChoices finalDestination={finalDestination} />

        {/* セクション 7: 防災に向けてのヒント */}

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
            {timelineData.length === 0 ? (
              <Text
                className="text-maintext"
                color="var(--color-base13)"
                textAlign="center"
              >
                生存のヒントがありません
              </Text>
            ) : adviceState.loading ? (
              <Text className="text-maintext" color="var(--color-base13)">
                アドバイスを生成中...
              </Text>
            ) : adviceState.text ? (
              <>
                {adviceState.isLLM ? (
                  // LLM アドバイス: キーワード赤字表示
                  <Text className="text-maintext">
                    {highlightKeywords(adviceState.text)}
                  </Text>
                ) : (
                  // フォールバック: ルールベース（複数行）
                  adviceState.text.split("\n").map((hint, index) => (
                    <Text key={index} className="text-maintext">
                      {hint}
                    </Text>
                  ))
                )}
                <Text className="text-subtext" color="var(--color-base13)">
                  {adviceState.isLLM
                    ? "※このアドバイスは不正確な情報を含む場合があります。実際の避難行動は自治体・公的機関の指示に従ってください。"
                    : "※このアドバイスは不正確な情報を含む場合があります。実際の避難行動は自治体・公的機関の指示に従ってください。"}
                </Text>
              </>
            ) : (
              <Text className="text-maintext" color="var(--color-base13)">
                生存のヒントがありません
              </Text>
            )}
          </Flex>
        </Flex>

        {/* セクション 8: アプリ紹介 */}
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

        {/* セクション 9: ボタン群（SNS共有・タイトル遷移） */}
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

        {/* ダミー画像（開発用・非表示） */}
        <img
          src="/assets/image/dummy-result.png"
          alt="リザルト"
          style={{ width: "100%", display: "none" }}
        />
      </Flex>

      {/* SNS シェアモーダル（page-container 直下でオーバーレイ） */}
      <ShareModal isOpen={isShareOpen} onClose={() => setIsShareOpen(false)} />

      {/* タイトルに戻る 確認ダイアログ */}
      {isConfirmOpen && (
        <Flex
          position="fixed"
          top={0}
          left={0}
          width="100%"
          height="100%"
          backgroundColor="rgba(0,0,0,0.6)"
          zIndex={10}
          alignItems="center"
          justifyContent="center"
          onClick={() => setIsConfirmOpen(false)}
        >
          <Box
            backgroundColor="var(--color-base10)"
            borderRadius="2vh"
            padding="4vh"
            width="80%"
            maxWidth="320px"
            display="flex"
            flexDirection="column"
            gap="2vh"
            onClick={(e) => e.stopPropagation()}
          >
            <Text className="text-sectiontitle" fontWeight="bold">
              タイトルに戻りますか？
            </Text>
            <Text className="text-maintext" color="var(--color-base13)">
              これまでのプレイデータは削除されます。
            </Text>
            <Flex gap="3%" width="100%">
              <Button
                width="100%"
                height="3.6vh"
                text="キャンセル"
                color="var(--color-base13)"
                isAvailable
                onClick={() => setIsConfirmOpen(false)}
              />
              <Button
                width="100%"
                height="3.6vh"
                text="やり直す"
                color="var(--color-accent10)"
                isAvailable
                onClick={handleConfirmReset}
              />
            </Flex>
          </Box>
        </Flex>
      )}
    </Flex>
  );
};
