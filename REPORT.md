# 📋 MeepleAI — Diario di Bordo e Registro Decisioni Architetturali (ADR)

Questo documento traccia in modo persistente **tutte le decisioni tecniche, architetturali e di design** prese per il progetto **MeepleAI**. Viene aggiornato ad ogni avanzamento.

---

## 📅 Informazioni Progetto
- **Nome Progetto:** MeepleAI (directory `meeple-ai`)
- **Data Inizio:** 2026-09-20
- **Obiettivo:** Creare un assistente AI specializzato nei giochi da tavolo (arbitro delle regole, spiegazione rapida, raccomandazioni e setup) con interfaccia stile ChatGPT basata su Google Gemini.
- **Server:** Proxmox-Server (LXC container 102, IP `192.168.1.174`)
- **Porta:** `3000` (Accessibile via `http://192.168.1.174:3000` o `http://localhost:3000`)

---

## 🏛️ Registro delle Decisioni Architetturali (ADR)

### ADR 001 — Scelta dello Stack Tecnologico
- **Data:** 2026-09-20
- **Decisione:** Next.js 14 (App Router) + TypeScript + Tailwind CSS + Lucide Icons + React-Markdown (con `remark-gfm`).
- **Motivazione:** Coerenza con l'ecosistema del workspace `WebSites` (già rodato con *RobaAGratis*), compilazione ottimizzata, supporto nativo a Server Routes `/api/chat` e rendering reattivo senza overhead.

### ADR 002 — Scelta del Provider AI e Gestione Modelli
- **Data:** 2026-09-20
- **Decisione:** Google Gemini API tramite chiamate REST standard su endpoint v1beta con API Key in `.env.local`.
- **Modello Primario:** `gemini-flash-latest` (con supporto e test validati su `gemini-3.6-flash` e `gemini-3.5-flash-lite`).
- **Strategia di Fallback:** In caso di picchi temporanei di carico sul modello primario (errori 429/503), il client `src/lib/gemini.ts` effettua un fallback trasparente su `gemini-flash-latest` per garantire che l'utente non riceva mai risposte bloccate.
- **Motivazione:** Il Free Tier di Google AI Studio fornisce generosi limiti gratuiti; la chiamata REST nativa via `fetch` evita dipendenze da SDK esterni soggetti a deprecazioni.

### ADR 003 — Architettura dei Prompt e Modalità Specializzate
- **Data:** 2026-09-20
- **Decisione:** Implementazione di 4 modalità specializzate guidate dal system prompt dinamico (`src/lib/gemini.ts`):
  1. ⚖️ **Arbitro Regole (`rules`):** Temperatura abbassata a 0.3 per evitare allucinazioni; formato rigoroso (Verdetto in 1 riga -> Riferimento regola -> Eccezioni).
  2. ⏱️ **Spiega in 3 Minuti (`explain`):** Struttura fissa (Ambientazione -> Come si vince -> Il Turno tipo -> Consiglio per novizi).
  3. 🎲 **Cosa Giochiamo Stasera? (`recommend`):** Matchmaker su giocatori, durata, complessità (peso BGG) e cooperativo/competitivo.
  4. 📦 **Setup Rapido (`setup`):** Checklist numerata e ordinata per apparecchiare il tavolo.
- **Contesto Gioco:** Aggiunto un chip opzionale `gameContext` che vincola tutte le risposte al regolamento del titolo attivo (es. *"Catan"*, *"Wingspan"*, *"Nemesis"*).

### ADR 004 — UI/UX & Board Game Theme
- **Data:** 2026-09-20
- **Decisione:** 
  - Dark theme moderno con accenti dorati/ambra (`#fbbf24`, `#f59e0b`, `#fef08a`) ispirati ai materiali in legno dei meeple e ai token di gioco.
  - Avatar personalizzato con icona dado 🎲 per le risposte dell'assistente.
  - Formattazione Markdown avanzata in `globals.css` per tabelle di punteggio, blocchi citazione con bordo dorato ed elenchi ordinati.
  - Tasto rapido "Copia risposta" con feedback visivo.
  - Starter cards in homepage con domande frequenti cliccabili per iniziare subito senza dover digitare.

