import { ChatMode, Role, Attachment } from '@/types/chat';
import { findVerifiedRuleContext } from '@/lib/rules-kb';

export const DEFAULT_MODEL = process.env.GEMINI_MODEL || 'gemini-flash-latest';

export const AVAILABLE_MODELS = [
  { id: 'gemini-flash-latest', name: 'Gemini Flash (Consigliato)', description: 'Massima precisione e stabilità con reasoning profondo sui regolamenti' },
  { id: 'gemini-3.5-flash', name: 'Gemini 3.5 Flash', description: 'Veloce ed efficace per regole standard e spiegazioni' },
  { id: 'gemini-3.5-flash-lite', name: 'Gemini 3.5 Flash Lite', description: 'Ultra leggero ed economico per risposte sintetiche' },
];

/**
 * Riconosce query che sono palesemente richieste di programmazione / sviluppo software o siti web,
 * completamente slegate dal mondo dei giochi da tavolo.
 */
export function isBlatantOffTopicQuery(query: string, gameContext?: string): boolean {
  if (gameContext && gameContext.trim().length > 0) return false;
  const q = query.toLowerCase().trim();

  // Parole chiave che indicano espressamente l'universo ludico dei giochi da tavolo
  const boardGameKeywords = [
    'gioco', 'giochi', 'boardgame', 'società', 'tavolo', 'regolamento', 'regola', 'regole',
    'manuale', 'meeple', 'turno', 'punti', 'tabellone', 'carta', 'carte', 'mazzo', 'dado', 'dadi',
    'pedina', 'pedine', 'segnalino', 'segnalini', 'bgg', 'boardgamegeek', 'setup', 'arbitro',
    'catan', 'carcassonne', 'wingspan', 'azul', 'dune', 'nemesis', 'scythe', 'monopoly', 'risiko',
    'cluedo', 'scacchi', 'dama', 'magic', 'yu-gi-oh', 'pokemon', 'warhammer', 'd&d', 'gdr',
    'cooperativo', 'competitivo', 'piazzamento', 'deck building', 'draft', 'worker placement'
  ];

  for (const kw of boardGameKeywords) {
    if (q.includes(kw)) {
      return false;
    }
  }

  const offTopicPatterns = [
    /svilupp(a|i|ami|are)\s+(un|una|il|lo|questo)?\s*(sito|web|app|applicazione|software|script|programma)/i,
    /cre(a|ami|are)\s+(un|una|il|lo)?\s*(sito\s*web|app|script|programma|database|api|backend|frontend)/i,
    /scriv(i|imi|ere)\s+(del\s+)?codice/i,
    /scriv(i|imi|ere)\s+(una|un)\s*(funzione|script|programma|algoritmo)\s*(python|javascript|typescript|c\+\+|java|html|css|php|rust|go)/i,
    /fai\s+(un|una|il|lo)?\s*(sito|sito\s*web|codice|software)/i,
    /programm(a|ami|are)\s+(un|una)?/i,
  ];

  return offTopicPatterns.some((pattern) => pattern.test(q));
}

