// Data-driven standalone blog posts for the AI Engineering series.
//
// Each post lives in its own file under content/series/ so posts can be edited
// independently. Rendered by src/pages/blog/SeriesPost.jsx. publishAt drips
// posts out over time; see src/lib/publishing.js for gating.

import { attachSources } from './attachSources';
import { POST as yourFirstAiAgent } from '../../content/series/your-first-ai-agent.js';
import { POST as nextWordSampling } from '../../content/series/next-word-sampling.js';
import { POST as foundationModelsExplained } from '../../content/series/foundation-models-explained.js';
import { POST as whyModelsHallucinate } from '../../content/series/why-models-hallucinate.js';
import { POST as evaluationIsTheHardPart } from '../../content/series/evaluation-is-the-hard-part.js';
import { POST as promptEngineeringThatHelps } from '../../content/series/prompt-engineering-that-helps.js';
import { POST as promptInjection } from '../../content/series/prompt-injection.js';
import { POST as whatRagIs } from '../../content/series/what-rag-is.js';
import { POST as whatAnAgentIs } from '../../content/series/what-an-agent-is.js';
import { POST as finetuningOrRag } from '../../content/series/finetuning-or-rag.js';
import { POST as quantizationPlainTerms } from '../../content/series/quantization-plain-terms.js';
import { POST as dataQuality } from '../../content/series/data-quality.js';
import { POST as latencyThroughputCost } from '../../content/series/latency-throughput-cost.js';
import { POST as guardrails } from '../../content/series/guardrails.js';
import { POST as aiEngVsMlEng } from '../../content/series/ai-eng-vs-ml-eng.js';
import { POST as threeLayersAiStack } from '../../content/series/three-layers-ai-stack.js';
import { POST as modelSize } from '../../content/series/model-size.js';
import { POST as sftVsPreference } from '../../content/series/sft-vs-preference.js';
import { POST as structuredOutputs } from '../../content/series/structured-outputs.js';
import { POST as testTimeCompute } from '../../content/series/test-time-compute.js';
import { POST as entropyCrossEntropy } from '../../content/series/entropy-cross-entropy.js';
import { POST as embeddingsMeaningVectors } from '../../content/series/embeddings-meaning-vectors.js';
import { POST as readingBenchmarks } from '../../content/series/reading-benchmarks.js';
import { POST as chainOfThought } from '../../content/series/chain-of-thought.js';
import { POST as contextLength } from '../../content/series/context-length.js';
import { POST as chunkingForRag } from '../../content/series/chunking-for-rag.js';
import { POST as retrievalAlgorithms } from '../../content/series/retrieval-algorithms.js';
import { POST as kvCache } from '../../content/series/kv-cache.js';
import { POST as probabilisticNature } from '../../content/series/probabilistic-nature.js';
import { POST as multilingualQuality } from '../../content/series/multilingual-quality.js';
import { POST as domainSpecificModels } from '../../content/series/domain-specific-models.js';
import { POST as functionalCorrectness } from '../../content/series/functional-correctness.js';
import { POST as aiAsAJudge } from '../../content/series/ai-as-a-judge.js';
import { POST as jailbreaking } from '../../content/series/jailbreaking.js';
import { POST as buildVsBuyModel } from '../../content/series/build-vs-buy-model.js';
import { POST as evaluationPipeline } from '../../content/series/evaluation-pipeline.js';
import { POST as capabilitiesThatMatter } from '../../content/series/capabilities-that-matter.js';
import { POST as informationExtractionPrompts } from '../../content/series/information-extraction-prompts.js';
import { POST as detectionWithoutADetector } from '../../content/series/detection-without-a-detector.js';

const RAW_SERIES_POSTS = [
  yourFirstAiAgent,
  nextWordSampling,
  foundationModelsExplained,
  whyModelsHallucinate,
  evaluationIsTheHardPart,
  promptEngineeringThatHelps,
  promptInjection,
  whatRagIs,
  whatAnAgentIs,
  finetuningOrRag,
  quantizationPlainTerms,
  dataQuality,
  latencyThroughputCost,
  guardrails,
  aiEngVsMlEng,
  threeLayersAiStack,
  modelSize,
  sftVsPreference,
  structuredOutputs,
  testTimeCompute,
  entropyCrossEntropy,
  embeddingsMeaningVectors,
  readingBenchmarks,
  chainOfThought,
  contextLength,
  chunkingForRag,
  retrievalAlgorithms,
  kvCache,
  probabilisticNature,
  multilingualQuality,
  domainSpecificModels,
  functionalCorrectness,
  aiAsAJudge,
  jailbreaking,
  buildVsBuyModel,
  evaluationPipeline,
  capabilitiesThatMatter,
  informationExtractionPrompts,
  detectionWithoutADetector,
];

// Sources come from the single verified list, not from inline blocks.
export const SERIES_POSTS = RAW_SERIES_POSTS.map(attachSources);
