# Cloudflare Pages ランキング設定

Night-ERのランキングは、Cloudflare Pages FunctionsとD1を使用します。コード側では以下のバインディング名を固定で参照します。

- D1データベース: `DB`
- 暗号化シークレット: `RANKING_SALT`

## 1. Pagesプロジェクトを作成

Cloudflare Dashboardの **Workers & Pages** から **Create application > Pages > Connect to Git** を選び、GitHubの `hellowinners861/Night-ER` を接続します。

| 項目 | 設定値 |
| --- | --- |
| Production branch | `main` |
| Framework preset | React (Vite) |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Root directory | 空欄（リポジトリ直下） |

Cloudflare Pagesでは自動設定される `CF_PAGES=1` を見て、Viteの公開パスを `/` に切り替えます。GitHub Pages向けの `/Night-ER/` も引き続き維持されます。

## 2. D1データベースを作成

Cloudflare Dashboardで **D1 SQL database > Create Database** を選びます。

- 推奨データベース名: `night-er-ranking`

作成後、D1の **Console** を開き、[`schema.sql`](./schema.sql) の内容を貼り付けて **Execute** してください。

## 3. PagesへD1を接続

Pagesプロジェクトで **Settings > Bindings > Add > D1 database bindings** を選びます。

- Variable name: `DB`
- D1 database: `night-er-ranking`

ProductionとPreviewの両環境へ同じ設定を追加すると、PRのプレビューURLでもランキングを確認できます。

## 4. 送信制限用シークレットを追加

Pagesプロジェクトで **Settings > Variables and Secrets > Add** を選びます。

- Variable name: `RANKING_SALT`
- Value: パスワード管理アプリなどで生成した32文字以上のランダム文字列
- **Encrypt** を有効化

この値はIPアドレスを送信制限用ハッシュへ変換するためだけに使います。値を変更すると過去のハッシュとの連続性が失われますが、ランキングデータ自体は残ります。

## 5. 再デプロイして確認

BindingsとSecretsは設定後のデプロイから有効になります。Pagesの **Deployments** から最新コミットを再デプロイしてください。

以下へアクセスし、`entries` を含むJSONが返ればAPIの準備完了です。

```text
https://<PROJECT>.pages.dev/api/rankings?levelId=student&hospitalId=secondary&modeId=short
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
