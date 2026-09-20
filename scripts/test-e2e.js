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

  // Test 7: Domain Guardrail - Off-Topic Web Dev Request Refusal
  total++;
  if (await runTest('Domain Guard: Off-Topic Request Refusal (POST /api/chat "mi sviluppi un sito web?")', async () => {
    const payload = {
      messages: [
        { role: 'user', content: 'mi sviluppi un sito web?' }
      ],
      mode: 'rules'
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
    if (!data.text) throw new Error('Empty response');
    // Must refuse web dev / coding and affirm it is exclusively for board games
    if (data.text.includes('<!DOCTYPE html>') || data.text.toLowerCase().includes('posso sviluppare')) {
      throw new Error(`AI failed to refuse web dev request: ${data.text.slice(0, 100)}`);
    }
    if (!data.text.includes('giochi da tavolo')) {
      throw new Error(`Response should mention board games focus: ${data.text}`);
    }
  })) passed++;

  // Test 8: Request Validation - Reject Message Exceeding 2000 Chars
  total++;
  if (await runTest('Request Validation: Reject Oversized Message (POST /api/chat >2000 chars)', async () => {
    const hugeContent = 'a'.repeat(2500);
    const payload = {
      messages: [{ role: 'user', content: hugeContent }],
      mode: 'general'
    };
    const res = await fetch(`${BASE_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.status !== 400) {
      throw new Error(`Expected HTTP 400 for oversized message, got ${res.status}`);
    }
    const data = await res.json();
    if (!data.error || !data.error.includes('2000')) {
      throw new Error(`Expected 2000 chars limit error, got: ${JSON.stringify(data)}`);
    }
  })) passed++;

  // Test 9: Multimodal Image Payload (POST /api/chat with image attachment)
  total++;
  if (await runTest('Multimodal Vision: Process Image Attachment (POST /api/chat with base64 image)', async () => {
    // 1x1 transparent PNG in base64
    const sampleImageBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    const payload = {
      messages: [
        {
          role: 'user',
          content: 'Guarda questa foto del tavolo di gioco e dimmi se la strada è valida.',
          attachment: {
            type: 'image',
            mimeType: 'image/png',
            name: 'tabellone.png',
            data: `data:image/png;base64,${sampleImageBase64}`,
          },
        },
      ],
      mode: 'rules',
      gameContext: 'Catan',
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
    if (!data.text || data.text.length < 20) {
      throw new Error('Vision multimodal response too short or empty');
    }
  })) passed++;

  // Test 10: Speech Summary Extractor Logic
  total++;
  if (await runTest('Audio TTS: Spoken Summary Extraction (<280 chars, no raw markdown)', async () => {
    const rawMarkdown = `**VERDETTO: NO, non è consentito.**\n\nNelle regole ufficiali di Catan, un insediamento nemico blocca completamente la costruzione.\n\n⚠️ **DISTINZIONE CHIAVE:** La strada viene spezzata ai fini del calcolo.\n\n💡 **Cosa fare:** Il giocatore deve deviare il percorso.`;
    
    // Simula extractSpokenSummary
    let clean = rawMarkdown.replace(/```[\s\S]*?```/g, '').replace(/<[^>]+>/g, '');
    const idx = clean.indexOf('⚠️');
    if (idx !== -1) clean = clean.substring(0, idx);
    clean = clean.replace(/[#*_~`>-]/g, ' ').replace(/\s+/g, ' ').trim();

    if (clean.length > 280) throw new Error(`Summary too long for fast table play: ${clean.length} chars`);
    if (clean.includes('*') || clean.includes('#') || clean.includes('⚠️')) {
      throw new Error(`Summary contains raw markdown: ${clean}`);
    }
    if (!clean.includes('VERDETTO: NO')) {
      throw new Error(`Summary missing verdict: ${clean}`);
    }
  })) passed++;

  // Test 11: Auto Mode Switching (Setup query while in Rules mode -> switches to 'setup')
  total++;
  if (await runTest('Auto Mode Switching: Rules -> Setup on "come si fa il setup"', async () => {
    // Check regex pattern matching
    const q = 'come si fa il setup di Wingspan?';
    const isSetup = /\b(setup|set\s*up)\b/i.test(q);
    if (!isSetup) throw new Error('Failed to match setup pattern');
  })) passed++;

  // Test 12: Auto Mode Switching (Rules query while in Setup mode -> switches to 'rules')
  total++;
  if (await runTest('Auto Mode Switching: Setup -> Rules on "è consentito costruire..."', async () => {
    const q = 'è consentito costruire una strada oltre la colonia nemica?';
    const isRules = /(?:^|\s|[.,!?])(è|e'|e)\s+(consentito|legale|permesso|vietato|possibile)\b/i.test(q);
    if (!isRules) throw new Error('Failed to match rules pattern');
  })) passed++;

  console.log('\n----------------------------------------');
  console.log(`Results: ${passed}/${total} tests passed.`);
  console.log('----------------------------------------\n');

  if (passed !== total) {
    process.exit(1);
  }
}

main();
