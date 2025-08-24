# Tokyo_Hackathon

## Google Maps API の設定

このプロジェクトは Google Maps JavaScript API を使用して地図を表示します。ローカル開発・本番環境ともに API キーを環境変数で渡す必要があります。

必須情報
- 環境変数名: `REACT_APP_GOOGLE_MAPS_API_KEY`
- マップコンポーネント: `client/src/components/game-page/GoogleMap.jsx` がこの環境変数を参照しています。

手順（ローカル開発）
1. Google Cloud コンソールでプロジェクトを作成（または既存プロジェクトを選択）します。
2. 「API とサービス」→「ライブラリ」で **Maps JavaScript API** を有効にします。
3. 「認証情報」→「API キーの作成」でキーを作成します。
	- セキュリティのため、利用制限を設定してください（HTTP リファラ制限: `http://localhost:3000` と `http://127.0.0.1:3000` など）。
	- 使用 API の制限で `Maps JavaScript API` を許可してください。
4. プロジェクトの `client` フォルダにある `.env.example` を参考に、`client/.env` を作成して以下を設定します:

```
REACT_APP_GOOGLE_MAPS_API_KEY=あなたの_API_KEY
```

5. 開発サーバーを再起動します（Create React App は起動時に環境変数を読み込むため、変更後は再起動が必要です）:

```
cd client
npm install   # まだ依存が入っていない場合
npm start
```

手順（本番デプロイ）
- 本番ではビルド環境またはホスティングサービスの「環境変数 (Environment Variables)」に `REACT_APP_GOOGLE_MAPS_API_KEY` を設定してください（例: Vercel / Netlify / GitHub Actions の Secrets）。
- ブラウザから見えるキーになるため、必ず利用制限（リファラや API の制限）を付与してください。

注意事項
- リポジトリに直接 API キー（`client/.env` など）をコミットしないでください。現在、`client/.env` にキーが置かれている可能性があります。もし公開リポジトリにキーが流出している場合は、すぐにキーを無効化して新しいキーを発行してください。
- `GoogleMap.jsx` は環境変数が無い場合にエラーボックスを表示するようになっています。キー設定に問題があるときは、地図の代わりにエラーメッセージが表示されます。

トラブルシューティング
- 地図が表示されない場合、ブラウザのコンソールに出るエラーメッセージ（API キーの制限や請求関連のエラー）を確認してください。
- 開発時に地図の読み込みエラーが出たら、`client/.env` の変数名が `REACT_APP_GOOGLE_MAPS_API_KEY` になっているか、サーバーを再起動したか確認してください。

参考: プロジェクト内の `.env.example` にサンプルのキー変数名が記載されています（`client/.env.example`）。

