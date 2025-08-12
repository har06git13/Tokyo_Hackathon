# Google Maps API Setup Instructions

## 1. Google Cloud Console でプロジェクトを作成
1. https://console.cloud.google.com/ にアクセス
2. 新しいプロジェクトを作成

## 2. Google Maps Platform APIs を有効化
必要に応じて以下のAPIを有効化：
- Maps JavaScript API
- Geocoding API
- Places API
- Directions API

## 3. APIキーを作成
1. 「認証情報」→「認証情報を作成」→「APIキー」
2. 作成されたAPIキーをコピー

## 4. APIキーの設定
server/.env ファイルの GOOGLE_MAPS_API_KEY を実際のキーに置き換えてください：

GOOGLE_MAPS_API_KEY=YOUR_ACTUAL_API_KEY_HERE

## 5. APIキーの制限設定（推奨）
- HTTP リファラー制限
- IP アドレス制限  
- API制限

## 6. 使用量制限・課金設定
- 必要に応じて使用量上限を設定
- 課金アカウントを設定
