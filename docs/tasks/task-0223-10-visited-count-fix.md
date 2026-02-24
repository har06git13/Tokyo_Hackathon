# task-0223-10: 訪問施設数からスタート地点を除外

## ステータス
- [x] 実装完了

---

## 目的

`visitedFacilitiesAtom` の初期値に `"fac_000"`（渋谷駅前＝スタート地点）が自動追加されており、
`visitedCount` が常に +1 されている問題（旧 Issue D）を解消する。

プレイヤーが **選択して** 訪問した施設のみをカウントするよう修正する。

---

## 仕様

| 項目 | 内容 |
|------|------|
| 対象 | `visitedFacilitiesAtom` の配列から `"fac_000"` を除外してカウント |
| 理由 | `fac_000`（渋谷駅前）はゲーム開始時に自動セットされる初期値。プレイヤーが選んだ行動ではない |
| 距離計算 | `calcTotalDistance` はスタート地点を起点に計算するため `fac_000` を **引き続き使用** |
| 実装箇所 | `resultPageLogic.js` に `calcVisitedCount` を追加、`ResultPage.jsx` で呼び出し |

---

## 変更ファイル

| ファイル | 変更種別 |
|----------|----------|
| `client/src/utils/resultPageLogic.js` | 追加（`calcVisitedCount` 関数） |
| `client/src/pages/ResultPage.jsx` | 修正（`calcVisitedCount` を使用） |
| `client/src/__tests__/resultPageLogic.test.js` | 追加（テスト 3件） |
| `docs/result-page-spec.md` | 修正（Issue D を ✅ 修正済みに変更・データソース説明更新） |

---

## テスト項目

| テスト名 | 入力 | 期待値 |
|----------|------|--------|
| fac_000 のみ（未プレイ相当）→ 0 | `["fac_000"]` | `0` |
| フルプレイ: fac_000 を除く 4 施設 | `["fac_000","fac_001","fac_003","fac_004","fac_005"]` | `4` |
| fac_000 なしの配列はそのままカウント | `["fac_001","fac_003"]` | `2` |
