# Tokyo_Hackathon

<div id="top"></div>

## 使用技術一覧

<!-- シールド一覧 -->
<p style="display: inline">
  <!-- バックエンド -->
  <img src="https://img.shields.io/badge/-Node.js-339933.svg?logo=node.js&style=for-the-badge&logoColor=white">
  <img src="https://img.shields.io/badge/-Express-000000.svg?logo=express&style=for-the-badge&logoColor=white">
  <!-- フロントエンド -->
  <img src="https://img.shields.io/badge/-React-20232A.svg?logo=react&style=for-the-badge&logoColor=61DAFB">
  <!-- データベース -->
  <img src="https://img.shields.io/badge/-MongoDB-47A248.svg?logo=mongodb&style=for-the-badge&logoColor=white">
  <!-- デプロイ / ホスティング -->
  <img src="https://img.shields.io/badge/-Render-46E3B7.svg?logo=render&style=for-the-badge&logoColor=white">
  <img src="https://img.shields.io/badge/-Firebase-FFCA28.svg?logo=firebase&style=for-the-badge&logoColor=black">
</p>

## 目次

1. [プロジェクトについて](#プロジェクトについて)
2. [環境](#環境)
3. [ディレクトリ構成](#ディレクトリ構成)
4. [開発環境構築](#開発環境構築)
5. [トラブルシューティング](#トラブルシューティング)

<!-- READMEの作成方法のドキュメントのリンク -->
<br />
<div align="right">
    <a href="READMEの作成方法のリンク"><strong>READMEの作成方法 »</strong></a>
</div>
<br />
<!-- Dockerfileのドキュメントのリンク -->
<div align="right">
    <a href="Dockerfileの詳細リンク"><strong>Dockerfileの詳細 »</strong></a>
</div>
<br />
<!-- プロジェクト名を記載 -->

## プロジェクト名

リアル災害サバイバルゲーム『渋谷歪譚』

<!-- プロジェクトについて -->

## プロジェクトについて

このプロジェクトは、都知事杯ハッカソン2025の応募作品です。

『渋谷歪譚(しぶやわいたん)』は、実際の渋谷の街を歩いてプレイする、防災シミュレーションゲームアプリ。  
災害発生からの最初の6〜12時間（ゲーム内時間）を生き抜く過程で、現実の防災データや街の構造をもとにした行動選択を体験する。  
避難ルート確認にとどまらない、現地体験型の“次世代避難訓練”。

<p align="right">(<a href="#top">トップへ</a>)</p>

## 環境

<!-- 言語、フレームワーク、ミドルウェア、インフラの一覧とバージョンを記載 -->

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

<!-- Treeコマンドを使ってディレクトリ構成を記載 -->

❯ tree -a -I "node_modules|.next|.git|.pytest_cache|static" -L 2
.
├── .devcontainer
│   └── devcontainer.json
├── .env
├── .github
│   ├── action
│   ├── release-drafter.yml
│   └── workflows
├── .gitignore
├── Makefile
├── README.md
├── backend
│   ├── .vscode
│   ├── application
│   ├── docs
│   ├── manage.py
│   ├── output
│   ├── poetry.lock
│   ├── project
│   └── pyproject.toml
├── containers
│   ├── django
│   ├── front
│   ├── mysql
│   └── nginx
├── docker-compose.yml
├── frontend
│   ├── .gitignore
│   ├── README.md
│   ├── __test__
│   ├── components
│   ├── features
│   ├── next-env.d.ts
│   ├── package-lock.json
│   ├── package.json
│   ├── pages
│   ├── postcss.config.js
│   ├── public
│   ├── styles
│   ├── tailwind.config.js
│   └── tsconfig.json
└── infra
    ├── .gitignore
    ├── docker-compose.yml
    ├── main.tf
    ├── network.tf
    └── variables.tf

<p align="right">(<a href="#top">トップへ</a>)</p>

## 開発環境構築

<!-- コンテナの作成方法、パッケージのインストール方法など、開発環境構築に必要な情報を記載 -->

### コンテナの作成と起動

.env ファイルを以下の環境変数例と[環境変数の一覧](#環境変数の一覧)を元に作成

.env
MYSQL_ROOT_PASSWORD=root
MYSQL_DATABASE=django-db
MYSQL_USER=django
MYSQL_PASSWORD=django
MYSQL_HOST=db
MYSQL_PORT=3306
SECRET_KEY=django
DJANGO_SETTINGS_MODULE=project.settings.local


.env ファイルを作成後、以下のコマンドで開発環境を構築

make prepare

### 動作確認

http://127.0.0.1:8000 にアクセスできるか確認
アクセスできたら成功

### コンテナの停止

以下のコマンドでコンテナを停止することができます

make down

### 環境変数の一覧

| 変数名                 | 役割                                      | デフォルト値                       | DEV 環境での値                           |
| ---------------------- | ----------------------------------------- | ---------------------------------- | ---------------------------------------- |
| MYSQL_ROOT_PASSWORD    | MySQL のルートパスワード（Docker で使用） | root                               |                                          |
| MYSQL_DATABASE         | MySQL のデータベース名（Docker で使用）   | django-db                          |                                          |
| MYSQL_USER             | MySQL のユーザ名（Docker で使用）         | django                             |                                          |
| MYSQL_PASSWORD         | MySQL のパスワード（Docker で使用）       | django                             |                                          |
| MYSQL_HOST             | MySQL のホスト名（Docker で使用）         | db                                 |                                          |
| MYSQL_PORT             | MySQL のポート番号（Docker で使用）       | 3306                               |                                          |
| SECRET_KEY             | Django のシークレットキー                 | secretkey                          | 他者に推測されないランダムな値にすること |
| ALLOWED_HOSTS          | リクエストを許可するホスト名              | localhost 127.0.0.1 [::1] back web | フロントのホスト名                       |
| DEBUG                  | デバッグモードの切り替え                  | True                               | False                                    |
| TRUSTED_ORIGINS        | CORS で許可するオリジン                   | http://localhost                   |                                          |
| DJANGO_SETTINGS_MODULE | Django アプリケーションの設定モジュール   | project.settings.local             | project.settings.dev                     |

### コマンド一覧

| Make                | 実行する処理                                                            | 元のコマンド                                                                               |
| ------------------- | ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| make prepare        | node_modules のインストール、イメージのビルド、コンテナの起動を順に行う | docker-compose run --rm front npm install<br>docker-compose up -d --build                  |
| make up             | コンテナの起動                                                          | docker-compose up -d                                                                       |
| make build          | イメージのビルド                                                        | docker-compose build                                                                       |
| make down           | コンテナの停止                                                          | docker-compose down                                                                        |
| make loaddata       | テストデータの投入                                                      | docker-compose exec app poetry run python manage.py loaddata crm.json                      |
| make makemigrations | マイグレーションファイルの作成                                          | docker-compose exec app poetry run python manage.py makemigrations                         |
| make migrate        | マイグレーションを行う                                                  | docker-compose exec app poetry run python manage.py migrate                                |
| make show_urls      | エンドポイントをターミナル上で一覧表示                                  | docker-compose exec app poetry run python manage.py show_urls                              |
| make shell          | テストデータの投入                                                      | docker-compose exec app poetry run python manage.py debugsqlshell                          |
| make superuser      | スーパーユーザの作成                                                    | docker-compose exec app poetry run python manage.py createsuperuser                        |
| make test           | テストを実行                                                            | docker-compose exec app poetry run pytest                                                  |
| make test-cov       | カバレッジを表示させた上でテストを実行                                  | docker-compose exec app poetry run pytest --cov                                            |
| make format         | black と isort を使ってコードを整形                                     | docker-compose exec app poetry run black . <br> docker-compose exec app poetry run isort . |
| make update         | Poetry 内のパッケージの更新                                             | docker-compose exec app poetry update                                                      |
| make app            | アプリケーション のコンテナへ入る                                       | docker exec -it app bash                                                                   |
| make db             | データベースのコンテナへ入る                                            | docker exec -it db bash                                                                    |
| make pdoc           | pdoc ドキュメントの作成                                                 | docker-compose exec app env CI_MAKING_DOCS=1 poetry run pdoc -o docs application           |
| make init           | Terraform の初期化                                                      | docker-compose -f infra/docker-compose.yml run --rm terraform init                         |
| make fmt            | Terraform の設定ファイルをフォーマット                                  | docker-compose -f infra/docker-compose.yml run --rm terraform fmt                          |
| make validate       | Terraform の構成ファイルが正常であることを確認                          | docker-compose -f infra/docker-compose.yml run --rm terraform validate                     |
| make show           | 現在のリソースの状態を参照                                              | docker-compose -f infra/docker-compose.yml run --rm terraform show                         |
| make apply          | Terraform の内容を適用                                                  | docker-compose -f infra/docker-compose.yml run --rm terraform apply                        |
| make destroy        | Terraform で構成されたリソースを削除                                    | docker-compose -f infra/docker-compose.yml run --rm terraform destroy                      |

### リモートデバッグの方法

リモートデバッグ を使用する際は以下の url を参考に設定してください<br>
[Django のコンテナへリモートデバッグしよう！](https://qiita.com/shun198/items/9e4fcb4479385217c323)

## トラブルシューティング

### .env: no such file or directory

.env ファイルがないので環境変数の一覧を参考に作成しましょう

### docker daemon is not running

Docker Desktop が起動できていないので起動させましょう

### Ports are not available: address already in use

別のコンテナもしくはローカル上ですでに使っているポートがある可能性があります
<br>
下記記事を参考にしてください
<br>
[コンテナ起動時に Ports are not available: address already in use が出た時の対処法について](https://qiita.com/shun198/items/ab6eca4bbe4d065abb8f)

### Module not found

make build

を実行して Docker image を更新してください

<p align="right">(<a href="#top">トップへ</a>)</p>
