// Minimal ANSI-to-React renderer for lab output.
//
// Lab output is a plain text stream from Pyodide's stdout, so it cannot carry
// markup. ANSI escape codes are the one channel a Python program already has
// for saying "this value is a failure" rather than merely printing it, which is
// the difference between a wall of numbers and something a reader can scan.
//
// Colours map to PatternFly's status semantics rather than raw terminal
// colours, so success, warning and danger mean the same thing here as they do
// anywhere else in the design system. PatternFly is MIT licensed.
// https://www.patternfly.org

const PALETTE = {
  30: 'var(--lab-fg-muted)',
  31: 'var(--lab-danger)',
  32: 'var(--lab-success)',
  33: 'var(--lab-warning)',
  34: 'var(--lab-info)',
  35: 'var(--lab-accent)',
  36: 'var(--lab-info)',
  37: 'var(--lab-fg)',
  90: 'var(--lab-fg-muted)',
};

// SGR sequences: ESC [ <params> m
const ESC = new RegExp(String.fromCharCode(27) + '\\[([0-9;]*)m', 'g');
const ESC_CHAR = String.fromCharCode(27);

/**
 * Turn a string containing ANSI SGR codes into an array of React-ready spans.
 * Unknown codes are ignored rather than printed, so a lab emitting something
 * unexpected degrades to plain text instead of leaking escape sequences.
 *
 * @param {string} text
 * @returns {Array<{text: string, style: object}>}
 */
export function parseAnsi(text) {
  const out = [];
  let style = {};
  let last = 0;
  let m;
  ESC.lastIndex = 0;

  const push = (chunk) => {
    if (chunk) out.push({ text: chunk, style: { ...style } });
  };

  while ((m = ESC.exec(text))) {
    push(text.slice(last, m.index));
    last = m.index + m[0].length;

    // An empty parameter list means reset, the same as code 0.
    const codes = (m[1] || '0').split(';').map((c) => parseInt(c, 10) || 0);
    for (const code of codes) {
      if (code === 0) style = {};
      else if (code === 1) style.fontWeight = 700;
      else if (code === 2) style.opacity = 0.65;
      else if (code === 4) style.textDecoration = 'underline';
      else if (PALETTE[code]) style.color = PALETTE[code];
    }
  }
  push(text.slice(last));
  return out;
}

/** True when the text contains anything worth parsing. */
export function hasAnsi(text) {
  return typeof text === 'string' && text.includes(ESC_CHAR);
}
