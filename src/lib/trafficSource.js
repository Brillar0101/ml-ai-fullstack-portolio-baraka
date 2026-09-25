// Group a landing page view into a channel, so the dashboard can answer "how
// many readers arrived from an AI assistant" rather than listing raw hosts.
// utm_source wins over the referrer: ChatGPT, for example, tags the links it
// cites with utm_source=chatgpt.com, while its referrer is often stripped.

const CHANNELS = [
  ['AI assistant', [
    'chatgpt.com', 'chat.openai.com', 'openai.com', 'perplexity.ai', 'claude.ai',
    'gemini.google.com', 'bard.google.com', 'copilot.microsoft.com', 'you.com',
    'phind.com', 'poe.com', 'meta.ai', 'grok.com', 'chat.deepseek.com',
  ]],
  ['Search', ['google.', 'bing.com', 'duckduckgo.com', 'search.yahoo.com', 'ecosia.org', 'search.brave.com', 'kagi.com', 'baidu.com', 'yandex.']],
  ['Social', ['linkedin.com', 'lnkd.in', 'x.com', 't.co', 'twitter.com', 'reddit.com', 'news.ycombinator.com', 'facebook.com', 'instagram.com', 'youtube.com', 'bsky.app', 'mastodon']],
];

function hostOf(value) {
  if (!value) return '';
  try {
    return new URL(value.includes('://') ? value : `https://${value}`).hostname.replace(/^www\./, '');
  } catch {
    return String(value).toLowerCase();
  }
}

function match(host) {
  for (const [channel, needles] of CHANNELS) {
    // A needle ending in '.' (google.) matches any TLD but only at a label
    // boundary, so notgoogle.example.com is not read as Google.
    const hit = (n) => (n.endsWith('.') ? `.${host}`.includes(`.${n}`) : host === n || host.endsWith(`.${n}`));
    if (needles.some(hit)) {
      return channel;
    }
  }
  return null;
}

/**
 * @param {{ referrer?: string|null, metadata?: { utm_source?: string } }} event
 * @param {string} ownHost hostname of this site, so internal hops read as Direct
 * @returns {{ channel: string, source: string }}
 */
export function classifySource(event, ownHost) {
  const utm = event.metadata?.utm_source;
  if (utm) {
    const host = hostOf(utm);
    return { channel: match(host) || 'Campaign', source: host };
  }
  const host = hostOf(event.referrer);
  if (!host || host === ownHost.replace(/^www\./, '')) return { channel: 'Direct', source: 'direct' };
  return { channel: match(host) || 'Other sites', source: host };
}
