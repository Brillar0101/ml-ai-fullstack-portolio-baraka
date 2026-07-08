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
import { POST as whatMcpSolves } from '../../content/ai-series/what-mcp-solves.js';
import { POST as mcpVsFunctionCalling } from '../../content/ai-series/mcp-vs-function-calling.js';
import { POST as mcpArchitecture } from '../../content/ai-series/mcp-architecture.js';
import { POST as mcpPrimitives } from '../../content/ai-series/mcp-primitives.js';
import { POST as mcpToolOverload } from '../../content/ai-series/mcp-tool-overload.js';
import { POST as buildMcpServer } from '../../content/ai-series/build-an-mcp-server.js';
import { POST as agentLevels } from '../../content/ai-series/levels-of-agentic-autonomy.js';
import { POST as singleVsMulti } from '../../content/ai-series/single-vs-multi-agent.js';
import { POST as multiAgentOrchestration } from '../../content/ai-series/multi-agent-orchestration.js';
import { POST as a2aProtocol } from '../../content/ai-series/a2a-protocol.js';
import { POST as agentDeployment } from '../../content/ai-series/agent-deployment.js';
import { POST as agentFlywheel } from '../../content/ai-series/agent-improvement-flywheel.js';
import { POST as vectorDatabases } from '../../content/ai-series/vector-databases-explained.js';
import { POST as agenticRag } from '../../content/ai-series/agentic-rag.js';
import { POST as hyde } from '../../content/ai-series/hyde.js';
import { POST as cagVsRag } from '../../content/ai-series/cag-vs-rag.js';
import { POST as reranking } from '../../content/ai-series/reranking.js';
import { POST as ragEvaluation } from '../../content/ai-series/rag-evaluation.js';
import { POST as whyDeployment } from '../../content/ai-series/why-llm-deployment-is-different.js';
import { POST as vllmBatching } from '../../content/ai-series/vllm-continuous-batching.js';
import { POST as servingFrameworks } from '../../content/ai-series/serving-frameworks-compared.js';
import { POST as autoscaling } from '../../content/ai-series/autoscaling-cold-starts.js';
import { POST as evalVsObs } from '../../content/ai-series/evaluation-vs-observability.js';
import { POST as tracing } from '../../content/ai-series/tracing-llm-requests.js';
import { POST as whatToLog } from '../../content/ai-series/what-to-log-and-alert.js';
import { POST as costObs } from '../../content/ai-series/cost-token-observability.js';

const SERIES = 'AI Engineering Series';

// [post, publishAt (date), seriesNum, chapter]
const SCHEDULE = [
  [contextVsPrompt, '2026-07-11', 40, 'Context Engineering'],
  [sixContexts, '2026-07-13', 41, 'Context Engineering'],
  [contextBudgeting, '2026-07-16', 42, 'Context Engineering'],
  [contextRot, '2026-07-18', 43, 'Context Engineering'],
  [manualVsAgentic, '2026-07-21', 44, 'Context Engineering'],
  [whatMcpSolves, '2026-07-23', 45, 'MCP'],
  [mcpVsFunctionCalling, '2026-07-26', 46, 'MCP'],
  [mcpArchitecture, '2026-07-28', 47, 'MCP'],
  [mcpPrimitives, '2026-07-31', 48, 'MCP'],
  [mcpToolOverload, '2026-08-02', 49, 'MCP'],
  [buildMcpServer, '2026-08-05', 50, 'MCP'],
  [agentLevels, '2026-08-07', 51, 'Advanced Agents'],
  [singleVsMulti, '2026-08-10', 52, 'Advanced Agents'],
  [multiAgentOrchestration, '2026-08-12', 53, 'Advanced Agents'],
  [a2aProtocol, '2026-08-15', 54, 'Advanced Agents'],
  [agentDeployment, '2026-08-17', 55, 'Advanced Agents'],
  [agentFlywheel, '2026-08-20', 56, 'Advanced Agents'],
  [vectorDatabases, '2026-08-22', 57, 'RAG Variants'],
  [agenticRag, '2026-08-25', 58, 'RAG Variants'],
  [hyde, '2026-08-27', 59, 'RAG Variants'],
  [cagVsRag, '2026-08-30', 60, 'RAG Variants'],
  [reranking, '2026-09-01', 61, 'RAG Variants'],
  [ragEvaluation, '2026-09-04', 62, 'RAG Variants'],
  [whyDeployment, '2026-09-06', 63, 'LLM Deployment'],
  [vllmBatching, '2026-09-09', 64, 'LLM Deployment'],
  [servingFrameworks, '2026-09-11', 65, 'LLM Deployment'],
  [autoscaling, '2026-09-14', 66, 'LLM Deployment'],
  [evalVsObs, '2026-09-16', 67, 'LLM Observability'],
  [tracing, '2026-09-19', 68, 'LLM Observability'],
  [whatToLog, '2026-09-21', 69, 'LLM Observability'],
  [costObs, '2026-09-24', 70, 'LLM Observability'],
];

export const AI_SERIES_POSTS = SCHEDULE.map(([post, publishAt, seriesNum, chapter]) => ({
  ...post,
  series: SERIES,
  seriesNum,
  chapter,
  publishAt: `${publishAt}T12:00:00Z`,
}));
