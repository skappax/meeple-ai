#!/usr/bin/env node

/**
 * MeepleAI Autonomous API Publisher
 * Publishes the repository to GitHub and creates the Web Service on Render.com via REST APIs.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const GITHUB_TOKEN = process.env.GITHUB_TOKEN || process.argv[2];
const RENDER_API_KEY = process.env.RENDER_API_KEY || process.argv[3];

async function main() {
  console.log('==============================================');
  console.log('🎲 MEEPLE-AI FULL AUTONOMOUS API PUBLISHER');
  console.log('==============================================\n');

  if (!GITHUB_TOKEN) {
    console.error('❌ Errore: Manca il GITHUB_TOKEN.');
    console.error('Uso: node scripts/publish-api.js <GITHUB_TOKEN> [RENDER_API_KEY]');
    process.exit(1);
  }

  // 1. Recupero GEMINI_API_KEY da .env.local
  let geminiApiKey = '';
  const envLocalPath = path.join(__dirname, '..', '.env.local');
  if (fs.existsSync(envLocalPath)) {
    const envContent = fs.readFileSync(envLocalPath, 'utf8');
    const match = envContent.match(/GEMINI_API_KEY=([^\r\n]+)/);
    if (match) {
      geminiApiKey = match[1].trim();
    }
  }

  // 2. Verifica Utente GitHub
  console.log('🔍 [1/4] Verifica credenziali GitHub API...');
  const userRes = await fetch('https://api.github.com/user', {
    headers: {
      'Authorization': `Bearer ${GITHUB_TOKEN}`,
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'MeepleAI-Deployer'
    }
  });

  if (!userRes.ok) {
    const errText = await userRes.text();
    console.error(`❌ Token GitHub non valido o scaduto: ${userRes.status} ${errText}`);
    process.exit(1);
  }

  const userData = await userRes.json();
  const username = userData.login;
  console.log(`✅ Connesso a GitHub come: ${username} (${userData.name || username})`);

  // 3. Creazione o verifica repository su GitHub
  console.log(`\n📦 [2/4] Verifica/Creazione repository GitHub: ${username}/meeple-ai...`);
  const repoCheck = await fetch(`https://api.github.com/repos/${username}/meeple-ai`, {
    headers: {
      'Authorization': `Bearer ${GITHUB_TOKEN}`,
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'MeepleAI-Deployer'
    }
  });

  let repoData;
  if (repoCheck.status === 404) {
    console.log('   Repository non esistente. Creazione in corso tramite GitHub API...');
    const createRes = await fetch('https://api.github.com/user/repos', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GITHUB_TOKEN}`,
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'MeepleAI-Deployer'
      },
      body: JSON.stringify({
        name: 'meeple-ai',
        description: "MeepleAI — L'Esperto e Compagno dei Giochi da Tavolo (Next.js 14 + Google Gemini)",
        private: false,
        has_issues: true,
        has_projects: true,
        has_wiki: false
      })
    });

    if (!createRes.ok) {
      const err = await createRes.text();
      console.error(`❌ Impossibile creare il repository: ${createRes.status} ${err}`);
      process.exit(1);
    }
    repoData = await createRes.json();
    console.log(`✅ Repository creato con successo: ${repoData.html_url}`);
  } else if (repoCheck.ok) {
    repoData = await repoCheck.json();
    console.log(`ℹ️ Repository già esistente su GitHub: ${repoData.html_url}`);
  } else {
    console.error(`❌ Errore controllo repository: ${repoCheck.status}`);
    process.exit(1);
  }

  // 4. Git Remote e Push
  console.log('\n🚀 [3/4] Esecuzione git push verso origin/main...');
  try {
    try {
      execSync('git remote remove origin', { stdio: 'ignore' });
    } catch {
      // Ignora se origin non esisteva
    }

    const authRemoteUrl = `https://${username}:${GITHUB_TOKEN}@github.com/${username}/meeple-ai.git`;
    const cleanRemoteUrl = `https://github.com/${username}/meeple-ai.git`;

    execSync(`git remote add origin ${authRemoteUrl}`, { stdio: 'inherit' });
    execSync('git branch -M main', { stdio: 'inherit' });
    execSync('git push -u origin main', { stdio: 'inherit' });

    // Ripristina l'URL pulito senza token incorporato per sicurezza locale
    execSync(`git remote set-url origin ${cleanRemoteUrl}`, { stdio: 'ignore' });

    console.log('✅ Codice sorgente pubblicato con successo su GitHub!');
    console.log(`👉 Link GitHub: ${cleanRemoteUrl}`);
  } catch (err) {
    console.error('❌ Errore durante il push Git:', err.message);
    process.exit(1);
  }

  // 5. Deploy su Render.com via API (se RENDER_API_KEY fornito)
  if (RENDER_API_KEY) {
    console.log('\n☁️ [4/4] Creazione automatica Web Service su Render.com via API...');
    try {
      // Recupero ownerId
      const ownersRes = await fetch('https://api.render.com/v1/owners', {
        headers: {
          'Authorization': `Bearer ${RENDER_API_KEY}`,
          'Accept': 'application/json'
        }
      });

      if (!ownersRes.ok) {
        throw new Error(`Impossibile recuperare owner da Render: ${ownersRes.status} ${await ownersRes.text()}`);
      }

      const owners = await ownersRes.json();
      if (!owners || owners.length === 0) {
        throw new Error('Nessun workspace/owner trovato nel tuo account Render.');
      }
      const ownerId = owners[0].owner.id;
      const ownerName = owners[0].owner.name || owners[0].owner.email;
      console.log(`   Workspace Render rilevato: ${ownerName} (ID: ${ownerId})`);

      // Verifica se servizio già esistente
      const servicesRes = await fetch('https://api.render.com/v1/services?name=meeple-ai', {
        headers: {
          'Authorization': `Bearer ${RENDER_API_KEY}`,
          'Accept': 'application/json'
        }
      });

      let existingService = null;
      if (servicesRes.ok) {
        const servicesList = await servicesRes.json();
        existingService = (servicesList || []).find(s => s.service && s.service.name === 'meeple-ai');
      }

      if (existingService) {
        const s = existingService.service;
        console.log(`ℹ️ Servizio Render già presente: ${s.name} (${s.serviceDetails?.url || 'in deploy'})`);
        console.log(`   Triggering deploy su servizio esistente...`);
        await fetch(`https://api.render.com/v1/services/${s.id}/deploys`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${RENDER_API_KEY}`,
            'Accept': 'application/json'
          }
        });
        console.log(`✅ Deploy riavviato su Render: ${s.serviceDetails?.url}`);
      } else {
        console.log('   Creazione nuovo Web Service Node.js su Render...');
        const payload = {
          type: 'web_service',
          name: 'meeple-ai',
          ownerId: ownerId,
          repo: `https://github.com/${username}/meeple-ai`,
          branch: 'main',
          autoDeploy: 'yes',
          serviceDetails: {
            env: 'node',
            plan: 'free',
            region: 'frankfurt',
            buildCommand: 'npm install && npm run build',
            startCommand: 'npm run start',
            envVars: [
              { key: 'NODE_ENV', value: 'production' },
              { key: 'GEMINI_API_KEY', value: geminiApiKey },
              { key: 'GEMINI_MODEL', value: 'gemini-3.6-flash' }
            ]
          }
        };

        const createServiceRes = await fetch('https://api.render.com/v1/services', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${RENDER_API_KEY}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        if (!createServiceRes.ok) {
          const err = await createServiceRes.text();
          throw new Error(`Creazione servizio Render fallita: ${createServiceRes.status} ${err}`);
        }

        const newService = await createServiceRes.json();
        const liveUrl = newService.serviceDetails?.url || `https://meeple-ai.onrender.com`;
        console.log('✅ Web Service creato con successo su Render.com!');
        console.log(`🌐 URL Live: ${liveUrl}`);
      }
    } catch (renderErr) {
      console.error('⚠️ Avviso Render API:', renderErr.message);
      console.log('ℹ️ Il codice è comunque su GitHub! Puoi collegarlo manualmente in 1 click su dashboard.render.com');
    }
  } else {
    console.log('\nℹ️ [4/4] RENDER_API_KEY non fornita.');
    console.log('   Per collegare Render:');
    console.log('   1. Vai su https://dashboard.render.com -> "New +" -> "Web Service"');
    console.log(`   2. Seleziona https://github.com/${username}/meeple-ai`);
    console.log('   3. Inserisci la variabile GEMINI_API_KEY e clicca Create!');
  }

  console.log('\n==============================================');
  console.log('🎉 PROCEDURA COMPLETATA CON SUCCESSO!');
  console.log('==============================================');
}

main().catch(err => {
  console.error('FATAL:', err);
  process.exit(1);
});
