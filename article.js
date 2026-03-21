const fs = require('fs');
const path = require('path');

const ARTICLE_PATH = path.join(__dirname, 'data', 'article.json');

function save({ topic, content }) {
  fs.mkdirSync(path.dirname(ARTICLE_PATH), { recursive: true });
  fs.writeFileSync(ARTICLE_PATH, JSON.stringify({
    topic,
    content,
    updatedAt: new Date().toISOString(),
  }, null, 2));
}

function get() {
  if (!fs.existsSync(ARTICLE_PATH)) return null;
  return JSON.parse(fs.readFileSync(ARTICLE_PATH, 'utf-8'));
}

module.exports = { save, get };
