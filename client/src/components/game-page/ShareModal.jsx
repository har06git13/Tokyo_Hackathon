import React, { useState, useEffect } from "react";
import { Box, Flex, Text } from "@chakra-ui/react";
import { useAtom } from "jotai";
import {
  survivedAtom,
  visitedFacilitiesAtom,
  currentTimeAtom,
  lifeAtom,
  mentalAtom,
  chargeAtom,
  moneyAtom,
  eventHistoryAtom,
} from "../../atoms/playerAtoms";
import { calcVisitedCount, calcTotalDistance } from "../../utils/resultPageLogic";
import { facilityList } from "../../temporary-database";

const createStartTime = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 14, 0, 0, 0);
};

const loadImage = (src) =>
  new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });

// ゲージアイコン SVG（gaugeSvg バリアント）を Canvas 用 data URL に変換
// CSS変数（var(--color-*)）は hex 値に置換済み
const makeIconDataUrl = (pathEl) =>
  `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44 44" fill="none">${pathEl}</svg>`
  )}`;

const LIFE_ICON_URL = makeIconDataUrl(
  `<path fill-rule="evenodd" clip-rule="evenodd" d="M0 22C0 9.84974 9.84974 0 22 0C34.1503 0 44 9.84974 44 22C44 34.1503 34.1503 44 22 44C9.84974 44 0 34.1503 0 22ZM33.9288 26.8164C33.8452 26.5239 33.6775 25.9933 33.3739 25.0413C32.3906 21.9253 26.9995 10.9969 26.9995 10.9969C26.6959 10.3154 26.0048 9.92529 25.2832 10.012L18.6155 10.8564C18.1647 10.9102 17.7772 11.1911 17.5575 11.6021C17.5575 11.6021 16.7839 12.9118 16.4588 13.7233C16.1347 14.5349 16.3229 15.3464 16.9821 15.8227C17.6414 16.2979 20.7815 17.1099 21.3786 16.8394C22.3732 16.3846 22.8862 14.3296 22.8862 14.3296L24.3929 14.0591C24.3929 14.0591 25.0216 16.2978 24.9162 18.2676C24.7804 20.7022 24.9332 21.7168 25.2582 23.8157C24.9131 23.9385 24.5541 23.582 23.9192 22.9518C23.7953 22.8288 23.6608 22.6953 23.5139 22.553C20.7229 19.8479 17.2259 20.9096 15.6738 23.2778C15.2659 22.9206 13.7443 22.7337 12 22.553V35C14.9658 34.6397 16.2911 32.543 16.2911 32.543C17.9144 32.8777 20.418 32.6521 22.4876 32.2902C26.3115 31.6217 28.8517 30.0948 28.8517 30.0948L33.0602 28.6232C33.7818 28.3637 34.169 27.5626 33.9288 26.8164ZM22 1C10.402 1 1 10.402 1 22C1 33.598 10.402 43 22 43C33.598 43 43 33.598 43 22C43 10.402 33.598 1 22 1ZM2 22C2 10.9543 10.9543 2 22 2C33.0457 2 42 10.9543 42 22C42 33.0457 33.0457 42 22 42C10.9543 42 2 33.0457 2 22Z" fill="#06d6a0"/>`
);

const MENTAL_ICON_URL = makeIconDataUrl(
  `<path fill-rule="evenodd" clip-rule="evenodd" d="M0 22C0 9.84974 9.84974 0 22 0C34.1503 0 44 9.84974 44 22C44 34.1503 34.1503 44 22 44C9.84974 44 0 34.1503 0 22ZM33.9545 19.7919C33.6278 16.2635 30.5451 14 27.5158 14C24.4858 14 22 16.4403 22 19.4505C22 16.4403 19.5142 14 16.4849 14C13.4549 14 10.3722 16.2635 10.0455 19.7919C10.0148 20.1274 10.0001 20.449 10.0001 20.7569C9.98091 25.4011 13.3838 27.0566 16.761 28.6997C18.5436 29.5669 20.319 30.4307 21.5803 31.7285C21.7276 31.8799 21.7026 31.8668 21.7026 31.8668C21.778 31.9513 21.8857 32 22 32C22.1143 32 22.2227 31.9512 22.2981 31.8661C22.2981 31.8661 22.2724 31.8799 22.4204 31.7285C23.6817 30.4302 25.4573 29.5663 27.24 28.6989C30.6168 27.056 34.0191 25.4007 33.9999 20.7569C33.9999 20.449 33.9853 20.1274 33.9545 19.7919ZM22 1C10.402 1 1 10.402 1 22C1 33.598 10.402 43 22 43C33.598 43 43 33.598 43 22C43 10.402 33.598 1 22 1ZM2 22C2 10.9543 10.9543 2 22 2C33.0457 2 42 10.9543 42 22C42 33.0457 33.0457 42 22 42C10.9543 42 2 33.0457 2 22Z" fill="#118ab2"/>`
);

const CHARGE_ICON_URL = makeIconDataUrl(
  `<path fill-rule="evenodd" clip-rule="evenodd" d="M22 0C9.84974 0 0 9.84974 0 22C0 34.1503 9.84974 44 22 44C34.1503 44 44 34.1503 44 22C44 9.84974 34.1503 0 22 0ZM19.818 22.8397L23.9837 17.0053L22.7426 21.6749L25.182 22.3612L21.5318 27.8761L22.2573 23.5262L19.818 22.8397ZM26.7553 11.6852V9H18.2447V11.6852H15V34H30V11.6852H26.7553ZM17.2208 31.7434H27.7792L27.7793 13.9417H24.5345V11.2564H20.4656V13.9417H17.2208V31.7434ZM22 1C10.402 1 1 10.402 1 22C1 33.598 10.402 43 22 43C33.598 43 43 33.598 43 22C43 10.402 33.598 1 22 1ZM2 22C2 10.9543 10.9543 2 22 2C33.0457 2 42 10.9543 42 22C42 33.0457 33.0457 42 22 42C10.9543 42 2 33.0457 2 22Z" fill="#fdc500"/>`
);

const MONEY_ICON_URL = makeIconDataUrl(
  `<path fill-rule="evenodd" clip-rule="evenodd" d="M0 22C0 9.84974 9.84974 0 22 0C34.1503 0 44 9.84974 44 22C44 34.1503 34.1503 44 22 44C9.84974 44 0 34.1503 0 22ZM1 22C1 10.402 10.402 1 22 1C33.598 1 43 10.402 43 22C43 33.598 33.598 43 22 43C10.402 43 1 33.598 1 22ZM22 2C10.9543 2 2 10.9543 2 22C2 33.0457 10.9543 42 22 42C33.0457 42 42 33.0457 42 22C42 10.9543 33.0457 2 22 2ZM8 22C8 14.2686 14.2677 8 22 8C29.7314 8 36 14.2686 36 22C36 29.7323 29.7314 36 22 36C14.2677 36 8 29.7323 8 22ZM22 33.375C15.728 33.375 10.625 28.2719 10.625 22C10.625 15.7281 15.7281 10.625 22 10.625C28.2719 10.625 33.375 15.7281 33.375 22C33.375 28.2719 28.272 33.375 22 33.375ZM22 12.375C16.6927 12.375 12.375 16.6927 12.375 22C12.375 27.3073 16.6927 31.625 22 31.625C27.3064 31.625 31.625 27.3073 31.625 22C31.625 16.6927 27.3064 12.375 22 12.375ZM13.25 22C13.25 26.8245 17.1755 30.75 22 30.75C26.8245 30.75 30.75 26.8245 30.75 22C30.75 17.1755 26.8245 13.25 22 13.25C17.1755 13.25 13.25 17.1755 13.25 22ZM23.2783 21.1523H26.1101V19.7783H24.1636L25.8179 17.202H24.1679L21.9991 20.5739L19.8313 17.202H18.1813L19.8365 19.7783H17.889V21.1523H20.7208L21.0259 21.6275V22.7588H17.889V24.3687H21.0259V26.798H22.9741V24.3687H26.1101V22.7588H22.9741V21.6257L23.2783 21.1523Z" fill="#8d6e63"/>`
);

// 区切り線ヘルパー
const drawSep = (ctx, y, W) => {
  ctx.globalAlpha = 0.15;
  ctx.fillStyle = "#1a1a1a";
  ctx.fillRect(W * 0.08, y, W * 0.84, 2);
};

const generateShareImage = async (
  survived, visitedCount, totalDistance, hours, minutes, playDate,
  snsCount, money, life, mental, charge
) => {
  await document.fonts.ready;

  const [logoImg, lifeIcon, mentalIcon, chargeIcon, moneyIcon] = await Promise.all([
    loadImage("/assets/svg/applogo.svg"),
    loadImage(LIFE_ICON_URL),
    loadImage(MENTAL_ICON_URL),
    loadImage(CHARGE_ICON_URL),
    loadImage(MONEY_ICON_URL),
  ]);

  const W = 1080, H = 1920;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");

  // ===== 背景（白地）=====
  ctx.fillStyle = "#fdfdfd";
  ctx.fillRect(0, 0, W, H);

  // ===== 外枠ボーダー（生存: 赤 / 失敗: 黒）=====
  const BORDER = 32;
  ctx.fillStyle = survived ? "#e63946" : "#1a1a1a";
  ctx.fillRect(0, 0, W, BORDER);           // 上
  ctx.fillRect(0, H - BORDER, W, BORDER);  // 下
  ctx.fillRect(0, 0, BORDER, H);           // 左
  ctx.fillRect(W - BORDER, 0, BORDER, H);  // 右

  const ACCENT = survived ? "#e63946" : "#1a1a1a";
  const CARD_BG = "#f4f4f4";
  const CARD_R = 24;

  // ===== ヘッダー帯（ロゴ + 日付）=====
  const HEADER_H = 300;
  ctx.fillStyle = ACCENT;
  ctx.fillRect(BORDER, BORDER, W - BORDER * 2, HEADER_H);

  // ロゴ
  if (logoImg && logoImg.naturalWidth > 0) {
    const lh = 130;
    const lw = lh * (logoImg.naturalWidth / logoImg.naturalHeight);
    ctx.globalAlpha = 0.95;
    ctx.drawImage(logoImg, (W - lw) / 2, BORDER + 40, lw, lh);
    ctx.globalAlpha = 1;
  }
  // 日付（ヘッダー内・白文字）
  ctx.globalAlpha = 0.75;
  ctx.fillStyle = "#fdfdfd";
  ctx.font = "40px 'Rounded Mplus 1c'";
  ctx.textAlign = "center";
  ctx.fillText(playDate, W / 2, BORDER + HEADER_H - 44);
  ctx.globalAlpha = 1;

  // ===== 結果テキスト =====
  ctx.fillStyle = ACCENT;
  ctx.font = "155px 'Dela Gothic One'";
  ctx.textAlign = "center";
  ctx.fillText(survived ? "避難成功！" : "避難失敗…", W / 2, 510);

  // ===== プレイ統計（統合カード）=====
  const CARD_X = 60;
  const CARD_W = W - 120;
  const CARD_PAD = 56;
  const MID_X = W / 2;
  const STAT_TOP = 620;
  const ROW_H = 158;
  const STAT_CARD_H = ROW_H * 3;

  // 統合カード背景（1枚）
  ctx.globalAlpha = 1;
  ctx.fillStyle = CARD_BG;
  ctx.beginPath();
  ctx.roundRect(CARD_X, STAT_TOP, CARD_W, STAT_CARD_H, CARD_R);
  ctx.fill();

  // セクションラベル（カード上部）
  ctx.globalAlpha = 0.4;
  ctx.fillStyle = "#1a1a1a";
  ctx.font = "28px 'Rounded Mplus 1c'";
  ctx.textAlign = "center";
  ctx.fillText("プレイ統計", W / 2, STAT_TOP - 22);
  ctx.globalAlpha = 1;

  const statRows = [
    { label1: "総移動距離", val1: `${totalDistance} km`,   label2: "経過時間",     val2: `${hours}時間${minutes}分`,              rowIndex: 0 },
    { label1: "訪問施設数",  val1: `${visitedCount} 箇所`, label2: "使用したお金", val2: `${(money * 100).toLocaleString()} 円`,  rowIndex: 1 },
    { label1: null,          val1: null,                    label2: "SNS利用回数",  val2: `${snsCount} 回`,    center: true,      rowIndex: 2 },
  ];

  statRows.forEach(({ label1, val1, label2, val2, rowIndex, center }) => {
    const rowY = STAT_TOP + rowIndex * ROW_H;

    if (center) {
      ctx.globalAlpha = 0.55;
      ctx.fillStyle = "#1a1a1a";
      ctx.font = "30px 'Rounded Mplus 1c'";
      ctx.textAlign = "center";
      ctx.fillText(label2, MID_X, rowY + 54);
      ctx.globalAlpha = 1;
      ctx.fillStyle = ACCENT;
      ctx.font = "bold 52px 'Rounded Mplus 1c'";
      ctx.fillText(val2, MID_X, rowY + 112);
    } else {
      const lx = CARD_X + CARD_PAD;
      const rx = MID_X + CARD_PAD;
      // 左列
      ctx.globalAlpha = 0.55;
      ctx.fillStyle = "#1a1a1a";
      ctx.font = "30px 'Rounded Mplus 1c'";
      ctx.textAlign = "left";
      ctx.fillText(label1, lx, rowY + 54);
      ctx.globalAlpha = 1;
      ctx.fillStyle = ACCENT;
      ctx.font = "bold 52px 'Rounded Mplus 1c'";
      ctx.fillText(val1, lx, rowY + 112);
      // 右列
      ctx.globalAlpha = 0.55;
      ctx.fillStyle = "#1a1a1a";
      ctx.font = "30px 'Rounded Mplus 1c'";
      ctx.textAlign = "left";
      ctx.fillText(label2, rx, rowY + 54);
      ctx.globalAlpha = 1;
      ctx.fillStyle = ACCENT;
      ctx.font = "bold 52px 'Rounded Mplus 1c'";
      ctx.fillText(val2, rx, rowY + 112);
    }
  });

  // カード底辺 = STAT_TOP + STAT_CARD_H
  const STAT_BOTTOM = STAT_TOP + STAT_CARD_H;

  // ===== 最終ゲージ セクションラベル =====
  ctx.globalAlpha = 0.55;
  ctx.fillStyle = "#1a1a1a";
  ctx.font = "34px 'Rounded Mplus 1c'";
  ctx.textAlign = "center";
  ctx.fillText("最終ゲージ", W / 2, STAT_BOTTOM + 80);

  // ===== ゲージバー（丸角・アイコン付き）=====
  const ICON_SIZE = 52;
  const BAR_LEFT = 148;
  const BAR_RIGHT = W - 80;
  const BAR_W = BAR_RIGHT - BAR_LEFT;
  const BAR_H = 28;
  const BAR_R = BAR_H / 2;
  const GAUGE_START_Y = STAT_BOTTOM + 150;
  const GAUGE_STEP = 120;

  const gauges = [
    { label: "体力",  value: life,   color: "#06d6a0", display: `${life}%`,                           icon: lifeIcon },
    { label: "精神",  value: mental, color: "#118ab2", display: `${mental}%`,                         icon: mentalIcon },
    { label: "充電",  value: charge, color: "#fdc500", display: `${charge}%`,                         icon: chargeIcon },
    { label: "お金",  value: money,  color: "#8d6e63", display: `${(money * 100).toLocaleString()}円`, icon: moneyIcon },
  ];

  gauges.forEach((g, i) => {
    const textY = GAUGE_START_Y + i * GAUGE_STEP;
    const iconTop = textY - 44;
    const barY = textY + 14;

    if (g.icon && g.icon.naturalWidth > 0) {
      ctx.globalAlpha = 0.95;
      ctx.drawImage(g.icon, 80, iconTop, ICON_SIZE, ICON_SIZE);
    }
    ctx.globalAlpha = 0.9;
    ctx.fillStyle = g.color;
    ctx.font = "40px 'Rounded Mplus 1c'";
    ctx.textAlign = "left";
    ctx.fillText(g.label, BAR_LEFT, textY);
    ctx.textAlign = "right";
    ctx.fillText(g.display, BAR_RIGHT, textY);

    // バー背景（丸角）
    ctx.globalAlpha = 0.14;
    ctx.fillStyle = "#1a1a1a";
    ctx.beginPath();
    ctx.roundRect(BAR_LEFT, barY, BAR_W, BAR_H, BAR_R);
    ctx.fill();

    // バー塗り（丸角）
    const fillW = Math.max(BAR_W * Math.min(g.value, 100) / 100, BAR_H);
    ctx.globalAlpha = 0.85;
    ctx.fillStyle = g.color;
    ctx.beginPath();
    ctx.roundRect(BAR_LEFT, barY, fillW, BAR_H, BAR_R);
    ctx.fill();
  });

  // ===== ハッシュタグ =====
  ctx.globalAlpha = 0.65;
  ctx.fillStyle = "#1a1a1a";
  ctx.font = "50px 'Rounded Mplus 1c'";
  ctx.textAlign = "center";
  ctx.fillText("#渋谷歪譚  #防災", W / 2, 1800);

  return canvas;
};

export const ShareModal = ({ isOpen, onClose }) => {
  const [survived] = useAtom(survivedAtom);
  const [visitedFacilities] = useAtom(visitedFacilitiesAtom);
  const [currentTime] = useAtom(currentTimeAtom);
  const [life] = useAtom(lifeAtom);
  const [mental] = useAtom(mentalAtom);
  const [charge] = useAtom(chargeAtom);
  const [money] = useAtom(moneyAtom);
  const [eventHistory] = useAtom(eventHistoryAtom);

  const [previewUrl, setPreviewUrl] = useState(null);
  const [mobileHint, setMobileHint] = useState(false);

  const elapsedMs = currentTime.getTime() - createStartTime().getTime();
  const elapsedHours = Math.floor(elapsedMs / (1000 * 60 * 60));
  const elapsedMinutes = Math.floor((elapsedMs % (1000 * 60 * 60)) / (1000 * 60));
  const visitedCount = calcVisitedCount(visitedFacilities);
  const totalDistance = calcTotalDistance(visitedFacilities, facilityList);
  const snsCount = eventHistory.filter(
    (e) => e.id && e.id.startsWith("event_sns_")
  ).length;
  const playDate = new Date().toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  // モーダルを開いたときに即座に画像を生成
  useEffect(() => {
    if (!isOpen) return;
    setPreviewUrl(null);
    setMobileHint(false);
    generateShareImage(
      survived, visitedCount, totalDistance, elapsedHours, elapsedMinutes, playDate,
      snsCount, money, life, mental, charge
    ).then((canvas) => setPreviewUrl(canvas.toDataURL("image/png")));
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSave = (e) => {
    e.stopPropagation();
    if (!previewUrl) return;
    const link = document.createElement("a");
    if (typeof link.download !== "undefined") {
      link.download = "渋谷歪譚_結果.png";
      link.href = previewUrl;
      link.click();
    } else {
      setMobileHint(true);
    }
  };

  if (!isOpen) return null;

  return (
    /* 暗いオーバーレイ（クリックで閉じる） */
    <Flex
      position="absolute"
      top={0}
      left={0}
      width="100%"
      height="100%"
      backgroundColor="rgba(0,0,0,0.88)"
      zIndex={10}
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      gap="2.5vh"
      onClick={onClose}
    >
      {/* 生成画像プレビュー（9:16 等倍） */}
      {previewUrl ? (
        <img
          src={previewUrl}
          alt="シェア画像"
          style={{
            width: "70%",
            maxHeight: "72vh",
            objectFit: "contain",
            borderRadius: "2vh",
            boxShadow: "0 12px 40px rgba(0,0,0,0.6)",
          }}
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        /* 生成中プレースホルダー */
        <Box
          width="70%"
          sx={{ aspectRatio: "9 / 16" }}
          maxHeight="72vh"
          borderRadius="2vh"
          backgroundColor="rgba(255,255,255,0.06)"
          display="flex"
          alignItems="center"
          justifyContent="center"
          onClick={(e) => e.stopPropagation()}
        >
          <Text className="text-subtext" color="rgba(255,255,255,0.4)">
            生成中...
          </Text>
        </Box>
      )}

      {/* iOS 長押し案内 */}
      {mobileHint && (
        <Text
          className="text-subtext"
          color="rgba(255,255,255,0.7)"
          textAlign="center"
        >
          画像を長押しして保存してください
        </Text>
      )}

      {/* 控えめな保存ボタン */}
      <Flex
        paddingX="4vh"
        paddingY="1.2vh"
        borderRadius="full"
        border="0.15vh solid rgba(255,255,255,0.3)"
        cursor="pointer"
        alignItems="center"
        onClick={handleSave}
        opacity={previewUrl ? 1 : 0.4}
      >
        <Text className="text-maintext" color="rgba(255,255,255,0.85)">
          ↓ 画像を保存
        </Text>
      </Flex>
    </Flex>
  );
};
