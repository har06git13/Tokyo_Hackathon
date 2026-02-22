import PropTypes from "prop-types";

/**
 * GaugeChart - ゲージ推移を折れ線グラフで表示
 * @param {Array} gaugeHistory - ゲージ履歴配列 [{time: Date, life: number, mental: number, charge: number, money: number}]
 * @param {number} life - 最終体力値（フォールバック用）
 * @param {number} mental - 最終精神力値（フォールバック用）
 * @param {number} charge - 最終充電値（フォールバック用）
 * @param {number} money - 最終お金値（フォールバック用）
 */
const GaugeChart = ({ gaugeHistory, life, mental, charge, money }) => {
  // フォールバック: gaugeHistory が空の場合
  if (!gaugeHistory || gaugeHistory.length === 0) {
    return (
      <div
        style={{
          width: "90vw",
          margin: "0 auto",
          marginTop: "3vh",
          padding: "2vh",
          backgroundColor: "var(--color-base12)",
          borderRadius: "1vh",
        }}
      >
        <div
          className="text-sectiontitle"
          style={{
            marginBottom: "2vh",
            color: "var(--color-theme10)",
          }}
        >
          ゲージ推移
        </div>
        <div
          className="text-maintext"
          style={{
            marginBottom: "1.5vh",
            color: "var(--color-base13)",
          }}
        >
          ゲージ推移データがありません
        </div>
        <div
          style={{
            display: "flex",
            gap: "2vh",
            flexWrap: "wrap",
          }}
        >
          <div className="text-maintext">
            <span style={{ color: "var(--color-life10)" }}>■</span> 体力:{" "}
            {life}%
          </div>
          <div className="text-maintext">
            <span style={{ color: "var(--color-mental10)" }}>■</span> 精神力:{" "}
            {mental}%
          </div>
          <div className="text-maintext">
            <span style={{ color: "var(--color-charge10)" }}>■</span> 充電:{" "}
            {charge}%
          </div>
          <div className="text-maintext">
            <span style={{ color: "var(--color-money10)" }}>■</span> お金:{" "}
            {money}%
          </div>
        </div>
      </div>
    );
  }

  // SVG設定
  const width = 90; // vw単位相当の幅（%換算）
  const height = 40; // vh単位相当の高さ
  const padding = { top: 5, right: 5, bottom: 10, left: 10 };
  const chartWidth = 100 - padding.left - padding.right;
  const chartHeight = 100 - padding.top - padding.bottom;

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

  // 0になった点を検出
  const findZeroPoints = (data, gaugeKey) => {
    return data
      .map((point, index) => {
        if (point[gaugeKey] === 0) {
          const x = padding.left + (index / Math.max(1, dataPoints - 1)) * chartWidth;
          const y = padding.top + ((100 - 0) / 100) * chartHeight;
          return { x, y };
        }
        return null;
      })
      .filter(Boolean);
  };

  // 各ゲージの折れ線座標
  const lifePoints = mapToCoordinates(gaugeHistory, "life");
  const mentalPoints = mapToCoordinates(gaugeHistory, "mental");
  const chargePoints = mapToCoordinates(gaugeHistory, "charge");
  const moneyPoints = mapToCoordinates(gaugeHistory, "money");

  // 0になった点
  const lifeZeros = findZeroPoints(gaugeHistory, "life");
  const mentalZeros = findZeroPoints(gaugeHistory, "mental");
  const chargeZeros = findZeroPoints(gaugeHistory, "charge");
  const moneyZeros = findZeroPoints(gaugeHistory, "money");

  // 縦軸の目盛り（0, 25, 50, 75, 100）
  const yTicks = [0, 25, 50, 75, 100];

  return (
    <div
      style={{
        width: "90vw",
        margin: "0 auto",
        marginTop: "3vh",
        padding: "2vh",
        backgroundColor: "var(--color-base12)",
        borderRadius: "1vh",
      }}
    >
      {/* タイトル */}
      <div
        className="text-sectiontitle"
        style={{
          marginBottom: "2vh",
          color: "var(--color-theme10)",
        }}
      >
        ゲージ推移
      </div>

      {/* SVGグラフ */}
      <svg
        viewBox="0 0 100 100"
        style={{
          width: `${width}vw`,
          height: `${height}vh`,
          backgroundColor: "var(--color-base10)",
          borderRadius: "1vh",
        }}
      >
        {/* 横軸 */}
        <line
          x1={padding.left}
          y1={100 - padding.bottom}
          x2={100 - padding.right}
          y2={100 - padding.bottom}
          stroke="var(--color-base13)"
          strokeWidth="0.3"
        />

        {/* 縦軸 */}
        <line
          x1={padding.left}
          y1={padding.top}
          x2={padding.left}
          y2={100 - padding.bottom}
          stroke="var(--color-base13)"
          strokeWidth="0.3"
        />

        {/* 縦軸目盛り */}
        {yTicks.map((tick) => {
          const y = padding.top + ((100 - tick) / 100) * chartHeight;
          return (
            <g key={tick}>
              <line
                x1={padding.left - 1}
                y1={y}
                x2={padding.left}
                y2={y}
                stroke="var(--color-base13)"
                strokeWidth="0.3"
              />
              <text
                x={padding.left - 2}
                y={y + 0.5}
                fontSize="2.5"
                fill="var(--color-base13)"
                textAnchor="end"
              >
                {tick}
              </text>
            </g>
          );
        })}

        {/* 横軸時刻ラベル */}
        <text
          x={padding.left}
          y={100 - padding.bottom + 4}
          fontSize="2.5"
          fill="var(--color-base13)"
          textAnchor="start"
        >
          {formatTime(startTime)}
        </text>
        <text
          x={100 - padding.right}
          y={100 - padding.bottom + 4}
          fontSize="2.5"
          fill="var(--color-base13)"
          textAnchor="end"
        >
          {formatTime(endTime)}
        </text>

        {/* 折れ線グラフ */}
        <polyline
          points={lifePoints}
          fill="none"
          stroke="var(--color-life10)"
          strokeWidth="0.6"
        />
        <polyline
          points={mentalPoints}
          fill="none"
          stroke="var(--color-mental10)"
          strokeWidth="0.6"
        />
        <polyline
          points={chargePoints}
          fill="none"
          stroke="var(--color-charge10)"
          strokeWidth="0.6"
        />
        <polyline
          points={moneyPoints}
          fill="none"
          stroke="var(--color-money10)"
          strokeWidth="0.6"
        />

        {/* 0値の赤マーカー */}
        {[...lifeZeros, ...mentalZeros, ...chargeZeros, ...moneyZeros].map(
          (point, idx) => (
            <circle
              key={idx}
              cx={point.x}
              cy={point.y}
              r="1"
              fill="var(--color-theme10)"
            />
          )
        )}
      </svg>

      {/* 凡例 */}
      <div
        style={{
          display: "flex",
          gap: "2vh",
          marginTop: "2vh",
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        <div className="text-maintext">
          <span style={{ color: "var(--color-life10)" }}>■</span> 体力
        </div>
        <div className="text-maintext">
          <span style={{ color: "var(--color-mental10)" }}>■</span> 精神力
        </div>
        <div className="text-maintext">
          <span style={{ color: "var(--color-charge10)" }}>■</span> 充電
        </div>
        <div className="text-maintext">
          <span style={{ color: "var(--color-money10)" }}>■</span> お金
        </div>
      </div>
    </div>
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
  life: PropTypes.number.isRequired,
  mental: PropTypes.number.isRequired,
  charge: PropTypes.number.isRequired,
  money: PropTypes.number.isRequired,
};

export default GaugeChart;
