# task-0224-01: SNS シェアボタン＋SharePage 実装・ボタンカラー変更

## ステータス

- [x] 仕様レビュー・承認待ち
- [x] 実装
- [ ] テスト（目視確認）
- [x] 仕様書更新

---

## 目的

リザルトページにプレイ結果の SNS 共有機能を追加する。

1. **「避難の記録をSNSに投稿する」ボタン**（赤）を ResultPage §3.8 に追加し、SharePage へ遷移
2. **SharePage（`/result/share`）を新規作成** — 16:9 シェアカード + `html2canvas` による画像保存
3. **「タイトルに戻る」ボタンの色** を `var(--color-theme10)`（赤）→ `var(--color-accent10)`（インディゴ `#393994`）に変更

詳細仕様: `docs/result-page-spec.md` §3.8・§6

---

## 変更ファイル一覧

| ファイル | 変更種別 | 内容 |
|----------|----------|------|
| `client/src/pages/ResultPage.jsx` | 修正 | §3.8 ボタン群更新（SNS ボタン追加・タイトルボタン色変更） |
| `client/src/pages/SharePage.jsx` | **新規作成** | 16:9 シェアカード + 画像保存 |
| `client/src/App.js` | 修正 | `/result/share` ルートを追加 |
| `client/package.json` | 修正 | `html2canvas` を追加（`npm install html2canvas`） |

---

## 実装方針

### A. ResultPage.jsx — §3.8 ボタン群

```jsx
{/* セクション 8: ボタン群（SNS共有・タイトル遷移） */}
{/* ① SNS 共有ボタン */}
<Flex width="90%" mt={"2vh"}>
  <Button
    width="100%"
    height="3.6vh"
    text="避難の記録をSNSに投稿する"
    isAvailable
    onClick={() => navigate("/result/share")}
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
```

### B. SharePage.jsx — 新規作成

**使用 Atom・ユーティリティ:**
- `survivedAtom` — 生還/失敗判定
- `visitedFacilitiesAtom` — 訪問施設 ID 配列
- `currentTimeAtom` — ゲーム内現在時刻（経過時間算出）
- `calcVisitedCount`, `calcTotalDistance`（`resultPageLogic.js` 再利用）
- `facilityList`（`temporary-database`）

**16:9 シェアカード（id="share-card"）:**

```jsx
<Flex
  id="share-card"
  width="90%"
  sx={{ aspectRatio: "16 / 9" }}
  borderRadius="2vh"
  overflow="hidden"
  padding="4%"
  flexDirection="column"
  justifyContent="space-between"
  backgroundColor={survived ? "var(--color-theme10)" : "var(--color-font10)"}
  color="var(--color-base10)"
>
  {/* 上部: タイトル＋日付 */}
  <Flex justifyContent="space-between">
    <Text className="text-subtext" opacity={0.85}>渋谷歪譚</Text>
    <Text className="text-subtext" opacity={0.85}>{playDate}</Text>
  </Flex>

  {/* 中央: 結果 */}
  <Text
    fontFamily="Dela Gothic One"
    fontSize="5vh"
    textAlign="center"
    color="var(--color-base10)"
  >
    {survived ? "避難成功！" : "避難失敗…"}
  </Text>

  {/* 下部ステータス */}
  <Flex gap="4%" justifyContent="center">
    <Text className="text-maintext">📍 {visitedCount}箇所</Text>
    <Text className="text-maintext">🚶 {totalDistance}km</Text>
    <Text className="text-maintext">⏱ {elapsedHours}時間{elapsedMinutes}分</Text>
  </Flex>

  {/* ハッシュタグ */}
  <Text className="text-subtext" opacity={0.75} textAlign="center">
    #渋谷歪譚  #防災
  </Text>
</Flex>
```

**画像保存ロジック（モバイルフォールバック付き）:**

```js
import html2canvas from "html2canvas";

const [previewUrl, setPreviewUrl] = useState(null);

const handleSave = async () => {
  const el = document.getElementById("share-card");
  const canvas = await html2canvas(el, { scale: 2, useCORS: true });
  const url = canvas.toDataURL("image/png");
  const link = document.createElement("a");
  if (typeof link.download !== "undefined") {
    // デスクトップ: ダウンロード
    link.download = "渋谷歪譚_結果.png";
    link.href = url;
    link.click();
  } else {
    // モバイル: 画像を表示して長押し保存を案内
    setPreviewUrl(url);
  }
};
```

