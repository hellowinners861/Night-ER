# Cloudflare Workers ランキング設定

Night-ERのランキングは、Cloudflare WorkersとD1を使用します。コード側では以下のバインディング名を固定で参照します。

- D1データベース: `DB`
- 暗号化シークレット: `RANKING_SALT`

## 1. WorkerをGitHubへ接続

Cloudflare Dashboardの **Workers & Pages** からWorkerを作成し、GitHubの `hellowinners861/Night-ER` を接続します。

| 項目 | 設定値 |
| --- | --- |
| Production branch | `main` |
| Build command | `npm run build` |
| Deploy command | `npx wrangler deploy` |
| Root directory | 空欄（リポジトリ直下） |

[`wrangler.jsonc`](../wrangler.jsonc) がWorkerコード、静的アセット、D1バインディングをまとめて設定します。GitHub Actionsでは従来どおりGitHub Pages向けの `/Night-ER/` を使用します。

## 2. D1データベースを作成

Cloudflare Dashboardで **D1 SQL database > Create Database** を選びます。

- 推奨データベース名: `night-er-ranking`

作成後、D1の **Console** を開き、[`schema.sql`](./schema.sql) の内容を貼り付けて **Execute** してください。

## 3. WorkerへD1を接続

通常は `wrangler.jsonc` の設定がデプロイ時に自動適用されます。Dashboardで確認する場合はWorkerの **Bindings** を開きます。

- Variable name: `DB`
- D1 database: `night-er-ranking`

## 4. 送信制限用シークレットを追加

Workerに実行コードを一度デプロイした後、**Settings > Variables and Secrets > Add** を選びます。

- Variable name: `RANKING_SALT`
- Value: パスワード管理アプリなどで生成した32文字以上のランダム文字列
- **Encrypt** を有効化

この値はIPアドレスを送信制限用ハッシュへ変換するためだけに使います。値を変更すると過去のハッシュとの連続性が失われますが、ランキングデータ自体は残ります。

## 5. 再デプロイして確認

BindingsとSecretsは設定後のデプロイから有効になります。Workerの **Deployments** から最新コミットを確認してください。

以下へアクセスし、`entries` を含むJSONが返ればAPIの準備完了です。

```text
https://<PROJECT>.<SUBDOMAIN>.workers.dev/api/rankings?levelId=student&hospitalId=secondary&modeId=short
```

リザルト画面では、同じ「利用者区分・救急区分・当直モード」のTOP 10を表示します。途中交代の当直は登録できません。

## 不正対策の範囲

API側で次を実施しています。

- 院長メーターを `褒め−残念` で再計算
- 件数・正答数・残念ポイントの整合性検証
- 名前の正規化と12文字制限
- IPアドレスを保存せず、ソルト付きSHA-256ハッシュだけを保存
- 同一ハッシュから1時間5回までに送信制限
- 重複送信IDの拒否

ゲーム本体はブラウザ内で動くため、改造クライアントによる虚偽申告を完全には防げません。現状は個人情報やログインを要求しないカジュアルランキングとして設計しています。
