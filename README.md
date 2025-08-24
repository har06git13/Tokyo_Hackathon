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
<img src="https://img.shields.io/badge/-React-20232A.svg?logo=react&style=for-the-badge&logoColor=61DAFB">

### バックエンド
<img src="https://img.shields.io/badge/-Node.js-339933.svg?logo=node.js&style=for-the-badge&logoColor=white">
<img src="https://img.shields.io/badge/-Express-000000.svg?logo=express&style=for-the-badge&logoColor=white">

### データベース
<img src="https://img.shields.io/badge/-MongoDB-47A248.svg?logo=mongodb&style=for-the-badge&logoColor=white">


## 環境

| 言語・フレームワーク  | バージョン |
| --------------------- | ---------- |
| React                 | 19.1.0     |
| Node.js               | >=18.x     |
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
│   ├── scripts/        # MongoDB import/seed スクリプト
│   └── package.json
├── package.json        # ルート（ワークスペース管理）
├── .gitignore
└── README.md
```

## 開発環境構築

### client/.env
```
# Clientのポート番号
PORT=3000

# バックエンド API のエンドポイント
REACT_APP_API_URL=http://localhost:4000

# Google Maps API Key
REACT_APP_GOOGLE_MAPS_API_KEY=YOUR_GOOGLE_MAPS_API_KEY
```

### server/.env
```
# Serverのポート番号
PORT=4000

# Google Maps API Key
GOOGLE_MAPS_API_KEY=YOUR_GOOGLE_MAPS_API_KEY

# MongoDB 接続設定
MONGODB_URI=YOUR_MONGODB_URI
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
  {"status":"ok"}
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
- `npm run seed:*` : モックデータ投入  
- `npm run wipe` : DBリセット（注意）  

---

<p align="right">(<a href="#top">トップへ</a>)</p>