// Every factual claim below is taken from the numbered sources at the end.
// Figure 2 of Kwon et al. (arXiv 2309.06180) is reproduced under CC BY 4.0.
// The batched-requests chart is redrawn from Figure 13 of the same paper.
// The four-request schedule and its chart are the author's own illustrative
// arithmetic, labeled as such in the text.
export const POST = {
  id: 'vllm-continuous-batching',
  title: 'Counting Idle Slots: Where vLLM Gets Its Throughput',
  excerpt: 'When the vLLM team profiled existing LLM servers, as little as 20.4% of the memory reserved for the KV cache held actual token states. Walk four requests through two schedulers by hand, then follow the memory, and the 2 to 4 times throughput gain stops looking like magic.',
  category: 'AI',
  tags: ['Deployment', 'vLLM', 'Batching', 'Inference'],
  body: [
    {
      type: 'p',
      text: 'In 2023 a Berkeley team measured how GPU memory was being used by the best large language model servers of the time, and the number was bad. While serving requests, the system they profiled used only 20.4% to 38.2% of its key and value cache memory to store actual token data. The rest was reserved for tokens that had not been generated yet, or was lost to fragmentation.[^1] Their fix, PagedAttention, and the server built on it, vLLM, raised that figure to 96.3% and improved throughput by 2 to 4 times at the same latency, against FasterTransformer and Orca.[^1]',
    },
    {
      type: 'p',
      text: 'vLLM\'s gain comes from two separate ideas working together. The first is a scheduling idea from the Orca paper of 2022: rebuild the batch after every token instead of after every request.[^2] The second is a memory idea: stop storing each request\'s cache as one contiguous slab. The Kwon et al. paper calls the two "complementary". Orca lets more requests run side by side, and paging makes it possible for more of them to fit in memory at once.[^1] The clearest way to see both is to run a tiny schedule by hand and count the wasted slots.',
    },
    {
      type: 'terms',
      optional: false,
      items: [
        { term: 'Iteration', def: 'One forward pass of the whole model over the current batch. In the generation phase, each iteration produces one new token per running request.' },
        { term: 'KV cache', def: 'The key and value vectors saved for every earlier token of a request, so each new token can attend to them without recomputing them.' },
        { term: 'Request-level (static) batching', def: 'The server hands a fixed batch to the engine and gets nothing back until every request in it has finished.' },
        { term: 'Iteration-level (continuous) batching', def: 'The scheduler runs one iteration, checks which requests finished, and may change the batch before the next iteration.' },
        { term: 'Slot', def: 'In this post, one place in the batch for one request during one iteration. A slot-step is one slot held for one step.' },
      ],
    },
    {
      type: 'h2',
      text: 'Four requests, two slots, thirteen steps',
    },
    {
      type: 'p',
      text: 'This example is illustrative. The arithmetic is mine, not from either paper. Four requests arrive together at time zero. Request A will produce 2 tokens, B will produce 8, C will produce 3 and D will produce 5, for 18 useful tokens in total. The GPU has room for two requests at once. That limit of two is set by memory, and the second half of this post is about it. To keep the counting clean, assume every step produces exactly one token per occupied slot and that reading the prompt costs nothing.',
    },
    {
      type: 'p',
      text: 'Under request-level batching the scheduler forms a batch, and the engine gives back results only when the whole batch is done. Orca\'s authors describe this behavior in existing systems such as Triton with FasterTransformer: a request that finishes early cannot return to the client, a request that arrives mid-batch waits for the batch to finish, and the engine keeps computing for the finished, "inactive" requests on every remaining iteration.[^2] Here is the schedule:',
    },
    {
      type: 'ul',
      items: [
        'Steps 1 and 2: slot 1 runs A, slot 2 runs B. A emits its last token at step 2.',
        'Steps 3 to 8: slot 1 is held by the finished A and does no useful work. Slot 2 runs B. That is 6 idle slot-steps, while C and D sit in the queue.',
        'End of step 8: B finishes, so the batch is done. A and B go back to their clients together, and A has waited 6 steps for no reason.',
        'Steps 9 to 11: slot 1 runs C, slot 2 runs D. C finishes at step 11.',
        'Steps 12 and 13: slot 1 is idle again while D runs. That is 2 more idle slot-steps. C and D return at step 13.',
      ],
    },
    {
      type: 'p',
      text: 'Totals: 13 steps, which gives 26 slot-steps. 18 did useful work and 8 were idle, so about 31% of the batch capacity was wasted. The results came back at steps 8, 8, 13 and 13, for a mean of 10.5.',
    },
    {
      type: 'p',
      text: 'Now apply Orca\'s rule. The scheduler repeats three things: pick the requests to run, run one iteration on them, collect the results. Because control comes back after every iteration, a finished request can return at once, and a new request only has to wait one iteration before it can be picked.[^2]',
    },
    {
      type: 'ul',
      items: [
        'Steps 1 and 2: slot 1 runs A, slot 2 runs B. A finishes at step 2 and returns at once.',
        'Step 3: the scheduler puts C into the free slot. Steps 3 to 5 run C and B, and C returns at step 5.',
        'Step 6: D takes the free slot. Steps 6 to 8 run D and B, and B returns at step 8.',
        'Steps 9 and 10: D runs alone. Slot 2 is idle because nothing is left in the queue. That is 2 idle slot-steps. D returns at step 10.',
      ],
    },
    {
      type: 'p',
      text: 'Totals: 10 steps, which gives 20 slot-steps. The same 18 did useful work, and only 2 were idle, about 10%. The results came back at steps 2, 5, 8 and 10, for a mean of 6.25. The model and the hardware are the same, and the total work is the same 18 tokens. All of the difference is idle time that the request-level scheduler created and the iteration-level scheduler filled.',
    },
    {
      type: 'chart',
      kind: 'bar',
      title: 'Step at which each request\'s result reaches the client',
      yLabel: 'Step number (lower is better)',
      series: [
        { label: 'Request-level batching', key: 'req' },
        { label: 'Iteration-level batching', key: 'iter' },
      ],
      data: [
        { label: 'A (2 tokens)', values: { req: 8, iter: 2 } },
        { label: 'B (8 tokens)', values: { req: 8, iter: 8 } },
        { label: 'C (3 tokens)', values: { req: 13, iter: 5 } },
        { label: 'D (5 tokens)', values: { req: 13, iter: 10 } },
      ],
      caption: 'Illustrative example, the author\'s own arithmetic: four requests, two slots, one token per step, free prefill. B is the longest request, and it finishes at step 8 either way. Every other request gains.',
    },
    {
      type: 'p',
      text: 'Two simplifications flatter the iteration-level version, and they are worth stating. First, a request that joins has to process its prompt. Orca calls this the initiation phase, and it handles all input tokens in one iteration, while later iterations handle one token each.[^2] Requests at different stages have tensors of different shapes, so they cannot simply be stacked into one batched matrix. Orca\'s answer is **selective batching**: it batches the linear layers across requests and splits the batch only for the attention operation, which has no model weights to share across requests anyway.[^2] Second, a long prompt joining the batch slows the iteration for everyone else in it. The Sarathi-Serve paper, a later work, calls these pauses "generation stalls" and shows one in vLLM lasting over several seconds on Yi-34B.[^5]',
    },
    {
      type: 'p',
      text: 'Measured on real models, the scheduling gain is large. With traces of mixed-length requests on a GPT-3 175B model, Orca matched a median normalized latency of 190 ms at 6.81 requests per second, while FasterTransformer managed 0.185, a 36.9 times gap.[^2] That comparison measures Orca\'s whole system, pipelining design included, so not all of it comes from the scheduler.',
    },
    {
      type: 'h2',
      text: 'Why the batch had only two slots',
    },
    {
      type: 'p',
      text: 'In the example, capacity was fixed at two, and in a real server capacity is set by the KV cache. At each generation step, the model computes a key and a value vector only for the newest token and reads the cached vectors for all earlier positions.[^1] That cache grows by one entry per token, in every layer.',
    },
    {
      type: 'eq',
      tex: '\\begin{gathered} M_{\\text{KV}} = 2 \\times L \\times H \\times d_{\\text{head}} \\\\ \\times\\; b \\times T \\end{gathered}',
      caption: 'KV cache size for one request. Kwon et al. compute the per-token cost of OPT-13B this way;[^1] splitting the hidden size into heads times head width is standard arithmetic.',
    },
    {
      type: 'p',
      text: 'Term by term: the 2 counts one key vector and one value vector. \\(L\\) is the number of layers, because every layer keeps its own cache. \\(H\\) is the number of key and value heads, and \\(d_{\\text{head}}\\) is the width of each head. In the original Transformer each head has width \\(d_{\\text{model}}/h\\), so \\(H \\times d_{\\text{head}}\\) equals the hidden size.[^3] \\(b\\) is the number of bytes per number, which is 2 for FP16. \\(T\\) is the number of tokens in the sequence so far.',
    },
    {
      type: 'p',
      text: 'The Kwon et al. paper plugs in OPT-13B: 2 times a hidden size of 5,120 times 40 layers times 2 bytes gives about 800 KB per token. OPT can generate up to 2,048 tokens, so one request can need up to 1.6 GB.[^1] On their single 40 GB A100, the weights take 26 GB and 12 GB is left for the cache, about 15.7 thousand token slots.[^1] One note on \\(H\\): models that use grouped-query attention share one key and value head across a group of query heads, and that shrinks \\(H\\) directly.[^4]',
    },
    {
      type: 'p',
      text: 'Orca reserves memory in exactly this way. When a new request is admitted, its scheduler reserves max_tokens slots for that request\'s keys and values in advance. This guarantees the request can never run out of memory partway through, but it means the reservation is sized for the worst case.[^2] My reading of the numbers: 15.7 thousand slots divided by 2,048 reserved slots per request is about 7.7 requests. In the Kwon et al. experiments, their Orca variant that reserves the maximum length ran an average of exactly 7.00 requests at a time on ShareGPT, and also on Alpaca.[^1] The scheduler can be perfect and the batch still cannot grow past what the reservations allow.',
    },
    {
      type: 'h2',
      text: 'Three ways a contiguous reservation wastes memory',
    },
    {
      type: 'p',
      text: 'Deep learning frameworks mostly want tensors in contiguous memory, so earlier servers stored each request\'s cache as one contiguous block sized for its maximum possible length.[^1] Kwon et al. name three kinds of waste that come from this. **Reserved** slots will hold future tokens eventually, but they block other requests while they wait. **Internal fragmentation** is the reserved space that is never used, because the request stopped short of its maximum, and it only becomes visible once the request finishes. **External fragmentation** is the unusable space between blocks of different sizes left by the memory allocator (the paper assumes a buddy allocator).[^1] Their Figure 3 shows a request with a 2,048-token maximum that leaves 2,038 slots unused.[^1]',
    },
    {
      type: 'image',
      src: '/blog-images/vllm-continuous-batching/kv-cache-waste.webp',
      alt: 'Stacked bar chart of KV cache usage. Orca (Max): 20.4% token states, 13.3% reservation, 57.3% internal fragmentation, 8.9% external fragmentation. Orca (Pow2): 26.8, 17.9, 13.6, 41.6. Orca (Oracle): 38.2, 25.2, 36.6. vLLM: 96.3% token states.',
      width: 975,
      height: 535,
      caption: 'Figure 2 from Kwon et al., 2023,[^1] reproduced under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Average share of KV cache memory by use. The three Orca bars are the authors\' own reimplementations, since Orca itself was not public: Max reserves 2,048 tokens, Pow2 over-reserves by at most 2 times, and Oracle knows the true output length.',
    },
    {
      type: 'p',
      text: 'The Oracle bar is the telling one. Even when the system knows each output length in advance, which no real server does, only 38.2% of the cache holds token states. The reservation still covers the request\'s whole lifetime, and the variable-size blocks still fragment the free space around them.[^1] Knowing the length in advance does not fix the waste. Only a different allocation scheme does.',
    },
    {
      type: 'h2',
      text: 'Pages and block tables',
    },
    {
      type: 'p',
      text: 'PagedAttention borrows the operating system\'s virtual memory. It cuts each request\'s cache into **KV blocks** of a fixed number of tokens, and the blocks do not need to sit next to each other in GPU memory. The paper\'s analogy is that blocks are pages, tokens are bytes and requests are processes.[^1] Each request has a **block table** that maps its logical blocks, in order, to physical blocks anywhere in a shared pool, and records how many positions of each block are filled.[^1] The attention kernel reads the table and fetches the blocks one by one.[^1]',
    },
    {
      type: 'p',
      text: 'The paper\'s own example uses 4-token blocks. A prompt of 7 tokens gets logical blocks 0 and 1, which map to physical blocks 7 and 1, with one slot left over. The first generated token fills that slot. The second finds the last block full, so vLLM takes physical block 3 from the pool and writes a new row into the table.[^1] New memory is claimed only when the previous block is full, so each request wastes at most part of one block. Because every block is the same size, external fragmentation disappears.[^1] When a request finishes, its blocks go straight back to the pool.[^1]',
    },
    {
      type: 'p',
      text: 'Block size is a trade-off. Blocks that are too small do not use the GPU\'s parallelism well when reading the cache. Blocks that are too large bring internal fragmentation back and reduce the chance that requests can share blocks. vLLM defaults to 16 tokens.[^1] The table also makes sharing cheap. Several samples from one prompt can point at the same physical prompt blocks, with a reference count and copy-on-write for the last block. On the Alpaca trace, sharing saved 6.1% to 9.8% of blocks in parallel sampling and 37.6% to 55.2% in beam search.[^1]',
    },
    {
      type: 'p',
      text: 'Paging also changes what happens when memory runs out. Blocks are claimed on demand, so a burst of long outputs can fill the pool. vLLM then preempts requests in first-come-first-served order, latest arrivals first, and evicts all of a sequence\'s blocks or none of them. It either swaps them to CPU memory or throws them away and recomputes them later.[^1] That is the price of dropping the worst-case reservation Orca used.',
    },
    {
      type: 'chart',
      kind: 'bar',
      title: 'Average requests batched at once, OPT-13B on one A100',
      yLabel: 'Batched requests',
      series: [
        { label: 'ShareGPT (2 req/s)', key: 's' },
        { label: 'Alpaca (30 req/s)', key: 'a' },
      ],
      data: [
        { label: 'Orca (Max)', values: { s: 7.0, a: 7.0 } },
        { label: 'Orca (Pow2)', values: { s: 9.81, a: 43.24 } },
        { label: 'Orca (Oracle)', values: { s: 13.62, a: 72.75 } },
        { label: 'vLLM', values: { s: 30.42, a: 132.44 } },
      ],
      caption: 'Redrawn from Figure 13 of Kwon et al., 2023.[^1] Alpaca requests are much shorter than ShareGPT ones, so more of them fit.',
    },
    {
      type: 'p',
      text: 'This chart shows the capacity from the hand example measured on a real model. On ShareGPT, vLLM kept 2.2 times as many requests in flight as Orca (Oracle) and 4.3 times as many as Orca (Max). At similar latencies, that became 1.7 to 2.7 times the sustainable request rate of Orca (Oracle), 2.7 to 8 times that of Orca (Max), and up to 22 times that of FasterTransformer, which has neither iteration-level scheduling nor efficient memory management.[^1] Both halves are needed. Iteration-level scheduling keeps the slots full, and paging gives it more slots to fill.',
    },
    {
      type: 'h2',
      text: 'Where paging stops paying',
    },
    {
      type: 'p',
      text: 'The block table has a cost. Looking up the table, running extra branches and handling variable sequence lengths made vLLM\'s attention kernel 20% to 26% slower than FasterTransformer\'s highly tuned version. The authors argue this is small because it affects only attention and not the linear layers.[^1] The gain also depends on memory being the bottleneck. With OPT-175B on eight 80 GB A100s and the short Alpaca requests, the Oracle and Pow2 baselines could already batch many requests, the workload became compute-bound, and vLLM\'s lead over them shrank.[^1] The paper\'s discussion section states the general limit. For workloads with static tensor shapes, like training, or for serving models that are compute-bound, better memory efficiency may not improve performance, and the extra indirection and non-contiguous blocks "may rather degrade the performance."[^1]',
    },
    {
      type: 'sources',
      numbered: true,
      items: [
        { title: 'Kwon et al., Efficient Memory Management for Large Language Model Serving with PagedAttention (SOSP 2023)', url: 'https://arxiv.org/abs/2309.06180' },
        { title: 'Yu et al., Orca: A Distributed Serving System for Transformer-Based Generative Models (OSDI 2022)', url: 'https://www.usenix.org/system/files/osdi22-yu.pdf' },
        { title: 'Vaswani et al., Attention Is All You Need (2017)', url: 'https://arxiv.org/abs/1706.03762' },
        { title: 'Ainslie et al., GQA: Training Generalized Multi-Query Transformer Models from Multi-Head Checkpoints (2023)', url: 'https://arxiv.org/abs/2305.13245' },
        { title: 'Agrawal et al., Taming Throughput-Latency Tradeoff in LLM Inference with Sarathi-Serve (2024)', url: 'https://arxiv.org/abs/2403.02310' },
      ],
    },
  ],
};
