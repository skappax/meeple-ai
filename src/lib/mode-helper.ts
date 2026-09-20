import { ChatMode } from '@/types/chat';

export interface ModeConfig {
  id: ChatMode;
  label: string;
  shortLabel: string;
  desc: string;
  color: string; // Tailwind text color class
  border: string; // Tailwind border class for frame
  borderSubtle: string;
  bgBadge: string;
  textBadge: string;
  glow: string; // Tailwind shadow/glow class
  accentHex: string;
}

export const MODE_CONFIGS: Record<ChatMode, ModeConfig> = {
  rules: {
    id: 'rules',
    label: 'Arbitro Regole',
    shortLabel: 'Arbitro',
    desc: 'Verdetti imparziali e casi limite',
    color: 'text-emerald-400',
    border: 'border-emerald-500/60',
    borderSubtle: 'border-emerald-500/30',
    bgBadge: 'bg-emerald-500/15',
    textBadge: 'text-emerald-300',
    glow: 'shadow-[0_0_15px_rgba(16,185,129,0.18)]',
    accentHex: '#10b981',
  },
  setup: {
    id: 'setup',
    label: 'Setup Rapido',
    shortLabel: 'Setup',
    desc: 'Checklist passo-passo apparecchiatura',
    color: 'text-orange-400',
    border: 'border-orange-500/60',
    borderSubtle: 'border-orange-500/30',
    bgBadge: 'bg-orange-500/15',
    textBadge: 'text-orange-300',
    glow: 'shadow-[0_0_15px_rgba(249,115,22,0.18)]',
    accentHex: '#f97316',
  },
  explain: {
    id: 'explain',
    label: 'Spiega in 3 Min',
    shortLabel: 'Spiega 3m',
    desc: 'Spiegazione rapida per novizi',
    color: 'text-blue-400',
    border: 'border-blue-500/60',
    borderSubtle: 'border-blue-500/30',
    bgBadge: 'bg-blue-500/15',
    textBadge: 'text-blue-300',
    glow: 'shadow-[0_0_15px_rgba(59,130,246,0.18)]',
    accentHex: '#3b82f6',
  },
  summary: {
    id: 'summary',
    label: 'Scheda Gioco',
    shortLabel: 'Scheda',
    desc: 'Metriche BGG e scheda riassuntiva',
    color: 'text-cyan-400',
    border: 'border-cyan-500/60',
    borderSubtle: 'border-cyan-500/30',
    bgBadge: 'bg-cyan-500/15',
    textBadge: 'text-cyan-300',
    glow: 'shadow-[0_0_15px_rgba(6,182,212,0.18)]',
    accentHex: '#06b6d4',
  },
  recommend: {
    id: 'recommend',
    label: 'Cosa Giochiamo?',
    shortLabel: 'Consigli',
    desc: 'Consigli su misura per stasera',
    color: 'text-purple-400',
    border: 'border-purple-500/60',
    borderSubtle: 'border-purple-500/30',
    bgBadge: 'bg-purple-500/15',
    textBadge: 'text-purple-300',
    glow: 'shadow-[0_0_15px_rgba(168,85,247,0.18)]',
    accentHex: '#a855f7',
  },
  general: {
    id: 'general',
    label: 'Tavolo Libero',
    shortLabel: 'Libero',
    desc: 'Chiacchierata & curiosità ludiche',
    color: 'text-amber-400',
    border: 'border-amber-500/60',
    borderSubtle: 'border-amber-500/30',
    bgBadge: 'bg-amber-500/15',
    textBadge: 'text-amber-300',
    glow: 'shadow-[0_0_15px_rgba(245,158,11,0.18)]',
    accentHex: '#f59e0b',
  },
};

/**
 * Rileva automaticamente l'intento dell'utente dal testo del messaggio
 * per cambiare modalità al volo (es. richiesta di setup mentre si è in regole).
 */
export function detectModeFromQuery(query: string, currentMode: ChatMode = 'general'): ChatMode {
  if (!query || typeof query !== 'string') return currentMode;
  const q = query.toLowerCase().trim();

  // 1. SETUP RAPIDO
  const setupPatterns = [
    /\b(setup|set\s*up)\b/i,
    /\bapparecchi(a|are|amento|atura)\b/i,
    /\bprepar(a|are|azione)\s+(il\s+)?(tavolo|gioco|partita)\b/i,
    /\bdisposizion(e|i)\s+inizial(e|i)\b/i,
    /\b(quante|quanti)\s+(carte|tessere|risorse|soldi|monete|segnalini)\s+(a\s+testa|a\s+ciascuno|per\s+giocatore|iniziali)\b/i,
    /\bcomponenti\s+iniziali\b/i,
  ];
  if (setupPatterns.some((pattern) => pattern.test(q))) {
    return 'setup';
  }

  // 2. SCHEDA GIOCO / METRICHE BGG
  const summaryPatterns = [
    /\bsched(a|e)\s+(tecnic[ae]|riassuntiv[ae]|gioco|del\s+gioco)\b/i,
    /\b(metriche|rating|peso|complessit[àa]|rank|classifica)\s+(bgg|boardgamegeek)\b/i,
    /\b(bgg|boardgamegeek)\s+(rating|score|peso|weight|rank)\b/i,
    /\bpanoramic[ae]\s+bgg\b/i,
  ];
  if (summaryPatterns.some((pattern) => pattern.test(q))) {
    return 'summary';
  }

  // 3. COSA GIOCHIAMO STASERA / RACCOMANDAZIONE
  const recommendPatterns = [
    /\bcosa\s+giochiamo\b/i,
    /\bconsigli(a|ami|aci)\s+(un|dei)?\s*gioch?i?\b/i,
    /\bcosa\s+(intavoliamo|proponi)\b/i,
    /\bsiamo\s+in\s+\d+\s+(cosa|quale|qual\s+è)\b/i,
    /\bqual(e|i)\s+gioc(o|hi)\s+consigli\b/i,
  ];
  if (recommendPatterns.some((pattern) => pattern.test(q))) {
    return 'recommend';
  }

  // 4. SPIEGA IN 3 MINUTI
  const explainPatterns = [
    /\bspiega(mi|ci)?\s+(in\s+(3|tre)\s+minuti|in\s+breve|rapidamente|veloce)\b/i,
    /\bspiega(mi|ci)?\s+come\s+si\s+gioca\b/i,
    /\bcome\s+si\s+gioca\s+a\b/i,
    /\btutorial\s+veloce\b/i,
  ];
  if (explainPatterns.some((pattern) => pattern.test(q))) {
    return 'explain';
  }

  // 5. ARBITRO DELLE REGOLE
  const rulesPatterns = [
    /(?:^|\s|[.,!?])(è|e'|e)\s+(consentito|legale|permesso|vietato|possibile)\b/i,
    /(?:^|\s|[.,!?])si\s+pu[òo]\s+(fare|giocare|muovere|costruire|piazzare|scartare|pescare|attivare|usare)\b/i,
    /\bposso\s+(fare|giocare|muovere|costruire|piazzare|scartare|pescare|attivare|usare)\b/i,
    /\b(dubbio|contesa|lite|contestazione|verdetto)\s+(su|regol[ae]|mossa)\b/i,
    /\bmossa\s+valida\b/i,
    /\bchi\s+vince\s+(in\s+caso|se|lo\s+spareggio|il\s+pareggio)\b/i,
    /\bregola\s+(ufficiale|sull?[ae]|del)\b/i,
  ];
  if (rulesPatterns.some((pattern) => pattern.test(q))) {
    return 'rules';
  }

  return currentMode;
}
