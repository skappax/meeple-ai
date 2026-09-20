# 🚀 Guida al Deploy Online su Render.com (100% Gratuito)

Questa guida spiega passo-passo come pubblicare **MeepleAI** online su **Render.com** a costo zero, sincronizzato automaticamente con GitHub ad ogni `git push`.

---

## 1. Perché Render.com per MeepleAI
* **Server Node.js 14 / Next.js reale**: Supporta streaming, chiamate multimodali (foto, PDF) e le API di Google Gemini.
* **Piano Free Tier**: Hosting web gratuito con certificato SSL/HTTPS automatico.
* **Deploy Continuo (CI/CD)**: Ogni volta che fai un `git push` su GitHub, Render compila e aggiorna il sito live in automatico.
* **Dominio Pubblico Gratuito**: Ti assegna un URL del tipo: `https://meeple-ai.onrender.com`.

---

## 2. Configurazione Rapida (4 Passaggi)

### Passo 1: Crea il repository su GitHub
1. Vai su [github.com/new](https://github.com/new).
2. Nome repository: `meeple-ai` (o `meepleai`).
3. Impostalo come **Public** (o Private se preferisci).
4. **Non** selezionare "Add a README" o ".gitignore" (il progetto locale contiene già tutto pronto).
5. Crea il repository.

### Passo 2: Collega il repository da locale
Sul terminale del progetto (o dal server):
```bash
git remote add origin https://github.com/skappax/meeple-ai.git
git branch -M main
git push -u origin main
```

### Passo 3: Crea il Web Service su Render.com
1. Accedi a [dashboard.render.com](https://dashboard.render.com).
2. Clicca su **"New +"** in alto a destra e seleziona **"Web Service"**.
3. Seleziona il repository **`meeple-ai`** (se usi Blueprint, Render riconoscerà automaticamente il file `render.yaml`).
4. Se configuri manualmente, inserisci questi parametri:
   * **Name**: `meeple-ai`
   * **Region**: `Frankfurt (EU)`
   * **Branch**: `main`
   * **Runtime**: `Node`
   * **Build Command**: `npm install && npm run build`
   * **Start Command**: `npm run start`
   * **Instance Type**: `Free`

### Passo 4: Variabili d'Ambiente (Environment Variables)
Nella sezione **"Environment Variables"** del servizio su Render, aggiungi:
* `GEMINI_API_KEY`: Inserisci la tua API Key di Google AI Studio
* `GEMINI_MODEL`: `gemini-3.6-flash` (opzionale, predefinito nel codice)
* `NODE_ENV`: `production`

---

## 3. Risultato Live
Render avvierà la compilazione (`next build`) e in 2 minuti il tuo assistente sarà raggiungibile su:
👉 `https://meeple-ai.onrender.com` (o l'URL generato da Render).
