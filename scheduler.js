const cron = require('node-cron');
const { generateParentingTip } = require('./claude');
const article = require('./article');

async function runDailyUpdate() {
  console.log(`\n[${new Date().toLocaleString('ja-JP')}] 記事の生成を開始します...`);
  try {
    const { topic, content } = await generateParentingTip();
    article.save({ topic, content });
    console.log(`✓ 記事を更新しました — テーマ: ${topic}`);
  } catch (err) {
    console.error('記事生成でエラーが発生しました:', err.message);
  }
}

function startScheduler() {
  // 記事がなければ起動時に即生成
  if (!article.get()) {
    console.log('📄 初回記事を生成します...');
    runDailyUpdate();
  }

  cron.schedule('0 12 * * *', runDailyUpdate, { timezone: 'Asia/Tokyo' });
  console.log('⏰ スケジューラー起動: 毎日 12:00 (JST) に記事を更新します');
}

module.exports = { startScheduler, runDailyUpdate };
