const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const path = require('node:path');
const { test } = require('node:test');

const envConfigPath = path.join(__dirname, '..', 'config', 'env.js');

const loadConfig = (overrides) => spawnSync(
  process.execPath,
  ['-e', `require(${JSON.stringify(envConfigPath)})`],
  {
    encoding: 'utf8',
    env: {
      ...process.env,
      NODE_ENV: 'production',
      PORT: '5000',
      JWT_SECRET: 'a'.repeat(48),
      OPENAI_API_KEY: '',
      AI_PROVIDER: '',
      ...overrides,
    },
  }
);

test('production environment requires a 32-byte JWT secret', () => {
  const result = loadConfig({ JWT_SECRET: 'too-short' });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /JWT_SECRET of at least 32 bytes/i);
});

test('production server config accepts a numeric port and strong JWT secret', () => {
  const result = loadConfig({});
  assert.equal(result.status, 0, result.stderr);
});

test('server rejects a non-numeric deployment port', () => {
  const result = loadConfig({ PORT: 'not-a-port' });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /PORT must be an integer/i);
});

test('local Ollama is the default AI provider when no OpenAI key is configured', () => {
  const result = loadConfig({ OPENAI_API_KEY: '', AI_PROVIDER: '' });
  assert.equal(result.status, 0, result.stderr);

  const config = spawnSync(
    process.execPath,
    ['-e', `process.stdout.write(require(${JSON.stringify(envConfigPath)}).AI_PROVIDER)`],
    {
      encoding: 'utf8',
      env: {
        ...process.env,
        NODE_ENV: 'production',
        PORT: '5000',
        JWT_SECRET: 'a'.repeat(48),
        OPENAI_API_KEY: '',
        AI_PROVIDER: '',
      },
    }
  );
  assert.equal(config.status, 0, config.stderr);
  assert.equal(config.stdout, 'ollama');
});

test('OpenAI provider selection requires an API key', () => {
  const result = loadConfig({ AI_PROVIDER: 'openai', OPENAI_API_KEY: '' });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /OPENAI_API_KEY is required/i);
});
