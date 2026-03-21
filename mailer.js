require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

function buildHtml(topic, content) {
  const today = new Date().toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const bodyHtml = content
    .split('\n')
    .map(line => {
      if (!line.trim()) return '';
      if (line.startsWith('【') && line.includes('】')) {
        return `<h3 style="color:#2c7a4b;margin:20px 0 8px;">${line}</h3>`;
      }
      return `<p style="margin:6px 0;line-height:1.8;">${line}</p>`;
    })
    .join('');

  return `
<!DOCTYPE html>
<html lang="ja">
<head><meta charset="UTF-8"></head>
<body style="font-family:'Hiragino Sans','Meiryo',sans-serif;background:#f5f9f6;padding:20px;">
  <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.1);">
    <div style="background:linear-gradient(135deg,#2c7a4b,#4caf72);padding:28px 32px;color:#fff;">
      <p style="margin:0 0 4px;font-size:13px;opacity:.8;">🍀 パパケア - 毎日のひとこと育児</p>
      <h2 style="margin:0;font-size:22px;">本日のテーマ：${topic}</h2>
      <p style="margin:8px 0 0;font-size:12px;opacity:.7;">${today}</p>
    </div>
    <div style="padding:28px 32px;color:#333;">
      ${bodyHtml}
    </div>
    <div style="background:#f5f9f6;padding:16px 32px;text-align:center;font-size:12px;color:#888;">
      <p style="margin:0;">配信停止は <a href="%%UNSUBSCRIBE_URL%%" style="color:#2c7a4b;">こちら</a></p>
    </div>
  </div>
</body>
</html>`;
}

async function sendToAll(subscribers, topic, content) {
  if (!subscribers.length) {
    console.log('購読者がいないため送信をスキップします');
    return { sent: 0, failed: 0 };
  }

  const subject = `【パパケア】本日の育児情報：${topic}`;
  let sent = 0;
  let failed = 0;

  for (const email of subscribers) {
    const unsubscribeUrl = `http://localhost:${process.env.PORT || 3000}/unsubscribe?email=${encodeURIComponent(email)}`;
    const html = buildHtml(topic, content).replace('%%UNSUBSCRIBE_URL%%', unsubscribeUrl);

    try {
      await transporter.sendMail({
        from: `"パパケア 🍀" <${process.env.MAIL_USER}>`,
        to: email,
        subject,
        html,
      });
      sent++;
      console.log(`✓ 送信完了: ${email}`);
    } catch (err) {
      failed++;
      console.error(`✗ 送信失敗: ${email} — ${err.message}`);
    }
  }

  return { sent, failed };
}

module.exports = { sendToAll };
