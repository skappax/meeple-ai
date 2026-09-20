/**
 * Utilità per Speech-to-Text (STT) e Text-to-Speech (TTS)
 * Basate su Web Speech API native del browser (zero costi, zero dipendenze).
 */

export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return Boolean(
    (window as unknown as { SpeechRecognition?: unknown }).SpeechRecognition ||
    (window as unknown as { webkitSpeechRecognition?: unknown }).webkitSpeechRecognition
  );
}

export function isSpeechSynthesisSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return 'speechSynthesis' in window;
}

/**
 * Estrae solo il Verdetto secco e la regola chiave (10-15 secondi di parlato)
 * evitando letture troppo lunghe che interromperebbero la partita al tavolo.
 */
export function extractSpokenSummary(markdown: string): string {
  if (!markdown) return '';

  // 1. Rimuovi blocchi di codice e tag HTML
  let clean = markdown.replace(/```[\s\S]*?```/g, '').replace(/<[^>]+>/g, '');

  // 2. Se c'è un VERDETTO, isola il verdetto e la prima spiegazione
  const verdictIndex = clean.indexOf('VERDETTO:');
  if (verdictIndex !== -1) {
    clean = clean.substring(verdictIndex);
  }

  // Taglia prima di sezioni secondarie come 'Distinzione Chiave', 'Cosa fare adesso', 'Consiglio' o riferimenti in coda
  const stopKeywords = [
    '⚠️', 'Distinzione', 'DISTINZIONE', '💡', 'Cosa fare adesso', 'COSA FARE', 'Regola Ufficiale del Manuale:', '📜', 'Riferimento', 'RIFERIMENTO', '---'
  ];

  let cutoff = clean.length;
  for (const kw of stopKeywords) {
    const idx = clean.indexOf(kw);
    if (idx !== -1 && idx > 20 && idx < cutoff) {
      cutoff = idx;
    }
  }
  clean = clean.substring(0, cutoff);

  // 3. Rimuovi sintassi markdown (*, _, #, [, ], -, etc.)
  clean = clean
    .replace(/[#*_~`>-]/g, ' ')
    .replace(/\[(.*?)\]\(.*?\)/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();

  // Limita a un massimo di circa 250 caratteri (circa 20-30 parole, 12-15 secondi a voce)
  if (clean.length > 280) {
    const lastPeriod = clean.lastIndexOf('.', 280);
    if (lastPeriod > 100) {
      clean = clean.substring(0, lastPeriod + 1);
    } else {
      clean = clean.substring(0, 280) + '...';
    }
  }

  return clean;
}

let activeUtterance: SpeechSynthesisUtterance | null = null;

export function stopSpeaking(): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  try {
    if (activeUtterance) {
      activeUtterance = null;
    }
    window.speechSynthesis.cancel();
  } catch (e) {
    console.error('Error stopping speech synthesis', e);
  }
}

export function speakText(
  text: string,
  onStart?: () => void,
  onEnd?: () => void
): boolean {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return false;

  stopSpeaking();

  const spokenContent = extractSpokenSummary(text);
  if (!spokenContent) return false;

  try {
    const utterance = new SpeechSynthesisUtterance(spokenContent);
    utterance.lang = 'it-IT';
    utterance.rate = 1.05; // Parlata naturale e leggermente scorrevole
    utterance.pitch = 1.0;

    // Prova a selezionare una voce italiana naturale se disponibile
    const voices = window.speechSynthesis.getVoices();
    const italianVoice = voices.find((v) => v.lang.startsWith('it'));
    if (italianVoice) {
      utterance.voice = italianVoice;
    }

    utterance.onstart = () => {
      activeUtterance = utterance;
      if (onStart) onStart();
    };

    utterance.onend = () => {
      activeUtterance = null;
      if (onEnd) onEnd();
    };

    utterance.onerror = () => {
      activeUtterance = null;
      if (onEnd) onEnd();
    };

    window.speechSynthesis.speak(utterance);
    return true;
  } catch (e) {
    console.error('Failed to speak text', e);
    return false;
  }
}
