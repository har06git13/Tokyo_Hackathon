# Task 3: 行動タイムラインコンポーネント作成

> 仕様: [../result-page-spec.md](../result-page-spec.md) セクション 4

## ステータス: ⬜ 未着手

## 対象ファイル

- `client/src/components/game-page/ResultTimelineItem.jsx`（新規）
- `client/src/pages/ResultPage.jsx`

## 内容

- `eventHistoryAtom` からイベントIDと時刻を取得
- **施設**: `/api/facilities` で一括取得 → IDでインデックス化
- **イベント**: `/api/events/:id` を `Promise.all` で並列取得（ResultPageマウント時に1回だけ）
- 取得済みデータを `ResultTimelineItem` に props で渡す（子コンポーネントから個別APIを呼ばない）
- 時系列でイベントを一覧表示
- 履歴0件時は「行動履歴がありません」と表示

## レビューポイント

- API 呼び出しが `Promise.all` によるバッチ取得になっているか
- 子コンポーネントから個別APIを呼んでいないか
- エラーハンドリング（API 失敗時の表示）
- `LogElement` との重複を最小化できているか

## 作業ログ

> （着手時に記録）
