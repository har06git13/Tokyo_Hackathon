# task-0223-11: 移動ルートセクションの追加（ミニマップ＋直線ポリライン）

## ステータス
- [x] 仕様レビュー待ち → B案（ミニマップ＋直線ポリライン）で承認
- [x] 実装
- [x] テスト
- [x] 仕様書更新

---

## 作業ログ

### 2026-02-24

**UI改善: 余白削減・マップ横長化**

#### 変更内容

| ファイル | 変更内容 |
|----------|----------|
| `client/src/components/game-page/StatsSummary.jsx` | RouteMap ラッパー Box の `px="4%"` を削除（カード本体 paddingX と二重になっていたため）。`mapBorderRadius` を `"1vh"` に修正（仕様準拠）。未使用 `Box` import を削除 |
| `client/src/components/game-page/RouteMap.jsx` | マップ高さを `30vh` → `22vh` に変更（モバイルで約16:9の横長比率）。フォールバック・ローディング・エラー表示の高さも同様に変更。`my="2vh"` をすべて削除（StatsSummary の `gap` が縦間隔を管理するため不要）。`fitBounds` padding を `top:60→40, right/bottom/left:40→30` に縮小（高さ縮小に対応） |
| `docs/result-page-spec.md` | §3.4「移動ルート」廃止セクションを全削除し §3.5〜3.10 を §3.4〜3.9 に繰り上げ。§3.3 の地図高さ仕様を `30vh` → `22vh` に更新 |

#### 技術的判断

- **二重 padding の除去**: `StatsSummary` の Flex body が `paddingX="4%"` を持つため、RouteMap ラッパーへの追加 `px="4%"` はマップを実効幅の約84%に縮めていた。削除により仕様どおり「paddingはカード内で統一」を実現
- **高さ `22vh` の根拠**: モバイル画面（390px幅想定）でのカード実効幅 ≈ 323px に対し、30vh (≈253px) は比率1.28:1でほぼ正方形。22vh (≈186px) は比率1.74:1で16:9相当の横長表示を実現
- **`fitBounds` padding 縮小**: top:60→40 は高さ縮小（253→186px）に比例した調整。余白が過大になりポリラインが小さく見えることを防ぐ

---

### 2026-02-23

**実装完了**

#### 作成・変更ファイル

| ファイル | 変更内容 |
|----------|----------|
| `client/src/components/game-page/RouteMap.jsx` | 新規作成 |
| `client/src/components/game-page/index.js` | `RouteMap` を export に追加 |
| `client/src/pages/ResultPage.jsx` | `RouteMap` を import・セクション3.4に配置、セクション番号コメントを4→5（ゲージ推移）、5→6（生死）に更新 |
| `docs/result-page-spec.md` | § 3.4 をリスト表示→ミニマップ仕様に全面更新、§ 3.5〜3.10 に番号繰り下げ |
| `docs/tasks/task-0223-11-route-timeline.md` | タスク名・方針・変更ファイルをB案に更新 |

#### 技術的判断

- **`useJsApiLoader` の id**: ゲームページの `GoogleMapComponent` と同じ `'google-map-script'` を使用。  
  ゲームページで Maps JS API が読み込み済みの場合はキャッシュを再利用するため二重ロードなし。
- **`libraries`**: `ROUTE_MAP_LIBRARIES = []` をコンポーネント外で定義（レンダリング毎の配列再生成を防止）
- **マーカーアイコン**: `GoogleMapComponent` と同じ `MAPMARKER_SVG_PATH` を使用して視覚的一貫性を確保
- **`gestureHandling: "none"`**: リザルト画面は静的表示のためユーザー操作不要
- **`geodesic: false`**: 渋谷近辺の短距離なので大円補正不要（直線で十分）

#### テスト結果

- `resultPageLogic.test.js`: **67/67 PASS**（変更なし・既存テスト維持）
- ESLint エラー: **0件**（RouteMap.jsx・ResultPage.jsx 両方）

---

## 目的

リザルトページに「移動ルート」セクション（3.4）を追加。
Google Maps 上にマーカーと直線ポリラインでプレイヤーの移動経路を表示する。

**方針: B案（ミニマップ＋直線ポリライン）**
- Directions API 不使用（追加課金・GCP設定不要）
- 既存の `REACT_APP_GOOGLE_MAPS_API_KEY` + `@react-google-maps/api` を利用
- 施設間を直線（`Polyline`）で接続。道路沿いではない

---

## 仕様

詳細は `docs/result-page-spec.md` § 3.4 を参照。

### 表示仕様

```
[マップカード]
│ Google Maps (zoom:14, disableDefaultUI)
│  - スタートマーカー: テーマ色
│  - 中間マーカー: #f4a261（ツールチップに施設名）
│  - ゴールマーカー: #e63946（赤）
│  - Polyline: #e63946, strokeWeight:4, 訪問順に直線
```

### マーカー色

| 施設 | 色 |
|------|------|
| スタート（fac_000） | `var(--color-theme10)` |
| 中間施設 | `#f4a261` |
| ゴール（最終施設） | `#e63946` |

### フォールバック

- 条件: `visitedFacilities.length <= 1`
- 表示: 「移動記録がありません」（`text-maintext`, `color="var(--color-base13)"`）

---

## 変更ファイル

| ファイル | 変更種別 |
|----------|----------|
| `client/src/components/game-page/RouteMap.jsx` | 新規作成 |
| `client/src/components/game-page/index.js` | 修正（`RouteMap` を export に追加） |
| `client/src/pages/ResultPage.jsx` | 修正（`RouteMap` を import して 3.4 に配置） |
| `docs/result-page-spec.md` | 更新済み（§ 3.4 ミニマップ仕様） |

---

## 実装方針

### `RouteMap.jsx`

```jsx
RouteMap.propTypes = {
  visitedFacilities: PropTypes.arrayOf(PropTypes.string).isRequired,
  facilityList: PropTypes.array.isRequired,
};
```

**コアロジック:**
1. `visitedFacilities` から座標配列を作成（`facilityList` で解決）
2. `useJsApiLoader`（id: `'google-map-script'`）で Maps JS API 読み込み
3. `<GoogleMap>` に `disableDefaultUI: true`、`zoom: 14`
4. `<Marker>` で各施設を色分け表示
5. `<Polyline>` で訪問順に直線接続
6. フォールバック: `visitedFacilities.length <= 1` → 「移動記録がありません」

**`useJsApiLoader` 注意点:**
- `id: 'google-map-script'` はゲームページの `GoogleMapComponent` と共通
- `libraries` はコンポーネント外で定義（レンダリング毎の配列再生成を防ぐ）

### `ResultPage.jsx` への組み込み

```jsx
import { ..., RouteMap } from "../components/game-page";

// StatsSummary の直後（3.4 セクション）
<RouteMap
  visitedFacilities={visitedFacilities}
  facilityList={facilityList}
/>
```

---

## テスト項目

目視確認テスト（Maps JS API のモックが複雑なためユニットテスト不要）。

| # | テスト内容 | 期待値 |
|---|-----------|--------|
| 1 | fac_000 のみ → フォールバック | 「移動記録がありません」 |
| 2 | fac_000 + fac_005 → マップ表示 | マーカー2個＋ポリライン1本 |
| 3 | fac_000 + fac_001 + fac_005 → マップ表示 | マーカー3個＋ポリライン2本 |

---

## 備考

- 将来的に Directions API（道路沿いルート）にアップグレード可能な設計にする
- セクション間隔: `mt="2vh"`
- マップ高さ: `30vh`
