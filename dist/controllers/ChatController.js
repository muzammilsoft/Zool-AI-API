"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.chat = void 0;
const axios_1 = __importDefault(require("axios"));
const redis_1 = __importDefault(require("../services/redis"));
const tiktoken_1 = require("tiktoken");
const encoding = (0, tiktoken_1.get_encoding)('cl100k_base');
const chat = async (req, res) => {
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
    const historyData = await redis_1.default.get(sessionKey);
    let history = historyData ? JSON.parse(historyData) : [];
    // 2. Token Counting (tiktoken)
    const countTokens = (msgs) => {
        let tokens = 0;
        msgs.forEach((m) => {
            tokens += encoding.encode(m.role).length;
            tokens += encoding.encode(m.content).length;
        });
        return tokens;
    };
    const newUserTokens = encoding.encode(userMessageContent).length;
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
        const response = await axios_1.default.post('https://gen.pollinations.ai/v1/chat/completions', {
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
        await redis_1.default.setex(sessionKey, 300, JSON.stringify(history));
        return res.json({
            status: 'success',
            messages: [{ role: 'assistant', content: aiContent }],
            created_at: new Date().toISOString()
        });
    }
    catch (error) {
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
exports.chat = chat;
