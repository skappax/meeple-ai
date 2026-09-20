# 🎲 MeepleAI — L'Arbitro e Compagno dei Giochi da Tavolo

MeepleAI è un'applicazione web in stile ChatGPT alimentata dall'intelligenza artificiale di **Google Gemini**, appositamente istruita e ottimizzata per il mondo dei **giochi da tavolo** (da Catan, Carcassonne e Wingspan fino a Scythe, Dune: Imperium, Terraforming Mars e Nemesis).

---

## 🚀 Funzionalità Principali

1. ⚖️ **L'Arbitro delle Regole (Rule Arbiter):**
   - Risolve al volo casi limite, dubbi su turni, poteri speciali ed eccezioni durante la partita.
   - Fornisce prima il verdetto sintetico in una riga (per non interrompere a lungo il tavolo) e poi il riferimento approfondito.

2. ⏱️ **Spiega in 3 Minuti (How-To-Play Express):**
   - Riassunto per spiegare le regole essenziali a nuovi giocatori senza leggere 30 pagine di manuale (Ambientazione, Obiettivo, Turno tipo, 1 trucco strategico).

3. 🎲 **"Cosa Giochiamo Stasera?" (Matchmaker):**
   - Suggeritore intelligente basato su numero giocatori, durata desiderata, livello di complessità (peso BGG) e tipologia (party game, cooperativo, german, ameritrash).

4. 📦 **Setup Rapido:**
   - Checklist di preparazione ordinata e numerata per apparecchiare il tavolo senza intoppi.

5. 💬 **Interfaccia ChatGPT-like a tema Board Game:**
   - Sidebar con cronologia delle partite/chat salvata in locale (LocalStorage).
   - Formattazione avanzata con supporto Tabelle, Elenchi puntati e Quote evidenziati per regole chiave.
   - Pulsante copia risposta rapido.
   - Supporto per selezionare il gioco specifico attivo per contestualizzare ogni risposta.
   - Switcher modelli Google Gemini (Gemini Flash con fallback automatico).

---

## 🛠️ Stack Tecnologico

- **Framework:** Next.js 14 (App Router)
- **Linguaggio:** TypeScript
- **Styling:** Tailwind CSS (Dark theme a tema board game, accenti dorati/ambra)
- **Icone:** Lucide React
- **Markdown:** React-Markdown + Remark-GFM
- **IA:** Google Gemini REST API (`gemini-flash-latest`, `gemini-3.6-flash`) con prompt specializzati.

---

## 🏃 Avvio in Locale

```bash
cd meeple-ai
npm install
npm run dev
```

Apri nel browser:
- Sul server: `http://localhost:3000`
- Da rete locale (Windows/Mac/Mobile): `http://192.168.1.174:3000`

---

## 🔑 Variabili d'Ambiente (`.env.local`)

```env
GEMINI_API_KEY=tua_chiave_google_ai_studio
GEMINI_MODEL=gemini-flash-latest
```
