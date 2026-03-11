# Tokyo_Hackathon

<div id="top"></div>

## 目次
- [Tokyo\_Hackathon](#tokyo_hackathon)
  - [目次](#目次)
  - [プロジェクト名](#プロジェクト名)
  - [プロジェクトについて](#プロジェクトについて)
  - [使用技術一覧](#使用技術一覧)
    - [フロントエンド](#フロントエンド)
    - [バックエンド](#バックエンド)
    - [データベース](#データベース)
  - [環境](#環境)
  - [ディレクトリ構成](#ディレクトリ構成)
  - [開発環境構築](#開発環境構築)
    - [client/.env](#clientenv)
    - [server/.env](#serverenv)
    - [依存関係のインストール](#依存関係のインストール)
    - [動作確認](#動作確認)
  - [コマンド一覧](#コマンド一覧)
    - [ルート](#ルート)
    - [client](#client)
    - [server](#server)

## プロジェクト名
リアル災害サバイバルゲーム『渋谷歪譚（しぶやわいたん）』

## プロジェクトについて
本プロジェクトは、[都知事杯オープンデータ・ハッカソン 2025](https://odhackathon.metro.tokyo.lg.jp/) 応募作品です。

『渋谷歪譚』は、実際の渋谷を舞台にした防災シミュレーションゲームアプリです。
災害発生直後からの 6〜12 時間（ゲーム内時間）を生き延びる過程で、防災オープンデータや街の構造を活用した行動選択を体験できます。

## 使用技術一覧

### フロントエンド
<p style="display: inline">
<img src="https://img.shields.io/badge/-React-20232A.svg?logo=react&style=for-the-badge&logoColor=61DAFB">
<img src="https://img.shields.io/badge/-Chakra UI-319795.svg?logo=chakraui&style=for-the-badge&logoColor=white">
<img src="https://img.shields.io/badge/-Leaflet-199900.svg?logo=leaflet&style=for-the-badge&logoColor=white">
<img src="https://img.shields.io/badge/-Firebase-FFCA28.svg?logo=firebase&style=for-the-badge&logoColor=black">
<img src="https://img.shields.io/badge/-Framer Motion-0055FF.svg?logo=framer&style=for-the-badge&logoColor=white">
</p>

### バックエンド
<p style="display: inline">
<img src="https://img.shields.io/badge/-Node.js-339933.svg?logo=node.js&style=for-the-badge&logoColor=white">
<img src="https://img.shields.io/badge/-Express-000000.svg?logo=express&style=for-the-badge&logoColor=white">
<img src="https://img.shields.io/badge/-Google Gemini-8E75B2.svg?logo=googlegemini&style=for-the-badge&logoColor=white">
</p>

### データベース
<p style="display: inline">
<img src="https://img.shields.io/badge/-MongoDB-47A248.svg?logo=mongodb&style=for-the-badge&logoColor=white">
</p>


## 環境

| 言語・フレームワーク  | バージョン |
| --------------------- | ---------- |
| React                 | 19.1.0     |
| Chakra UI             | 3.x        |
| Leaflet               | 1.9.4      |
| Node.js               | >=18.x     |
| Express               | 5.x        |
| MongoDB               | >=6.0      |

その他の依存パッケージは各 `package.json` を参照してください。

## ディレクトリ構成

```
Tokyo_Hackathon/
├── client/             # フロントエンド（React）
│   ├── public/         # 静的アセット
│   ├── src/
│   │   ├── components/ # UIコンポーネント
│   │   ├── pages/      # ページコンポーネント
│   │   ├── atoms/      # Jotai グローバル状態管理
│   │   ├── hooks/      # カスタムフック
│   │   ├── utils/      # ユーティリティ関数
│   │   └── temporary-database/ # 開発用モックデータ
│   └── package.json
├── server/             # バックエンド（Node/Express API）
│   ├── index.js        # エントリポイント
│   ├── adviceService.js # Gemini AI アドバイス生成
│   ├── knowledge/      # Gemini に渡す防災知識ファイル
│   ├── scripts/        # MongoDB import/seed スクリプト
│   └── package.json
├── package.json        # ルート（ワークスペース管理）
├── .gitignore
└── README.md
```

## 開発環境構築

### client/.env
`client/.env.example` をコピーして `client/.env` を作成し、値を設定してください。

```
# クライアントのポート番号
PORT=3000

# バックエンド API のエンドポイント
REACT_APP_API_URL=http://localhost:4000

# Google Maps JavaScript API Key（地図機能で使用する場合）
REACT_APP_GOOGLE_MAPS_API_KEY=取得したAPIキーをここに貼り付け

# 開発環境で HTTPS を有効にする（位置情報APIなどに必要）
HTTPS=true

# 本番ビルドでソースマップを無効化
GENERATE_SOURCEMAP=false

# 開発時のホストチェック無効化（ngrok等のトンネル利用時に必要）
DANGEROUSLY_DISABLE_HOST_CHECK=true
```

### server/.env
`server/.env.example` をコピーして `server/.env` を作成し、値を設定してください。

```
# サーバーのポート番号
PORT=4000

# MongoDB 接続URI
MONGODB_URI=mongodb+srv://<ユーザー名>:<パスワード>@<クラスター>.mongodb.net/?retryWrites=true&w=majority

# Gemini API Key（防災アドバイス生成用 / Google AI Studio で取得）
# 未設定時はルールベースフォールバックのみ動作
GEMINI_API_KEY=取得したAPIキーをここに貼り付け
```

### 依存関係のインストール

**ルートで一括起動**（`concurrently` 使用）
```
npm install
npm start
```

**個別に起動**
```
# サーバー
cd server
npm install
npm start

# クライアント
cd ../client
npm install
npm start
```

### 動作確認

- フロントエンド
  → http://localhost:3000 にアクセスしてトップページが表示されれば成功。

- バックエンド（API サーバ）
  → http://localhost:4000/api/health にアクセスして
  ```json
  {"ok":true}
  ```
  が返れば成功。


## コマンド一覧

### ルート
- `npm start` : client & server 同時起動
- `npm run client` : client のみ起動
- `npm run server` : server のみ起動

### client
- `npm start` : React 開発サーバ起動
- `npm run build` : プロダクションビルド
- `npm test` : テスト実行

### server
- `npm start` : Express サーバ起動
- `npm run seed:all` : 施設・イベント・SNS データを一括投入
- `npm run seed:facilities` : 施設データのみ投入
- `npm run seed:events` : イベントデータのみ投入
- `npm run seed:sns` : SNS 投稿データのみ投入
- `npm run wipe` : DB リセット（注意）

<p align="right">(<a href="#top">トップへ</a>)</p>
