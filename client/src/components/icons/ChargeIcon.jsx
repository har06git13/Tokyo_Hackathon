const ChargeIcon = ({ isGauge = true, ...props }) => {
  const gaugeSvg = {
    viewBox: "0 0 44 44",
    path: [
      <path
        key={"g1"}
        fillRule="evenodd"
        clipRule="evenodd"
        d="M22 0C9.84974 0 0 9.84974 0 22C0 34.1503 9.84974 44 22 44C34.1503 44 44 34.1503 44 22C44 9.84974 34.1503 0 22 0ZM19.818 22.8397L23.9837 17.0053L22.7426 21.6749L25.182 22.3612L21.5318 27.8761L22.2573 23.5262L19.818 22.8397ZM26.7553 11.6852V9H18.2447V11.6852H15V34H30V11.6852H26.7553ZM17.2208 31.7434H27.7792L27.7793 13.9417H24.5345V11.2564H20.4656V13.9417H17.2208V31.7434ZM22 1C10.402 1 1 10.402 1 22C1 33.598 10.402 43 22 43C33.598 43 43 33.598 43 22C43 10.402 33.598 1 22 1ZM2 22C2 10.9543 10.9543 2 22 2C33.0457 2 42 10.9543 42 22C42 33.0457 33.0457 42 22 42C10.9543 42 2 33.0457 2 22Z"
        fill="var(--color-charge10)"
      />,
    ],
  };

  const markSvg = {
    viewBox: "0 0 38 62",
    path: [
      <path
        key={"m1"}
        d="M29.78 6.65919V0H8.22V6.65919H0V62H38V6.65919H29.78ZM32.374 56.4037H5.62604V12.2555H13.8462V5.59586H24.1541V12.2555H32.3742L32.374 56.4037Z"
        fill="var(--color-charge10)"
      />,
      <path
        key={"m2"}
        d="M22.7587 19.8532L12.2057 34.3226L18.3852 36.0249L16.5473 46.8127L25.7944 33.1357L19.6145 31.4338L22.7587 19.8532Z"
        fill="var(--color-charge10)"
      />,
    ],
  };

  const svgData = isGauge ? gaugeSvg : markSvg;

  return (
    <svg
      key={"default"}
      className="charge-icon"
      width="100%"
      height="100%"
      viewBox={svgData.viewBox}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      {svgData.path}
    </svg>
  );
};

export default ChargeIcon;
