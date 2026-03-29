import { Request, Response } from 'express';
import axios from 'axios';
import redis from '../services/redis';
import { encode } from 'gpt-3-encoder';

export const chat = async (req: Request, res: Response) => {
  const { model, session, messages, source, tools } = req.body;

  if (!model || !session) {
    return res.status(400).json({ status: 'error', message: 'model and session are required.' });
  }

  const userMessageContent = messages?.[messages.length - 1]?.content || req.body.content;

  if (!userMessageContent) {
    return res.status(400).json({ status: 'error', message: 'No content provided.' });
  }

  // 1. Manage Session History via Redis (TTL: 5 mins)
  const sessionKey = `session:${session}`;
  let history = [];
  try {
    const historyData = await redis.get(sessionKey);
    history = historyData ? JSON.parse(historyData) : [];
  } catch (err) {
    console.warn('Redis error:', err);
  }

  // 2. Token Counting (gpt-3-encoder)
  const countTokens = (msgs: any[]) => {
    let tokens = 0;
    msgs.forEach((m: any) => {
      tokens += encode(m.role || '').length;
      tokens += encode(m.content || '').length;
    });
    return tokens;
  };

  const newUserTokens = encode(userMessageContent).length;
  let totalTokens = countTokens(history) + newUserTokens;

  // 3. Clear History if limit reached (6500 tokens)
  if (totalTokens > 6500) {
    history = [];
    totalTokens = newUserTokens; // Reset with current
  }

  // 4. Prepare Payload for Pollinations AI
  const systemPrompt = "انت نموذج الذكاء الاصطناعي اسمك زولاي Zool-AI تم تطويرك من قبل KG تتحدث العامية السودانية";
  const fullMessages = [
    { role: 'system', content: systemPrompt },
    ...history,
    { role: 'user', content: userMessageContent }
  ];

  try {
    const response = await axios.post('https://gen.pollinations.ai/v1/chat/completions', {
      model,
      messages: fullMessages,
      tools: tools || [],
      // Compatible with OpenAI
    }, {
      headers: { 'Authorization': `Bearer ${process.env.POLLINATIONS_API_KEY}` }
    });

    const aiResponse = response.data.choices[0].message;
    const aiContent = aiResponse.content;

    // 5. Update History & Tokens
    history.push({ role: 'user', content: userMessageContent });
    history.push({ role: 'assistant', content: aiContent });

    // Store in Redis with 5 min TTL
    try {
      await redis.setex(sessionKey, 300, JSON.stringify(history));
    } catch (err) {
      console.warn('Redis set error:', err);
    }

    return res.json({
      status: 'success',
      messages: [{ role: 'assistant', content: aiContent }],
      created_at: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Chat error:', error.response?.data || error.message);
    const status = error.response?.status || 500;
    const details = error.response?.data || { message: 'Internal Server Error' };

    return res.status(status).json({
      status: 'error',
      message: 'حدث خطأ من مزود الخدمة.',
      details
    });
  }
};