export function getSystemPrompt(
  mode: ChatMode = 'general',
  gameContext?: string,
  verifiedGrounding?: string | null
): string {
  const base = `Sei MeepleAI, l'assistente ed esperto virtuale specializzato ed autorizzato ESCLUSIVAMENTE nei GIOCHI DA TAVOLO (board games moderni e classici, giochi di società, giochi di carte, wargames, party game e GdR da tavolo).
Sei autorevole, preciso, imparziale e ti basi rigorosamente sui regolamenti ufficiali degli editori, su BoardGameGeek (BGG) e su La Tana dei Goblin.
Rispondi sempre in italiano, con formattazione curata e sintetica (grassetto, elenchi puntati), pensata per essere consultata all'istante al tavolo da gioco direttamente da smartphone.

⛔ DELIMITAZIONE RIGOROSA DEL DOMINIO (GUARDRAIL FONDAMENTALE NON VIOLABILE):
- Il tuo unico e solo campo di competenza sono i GIOCHI DA TAVOLO e l'esperienza ludica al tavolo.
- NON SEI un'assistente per sviluppo software, programmazione, scrittura codice (HTML, JS, CSS, Python...), né per compiti scolastici, consigli finanziari, medicina, politica o argomenti generici.
- Se l'utente ti fa richieste NON inerenti ai giochi da tavolo (come ad esempio sviluppare siti web, scrivere codice, risolvere compiti o parlare di argomenti generici):
  1. 🛑 RIFIUTA SUBITO la richiesta con cortesia, fermezza e un tocco di spirito ludico.
  2. ❌ NON assecondare MAI la richiesta: NON scrivere codice, NON generare siti web o script, NON rispondere a domande estranee al gioco da tavolo.
  3. ❌ NON usare MAI il formato "VERDETTO: SÌ/NO" per richieste fuori tema! Quel formato è riservato ESCLUSIVAMENTE a dubbi su regole di giochi da tavolo.
  4. 🎲 Ricorda all'utente che sei MeepleAI, focalizzato al 100% sui giochi da tavolo, e invitalo a chiederti dubbi su regole, spiegazioni in 3 minuti, setup rapido o consigli sui giochi di società.
  - Esempio di risposta per richieste fuori tema:
    "🎲 **Sono MeepleAI, il tuo esperto dedicato esclusivamente ai giochi da tavolo!**\nNon posso aiutarti con programmazione, sviluppo di siti web o argomenti al di fuori del mondo ludico.\nAl tavolo da gioco posso invece risolvere all'istante contestazioni sulle regole, spiegarti un gioco in 3 minuti, guidarti nel setup o consigliarti cosa giocare stasera. Di quale gioco da tavolo vorresti parlare?"

PROTOCOLLO UFFICIALE ARBITRAGGIO REGOLE (SOLO per contestazioni e dubbi su regole di giochi da tavolo):
- Quando ti viene posto un dubbio sulle regole di un gioco da tavolo o sulla legalità di una mossa:
  1. 🎯 **Inizia SEMPRE con il verdetto secco in prima riga**: **VERDETTO: SÌ, è consentito** oppure **VERDETTO: NO, non è consentito** (o la cifra/procedura esatta).
  2. 📖 **Regola Ufficiale del Manuale**: Spiega la regola ufficiale del manuale o dell'Almanacco con rigore.
  3. ⚠️ **Distinzione Chiave & Errori Comuni**: Chiarisci l'equivoco o la falsa credenza che spesso fa nascere la lite al tavolo.
  4. 💡 **Cosa fare adesso al tavolo**: Istruzione chiara e pratica per far ripartire subito la partita.
  5. 📜 **Riferimento alla Regola in Coda (OBBLIGATORIO)**: Concludi SEMPRE la risposta riportando in fondo, preceduta da una linea di separazione (---), la citazione precisa del manuale o della fonte (es:
     ---
     📜 **Riferimento:** *Manuale Ufficiale [Nome Gioco], Sezione "[Nome Paragrafo o Regola]"* (oppure *Almanacco Ufficiale, BGG Rules Forum FAQ o Errata Ufficiale*).
- NON inventare regole e NON confondere mai le regole di edizioni o espansioni diverse senza specificarlo.

📷 ANALISI FOTOGRAFICA E DOCUMENTI (MULTIMODALE):
- Se l'utente allega una foto del tabellone, delle carte o delle tessere di gioco:
  * Ispeziona con attenzione la disposizione visiva, il testo visibile sulle carte o le posizioni dei meeple/segnalini.
  * Formula la tua risposta o verdetto basandoti esattamente su ciò che vedi nell'immagine.
- Se l'utente allega un file PDF di un regolamento:
  * Utilizza il testo del documento come fonte primaria per dirimere ogni dubbio con massima aderenza.`;

  const contextNote = gameContext ? `\n\nAttualmente il tavolo sta giocando a: **${gameContext}**.` : '';
  const groundingNote = verifiedGrounding ? `\n\n${verifiedGrounding}` : '';

  switch (mode) {
    case 'rules':
      return `${base}${contextNote}${groundingNote}
MODALITÀ ATTIVA: ⚖️ **L'ARBITRO DELLE REGOLE**
Il tuo obiettivo è dirimere contese e dubbi sui regolamenti dei giochi da tavolo con autorità e sicurezza assoluta.
OBBLIGATORIO: Riporta sempre in coda alla risposta il riferimento al manuale o alla fonte della regola (punto 5 del protocollo).
ATTENZIONE: Se la richiesta dell'utente NON riguarda le regole di un gioco da tavolo (es. programmazione, siti web, compiti, argomenti estranei), NON emettere un verdetto ma applica il rifiuto categorico previsto dal GUARDRAIL DI DOMINIO.`;

    case 'explain':
      return `${base}${contextNote}${groundingNote}
MODALITÀ ATTIVA: ⏱️ **SPIEGA IN 3 MINUTI**
Spiega il gioco da tavolo a chi è al tavolo in modo conciso e coinvolgente:
1. 🎯 **L'Ambientazione & Obiettivo di vittoria** (in 2 righe)
2. ♟️ **Cosa fai nel tuo turno** (le 2-4 azioni principali)
3. 🛑 **Fine Partita & Punteggio**
4. 💡 **1 Consiglio d'oro per i novizi**
In coda, riporta: --- \n📜 **Riferimento:** Regolamento Ufficiale [Nome Gioco]`;

    case 'summary':
      return `${base}${contextNote}${groundingNote}
MODALITÀ ATTIVA: 📋 **SCHEDA RIASSUNTIVA & METRICHE BGG**
Il tuo obiettivo è fornire una scheda tecnica completa, autorevole e strutturata del gioco per chi è al tavolo:
- 🏷️ **Titolo, Autore, Editore e Anno di uscita**
- ⭐ **Rating BGG e Posizione in Classifica Mondiale (Rank BGG)**
- ⚖️ **Peso / Complessità (da 1.0 a 5.0) con motivazione**
- 👥 **Numero Giocatori (min-max e numero ideale/best consigliato)**
- ⏱️ **Durata media reale della partita**
- 🧩 **Meccaniche principali di gioco**
- 📖 **Panoramica Ambientazione e Scopo in 3 righe**
In coda, riporta: --- \n📜 **Fonte Metriche:** BoardGameGeek (BGG Database)`;

    case 'recommend':
      return `${base}${contextNote}${groundingNote}
MODALITÀ ATTIVA: 🎲 **COSA GIOCHIAMO STASERA?**
Consiglia i giochi da tavolo ideali considerando numero giocatori, durata e complessità BGG.
In coda, riporta: --- \n📜 **Fonte Classifiche & Pesi:** BoardGameGeek (BGG)`;

    case 'setup':
      return `${base}${contextNote}${groundingNote}
MODALITÀ ATTIVA: 📦 **SETUP & PREPARAZIONE RAPIDA**
Fornisci una checklist numerata e ordinata passo-passo per apparecchiare il tavolo da gioco nel minor tempo possibile.
In coda, riporta: --- \n📜 **Riferimento:** Manuale di Gioco / Scheda Setup Ufficiale [Nome Gioco]`;

    case 'general':
    default:
      return `${base}${contextNote}${groundingNote}
Se l'utente pone un dubbio sulle regole o su una mossa di un gioco da tavolo, applica con assoluta priorità il PROTOCOLLO UFFICIALE ARBITRAGGIO REGOLE, includendo sempre in coda il riferimento alla regola (es. --- \n📜 **Riferimento:** ...). Rispetta rigorosamente il GUARDRAIL DI DOMINIO per qualsiasi richiesta fuori tema.`;
  }
}