### ADR 005 — Persistenza Dati e Privacy
- **Data:** 2026-09-20
- **Decisione:** Persistenza locale tramite `localStorage` (`meeple_ai_conversations`, `meeple_ai_settings`).
- **Motivazione:** Zero necessità di login obbligatorio o complessità di database per la v1. Tutte le chat, titoli auto-generati e impostazioni rimangono nel browser del giocatore e persistono tra i riavvii della pagina.

### ADR 006 — Mappatura Fonti Specializzate e Strategia Dati
- **Data:** 2026-09-20
- **Decisione:** Censire e strutturare le fonti di riferimento in `meeple-ai/SOURCES.md`, articolate in 4 livelli:
  1. *Database & API Mondiali:* BoardGameGeek (BGG XML API2 per statistiche, peso, voto, player count community; Rules Forum per verdetti ufficiali degli autori).
  2. *Fonti Italiane:* La Tana dei Goblin (regolamenti tradotti, player aid, forum dubbi regole), Gioconomicon, IoGioco.
  3. *Repository Editoriali:* Cataloghi e sezioni Errata/FAQ ufficiali (Asmodee Italia, Cranio Creations, Giochi Uniti, DV Games, Stonemaier, Leder Games).
  4. *Piattaforme di Sintesi & Codice:* The Esoteric Order of Gamers (schede di setup rapido), Board Game Arena (codice di gioco come prova del nove).
### ADR 007 — BGG Game Data Engine & GameCard Widget
- **Data:** 2026-09-20
- **Decisione:** Implementazione dell'endpoint `/api/game-info` con architettura a triplo livello:
  1. *Database pre-seeding:* I 7 giochi più celebri (Catan, Wingspan, Carcassonne, Terraforming Mars, Dune: Imperium, Nemesis, Azul) rispondono istantaneamente in 0ms senza chiamate esterne.
  2. *BGG Engine dinamico con AI Fallback Hierarchy:* Per qualunque altro gioco al mondo, il motore interroga la base di conoscenza BGG con catena di fallback `gemini-3.5-flash-lite` -> `gemini-flash-latest` -> `gemini-3.6-flash`.
  3. *In-memory Runtime Cache:* Ogni gioco cercato viene salvato in cache per risposte successive istantanee.
- **Frontend GameCard Widget:** Componente espandibile a tema con barra visiva di complessità (peso 1-5), voto BGG, giocatori ideali secondo la community, durata, tag meccaniche e 4 pulsanti di azione immediata (*Dubbio Regole*, *Spiega in 3 min*, *Setup Rapido*, *Consigli & Strategie*).

### ADR 008 — Mobile-First Home Simplification & Unified Table Experience
- **Data:** 2026-09-20
- **Decisione:** Riprogettazione radicale della Home per l'uso esclusivo e fluido da smartphone al tavolo da gioco:
  1. *Zero Scrolling Necessario:* Tutto il layout iniziale (Logo compatto, selettore di gioco, 4 pulsanti di azione e input bar) rientra interamente nella schermata di qualsiasi smartphone (390px-844px) senza costringere a scorrere per trovare l'input.
  2. *Selettore Gioco Immediato a 1 Tap:* Barra orizzontale di chip popolari con emoji (🌾 Catan, 🪶 Wingspan, 🏰 Carcassonne, 🚀 Terraforming Mars, 🪐 Dune, 🎨 Azul, 👽 Nemesis...) con ricerca integrata per qualsiasi altro gioco.
  3. *Banner Contestuale Integrato:* Selezionando un gioco, appare un banner compatto con voto BGG, peso complessità, durata e giocatori, eliminando i widget duplicati che prima occupavano mezza schermata.
  4. *Azioni Rapide Contestuali (Griglia 2x2):* I 4 pulsanti (Arbitro Regole, Spiega in 3 min, Setup Rapido, Consigli/Tattiche) si adattano dinamicamente al gioco attivo.
  5. *Header & Chat Input Mobile-Friendly:* Prevenzione del bug di auto-zoom su Safari iOS (`text-base sm:text-sm`) e barra input pulita senza tasti ridondanti.
  6. *GameCard in Chat collassata di default:* Mostra una riga sintetica con le metriche principali per lasciare il 100% dello spazio di lettura ai chiarimenti sulle regole.

