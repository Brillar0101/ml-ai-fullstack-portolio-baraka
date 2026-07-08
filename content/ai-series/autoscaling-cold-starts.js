export const POST = {
  id: 'autoscaling-cold-starts',
  title: 'Why Your GPU Endpoint Times Out Right When Traffic Arrives: Autoscaling and Cold Starts',
  excerpt: 'Scaling a web app is easy. Scaling a model that lives in VRAM is not, because a new node takes minutes to warm up and the spike is already gone by then. Here is how cold starts wreck autoscaling, told through an endpoint that scaled on the wrong signal.',
  category: 'AI',
  tags: ['Deployment', 'Autoscaling', 'GPU'],
  readTime: '8 min read',
  body: [
    {
      type: 'p',
      text: 'A team put their first large language model behind an HTTP endpoint and wired it to the same autoscaler that ran their web tier. The rule was the one everybody copies: watch CPU, add a replica when average CPU crosses seventy percent, remove one when it drops. It looked fine in staging. Then a product launch sent a burst of real traffic, and the endpoint started returning timeouts. The dashboard showed the autoscaler doing its job, asking for more replicas, yet requests kept failing for a solid four or five minutes into every spike. By the time the new GPU nodes were actually answering, the burst had passed and the autoscaler was already scaling back down. The service was always late, and it was always late by the same few minutes.'
    },
    {
      type: 'p',
      text: 'That delay has a name, and it is the whole reason serving a model is harder than serving a web app. It is the cold start. Understanding why it is so long, and why CPU was the wrong thing to watch, is what separates an endpoint that survives a spike from one that folds every time attention arrives.'
    },
    {
      type: 'h2',
      text: 'A web replica starts in seconds, a model replica starts in minutes'
    },
    {
      type: 'p',
      text: 'Start with the intuition, because the gap is bigger than most people guess. When your web autoscaler adds a replica, the new container pulls a small image, starts a process, and is ready to take traffic almost immediately. The whole thing might take a few seconds. Autoscaling works well there precisely because the reaction is fast enough to catch a rising curve while it is still rising. You see load climbing, you add capacity, the capacity shows up before the load peaks. The feedback loop is tight.'
    },
    {
      type: 'p',
      text: 'A model replica breaks that assumption in several places at once. To bring one online you first have to get a GPU node, and GPU nodes are scarcer and slower to provision than ordinary compute, so you may wait just for the hardware. Then the container has to fetch the model weights, and for a modern model that is many gigabytes moving across the network onto the box. Then those weights have to be loaded off disk and into the GPU memory, the VRAM, which is its own slow copy. And even after all that, the first few requests run slower than normal while caches fill and the runtime settles, a period usually called warmup. Add those up and you are looking at minutes, not seconds. The autoscaler is still reacting at web speed, but the thing it is trying to summon moves at a completely different pace.'
    },
    {
      type: 'h2',
      text: 'Walking the timeout, second by second'
    },
    {
      type: 'p',
      text: 'Replay the incident slowly and the failure becomes obvious. Traffic starts climbing at, say, ten in the morning. For the first stretch the two running replicas keep up, so CPU on the boxes barely moves, because generating tokens is work the GPU does, not the CPU. That is the first trap. The signal the autoscaler watched stayed calm while the thing that actually mattered, the number of requests waiting for a free GPU, was already piling up. The autoscaler saw no reason to act yet.'
    },
    {
      type: 'p',
      text: 'A bit later enough requests stack up that some CPU-side work finally nudges the average over the threshold, and the autoscaler asks for a third replica. Now the clock starts on the cold start. The scheduler finds a GPU node, the node pulls several gigabytes of weights, the weights load into VRAM, the runtime warms up. Four minutes pass. During those four minutes the two original replicas are drowning, queues overflow, and clients that set a thirty second timeout give up and see errors. When the third replica finally reports ready, the burst is fading. Load drops, CPU drops, and the autoscaler, seeing calm, removes the replica it just paid minutes to create. The next spike repeats the entire story from scratch.'
    },
    {
      type: 'p',
      text: 'Two separate mistakes stacked here. The scaler was watching a signal that does not reflect model load, and it had nothing warm and ready to absorb the gap while a real replica booted. Fix either one and the pain drops. Fix both and the spike stops being an incident.'
    },
    {
      type: 'terms',
      items: [
        { term: 'Cold start', def: 'The delay between deciding to add a model replica and that replica actually answering requests. It covers getting a GPU node, downloading the weights, loading them into VRAM, and warming up. For large models this is measured in minutes.' },
        { term: 'Warm pool / min replicas', def: 'Capacity you keep running and loaded even when idle, so there is always a ready replica to take traffic while a cold one boots. Setting a minimum replica count is the simplest form: never scale below N loaded instances.' },
        { term: 'Scale-to-zero', def: 'Letting the service drop to zero running replicas when there is no traffic, so you pay nothing while idle. It trades cost for latency, because the next request has to eat a full cold start.' },
        { term: 'Queue-depth autoscaling', def: 'Scaling on the number of requests waiting to be served, or a latency signal like time-to-first-token, instead of on CPU. It reflects real model load and reacts before users feel the backlog.' }
      ]
    },
    {
      type: 'h2',
      text: 'Scale on the queue, keep a floor warm'
    },
    {
      type: 'p',
      text: 'The right picture puts a queue in the middle and points the scaler at that queue. Requests arrive at a load balancer and land in a queue in front of the GPU replicas. Each replica pulls work as it frees up. A separate scaler watches how deep the queue is getting, or how long requests are waiting for their first token, and adds replicas when that number climbs. Underneath it all sits a warm pool, a floor of replicas that stay loaded no matter how quiet things get, so the very first request of a spike hits a ready model instead of a cold one.'
    },
    {
      type: 'diagram',
      title: 'Request and scaling flow for a model endpoint',
      nodes: [
        { id: 'lb', label: 'Load balancer', icon: 'service', at: [0, 0] },
        { id: 'queue', label: 'Request queue', icon: 'datastore', at: [1, 0] },
        { id: 'warm', label: 'Warm replicas (min = 2)', icon: 'model', at: [2, 0] },
        { id: 'cold', label: 'Cold replica booting', icon: 'model', at: [2, 1] },
        { id: 'scaler', label: 'Scaler watching queue depth', icon: 'service', at: [1, 1] }
      ],
      edges: [
        { from: 'lb', to: 'queue', label: 'enqueue request' },
        { from: 'queue', to: 'warm', label: 'pull when free' },
        { from: 'scaler', to: 'queue', label: 'read depth' },
        { from: 'scaler', to: 'cold', label: 'add replica on backlog' }
      ],
      caption: 'The scaler reads the depth of the request queue, not CPU. A warm floor of replicas absorbs the spike immediately while a cold replica boots in the background to catch up.'
    },
    {
      type: 'p',
      text: 'The queue is what makes this honest. Depth is a direct readout of demand versus capacity: if requests are waiting, you are short on replicas right now, whether or not any CPU is busy. And because the warm floor is always ready, the minutes a cold replica needs to boot are spent while paying customers are still being served by the warm ones. The cold node is catching up, not standing between the user and an answer. Here is the scaling rule written out, small enough to read in one pass.'
    },
    {
      type: 'code',
      lang: 'python',
      title: 'Queue-depth scaling with a warm floor',
      code: `MIN_REPLICAS = 2      # warm pool: never drop below this
MAX_REPLICAS = 12
TARGET_PER_REPLICA = 4  # desired queued requests per replica

def desired_replicas(queue_depth, current):
    # How many replicas would keep the backlog at target?
    needed = -(-queue_depth // TARGET_PER_REPLICA)  # ceil division

    # Never go below the warm floor or above the ceiling.
    needed = max(needed, MIN_REPLICAS)
    needed = min(needed, MAX_REPLICAS)

    # Scale up fast, scale down slow, so one quiet moment
    # does not throw away a replica we paid minutes to boot.
    if needed > current:
        return needed
    if needed < current:
        return current - 1   # shed one at a time
    return current`
    },
    {
      type: 'p',
      text: 'Read the rule and the two lessons from the incident are baked in. The scaler acts on `queue_depth`, so it reacts to real model backlog instead of idle CPU. The `MIN_REPLICAS` floor is the warm pool, guaranteeing there is always a loaded replica to take the first hit. And the up-fast, down-slow asymmetry matters more than it looks: since a cold start is so expensive, you want to grab capacity quickly and give it back reluctantly, so a brief lull does not delete a replica you will need again in thirty seconds.'
    },
    {
      type: 'h2',
      text: 'Warm capacity costs money, so decide when zero is worth it'
    },
    {
      type: 'p',
      text: 'A warm floor is not free, and pretending otherwise is how the next mistake sneaks in. An idle GPU still costs the same per hour as a busy one, so a warm pool of two replicas means paying for two GPUs around the clock even at three in the morning when nobody is calling. For a service with steady daytime traffic that is money well spent, because the alternative is timeouts during every busy hour. But for an internal tool that gets a handful of requests a day, keeping GPUs warm all night to serve almost nothing is waste.'
    },
    {
      type: 'p',
      text: 'That is where scale-to-zero earns its place. If your traffic is spiky and low, you let the service drop to zero replicas when idle and pay nothing, accepting that the first request after a quiet stretch will wait through a full cold start. A user who fires an occasional query can tolerate a slow first response. A checkout flow serving thousands of people cannot. So the choice is really a question about who is waiting and what they will forgive. Steady or latency-sensitive traffic wants a warm floor. Rare, patient, cost-sensitive traffic can live with scale-to-zero. Many teams split the difference by keeping a warm floor during business hours and allowing zero overnight.'
    },
    {
      type: 'p',
      text: 'The other lever is the cold start itself. It is not a fixed cost of nature, and shrinking it makes every other decision easier. Caching the model weights on the node, or on fast local storage near it, removes the multi-gigabyte download from the critical path so a new replica loads from disk instead of across the network. Faster weight-loading formats and streaming loaders cut the copy into VRAM. Some platforms go further and snapshot a fully warmed process, memory and all, so a new replica restores from that snapshot in seconds rather than booting from cold. Every second you shave off the cold start is a second the warm pool does not have to cover, which means you can run a thinner floor or lean harder on scale-to-zero without punishing users.'
    },
    {
      type: 'h2',
      text: 'The mistakes that put teams in this hole'
    },
    {
      type: 'p',
      text: 'The headline mistake is the one from the story: scaling a GPU service on CPU. CPU is close to invisible for a model that does its heavy lifting on the accelerator, so the signal stays quiet exactly when you most need it to shout. Scale on queue depth or a latency measure like time-to-first-token instead. A few more traps tend to travel with that one.'
    },
    {
      type: 'ul',
      items: [
        'Assuming a new replica is ready the instant the scheduler places it. It is not ready until the weights are in VRAM and warmed up. Gate traffic on an actual readiness check that loads the model, not on the container merely starting.',
        'Running a warm floor of zero on a latency-sensitive endpoint. With nothing warm, the first user of every spike pays the full cold start. Keep at least one or two replicas loaded when response time matters.',
        'Scaling down as aggressively as you scale up. Shedding a replica the moment load dips means re-paying a multi-minute cold start when the next wave hits seconds later. Scale up fast and down slowly.',
        'Downloading weights over the network on every cold boot. Cache them on the node or on fast local storage so a new replica loads from disk, not from a remote bucket, and the cold start shrinks a lot.'
      ]
    },
    {
      type: 'callout',
      title: 'The number that decides everything',
      text: 'Measure your real cold start first: how many seconds from scale-up decision to a replica answering. That single number sets your whole strategy. A short cold start lets you lean on scale-to-zero and a thin floor. A long one forces a warm pool and up-fast, down-slow scaling. You cannot tune what you have not timed.'
    },
    {
      type: 'h2',
      text: 'What to carry away'
    },
    {
      type: 'p',
      text: 'A model endpoint fails during spikes for a reason that is almost mechanical once you see it. The autoscaler reacts in seconds, but a fresh GPU replica needs minutes to provision a node, pull gigabytes of weights, load them into VRAM, and warm up, so any capacity you request arrives after the moment that needed it. You fix this on two fronts. Point the scaler at a signal that reflects real model load, the depth of the request queue or the time to first token, so it moves before users feel the backlog. And keep a warm floor of loaded replicas so the minutes a cold one takes to boot are spent in the background instead of in front of a waiting customer. Then decide honestly whether idle GPUs are worth their cost: steady or latency-sensitive traffic wants that warm floor, while rare and patient traffic can scale to zero and eat the cold start. And whatever you choose, shrink the cold start with weight caching, faster loading, and snapshots, because a shorter cold start makes every other decision cheaper. The team from the story stopped watching CPU, put two replicas on a warm floor, and scaled on queue depth. The next launch did not time out.'
    },
    {
      type: 'sources',
      items: [
        { title: 'KServe: Autoscaling for model inference', url: 'https://kserve.github.io/website/latest/modelserving/autoscaling/autoscaling/' },
        { title: 'Modal: Cold starts and container lifecycle', url: 'https://modal.com/docs/guide/cold-start' },
        { title: 'Kwon et al., 2023, Efficient Memory Management for LLM Serving with PagedAttention (vLLM)', url: 'https://arxiv.org/abs/2309.06180' }
      ]
    }
  ]
};
