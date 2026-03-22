require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const path    = require('path');
const article = require('./article');
const posts   = require('./posts');
const { startScheduler, runDailyUpdate } = require('./scheduler');

const app  = express();
const PORT = process.env.PORT || 3000;
const BLOG_PASSWORD = process.env.BLOG_PASSWORD || 'papa1234';

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

// ── ブログAPI ─────────────────────────────────────────────

// 認証ミドルウェア
function auth(req, res, next) {
  const pw = req.headers['x-blog-password'] || req.body?.password;
  if (pw !== BLOG_PASSWORD) return res.status(401).json({ ok: false, message: 'パスワードが違います' });
  next();
}

// 記事一覧
app.get('/api/posts', (req, res) => {
  res.json({ ok: true, posts: posts.getAll() });
});

// 記事詳細
app.get('/api/posts/:id', (req, res) => {
  const post = posts.getById(req.params.id);
  if (!post) return res.status(404).json({ ok: false, message: '記事が見つかりません' });
  res.json({ ok: true, post });
});

// 記事作成
app.post('/api/posts', auth, (req, res) => {
  const { title, body, author } = req.body;
  if (!title?.trim() || !body?.trim()) {
    return res.status(400).json({ ok: false, message: 'タイトルと本文は必須です' });
  }
  const post = posts.create({ title, body, author });
  res.json({ ok: true, post });
});

// 記事更新
app.put('/api/posts/:id', auth, (req, res) => {
  const { title, body, author } = req.body;
  if (!title?.trim() || !body?.trim()) {
    return res.status(400).json({ ok: false, message: 'タイトルと本文は必須です' });
  }
  const post = posts.update(req.params.id, { title, body, author });
  if (!post) return res.status(404).json({ ok: false, message: '記事が見つかりません' });
  res.json({ ok: true, post });
});

// 記事削除
app.delete('/api/posts/:id', auth, (req, res) => {
  const ok = posts.remove(req.params.id);
  if (!ok) return res.status(404).json({ ok: false, message: '記事が見つかりません' });
  res.json({ ok: true });
});

// ── ブログページ配信 ──────────────────────────────────────
app.get('/blog',        (req, res) => res.sendFile(path.join(__dirname, 'public', 'blog.html')));
app.get('/blog/:id',    (req, res) => res.sendFile(path.join(__dirname, 'public', 'blog-post.html')));
app.get('/admin/blog',  (req, res) => res.sendFile(path.join(__dirname, 'public', 'admin-blog.html')));

// ── サーバー起動 ─────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🍀 パパケア サーバー起動`);
  console.log(`   http://localhost:${PORT}`);
  console.log(`   ブログ管理: http://localhost:${PORT}/admin/blog`);
  startScheduler();
});
