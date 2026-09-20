/**
 * Base di conoscenza convalidata delle regole ufficiali, FAQ e casi limite
 * per i giochi da tavolo più diffusi (fonti: BGG Rules Forums, Regolamenti Ufficiali, La Tana dei Goblin).
 */

export interface GameRuleFAQ {
  keywords: string[];
  ruleTopic: string;
  verdict: string;
  explanation: string;
  officialSource: string;
}

export const VERIFIED_RULES_KB: Record<string, GameRuleFAQ[]> = {
  catan: [
    {
      keywords: ['strada', 'attraverso', 'colonia', 'insediamento', 'città', 'avversario', 'nemico', 'passare', 'oltre'],
      ruleTopic: 'Costruire strade attraverso o oltre un insediamento avversario',
      verdict: 'NO, non è consentito.',
      explanation: 'Nelle regole ufficiali di Catan (Almanacco, sezione "Strade" e "Insediamenti"), un insediamento o una città di un avversario blocca completamente la costruzione di nuove strade attraverso quell\'incrocio. Puoi costruire una tua strada fino a raggiungere l\'incrocio occupato dalla colonia nemica, ma da lì NON puoi proseguire né attaccarti alla colonia avversaria. La tua linea di costruzione si ferma.\n\n⚠️ DISTINZIONE CHIAVE: Se avevi già una strada continua e un avversario costruisce DOPO un insediamento su un incrocio libero in mezzo al tuo percorso, le tue strade già costruite rimangono al loro posto (non vengono distrutte), ma la strada viene SPEZZATA in due tronconi separati ai fini del calcolo della "Strada più lunga".',
      officialSource: 'Regolamento Ufficiale Catan Studio & BGG Official Rules FAQ',
    },
    {
      keywords: ['distanza', 'incroci', 'colonia', 'città', 'vicino', 'adiacente'],
      ruleTopic: 'Regola della distanza tra insediamenti',
      verdict: 'Devono esserci sempre almeno 2 spigoli/incroci di distanza.',
      explanation: 'Non puoi mai fondare una colonia a 1 solo segmento di strada di distanza da un\'altra colonia o città (tua o avversaria). Ci devono sempre essere almeno 2 spigoli liberi tra qualsiasi coppia di colonie/città.',
      officialSource: 'Manuale Base Catan',
    },
    {
      keywords: ['ladro', '7', 'sette', 'scarto', 'carte', 'metà'],
      ruleTopic: 'Uscita del 7 e scarto carte per il Ladro',
      verdict: 'Chi ha più di 7 carte in mano (da 8 in su) deve scartarne la metà arrotondata per difetto.',
      explanation: 'Chi possiede 8 carte ne scarta 4; chi ne ha 9 ne scarta 4; chi ne ha 10 ne scarta 5. Chi ha 7 carte o meno non scarta nulla. Successivamente, chi ha tirato il 7 muove il ladro su un esagono numerato (bloccandone la produzione) e ruba 1 risorsa a caso da un giocatore con insediamento adiacente.',
      officialSource: 'Manuale Base Catan',
    },
  ],
  carcassonne: [
    {
      keywords: ['meeple', 'piazzare', 'città', 'strada', 'campo', 'già', 'occupato'],
      ruleTopic: 'Piazzare un meeple su un elemento già occupato',
      verdict: 'NO, non è consentito piazzare direttamente su un elemento già occupato.',
      explanation: 'Non puoi mai piazzare un meeple su un elemento (città, strada o campo) se quell\'elemento contiene già un meeple (tuo o di un avversario).\n\n⚠️ DISTINZIONE CHIAVE: È invece perfettamente LEGALE posizionare una tessera neutra che collega e unisce due elementi precedentemente separati che contenevano meeple diversi. Al momento del completamento, chi possiede la maggioranza di meeple incassa tutti i punti; in caso di parità, entrambi incassano i punti pieni.',
      officialSource: 'Regolamento Ufficiale Hans im Glück & CAR (Complete Annotated Rules)',
    },
    {
      keywords: ['contadini', 'campi', 'quando', 'tornano', 'punti'],
      ruleTopic: 'Contadini e poderi in Carcassonne',
      verdict: 'I contadini rimangono sdraiati fino al conteggio finale di fine partita.',
      explanation: 'A differenza dei cavalieri e dei ladri che tornano in riserva al completamento, i contadini non tornano MAI in mano durante la partita. A fine partita valgono 3 punti per ogni città completata che tocca il loro campo.',
      officialSource: 'Regolamento Ufficiale Hans im Glück',
    },
  ],
  wingspan: [
    {
      keywords: ['mangiatoia', 'dadi', 'ritirare', 'cibo', 'risorse'],
      ruleTopic: 'Ritirare i dadi della mangiatoia',
      verdict: 'Puoi ritirare tutti i dadi solo se mostrano tutti lo stesso simbolo (o se ne è rimasto uno solo).',
      explanation: 'Puoi resettare la mangiatoia prima di prendere cibo se tutti i dadi al suo interno mostrano la stessa faccia (anche se ci sono facce doppie con / e sono tutte uguali) oppure quando rimane esattamente 1 solo dado nella mangiatoia.',
      officialSource: 'Regolamento Ufficiale Stonemaier Games & Appendice FAQ',
    },
    {
      keywords: ['rosa', 'tra', 'turni', 'turno', 'avversario'],
      ruleTopic: 'Poteri rosa "Tra un turno e l\'altro"',
      verdict: 'Si attivano SOLO durante i turni degli altri giocatori.',
      explanation: 'I poteri delle carte con fascia rosa si innescano una volta tra un tuo turno e il successivo, attivandosi in risposta alle azioni compiute dagli avversari. Non si attivano MAI durante il tuo turno.',
      officialSource: 'Regolamento Ufficiale Stonemaier Games',
    },
  ],
  'terraforming mars': [
    {
      keywords: ['foresta', 'verde', 'adiacente', 'tessera', 'dove'],
      ruleTopic: 'Posizionamento delle tessere Foresta / Verde',
      verdict: 'Devono essere piazzate adiacenti a una tua tessera preesistente.',
      explanation: 'Una tessera Foresta deve sempre essere posizionata adiacente a una tessera già posseduta da quel giocatore. Solo ed esclusivamente se il giocatore non possiede ancora alcuna tessera sul tabellone, oppure se non ci sono spazi adiacenti legali disponibili, può piazzarla in qualsiasi spazio libero.',
      officialSource: 'Regolamento Ufficiale FryxGames',
    },
  ],
  'dune: imperium': [
    {
      keywords: ['agente', 'spazio', 'occupato', 'conflitto', 'guarnigione'],
      ruleTopic: 'Piazzamento agenti su spazi occupati',
      verdict: 'NO, non puoi inviare un agente su uno spazio già occupato.',
      explanation: 'Ogni spazio del tabellone può ospitare al massimo un agente per round, a meno che l\'effetto specifico di una carta non stabilisca diversamente. Solo il primo giocatore a occuparlo ne usufruisce.',
      officialSource: 'Regolamento Ufficiale Dire Wolf',
    },
  ],
};

