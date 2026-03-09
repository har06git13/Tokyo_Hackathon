import React, { useEffect, useState } from "react";
import { Flex, Text } from "@chakra-ui/react";
import PropTypes from "prop-types";

// エリア表示順（仕様書 §4.7.3）
const AREA_ORDER = ["渋谷駅周辺", "道玄坂エリア", "代々木エリア", "青山エリア", "その他"];

const AREA_COLORS = {
  "渋谷駅周辺": "#e63946",
  "道玄坂エリア": "#393994",
  "代々木エリア": "#f4a261",
  "青山エリア": "#74c6cc",
  "その他": "#cccccc",
};

// API の "不明" を "その他" に変換
const normalizeArea = (area) => area === "不明" ? "その他" : area;

// APIレスポンスの finalDestinationDist をエリア名を正規化・固定順にソートして返す
const normalizeDist = (dist) => {
  // エリア名を正規化してマージ（"不明" と "その他" が両方あった場合も合算）
  const merged = {};
  for (const item of dist) {
    const area = normalizeArea(item.area);
    merged[area] = (merged[area] ?? 0) + item.count;
  }
  const total = Object.values(merged).reduce((s, c) => s + c, 0);
  return AREA_ORDER
    .filter((area) => merged[area] > 0)
    .map((area) => ({
      area,
      count: merged[area],
      rate: total > 0 ? Math.round(merged[area] / total * 100) : 0,
    }));
};

// 角度→SVG座標
const polarToCartesian = (cx, cy, r, angleDeg) => {
  const rad = (angleDeg - 90) * (Math.PI / 180);
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
};

