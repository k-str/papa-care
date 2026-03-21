require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const article = require('./article');
const { startScheduler, runDailyUpdate } = require('./scheduler');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ── 今日の記事を返す ─────────────────────────────────────
app.get('/article', (req, res) => {
  const data = article.get();
  if (!data) return res.json({ ok: false, message: '記事を準備中です。しばらくお待ちください。' });
  res.json({ ok: true, ...data });
});

// ── 今すぐ更新（管理用） ─────────────────────────────────
app.post('/admin/update-now', async (req, res) => {
  try {
    res.json({ ok: true, message: '記事の更新を開始しました' });
    await runDailyUpdate();
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
