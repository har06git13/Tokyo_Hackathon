import React, { useEffect, useRef } from "react";
import QrScanner from "qr-scanner";
import { Flex, Box, Text } from "@chakra-ui/react";
import { Header } from "../../components/common";
import { Footer } from "../../components/game-page";
import { useNavigate } from "react-router-dom";
import { selectedFacilityAtom } from "../../atoms/playerAtoms";
import { useAtom } from "jotai";

// 仮コードリーダーからIDを取得するフック
const useScannedCodeId = () => {
  const [scannedId, setScannedId] = React.useState(null);

  // ここでコードリーダーが値を返すタイミングで setScannedId を呼ぶ
  // setScannedId(読み込んだID); ←たぶんこれでできる
  return [scannedId, setScannedId];
};

export const CheckInPage = () => {
  const navigate = useNavigate();
  const [selectedFacility] = useAtom(selectedFacilityAtom);
  const [scannedId, setScannedId] = useScannedCodeId();
  const videoRef = useRef(null);
  const qrScannerRef = useRef(null);
  const [scanError, setScanError] = React.useState("");

  // Ensure worker path (CDN fallback)
  try {
    QrScanner.WORKER_PATH = "https://unpkg.com/qr-scanner@1.4.2/qr-scanner-worker.min.js";
  } catch (e) {}

  // 監視して、一致したら自動遷移
  useEffect(() => {
    if (!scannedId) return;
    if (selectedFacility?.id === scannedId) {
      navigate("/game/monologue");
      return;
    }
    // mismatch: show friendly retry message and reset scannedId so scanner can resume
    setScanError("もう一度スキャンしてください");
    try { if (navigator?.vibrate) navigator.vibrate(120); } catch (e) {}
    const t = setTimeout(() => {
      setScanError("");
      try { setScannedId(null); } catch (e) {}
    }, 1500);
    return () => clearTimeout(t);
  }, [scannedId, selectedFacility, navigate, setScannedId]);

  useEffect(() => {
    let mounted = true;
    const start = async () => {
      if (!navigator?.mediaDevices?.getUserMedia) return;
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false });
        if (!mounted) {
          // stop tracks if unmounted quickly
          try { stream.getTracks().forEach(t => t.stop()); } catch (e) {}
          return;
        }
        if (videoRef.current) {
          try { videoRef.current.srcObject = stream; } catch (e) {}
          // wait loadedmetadata
          await new Promise((res) => {
            const onLoaded = () => { try { videoRef.current.removeEventListener('loadedmetadata', onLoaded); } catch (e) {} res(); };
            try { videoRef.current.addEventListener('loadedmetadata', onLoaded); } catch (e) { res(); }
            if (videoRef.current?.readyState >= 1) { try { videoRef.current.removeEventListener('loadedmetadata', onLoaded); } catch (e) {} res(); }
          });
          try { await videoRef.current.play(); } catch (e) {}

          // init scanner
          qrScannerRef.current = new QrScanner(videoRef.current, (result) => {
            try {
              const data = result?.data;
              if (data) setScannedId(data);
            } catch (e) {}
          }, { highlightScanRegion: false, highlightCodeOutline: false });

          try { await qrScannerRef.current.start(); } catch (e) { console.debug('[CheckInPage] scanner start failed', e); }
        }
      } catch (e) {
        console.debug('[CheckInPage] getUserMedia failed', e);
      }
    };
    start();
    return () => {
      mounted = false;
      try { qrScannerRef.current && qrScannerRef.current.stop(); } catch (e) {}
      try {
        if (videoRef.current?.srcObject) {
          const s = videoRef.current.srcObject;
          try { s.getTracks().forEach(t => { try { t.stop(); } catch (e) {} }); } catch (e) {}
          try { videoRef.current.srcObject = null; } catch (e) {}
        }
      } catch (e) {}
    };
  }, [setScannedId]);

  return (
    <Flex className="page-container" backgroundColor={"var(--color-base12)"}>
      <Header currentPage="チェックイン" />
      <Flex className="page-contents">
        <Flex className="page-contents">
          <Box
            className={"dummy-code-reader"}
            width={"100%"}
            height={"60vh"}
            backgroundColor={"var(--color-accent11)"}
            position="relative"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <video
              ref={videoRef}
              playsInline
              muted
              style={{ width: '100%', height: '100%', objectFit: 'cover', background: '#222' }}
            />

            {/* white guide frame */}
            <Box position="absolute" top={0} left={0} width="100%" height="100%" display="flex" alignItems="center" justifyContent="center" pointerEvents="none">
              <Box width="64%" sx={{ aspectRatio: '9/16' }} border="2px solid #FFFFFF" boxSizing="border-box" />
            </Box>
          </Box>

          <Flex
            flexDirection={"column"}
            backgroundColor={"var(--color-base10)"}
            width={"90%"}
            paddingX={"4%"}
            flex={1}
            marginTop={"2vh"}
            borderRadius={"1vh 1vh 0 0 "}
            paddingY={"2vh"}
          >
            <Text
              className="text-sectiontitle"
              color={"var(--color-accent10)"}
              onClick={() => navigate("/game/monologue")}
            >
              現行ではこのあたりをタップで遷移
            </Text>
            <Box
              height="0.08px"
              backgroundColor="var(--color-base12)"
              my="1.6vh"
              width="100%"
            />
            <Text className="text-maintext">
              施設に到着したら、「渋谷歪譚」のロゴを探しましょう。
              <br />
              ※移動中以外はチェックインを行うことができません。
            </Text>
          </Flex>
        </Flex>
      </Flex>
      <Footer isWalking />
    </Flex>
  );
};
        console.debug('[CheckInPage] creating QrScanner (startCamera)');
