// src/pages/game-pages/CheckInPage.jsx
import React, { useEffect, useRef, useState } from "react";
import QrScanner from "qr-scanner";
import { Flex, Box, Text } from "@chakra-ui/react";
import { Header } from "../../components/common";
import { Footer } from "../../components/game-page";
import { useNavigate } from "react-router-dom";
import { selectedFacilityAtom, selectedEventAtom } from "../../atoms/playerAtoms";
import { useAtom, useSetAtom } from "jotai";

// 仮コードリーダーからIDを取得するフック（UI表示用）
const useScannedCodeId = () => {
  const [scannedId, setScannedId] = React.useState(null);
  return [scannedId, setScannedId];
};

export const CheckInPage = () => {
  const navigate = useNavigate();

  // Jotai
  const [selectedFacility] = useAtom(selectedFacilityAtom);
  const setSelectedFacilityAtom = useSetAtom(selectedFacilityAtom);
  const [selectedEvent] = useAtom(selectedEventAtom);
  const setSelectedEventAtom = useSetAtom(selectedEventAtom);

  const eventId = selectedEvent?._id || selectedEvent?.id || null;

  // UI 用
  const [scannedId, setScannedId] = useScannedCodeId();
  const videoRef = useRef(null);
  const qrScannerRef = useRef(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState("");

  // facilities(API)
  const [facilities, setFacilities] = useState([]);
  const [facLoading, setFacLoading] = useState(true);
  const [facError, setFacError] = useState(null);

  // 最新の選択中施設・施設一覧をコールバックから参照できるように ref へ
  const selectedFacilityRef = useRef(selectedFacility);
  const facilitiesRef = useRef([]);
  useEffect(() => { selectedFacilityRef.current = selectedFacility; }, [selectedFacility]);
  useEffect(() => { facilitiesRef.current = facilities; }, [facilities]);

  // 施設一覧を取得
  useEffect(() => {
    let aborted = false;
    (async () => {
      setFacLoading(true);
      setFacError(null);
      try {
        const res = await fetch("/api/facilities");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const list = await res.json();
        const normalized = Array.isArray(list)
          ? list.map((d) => ({
              ...d,
              // QRは "fac_***" を想定。DBに id があるならそれを優先、無い場合は _id を使う
              id: d.id ?? d._id,
            }))
          : [];
        if (!aborted) setFacilities(normalized);
      } catch (e) {
        if (!aborted) setFacError(e.message);
      } finally {
        if (!aborted) setFacLoading(false);
      }
    })();
    return () => { aborted = true; };
  }, []);

  // スキャナ開始（施設一覧が取れてから起動）
  useEffect(() => {
    if (facLoading || facError) return; // ロード失敗/中は起動しない
    let mounted = true;

    const start = async () => {
      if (!navigator?.mediaDevices?.getUserMedia) return;

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
          audio: false,
        });

        if (!mounted) {
          try { stream.getTracks().forEach((t) => t.stop()); } catch {}
          return;
        }

        if (videoRef.current) {
          try { videoRef.current.srcObject = stream; } catch {}
          await new Promise((res) => {
            const onLoaded = () => {
              try { videoRef.current.removeEventListener("loadedmetadata", onLoaded); } catch {}
              res();
            };
            try { videoRef.current.addEventListener("loadedmetadata", onLoaded); } catch { res(); }
            if (videoRef.current?.readyState >= 1) {
              try { videoRef.current.removeEventListener("loadedmetadata", onLoaded); } catch {}
              res();
            }
          });
          try { await videoRef.current.play(); } catch {}

          // QR コールバック
          const onScan = async (result) => {
            const data = typeof result === "string" ? result : result?.data;
            if (!data) return;

            setScannedId(String(data));

            // 仕様：まず「移動先が選ばれていること」を要求
            const sel = selectedFacilityRef.current;
            if (!sel) {
              setScanError("先にマップで移動先を選択してください");
              try { navigator?.vibrate?.(200); } catch {}
              setTimeout(() => setScanError(""), 1500);
              return;
            }

            // 施設一覧(API)の id と照合
            const list = facilitiesRef.current || [];
            const scannedFac = list.find((f) => f.id === data);
            if (!scannedFac) {
              setScanError("このQRは施設のものではありません");
              try { navigator?.vibrate?.(200); } catch {}
              setTimeout(() => setScanError(""), 1500);
              return;
            }

            // 仕様：選択中の施設IDと一致したときだけ遷移許可
            if (sel.id !== scannedFac.id) {
              setScanError("選択中の施設と異なるQRです");
              try { navigator?.vibrate?.(200); } catch {}
              setTimeout(() => setScanError(""), 1500);
              return;
            }

            // グローバルへ反映（施設）
            try { setSelectedFacilityAtom(scannedFac); } catch {}

            // イベントをAPIから取得（walk優先→epilogueフォールバック）
            try {
              const wRes = await fetch(`/api/events?type=walk&locationId=${encodeURIComponent(scannedFac.id)}`);
              if (!wRes.ok) throw new Error(`HTTP ${wRes.status}`);
              const wArr = await wRes.json();
              let ev = Array.isArray(wArr) && wArr[0] ? wArr[0] : null;

              if (!ev) {
                const eRes = await fetch("/api/events?type=epilogue");
                if (eRes.ok) {
                  const eArr = await eRes.json();
                  ev = Array.isArray(eArr) ? eArr[0] : null;
                }
              }

              if (!ev) {
                setScanError("イベントが見つかりませんでした");
                try { navigator?.vibrate?.(200); } catch {}
                setTimeout(() => setScanError(""), 1500);
                return;
              }

              // グローバルへ反映（イベント）
              try { setSelectedEventAtom(ev); } catch {}

              // モノローグへ（/game/monologue/:id を推奨）
              const nextId = ev._id || ev.id;
              navigate(nextId ? `/game/monologue/${nextId}` : "/game/monologue");
            } catch (e) {
              setScanError("イベント取得に失敗しました");
              try { navigator?.vibrate?.(200); } catch {}
              setTimeout(() => setScanError(""), 1500);
            }
          };

          // スキャナ作成・開始
          qrScannerRef.current = new QrScanner(videoRef.current, onScan, {
            highlightScanRegion: false,
            highlightCodeOutline: false,
          });

          try {
            await qrScannerRef.current.start();
            setIsScanning(true);
          } catch (e) {
            console.error("[CheckInPage] scanner start failed", e);
            setIsScanning(false);
          }
        }
      } catch (e) {
        console.debug("[CheckInPage] getUserMedia failed", e);
      }
    };

    start();

    return () => {
      mounted = false;
      setIsScanning(false);
      try { qrScannerRef.current && qrScannerRef.current.stop(); } catch {}
      try {
        if (videoRef.current?.srcObject) {
          const s = videoRef.current.srcObject;
          try { s.getTracks().forEach((t) => t.stop()); } catch {}
          try { videoRef.current.srcObject = null; } catch {}
        }
      } catch {}
    };
  }, [facLoading, facError, setSelectedFacilityAtom, setSelectedEventAtom, navigate]);

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
            {/* 施設ロード状態 */}
            {facLoading && (
              <Box color="var(--color-base1)">施設リストを読み込み中...</Box>
            )}
            {facError && (
              <Box color="tomato">施設の取得に失敗：{facError}</Box>
            )}

            {/* カメラプレビュー */}
            {!facLoading && !facError && (
              <video
                ref={videoRef}
                playsInline
                autoPlay
                muted
                style={{ width: "100%", height: "100%", objectFit: "cover", background: "#222" }}
              />
            )}

            {/* ガイド枠 */}
            {!facLoading && !facError && (
              <Box
                className="checkin-guide"
                position="absolute"
                top={0}
                left={0}
                width="100%"
                height="100%"
                display="flex"
                alignItems="center"
                justifyContent="center"
                pointerEvents="none"
              >
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
                    aspectRatio: "1/1",
                    boxSizing: "border-box",
                    transformOrigin: "center",
                    animation: isScanning ? "scanScale 1s ease-in-out infinite" : "none",
                    zIndex: 50,
                    pointerEvents: "none",
                  }}
                />
              </Box>
            )}
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
              onClick={() => {
                if (eventId) {
                  navigate(`/game/monologue/${eventId}`);
                } else {
                  alert("モノローグ用のイベントが見つかりませんでした。アクション画面に戻ります。");
                  navigate("/game/action");
                }
              }}
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
            <Box fontSize="sm" color="gray.200">
              Last scanned: <Box as="span" color="white">{scannedId || "-"}</Box>
            </Box>
            <Box fontSize="sm" color="orange.200" mt="1">{scanError}</Box>
          </Box>
        </Flex>
      </Flex>
      <Footer isWalking />
    </Flex>
  );
};
