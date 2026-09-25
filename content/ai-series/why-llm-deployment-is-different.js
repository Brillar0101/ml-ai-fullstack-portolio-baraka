// Every factual claim below is taken from the numbered sources at the end.
// Both charts are redrawn from reported numbers: Splitwise (arXiv 2311.18677)
// is CC BY-NC-SA, so its figures are not reproduced; the batch-size chart uses
// Table D.3 of Pope et al. (arXiv 2211.05102). The TPU v4 ridge-point figure
// and the "intensity is about B" reading are the author's arithmetic, labeled
// as such in the text.
export const POST = {
  id: 'why-llm-deployment-is-different',
  title: 'Six Web-Service Assumptions an LLM Endpoint Breaks',
  excerpt: 'On Azure production traces, a 1,500-token prompt on BLOOM-176B took as long as generating six output tokens. That one measurement, and a few others from Splitwise and Google\'s PaLM inference paper, knock over most of what ordinary web-service capacity planning assumes.',
  category: 'AI',
  tags: ['Deployment', 'Inference', 'Production'],
  body: [
    {
      type: 'p',
      text: "In late 2023 a team from Microsoft and the University of Washington took 20-minute production traces from two Azure LLM services, one for code completion and one for conversation, and replayed their request sizes against BLOOM-176B and Llama2-70B on a machine with eight H100 GPUs.[^1] One line in their results is worth sitting with. For BLOOM-176B, processing a 1,500-token prompt took the same time as generating just 6 output tokens.[^1] Reading the whole input and writing six words of the answer cost the same. Across both traces, most of each request's end-to-end time went to generating output, even for the coding service, whose prompts were long and whose answers were a handful of tokens.[^1]",
    },
    {
      type: 'p',
      text: "That paper is Splitwise, and its characterization section reads like a list of ways an LLM endpoint differs from the services most backend engineers have learned to size. Each section below takes one of those habits of thought, states it plainly, and puts it next to what Splitwise, and a 2022 Google paper on serving PaLM, actually measured.[^1,2]",
    },
    {
      type: 'terms',
      optional: false,
      items: [
        { term: 'Prefill (prompt phase)', def: 'The first forward pass of a request. All input tokens go through the model in parallel, and the pass ends with the first output token.' },
        { term: 'Decode (token phase)', def: 'Every step after that. The model makes one forward pass per new token, feeding in only the last token plus cached state, so steps run one after another.' },
        { term: 'KV cache', def: 'The attention keys and values the model saved for every earlier token of a sequence. Each decode step reads the whole cache for that sequence.' },
        { term: 'HBM', def: 'High-bandwidth memory, the large memory next to the accelerator chip. Weights and the KV cache live there and must be streamed into the compute cores to be used.' },
        { term: 'MFU', def: 'Model FLOPS utilization: the throughput you observe divided by what the hardware would deliver if every chip ran at peak arithmetic speed with no waiting on memory or network.' },
        { term: 'Memory-bound', def: 'A step whose time is set by how fast bytes can be moved out of memory, not by how fast the chip can do arithmetic on them.' },
      ],
    },
    {
      type: 'h2',
      text: 'Every request costs about the same',
    },
    {
      type: 'p',
      text: "A typical API call reads a row and returns JSON, and one call looks a lot like the next, so capacity is a matter of counting calls. An LLM request has two sizes instead of one: how many tokens come in and how many go out. The Splitwise traces show how far apart those can be. The coding service had a median prompt of 1,500 tokens, because the prompt carries the code written so far, but a median output of only 13 tokens, since it suggests the next few words. The conversation service had a median prompt of 1,020 tokens and a median output of 129, with an output distribution the authors call almost bimodal.[^1] Their first insight, stated as such, is that different inference services may have widely different prompt and token distributions.[^1] A subset of those traces is public.[^5]",
    },
    {
      type: 'chart',
      kind: 'bar',
      title: 'Median tokens per request on two Azure LLM services',
      yLabel: 'Tokens (median)',
      series: [
        { label: 'Prompt tokens', key: 'p' },
        { label: 'Output tokens', key: 'o' },
      ],
      data: [
        { label: 'Coding', values: { p: 1500, o: 13 } },
        { label: 'Conversation', values: { p: 1020, o: 129 } },
      ],
      caption: 'Redrawn from the medians reported in Section III-A of Patel et al., 2023 (Splitwise),[^1] from production traces taken on November 11, 2023. The two services differ by about 10 times in output length while their prompts are within 1.5 times of each other.',
    },
    {
      type: 'p',
      text: "Those two numbers do not cost the same kind of work. Prefill runs every input token through the model in one parallel pass. Decode runs one sequential pass per output token, and a Google paper notes plainly that the two phases \"have different performance characteristics\" and must be analyzed separately.[^2] So a request with a long prompt and short answer loads the machine in a different way from a request with a short prompt and a long answer, even if their total token counts match.",
    },
    {
      type: 'p',
      text: "A larger dataset points the same way. BurstGPT collected 10.31 million requests from regional Azure OpenAI GPT services over 213 days. Its authors found request lengths following a Zipf distribution, with short requests the most frequent, and ChatGPT response lengths that were bimodal.[^3] They also argue that the unpredictable length of each response adds uncertainty to how loaded the system will be.[^3] You do not learn how expensive a request is when it arrives. You learn when it finishes.",
    },
    {
      type: 'h2',
      text: 'Latency is one number',
    },
    {
      type: 'p',
      text: "For a CRUD endpoint, p50 and p99 of total response time tell most of the story. Splitwise tracks four metrics instead: end-to-end latency, time to first token (TTFT, how long until the user sees anything), time between tokens (TBT, the pace of the stream after that), and throughput in requests per second.[^1] Pope and colleagues at Google split latency the same way, into prefill time and decode time, and note that decode latency can be reported per step, meaning per generated token.[^2]",
    },
    {
      type: 'p',
      text: "The split matters because the two halves respond to different things. In Splitwise's measurements, TTFT grew almost linearly with prompt length, which the authors put down to the prompt phase keeping the GPU busy and being compute-bound. TBT, by contrast, barely moved as more requests were batched together: at a batch of 64, time between tokens was only 2 times higher than at batch 1.[^1] Which tasks care about which number also varies. For batch work such as summarization, throughput matters more than TTFT or TBT; for conversational APIs, TTFT and TBT carry the tight targets.[^1]",
    },
    {
      type: 'p',
      text: "Pope's paper gives a feel for the sizes involved. Serving PaLM 540B with int8 weights on 64 TPU v4 chips, their implementation could take 64 new tokens from a user, attend over a cached conversation history of 1,920 tokens, and generate a 64-token reply in 1.9 seconds in total.[^2] Their lowest decode latency was 29 milliseconds per token.[^2] A single end-to-end percentile hides whether a slow request was slow to start or slow to stream, and those have different fixes.",
    },
    {
      type: 'h2',
      text: 'The processor is what you are waiting on',
    },
    {
      type: 'p',
      text: "On a busy web server, high CPU usually means the CPU is the limit. On an accelerator running decode, the arithmetic units can be mostly idle while the request still waits. Pope and colleagues explain why. The weights and the KV cache sit in HBM and have to be moved into the chip's compute cores once per forward pass, whether that pass is prefill or a single decode step. They call that time the memory time. Separately, a decoder-only model with \\(N\\) parameters needs about \\(2N\\) matrix-multiply FLOPs per token, and the time that would take at peak speed is the compute time.[^2] A step cannot finish faster than the larger of the two:",
    },
    {
      type: 'eq',
      tex: '\\begin{gathered} T_{\\text{step}} \\;\\ge\\; \\max\\big(T_{\\text{mem}},\\; T_{\\text{comp}}\\big) \\\\[6pt] T_{\\text{mem}} = \\frac{M_{\\text{weights}} + M_{\\text{KV}}}{n_{\\text{chips}} \\cdot \\text{BW}_{\\text{HBM}}} \\\\[6pt] T_{\\text{comp}} = \\frac{2N \\cdot B}{n_{\\text{chips}} \\cdot F_{\\text{peak}}} \\end{gathered}',
      caption: 'A lower bound on one decode step, written in this post\'s notation from the memory-time and compute-time definitions in Section 2 of Pope et al.[^2] Taking the larger of a memory limit and a compute limit is the roofline idea of Williams, Waterman and Patterson.[^4] Chip-to-chip communication, which Pope treats separately, is left out.',
    },
    {
      type: 'p',
      text: "Term by term: \\(M_{\\text{weights}}\\) is the bytes of all model weights and \\(M_{\\text{KV}}\\) the bytes of the KV cache for every sequence in the batch. \\(\\text{BW}_{\\text{HBM}}\\) is memory bandwidth per chip in bytes per second, and \\(n_{\\text{chips}}\\) is how many chips share the work. \\(B\\) is the batch size, the number of sequences each producing one token this step, and \\(F_{\\text{peak}}\\) is peak FLOPs per second per chip. Pope's paper states the pieces directly: both the weight-loading part of memory time and the compute time scale with model size and shrink with more chips, and at small batches and short sequences the weight loading dominates.[^2]",
    },
    {
      type: 'p',
      text: "The roofline paper gives the ratio that decides which term wins. It calls operations per byte of memory traffic the operational intensity, and the point where a machine's bandwidth line meets its peak-FLOPS line is the ridge point: a kernel below it is memory-bound, a kernel above it is compute-bound.[^4] Pope's TPU v4 chips run 275 TFLOPS of bfloat16 math with 1,200 GB/s of HBM bandwidth.[^2] Dividing one by the other (the author's arithmetic) puts the ridge at roughly 229 FLOPs per byte. With 2-byte weights, a decode step does about \\(2N \\cdot B\\) FLOPs against \\(2N\\) bytes of weights, so its intensity is roughly \\(B\\) FLOPs per byte before the KV cache adds more bytes. On that reading, any decode batch much smaller than a couple of hundred sequences leaves the arithmetic units waiting on memory. That lines up with Pope's own finding that the lowest decode cost came at batch sizes above about 512.[^2]",
    },
    {
      type: 'p',
      text: "The KV cache can make memory time much worse. For a 500B+ model with standard multihead attention, batch 512 and 2,048-token contexts, Pope reports a KV cache of 3 TB, three times the size of the weights, which has to be loaded once for every token generated, \"during which the computational core of the chip is essentially idle.\"[^2] Splitwise saw the same pattern from the power meter. Prompt-phase power draw rose with batch size; token-phase power did not change as batched tokens increased, and capping GPU power from 700 W to 350 W left token-generation latency almost untouched while prompt latency rose sharply.[^1] Their Insight V puts it in one line: prompt-phase batching is compute-bound, while the token phase is limited by memory capacity.[^1]",
    },
    {
      type: 'h2',
      text: 'Packing more requests together slows each one down',
    },
    {
      type: 'p',
      text: "Batching in ordinary services trades latency for throughput: you hold work back so a larger chunk can go together. For decode that trade barely exists, because a step that is waiting on weight loads can serve more sequences with the same load. Appendix D of Pope's paper has the numbers for PaLM 540B on 64 TPU v4 chips, with 60 input tokens and 20 output tokens per sequence.[^2]",
    },
    {
      type: 'chart',
      kind: 'bar',
      title: 'PaLM 540B: time for prefill and for 20 decode steps as the batch grows',
      yLabel: 'Milliseconds',
      series: [
        { label: 'Prefill (60 tokens)', key: 'p' },
        { label: 'Decode (20 tokens)', key: 'd' },
      ],
      data: [
        { label: 'B=4', values: { p: 50, d: 640 } },
        { label: 'B=8', values: { p: 80, d: 574 } },
        { label: 'B=16', values: { p: 153, d: 602 } },
        { label: 'B=32', values: { p: 270, d: 626 } },
        { label: 'B=64', values: { p: 501, d: 717 } },
        { label: 'B=128', values: { p: 985, d: 829 } },
        { label: 'B=256', values: { p: 2041, d: 1114 } },
      ],
      caption: 'Redrawn from Table D.3 of Pope et al., 2022,[^2] PaLM 540B on 64 TPU v4 chips with 2D partitioning. From batch 4 to 128, prefill time grows about 20 times; decode time grows about 1.3 times. Decode MFU over the same range rises from 1% to 19%.',
    },
    {
      type: 'p',
      text: "Going from 4 to 128 sequences is 32 times more work. Prefill time rose from 50 to 985 milliseconds, about 20 times. Decode time went from 640 to 829 milliseconds, and its MFU from 1% to 19%.[^2] The extra sequences rode along on weight loads the step was doing anyway. Splitwise found the same from the other direction: prompt-phase throughput fell off after about 2,048 batched prompt tokens, while token-phase throughput kept rising with batch size until the machine ran out of memory at 64. Their Insight IV says the prompt batch should be limited, while batching the token phase \"yields high throughput without any downside.\"[^1]",
    },
    {
      type: 'p',
      text: "Real traffic rarely gives decode that big a batch. Running the traces at 2 requests per second with mixed continuous batching, Splitwise found the conversation machine spent 60 to 70% of its time with 20 or fewer active tokens in the batch, and the coding machine ran a single token more than 20% of the time.[^1] Pope's low-latency configurations show what planners do about it: prefill at batch 1 and decode at batch 32 to 64, because decode tolerates the larger batch with negligible latency cost. They note this can be done by pipelining a batch-1 prefill server into a batch-64 decoding server.[^2] To my reading, that sentence from 2022 already holds the core of the idea Splitwise later built a whole cluster design around.",
    },
    {
      type: 'h2',
      text: 'More chips means proportionally more speed',
    },
    {
      type: 'p',
      text: "Stateless services scale out: twice the replicas, twice the throughput, same latency. A model too large for one chip has to be split across many, and then the chips must talk. Pope's team writes that weight-loading time and compute time both fall as chips are added, but communication time between chips \"decreases less quickly (or not at all)\" for a given layout, so it becomes a growing bottleneck as chip count rises.[^2] Their better 2D layout makes communication shrink with the square root of the chip count rather than stay flat, which is why it can keep cutting latency past the point where a 1D layout stalls.[^2]",
    },
    {
      type: 'p',
      text: "Latency and cost pull against each other here. Smaller batches give lower latency but lower MFU, and so a higher cost per token.[^2] In PaLM 540B's generate phase, the minimum latency was 3 times lower than latency at batch 512, but the lowest cost was only reached at batches above about 512.[^2] Their example configurations for PaLM 540B show the spread in utilization on the same 64 chips: 43% MFU for low-latency prefill, 14% for low-latency decode, 76% for high-throughput prefill and 33% for high-throughput decode.[^2] Across model sizes, they estimate latency grew roughly with the square root of model size, since bigger models can be spread over more chips before communication takes over.[^2] Adding hardware buys some latency. It does not buy it in proportion.",
    },
    {
      type: 'h2',
      text: 'The newest GPU is the best buy',
    },
    {
      type: 'p',
      text: "If the slow phase is waiting on memory, a chip with much more arithmetic and only somewhat more bandwidth helps it less. Splitwise's Table I shows that shape across one generation: the H100 has 3.43 times the A100's compute and draws 1.75 times the power, but has only 1.64 times the memory bandwidth and the same 80 GB capacity.[^1] Running Llama2-70B without batching on conversation-trace request sizes, moving from A100 to H100 cut median TTFT from 155 to 84 ms, but TBT only from 40 to 28 ms, while cost per request rose from $2.4 to $3.6 and energy from 7.9 to 9.4 Wh.[^1] The authors conclude that token generation can run on less compute-capable hardware for better performance per watt and per dollar.[^1]",
    },
    {
      type: 'p',
      text: "Their broader observation is that putting both phases on one machine leads to inconsistent latencies from arbitrary batching of prompt and token work, so services over-provision expensive GPUs to meet tight latency targets.[^1] Splitting the phases onto separate machine pools, with the KV cache sent from prompt machine to token machine over InfiniBand, gave clusters up to 1.4 times the throughput at 20% lower cost, or 2.35 times the throughput for the same cost and power, against their baselines.[^1] The transfer is the main new overhead. By sending each layer's KV cache as soon as it is computed, overlapped with the rest of prefill, they measured a leftover non-overlapped transfer of about 8 ms on A100s and about 5 ms on H100s.[^1]",
    },
    {
      type: 'callout',
      title: 'What to put on the dashboard',
      text: "Track TTFT and TBT separately, not just end-to-end time, since Splitwise shows they respond to different causes.[^1] Log input and output token counts per request, because the cost of a request depends on both. Treat accelerator utilization with care: during decode a chip can be nearly out of memory bandwidth while its arithmetic units sit mostly idle.[^2]",
    },
    {
      type: 'h2',
      text: 'Where the papers say the limits still are',
    },
    {
      type: 'p',
      text: "Neither paper claims to have made this easy. Splitwise lists open problems in its discussion. Mixing GPU types in one data center to match each phase \"may bring its own challenges\" for the cloud provider. And chat APIs today resend the whole conversation with each turn; if services start caching that context on the GPU instead, the prompt phase's memory pattern could change, and the KV cache might have to be shipped back to a prompt machine for the next turn.[^1] BurstGPT, working from real Azure traffic, attributes a relatively high failure rate mainly to inefficient KV cache management, with bursts of requests causing memory bottlenecks and spikes in failures.[^3]",
    },
    {
      type: 'p',
      text: "Pope and colleagues end on the hardest limit. Even after pushing inference across 64 and more chips, they write, \"FLOP count and communication volume can fundamentally limit inference performance of dense Transformer models.\" Their hopes for going further rest on reducing FLOPs per token, through sparsity techniques such as mixture-of-experts models, adaptive computation that spends different amounts of compute on different inputs and steps, and on compressing the traffic between chips.[^2]",
    },
    {
      type: 'sources',
      numbered: true,
      items: [
        { title: 'Patel et al., Splitwise: Efficient Generative LLM Inference Using Phase Splitting, 2023', url: 'https://arxiv.org/abs/2311.18677' },
        { title: 'Pope et al., Efficiently Scaling Transformer Inference, MLSys 2023', url: 'https://arxiv.org/abs/2211.05102' },
        { title: 'Wang et al., BurstGPT: A Real-World Workload Dataset to Optimize LLM Serving Systems, 2024', url: 'https://arxiv.org/abs/2401.17644' },
        { title: 'Williams, Waterman, and Patterson, Roofline: An Insightful Visual Performance Model for Floating-Point Programs and Multicore Architectures, Communications of the ACM, 2009', url: 'https://people.eecs.berkeley.edu/~kubitron/cs252/handouts/papers/RooflineVyNoYellow.pdf' },
        { title: 'Microsoft Azure, Azure LLM Inference Trace 2023 (public subset of the Splitwise traces)', url: 'https://github.com/Azure/AzurePublicDataset/blob/master/AzureLLMInferenceDataset2023.md' },
      ],
    },
  ],
};
