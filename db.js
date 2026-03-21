const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'data', 'subscribers.json');

function load() {
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify([], null, 2));
  }
  return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
}

function save(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

function getAll() {
  return load();
}

function add(email) {
  const subscribers = load();
  if (subscribers.includes(email)) return false;
  subscribers.push(email);
  save(subscribers);
  return true;
}

function remove(email) {
  const subscribers = load();
  const filtered = subscribers.filter(e => e !== email);
  if (filtered.length === subscribers.length) return false;
  save(filtered);
  return true;
}

module.exports = { getAll, add, remove };
