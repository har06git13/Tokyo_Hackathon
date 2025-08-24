# Tokyo_Hackathon

<div id="top"></div>

## 目次
- [Tokyo\_Hackathon](#tokyo_hackathon)
  - [目次](#目次)
  - [プロジェクト名](#プロジェクト名)
  - [プロジェクトについて](#プロジェクトについて)
  - [使用技術一覧](#使用技術一覧)
    - [バックエンド](#バックエンド)
    - [フロントエンド](#フロントエンド)
    - [データベース](#データベース)
    - [インフラ / デプロイ](#インフラ--デプロイ)
  - [環境](#環境)
  - [ディレクトリ構成](#ディレクトリ構成)
  - [開発環境構築](#開発環境構築)
    - [1. 環境変数テンプレートファイルをコピー](#1-環境変数テンプレートファイルをコピー)
    - [2. 依存関係のインストール \& 起動](#2-依存関係のインストール--起動)
  - [コマンド一覧](#コマンド一覧)
    - [ルート](#ルート)
    - [client](#client)
    - [server](#server)

## プロジェクト名
**リアル災害サバイバルゲーム『渋谷歪譚（しぶやわいたん）』**

## プロジェクトについて
本プロジェクトは、[都知事杯オープンデータ・ハッカソン 2025](https://odhackathon.metro.tokyo.lg.jp/) 応募作品です。  

**『渋谷歪譚』**は、実際の渋谷を舞台にした防災シミュレーションゲームアプリです。  
災害発生直後からの 6〜12 時間（ゲーム内時間）を生き延びる過程で、**防災オープンデータや街の構造を活用した行動選択**を体験できます。  

## 使用技術一覧

### バックエンド
<img src="https://img.shields.io/badge/-Node.js-339933.svg?logo=node.js&style=for-the-badge&logoColor=white">
<img src="https://img.shields.io/badge/-Express-000000.svg?logo=express&style=for-the-badge&logoColor=white">
<img src="https://img.shields.io/badge/-Django-092E20.svg?logo=django&style=for-the-badge&logoColor=white">
<img src="https://img.shields.io/badge/-DRF-FF1709.svg?logo=django&style=for-the-badge&logoColor=white">

### フロントエンド
<img src="https://img.shields.io/badge/-React-20232A.svg?logo=react&style=for-the-badge&logoColor=61DAFB">
<img src="https://img.shields.io/badge/-Next.js-000000.svg?logo=next.js&style=for-the-badge&logoColor=white">

### データベース
<img src="https://img.shields.io/badge/-MongoDB-47A248.svg?logo=mongodb&style=for-the-badge&logoColor=white">
<img src="https://img.shields.io/badge/-MySQL-4479A1.svg?logo=mysql&style=for-the-badge&logoColor=white">

### インフラ / デプロイ
<img src="https://img.shields.io/badge/-Docker-2496ED.svg?logo=docker&style=for-the-badge&logoColor=white">
<img src="https://img.shields.io/badge/-Terraform-623CE4.svg?logo=terraform&style=for-the-badge&logoColor=white">
<img src="https://img.shields.io/badge/-Render-46E3B7.svg?logo=render&style=for-the-badge&logoColor=white">

## 環境

| 言語・フレームワーク  | バージョン |
| --------------------- | ---------- |
| Python                | 3.11.4     |
| Django                | 4.2.1      |
| Django Rest Framework | 3.14.0     |
| MySQL                 | 8.0        |
| Node.js               | 16.17.0    |
| React                 | 18.2.0     |
| Next.js               | 13.4.6     |
| Terraform             | 1.3.6      |

その他のパッケージのバージョンは pyproject.toml と package.json を参照してください

<p align="right">(<a href="#top">トップへ</a>)</p>

## ディレクトリ構成

```

Tokyo\_Hackathon/
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
### 1. 環境変数テンプレートファイルをコピー

```bash
cp .env.example .env
cp server/.env.example server/.env
cp client/.env.example client/.env
```

### 2. 依存関係のインストール & 起動

**ルートで一括で起動**（`concurrently` 使用）

```bash
npm install
npm start
```

**個別に起動**

```bash
# サーバー
cd server
npm install
npm start

# クライアント
cd ../client
npm install
npm start
```

## コマンド一覧
### ルート

* `npm start` : client & server 同時起動
* `npm run client` : client のみ起動
* `npm run server` : server のみ起動

### client

* `npm start` : React 開発サーバ起動
* `npm run build` : プロダクションビルド
* `npm test` : テスト実行

### server

* `npm start` : Express サーバ起動
* `npm run seed:*` : モックデータ投入
* `npm run wipe` : DBリセット（注意）

<p align="right">(<a href="#top">トップへ</a>)</p>