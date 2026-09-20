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

---

## 📊 Stato Avanzamento (Sprint 1 & 2 Completati)
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

---

## 🔮 Prossimi Passi (Roadmap)
1. **Ricerca regole avanzata / Caricamento PDF:** Possibilità di caricare il PDF del regolamento di un gioco inedito o autoprodoto.
2. **Timer Turno / Segnapunti integrato:** Utility a schermo durante le partite per contare i punti o tenere traccia del tempo per turno.
3. **Deploy su Render.com / Vercel:** Messa online con dominio pubblico gratuito.
