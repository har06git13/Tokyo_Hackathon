import React, { useEffect, useRef } from "react";
import QrScanner from "qr-scanner";
import { Flex, Box, Text, Button } from "@chakra-ui/react";
import { Header } from "../../components/common";
import { Footer } from "../../components/game-page";
import { useNavigate } from "react-router-dom";
import { selectedFacilityAtom, selectedEventAtom } from "../../atoms/playerAtoms";
import { eventList } from "../../temporary-database";
import { useAtom, useSetAtom } from "jotai";
import { facilityList } from "../../temporary-database";

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
  const setSelectedFacility = useSetAtom(selectedFacilityAtom);
  const setSelectedEvent = useSetAtom(selectedEventAtom);
  const videoRef = useRef(null);
  const qrScannerRef = useRef(null);
  const [isScanning, setIsScanning] = React.useState(false);
  const [scanError, setScanError] = React.useState("");

  // Note: modern qr-scanner releases manage the worker automatically when bundled.
  // Setting QrScanner.WORKER_PATH is deprecated and causes warnings; do not set it here.

  // We will handle scanned results directly inside the QR callback.

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
              console.debug('[CheckInPage] qr callback', result);
              const data = typeof result === 'string' ? result : result?.data;
              if (!data) return;
              // try to find facility by id (temporary-database)
              const fac = facilityList.find((f) => f.id === data || f.id === String(data));
              if (fac) {
                // set selected facility globally and derive/set the event, then navigate
                try {
                  setSelectedFacility(fac);
                } catch (e) { console.debug('[CheckInPage] setSelectedFacility failed', e); }
                try {
                  // find a walk event for this facility, fallback to epilogue
                  const evData = eventList.find((ev) => ev.locationId === fac.id && ev.type === 'walk') || eventList.find((ev) => ev.type === 'epilogue');
                  if (evData) {
                    try { setSelectedEvent(evData); } catch (e) { console.debug('[CheckInPage] setSelectedEvent failed', e); }
                  }
                } catch (e) { console.debug('[CheckInPage] find/set event failed', e); }
                try {
                  navigate('/game/monologue');
                } catch (e) { console.debug('[CheckInPage] navigate failed', e); }
              } else {
                setScanError('このQRは施設のものではありません');
                try { if (navigator?.vibrate) navigator.vibrate(200); } catch (e) {}
                setTimeout(() => { setScanError(''); try { setScannedId(null); } catch (e) {} }, 1500);
              }
            } catch (e) { console.debug('[CheckInPage] qr callback error', e); }
          }, { highlightScanRegion: false, highlightCodeOutline: false });

          try {
            await qrScannerRef.current.start();
            try { console.debug('[CheckInPage] scanner started', { isRunning: typeof qrScannerRef.current.isRunning === 'function' ? qrScannerRef.current.isRunning() : undefined }); } catch (er) { console.debug('[CheckInPage] scanner started (no isRunning)', er); }
            // reflect scanning state for UI
            try { setIsScanning(true); } catch (e) {}
          } catch (e) {
            console.error('[CheckInPage] scanner start failed', e);
            try { console.debug('scanner instance', qrScannerRef.current); } catch (er) {}
            try { setIsScanning(false); } catch (e) {}
          }
        }
      } catch (e) {
        console.debug('[CheckInPage] getUserMedia failed', e);
      }
    };
    start();
    return () => {
      mounted = false;
  try { setIsScanning(false); } catch (e) {}
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
              autoPlay
              muted
              style={{ width: '100%', height: '100%', objectFit: 'cover', background: '#222' }}
            />

            {/* white guide frame */}
            <Box className="checkin-guide" position="absolute" top={0} left={0} width="100%" height="100%" display="flex" alignItems="center" justifyContent="center" pointerEvents="none">
                {/* animation keyframes for scanning pulse */}
                <Box as="style">{`
                  .checkin-guide .guide-frame { border: 3px solid rgba(255,255,255,0.95) !important; border-radius: 8px !important; }
                  @keyframes scanScale {
                    0% { transform: scale(1); }
                    50% { transform: scale(1.06); }
                    100% { transform: scale(1); }
                  }
                `}</Box>
                <Box
                  className="guide-frame"
                  width="64%"
                  style={{
                    aspectRatio: '1/1',
                    boxSizing: 'border-box',
                    transformOrigin: 'center',
                    animation: isScanning ? 'scanScale 1s ease-in-out infinite' : 'none',
                    zIndex: 50,
                    pointerEvents: 'none'
                  }}
                />
                {/* centered QR icon scaled to the guide-frame size */}
                {isScanning && (
                  <Box position="absolute" zIndex={60} pointerEvents="none" display="flex" alignItems="center" justifyContent="center" width="64%" sx={{ aspectRatio: '1/1' }}>
                    {/* icon box sized as percentage of guide-frame so it scales with it */}
                    <Box width="40%" height="40%" display="flex" alignItems="center" justifyContent="center" bg="rgba(0,0,0,0.08)" borderRadius="6px" border="1px solid rgba(255,255,255,0.14)">
                      <Box as="svg" width="100%" height="100%" viewBox="0 0 24 24" preserveAspectRatio="xMidYMid meet" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="QR guide icon">
                        <rect x="1" y="1" width="6" height="6" rx="1" stroke="#FFFFFF" strokeWidth="1.6" fill="none"/>
                        <rect x="1" y="17" width="6" height="6" rx="1" stroke="#FFFFFF" strokeWidth="1.6" fill="none"/>
                        <rect x="17" y="1" width="6" height="6" rx="1" stroke="#FFFFFF" strokeWidth="1.6" fill="none"/>
                        <rect x="9" y="9" width="2" height="2" fill="#FFFFFF" />
                        <rect x="12" y="9" width="2" height="2" fill="#FFFFFF" />
                        <rect x="9" y="12" width="2" height="2" fill="#FFFFFF" />
                        <rect x="15" y="13" width="1.6" height="1.6" fill="#FFFFFF" />
                      </Box>
                    </Box>
                  </Box>
                )}
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
          <Box mt="2vh" display="flex" flexDirection="column" alignItems="center">
            <Box fontSize="sm" color="gray.200">Last scanned: <Box as="span" color="white">{scannedId || '-'}</Box></Box>
            <Box fontSize="sm" color="orange.200" mt="1">{scanError}</Box>
          </Box>
        </Flex>
      </Flex>
      <Footer isWalking />
    </Flex>
  );
};