/**
 * Cerca nella KB interna se la domanda corrisponde a una regola celebre verificata.
 */
export function findVerifiedRuleContext(query: string, gameContext?: string): string | null {
  const qLower = query.toLowerCase();
  const gameKey = gameContext ? gameContext.toLowerCase().trim() : '';

  // 1. Cerca nel gioco specificato o in tutti i giochi noti
  for (const [gameName, faqs] of Object.entries(VERIFIED_RULES_KB)) {
    if (gameKey && !gameKey.includes(gameName) && !gameName.includes(gameKey)) {
      continue;
    }

    // Se il nome del gioco è nel query o nel gameContext
    const gameMatch = gameKey.includes(gameName) || qLower.includes(gameName);

    for (const faq of faqs) {
      // Conta quante parole chiave combaciano
      const matchCount = faq.keywords.filter((kw) => qLower.includes(kw)).length;
      if (gameMatch && matchCount >= 2) {
        return `\n\n📌 **FONTE UFFICIALE PRE-VALIDATA (${faq.officialSource})**:
Argomento: ${faq.ruleTopic}
Verdetto ufficiale: ${faq.verdict}
Spiegazione da manuale: ${faq.explanation}\n`;
      } else if (!gameMatch && matchCount >= 3) {
        return `\n\n📌 **FONTE UFFICIALE PRE-VALIDATA (${faq.officialSource} - ${gameName.toUpperCase()})**:
Argomento: ${faq.ruleTopic}
Verdetto ufficiale: ${faq.verdict}
Spiegazione da manuale: ${faq.explanation}\n`;
      }
    }
  }

  return null;
}
