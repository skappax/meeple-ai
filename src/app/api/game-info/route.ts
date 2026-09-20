import { NextRequest, NextResponse } from 'next/server';
import { GameInfo } from '@/types/game';

export const dynamic = 'force-dynamic';

// Pre-seeded database for instant 0ms responses on popular games
const PRESEEDED_GAMES: Record<string, GameInfo> = {
  catan: {
    title: 'Catan',
    year: 1995,
    designer: 'Klaus Teuber',
    players: '3-4 (fino a 6 con espansione)',
    bestPlayers: '4',
    duration: '60-120 min',
    bggWeight: 2.3,
    weightLabel: 'Medio-Leggero',
    bggRating: 7.1,
    bggRank: 512,
    mechanics: ['Scambio Risorse', 'Costruzione Reti', 'Lancio Dadi', 'Gestione Mano'],
    summary: 'Il capostipite dei giochi moderni: i coloni colonizzano l\'isola di Catan raccogliendo risorse, commerciando e costruendo strade, villaggi e città.',
  },
  wingspan: {
    title: 'Wingspan',
    year: 2019,
    designer: 'Elizabeth Hargrave',
    players: '1-5',
    bestPlayers: '3-4',
    duration: '40-70 min',
    bggWeight: 2.45,
    weightLabel: 'Medio-Leggero',
    bggRating: 8.05,
    bggRank: 28,
    mechanics: ['Engine Building', 'Card Drafting', 'Set Collection', 'Gestione Mano'],
    summary: 'Competitivo e rilassante gioco di engine-building ornitologico: attira gli uccelli migliori nella tua riserva per innescare combo di uova, cibo e carte.',
  },
  carcassonne: {
    title: 'Carcassonne',
    year: 2000,
    designer: 'Klaus-Jürgen Wrede',
    players: '2-5',
    bestPlayers: '2',
    duration: '35-45 min',
    bggWeight: 1.9,
    weightLabel: 'Leggero',
    bggRating: 7.4,
    bggRank: 230,
    mechanics: ['Piazzamento Tessere', 'Controllo Territorio', 'Piazzamento Lavoratori (Meeples)'],
    summary: 'Il gioco che ha reso celebre il termine "Meeple": i giocatori pescano e piazzano tessere per creare città, strade e monasteri nel sud della Francia medievale.',
  },
  'terraforming mars': {
    title: 'Terraforming Mars',
    year: 2016,
    designer: 'Jacob Fryxelius',
    players: '1-5',
    bestPlayers: '3',
    duration: '120 min',
    bggWeight: 3.25,
    weightLabel: 'Medio-Pesante',
    bggRating: 8.37,
    bggRank: 7,
    mechanics: ['Engine Building', 'Drafting Carte', 'Gestione Risorse', 'Controllo Area'],
    summary: 'Le mega-corporazioni competono per rendere Marte abitabile aumentando temperatura, ossigeno e oceani, realizzando progetti scientifici epici.',
  },
  'dune: imperium': {
    title: 'Dune: Imperium',
    year: 2020,
    designer: 'Paul Dennen',
    players: '1-4',
    bestPlayers: '3-4',
    duration: '60-120 min',
    bggWeight: 3.05,
    weightLabel: 'Medio',
    bggRating: 8.3,
    bggRank: 8,
    mechanics: ['Deck Building', 'Piazzamento Lavoratori', 'Conflitto a Maggioranze', 'Gestione Carte'],
    summary: 'Ispirato all\'universo di Frank Herbert: un perfetto ibrido tra deck building e piazzamento lavoratori per il controllo della spezia su Arrakis.',
  },
  nemesis: {
    title: 'Nemesis',
    year: 2018,
    designer: 'Adam Kwapiński',
    players: '1-5',
    bestPlayers: '4-5',
    duration: '90-180 min',
    bggWeight: 3.44,
    weightLabel: 'Medio-Pesante',
    bggRating: 8.3,
    bggRank: 19,
    mechanics: ['Semi-Cooperativo', 'Sopravvivenza Sci-Fi', 'Movimento Nascosto', 'Gestione Mano'],
    summary: 'Survival horror spaziale cinematografico: l\'equipaggio si risveglia dall\'ibernazione su un\'astronave infestata da predatori alieni spietati.',
  },
  azul: {
    title: 'Azul',
    year: 2017,
    designer: 'Michael Kiesling',
    players: '2-4',
    bestPlayers: '2',
    duration: '30-45 min',
    bggWeight: 1.76,
    weightLabel: 'Leggero',
    bggRating: 7.7,
    bggRank: 80,
    mechanics: ['Drafting Tessere', 'Pattern Building', 'Set Collection'],
    summary: 'Splendido astratto in cui i giocatori decorano le pareti del Palazzo Reale di Évora con le tipiche ceramiche azulejos portoghesi.',
  },
};

