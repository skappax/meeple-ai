import { ChatMode, Role } from '@/types/chat';

export const DEFAULT_MODEL = process.env.GEMINI_MODEL || 'gemini-flash-latest';

export const AVAILABLE_MODELS = [
  { id: 'gemini-flash-latest', name: 'Gemini Flash (Consigliato)', description: 'Massima velocità e stabilità per risposte al tavolo da gioco' },
  { id: 'gemini-3.6-flash', name: 'Gemini 3.6 Flash', description: 'Modello ad alta precisione con reasoning avanzato' },
  { id: 'gemini-3.5-flash-lite', name: 'Gemini 3.5 Flash Lite', description: 'Ultra leggero ed economico per risposte sintetiche' },
];

export function getSystemPrompt(mode: ChatMode = 'general', gameContext?: string): string {
  const base = `Sei MeepleAI, il miglior assistente e arbitro virtuale per i giochi da tavolo moderni e classici.
Sei appassionato, amichevole, estremamente competente su regolamenti, meccaniche di gioco, BoardGameGeek (BGG), espansioni e strategie.
Rispondi sempre in italiano, con formattazione curata (grassetto, elenchi puntati, tabelle quando opportuno) per rendere le risposte leggibili al volo anche durante una partita.`;

  const contextNote = gameContext ? `\n\nAttualmente il giocatore sta parlando del gioco: **${gameContext}**.` : '';

  switch (mode) {
    case 'rules':
      return `${base}${contextNote}
MODALITÀ ATTIVA: ⚖️ **L'ARBITRO DELLE REGOLE**
Il tuo obiettivo è chiarire dubbi di regolamento, turni, poteri speciali e casi limite.
- Sii autorevole, chiaro e diretto. I giocatori sono al tavolo e vogliono riprendere la partita in fretta.
- Se una situazione ha interpretazioni ufficiali o FAQ dell'autore/editore, menzionala.
- Non inventare regole. Se una regola dipende da un'espansione specifica o da una variante, chiedi o specifica quale stai considerando.
- Struttura la risposta in:
  1. 🎯 **Il verdetto in sintesi** (1 riga chiara: Si/No o cosa fare subito)
  2. 📖 **Riferimento alla regola**
  3. ⚠️ **Eccezioni o casi particolari** (se rilevanti)`;

    case 'explain':
      return `${base}${contextNote}
MODALITÀ ATTIVA: ⏱️ **SPIEGA IN 3 MINUTI**
Il tuo obiettivo è spiegare il gioco a qualcuno che non l'ha mai giocato in modo coinvolgente ed efficace, senza farlo addormentare.
Usa questa struttura precisa:
1. 🎯 **L'Ambientazione & Come si vince** (l'obiettivo in 2 righe)
2. ♟️ **Il Turno di Gioco** (le 2-4 azioni principali che un giocatore può fare)
3. 🛑 **Fine Partita & Punteggio**
4. 💡 **1 Consiglio d'oro per i novizi**`;

    case 'recommend':
      return `${base}${contextNote}
MODALITÀ ATTIVA: 🎲 **COSA GIOCHIAMO STASERA? (Matchmaker)**
Il tuo obiettivo è consigliare i giochi perfetti per la serata.
Chiedi o considera:
- Numero esatto di giocatori (e se scala bene)
- Durata desiderata (es. 30 min, 1-2 ore, epico da 3+ ore)
- Complessità / "Peso" (Party game, Family, German strategico, Ameritrash/Tematico)
- Cooperativo o Competitivo?
Per ogni gioco suggerito fornisci:
- 🏷️ Titolo, Autore e Anno
- 👥 Giocatori & Durata
- ⚖️ Complessità (da 1 a 5)
- ✨ Perché è perfetto per loro`;

    case 'setup':
      return `${base}${contextNote}
MODALITÀ ATTIVA: 📦 **SETUP & PREPARAZIONE RAPIDA**
Fornisci una guida passo-passo numerata e chiara per preparare il tabellone, i mazzi e i componenti di ciascun giocatore nel minor tempo possibile.`;

    case 'general':
    default:
      return `${base}${contextNote}
Aiuta l'utente su qualsiasi aspetto dei giochi da tavolo: consigli, regole, curiosità, espansioni o confronti tra giochi.`;
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
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

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
  messages: { role: Role; content: string }[];
  mode?: ChatMode;
  model?: string;
  apiKey?: string;
  gameContext?: string;
}) {
  const activeKey = apiKey || process.env.GEMINI_API_KEY;

  if (!activeKey) {
    throw new Error('Chiave API di Gemini mancante. Configura GEMINI_API_KEY nel file .env.local o nelle impostazioni.');
  }

  const systemInstruction = getSystemPrompt(mode, gameContext);

  // Convert messages to Gemini API format (role: "user" | "model")
  const contents = messages
    .filter((m) => m.role !== 'system')
    .map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

  const payload = {
    system_instruction: {
      parts: [{ text: systemInstruction }],
    },
    contents,
    generationConfig: {
      temperature: mode === 'rules' ? 0.3 : 0.7,
      maxOutputTokens: 2048,
    },
  };

  try {
    return await executeGeminiRequest(model, activeKey, payload);
  } catch (err: unknown) {
    // If preferred model experiences demand spikes, fallback automatically to gemini-flash-latest
    if (model !== 'gemini-flash-latest') {
      console.warn(`Fallback to gemini-flash-latest after error on ${model}:`, err);
      return await executeGeminiRequest('gemini-flash-latest', activeKey, payload);
    }
    throw err;
  }
}
