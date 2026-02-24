# タスク: 生死を分けた選択 + 生存のヒント 改修

## ステータス: ✅ 完了

## 概要

リザルトページのセクション5「生死を分けた選択」とセクション6「生存のヒント」を仕様に合わせて改修する。

### 変更点サマリー

| セクション | 変更内容 |
|-----------|---------|
| セクション5（生死を分けた選択） | 意義テキストの文字スタイルを `text-subtext`（グレー）→ `text-maintext`（黒）に変更 |
| セクション6（生存のヒント） | ヒント生成ロジックを刷新。施設訪問有無で内容が変わる双方向ヒント + フォールバック追加。ヒントは常に1件以上表示 |

---

## 背景

### セクション5 の問題

現在の `ResultTimelineItem.jsx` では意義テキスト（「電源を確保。精神を回復し、...」等）が
`text-subtext` + グレー色で表示されている。
ヘッダーやアクション名と同じフォントサイズ・黒文字に揃えることで可読性を向上させる。

### セクション6 の問題

現在のヒント生成ロジックは「条件を満たさなかった場合のみヒントを表示」するため、
全施設を訪問してゲージも十分な「完璧プレイ」では0件になり、
「防災へのヒントがこのプレイには含まれていません」と表示される。

**新仕様:** 
- 行動（訪問）に対して必ずヒントを生成（訪問した → ポジティブ確認、未訪問 → 反省）
- ヒントは常に1件以上表示（フォールバックで保証）

---

## 実装手順

### Step 1: ResultTimelineItem.jsx - 意義テキストのスタイル変更

**ファイル:** `client/src/components/game-page/ResultTimelineItem.jsx`

```jsx
// 変更前
<Text className="text-subtext" color="var(--color-base13)">
  {significanceText}
</Text>

// 変更後
<Text className="text-maintext">
  {significanceText}
</Text>
```

`color` prop を削除してデフォルト黒にする。`text-subtext` → `text-maintext` に変更。

---

### Step 2: ResultPage.jsx - facilityHintMap の追加と buildHints() 改修

**ファイル:** `client/src/pages/ResultPage.jsx`

#### 追加: facilityHintMap 定数

`facilitySignificanceText` 定数の近くに追加する。

```js
// 施設ベースのヒント（訪問有無で内容が変わる）
const facilityHintMap = {
  fac_001: {
    visited: "充電スポットを確保しました！停電時でもスマートフォンが使えるよう、日頃からモバイルバッテリーを満充電にしておきましょう。",
    notVisited: "モバイルバッテリーを持ち歩いていれば、電源を心配する場面を減らせたかもしれない。",
  },
  fac_003: {
    visited: "食料と現金を確保しました！非常時に備えて、水・非常食（3日分）と現金を日頃から備蓄しておきましょう。",
    notVisited: "現金があれば、キャッシュレス決済が使えなくなっても慌てずに済んだかもしれない。",
  },
};

// フォールバック（上記すべてが0件の場合のみ使用）
const fallbackHints = [
  "防災用品（非常食・水・懐中電灯・現金）を定期的に点検し、家族との連絡方法や避難場所を事前に確認しておきましょう。",
];
```

#### 変更: buildHints() 関数

```js
// 変更前
const buildHints = () => {
  const hints = [];
  if (!visitedFacilities.includes("fac_003")) {
    hints.push("現金があれば、...");
  }
  if (!visitedFacilities.includes("fac_001")) {
    hints.push("モバイルバッテリーを持ち歩いていれば、...");
  }
  if (money === 0) { hints.push("..."); }
  if (charge === 0) { hints.push("..."); }
  if (mental < 30) { hints.push("..."); }
  return hints;
};

// 変更後
const buildHints = () => {
  const hints = [];

  // ① 施設ベースのヒント（訪問有無で内容が変わる）
  for (const [facilityId, { visited, notVisited }] of Object.entries(facilityHintMap)) {
    hints.push(visitedFacilities.includes(facilityId) ? visited : notVisited);
  }

  // ② ゲージ条件ヒント（変更なし）
  if (money === 0) hints.push("小銭を常に持ち歩いていれば、緊急時の行動選択肢が広がったかもしれない。");
  if (charge === 0) hints.push("スマートフォンの充電を日ごろから心がけていれば、情報収集が途絶えなかったかもしれない。");
  if (mental < 30) hints.push("複数の避難場所を事前に把握していれば、精神的な余裕が生まれたかもしれない。");

  // ③ フォールバック
  return hints.length > 0 ? hints : fallbackHints;
};
```

