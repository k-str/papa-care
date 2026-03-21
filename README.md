# 🍀 パパケア - 新米パパ向け育児情報配信Webアプリ

## セットアップ

### 1. 環境変数の設定

`.env.example` をコピーして `.env` を作成します：

```bash
cp .env.example .env
```

`.env` を編集して以下を設定します：

```
ANTHROPIC_API_KEY=your_anthropic_api_key_here
MAIL_USER=your_gmail@gmail.com
MAIL_PASS=your_gmail_app_password
PORT=3000
```

> **Gmail アプリパスワードの取得方法**
> 1. Googleアカウント → セキュリティ → 2段階認証を有効化
> 2. 「アプリパスワード」を生成（メール / Windows パソコン）
> 3. 生成された16桁のパスワードを `MAIL_PASS` に設定

### 2. 起動

```bash
npm start
```

ブラウザで `http://localhost:3000` を開いてください。

---

## 機能

| エンドポイント | 説明 |
|---|---|
| `GET /` | メール登録フォーム |
| `POST /subscribe` | メールアドレスを登録 |
| `GET /unsubscribe?email=...` | 配信停止 |
| `GET /admin/subscribers` | 購読者一覧（デバッグ） |
| `POST /admin/send-now` | 今すぐ配信テスト |

## テスト配信

サーバー起動後、以下のコマンドで即座に配信テストできます：

```bash
curl -X POST http://localhost:3000/admin/send-now
```

## スケジュール

毎日 **12:00 JST** に自動で配信されます（`node-cron` による管理）。
