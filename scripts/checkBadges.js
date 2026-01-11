// Quick integration check for badges endpoints and frame HTML
// Usage: BASE_URL=http://localhost:3000 ADDRESS=0xYourAddress node scripts/checkBadges.js

const fetch = require('node-fetch');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const ADDRESS = process.env.ADDRESS || '0x0000000000000000000000000000000000000000';

async function get(url) {
  const res = await fetch(url);
  const body = await res.text();
  return { status: res.status, headers: res.headers.raw(), body };
}

function logResult(label, result) {
  const contentType = result.headers['content-type']?.[0] || '';
  console.log(`\n${label}`);
  console.log(`Status: ${result.status}`);
  console.log(`Content-Type: ${contentType}`);
  console.log(`Body (truncated 400 chars):\n${result.body.slice(0, 400)}`);
}

(async () => {
  try {
    const types = await get(`${BASE_URL}/api/badges/types`);
    logResult('GET /api/badges/types', types);

    const user = await get(`${BASE_URL}/api/badges/user/${ADDRESS}`);
    logResult(`GET /api/badges/user/${ADDRESS}`, user);

    const frame = await get(`${BASE_URL}/api/frames/badges`);
    logResult('GET /api/frames/badges', frame);
  } catch (err) {
    console.error('Badge check failed:', err.message);
    process.exit(1);
  }
})();
