# タスク: タイトルに戻るボタンの確認ダイアログをモバイル対応に変更

## ステータス: ✅ 完了

## 概要

`ResultPage` の「タイトルに戻る」ボタンで使用していた `window.confirm()` を、
モバイルブラウザ対応のカスタム確認ダイアログに置換する。

## 背景

### 問題

`window.confirm()` は iOS WKWebView や一部のモバイルブラウザで即 `false` を返すことがある。
ゲームのプレイデータリセットに関わる操作のため、誤動作は致命的。

```js
// 現状（ResultPage.jsx:145）
const ok = window.confirm("これまでのプレイデータは削除されます。\n本当に最初からやり直しますか？");
```

### 仕様根拠

仕様書 §4.9.2:
> 動作: 確認ダイアログ -> `resetAllAtom` -> `/` へ遷移

「確認ダイアログ」の実装方式は仕様書では未定義だが、モバイル動作を保証する手段として
ネイティブ API（window.confirm）は不適切。

## 実装方針

- 既存コードベースのオーバーレイパターン（ShareModal と同様）を踏襲し、Flex ベースのカスタムダイアログを実装
- 新規コンポーネントは作成せず ResultPage.jsx 内に inline で実装（単一箇所の利用のため）
- Chakra UI v3 のプリミティブ（Flex, Text, Box）+ 既存カスタム Button を使用

## 実装手順

### Step 1: ResultPage.jsx に確認ダイアログ state を追加

```js
const [isConfirmOpen, setIsConfirmOpen] = useState(false);
```

### Step 2: handleReturnToTitle を変更

```js
// 変更前
const handleReturnToTitle = () => {
  const ok = window.confirm("…");
  if (ok) {
    setAll();
    navigate("/");
  }
};

// 変更後
const handleReturnToTitle = () => {
  setIsConfirmOpen(true);
};

const handleConfirmReset = () => {
  setIsConfirmOpen(false);
  setAll();
  navigate("/");
};
```

### Step 3: 確認ダイアログ JSX を page-container 直下に追加

ShareModal と同じ構造（position="absolute" オーバーレイ）で実装する。

## 変更ファイル

| ファイル | 変更内容 |
|----------|---------|
| `client/src/pages/ResultPage.jsx` | window.confirm() 削除、confirmダイアログ state + JSX 追加 |

## 実装チェックリスト

- [ ] `isConfirmOpen` state 追加
- [ ] `handleReturnToTitle` を setIsConfirmOpen(true) に変更
- [ ] `handleConfirmReset` 追加（resetAllAtom + navigate）
- [ ] 確認ダイアログ JSX 追加（オーバーレイ形式）
- [ ] 動作確認: モバイルでキャンセルが機能する
- [ ] 動作確認: 「やり直す」でリセット + タイトル遷移

## 関連

- 仕様書 §4.9 ボタン群
- task-0222-01: ResultPage 初期実装
