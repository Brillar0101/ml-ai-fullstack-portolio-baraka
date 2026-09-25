// Every factual claim below is taken from the numbered sources at the end.
// The DistServe figure is reproduced under CC BY-SA 4.0 (arXiv 2401.09670).
// The chart is redrawn from Table 4 of Sarathi-Serve (arXiv 2403.02310),
// whose arXiv license does not allow reuse of its figures.
// Framework feature claims were checked against the linked docs in September 2026.
export const POST = {
  id: 'serving-frameworks-compared',
  title: 'Choosing an LLM Serving Stack by the Idea, Not the Benchmark',
  excerpt: 'One A100 served a 13B model at 1.6 requests per second within its latency targets. Split across three GPUs by phase, the same model reached 3.3 per GPU. The frameworks differ mostly in which of three scheduling ideas they implement, and each idea helps a different workload.',
  category: 'AI',
  tags: ['Deployment', 'Serving', 'Infrastructure'],
  body: [
    {
      type: 'p',
      text: 'In January 2024 a team from Peking University, StepFun and UC San Diego put a 13 billion parameter model on one 80GB A100 and fed it a synthetic workload: 512 input tokens and 64 output tokens per request. They needed 90% of requests to meet a latency target on the first token and a second target on every token after it. The existing system they measured, vLLM, held both targets up to about 1.6 requests per second.[^1] Then they ran the two halves of the work separately. A GPU doing only the prompt processing kept its target up to 5.6 requests per second. A GPU doing only the token generation kept its target up to 10.[^1]',
    },
    {
      type: 'p',
      text: 'The authors then did the arithmetic. Ideally, two prompt GPUs in front of one generation GPU would serve about 10 requests per second across three GPUs. That is 3.3 per GPU, or 2.1 times what one GPU managed doing both jobs.[^1] The model was the same and so was the hardware. Only the arrangement of the work changed.',
    },
    {
      type: 'image',
      src: '/blog-images/serving-frameworks-compared/distserve-goodput.webp',
      alt: 'Two stacked line charts sharing an x axis of request rate from 0 to 12 requests per second. The top chart plots P90 time to first token: the existing-systems line crosses the dashed target near 3 requests per second, the prefill-only line near 5.6. The bottom chart plots P90 time per output token: the existing-systems line crosses its dashed target near 1.6 requests per second, the decode-only line at 10.',
      width: 1030,
      height: 690,
      caption: 'A 13B model on one A100 with 512 input and 64 output tokens per request. Blue is a colocated system (vLLM), orange a GPU doing only prefill, green a GPU doing only decode. The dashed lines are the latency targets. Figure 1 from Zhong et al., 2024,[^1] reproduced under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/).',
    },
    {
      type: 'p',
      text: 'That experiment is a better guide to choosing a serving stack than any leaderboard. vLLM, SGLang, TGI and TensorRT-LLM all load the same weights and run the same matrix multiplies. They differ mainly in how they schedule work around the GPU, and three scheduling ideas from three papers explain most of that difference: prefix caching, chunked prefill, and prefill/decode disaggregation. Each one solves a specific problem, and each paper reports a setup where it stops helping. Pick the idea that matches your traffic first. The framework choice mostly follows from that.',
    },
    {
      type: 'terms',
      optional: false,
      items: [
        { term: 'Prefill', def: 'The first step of a request. The model reads the whole prompt in one parallel pass and produces the first output token. It keeps the GPU\'s arithmetic units busy (compute bound).' },
        { term: 'Decode', def: 'Every step after that. The model makes one new token per request per step. Each step still reads all the weights from memory, so it is limited by memory bandwidth, and batching many requests together is what makes it efficient.' },
        { term: 'KV cache', def: 'The keys and values the attention layers computed for every earlier token, kept in GPU memory so later steps do not recompute them. It depends only on the tokens that came before.' },
        { term: 'TTFT and TBT (or TPOT)', def: 'Time to first token, which prefill decides, and time between tokens (Sarathi-Serve\'s name) or time per output token (DistServe\'s), which decode decides. Users feel the first as the wait before text starts and the second as how smoothly it streams.' },
        { term: 'Goodput', def: 'DistServe\'s metric: the highest request rate a system can serve while a target share of requests (say 90%) meets both latency targets, divided by the number of GPUs. Raw throughput ignores latency; goodput does not.' },
      ],
    },
    {
      type: 'p',
      text: 'The latency a user sees for one request splits cleanly along the same line, which is why the three ideas pull at different ends of it:',
    },
    {
      type: 'eq',
      tex: '\\text{latency} = \\text{TTFT} + \\text{TPOT} \\times n_{\\text{decode}}',
      caption: 'Total request latency as defined in the DistServe paper,[^1] where \\(n_{\\text{decode}}\\) is the number of tokens generated in the decode phase.',
    },
    {
      type: 'p',
      text: 'One baseline sits under all three papers. vLLM\'s PagedAttention stores the KV cache in small fixed-size blocks, the way an operating system pages memory, which cuts wasted cache memory to near zero and lets more requests fit in a batch. Its authors reported 2 to 4 times the throughput of FasterTransformer and Orca at the same latency.[^4] SGLang, Sarathi-Serve and DistServe all measure themselves against vLLM, so read each of their numbers below as "on top of paged memory," not "on top of a naive server."',
    },
    {
      type: 'h2',
      text: 'Prefix caching: stop recomputing a prompt the GPU has already seen',
    },
    {
      type: 'p',
      text: '**The problem.** Many requests start with the same tokens: a system prompt, the same five few-shot examples, the chat history of a conversation that is still going. Because the KV cache depends only on earlier tokens, two requests with the same prefix have identical cache entries for that prefix. The SGLang authors point out that most inference engines of the time threw the cache away when a request finished and recomputed it for the next one.[^2]',
    },
    {
      type: 'p',
      text: '**The idea.** SGLang\'s RadixAttention keeps the KV cache of finished requests in a radix tree, a prefix tree whose edges can hold whole runs of tokens. A new request walks the tree, reuses every cached token it matches, and only runs prefill on the rest. When memory fills, the least recently used leaf is evicted first, so shared ancestors such as a system prompt survive longest. The cache and the running batch share one memory pool, and when enough requests are waiting the system evicts cached tokens to make room for a bigger batch.[^2] The scheduler also sorts the waiting queue so requests with longer matched prefixes go first, which the authors prove gives the best possible hit rate for an offline batch, given a cache at least as large as the longest request.[^2]',
    },
    {
      type: 'p',
      text: '**The measured result.** Most runs used a single 24GB A10G for 7B models, with multi-GPU setups for bigger ones. Baselines were vLLM v0.2.5, Guidance v0.1.8 and LMQL v0.7.3, and throughput was measured in whole programs completed per second over a large batch. SGLang reported up to 6.4 times higher throughput and up to 3.7 times lower latency across workloads such as 5-shot MMLU, ReAct agents, tree-of-thought, JSON decoding and multi-turn chat.[^2] These gains are not all from caching: the same system also runs calls within one program in parallel and decodes constrained JSON faster. Cache hit rates on those benchmarks ranged from 50% to 99%.[^2] In a month of serving on Chatbot Arena, with one worker per model, hit rates were 52.4% for LLaVA-NeXT-34B and 74.1% for Vicuna-33B, and time to first token for Vicuna-33B dropped by 1.7 times on average.[^2] When nothing could be reused, on ShareGPT traffic, managing the tree took 0.2 seconds of a 74.3 second run, under 0.3%.[^2]',
    },
    {
      type: 'p',
      text: '**When it does not help.** The paper is plain about this. In multi-turn chat with long outputs (256 to 512 tokens per turn), "there is almost no speedup," because sessions share little and decode time dominates; caching only shortens prefill.[^2] Reordering the queue by prefix match can starve requests that match nothing, a problem the authors leave for future work.[^2] One more thing to keep in mind about the baseline: a footnote says RadixAttention had already been partly added to vLLM as an experimental option, so the comparison deliberately used an earlier vLLM version.[^2]',
    },
    {
      type: 'h2',
      text: 'Chunked prefill: keep a long prompt from freezing everyone else\'s stream',
    },
    {
      type: 'p',
      text: '**The problem.** A server that batches continuously admits new requests while old ones are still generating. vLLM at the time prioritized prefill: when memory freed up, it ran the new prompt right away. A prefill of several thousand tokens can take seconds, and every request that was mid-answer waits for it. Sarathi-Serve\'s authors call this a generation stall. With Yi-34B on two A100s serving an arXiv summarization trace, they recorded vLLM stalls lasting several seconds.[^3] Systems that prioritize decode avoid stalls but leave the batch shrinking as requests finish, which wastes throughput.[^3]',
    },
    {
      type: 'p',
      text: '**The idea.** Sarathi-Serve sets a token budget per iteration. Each batch holds all ongoing decodes plus as many prompt tokens from new requests as fit in the remaining budget. A long prompt is split into chunks and prefilled over several iterations, so no single iteration takes much longer than a normal decode step. The authors call this stall-free batching.[^3] The budget is the dial: small budgets protect time between tokens, and large ones let prefill run more efficiently.',
    },
    {
      type: 'p',
      text: '**The measured result.** Tests covered Mistral-7B on one A100, Yi-34B on two, LLaMA2-70B on eight A40s, and Falcon-180B on two four-GPU nodes linked by 100 Gbps Ethernet, with request lengths from ShareGPT conversations and arXiv summarization. Serving capacity was the highest load a replica could sustain while holding a P99 time-between-tokens target. The strict targets were 0.1 seconds for Mistral-7B and 0.2 seconds for Yi-34B.[^3] Against vLLM, capacity rose by up to 2.6 times for Mistral-7B and 3.7 times for Yi-34B, and by up to 5.6 times end to end for Falcon-180B with pipeline parallelism.[^3] With a 512-token budget under the strict 100 ms target, Mistral-7B gained 3.5 times; with a 2048-token budget under a relaxed 1 second target, Yi-34B gained 1.65 times.[^3] One finding matters for anyone tuning a colocated server: vLLM\'s capacity stayed about the same with maximum batch sizes of 32, 64 and 128, because stalls, not memory, set the limit under tight targets.[^3]',
    },
    {
      type: 'chart',
      kind: 'bar',
      title: 'Yi-34B on two A100s, ShareGPT-length requests',
      yLabel: 'Seconds',
      series: [
        { label: 'P50 time to first token', key: 'ttft' },
        { label: 'P99 time between tokens', key: 'tbt' },
      ],
      data: [
        { label: 'Mixed batches only', values: { ttft: 0.53, tbt: 0.68 } },
        { label: 'Chunking only', values: { ttft: 1.04, tbt: 0.17 } },
        { label: 'Both (Sarathi-Serve)', values: { ttft: 0.76, tbt: 0.14 } },
      ],
      caption: 'Redrawn from Table 4 of Agrawal et al., 2024.[^3] 128 requests, token budget 1024. Chunking alone fixes the stream but slows the first token; mixing prefill into decode batches alone does the opposite.',
    },
    {
      type: 'p',
      text: '**When it does not help.** Chunking is not free. On Yi-34B, a 512-token chunk made prefill up to about 25% slower than running it whole; at 2048 the overhead was almost negligible.[^3] The chart shows the other cost: with chunking alone, median time to first token doubled compared with plain mixed batching.[^3] The DistServe paper adds two objections. Every chunk has to read the KV cache of all the chunks before it, so memory reads for a prompt split into N chunks grow with N squared, and this gets worse with longer contexts. And the chunk size cannot fix both problems at once: a small chunk makes the prefill itself slower because it shares the GPU with decodes, while a chunk big enough to saturate the GPU leaves little room for decodes to ride along.[^1] The vLLM documentation makes the same practical point: in practice the right chunk size is hard to find.[^7]',
    },
    {
      type: 'h2',
      text: 'Disaggregation: give prefill and decode separate GPUs',
    },
    {
      type: 'p',
      text: '**The problem.** Chunking softens the fight between prefill and decode but leaves both on the same GPUs, sharing one parallelism plan. DistServe\'s argument is that the phases want different things. Splitting each layer across GPUs (intra-operator parallelism) cuts execution time, which helps prefill latency but needs fast links. Splitting the model into pipeline stages scales request capacity. Decode, being bandwidth bound, depends on large batches. A colocated server has to pick one plan for both phases, prioritize one latency over the other, or over-provision GPUs.[^1]',
    },
    {
      type: 'p',
      text: '**The idea.** Run prefill on one set of GPUs and decode on another. After prefill, ship the request\'s KV cache to a decode instance. Given the two latency targets, DistServe searches for the number of GPUs and parallelism plan for each phase that maximize per-GPU goodput, then replicates that unit to meet traffic. It also places instances according to the network: when links between nodes are slow, it keeps matching prefill and decode stages inside one machine so the cache travels over NVLink.[^1]',
    },
    {
      type: 'p',
      text: '**The measured result.** The testbed was 4 nodes with 8 A100-80GB GPUs each, NVLink inside a node and only 25 Gbps between nodes. Models were OPT-13B, 66B and 175B. The authors chose OPT partly because its full multi-head attention makes the KV cache large, which puts heavy load on the transfer step.[^1] Workloads were chatbot (ShareGPT), code completion (HumanEval) and summarization (LongBench), each with its own targets; summarization allowed 15 seconds to first token but only 0.15 seconds per output token.[^1] At 90% attainment, DistServe sustained 2.0 to 4.6 times the request rate of vLLM on chatbot traffic, 5.7 times on code completion, and 4.3 times on summarization, where it also held a 12.6 times tighter target.[^1] Against DeepSpeed-MII, which uses chunked prefill, the gain was 1.6 to 7.4 times on the chatbot workload.[^1] So the headline "7.4×" in the abstract is that upper bound, against the chunked-prefill baseline on one workload, not an average over everything. The feared transfer cost stayed small: for OPT-175B it was under 0.1% of total latency, and over 95% of requests waited less than 30 ms for it.[^1]',
    },
    {
      type: 'p',
      text: '**When it does not help.** That transfer result depends on placement. The paper estimates that one 512-token request on OPT-66B carries about 1.13GB of KV cache, so 10 requests per second needs roughly 90 Gbps to hide the transfer.[^1] For offline, throughput-only jobs the authors say DistServe\'s advantage may shrink, and chunked prefill may be preferred because it fills each batch to the compute limit. With only a few GPUs, or one, the design space is "significantly limited," and they suggest a non-disaggregated system may be simpler and more efficient.[^1] Sarathi-Serve\'s authors add that disaggregation uses prefill GPUs\' memory poorly, since only the decode replicas store the KV cache.[^3]',
    },
    {
      type: 'h2',
      text: 'Matching workload traits to the idea that pays off',
    },
    {
      type: 'p',
      text: 'The mapping below is my reading of the three papers\' setups and stated limits, not a result any one paper measured. Start with the trait that describes most of your traffic.',
    },
    {
      type: 'ul',
      items: [
        'Long shared prompts (a large system prompt, fixed few-shot examples, agents that re-send history, several questions about one document or image): prefix caching matters most. It cuts prefill work and memory, and SGLang saw it shorten time to first token in production.[^2]',
        'Long, independent outputs (essays, long chat replies, generation with little shared context): prefix caching does almost nothing here.[^2] Decode dominates, so look at batching behavior and time between tokens instead.',
        'Long prompts mixed with streaming users on the same GPUs (RAG over big documents, summarization next to chat): chunked prefill, so one big prompt does not stall everyone else. Tune the token budget to your time-between-tokens target.[^3]',
        'Strict targets on both first-token time and per-token time, at a scale of many GPUs with fast links: disaggregation, where DistServe reported its largest gains, especially with long prompts and a tight per-token target.[^1]',
        'One or a few GPUs, or offline batch jobs with no latency target: stay colocated with chunked prefill. Both the DistServe and Sarathi-Serve authors point in that direction for these cases.[^1,3]',
        'Low or spiky volume with no one to run GPUs: a hosted API. The only one of these ideas you can use there is prompt caching, and you use it by keeping your prompt prefix stable.[^15,16]',
      ],
    },
    {
      type: 'callout',
      title: 'Feature lists move fast. These were checked in September 2026.',
      text: 'vLLM: automatic prefix caching (enable_prefix_caching), chunked prefill on by default in its V1 engine where possible, disaggregated prefilling still marked experimental.[^5,6,7] SGLang: RadixAttention on unless you pass --disable-radix-cache, a --chunked-prefill-size option, and prefill/decode disaggregation over Mooncake or NIXL transfer engines.[^8,9] TGI: prefix caching and chunking since v3, but the project is now in maintenance mode and its docs recommend vLLM or SGLang going forward.[^10,11] TensorRT-LLM: KV cache reuse on by default, chunked context, and disaggregated serving.[^12,13,14] Hosted APIs: OpenAI applies prompt caching automatically on supported models, with cached input discounted up to 90%; Anthropic caches prefixes marked with cache_control.[^15,16] Recheck any of these before you rely on them.',
    },
    {
      type: 'p',
      text: 'None of the three papers compared all three ideas under one setup. Sarathi-Serve left a quantitative comparison with disaggregation for future work.[^3] DistServe compared against chunked prefill only through DeepSpeed-MII.[^1] Your own benchmark should cover what the papers did not: replay your real prompt and output lengths at your real arrival rate, and report goodput at your targets, not tokens per second.',
    },
    {
      type: 'h2',
      text: 'What disaggregation adds to the failure model',
    },
    {
      type: 'p',
      text: 'Choosing a serving stack also means choosing how it fails, and the DistServe paper names a cost that its benchmarks do not show. In a colocated system with replicas, a fault in one instance usually does not affect the others. In DistServe, prefill and decode instances depend on each other, and the authors write that a fault in a single decoding instance mapped to multiple prefill instances "could potentially cripple the entire service and cluster." The paper does not implement fault tolerance or preemption and leaves both as future work.[^1]',
    },
    {
      type: 'sources',
      numbered: true,
      items: [
        { title: 'Zhong et al., "DistServe: Disaggregating Prefill and Decoding for Goodput-optimized Large Language Model Serving" (2024)', url: 'https://arxiv.org/abs/2401.09670' },
        { title: 'Zheng et al., "SGLang: Efficient Execution of Structured Language Model Programs" (2024)', url: 'https://arxiv.org/abs/2312.07104' },
        { title: 'Agrawal et al., "Taming Throughput-Latency Tradeoff in LLM Inference with Sarathi-Serve" (2024)', url: 'https://arxiv.org/abs/2403.02310' },
        { title: 'Kwon et al., "Efficient Memory Management for Large Language Model Serving with PagedAttention" (2023)', url: 'https://arxiv.org/abs/2309.06180' },
        { title: 'vLLM documentation: Automatic Prefix Caching', url: 'https://docs.vllm.ai/en/latest/features/automatic_prefix_caching/' },
        { title: 'vLLM documentation: Optimization and Tuning (chunked prefill)', url: 'https://docs.vllm.ai/en/latest/configuration/optimization/' },
        { title: 'vLLM documentation: Disaggregated Prefilling (experimental)', url: 'https://docs.vllm.ai/en/latest/features/disagg_prefill/' },
        { title: 'SGLang documentation: Server Arguments', url: 'https://docs.sglang.io/docs/advanced_features/server_arguments' },
        { title: 'SGLang documentation: PD Disaggregation', url: 'https://docs.sglang.io/docs/advanced_features/pd_disaggregation' },
        { title: 'Hugging Face Text Generation Inference documentation', url: 'https://huggingface.co/docs/text-generation-inference/index' },
        { title: 'TGI v3 overview: caching and chunking', url: 'https://huggingface.co/docs/text-generation-inference/conceptual/chunking' },
        { title: 'TensorRT-LLM documentation: KV cache reuse', url: 'https://nvidia.github.io/TensorRT-LLM/advanced/kv-cache-reuse.html' },
        { title: 'TensorRT-LLM documentation: Multi-head, multi-query and group-query attention (chunked context)', url: 'https://nvidia.github.io/TensorRT-LLM/advanced/gpt-attention.html' },
        { title: 'TensorRT-LLM documentation: Disaggregated serving', url: 'https://nvidia.github.io/TensorRT-LLM/features/disagg-serving.html' },
        { title: 'OpenAI API documentation: Prompt caching', url: 'https://developers.openai.com/api/docs/guides/prompt-caching' },
        { title: 'Claude API documentation: Prompt caching', url: 'https://platform.claude.com/docs/en/build-with-claude/prompt-caching' },
      ],
    },
  ],
};
