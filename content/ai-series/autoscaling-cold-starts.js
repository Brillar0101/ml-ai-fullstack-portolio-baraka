// Every factual claim below is taken from the numbered sources at the end.
// All three charts are redrawn from figure values in ServerlessLLM (arXiv
// 2401.14351, CC BY-SA 4.0) and HydraServe (arXiv 2502.15524, arXiv
// non-exclusive license). The queueing model is standard fluid-queue
// arithmetic, labelled as such in the text; the papers do not state it.
export const POST = {
  id: 'autoscaling-cold-starts',
  title: 'Timing an LLM Cold Start, Phase by Phase',
  excerpt: 'In the ServerlessLLM paper, KServe took 128 seconds to return the first token from a cold OPT-6.7B replica, and 114 of those seconds went to downloading the weights. This post times each phase of a GPU cold start with numbers from the papers, then shows what each paper does to shrink it and when those fixes stop helping.',
  category: 'AI',
  tags: ['Deployment', 'Autoscaling', 'GPU'],
  body: [
    {
      type: 'p',
      text: "When the ServerlessLLM authors, from the University of Edinburgh and NTU Singapore, ran KServe, a common Kubernetes serving system, on a GPU server, the first token from a newly started OPT-6.7B replica arrived after 128 seconds. 114 of those seconds were spent downloading the model checkpoint from a local S3 store over a 1 Gbps network.[^1] After they gave KServe the same local SSD storage they had given their other baselines, it got to 28 seconds. ServerlessLLM, the system the paper introduces, was the only one they tested that brought it under one second.[^1]",
    },
    {
      type: 'p',
      text: "Bigger models made the gap wider. In the paper's cluster test with OPT-30B, ServerlessLLM started the model in 7.5 seconds on average, while Ray Serve took 213 seconds and Ray Serve with a local SSD cache took 199.2. Each request had a 300 second timeout. ServerlessLLM answered 89% of requests within it, and the cached Ray Serve answered 26%.[^1] In production those failed requests would be users getting errors while an autoscaler waits for a replica to finish booting.",
    },
    {
      type: 'p',
      text: "This post breaks one of those minutes into its parts. A cold start is the sequence of steps a new replica goes through before it can answer its first request. The papers below measured those steps separately, and the phases differ in their causes and in the fixes that work on them.",
    },
    {
      type: 'terms',
      optional: false,
      items: [
        { term: 'Replica (or instance)', def: 'One complete, runnable copy of the model on one or more GPUs. Autoscaling means adding or removing replicas as traffic changes.' },
        { term: 'Checkpoint', def: 'The files that hold a trained model: the weights (billions of numbers) plus the code or metadata that says how to assemble them.' },
        { term: 'TTFT', def: 'Time to first token: how long a user waits from sending a request until the first word of the answer comes back.' },
        { term: 'PCIe', def: 'The bus between a server\'s CPU memory and its GPUs. Every byte of weights read from disk or RAM crosses it on the way into GPU memory.' },
        { term: 'RDMA and NVLink', def: 'Fast links that let GPUs send data to each other directly. RDMA works between servers over the network; NVLink connects GPUs inside one server.' },
        { term: 'CUDA context', def: 'The per-process state a program needs before it can run anything on an NVIDIA GPU. Creating one takes real time.' },
      ],
    },
    {
      type: 'p',
      text: "ServerlessLLM reports total startup times, not a per-phase split. The clearest phase breakdown is in HydraServe, a 2025 paper from Peking University and Alibaba that timed a cold start on Alibaba's public serverless inference platform: vLLM serving Llama2-7B on an NVIDIA A10 GPU.[^2] The first token came after more than 40 seconds, while each later token took about 30 ms.[^2]",
    },
    {
      type: 'chart',
      kind: 'bar',
      title: 'One cold start, timed by phase (Llama2-7B, vLLM, A10)',
      yLabel: 'Seconds',
      series: [{ label: 'Seconds', key: 's' }],
      data: [
        { label: 'Create container', values: { s: 8.52 } },
        { label: 'Load libraries', values: { s: 2.65 } },
        { label: 'CUDA context', values: { s: 1.56 } },
        { label: 'Fetch model', values: { s: 24.5 } },
        { label: 'Load to GPU', values: { s: 6.87 } },
        { label: 'First inference', values: { s: 0.6 } },
      ],
      caption: 'Redrawn from Figure 1 of Lou et al., 2025 (HydraServe).[^2] The stages run one after another, so they add up to about 44.7 seconds. Measured on the authors\' production platform.',
    },
    {
      type: 'p',
      text: "I have grouped those six bars into three phases below: getting the bytes to the machine, getting them into GPU memory, and everything else a process does before it can serve. Fetching alone is more than half the total.",
    },
    {
      type: 'h2',
      text: 'Phase one: where the bytes come from',
    },
    {
      type: 'p',
      text: "Model fetching dominated HydraServe's cold start because of limited network bandwidth and contention between containers sharing a server.[^2] The authors argue that low bandwidth is a deliberate economic choice, not bad luck. Serverless customers care about price per GPU, so providers pick servers with little CPU, memory and network per GPU. Among AWS instances with an L40S GPU, a single-GPU instance with extra resources costs 20% to 300% more than the cheapest one, g6e.xlarge, whose network is rated \"up to 20 Gbps\".[^2] Buying more network would mostly be wasted, since the extra bandwidth only gets used during cold starts.[^2]",
    },
    {
      type: 'p',
      text: "Size makes it worse. ServerlessLLM lists checkpoints of over 600 GB for Grok-1, 250 GB for DBRX and about 280 GB for Mixtral-8x22B, and works out that downloading a 130 GB checkpoint such as LLaMA-2-70B from S3 or blob storage takes at least 26 seconds even on a fast 5 GB/s network.[^1] It also cites a report that model downloads can exceed 20 seconds through an optimized pipeline from local storage servers with 100 Gbps network cards.[^1]",
    },
    {
      type: 'p',
      text: "Local disks are not much faster. BlitzScale, an OSDI 2025 paper from Shanghai Jiao Tong University and Huawei Cloud, surveyed GPU vendors and found 2 to 10 Gbps of SSD bandwidth per GPU. At 10 Gbps, loading Llama3-8B onto a GPU takes 12.8 seconds.[^3] Caching the weights in the server's CPU memory would be fast, since host-to-GPU PCIe runs at about 256 Gbps, but caches miss. ServerlessLLM reports hit rates of 40 to 75%, and BlitzScale measured miss rates of 20 to 46% when it ran ServerlessLLM on the BurstGPT trace with a 5 minute keep-alive.[^3] A platform hosts many models, and no single server's RAM can hold all of them.[^3]",
    },
    {
      type: 'h2',
      text: 'Phase two: getting the bytes onto the GPU',
    },
    {
      type: 'p',
      text: "Even with the checkpoint already on a local NVMe SSD, loading it is more than a copy. The framework has to initialize the model, allocate GPU memory, create each tensor and then copy its data, and ServerlessLLM says this usually takes tens of seconds.[^1] With PyTorch, loading OPT-30B onto 4 GPUs took 34 seconds and LLaMA-2-70B onto 8 GPUs took 84 seconds, far longer than the under-100 ms it takes to generate a token.[^1]",
    },
    {
      type: 'chart',
      kind: 'bar',
      title: 'Loading a checkpoint from local SSD into GPU memory',
      yLabel: 'Mean latency (s)',
      series: [
        { label: 'PyTorch', key: 'pt', baseline: true },
        { label: 'Safetensors', key: 'st' },
        { label: 'ServerlessLLM', key: 'sl' },
      ],
      data: [
        { label: 'OPT-6.7B', values: { pt: 7.4, st: 4.0, sl: 1.0 } },
        { label: 'OPT-30B', values: { pt: 34.0, st: 18.5, sl: 4.5 } },
        { label: 'OPT-66B', values: { pt: 80.0, st: 45.0, sl: 10.0 } },
        { label: 'LLaMA-2-70B', values: { pt: 84.0, st: 48.0, sl: 10.3 } },
        { label: 'Falcon-40B', values: { pt: 50.0, st: 25.0, sl: 6.2 } },
      ],
      caption: 'Redrawn from Figure 6a of Fu et al., 2024 (a subset of its ten models).[^1] FP16 checkpoints on a RAID 0 NVMe array rated at 12 GB/s, with the page cache cleared before each read so every load is cold.',
    },
    {
      type: 'p',
      text: "The two baseline loaders are slow in different ways. PyTorch copies data into host memory first and then into GPU memory, which makes it about twice as slow as Safetensors.[^1] Safetensors reads through memory-mapped files and takes a page fault each time it touches a part of the file that is not yet in RAM: 112,000 of them for LLaMA-2-7B on a cold start.[^1] In HydraServe's production run, the 6.87 second load bar also covers building vLLM's CUDA graph and KV cache. HydraServe notes that earlier work removed most of that initialization cost, which leaves roughly 2 seconds of actual weight transfer to the GPU in their setup.[^2]",
    },
    {
      type: 'h2',
      text: 'Phase three: warming up the runtime',
    },
    {
      type: 'p',
      text: "The remaining time goes to setup that has nothing to do with the weights. In HydraServe's measurement, creating the container took 8.52 seconds, largely because the LLM serving image was 8.31 GB. Starting Python and importing PyTorch and vLLM took 2.65 seconds, and initializing the CUDA context took 1.56.[^2] That adds up to about 12.7 seconds before a single weight moves. Public clouds cannot prepare these runtimes ahead of time for every customer, because each one ships its own image with its own library versions.[^2]",
    },
    {
      type: 'p',
      text: "BlitzScale calls this part the control plane and the weight loading the data plane. It says creating a CUDA context with its kernels loaded takes about 500 ms.[^3] BlitzScale's Figure 23 compares the two. As I read it, vLLM's startup (Python library loading, context creation, then loading from SSD) runs to about 13.8 seconds, and BlitzScale's finishes near the 1.4 second mark. The authors say that with the right optimizations the control plane overhead becomes negligible.[^3]",
    },
    {
      type: 'h2',
      text: 'Why a slow scale-up turns a burst into a latency spike',
    },
    {
      type: 'p',
      text: "BlitzScale gives the mechanism in one sentence: queued requests are not served until the new instances are ready.[^3] Bursts in real traffic are sudden. In the BurstGPT trace, requests to a single model rose 5 times within 2 seconds, with no trend that could have predicted it.[^3] A simple queueing model shows how the delay \\(D\\) turns into waiting time. This model is standard fluid-queue arithmetic, not something the papers state.",
    },
    {
      type: 'eq',
      tex: '\\begin{gathered} Q(D) = (\\lambda - n\\mu)\\,D \\\\[4pt] W \\approx \\frac{Q(D)}{(n+1)\\,\\mu} \\\\[4pt] T_{\\text{drain}} = \\frac{Q(D)}{(n+1)\\,\\mu - \\lambda} \\end{gathered}',
      caption: 'A deterministic fluid queue during one scale-up. Standard queueing reasoning, not taken from the papers.',
    },
    {
      type: 'p',
      text: "Term by term: \\(\\lambda\\) is the arrival rate during the burst, in requests per second. \\(n\\) is the number of replicas already serving, and \\(\\mu\\) is how many requests per second one replica can finish, so \\(n\\mu\\) is the current capacity. \\(D\\) is the cold-start time of the replica you just asked for. While \\(\\lambda > n\\mu\\), the backlog \\(Q\\) grows by \\(\\lambda - n\\mu\\) requests every second, so after \\(D\\) seconds it holds \\(Q(D)\\) requests. A request that arrives just as the new replica comes up waits behind that whole backlog, which \\(n+1\\) replicas clear at \\((n+1)\\mu\\) per second. That wait is \\(W\\). The backlog only shrinks if \\((n+1)\\mu > \\lambda\\), and \\(T_{\\text{drain}}\\) is how long it takes to empty.",
    },
    {
      type: 'p',
      text: "Illustrative numbers, which I picked for the arithmetic: two replicas at 1 request per second each, and a burst at 2.5 requests per second. With HydraServe's measured 44.7 second cold start, about 22 requests pile up, the unlucky request waits about 7.5 seconds, and the queue takes another 45 seconds to drain. With a 5.6 second cold start, about what HydraServe reached for Llama2-7B on its A10 testbed, the backlog is 2.8 requests, the wait is under a second, and it drains in 5.6 seconds. Both \\(W\\) and \\(T_{\\text{drain}}\\) grow in direct proportion to \\(D\\). That proportionality is why these papers attack the cold start instead of tuning the autoscaler's trigger.",
    },
    {
      type: 'p',
      text: "BlitzScale puts a hard number on the target. Using a simulator built on the DistServe serving system, with a 1,250 ms first-token SLO for Qwen2.5-72B on BurstGPT, it finds that the scale time must stay below 500 ms, which works out to 576 Gbps of parameter bandwidth per GPU.[^3] That is far beyond the 2 to 10 Gbps a GPU server's SSDs provide.[^3]",
    },
    {
      type: 'h2',
      text: 'Shrinking phase one: skip the download, or fetch from a neighbour',
    },
    {
      type: 'p',
      text: "ServerlessLLM avoids the remote download by keeping checkpoints on each GPU server's own DRAM and SSDs, which it notes are large and mostly idle in serverless clusters.[^1] Its scheduler estimates startup time on each server as \\(q + n/b\\): time waiting in that server's loading queue, plus model size divided by the bandwidth of the slowest tier involved. It then starts the model on the server with the lowest estimate.[^1] When the server holding the checkpoint is busy with another model, ServerlessLLM live-migrates that other model's running request to a different GPU. It sends only the tokens (tens to hundreds of KB) instead of the KV cache (one to tens of GB), and the destination recomputes the cache from them.[^1] In the cluster test with OPT-6.7B on GSM8K, ServerlessLLM started models in 0.8 seconds on average against 12.1 for Ray Serve and 8.2 for Ray Serve with a cache.[^1]",
    },
    {
      type: 'p',
      text: "BlitzScale takes the weights from the network between GPUs instead. It measured that this compute network, 100 to 400 Gbps of RDMA or much faster NVLink, runs at speeds close to host PCIe and is mostly idle: even under peak load with DistServe, more than 40% of its capacity was free.[^3] If the model is already running somewhere, BlitzScale multicasts its parameters from those GPUs along chains of servers. If not, one cached copy in any host's memory is enough to broadcast from, which is what \"O(1) host caching\" in its title means.[^3] Over NVLink it can broadcast Llama3-8B to 8 GPUs within 120 ms.[^3]",
    },
    {
      type: 'p',
      text: "HydraServe works under the opposite condition: cheap servers with slow networks. Because each server's link is narrow, it spreads a cold-start model's layers across up to four servers, so each fetches only part of the weights and the combined bandwidth is larger. This is pipeline parallelism.[^2] It also starts fetching on the host before the container is even created.[^2] In its tests, HydraServe cut cold-start latency by 2.1 to 4.7 times compared with serverless vLLM and 1.7 to 3.1 times compared with ServerlessLLM.[^2] Keep the setup in mind: the testbeds had 16 Gbps per server and no fast SSDs, and HydraServe left out peer-fetching systems because, among other reasons, fetching from peers gave no benefit in their environment.[^2]",
    },
    {
      type: 'h2',
      text: 'Shrinking phase two: a checkpoint format built for reading',
    },
    {
      type: 'p',
      text: "ServerlessLLM starts from the observation that training frameworks write checkpoints often and read them rarely, while a serving platform writes them once and loads them many times.[^1] So it converts each checkpoint into a loading-optimized format. Each GPU's tensors are stored together as raw bytes in large partitions that can be read in order, and a separate index maps each tensor name to a GPU, an offset and a size, so a tensor's GPU address is just a base address plus an offset.[^1] The loader reads with direct I/O into pinned memory, a RAM region the GPU can copy from directly, uses several threads per storage tier, and pipelines the tiers so disk reads, RAM staging and GPU copies all overlap.[^1]",
    },
    {
      type: 'p',
      text: "The paper's ablation shows where the speed comes from. Starting from reading one tensor at a time, bulk reads gave 1.2 times more throughput (a third of the tensors are under 1 MB), direct I/O 2.1 times, multiple threads 2.3 times, pinned memory 1.4 times and pipelining a final 1.5 times.[^1] Altogether that means 3.6 to 8.2 times faster loading than PyTorch and Safetensors across the models tested.[^1] These results come from a single test machine with a 12 GB/s NVMe array, and the authors found 4 CPU cores were enough to use its full bandwidth.[^1] The format also changes phase one indirectly: once local loading is this fast, a cache hit on the local SSD is worth much more than it was.",
    },
    {
      type: 'h2',
      text: 'Shrinking phase three: overlap the stages and let a half-loaded replica serve',
    },
    {
      type: 'p',
      text: "HydraServe hides the setup phase behind the fetch instead of shrinking it. It creates the CUDA context first. Then a separate parameter manager loads weights onto the GPU while Python is still importing libraries, since one job is GPU-bound and the other CPU-bound. Fetching and loading are also pipelined tensor by tensor.[^2] It also skips vLLM's profiling forward pass by calculating free memory directly.[^2] Each step helped in the paper's breakdown:",
    },
    {
      type: 'chart',
      kind: 'bar',
      title: 'HydraServe, one technique at a time (Llama2-13B on V100)',
      yLabel: 'TTFT (s)',
      series: [{ label: 'TTFT', key: 't' }],
      data: [
        { label: 'vLLM', values: { t: 38.6 } },
        { label: '+Prefetch', values: { t: 30.3 } },
        { label: '+Stream', values: { t: 22.9 } },
        { label: '+Overlap', values: { t: 17.4 } },
        { label: '+Parallel', values: { t: 8.7 } },
      ],
      caption: 'Redrawn from Figure 8a of Lou et al., 2025.[^2] Each bar adds one technique to the one before. On A10, Llama2-7B went from 16.6 to 5.6 seconds under the same sequence.',
    },
    {
      type: 'p',
      text: "BlitzScale goes further and removes what it calls stop-the-world scaling, where a new instance can do nothing until every parameter has arrived.[^3] It schedules work layer by layer. Once the new instance has loaded some layers, the overloaded instance sends requests to it for those layers and takes the activations back for the rest. In the paper's example with a 7-layer model, combined throughput reaches double after only half the layers are loaded.[^3] λScale, published around the same time, builds on the same idea, which it calls execute-while-load, and reports up to 5 times better tail latency and 31.3% lower cost than state-of-the-art baselines on real traces.[^5] On real traces BlitzScale cut time to first token by 47 to 75% compared with ServerlessLLM.[^3]",
    },
    {
      type: 'p',
      text: "Once a new replica is up, it still has to get work. Llumnix, from Alibaba, fills a freshly launched instance by migrating running requests to it, and moves the KV cache while decoding continues, so the pause is 20 to 30 ms whatever the sequence length. Recomputing an 8k-token sequence on LLaMA-30B instead would stall the request for 3.5 seconds.[^4] In its tests this made instances fill or drain faster and saved up to 16% in cost.[^4]",
    },
    {
      type: 'h2',
      text: 'What the fast paths still depend on',
    },
    {
      type: 'p',
      text: "Every technique above makes a replica arrive sooner. None of them adds GPUs. ServerlessLLM's own results show where that ends: with OPT-30B on the longer ShareGPT prompts, all GPUs were busy and migration could not free any, and average latency rose to 89.9 seconds.[^1] HydraServe's SLO attainment also falls as request rates rise, for lack of resources during bursts.[^2]",
    },
    {
      type: 'p',
      text: "The papers also leave the autoscaler's timing to others. BlitzScale's authors write that scaling policies, the rules for when and how much to scale, affect efficiency too, depend heavily on the workload, and are left for future work.[^3] Making \\(D\\) small shrinks the spike in the equation above, but the equation also contains the moment the autoscaler decides to act, and none of these systems claims to have solved that.",
    },
    {
      type: 'sources',
      numbered: true,
      items: [
        { title: 'Fu et al., ServerlessLLM: Low-Latency Serverless Inference for Large Language Models, OSDI 2024', url: 'https://arxiv.org/abs/2401.14351' },
        { title: 'Lou et al., HydraServe: Minimizing Cold Start Latency for Serverless LLM Serving in Public Clouds, 2025', url: 'https://arxiv.org/abs/2502.15524' },
        { title: 'Zhang et al., BlitzScale: Fast and Live Large Model Autoscaling with O(1) Host Caching, OSDI 2025', url: 'https://arxiv.org/abs/2412.17246' },
        { title: 'Sun et al., Llumnix: Dynamic Scheduling for Large Language Model Serving, OSDI 2024', url: 'https://arxiv.org/abs/2406.03243' },
        { title: 'Yu et al., λScale: Enabling Fast Scaling for Serverless Large Language Model Inference, 2025', url: 'https://arxiv.org/abs/2502.09922' },
      ],
    },
  ],
};
