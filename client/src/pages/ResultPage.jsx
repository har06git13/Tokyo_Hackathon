import React from "react";
import { Flex, Text, Image, Link } from "@chakra-ui/react";
import {
  survivedAtom,
  lifeAtom,
  mentalAtom,
  chargeAtom,
  moneyAtom,
} from "../atoms/playerAtoms";
import { useAtom } from "jotai";
import { LifeGauge, Header, Button } from "../components/common";
import { useNavigate } from "react-router-dom";

export const ResultPage = () => {
  const [survived] = useAtom(survivedAtom);
  const [life] = useAtom(lifeAtom);
  const [mental] = useAtom(mentalAtom);
  const [charge] = useAtom(chargeAtom);
  const [money] = useAtom(moneyAtom);

  const navigate = useNavigate();

  return (
    <Flex className="page-container" backgroundColor={"var(--color-base12)"}>
      <Header prevPage={false} currentPage="リザルト" />
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
            ギリギリの判断を重ね、無事に一時避難場所に辿り着くことができた。電源確保・現金取得・人とのつながり、どれもが生存に直結する選択だった。
          </Text>
        </Flex>

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

        <Image src="/assets/image/dummy-result.png" />

        <Flex
          className="expected-earthquake"
          width={"90%"}
          flexDirection={"column"}
          mb={"2vh"}
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
            gap="1vh" // Text同士の隙間
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

        <Button
          width="90%"
          height="3.6vh"
          text="タイトルに戻る"
          isAvailable
          onClick={() => {
            if (
              window.confirm(
                "これまでのプレイデータは削除されます。\n 本当に最初からやり直しますか？"
              )
            ) {
              navigate("/");
            }
          }}
        />
      </Flex>
    </Flex>
  );
};
