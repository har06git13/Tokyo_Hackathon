import PropTypes from "prop-types";
import { Text, Flex, Box } from "@chakra-ui/react";
import { LifeIcon, MentalIcon, ChargeIcon, MoneyIcon } from "../icons";

/**
 * GaugeChart - ゲージ推移を折れ線グラフで表示（カード形式）
 * @param {Array} gaugeHistory - ゲージ履歴配列 [{time: Date, life: number, mental: number, charge: number, money: number}]
 */
const GaugeChart = ({ gaugeHistory }) => {
  const legendItems = [
    { label: "体力", Icon: LifeIcon },
    { label: "精神力", Icon: MentalIcon },
    { label: "充電", Icon: ChargeIcon },
    { label: "お金 (百円)", Icon: MoneyIcon },
  ];
  const legendIconSize = "2.2vh";

  // フォールバック: gaugeHistory が空の場合
  if (!gaugeHistory || gaugeHistory.length === 0) {
    return (
      <Flex width="90%" margin="0 auto" marginTop="2vh" flexDirection="column">
        {/* ヘッダー行 */}
        <Flex
          paddingY="1vh"
          paddingX="4%"
          borderBottom="0.1vh solid var(--color-base131)"
          borderRadius="2vh 2vh 0 0"
          backgroundColor="var(--color-base10)"
        >
          <Text className="text-maintext">ゲージ推移</Text>
        </Flex>

        {/* ボディ */}
        <Flex
          paddingTop="1vh"
          paddingBottom="2vh"
          paddingX="4%"
          flexDirection="column"
          backgroundColor="var(--color-base10)"
          borderRadius="0 0 2vh 2vh"
          gap="1vh"
        >
          {/* メッセージ */}
          <Text className="text-maintext" color="var(--color-base13)">
            ゲージ推移データがありません
          </Text>

          {/* 凡例 */}
          <Flex gap="2vh" flexWrap="wrap" justifyContent="center">
            {legendItems.map(({ label, Icon }) => (
              <Flex key={label} alignItems="center" gap="0.6vh">
                <Box height={legendIconSize} width={legendIconSize}>
                  <Icon height="100%" width="100%" />
                </Box>
                <Text className="text-maintext">{label}</Text>
              </Flex>
            ))}
          </Flex>
        </Flex>
      </Flex>
    );
  }

  // SVG設定（viewBox を大きくし文字の相対サイズを下げる）
  const vbWidth = 500;
  const vbHeight = 350;
  const padding = { top: 15, right: 10, bottom: 15, left: 10 };
  const chartWidth = vbWidth - padding.left - padding.right;
  const chartHeight = vbHeight - padding.top - padding.bottom;
  const yLabelWidth = "4vh";

  // データポイント数
  const dataPoints = gaugeHistory.length;

  // 時刻ラベル用（開始時刻と終了時刻）
  const startTime = gaugeHistory[0]?.time;
  const endTime = gaugeHistory[dataPoints - 1]?.time;

  const formatTime = (date) => {
    if (!date) return "";
    const d = new Date(date);
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  // データポイントをSVG座標に変換
  const mapToCoordinates = (data, gaugeKey) => {
    return data
      .map((point, index) => {
        const x = padding.left + (index / Math.max(1, dataPoints - 1)) * chartWidth;
        const y = padding.top + ((100 - point[gaugeKey]) / 100) * chartHeight;
        return `${x},${y}`;
      })
      .join(" ");
  };

  // 各ゲージの折れ線座標
  const lifePoints = mapToCoordinates(gaugeHistory, "life");
  const mentalPoints = mapToCoordinates(gaugeHistory, "mental");
  const chargePoints = mapToCoordinates(gaugeHistory, "charge");
  const moneyPoints = mapToCoordinates(gaugeHistory, "money");

  // 縦軸の目盛り（0, 25, 50, 75, 100）
  const yTicks = [100, 75, 50, 25, 0];

  return (
    <Flex width="90%" margin="0 auto" marginTop="2vh" flexDirection="column">
      {/* ヘッダー行 */}
      <Flex
        paddingY="1vh"
        paddingX="4%"
        borderBottom="0.1vh solid var(--color-base131)"
        borderRadius="2vh 2vh 0 0"
        backgroundColor="var(--color-base10)"
      >
        <Text className="text-maintext">ゲージ推移</Text>
      </Flex>

      {/* ボディ */}
      <Flex
        paddingTop="1vh"
        paddingBottom="2vh"
        paddingX="4%"
        flexDirection="column"
        backgroundColor="var(--color-base10)"
        borderRadius="0 0 2vh 2vh"
        gap="0.8vh"
      >
        {/* グラフ */}
        <Flex width="100%" direction="column" gap="0.6vh">
        <Flex gap="0.6vh" alignItems="stretch">
          {/* 縦軸ラベル */}
          <Flex
            width={yLabelWidth}
            direction="column"
            justifyContent="space-between"
            height="15vh"
          >
            {yTicks.map((tick) => (
              <Text
                key={tick}
                className="text-subtext"
                color="var(--color-base13)"
                textAlign="right"
              >
                {tick}
              </Text>
            ))}
          </Flex>

          {/* SVGグラフ */}
          <Box
            width="100%"
            height="15vh"
            backgroundColor="var(--color-base12)"
            borderRadius="1vh"
            outline="0.1vh solid var(--color-base131)"
          >
            <svg
              viewBox={`0 0 ${vbWidth} ${vbHeight}`}
              preserveAspectRatio="none"
              style={{
                width: "100%",
                height: "100%",
                display: "block",
              }}
            >
              {/* 縦軸目盛り + 横グリッド線 */}
              {yTicks.map((tick) => {
                const y = padding.top + ((100 - tick) / 100) * chartHeight;
                return (
                  <g key={tick}>
                    {/* グリッド線 */}
                    <line
                      x1={padding.left}
                      y1={y}
                      x2={vbWidth - padding.right}
                      y2={y}
                      stroke="var(--color-base13)"
                      strokeWidth="0.5"
                      strokeDasharray="3 3"
                      opacity="1"
                    />
                  </g>
                );
              })}

        {/* 折れ線グラフ */}
        <polyline
          points={lifePoints}
          fill="none"
          stroke="var(--color-life10)"
          strokeWidth="4"
        />
        <polyline
          points={mentalPoints}
          fill="none"
          stroke="var(--color-mental10)"
          strokeWidth="4"
        />
        <polyline
          points={chargePoints}
          fill="none"
          stroke="var(--color-charge10)"
          strokeWidth="4"
        />
        <polyline
          points={moneyPoints}
          fill="none"
          stroke="var(--color-money10)"
          strokeWidth="4"
        />
            </svg>
          </Box>
        </Flex>

        {/* 横軸時刻ラベル（SVG外） */}
        <Flex marginLeft={yLabelWidth} justifyContent="space-between">
          <Text className="text-subtext" color="var(--color-base13)">
            {formatTime(startTime)}
          </Text>
          <Text className="text-subtext" color="var(--color-base13)">
            {formatTime(endTime)}
          </Text>
        </Flex>
      </Flex>

        {/* 凡例 */}
        <Flex gap="1.5vh" flexWrap="wrap" justifyContent="center">
          {legendItems.map(({ label, Icon }) => (
            <Flex key={label} alignItems="center" gap="0.6vh">
              <Box height={legendIconSize} width={legendIconSize}>
                <Icon height="100%" width="100%" />
              </Box>
              <Text className="text-subtext">{label}</Text>
            </Flex>
          ))}
        </Flex>
      </Flex>
    </Flex>
  );
};

GaugeChart.propTypes = {
  gaugeHistory: PropTypes.arrayOf(
    PropTypes.shape({
      time: PropTypes.instanceOf(Date).isRequired,
      life: PropTypes.number.isRequired,
      mental: PropTypes.number.isRequired,
      charge: PropTypes.number.isRequired,
      money: PropTypes.number.isRequired,
    })
  ),
};

export default GaugeChart;
