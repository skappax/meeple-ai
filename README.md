# 🎲 MeepleAI — L'Esperto e Compagno dei Giochi da Tavolo

MeepleAI è una web application mobile-first alimentata da **Google Gemini**, appositamente progettata e ottimizzata per i giocatori al tavolo da gioco. Risolve controversie istantaneamente, spiega regole, guida nel setup e analizza foto di plance e carte in tempo reale.

---

## 🚀 Funzionalità Principali

1. ⚖️ **L'Arbitro delle Regole (Rule Arbiter):**
   - Risolve al volo casi limite, dubbi sui turni, poteri speciali ed eccezioni durante la partita.
   - Fornisce prima il **verdetto sintetico** in una riga (per non interrompere il tavolo) e cita sempre il **riferimento ufficiale** alla regola in calce.

2. 🎙️ **Multimodalità Totale (Voce, Foto, PDF):**
   - **Microfono (STT):** Fai domande a voce direttamente dal tavolo con riconoscimento vocale `it-IT`.
   - **Sintesi Vocale (TTS):** Ascolta il verdetto dell'arbitro letto ad alta voce (sotto i 15 secondi per non disturbare la partita).
   - **Fotocamera e Vision:** Scatta o carica una foto di carte, tessere o plancia per un'analisi visiva immediata da parte di Gemini.
   - **Caricamento PDF:** Importa regolamenti ufficiali in formato PDF (fino a 15 MB) per interrogare direttamente il testo delle regole.

3. 🔄 **Rilevamento Intento e Cambio Automatico di Modalità:**
   - Il sistema comprende automaticamente cosa chiedi (es. una domanda di preparazione durante la partita commuta in automatico su Setup) e imposta la cornice colorata dedicata:
     - ⚖️ **Arbitro Regole** (Verde Smeraldo)
     - 📦 **Setup Partita** (Arancione)
     - ⏱️ **Spiega in 3 Minuti** (Blu Cobalto)
     - 📄 **Scheda Riassuntiva** (Ciano)
     - 🎲 **Consigli Gioco** (Viola)
     - 💬 **Esperto Libero** (Ambra)

4. 🛡️ **Guardrail Specializzato:**
   - Totalmente focalizzato sul mondo dei giochi da tavolo con intercettatore a 0ms e limiti per preservare le quote API (max 2000 caratteri per messaggio).

---

## 🛠️ Stack Tecnologico

- **Framework:** Next.js 14 (App Router)
- **Linguaggio:** TypeScript (Strict mode)
- **Styling:** Tailwind CSS (Dark theme a tema board game con cornici neon dinamiche)
- **Audio & Media:** Web Speech API (STT & TTS) + Client-side Canvas Image Compression
- **IA:** Google Gemini API (`gemini-3.6-flash`) con supporto multimodale nativo (testo, immagini, PDF).

---

## 🏃 Avvio in Locale

```bash
cd meeple-ai
npm install
npm run dev
```

Apri nel browser:
- Locale: `http://localhost:3000`
- Da rete locale (Mobile / Tablet): `http://192.168.1.174:3000`

---

## 🚀 Deploy su Render.com

Il progetto è preconfigurato per il deploy gratuito con CI/CD da GitHub su Render.com:
- Consulta la guida completa in [`RENDER_DEPLOY.md`](file:///workspace/projects/WebSites/meeple-ai/RENDER_DEPLOY.md).
- È presente anche il Blueprint [`render.yaml`](file:///workspace/projects/WebSites/meeple-ai/render.yaml) per la configurazione automatica in 1 clic.
