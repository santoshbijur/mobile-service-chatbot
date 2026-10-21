const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');

let serverProcess;

before(async () => {
  serverProcess = spawn(process.execPath, ['server.js'], {
    cwd: __dirname + '/..',
    stdio: 'ignore'
  });

  await new Promise((resolve) => setTimeout(resolve, 1000));
});

after(() => {
  if (serverProcess) {
    serverProcess.kill();
  }
});

test('GET /api/health returns application status', async () => {
  const response = await fetch('http://localhost:3000/api/health');
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.status, 'ok');
  assert.match(body.message, /chatbot/i);
});

test('POST /api/plans ranks plans by preference', async () => {
  const response = await fetch('http://localhost:3000/api/plans', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ preferredUse: 'family streaming' })
  });

  assert.equal(response.status, 200);
  const body = await response.json();
  assert.equal(body.plans[0].name, 'Standard');
  assert.equal(body.plans.length, 3);
});
