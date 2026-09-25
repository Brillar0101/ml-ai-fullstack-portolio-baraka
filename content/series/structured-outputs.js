// Original AI Engineering series post. Rendered by src/pages/blog/SeriesPost.jsx;
// scheduled and given its sources in src/data/seriesPosts.js.
export const POST = {
  id: 'structured-outputs',
  title: 'Structured outputs: does forcing JSON make a model worse at thinking?',
  excerpt: 'Constrained decoding guarantees output that parses. A 2024 study said it also hurts reasoning, and a rebuttal said the study was measuring bad prompts. What each side measured, and the condition both end up agreeing on.',
  category: 'AI',
  chapter: 'Chapter 2',
  tags: ['Structured Output', 'JSON', 'Constrained Decoding'],
  seriesNum: 21,
  publishAt: '2026-04-22T12:00:00Z',
  body: [
    {
      type: 'p',
      text: "In 2024 a team from Appier AI Research and National Taiwan University asked GPT-3.5 Turbo to take the last letter of each of four words and join them. Answering in plain text, with room to reason step by step, it got 56.7% exact match. Told to answer in a JSON format described in the prompt, it got 25.2%. With JSON mode switched on, the API flag that makes the output valid JSON, it got 1.78%.[^1] The same pattern held on GSM8K, the grade-school math benchmark: 76.6% in plain text, 49.3% with the JSON instruction, 29.87% in JSON mode.[^1]",
    },
    {
      type: 'chart',
      kind: 'bar',
      title: 'GPT-3.5 Turbo on two reasoning tasks, by output format',
      yLabel: 'Exact match (%)',
      series: [
        { label: 'Plain text', key: 'nl', baseline: true },
        { label: 'JSON by instruction', key: 'fri' },
        { label: 'JSON mode', key: 'jm' },
      ],
      data: [
        { label: 'Last Letter', values: { nl: 56.7, fri: 25.2, jm: 1.78 } },
        { label: 'GSM8K', values: { nl: 76.6, fri: 49.3, jm: 29.87 } },
      ],
      caption: 'Redrawn from Tables 9 and 11 of Tam et al., 2024.[^1] Plain text and JSON-by-instruction scores are averages over nine prompt variants (Table 9); JSON-mode scores are averages from Table 11. Zero-shot, with a "think step by step" instruction in every prompt.',
    },
    {
      type: 'p',
      text: "The paper, titled \"Let Me Speak Freely?\", concluded that format restrictions cause \"a significant decline in LLMs' reasoning abilities,\" and that stricter constraints generally hurt more.[^1] Its Figure 1 is a single GSM8K question about overtime pay. In plain text the model works through the steps and answers 460, which is correct. Asked for JSON, it writes a one-sentence plan in the reasoning field and puts 490 in the answer field.[^1]",
    },
    {
      type: 'p',
      text: "Anyone who ships model output into a parser has a stake in whether this is true. The rest of this post takes the claim apart: how format constraints are enforced, what they cost, the evidence that they help, and the rebuttal that says the 2024 result came from the prompts rather than the constraint.",
    },
    {
      type: 'h2',
      text: 'Three ways to ask for JSON',
    },
    {
      type: 'p',
      text: 'Tam et al. compared three levels of strictness, and the distinction matters for everything that follows.[^1]',
    },
    {
      type: 'terms',
      optional: false,
      items: [
        { term: 'Constrained decoding', def: 'the decoder is only allowed to pick tokens that keep the output valid under some formal rule, such as a regular expression, a grammar, or a JSON Schema. Invalid tokens are removed before sampling.[^4]' },
        { term: 'JSON mode', def: 'a provider API flag (OpenAI and Gemini offered one) that makes the output valid JSON. Tam et al. write that they assume it works like the constrained decoding in Outlines, which is an assumption, not a documented fact.[^1]' },
        { term: 'Format-restricting instruction (FRI)', def: 'the prompt asks for JSON, XML or YAML in a given shape, but nothing enforces it at decode time.[^1]' },
        { term: 'NL-to-Format', def: 'two calls: the model answers in natural language first, then a second step converts that answer into the target format.[^1]' },
        { term: 'JSON Schema', def: 'a language for describing the shape of JSON data: field types, required keys, string patterns, array lengths. Most constrained decoding tools now accept it as input.[^4]' },
      ],
    },
    {
      type: 'p',
      text: "Every schema in the study had exactly two fields, one for reasoning and one for the answer. The authors kept it that simple on purpose, to isolate the effect of format on reasoning.[^1] Their results split by task type. On reasoning tasks (GSM8K, Last Letter, Shuffled Objects) looser formats did better. On classification tasks the opposite happened. Gemini 1.5 Flash went from 41.6% in text to 60.3% in JSON on DDXPlus, a 49-way medical diagnosis task. The authors guessed that a restricted answer space cuts down on answer-selection mistakes.[^1]",
    },
    {
      type: 'p',
      text: "They also found something that turns out to matter a great deal later. On Last Letter, 100% of GPT-3.5 Turbo's JSON-mode responses put the \"answer\" key before the \"reason\" key.[^1] The model committed to an answer first and wrote its reasoning afterwards. That is direct answering, not chain of thought, whatever the field names say.",
    },
    {
      type: 'h2',
      text: 'What the decoder actually does',
    },
    {
      type: 'p',
      text: "A language model picks one token at a time. At each step it produces a score, called a logit, for every token in its vocabulary, and the next token is sampled from those scores. Brandon Willard and Rémi Louf, in the paper behind the Outlines library, write the constrained version like this:[^2]",
    },
    {
      type: 'eq',
      tex: '\\begin{gathered} \\alpha = \\mathrm{LLM}(\\tilde{S}_t, \\theta) \\\\[4pt] \\tilde{\\alpha} = m(\\tilde{S}_t) \\odot \\alpha \\\\[4pt] \\tilde{s}_{t+1} \\sim \\mathrm{Categorical}(\\tilde{\\alpha}) \\end{gathered}',
      caption: 'Guided generation by masking, section 2.2 of Willard and Louf, 2023.[^2]',
    },
    {
      type: 'p',
      text: "\\(\\tilde{S}_t\\) is the sequence of \\(t\\) tokens generated so far. \\(\\theta\\) is the model's trained weights. \\(\\alpha\\) is the vector of scores, one per vocabulary entry, so it has \\(N\\) entries, where \\(N\\) is the vocabulary size and is often \\(10^4\\) or more.[^2] \\(m(\\tilde{S}_t)\\) is a boolean mask of the same length: 1 for tokens that keep the output valid given what has already been written, 0 for tokens that would break it. \\(\\odot\\) multiplies element by element, so every forbidden token is switched off. The last line samples the next token \\(\\tilde{s}_{t+1}\\) from what is left. The model's preferences among the valid tokens stay as they were. Only the support of the distribution shrinks.[^2]",
    },
    {
      type: 'p',
      text: "The expensive part is \\(m\\). The simple way to build it is to check every vocabulary entry against the constraint at every step, which is a fixed \\(O(N)\\) cost per generated token, and if matching restarts from the beginning of the output each time, that cost grows as the output gets longer.[^2] Willard and Louf's move was to convert the regular expression into a finite-state machine (a set of states with transitions that consume characters) and precompute, for every state, which vocabulary strings the machine can accept from there. At generation time the decoder only has to track which state it is in and look up the allowed set in a hash map, which costs \\(O(1)\\) on average.[^2]",
    },
    {
      type: 'image',
      src: '/blog-images/structured-outputs/outlines-fsm-masking.webp',
      alt: 'A four-state finite-state machine for decimal numbers, with states 0 to 3 linked by digit and dot transitions. Below it, a row of five logit cells for the tokens A, dot, 42, .2 and 1, with A blacked out. Two arrows branch off: sampling .2 moves the machine to state 3, where A, dot and .2 are blacked out; sampling 1 moves it to state 1, where only A is blacked out.',
      width: 1380,
      height: 1060,
      caption: 'Masking for the regular expression ([0-9]*)?\\.?[0-9]* with a toy five-token vocabulary. Black cells are masked tokens. After ".2" the machine is in state 3 and only digits are allowed; after "1" it is in state 1 and a dot is still possible. Figure 1 from Willard and Louf, 2023,[^2] reproduced under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).',
    },
    {
      type: 'p',
      text: "The figure shows why the index has to cover every state and not just the start. A token like \".2\" can match the middle of the pattern, so the lookup table needs an entry for each state it might be consumed from.[^2] For JSON, SQL or Python, a regular expression is not enough, and the paper extends the same indexing to context-free grammars using pushdown automata, which add a stack to handle nesting. Their index for a slightly augmented Python grammar came to about 50 MB, even built without removing redundant states.[^2]",
    },
    {
      type: 'p',
      text: "The only cost measurement in the paper is a head-to-head against Guidance, which at the time re-ran partial regex matching from the start of the output and scanned GPT-2's 50,257-token vocabulary on every step. In their plot, Guidance took close to two minutes to generate 60 tokens, while Outlines stayed near zero out to 100 tokens.[^2] Each point is one timed run, and the authors add the caveat \"barring any configuration oversights.\"[^2] Guidance works differently now: in a 2025 benchmark, below, it computed constraints on the fly and was the fastest engine tested.[^4]",
    },
    {
      type: 'p',
      text: "Grammar-constrained decoding, as Geng et al. called it in 2023, uses an incremental parser to supply the set of allowed next tokens and can plug into greedy decoding, beam search or sampling.[^3] Their latency numbers show where the overhead comes from. Pure decoding on an A100 took 54 ms per token for LLaMA-7B. The grammar step, run on a consumer CPU, added 1 ms per token for entity disambiguation and 4 ms for constituency parsing, but 69 ms for an extraction grammar with millions of rules.[^3] The overhead depends on how big the grammar is. For small grammars it is close to nothing.",
    },
    {
      type: 'h2',
      text: 'The case for constraining',
    },
    {
      type: 'p',
      text: "The first argument for constraints is the obvious one: without them, models often produce output that does not parse. Geng et al. asked few-shot LLaMA models, without finetuning, to produce Penn Treebank parse trees. Unconstrained LLaMA-33B produced a valid tree 64.2% of the time. With an input-dependent grammar, one built for each sentence so that it has to include every word of the input, validity was 100%, and bracketing F1 went from 42.9 to 54.6.[^3] On entity disambiguation, where the answer must be one of a list of candidate entities, LLaMA-33B's average accuracy across six datasets rose from 54.1 unconstrained to 80.3 constrained.[^3]",
    },
    {
      type: 'p',
      text: "JSONSchemaBench, from EPFL and Microsoft, tested the same idea at scale with about 10,000 real JSON schemas from GitHub, Kubernetes configs, API specs and a function-calling dataset.[^4] It separates two numbers. **Declared coverage** is the share of schemas a framework accepts without erroring. **Compliance rate** is the share of accepted schemas where the output actually validated. For open engines the model was Llama-3.2-1B-Instruct with greedy decoding.[^4]",
    },
    {
      type: 'chart',
      kind: 'bar',
      title: 'Compliance rate on JSONSchemaBench, two schema sets',
      yLabel: 'Compliance rate',
      series: [
        { label: 'Model only', key: 'lm', baseline: true },
        { label: 'Guidance', key: 'g' },
        { label: 'Llamacpp', key: 'l' },
        { label: 'OpenAI', key: 'o' },
      ],
      data: [
        { label: 'GitHub Medium', values: { lm: 0.38, g: 0.87, l: 0.74, o: 0.92 } },
        { label: 'GitHub Hard', values: { lm: 0.13, g: 0.69, l: 0.63, o: 1.0 } },
      ],
      caption: 'Redrawn from Table 4 of Geng et al., 2025.[^4] Compliance rate is valid outputs divided by schemas the framework accepted. OpenAI accepted only 13% of GitHub Medium and 9% of GitHub Hard schemas; Guidance and Llamacpp accepted 60% or more of both. The open engines ran Llama-3.2-1B-Instruct, so the OpenAI bars are not a direct comparison.',
    },
    {
      type: 'p',
      text: "With no constraint, a 1B model produced valid JSON for 38% of medium schemas and 13% of hard ones.[^4] Constraints raised that a lot, but no open engine reached 100% on these two sets, and they failed in different ways. Outlines lost compliance mostly to timeouts: features such as minItems, maxItems and enum could take from 40 seconds to 10 minutes to compile.[^4] The closed providers showed the opposite pattern. OpenAI's compliance was near perfect on what it accepted but it accepted very little, which the authors read as a deliberate choice to support only the schema features they can guarantee.[^4] On speed, Guidance ran at 6.37 ms per output token on the function-calling set against 15.40 ms for the unconstrained model, because it skips ahead over tokens the grammar forces. Outlines ran at 30.33 ms and spent 3.48 seconds compiling first.[^4]",
    },
    {
      type: 'h2',
      text: 'The rebuttal: same model, same prompt',
    },
    {
      type: 'p',
      text: "Will Kurt of .txt, a company that builds structured generation tools, published a response in 2024. It is a company blog post, not a peer-reviewed paper, and the author has a commercial stake, so weigh it accordingly. It includes reproduction notebooks, and JSONSchemaBench later adopted its setup.[^5,4]",
    },
    {
      type: 'p',
      text: "Kurt's first point concerned the scoring. Tam et al. did not score answers with a fixed regex. They used claude-3-haiku as an answer extractor and called it a \"perfect text parser.\"[^1] Rescoring the paper's own saved Llama-3-8B Last Letter outputs, Kurt got 0.35 with a strict regex, 0.57 with the AI parser, and 0.61 with four hand-written regexes.[^5] His second point concerned the prompts. The saved JSON-mode prompt he quotes says \"You must use the tool\" but never mentions JSON, gives no schema and names no tool.[^5] The paper's plain-text prompts described the expected answer format explicitly. His third point was that JSON mode is not the same thing as grammar-constrained generation.[^5]",
    },
    {
      type: 'p',
      text: "He then reran the three reasoning tasks with Llama-3-8B-Instruct, using the same prompt for both conditions: a system message that shows the schema, a worked example in that schema with reasoning before the answer, and the chat template applied properly. Structured generation came out slightly ahead on every task: 0.78 against 0.77 on GSM8K, 0.77 against 0.73 on Last Letter, and 0.44 against 0.41 on Shuffled Objects.[^5]",
    },
    {
      type: 'p',
      text: "JSONSchemaBench then ran the same three tasks with Llama-3.1-8B-Instruct, following Kurt's prompts. Every constrained engine beat the unconstrained model on every task, by margins of up to about 4 points.[^4]",
    },
    {
      type: 'chart',
      kind: 'bar',
      title: 'Reasoning accuracy with and without constrained decoding',
      yLabel: 'Accuracy (%)',
      series: [
        { label: 'Model only', key: 'lm', baseline: true },
        { label: 'Outlines', key: 'o' },
        { label: 'Guidance', key: 'g' },
      ],
      data: [
        { label: 'Last Letter', values: { lm: 50.7, o: 53.3, g: 54.0 } },
        { label: 'Shuffled Objects', values: { lm: 52.6, o: 53.0, g: 55.9 } },
        { label: 'GSM8K', values: { lm: 80.1, o: 81.6, g: 83.8 } },
      ],
      caption: 'Redrawn from Table 8 of Geng et al., 2025.[^4] Llama-3.1-8B-Instruct, output as {"reasoning": ..., "answer": ...}, with the answer field restricted by pattern (letters a to z, a choice from A to E, or a number). XGrammar and Llamacpp, omitted here, also beat the model-only baseline on all three tasks.',
    },
    {
      type: 'p',
      text: "Tam et al.'s own appendix is not as one-sided as their abstract. When they tested gpt-4o-mini with OpenAI's newer schema-enforced structured outputs, it scored 91.71 on GSM8K against 86.95 for JSON mode and 87.17 for JSON by instruction, and it scored best of all four formats on Last Letter at 86.07. Plain text still won on GSM8K at 94.57.[^1] The authors also found that parse failures were not the main explanation for the gaps. Their example is LLaMA 3 8B, whose Last Letter output failed to parse only 0.148% of the time in JSON while scoring far below plain text.[^1]",
    },
    {
      type: 'h2',
      text: 'The condition both sides meet on: reasoning goes first',
    },
    {
      type: 'p',
      text: "The two sides disagree less than their headlines suggest. The worst numbers in Tam et al. come from a condition where the model put the answer before the reasoning, or never had room to reason.[^1] The better numbers from the rebuttals come from setups that force reasoning to come first and constrain only the answer.[^5,4] The schema that makes this happen is small:",
    },
    {
      type: 'code',
      lang: 'json',
      title: 'reasoning before answer',
      code: '{\n  "type": "object",\n  "properties": {\n    "reasoning": { "type": "string" },\n    "answer":    { "type": "string", "pattern": "^[a-z]+$" }\n  },\n  "required": ["reasoning", "answer"]\n}',
    },
    {
      type: 'p',
      text: "One catch: a JSON Schema's list of properties does not fix the order they are generated in. Whether \"reasoning\" gets written first depends on the engine and on what the prompt and examples show. That is the author's reading of the specification and the GPT-3.5 key-order result, not a measured claim.[^1]",
    },
    {
      type: 'p',
      text: "CRANE, a 2025 paper from the University of Illinois, gives a theoretical reason for this. The authors prove that a model with a fixed number of layers, forced to emit only a string from a very restrictive grammar (for example, only a final yes or no), can solve only problems in a limited circuit class, TC0. Given room for intermediate steps, the same model can do much more.[^6] Their fix is to extend the grammar so that free reasoning comes first, then switch the constraint on between delimiters for the final expression. On GSM-Symbolic with Qwen2.5-Math-7B-Instruct, plain constrained decoding scored 29%, unconstrained chain of thought also 29%, and CRANE 38%. The constrained runs parsed 99% of the time, unconstrained chain of thought 82%, and CRANE 94%.[^6]",
    },
    {
      type: 'p',
      text: "A subtler problem remains even with a good field order. JSONSchemaBench's authors note that masking only filters tokens but can still push a model off its usual distribution. In their toy example, a model that wants to write \"89,000\" is blocked from the comma and ends up writing \"890000\".[^4] Geng et al. found a starker version with beam search. Under their extraction and parsing grammars, the single most likely output was consistently the empty string, because the grammar's structure was unnatural enough to the model that stopping immediately scored higher than any real answer. Length normalization fixed it.[^3]",
    },
    {
      type: 'callout',
      title: 'Reading a format-versus-accuracy result',
      text: "Before accepting any claim that constraints help or hurt, check four things. Did both conditions get the same prompt? Was the schema shown to the model? Could the model write its reasoning before the answer field? Was the answer scored by a fixed rule or by another model? The 2024 study and its rebuttal differ on the first three.[^1,5]",
    },
    {
      type: 'h2',
      text: 'What the original study could not test',
    },
    {
      type: 'p',
      text: "Tam et al. list their own main limitation plainly: \"due to cost constraints, we were unable to include results from more powerful language models such as LLaMA 70B or GPT-4o.\" They say those models might show how the effect changes with model size, and they also call their task set limited in scope.[^1] Their strongest model, gpt-4o-mini, was the one where schema enforcement came closest to plain text.[^1] The question that started the argument has only been tested on models of that size or smaller, on two-field schemas.",
    },
    {
      type: 'sources',
      numbered: true,
      items: [
        { title: 'Tam et al., Let Me Speak Freely? A Study on the Impact of Format Restrictions on Performance of Large Language Models, EMNLP Industry Track 2024', url: 'https://arxiv.org/abs/2408.02442' },
        { title: 'Willard and Louf, Efficient Guided Generation for Large Language Models, 2023', url: 'https://arxiv.org/abs/2307.09702' },
        { title: 'Geng, Josifoski, Peyrard, and West, Grammar-Constrained Decoding for Structured NLP Tasks without Finetuning, EMNLP 2023', url: 'https://arxiv.org/abs/2305.13971' },
        { title: 'Geng et al., JSONSchemaBench: A Rigorous Benchmark of Structured Outputs for Language Models, 2025', url: 'https://arxiv.org/abs/2501.10868' },
        { title: "Kurt, Say What You Mean: A Response to 'Let Me Speak Freely', .txt blog, 2024", url: 'https://blog.dottxt.co/say-what-you-mean.html' },
        { title: 'Banerjee, Suresh, Ugare, Misailovic, and Singh, CRANE: Reasoning with Constrained LLM Generation, ICML 2025', url: 'https://arxiv.org/abs/2502.09061' },
      ],
    },
  ],
};
