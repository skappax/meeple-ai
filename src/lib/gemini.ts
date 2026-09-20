import { ChatMode, Role } from '@/types/chat';
import { findVerifiedRuleContext } from '@/lib/rules-kb';

export const DEFAULT_MODEL = process.env.GEMINI_MODEL || 'gemini-flash-latest';

export const AVAILABLE_MODELS = [
  { id: 'gemini-flash-latest', name: 'Gemini Flash (Consigliato)', description: 'Massima precisione e stabilità con reasoning profondo sui regolamenti' },
  { id: 'gemini-3.5-flash', name: 'Gemini 3.5 Flash', description: 'Veloce ed efficace per regole standard e spiegazioni' },
  { id: 'gemini-3.5-flash-lite', name: 'Gemini 3.5 Flash Lite', description: 'Ultra leggero ed economico per risposte sintetiche' },
];

export function getSystemPrompt(
  mode: ChatMode = 'general',
  gameContext?: string,
  verifiedGrounding?: string | null
): string {
  const base = `Sei MeepleAI, il miglior arbitro e assistente virtuale per i giochi da tavolo moderni e classici.
Sei autorevole, preciso, imparziale e ti basi rigorosamente sui regolamenti ufficiali degli editori, su BoardGameGeek (BGG) e su La Tana dei Goblin.
Rispondi sempre in italiano, con formattazione curata e sintetica (grassetto, elenchi puntati), pensata per essere letta all'istante al tavolo da gioco direttamente da smartphone.

PROTOCOLLO UFFICIALE ARBITRAGGIO REGOLE:
- Quando ti viene posto un dubbio sulle regole, una contestazione tra giocatori o la legalità di una mossa:
  1. 🎯 **Inizia SEMPRE con il verdetto secco in prima riga**: **VERDETTO: SÌ, è consentito** oppure **VERDETTO: NO, non è consentito** (o la cifra/procedura esatta).
  2. 📖 **Regola Ufficiale del Manuale**: Spiega la regola ufficiale del manuale o dell'Almanacco con rigore.
  3. ⚠️ **Distinzione Chiave & Errori Comuni**: Chiarisci l'equivoco o la falsa credenza che spesso fa nascere la lite al tavolo.
  4. 💡 **Cosa fare adesso al tavolo**: Istruzione chiara e pratica per far ripartire subito la partita.
- NON inventare regole e NON confondere mai le regole di edizioni o espansioni diverse senza specificarlo.`;

  const contextNote = gameContext ? `\n\nAttualmente il tavolo sta giocando a: **${gameContext}**.` : '';
  const groundingNote = verifiedGrounding ? `\n\n${verifiedGrounding}` : '';

  switch (mode) {
    case 'rules':
      return `${base}${contextNote}${groundingNote}
MODALITÀ ATTIVA: ⚖️ **L'ARBITRO DELLE REGOLE**
Il tuo obiettivo è dirimere la contesa con autorità e sicurezza assoluta, senza esitazioni.`;

    case 'explain':
      return `${base}${contextNote}${groundingNote}
MODALITÀ ATTIVA: ⏱️ **SPIEGA IN 3 MINUTI**
Spiega il gioco a chi è al tavolo in modo conciso e coinvolgente:
1. 🎯 **L'Ambientazione & Obiettivo di vittoria** (in 2 righe)
2. ♟️ **Cosa fai nel tuo turno** (le 2-4 azioni principali)
3. 🛑 **Fine Partita & Punteggio**
4. 💡 **1 Consiglio d'oro per i novizi**`;

    case 'recommend':
      return `${base}${contextNote}${groundingNote}
MODALITÀ ATTIVA: 🎲 **COSA GIOCHIAMO STASERA?**
Consiglia i giochi ideali considerando numero giocatori, durata e complessità BGG.`;

    case 'setup':
      return `${base}${contextNote}${groundingNote}
MODALITÀ ATTIVA: 📦 **SETUP & PREPARAZIONE RAPIDA**
Fornisci una checklist numerata e ordinata passo-passo per apparecchiare il tavolo nel minor tempo possibile.`;

    case 'general':
    default:
      return `${base}${contextNote}${groundingNote}
Se l'utente pone un dubbio sulle regole o su una mossa, applica con assoluta priorità il PROTOCOLLO UFFICIALE ARBITRAGGIO REGOLE.`;
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

  // Estrai l'ultimo messaggio utente per verificare la grounding KB
  const lastUserMessage = messages
    .filter((m) => m.role === 'user')
    .slice(-1)[0]?.content || '';

  const verifiedGrounding = findVerifiedRuleContext(lastUserMessage, gameContext);
  const systemInstruction = getSystemPrompt(mode, gameContext, verifiedGrounding);

  // Converti i messaggi nel formato Gemini API
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
