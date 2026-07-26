// Read time is derived from the post, never asserted by hand.
//
// Hand-written estimates drift: the series previously shipped 999-word posts
// labelled "8 min read" and 33 posts all labelled "8 min read" while ranging
// from 1,516 to 2,582 words. Computing it means the number is always true.
//
// Rates: 220 words/minute is the middle of the range measured for adults
// reading technical prose on screen. Code and runnable labs are read far more
// slowly than prose, and diagrams and images cost a beat to take in, so those
// blocks are priced separately rather than by word count.

const WORDS_PER_MINUTE = 220;
const SECONDS_PER_CODE_LINE = 3;
const SECONDS_PER_FIGURE = 12;

// Pull the human-readable prose out of one body block. Code is deliberately
// excluded here; it is priced by line below.
function proseOf(block) {
  switch (block.type) {
    case 'p':
    case 'h2':
      return block.text || '';
    case 'callout':
      return `${block.title || ''} ${block.text || ''}`;
    case 'ul':
      return (block.items || []).join(' ');
    case 'terms':
      return (block.items || []).map((i) => `${i.term} ${i.def}`).join(' ');
    case 'sources':
      return (block.items || []).map((i) => i.title || '').join(' ');
    case 'image':
    case 'diagram':
    case 'chart':
    case 'schematic':
      return `${block.title || ''} ${block.caption || ''}`;
    default:
      return '';
  }
}

function countWords(text) {
  return text.split(/\s+/).filter(Boolean).length;
}

// Seconds a reader is likely to spend on a block-array post body.
function readSeconds(body) {
  if (!Array.isArray(body)) return 0;
  let words = 0;
  let seconds = 0;

  for (const block of body) {
    words += countWords(proseOf(block));

    if (block.type === 'code' || block.type === 'lab') {
      const lines = String(block.code || '').split('\n').length;
      seconds += lines * SECONDS_PER_CODE_LINE;
    }
    if (block.type === 'image' || block.type === 'diagram'
      || block.type === 'chart' || block.type === 'schematic') {
      seconds += SECONDS_PER_FIGURE;
    }
  }

  return seconds + (words / WORDS_PER_MINUTE) * 60;
}

/**
 * Read time for a block-array post body, as a display string.
 * @param {Array<object>} body
 * @returns {string} e.g. "9 min read"
 */
export function readTimeFor(body) {
  const minutes = Math.max(1, Math.round(readSeconds(body) / 60));
  return `${minutes} min read`;
}
