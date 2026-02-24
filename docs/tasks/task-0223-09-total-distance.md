# task-0223-09: 総移動距離を訪問施設座標から直線距離で算出

## ステータス
- [x] 実装完了

---

## 目的

プレイ統計の「総移動距離」を暫定値（`"— km"`）から実際の計算値に変更する。
ルート検索・マップAPIは使用せず、`facilityList` の座標データを使って
訪問施設間の直線距離（Haversine）で算出する。

---

## 仕様

### アルゴリズム

Haversine 式による大円距離（地球曲率考慮）:

$$
d = 2R \cdot \arctan2\!\left(\sqrt{a},\, \sqrt{1-a}\right)
$$

$$
a = \sin^2\!\left(\frac{\Delta\phi}{2}\right)
  + \cos\phi_1 \cdot \cos\phi_2 \cdot \sin^2\!\left(\frac{\Delta\lambda}{2}\right)
$$

- $R = 6371$ km（地球半径）
- $\phi$: 緯度（ラジアン）、$\lambda$: 経度（ラジアン）

### 計算対象

- `visitedFacilitiesAtom`（訪問順の施設ID配列）の隣接ペアを順に加算
- 例: `["fac_000", "fac_001", "fac_003"]` → `d(000→001) + d(001→003)`
- 施設が `facilityList` に存在しない場合はそのセグメントをスキップ
- 1施設以下の場合は `0` を返す

### 表示

- 小数点1桁で丸め（`Math.round(total * 10) / 10`）
- 表示: `"X.X km"`
- 0.0 の場合は `"0.0 km"`

---

## 変更ファイル

| ファイル | 変更種別 |
|----------|----------|
| `client/src/utils/resultPageLogic.js` | 追加（`calcTotalDistance` 関数） |
| `client/src/pages/ResultPage.jsx` | 修正（`calcTotalDistance` を呼び出し） |
| `client/src/__tests__/resultPageLogic.test.js` | 追加（テスト 6件） |
| `docs/result-page-spec.md` | 修正（セクション 3.3 暫定注記を実装内容に更新） |

---

## テスト項目

| テスト名 | 期待値 |
|----------|--------|
| 空配列 → 0 | `0` |
| 1施設のみ → 0 | `0` |
| fac_000→fac_001 の距離 | 約 0.2 km（0.1〜0.4の範囲） |
| 存在しない施設ID → スキップして計算継続 | `0` |
| fullPlayVisitedFacilities の合計 | 正の数かつ 10km 未満 |
| 同一施設が連続（重複訪問なし）しても同値 | 正の数 |

