import { NextRequest, NextResponse } from 'next/server';
import { callGeminiChat, AVAILABLE_MODELS } from '@/lib/gemini';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, mode, model, apiKey, gameContext } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: 'Messaggi mancanti o non validi.' },
        { status: 400 }
      );
    }

    if (messages.length > 60) {
      return NextResponse.json(
        { error: 'Limite conversazione raggiunto (massimo 60 messaggi). Inizia una nuova partita.' },
        { status: 400 }
      );
    }

    const lastMsg = messages[messages.length - 1];
    if (!lastMsg || typeof lastMsg.content !== 'string' || !lastMsg.content.trim()) {
      return NextResponse.json(
        { error: 'Il messaggio inviato non può essere vuoto.' },
        { status: 400 }
      );
    }

    if (lastMsg.content.length > 2000) {
      return NextResponse.json(
        { error: 'Il messaggio è troppo lungo (massimo 2000 caratteri).' },
        { status: 400 }
      );
    }

    const result = await callGeminiChat({
      messages,
      mode,
      model,
      apiKey,
      gameContext,
    });

    return NextResponse.json(result);
  } catch (err: unknown) {
    console.error('API /api/chat error:', err);
    const message = err instanceof Error ? err.message : 'Errore interno del server durante la generazione.';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

export async function GET() {
  const hasKey = Boolean(process.env.GEMINI_API_KEY);
  return NextResponse.json({
    status: 'ok',
    hasServerKey: hasKey,
    defaultModel: process.env.GEMINI_MODEL || 'gemini-3.6-flash',
    availableModels: AVAILABLE_MODELS,
  });
}