// In-memory runtime cache for dynamically queried games
const gameCache = new Map<string, GameInfo>();

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const game = searchParams.get('game')?.trim();

    if (!game) {
      return NextResponse.json(
        { error: 'Parametro "game" obbligatorio.' },
        { status: 400 }
      );
    }

    const cacheKey = game.toLowerCase();

    // 1. Check pre-seeded popular database
    if (PRESEEDED_GAMES[cacheKey]) {
      return NextResponse.json({
        success: true,
        source: 'preseeded',
        game: PRESEEDED_GAMES[cacheKey],
      });
    }

    // 2. Check runtime in-memory cache
    if (gameCache.has(cacheKey)) {
      return NextResponse.json({
        success: true,
        source: 'cache',
        game: gameCache.get(cacheKey),
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Chiave API Gemini mancante.' },
        { status: 500 }
      );
    }

    const prompt = `Sei l'enciclopedia ufficiale di BoardGameGeek (BGG).
Fornisci i dati esatti e oggettivi per il gioco da tavolo "${game}".
Rispondi con un oggetto JSON valido secondo questo schema:
{
  "title": "${game}",
  "year": 2020,
  "designer": "Nome Autore",
  "players": "2-4",
  "bestPlayers": "3-4",
  "duration": "60 min",
  "bggWeight": 2.5,
  "weightLabel": "Medio",
  "bggRating": 7.5,
  "bggRank": 100,
  "mechanics": ["Meccanica 1", "Meccanica 2"],
  "summary": "Breve descrizione in 1 o 2 frasi in italiano."
}`;

    // Hierarchy of models with auto-fallback
    const modelsToTry = ['gemini-3.5-flash-lite', 'gemini-flash-latest', 'gemini-3.6-flash'];
    let lastError: Error | null = null;
    let parsedGame: GameInfo | null = null;

    for (const model of modelsToTry) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: {
                temperature: 0.1,
                maxOutputTokens: 1024,
                responseMimeType: 'application/json',
              },
            }),
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
        const firstBrace = text.indexOf('{');
        const lastBrace = text.lastIndexOf('}');

        if (firstBrace !== -1 && lastBrace !== -1) {
          parsedGame = JSON.parse(text.slice(firstBrace, lastBrace + 1));
          break; // Success!
        }
      } catch (e: unknown) {
        lastError = e instanceof Error ? e : new Error(String(e));
        console.warn(`[GameInfo] Model ${model} failed, trying next:`, lastError.message);
      }
    }

    if (!parsedGame) {
      throw lastError || new Error('Impossibile recuperare i dati BGG del gioco.');
    }

    // Cache the result
    gameCache.set(cacheKey, parsedGame);

    return NextResponse.json({
      success: true,
      source: 'live',
      game: parsedGame,
    });
  } catch (err: unknown) {
    console.error('Error in /api/game-info:', err);
    const message = err instanceof Error ? err.message : 'Errore nel recupero dei dati del gioco.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
