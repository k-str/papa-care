const fs   = require('fs');
const path = require('path');

const DB = path.join(__dirname, 'data', 'posts.json');

function load() {
  if (!fs.existsSync(DB)) fs.writeFileSync(DB, '[]');
  return JSON.parse(fs.readFileSync(DB, 'utf-8'));
}

function save(posts) {
  fs.writeFileSync(DB, JSON.stringify(posts, null, 2));
}

function getAll() {
  return load().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

function getById(id) {
  return load().find(p => p.id === id) || null;
}

function create({ title, body, author }) {
  const posts = load();
  const post = {
    id:        Date.now().toString(),
    title:     title.trim(),
    body:      body.trim(),
    author:    (author || '管理者').trim(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  posts.push(post);
  save(posts);
  return post;
}

function update(id, { title, body, author }) {
  const posts = load();
  const idx = posts.findIndex(p => p.id === id);
  if (idx === -1) return null;
  posts[idx] = { ...posts[idx], title: title.trim(), body: body.trim(), author: (author || '管理者').trim(), updatedAt: new Date().toISOString() };
  save(posts);
  return posts[idx];
}

function remove(id) {
  const posts = load();
  const filtered = posts.filter(p => p.id !== id);
  if (filtered.length === posts.length) return false;
  save(filtered);
  return true;
}

module.exports = { getAll, getById, create, update, remove };