// 円グラフ（スライス内に % 数値のみ表示、rate < 8 は省略）
const PieChart = ({ data }) => {
  const cx = 80, cy = 80, r = 65;
  const total = data.reduce((s, d) => s + d.count, 0);
  if (total === 0) return null;

  let currentAngle = 0;
  return (
    <svg viewBox="0 0 160 160" width="100%" style={{ maxWidth: "200px" }}>
      {data.map((item, i) => {
        const portion = item.count / total;
        const startAngle = currentAngle;
        const endAngle = currentAngle + portion * 360;
        currentAngle = endAngle;
        if (portion <= 0) return null;

        const color = AREA_COLORS[item.area] ?? "#cccccc";

        // 100% の場合は単純な円
        if (portion >= 1) {
          return <circle key={i} cx={cx} cy={cy} r={r} fill={color} />;
        }

        const start = polarToCartesian(cx, cy, r, startAngle);
        const end = polarToCartesian(cx, cy, r, endAngle);
        const largeArc = endAngle - startAngle > 180 ? 1 : 0;
        const d = `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y} Z`;

        const midAngle = startAngle + (endAngle - startAngle) / 2;
        const labelPos = polarToCartesian(cx, cy, r * 0.62, midAngle);
        const showRate = item.rate >= 10;

        return (
          <g key={i}>
            <path d={d} fill={color} />
            {showRate && (
              <text
                x={labelPos.x}
                y={labelPos.y}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="11"
                fontWeight="bold"
                fill="white"
              >
                {item.rate}%
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
};

// ドーナツグラフ（1つ）
const DonutChart = ({ rate, label }) => {
  const r = 30, cx = 42, cy = 42;
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - (rate ?? 0) / 100);

  return (
    <Flex flexDirection="column" alignItems="center" flex="0 0 calc(50% - 0.75vh)" gap="0.4vh">
      <svg viewBox="0 0 84 84" width="100%" style={{ maxWidth: "110px" }}>
        {/* 背景リング */}
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#e8e8e8" strokeWidth="7" />
        {/* 前景リング */}
        <circle
          cx={cx} cy={cy} r={r}
          fill="none"
          stroke="var(--color-theme10)"
          strokeWidth="7"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${cx} ${cy})`}
        />
        {/* 数値 */}
        <text
          x={cx} y={cy - 3}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="18"
          fontWeight="bold"
          fill="var(--color-theme10)"
        >
          {rate ?? 0}
        </text>
        <text
          x={cx} y={cy + 13}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="9"
          fill="var(--color-base13)"
        >
          %
        </text>
      </svg>
      <Text className="text-subtext" textAlign="center" color="var(--color-base13)" lineHeight="1.4" whiteSpace="pre-line">
        {label}
      </Text>
    </Flex>
  );
};

export const WorldChoices = ({ finalDestination }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const query = finalDestination ? `?finalDestination=${finalDestination}` : "";
    fetch(`/api/results/stats${query}`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data) => { setStats(data); setLoading(false); })
      .catch(() => { setError(true); setLoading(false); });
  }, [finalDestination]);

  // エリアデータを正規化・ソート
  const normalizedDist = stats?.finalDestinationDist ? normalizeDist(stats.finalDestinationDist) : [];

  // ドーナツラベル
  const sameLabel = stats?.sameDestinationFacilityName
    ? `同じ避難先だった\n${stats.sameDestinationFacilityName}`
    : "同じ避難先だった";

  // SNS: noSnsRate を反転して「SNSで情報を集めた」割合にする
  const snsRate = stats != null ? 100 - (stats.noSnsRate ?? 0) : null;

  return (
    <Flex
      className="world-choices"
      width="90%"
      flexDirection="column"
      mt="2vh"
    >
      {/* ヘッダー */}
      <Flex
        paddingY="1vh"
        paddingX="4%"
        borderBottom="0.1vh solid var(--color-base131)"
        borderRadius="2vh 2vh 0 0"
        backgroundColor="var(--color-base10)"
      >
        <Text className="text-maintext">みんなの選択</Text>
      </Flex>

      {/* ボディ */}
      <Flex
        paddingTop="1vh"
        paddingBottom="2vh"
        paddingX="4%"
        flexDirection="column"
        backgroundColor="var(--color-base10)"
        borderRadius="0 0 2vh 2vh"
        gap="1.5vh"
        alignItems="center"
      >
        {loading && (
          <Text className="text-maintext" color="var(--color-base13)">読み込み中...</Text>
        )}

        {!loading && error && (
          <Text className="text-maintext" color="var(--color-base13)" width="100%">データを取得できませんでした</Text>
        )}

        {!loading && !error && stats?.total === 0 && (
          <Text className="text-maintext" color="var(--color-base13)" width="100%">データがまだありません</Text>
        )}

        {!loading && !error && stats?.total > 0 && (
          <>
            {/* 円グラフ */}
            <Text className="text-maintext">最終到達地点</Text>
            <Text className="text-subtext">
              全 {stats.total} 人のデータ
            </Text>
            <PieChart data={normalizedDist} />

            {/* エリア凡例（固定順）: エリア名 + rate% */}
            <Flex flexWrap="wrap" gap="1.2vw" justifyContent="center" width="100%">
              {normalizedDist.map((item) => (
                <Flex key={item.area} alignItems="center" gap="0.5vw">
                  <div style={{
                    width: "1.2vh", height: "1.2vh",
                    borderRadius: "50%",
                    backgroundColor: AREA_COLORS[item.area] ?? "#ccc",
                    // 灰色（その他）は白背景との判別のためボーダーを付ける
                    border: item.area === "その他" ? "0.1vh solid #aaa" : "none",
                    flexShrink: 0,
                  }} />
                  <Text className="text-subtext" color="var(--color-base13)">{item.area}</Text>
                </Flex>
              ))}
            </Flex>

            {/* ドーナツ 2×2 */}
            <Flex flexWrap="wrap" width="100%" gap="1.5vh" mt="0.5vh">
              <DonutChart rate={stats.sameDestinationRate} label={sameLabel} />
              <DonutChart rate={stats.batteryRentalRate} label="充電スポットに立ち寄った" />
              <DonutChart rate={stats.cashWithdrawRate} label="現金を確保した" />
              <DonutChart rate={snsRate} label="SNSで情報を集めた" />
            </Flex>
          </>
        )}
      </Flex>
    </Flex>
  );
};

WorldChoices.propTypes = {
  finalDestination: PropTypes.string,
};