`previewUrl` 設定後: `<img src={previewUrl} />` を表示し「長押しして画像を保存してください」を案内。

**ボタン:**
- 「画像を保存する」: `color="var(--color-theme10)"`, `onClick={handleSave}`
- 「リザルトに戻る」: `color="var(--color-base13)"`, `onClick={() => navigate("/result")}`

### C. App.js — ルート追加

```jsx
import { SharePage } from "./pages/SharePage";

<Route path="/result/share" element={<SharePage />} />
```

---

## テスト項目（目視確認）

| # | 条件 | 確認内容 |
|---|------|---------|
| 1 | ResultPage で SNS ボタンをタップ | `/result/share` に遷移する |
| 2 | 生還プレイの SharePage | カードが赤背景・「避難成功！」・統計が表示される |
| 3 | 失敗プレイの SharePage | カードがダーク背景・「避難失敗…」が表示される |
| 4 | 「画像を保存する」ボタン（デスクトップ） | PNG ファイルがダウンロードされ、16:9 のカード画像になっている |
| 5 | 「画像を保存する」ボタン（iOS Safari） | カード画像が画面上に表示され、長押し保存案内が出る |
| 6 | 「リザルトに戻る」ボタン | `/result` に戻り、Atom データが保持されている（リセットなし） |
| 7 | ResultPage の「タイトルに戻る」 | インディゴ（#393994）で表示される |
| 8 | 「タイトルに戻る」確認ダイアログで OK | Atom リセット後、`/` に遷移する |

---

## 備考

- `Button` コンポーネントの `color` prop は背景色（`isAvailable === true` 時）を指定する
- SharePage は `resetAllAtom` を実行しない（ユーザーはリザルトに戻ってからタイトルに戻る）
- `html2canvas` はカスタムフォント（Rounded Mplus 1c, Dela Gothic One）の描画に注意が必要
  - `scale: 2` + `useCORS: true` でほぼ対応可能。問題がある場合は Canvas API に切り替える
- 将来的に他の SNS（Instagram 等）に対応する場合は SharePage にボタンを追加する拡張設計とする

---

## 作業ログ

### 2026-02-24

**実装完了（v2: ページ遷移 → モーダル・縦長画像に変更）**

- `client/src/components/game-page/ShareModal.jsx`: 新規作成
  - ボトムシート形式のモーダルオーバーレイ（ページ遷移なし）
  - 縦長（9:16）シェアカードプレビュー（50% width・boxShadow付き）
  - Canvas API で 1080×1920 PNG 生成（スマートフォン向け縦長）
  - デスクトップ: ダウンロード / iOS Safari: プレビュー表示 + 長押し案内
  - 暗いオーバーレイ（クリックで閉じる）・ドラッグハンドル・✕ボタン
- `client/src/components/game-page/index.js`: ShareModal を export に追加
- `client/src/pages/ResultPage.jsx`: isShareOpen state 追加、SNS ボタン onClick を setIsShareOpen(true) に変更、ShareModal をレンダリング
- `client/src/App.js`: SharePage import・`/result/share` ルートを削除
- `client/src/pages/SharePage.jsx`: 削除（ShareModal に統合）
- `docs/result-page-spec.md` §3.8・§6 を全面更新（モーダル・9:16 縦長方式）

**仕様更新: html2canvas → Canvas API 方式に変更**

- ユーザー要求: 「html2canvas は不要で構築したい」
- `docs/result-page-spec.md` §6.5 を Canvas API 方式に全面更新
- タスクファイルの実装方針 B を更新

**仕様更新: Twitter Web Intent → 16:9 画像保存方式に変更**

- ユーザー要求: 「16:9 の画像として保存できるだけでよい。SNS に投稿してもらうイメージで」
- SharePage の方式を「Twitter Web Intent」から「html2canvas による画像保存」に変更
- `docs/result-page-spec.md` §6 を全面更新（シェアカード仕様・画像保存ロジック・モバイルフォールバック追加）
- タスクファイルの実装方針 B を更新

**仕様書・タスクファイル初期作成**

- `docs/result-page-spec.md` §3.8 を「ボタン群」に更新（SNS ボタン仕様・タイトルボタン色変更仕様を追記）
- `docs/result-page-spec.md` §6 SNS シェアページを新規追加
- 目次に §6 を追加
- 本タスクファイルを新規作成
