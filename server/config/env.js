require('dotenv').config();

const jwtSecret = process.env.JWT_SECRET || 'autonomous-study-planner-secret';
if (process.env.NODE_ENV === 'production' && (!process.env.JWT_SECRET || Buffer.byteLength(jwtSecret) < 32)) {
  throw new Error('Production requires a JWT_SECRET of at least 32 bytes.');
}

const port = Number(process.env.PORT || 5000);
if (!Number.isInteger(port) || port < 0 || port > 65535) {
  throw new Error('PORT must be an integer between 0 and 65535.');
}

const openAIKey = process.env.OPENAI_API_KEY || '';
const aiProvider = process.env.AI_PROVIDER || (openAIKey ? 'openai' : 'ollama');
if (!['openai', 'ollama'].includes(aiProvider)) {
  throw new Error('AI_PROVIDER must be either "openai" or "ollama".');
}
if (aiProvider === 'openai' && !openAIKey) {
  throw new Error('OPENAI_API_KEY is required when AI_PROVIDER is "openai".');
}

module.exports = {
  PORT: port,
  JWT_SECRET: jwtSecret,
  MONGODB_URI:
    process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/autonomous-study-planner',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  AI_PROVIDER: aiProvider,
  OPENAI_API_KEY: openAIKey,
  OLLAMA_BASE_URL: (process.env.OLLAMA_BASE_URL || 'http://127.0.0.1:11434').replace(/\/+$/, ''),
  OLLAMA_MODEL: process.env.OLLAMA_MODEL || 'qwen2.5:3b',
  ADMIN_SIGNUP_CODE: process.env.ADMIN_SIGNUP_CODE || '',
};