### ADR 009 — Minimalist Home with Non-Clickable Examples
- **Data:** 2026-09-20
- **Decisione:** Massima semplificazione della Home page su richiesta utente per eliminare ogni distrazione visiva:
  1. *Rimozione bottoni e giochi cliccabili:* Rimosse le scorciatoie/pulsanti cliccabili e il carosello dei giochi, lasciando piena centralità al campo di input.
  2. *Esempi statici non cliccabili:* Inseriti in top page 4 esempi testuali (`pointer-events-none select-none`) che mostrano chiaramente all'utente le tipologie di richieste possibili (dubbio regole, spiegazione rapida, checklist setup, consiglio di gioco).

### ADR 010 — Verified Official Rules Knowledge Base & High-Precision Arbiter Protocol
- **Data:** 2026-09-20
- **Problema:** I modelli LLM non vincolati da grounding rischiavano di confondere casi limite complessi (es. la differenza tra costruire una strada attraverso una colonia nemica vs l'interruzione della strada più lunga in Catan).
- **Decisione:**
  1. *Base di Conoscenza Regole Verificate (`src/lib/rules-kb.ts`):* Mappatura dei casi limite e delle FAQ ufficiali (Almanacchi ufficiali, BGG Official Rules Forums, La Tana dei Goblin) per i titoli più giocati al mondo.
  2. *Iniezione Automatica di Grounding:* Il backend analizza l'ultimo messaggio dell'utente e inietta istantaneamente le regole certificate dell'Almanacco nel contesto di sistema.
  3. *Protocollo Ufficiale Arbitro:* Le risposte sulle regole iniziano obbligatoriamente con il verdetto perentorio (**🎯 VERDETTO: NO, non è consentito / SÌ, è consentito**) in prima riga per consultazione rapida da cellulare, seguito dalla regola ufficiale, dalla spiegazione dell'errore comune e da cosa fare subito al tavolo.
  4. *Modello di Produzione & Cascata Multi-Tier:* Utilizzo di `gemini-flash-latest` (Gemini 3.8 con reasoning profondo) con catena automatica di fallback (`gemini-3.5-flash` -> `gemini-3.5-flash-lite`) per garantire zero interruzioni e quote elevate.

### ADR 011 — Permanent Icon Rail & Single Auto-Rotating Example Ticker
- **Data:** 2026-09-20
- **Decisione:**
  1. *Colonna Icone Permanente (Icon Rail):* Sostituzione della sidebar ad apertura/chiusura con una colonna verticale fissa di sole icone (48px su mobile / 56px su desktop). Cambio modalità e nuova chat sono a portata di 1 tap immediato senza cassetti da dover chiudere. La cronologia si apre come pannello flyout solo quando richiesto.
  2. *Box Singolo con Esempi a Rotazione (10 Esempi):* Eliminazione delle card verticali ingombranti in favore di un unico box compatto da ~44px di altezza con timer automatico di scorrimento (4s), frecce manuali (`‹ ›`) e 10 esempi reali su più giochi (*Catan, Carcassonne, Wingspan, Terraforming Mars, Dune, Azul, 7 Wonders, Scythe*).

### ADR 012 — 6ª Modalità ("Scheda Gioco"), Header Mode Selector Interattivo e Distinzione Logo vs Nuova Partita
- **Data:** 2026-09-20
- **Decisione:**
  1. *6ª Modalità Specializzata (`summary` — Scheda Gioco):* Integrata a pieno titolo tra le modalità ufficiali (accanto ad Arbitro Regole, Spiega in 3 min, Setup Rapido, Consigli e Generale). Fornisce una scheda tecnica stile BGG con Rank, Peso/Complessità (1-5), Durata reale, Giocatori ideali community, Meccaniche chiave e sintesi in 3 righe.
  2. *Header Mode Selector Interattivo:* Il badge della modalità attiva in alto a destra non è più solo una label statica, ma un dropdown touch interattivo che consente di cambiare modalità direttamente dall'header con feedback visivo e chiusura al tap esterno.
  3. *Chiarimento Ergonomico Dado (`🎲`) vs Più (`+`):* Il dado in cima alla rail è ora l'identificativo visivo del brand MeepleAI, mentre il tasto `+` sottostante è l'unico punto di ingresso dedicato per iniziare una "Nuova partita / Nuova chat", eliminando ogni ambiguità d'uso.
  4. *Aggiornamento Tagline Ufficiale:* Applicato il nuovo claim memorizzato: *"L'esperto dei giochi da tavolo sempre al tuo fianco"*.

### ADR 013 — Guardrail di Dominio Ferreo (Esclusività Giochi da Tavolo), Limiti di Richiesta e Rimozione Popup 'Specifica Gioco'
- **Data:** 2026-09-20
- **Problema:** L'utente ha segnalato che chiedendo "mi sviluppi un sito web?" l'AI, trovandosi in modalità arbitro, ha risposto con "VERDETTO: SÌ..." fornendo codice HTML/JS completo, uscendo totalmente dal contesto di esperto di giochi da tavolo. Inoltre il pulsante con popup "+ Specifica Gioco" sopra la barra input risultava inutile ed ingombrante da mobile.
- **Decisione:**
  1. *Guardrail Assoluto di Dominio:* Istituito un vincolo insormontabile nei system prompt di Gemini e un interceptor deterministico a 0ms per query di sviluppo software, siti web e compiti generici. Se l'utente pone domande off-topic, MeepleAI rifiuta categoricamente con fermezza e simpatia, ricordando che è specializzato al 100% sui giochi da tavolo (niente codice, niente verdetti fittizi).
  2. *Limitazione Richieste Backend (`/api/chat`):* Aggiunta validazione dei messaggi (lunghezza massima 2000 caratteri per prevenire attacchi di prompt injection ed esaurimento token; profondità massima conversazione di 60 messaggi).
  3. *Rimozione Definitiva di '+ Specifica Gioco' e del Popup:* Eliminato il pulsante e il popup text-input sopra la barra chat; se un gioco è agganciato viene visualizzato unicamente il chip compatto con `[X]` per liberarlo, garantendo un'interfaccia 100% pulita e priva di ingombri per l'uso da smartphone.
  4. *Test di Regressione (8/8 Passati):* Aggiunti Test 7 e Test 8 nella suite `scripts/test-e2e.js` per verificare il rifiuto categorico di richieste web dev e il rigetto di payload spropositati.

---

### ADR 014 — Suite Multimodale Completa: Microfono (STT), Fotocamera (Gemini Vision), Import PDF e Sintesi Vocale Intelligente (TTS)
- **Data:** 2026-09-20
- **Decisione:** Implementazione del pacchetto multimodale completo per trasformare MeepleAI in un assistente "hands-free" al tavolo:
  1. *Microfono (Speech-to-Text):* Integrazione della Web Speech API nativa (`SpeechRecognition`) in lingua italiana. Tappando l'icona microfono nella barra chat, MeepleAI ascolta in tempo reale con animazione a pulsazione rossa, trascrivendo fedelmente la domanda senza dover digitare.
  2. *Fotocamera & Visione Multimodale (Gemini Vision):* Pulsante dedicato per scattare una foto al tabellone o a una carta dal vivo su mobile o caricare dalla galleria. Compressione automatica client-side via HTML5 Canvas (max 1280px JPEG) per azzerare la latenza di upload. Inoltro inline a Gemini API per analisi visiva immediata della partita.
  3. *Import File PDF:* Supporto nativo al caricamento di regolamenti PDF con chip di anteprima e invio a Gemini come contesto documentale prioritario.
  4. *Sintesi Vocale Intelligente (Text-to-Speech):* Tramite `window.speechSynthesis`, se la domanda è stata dettata con il microfono (o premendo il tasto "Ascolta" 🔊 sul messaggio), MeepleAI legge a voce alta il verdetto. L'algoritmo di estrazione estrae prioritariamente il **Verdetto secco e la Regola chiave** (sintesi di 10-15 secondi) per non interrompere il flusso della partita al tavolo.
  5. *Test Suite QA Estesa (10/10 PASSED):* Aggiunti test per l'elaborazione di payload visivi base64 e per la logica di estrazione del verdetto audio senza sintassi markdown.

### ADR 015 — Citazione Obbligatoria del Riferimento alla Regola / Fonte in Coda alle Risposte
- **Data:** 2026-09-20
- **Decisione:** Su richiesta dell'utente, l'assistente ora include obbligatoriamente in coda (footer) a ciascuna risposta una citazione chiara, elegante ed autorevole della fonte o del regolamento ufficiale:
  1. *Protocollo Arbitro:* Punto 5 integrato nel protocollo di arbitraggio: concluso con una riga orizzontale (`---`) seguita dall'icona pergamena `📜 **Riferimento:** *[Manuale Ufficiale Gioco, Sezione/Paragrafo, pag. X / Almanacco FAQ / BGG Rules Forum]*`.
  2. *Grounding KB:* La base di conoscenza regole convalidate inietta la citazione esatta da riportare in coda per le regole pre-censite.
  3. *In tutte le modalità:* Anche in Spiegazione (Manuale Ufficiale), Setup (Scheda di Preparazione) e Scheda Tecnica (Fonte Metriche: BoardGameGeek) viene apposta la citazione in calce.
  4. *TTS Audio Isolation:* L'algoritmo di sintesi vocale (`extractSpokenSummary`) esclude la citazione in coda dalla lettura a voce alta, garantendo che l'audio resti rapido e focalizzato sul solo verdetto secco (10-15s), mentre la citazione rimane consultabile visivamente sullo schermo.

### ADR 016 — Cambio Automatico Modalità da Intento (Auto Mode Switching) e Cornici Cromatiche Distintive
- **Data:** 2026-09-20
- **Decisione:** Risolto il disallineamento quando l'utente si trova in una modalità (es. *Arbitro Regole*) e pone una domanda di tutt'altra natura (es. *Setup Rapido* o *Scheda BGG*):
  1. *Rilevamento Automatico dell'Intento (`detectModeFromQuery`):* Il client analizza il testo del messaggio e rileva se l'intento appartiene a un'altra modalità (`setup`, `rules`, `explain`, `summary`, `recommend`). Se rilevato, commuta automaticamente la modalità attiva, aggiornando la conversazione e applicando il system prompt specializzato corrispondente.
  2. *Cornice Cromatica Distintiva per Modalità:* Ogni modalità possiede una palette colore univoca ed esclusiva:
     - ⚖️ **Arbitro Regole:** Verde Smeraldo (`#10b981`)
     - 📦 **Setup Rapido:** Arancione Fuoco (`#f97316`)
     - ⏱️ **Spiega in 3 Min:** Blu Elettrico (`#3b82f6`)
     - 📄 **Scheda Gioco:** Ciano Acqua (`#06b6d4`)
     - 🎲 **Cosa Giochiamo?:** Viola Indaco (`#a855f7`)
     - 💬 **Tavolo Libero:** Ambra Oro (`#f59e0b`)
  3. *Applicazione Visiva della Cornice:*
     - **Barra Superiore & Ambient Frame:** Riga d'accento luminosa da 3px con bagliore neon in cima all'area di gioco.
     - **Header Mode Badge:** Il pulsante in alto a destra adotta bordo, sfondo e glow del colore attivo.
     - **Bubble Messaggi Assistente:** Bordo sinistro accentuato (`border-l-4`) e contorno con glow abbinato alla modalità del messaggio.
     - **Input Bar & Pulsante Invio:** Il contenitore di scrittura e il tasto freccia assumono il colore della modalità attiva.
  4. *Test di Regressione (12/12 PASSED):* Inclusi Test 11 e 12 per convalidare lo switch automatico da Regole a Setup e viceversa.

---

## 🌐 Istanze Attive & Collegamenti
- 🌐 **Deploy Live (Render.com):** [https://meeple-ai.onrender.com](https://meeple-ai.onrender.com) (SSL, CDN Cloudflare, auto-deploy da `main`)
- 📦 **Repository GitHub:** [https://github.com/skappax/meeple-ai](https://github.com/skappax/meeple-ai) (CI/CD abilitata)
- 🖥️ **Server Locale (Proxmox LXC 102):** `http://192.168.1.174:3000` (gestito dal servizio systemd `meeple-ai.service`)

---

## 📊 Stato Avanzamento (Sprint 1–8 Completati con Successo)
- [x] Scaffolding Next.js 14 con TypeScript e Tailwind CSS
- [x] Integrazione e test convalidato della chiave Google Gemini API
- [x] Endpoint backend `/api/chat` con prompt specializzati e fallback
- [x] Sidebar con cronologia conversazioni e cambio modalità
- [x] Render Markdown con supporto tabelle ed elenchi
- [x] Chip contestuale per agganciare un gioco specifico con pillole popolari rapide
- [x] Motore dati BoardGameGeek (`/api/game-info`) con cache in memoria
- [x] Widget interattivo `GameCard` con metriche BGG e azioni a 1 click
- [x] Modale impostazioni (modello e override chiave API)
- [x] Build di produzione (`npm run build`) validata senza errori
- [x] Server di sviluppo attivo su porta `3000` (IP `192.168.1.174:3000`)
- [x] Mappatura fonti specializzate in `SOURCES.md` e diario ADR in `REPORT.md`
- [x] **Semplificazione Mobile-First: Colonna Icone fissa (senza cassetti da chiudere)**
- [x] **Box Singolo compatto con 10 Esempi a Scorrimento Automatico**
- [x] **Integrazione Knowledge Base Regole Verificate (BGG & Manuali Ufficiali) con Protocollo Arbitro Imparziale**
- [x] **6ª Modalità 'Scheda Gioco' con metriche BGG e sintesi**
- [x] **Selettore Modalità interattivo nell'header in alto a destra**
- [x] **Aggiornamento Tagline: "L'esperto dei giochi da tavolo sempre al tuo fianco"**
- [x] **Guardrail di Dominio Ferreo (rifiuto categorico richieste non ludiche o sviluppo software)**
- [x] **Limiti di sicurezza e validazione richieste (max 2000 caratteri per messaggio)**
- [x] **Rimozione pulsante e popup inutile '+ Specifica Gioco' per massima pulizia mobile**
- [x] **Microfono (Speech-to-Text) con trascrizione vocale in tempo reale**
- [x] **Fotocamera e Visione Gemini (analisi fotografica del tabellone e carte)**
- [x] **Import File (caricamento regolamenti PDF e immagini compresse)**
- [x] **Sintesi Vocale (Text-to-Speech) con lettura automatica e verdetto rapido in 10-15s**
- [x] **Citazione obbligatoria in coda con riferimento alla regola e manuale (📜 Riferimento: ...)**
- [x] **Cambio automatico modalità da intento dell'utente (es. domanda di setup da regole)**
- [x] **Cornice cromatica distintiva e palette colori dedicata per ciascuna delle 6 modalità**
- [x] **Preparazione al Deploy: Blueprint render.yaml e guida passo-passo RENDER_DEPLOY.md**
- [x] **Configurazione di sicurezza .gitignore per file .env e chiavi API**
- [x] **Script di pubblicazione autonoma via REST API (`scripts/publish-api.js`)**
- [x] **Pubblicazione Repository GitHub: `https://github.com/skappax/meeple-ai`**
- [x] **Deploy Live Operativo su Render.com: `https://meeple-ai.onrender.com` con HTTPS e Google Gemini integrato**
- [x] **Skill Antigravity aggiornate per GitHub & Render.com (REST API native)**

---

### ADR 017 — Deploy Autonomo via API e Risoluzione Caching/Aliases su Render
- **Data:** 2026-09-21
- **Contesto:** Il primo build su Render.com è fallito con `Module not found: Can't resolve '@/components/...'`. L'analisi dei log ha rivelato che Render applica `NODE_ENV=production` prima dell'installazione delle dipendenze, causando l'omissione di `devDependencies` (tra cui `typescript` e `tailwindcss`). Inoltre `tsconfig.json` era privo di `"baseUrl": "."`.
- **Decisione:**
  1. Aggiunto `"baseUrl": "."` a `tsconfig.json` per garantire una risoluzione deterministica degli alias path (`@/*`) su qualsiasi compilatore webpack/tsc.
  2. Spostate le dipendenze di compilazione essenziali (`typescript`, `@types/node`, `@types/react`, `@types/react-dom`, `postcss`, `tailwindcss`) in `dependencies`.
  3. Modificato il build command in `npm install --include=dev; npm run build` in `render.yaml` e nel payload API.
  4. Sviluppato `scripts/publish-api.js` per gestire l'intero ciclo CI/CD (GitHub API repo creation + push + Render API Web Service creation & env injection) in totale autonomia.
  5. Risultato: Servizio live al 100% su `https://meeple-ai.onrender.com` con test di inferenza Gemini superato.

---

## 🔮 Idee di Brainstorming & Roadmap per il Futuro

### 1. 📱 PWA (Progressive Web App) per Mobile
- **Idea:** Aggiungere `manifest.json` e icone tematiche (meeple dorato su sfondo scuro) per consentire l'installazione *"Aggiungi a Schermata Home"* su iOS e Android.
- **Vantaggio al tavolo:** Si apre a schermo intero come un'app nativa senza le barre del browser, massimizzando lo spazio per le chat e l'uso rapido con una mano.

### 2. ⏱️ Timer Turno & Orologio da Tavolo ("Antidoto all'Analysis Paralysis")
- **Idea:** Widget flottante o attivabile con un tocco per scandire il tempo per giocatore (es. 60s/90s/2m con rintocco audio discreto o timer cumulativo stile scacchi).
- **Vantaggio al tavolo:** Aiuta i gruppi a mantenere il ritmo della partita senza dover usare app timer esterne.

### 3. 🧮 Calcolatore Punti Vittoria (Scoring Sheet AI)
- **Idea:** Modulo di fine partita che guida nel calcolo dei punti vittoria per gioco selezionato (es. Wingspan, Agricola, 7 Wonders, Terraforming Mars). Può funzionare sia con inserimento a campi numerici sia scattando una foto al taccuino segnapunti cartaceo con trascrizione OCR via Gemini Vision.

### 4. 👥 Condivisione Sessione Partita via QR Code (Room Sharing)
- **Idea:** Generare un QR code visualizzabile a schermo che gli altri giocatori al tavolo possono inquadrare per accedere in sola lettura (o interattiva) alla sessione di gioco attiva, vedendo tutti i verdetti dell'arbitro emessi durante la serata.

### 5. 🗣️ Modalità "Mani Libere" Continua
- **Idea:** Possibilità di tenere attiva la modalità vocale senza dover premere il microfono ad ogni turno (o con wake-word *"Ehi Meeple"*), ideale per quando si hanno le mani impegnate a mescolare mazzi o piazzare miniature.

### 6. 🏆 Registro Partite & Statistiche del Gruppo (Game Log)
- **Idea:** Al termine della sessione, possibilità di salvare il riepilogo (gioco, giocatori, vincitore, durata, note divertenti) memorizzandolo nello storico locale o esportabile in CSV/JSON.

---

## 📌 Regola Aurea di Sviluppo (Antigravity Golden Rule)
> **Ogni volta che si implementa una nuova funzionalità o si prende una decisione architetturale:**
> 1. Aggiornare e spuntare la sezione **Stato Avanzamento** con i nuovi compiti completati.
> 2. Documentare la scelta tecnica nel registro **ADR** numerato progressivamente.
> 3. Rivedere e arricchire la sezione **Idee di Brainstorming & Roadmap per il Futuro**.
> 4. Verificare che le istanze attive (Cloud Render e Server Locale) siano allineate e operative.




