# タスク: RouteMap touchstart [Intervention] 調査・方針策定

## ステータス: ✅ 完了（対応不要と判断）

## 概要

コンソールに出る `[Intervention] Ignored attempt to cancel a touchstart event with cancelable=false`
が ResultPage の RouteMap に影響するか調査し、方針を決定する。

## 調査結果

| 項目 | 内容 |
|------|------|
| 発生元 | `main.js:195`（バンドル済みコード）= Google Maps JavaScript SDK 内部 |
| 原因 | Google Maps SDK が自身の初期化時に passive でない touchstart リスナーを登録し、`cancelable=false` のイベントに `preventDefault()` を呼ぶ |
| コード側の対応可否 | **不可**: アプリコードから SDK 内部の挙動は変更できない |

## 既存の対策

`RouteMap.jsx` には以下のオプションを設定済みで、スクロール干渉は最小化されている。

```js
const MAP_OPTIONS = {
  disableDefaultUI: true,
  gestureHandling: "none",   // ← タッチジェスチャーをマップに渡さない
  clickableIcons: false,
  keyboardShortcuts: false,
};
```

`gestureHandling: "none"` は Google Maps の公式な「地図操作を無効化するオプション」であり、
ユーザーのスクロールがマップに奪われる問題は解消されている。

## 方針

- **アプリコードへの変更は不要**
- 警告は Google Maps SDK の既知の動作であり、機能上の問題は発生していない
- 外部ライブラリ由来の警告として記録し、クローズとする

## 関連

- 仕様書 §4.4.3 RouteMap（gestureHandling オプション記載なし → 実装設計判断）
- task-0223-11: RouteMap 初期実装
