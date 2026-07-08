// AI Engineering series — gap-filling posts that address topics the series did
// not yet cover (context engineering, MCP, advanced agents, RAG variants,
// deployment, observability, fundamentals). Each post lives as an original
// block-array file in content/ai-series/ and is scheduled here on a ~2.5-day
// drip. Rendered by SeriesPost.jsx, same as the rest of the series.
import { POST as contextVsPrompt } from '../../content/ai-series/context-vs-prompt-engineering.js';
import { POST as sixContexts } from '../../content/ai-series/six-types-of-agent-context.js';
import { POST as contextBudgeting } from '../../content/ai-series/context-budgeting.js';
import { POST as contextRot } from '../../content/ai-series/context-rot.js';
import { POST as manualVsAgentic } from '../../content/ai-series/manual-rag-vs-agentic-context.js';

const SERIES = 'AI Engineering Series';

// [post, publishAt (date), seriesNum, chapter]
const SCHEDULE = [
  [contextVsPrompt, '2026-07-11', 40, 'Context Engineering'],
  [sixContexts, '2026-07-13', 41, 'Context Engineering'],
  [contextBudgeting, '2026-07-16', 42, 'Context Engineering'],
  [contextRot, '2026-07-18', 43, 'Context Engineering'],
  [manualVsAgentic, '2026-07-21', 44, 'Context Engineering'],
];

export const AI_SERIES_POSTS = SCHEDULE.map(([post, publishAt, seriesNum, chapter]) => ({
  ...post,
  series: SERIES,
  seriesNum,
  chapter,
  publishAt: `${publishAt}T12:00:00Z`,
}));
