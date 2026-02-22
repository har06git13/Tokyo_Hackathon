# Task 1: 結果ヘッダーの動的テキスト化

> 仕様: [../result-page-spec.md](../result-page-spec.md) セクション 1

## ステータス: ✅ 完了

## 対象ファイル

- `client/src/pages/ResultPage.jsx`
- `client/src/atoms/playerAtoms.js`

## 内容

- `criticalReasonAtom` を読み取り、対応テキストを動的に表示
- `survived` による成功/失敗テキストの切り替え（既存の改善）
- ダミー画像の削除
- 🔴 **バグ修正**: `criticalReasonAtom` の初期値を `"lowHealth"` → `"lowLife"` に修正
- 🔴 **バグ修正**: `resetAllAtom` に `criticalReasonAtom` のリセットを追加

## レビューポイント

- テキスト対応表が正しく実装されているか
- Atom の読み取りが正しいか
- `criticalReasonAtom` の初期値が `"lowLife"` に統一されているか
- `resetAllAtom` で `criticalReasonAtom` がリセットされるか

## 作業ログ

### playerAtoms.js
- `criticalReasonAtom` の初期値を `"lowHealth"` → `"lowLife"` に修正
- `resetAllAtom` 内のリセット値も `"lowLife"` に統一

### ResultPage.jsx
- `criticalReasonAtom` を import・読み取り追加
- `flavorTextMap` / `getFlavorText` を定義し、`survived` × `criticalReason` で動的テキスト表示
- 成功時: 一律テキスト / 失敗時: `lowLife`, `timeup` で分岐 + フォールバック
- ハードコードされていたフレーバーテキストを置き換え
- Chakra `Image` → HTML `<img>` に変更（Chakra UI v3 の不具合回避）、配置をフレーバー文の直下に移動
- ヘッダー `currentPage` を `""` → `"結果発表"` に変更
- 成功時テキストを元の全文に復元（「電源確保・現金取得・人とのつながり…」部分を含む）
