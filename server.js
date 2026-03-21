require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./db');
const { startScheduler, runDailyDelivery } = require('./scheduler');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// ── メール登録 ──────────────────────────────────────────
app.post('/subscribe', (req, res) => {
  const { email } = req.body;
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ ok: false, message: '有効なメールアドレスを入力してください' });
  }
  const added = db.add(email.toLowerCase().trim());
  if (!added) {
    return res.status(409).json({ ok: false, message: 'すでに登録済みのメールアドレスです' });
  }
  console.log(`📩 新規登録: ${email}`);
  res.json({ ok: true, message: '登録が完了しました！毎日12時にお届けします 🍀' });
});

// ── 配信停止 ────────────────────────────────────────────
app.get('/unsubscribe', (req, res) => {
  const { email } = req.query;
  if (!email) return res.status(400).send('メールアドレスが指定されていません');
  const removed = db.remove(decodeURIComponent(email));
  const message = removed
    ? '配信停止が完了しました。またいつでも登録できます。'
    : '指定のメールアドレスは登録されていませんでした。';
  res.send(`
    <html lang="ja"><head><meta charset="UTF-8">
    <title>配信停止 | パパケア</title>
    <style>body{font-family:sans-serif;text-align:center;padding:60px;color:#333;}
    a{color:#2c7a4b;}</style></head>
    <body><h2>🍀 パパケア</h2><p>${message}</p>
    <a href="/">トップへ戻る</a></body></html>
  `);
});

// ── 購読者一覧（デバッグ用） ─────────────────────────────
app.get('/admin/subscribers', (req, res) => {
  res.json({ subscribers: db.getAll() });
});

// ── 今すぐ配信テスト ─────────────────────────────────────
app.post('/admin/send-now', async (req, res) => {
  try {
    res.json({ ok: true, message: '配信処理を開始しました（バックグラウンドで実行中）' });
    await runDailyDelivery();
  } catch (err) {
    console.error(err);
  }
});

// ── サーバー起動 ─────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🍀 パパケア サーバー起動`);
  console.log(`   http://localhost:${PORT}`);
  startScheduler();
});
