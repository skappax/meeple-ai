export interface GameInfo {
  title: string;
  year?: number;
  designer?: string;
  publisher?: string;
  players?: string;
  bestPlayers?: string;
  duration?: string;
  bggWeight?: number; // 1.0 to 5.0
  weightLabel?: string; // e.g. "Leggero", "Medio-Leggero", "Medio", "Pesante"
  bggRating?: number; // 1.0 to 10.0
  bggRank?: number;
  mechanics?: string[];
  summary?: string;
}