#### 変更: ヒントのフォールバック表示 JSX を削除

```jsx
// 変更前
{hintsData.length > 0 ? (
  hintsData.map(...)
) : (
  <Text className="text-maintext" color="var(--color-base13)">
    防災へのヒントがこのプレイには含まれていません
  </Text>
)}

// 変更後（hintsData は常に1件以上なので三項演算子不要）
{hintsData.map((hint, index) => (
  <Text key={index} className="text-maintext">
    {hint}
  </Text>
))}
```

---

### Step 3: テスト更新

**ファイル:** `client/src/__tests__/resultPageLogic.test.js`

既存の「防災へのヒント」テストを更新する。

```js
describe("buildHints - 施設ベースのヒント", () => {
  test("fac_001 訪問済みの場合、ポジティブヒントが含まれる", () => {
    // facilityHintMap.fac_001.visited を確認
  });

  test("fac_001 未訪問の場合、反省ヒントが含まれる", () => {
    // facilityHintMap.fac_001.notVisited を確認
  });

  test("fac_003 訪問済み + fac_001 訪問済み + ゲージ正常 → ポジティブヒント2件表示される", () => {
    // facilityHintMap の visited ヒントが2件
  });

  test("全条件が該当しない場合、フォールバックが返る", () => {
    // facilityHintMap が空 + ゲージ正常 → fallbackHints
  });
});
```

---

## 変更ファイル一覧

| ファイル | 変更内容 |
|----------|---------|
| `client/src/components/game-page/ResultTimelineItem.jsx` | 意義テキストを `text-maintext`・黒に変更 |
| `client/src/pages/ResultPage.jsx` | `facilityHintMap` 追加、`buildHints()` 改修、フォールバックJSX削除 |
| `client/src/__tests__/resultPageLogic.test.js` | 施設ベースヒントのテスト追加・既存テスト更新 |
| `docs/result-page-spec.md` | セクション5・6 の仕様更新（✅ 完了） |

---

## 実装チェックリスト

- [x] ResultTimelineItem.jsx: 意義テキストのスタイル変更
- [x] ResultPage.jsx: `facilityHintMap` 定数追加
- [x] ResultPage.jsx: `buildHints()` ロジック改修
- [x] ResultPage.jsx: ヒント表示 JSX のフォールバック削除
- [x] resultPageLogic.test.js: 施設ベースヒントのテスト追加
- [x] 全テスト PASS 確認（55/55）
- [ ] 手動確認: fac_001 訪問済みプレイで「充電スポットを確保しました！」が表示される
- [ ] 手動確認: fac_001 未訪問プレイで「モバイルバッテリーを持ち歩いていれば」が表示される

---

## 期待される結果

### セクション5
```
14:30
モバイルバッテリースタンドへ移動  ← 赤太字（変更なし）
地点：CHARGESPOT HUB 渋谷センター街店  ← グレー（変更なし）
電源を確保。精神を回復し、...  ← 黒 text-maintext（変更）
```

### セクション6（fac_001 訪問済み、fac_003 未訪問の場合）
```
防災に向けて～生存のヒント～

充電スポットを確保しました！停電時でもスマートフォンが使えるよう、日頃からモバイルバッテリーを満充電にしておきましょう。

現金があれば、キャッシュレス決済が使えなくなっても慌てずに済んだかもしれない。
```

### セクション6（全施設訪問・ゲージ正常の完璧プレイ）
```
防災に向けて～生存のヒント～

充電スポットを確保しました！...
食料と現金を確保しました！...
```

---

## 関連タスク

- task-0223-05: money 単位正規化（完了）
- task-0223-06: gaugeSteps 段階的ゲージ変動（完了）
- task-0222-04: タイムライン初期実装（完了）
- task-0222-05: ヒントセクション初期実装（完了）
