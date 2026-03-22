require('dotenv').config();
const Anthropic = require('@anthropic-ai/sdk');

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const TOPICS = [
  '生後0〜3ヶ月の赤ちゃんとの関わり方',
  '赤ちゃんの入浴・沐浴のコツ',
  '夜泣き対処法とパパができること',
  '赤ちゃんの抱き方・あやし方',
  '育児中の夫婦コミュニケーション',
  '授乳・ミルクタイムにパパが参加する方法',
  '産後のパートナーのサポート方法',
  '赤ちゃんとのスキンシップ・絆の深め方',
  'おむつ替えのコツと注意点',
  '赤ちゃんの成長・発達の目安',
  '育児疲れをリフレッシュする方法',
  '赤ちゃんのあやし歌・遊び',
];

async function generateParentingTip() {
  const today = new Date();
  const dayOfYear = Math.floor(
    (today - new Date(today.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24)
  );
  const topic = TOPICS[dayOfYear % TOPICS.length];

  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: `あなたは育児の専門家です。新米パパに向けて、「${topic}」についての実用的なアドバイスを書いてください。

以下の形式で書いてください：
- 日本語で親しみやすい文体
- 見出しと本文の構成（見出しは【】で囲む）
- 具体的なアクション3〜5つ
- 励ましのメッセージで締める
- 全体で400〜600文字程度

本文のみ出力してください。`,
      },
    ],
  });

  const text = response.content.find(b => b.type === 'text')?.text ?? '';
  return { topic, content: text };
}

module.exports = { generateParentingTip };
