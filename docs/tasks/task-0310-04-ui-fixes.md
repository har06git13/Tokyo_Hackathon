# タスク: リザルトページ UI 修正

## ステータス: 実装完了（レビュー待ち）

## 背景

レビューで発見された以下の UI バグを修正する。

## 変更内容

### 1. 確認ダイアログを `position: fixed` に変更（ResultPage.jsx）

- 現状: `position="absolute"` のため、スクロール位置によっては画面外にずれる
- 修正: `position="fixed"` に変更（仕様書 §4.10・§12.6）

### 2. ダミー画像を非表示（ResultPage.jsx）

- 現状: `<img src="/assets/image/dummy-result.png" ...>` が表示されている
- 修正: `display: none` で非表示（コード自体は削除しない）

### 3. WorldChoices の sameLabel 改行修正（WorldChoices.jsx）

- 現状: `\n` を含む文字列を `<Text>` に渡しているが React で改行されない
- 修正: `<Text>` に `whiteSpace="pre-line"` を追加して `\n` を改行として扱う

### 4. ResultPage.jsx セクション番号コメントの修正

- 現状: セクション 6・7 が2回ずつ登場し番号が重複
- 修正: 実際のセクション順序（仕様書 §4.1）に合わせてコメントを整番

## 受け入れ条件

- 確認ダイアログがページ最下部スクロール時でも画面中央に表示される
- ダミー画像が画面に表示されない（コードは残存）
- WorldChoices の「同一の最終到達地点\n{施設名}」が2行で表示される
- セクションコメントの番号に重複がない
