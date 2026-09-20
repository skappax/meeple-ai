# 🗺️ Mappa delle Fonti Specializzate per MeepleAI

Questo documento censisce tutti i siti, database, API e archivi specializzati nel mondo dei **giochi da tavolo** (italiani e internazionali) da cui MeepleAI trae dati, regole, errata ufficiali, setup e raccomandazioni.

---

## 🌍 1. Grandi Database Mondiali & API

### 🎲 BoardGameGeek (BGG)
- **URL:** https://boardgamegeek.com
- **Ruolo:** La fonte di verità globale per i giochi da tavolo (+140.000 titoli censiti).
- **Cosa fornisce:**
  - **Dati oggettivi:** Anno di pubblicazione, autori, illustratori, editori, categoria, meccaniche (Worker Placement, Deck Building, Drafting, Area Control, ecc.).
  - **Metriche della Community:** Punteggio medio (Geek Rating), complessità ("Weight" da 1 a 5), sondaggi sul numero giocatori ideale (*"Best with 4, Recommended with 3-5"*).
  - **Forum Regole (Rules Forum):** Discussioni specifiche per ogni gioco con risposte e chiarimenti ufficiali degli autori e degli sviluppatori.
  - **Sezione Files:** Centinaia di aiuti di gioco, riassunti delle regole e schede di setup create da appassionati.
- **Integrazione MeepleAI:** 
  - **BGG XML API2** (`https://boardgamegeek.com/xmlapi2/`): API gratuita e pubblica senza autenticazione, perfetta per estrarre schede gioco in tempo reale e arricchire le risposte di MeepleAI con dati certi e immagini.

---

## 🇮🇹 2. Le Fonti Nazionali Italiane (Community, Traduzioni & News)

### 🧌 La Tana dei Goblin (TdG)
- **URL:** https://www.goblins.net
- **Ruolo:** La più storica e autorevole associazione e portale italiano sui giochi da tavolo.
- **Cosa fornisce:**
  - **Area Download:** Il più grande archivio italiano di regolamenti tradotti, fogli riassuntivi, player aid e traduzioni non ufficiali approvate dagli editori.
  - **Forum TdG (Dubbi su Regolamenti):** Migliaia di thread in italiano su casi limite risolti dalla community di esperti e arbitri italiani.
  - **Recensioni e "Goblinpedia":** Analisi del "peso", longevità, difetti e pregi.

### 📰 Gioconomicon
- **URL:** https://www.gioconomicon.net
- **Ruolo:** Giornale online d'informazione su giochi da tavolo, di ruolo e modellismo.
- **Cosa fornisce:** Notizie in tempo reale sulle localizzazioni italiane, uscite dei giochi, fiere nazionali (Play Modena, Lucca Comics & Games) e internazionali (Essen SPIEL).

### 🎲 IoGioco
- **URL:** https://www.iogioco.it
- **Ruolo:** Rivista bimestrale e portale web specializzato.
- **Cosa fornisce:** Schede tecniche, speciali editoriali, interviste con game designer italiani e varianti ufficiali/scenari.

---

## 🏢 3. Portali Ufficiali Editori (Regolamenti Originali & FAQ/Errata)

Per la massima precisione come **Arbitro Regole**, MeepleAI deve fare riferimento ai repository ufficiali dei singoli editori:

### Editori Italiani Principali
1. **Asmodee Italia** (https://www.asmodee.it):
   - Catalogo: *Catan, Ticket to Ride, 7 Wonders, Ark Nova, Star Wars, Exploding Kittens, Dixit, Pandemic, Nemesis*.
   - Sezione Download: Regolamenti completi in PDF ed Errata Corrige.
2. **Cranio Creations** (https://www.craniocreations.it):
   - Catalogo: *Barrage, Terra Mystica, Lorenzo il Magnifico, Nucleum, Newton*.
   - Sezione FAQ/Errata per i giochi per esperti ("cinghiali").
3. **Giochi Uniti** (https://www.giochiuniti.it):
   - Catalogo: *Carcassonne, Catan (edizioni storiche), Kingsburg, Le Leggende di Andor*.
4. **DV Games & Ghenos Games** (https://www.dvgames.com):
   - Catalogo: *Bang!, Scythe, Wingspan, Terraforming Mars, Viticulture, Cascadia*.
5. **Pendragon Game Studio** (https://www.pendragongamestudio.com):
   - Catalogo: *The Thing, Detective, Apollo, Cyberpunk 2077*.
6. **MS Edizioni**, **GateOnGames**, **Studio Supernova**, **Uplay.it**.

### Editori Internazionali (per testi originali e FAQ definitive)
- **Stonemaier Games** (https://stonemaiergames.com): FAQ curate personalmente dal designer Jamey Stegmaier.
- **Leder Games** (https://ledergames.com): *The Law of Root*, modello di regolamento vivente costantemente aggiornato.
- **Cephalofair Games** (https://cephalofair.com): FAQ ufficiali di *Gloomhaven* e *Frosthaven*.
- **Fantasy Flight Games** (Rules Reference Guide con keyword indicizzate).

---

## 🛠️ 4. Piattaforme di Sintesi, Setup & Motori Digitali

### 📜 The Esoteric Order of Gamers (EOG)
- **URL:** https://www.orderofgamers.com
- **Ruolo:** Archivio di "Universal Rules Summaries & Reference Sheets".
- **Punto di forza:** Schede PDF ad altissima leggibilità grafica che sintetizzano in 2 pagine il setup, la sequenza del turno e le regole chiave di centinaia di giochi complessi. Modello ideale per il prompt "Setup Rapido" e "Spiega in 3 min".

### 💻 Board Game Arena (BGA)
- **URL:** https://boardgamearena.com
- **Ruolo:** La principale piattaforma mondiale di gioco da tavolo online (browser).
- **Punto di forza:** I giochi su BGA sono governati da codice rigido: se un giocatore ha un dubbio su cosa sia consentito fare in un turno, l'implementazione su BGA fa testo e dirime qualsiasi controversia.

---

## 🚀 Fasi di Integrazione in MeepleAI

1. **Fase 1 (Attuale — Prompt Grounding):** Il system prompt di MeepleAI è già istruito sulle convenzioni e terminologie di BGG e della Tana dei Goblin (pesi 1-5, definizioni di meccaniche, formattazione delle regole).
2. **Fase 2 (BGG API Connect):** Aggiunta di un endpoint backend che interroga BGG XML API2 per mostrare thumbnail, player count ideale e rating ufficiale del gioco citato.
3. **Fase 3 (Web Retrieval & RAG):** Capacità per MeepleAI di consultare le FAQ ufficiali e i PDF dei regolamenti quando viene sottoposto un caso limite mai visto prima.
