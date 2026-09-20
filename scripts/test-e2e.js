/**
 * MeepleAI Automated E2E & QA Test Suite
 * Executed by QA Specialist before presenting changes to the user.
 */

const BASE_URL = 'http://localhost:3000';

async function runTest(name, fn) {
  process.stdout.write(`  ⏳ Testing ${name}... `);
  const start = Date.now();
  try {
    await fn();
    const duration = Date.now() - start;
    console.log(`✅ PASSED (${duration}ms)`);
    return true;
  } catch (err) {
    const duration = Date.now() - start;
    console.log(`❌ FAILED (${duration}ms)`);
    console.error(`     Error: ${err.message}`);
    return false;
  }
}

async function main() {
  console.log('\n========================================');
  console.log('🎲 MEEPLE-AI AUTOMATED QA TEST SUITE');
  console.log('========================================\n');

  let passed = 0;
  let total = 0;

  // Test 1: Healthcheck
  total++;
  if (await runTest('API Chat Healthcheck (GET /api/chat)', async () => {
    const res = await fetch(`${BASE_URL}/api/chat`);
    if (res.status !== 200) throw new Error(`Expected HTTP 200, got ${res.status}`);
    const data = await res.json();
    if (data.status !== 'ok' || !data.hasServerKey) {
      throw new Error(`Invalid healthcheck response: ${JSON.stringify(data)}`);
    }
  })) passed++;

  // Test 2: Pre-seeded Game Info
  total++;
  if (await runTest('Pre-seeded BGG Game Info (GET /api/game-info?game=Wingspan)', async () => {
    const res = await fetch(`${BASE_URL}/api/game-info?game=Wingspan`);
    if (res.status !== 200) throw new Error(`Expected HTTP 200, got ${res.status}`);
    const data = await res.json();
    if (!data.success || data.source !== 'preseeded') {
      throw new Error(`Expected preseeded source, got: ${JSON.stringify(data)}`);
    }
    const g = data.game;
    if (!g.title || !g.year || !g.bggWeight || !g.bggRating) {
      throw new Error(`Missing required game fields: ${JSON.stringify(g)}`);
    }
  })) passed++;

  // Test 3: Dynamic BGG AI Game Lookup
  total++;
  if (await runTest('Dynamic AI BGG Game Info (GET /api/game-info?game=Azul)', async () => {
    const res = await fetch(`${BASE_URL}/api/game-info?game=Azul`);
    if (res.status !== 200) throw new Error(`Expected HTTP 200, got ${res.status}`);
    const data = await res.json();
    if (!data.success || !data.game.title) {
      throw new Error(`Dynamic lookup failed: ${JSON.stringify(data)}`);
    }
  })) passed++;

  // Test 4: Frontend HTML Render
  total++;
  if (await runTest('Frontend Index Page (GET /)', async () => {
    const res = await fetch(`${BASE_URL}/`);
    if (res.status !== 200) throw new Error(`Expected HTTP 200, got ${res.status}`);
    const html = await res.text();
    if (!html.includes('MeepleAI')) {
      throw new Error('Frontend HTML does not contain MeepleAI title');
    }
  })) passed++;

  // Test 5: Live Chat Rule Query
  total++;
  if (await runTest('Live Chat Rule Arbiter (POST /api/chat)', async () => {
    const payload = {
      messages: [
        { role: 'user', content: 'In Catan, cosa succede se tiro il 7 e ho 8 risorse?' }
      ],
      mode: 'rules',
      gameContext: 'Catan'
    };
    const res = await fetch(`${BASE_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.status !== 200) {
      const err = await res.json().catch(() => ({}));
      throw new Error(`HTTP ${res.status}: ${err.error || 'Unknown error'}`);
    }
    const data = await res.json();
    if (!data.text || data.text.length < 50) {
      throw new Error('Response text too short or empty');
    }
  })) passed++;

  // Test 6: Summary / Game Sheet Mode (POST /api/chat mode=summary)
  total++;
  if (await runTest('Summary / Game Sheet Mode (POST /api/chat mode=summary)', async () => {
    const payload = {
      messages: [
        { role: 'user', content: 'Dammi la scheda tecnica e le metriche BGG di Carcassonne.' }
      ],
      mode: 'summary',
      gameContext: 'Carcassonne'
    };
    const res = await fetch(`${BASE_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.status !== 200) {
      const err = await res.json().catch(() => ({}));
      throw new Error(`HTTP ${res.status}: ${err.error || 'Unknown error'}`);
    }
    const data = await res.json();
    if (!data.text || data.text.length < 50) {
      throw new Error('Summary response text too short or empty');
    }
  })) passed++;

  console.log('\n----------------------------------------');
  console.log(`Results: ${passed}/${total} tests passed.`);
  console.log('----------------------------------------\n');

  if (passed !== total) {
    process.exit(1);
  }
}

main();
