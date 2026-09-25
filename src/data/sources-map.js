// Which verified sources belong to which post.
//
// A source is listed here only when it actually supports what the post claims.
// Padding a list to hit a count would be its own kind of dishonesty, so any
// post that cannot reach five genuinely relevant sources is not in this map,
// and the publish gate holds it back as a draft rather than shipping it thin.
import { S } from './sources-library';

export const SOURCES = {
  // ---------- src/data/seriesPosts.js ----------
  'foundation-models-explained': [S.foundation, S.gpt3, S.llmSurvey, S.llama, S.instructgpt, S.wikiLLM],
  'why-models-hallucinate': [S.hallSurvey, S.hallNLG, S.factscore, S.hallInev, S.truthfulqa, S.wikiHall],
  'evaluation-is-the-hard-part': [S.helm, S.evalSurvey, S.mtbench, S.mmlu, S.contamination, S.checklist],
  'prompt-engineering-that-helps': [S.gpt3, S.promptProg, S.principled, S.cot, S.helm, S.ifeval],
  'prompt-injection': [S.indirectInj, S.promptInj, S.gcg, S.owasp, S.wikiInj, S.nist],
  'what-rag-is': [S.rag, S.ragSurvey, S.fid, S.dpr, S.ragBest, S.wikiRAG],
  'what-an-agent-is': [S.react, S.toolformer, S.agentSurvey, S.reflexion, S.voyager, S.gaia],
  'finetuning-or-rag': [S.ragfinetune, S.rag, S.lora, S.lima, S.ragSurvey, S.qlora],
  'quantization-plain-terms': [S.int8, S.gptq, S.awq, S.qlora, S.wikiQuant, S.scaleInfer],
  'data-quality': [S.dedup, S.lima, S.textbooks, S.pile, S.refinedweb, S.checklist],

  // ---------- content/ai-series ----------
  'latency-throughput-cost': [S.scaleInfer, S.pagedattn, S.flashattn, S.mqa, S.vllmDocs, S.int8],
  'guardrails': [S.owasp, S.nist, S.indirectInj, S.hh, S.gcg, S.hallSurvey],
  'ai-eng-vs-ml-eng': [S.foundation, S.llmSurvey, S.llmSurvey2, S.helm, S.checklist, S.gpt3],
  'three-layers-ai-stack': [S.foundation, S.llmSurvey, S.llmSurvey2, S.pagedattn, S.scaleInfer, S.vllmDocs],
  'model-size': [S.scaling, S.chinchilla, S.llama, S.phi3, S.distilbert, S.palm],
  'sft-vs-preference': [S.instructgpt, S.dpo, S.hh, S.lima, S.ppo, S.orca],
};
