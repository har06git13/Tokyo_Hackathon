# task-0224-02: シェア画像へのルートマップ埋め込み

## ステータス

- [ ] 仕様レビュー・承認待ち
- [ ] 実装
- [ ] テスト（目視確認）
- [ ] 仕様書更新

---

## 目的

`ShareModal.jsx` が生成する 1080×1920 のシェア画像に、プレイヤーの経路（ルートマップ）を埋め込む。
`docs/result-page-spec.md §6` の Canvas レイアウトに「ルートマップ」エリアを追加し、視覚的な共有価値を高める。

---

## 背景

task-0224-01 の実装時、以下の注記を仕様書に残した：

> ⚠️ ルート地図（RouteMap）はキャンバス画像に含めない。Google Maps のスナップショットを Canvas に描画するには Static Maps API が必要であり、**別タスクとする**。

本タスクはその実装を引き受ける。

---

## 要件

1. `visitedFacilitiesAtom` の施設 ID 配列をもとに、**訪問順の経路**を静止画として描画する
2. シェア画像（Canvas 1080×1920）の区切り線③〜ハッシュタグ間（Y=980〜1660 付近）のどこかに配置
3. 外部ライブラリ不使用（あるいは既存 npm パッケージのみ許可）

---

## 実装方針の選択肢

### 案 A: Google Maps Static API（推奨）

Google Maps Static API に `path` パラメータで施設座標を渡し、PNG 画像 URL を生成してキャンバスに描画する。

```js
// 例
const path = visitedFacilities
  .map(id => facilityList.find(f => f.id === id))
  .filter(Boolean)
  .map(f => `${f.coordinates.lat},${f.coordinates.lng}`)
  .join("|");

const url = `https://maps.googleapis.com/maps/api/staticmap?size=920x400&path=color:0xe63946|weight:4|${path}&key=${API_KEY}`;
const mapImg = await loadImage(url);
ctx.drawImage(mapImg, 80, MAP_Y, 920, 400);
```

**メリット:** 既存 Google Maps API キーを再利用可能
**デメリット:** API キーをクライアント側に公開（Referrer 制限が必要）、Static Maps API の有効化が必要

### 案 B: Leaflet + OSM タイル（代替）

`leaflet` + `leaflet-image` で地図をキャンバスに変換する。Static Maps API キー不要。
**デメリット:** `leaflet-image` パッケージ追加が必要、npm install が必要

### 案 C: SVG 手描き（座標→Canvas直描き）

施設座標を Canvas 座標に変換し、背景色のシンプルな地図（ポリライン + 丸マーカー）を自前描画する。
タイル画像なし・API なし・ライブラリなしで実装可能。
**デメリット:** 地図タイル（道路・地形）がなく、見た目がシンプルすぎる

---

## 変更ファイル一覧（予定）

| ファイル | 変更種別 | 内容 |
|----------|----------|------|
| `client/src/components/game-page/ShareModal.jsx` | 修正 | ルートマップエリアの描画処理追加 |
| `docs/result-page-spec.md` §6.5 | 修正 | キャンバスレイアウト表にルートマップ行追加 |

---

## テスト項目

| # | 確認内容 |
|---|---------|
| 1 | シェア画像にルートマップが表示される |
| 2 | 訪問施設が 1 箇所のみ（移動なし）の場合、マップが適切にフォールバック表示される |
| 3 | 画像サイズ・縦横比に問題ない（1080×1920 維持） |

---

## 備考

- `client/public/assets/svg/applogo.svg` と同様に CORS に注意（Static Maps API は `crossOrigin` 設定が必要な場合あり）
- API キーは `.env` の `REACT_APP_GOOGLE_MAPS_API_KEY` を流用する

---

## 作業ログ

### 2026-02-24

- タスクファイル作成
