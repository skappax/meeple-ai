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

---

## 📊 Stato Avanzamento (Sprint 1 Completato)
- [x] Scaffolding Next.js 14 con TypeScript e Tailwind CSS
- [x] Integrazione e test convalidato della chiave Google Gemini API
- [x] Endpoint backend `/api/chat` con prompt specializzati e fallback
- [x] Sidebar con cronologia conversazioni e cambio modalità
- [x] Render Markdown con supporto tabelle ed elenchi
- [x] Chip contestuale per agganciare un gioco specifico
- [x] Modale impostazioni (modello e override chiave API)
- [x] Build di produzione (`npm run build`) validata senza errori
- [x] Server di sviluppo attivo su porta `3000` (IP `192.168.1.174:3000`)
- [x] Test end-to-end con esito positivo su domanda di regolamento (Carcassonne)

---

## 🔮 Prossimi Passi (Roadmap)
1. **Ricerca regole avanzata / Caricamento PDF:** Possibilità di caricare il PDF del regolamento di un gioco inedito o autoprodoto.
2. **Integrazione BGG (BoardGameGeek API):** Lettura automatica di statistiche, complessità e immagini copertina del gioco dal database mondiale di BoardGameGeek.
3. **Timer Turno / Segnapunti integrato:** Utility a schermo durante le partite per contare i punti o tenere traccia del tempo per turno.
4. **Deploy su Render.com / Vercel:** Messa online con dominio pubblico gratuito.
