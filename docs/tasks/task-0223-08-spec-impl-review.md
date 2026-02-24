# task-0223-08: 仕様書・実装レビュー ― 齟齬修正

## ステータス
- [ ] 作業中 → ✅ 完了

---

## 目的

2026-02-23 に実施した仕様書 (`result-page-spec.md`) と実装の照合レビューで
発見した 3 件の齟齬を解消する。

---

## 齟齬一覧

| # | 重大度 | 箇所 | 内容 | 対応 |
|---|--------|------|------|------|
| A | 🔴 バグ | `ResultPage.jsx` `buildTimelineData()` | `sns` フィルタが欠落。タイムラインに SNS イベントが表示されない | ResultPage の古いローカル実装を廃止し `resultPageLogic.js` の `buildTimelineData` に差し替え |
| B | 🟡 仕様書内矛盾 | `result-page-spec.md` セクション 3.3 + `StatsSummary.jsx` | データ表・見出しが `"所持金"` → 正しいラベルは `"使用したお金"` | 仕様書データ表・見出しを `"使用したお金"` に統一、StatsSummary.jsx ラベルも更新 |
| C | 🟢 デッドコード | `ActionConfirmDialog.jsx` `formatValue` | `(val) => val` になり何もしない関数 | 関数を削除してインライン化 |

---

## 変更ファイル

| ファイル | 変更種別 |
|----------|----------|
| `client/src/pages/ResultPage.jsx` | 修正（齟齬 A） |
| `docs/result-page-spec.md` | 修正（齟齬 B） |
| `client/src/components/game-page/ActionConfirmDialog.jsx` | 修正（齟齬 C） |

---

## 詳細

### 齟齬 A: ResultPage.jsx の `buildTimelineData` が古い

**問題:**

```js
// ResultPage.jsx (修正前)
return eventDef && (eventDef.type === "walk" || eventDef.type === "epilogue");
// ↑ sns が欠落。SNS イベントがタイムラインに表示されない。
// 返り値に isSns プロパティもない。
```

`resultPageLogic.js` 側は SNS 対応済みだが、ResultPage のローカル定義が更新されていなかった。

**修正:**

ローカル `buildTimelineData` を廃止し、`resultPageLogic.js` からインポートした関数を使用。

```jsx
// 修正後
import { buildTimelineData } from "../utils/resultPageLogic";

const timelineData = buildTimelineData(eventHistory, eventList, facilityList, spotTypeList);
```

不要になったローカル変数 `facilitySignificanceText` も削除。

---

### 齟齬 B: 仕様書データ表・見出しと StatsSummary.jsx のラベルが不一致

**問題:**

仕様書レイアウト図は `"使用したお金"` が正しい仕様。しかし以下の箇所が `"所持金"` になっていた。

- `result-page-spec.md` データソース表の表示項目名
- `result-page-spec.md` 順番記述テキスト
- `result-page-spec.md` 算出ロジック見出し
- `StatsSummary.jsx` `label` プロパティ

**修正:**

上記 4 箇所を `"使用したお金"` に統一。

---

### 齟齬 C: ActionConfirmDialog.jsx の `formatValue` デッドコード

**問題:**

前回の修正（0 のとき ± を外す）により `formatValue = (val) => val` となり、
何もしない関数が残った。

**修正:**

```jsx
// 修正前
const formatValue = (val) => val;
life={formatValue(life)}

// 修正後 (formatValue 削除)
life={life}
```

---

## テスト

- `resultPageLogic.test.js` は変更なし（buildTimelineData のテストは既に resultPageLogic.js を対象としており、全テストPASS維持）
- ResultPage.jsx の変更は既存テストで間接的にカバー済み

