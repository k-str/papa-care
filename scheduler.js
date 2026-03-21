const cron = require('node-cron');
const { generateParentingTip } = require('./claude');
const { sendToAll } = require('./mailer');
const db = require('./db');

async function runDailyDelivery() {
  console.log(`\n[${new Date().toLocaleString('ja-JP')}] 育児情報の生成・配信を開始します...`);

  try {
    const { topic, content } = await generateParentingTip();
    console.log(`✓ Claude が生成完了 — テーマ: ${topic}`);

    const subscribers = db.getAll();
    console.log(`📧 購読者数: ${subscribers.length}`);

    const { sent, failed } = await sendToAll(subscribers, topic, content);
    console.log(`✓ 配信完了 — 成功: ${sent}, 失敗: ${failed}\n`);
  } catch (err) {
    console.error('配信処理でエラーが発生しました:', err.message);
  }
}

function startScheduler() {
  // 毎日 12:00 に実行（日本時間に合わせるにはタイムゾーンを設定してください）
  cron.schedule('0 12 * * *', runDailyDelivery, {
    timezone: 'Asia/Tokyo',
  });
  console.log('⏰ スケジューラー起動: 毎日 12:00 (JST) に育児情報を配信します');
}

module.exports = { startScheduler, runDailyDelivery };