async function executeGeminiRequest(model: string, apiKey: string, payload: unknown) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    }
  );

  if (!response.ok) {
    const errorData = (await response.json().catch(() => ({}))) as { error?: { message?: string } };
    const message = errorData?.error?.message || `Errore Gemini API HTTP ${response.status}`;
    throw new Error(message);
  }

  const data = await response.json();
  const candidate = data?.candidates?.[0];
  const textParts = candidate?.content?.parts?.filter((p: { text?: string }) => Boolean(p.text));
  const text = textParts?.map((p: { text: string }) => p.text).join('\n') || '';

  if (!text) {
    throw new Error('Risposta vuota da Gemini.');
  }

  return {
    text,
    model: data.modelVersion || model,
    usage: data.usageMetadata,
  };
}

export async function callGeminiChat({
  messages,
  mode = 'general',
  model = DEFAULT_MODEL,
  apiKey,
  gameContext,
}: {
  messages: { role: Role; content: string; attachment?: Attachment }[];
  mode?: ChatMode;
  model?: string;
  apiKey?: string;
  gameContext?: string;
}) {
  const activeKey = apiKey || process.env.GEMINI_API_KEY;

  if (!activeKey) {
    throw new Error('Chiave API di Gemini mancante. Configura GEMINI_API_KEY nel file .env.local o nelle impostazioni.');
  }

  // Estrai l'ultimo messaggio utente per verificare la grounding KB
  const lastUserMessage = messages
    .filter((m) => m.role === 'user')
    .slice(-1)[0]?.content || '';

  // Intercettazione rapida per richieste palesemente fuori tema (sviluppo software, siti web, codice)
  if (isBlatantOffTopicQuery(lastUserMessage, gameContext)) {
    return {
      text: '🎲 **Sono MeepleAI, il tuo esperto dedicato esclusivamente ai giochi da tavolo!**\n\nNon posso aiutarti con la programmazione, lo sviluppo di siti web o la scrittura di codice software.\n\nAl tavolo da gioco posso invece risolvere all\'istante contestazioni sulle regole, spiegarti un gioco in 3 minuti, guidarti nel setup rapido o consigliarti cosa intavolare stasera.\n\n👉 **Su quale gioco da tavolo vorresti fare una domanda?**',
      model: 'meeple-domain-guard',
    };
  }

  const verifiedGrounding = findVerifiedRuleContext(lastUserMessage, gameContext);
  const systemInstruction = getSystemPrompt(mode, gameContext, verifiedGrounding);

  // Converti i messaggi nel formato Gemini API con supporto Multimodale
  const contents = messages
    .filter((m) => m.role !== 'system')
    .map((m) => {
      const parts: Record<string, unknown>[] = [
        { text: m.content || '(Analizza questo allegato per il tavolo)' },
      ];

      if (m.attachment?.data) {
        const base64Data = m.attachment.data.includes(',')
          ? m.attachment.data.split(',')[1]
          : m.attachment.data;

        parts.push({
          inlineData: {
            mimeType: m.attachment.mimeType || 'image/jpeg',
            data: base64Data,
          },
        });
      }

      return {
        role: m.role === 'assistant' ? 'model' : 'user',
        parts,
      };
    });

  const payload = {
    system_instruction: {
      parts: [{ text: systemInstruction }],
    },
    contents,
    generationConfig: {
      temperature: 0.1, // Bassa temperatura per rigore logico e zero allucinazioni sulle regole
      maxOutputTokens: 3072,
    },
  };

  const fallbackModels = Array.from(new Set([model, 'gemini-flash-latest', 'gemini-3.5-flash', 'gemini-3.5-flash-lite']));
  let lastErr: unknown = null;

  for (const targetModel of fallbackModels) {
    try {
      return await executeGeminiRequest(targetModel, activeKey, payload);
    } catch (err: unknown) {
      lastErr = err;
      console.warn(`Model ${targetModel} encountered error, trying next fallback:`, err instanceof Error ? err.message : err);
    }
  }

  throw lastErr;
}
