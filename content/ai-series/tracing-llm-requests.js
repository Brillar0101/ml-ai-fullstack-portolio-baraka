// Every factual claim below is taken from the numbered sources at the end.
// The sampling chart is redrawn from Table 2 of the Dapper technical report,
// which carries no open license. The span tree is an illustrative example
// built from the papers' data models, not a recorded production trace.
export const POST = {
  id: 'tracing-llm-requests',
  title: 'Anatomy of One Traced LLM Request, Using Google\'s Dapper as the Guide',
  excerpt: 'Google built Dapper because one search query touched thousands of machines and nobody could say which one was slow. An agent request has the same shape on a smaller scale. This post dissects one span tree, field by field, and then asks whether Dapper\'s sampling rules still hold when every span is a model call.',
  category: 'AI',
  tags: ['Observability', 'Tracing', 'Agents'],
  body: [
    {
      type: 'p',
      text: "In 2010 a team at Google described a problem they had with web search. One query from a user went from a front-end service to many hundreds of query servers, each holding one piece of the index, and also out to systems for ads, spelling, images, video and news. Thousands of machines and many services could work on a single query.[^1] Users noticed delays, and a delay could come from any of those subsystems. The paper puts it plainly: an engineer looking only at the overall latency \"may know there is a problem, but may not be able to guess which service is at fault, nor why it is behaving poorly.\"[^1]",
    },
    {
      type: 'p',
      text: "Their answer was Dapper, Google's production tracing system, which had run for more than two years by the time of the report.[^1] Later in the paper they admit that even \"our best and most experienced engineers routinely guess wrong about the root cause of poor end-to-end performance\" when a system spans dozens of teams.[^1] One team that used Dapper while rebuilding an ads review service estimated its latency numbers improved by two orders of magnitude.[^1]",
    },
    {
      type: 'p',
      text: "An LLM agent request is a small version of that search query. It retrieves documents, calls a model, maybe calls a tool, and calls the model again. A 2024 survey of agent observability tools calls agents \"compound AI systems\" and says their pipelines may reach out to external tools, knowledge bases and other agents.[^3] When the answer comes back slow or wrong, the final text says nothing about which step caused it. This post takes one such request apart using Dapper's vocabulary, then looks at what the newer agent papers add to it.",
    },
    {
      type: 'h2',
      text: "Dapper's three nouns: tree, span, annotation",
    },
    {
      type: 'p',
      text: "Dapper models every trace with three things: trees, spans and annotations.[^1] The terms below use the paper's definitions, since most tracing tools today still use the same words.",
    },
    {
      type: 'terms',
      optional: false,
      items: [
        { term: 'Trace', def: 'All the work done for one initiating request, such as one user query. In Dapper it is a tree, and every span in it shares one trace id.' },
        { term: 'Span', def: 'A node in the tree: one basic unit of work. It is a log of timestamped records with a start time, an end time, timing data for the call, and any annotations.' },
        { term: 'Parent id', def: 'The id of the span that caused this one. Parent links turn a pile of spans into a tree. A span with no parent is the root span.' },
        { term: 'Annotation', def: 'Extra data a developer attaches to a span. Dapper supports timestamped text and key-value pairs. OpenTelemetry later called the key-value kind attributes.' },
        { term: 'Sampling', def: 'Recording only some traces instead of all of them, to keep the cost of tracing low.' },
      ],
    },
    {
      type: 'p',
      text: "The span, trace and parent ids in Dapper are probabilistically unique 64-bit integers.[^1] Developers do not pass them around by hand. When a thread handles traced work, Dapper puts a small trace context holding those ids in thread-local storage. Callbacks carry the context of the code that created them, and Google's RPC framework sends the ids from client to server.[^1] With those three hooks, most of Google's largest workloads could be traced without any changes to application code.[^1]",
    },
    {
      type: 'p',
      text: "Dapper names X-Trace as one of its closest relatives.[^1] X-Trace, from Berkeley in 2007, put a task identifier into the metadata of a request and copied it along every call that request caused. One operation, pushDown(), copied it into the layer below, for example from HTTP into TCP. The other, pushNext(), copied it to the next hop in the same layer.[^2] X-Trace called the result a task tree. Dapper's span tree is the same idea kept at the level of RPCs, because Google wanted as little instrumentation as possible.[^1]",
    },
    {
      type: 'h2',
      text: 'One agent request drawn as a span tree',
    },
    {
      type: 'p',
      text: "Here is the specimen. It is an illustrative example, not a recorded production trace: a support agent gets the question \"why was I charged twice?\", searches a help-article index, asks a model, runs a billing lookup tool that the model requested, and then asks the model again with the tool's result. The span types come from the AgentOps taxonomy, which lists retrieval, LLM calls and tool calls among the spans agent tracing tools record.[^3] The operation names come from the OpenTelemetry generative AI conventions.[^5]",
    },
    {
      type: 'diagram',
      title: 'Span tree for one agent request',
      nodes: [
        { id: 'root', label: 'invoke_agent (root span)', icon: 'service', at: [1.5, 0] },
        { id: 'ret', label: 'retrieval help-articles', icon: 'datastore', at: [0, 1] },
        { id: 'chat1', label: 'chat (asks for tool)', icon: 'model', at: [1, 1] },
        { id: 'tool', label: 'execute_tool billing_lookup', icon: 'service', at: [2, 1] },
        { id: 'chat2', label: 'chat (final answer)', icon: 'model', at: [3, 1] },
      ],
      edges: [
        { from: 'root', to: 'ret', label: 'parent' },
        { from: 'root', to: 'chat1' },
        { from: 'root', to: 'tool' },
        { from: 'root', to: 'chat2', label: 'parent' },
      ],
      caption: 'Illustrative example. All five spans share one trace id. Each child stores the root span\'s id as its parent id, which is how a viewer rebuilds the tree. Children appear left to right in time order.',
    },
    {
      type: 'p',
      text: "Two things about the shape matter. First, the tree records who caused what, while the timestamps record when. Dapper's Figure 2 shows both, and the paper calls them the causal and temporal relationships between spans.[^1] Second, the tool span is a child of the root here, not of the first chat span. The model did not run the tool. It returned text asking for the tool, and the agent's own code ran it. The tree should match what really happened.",
    },
    {
      type: 'h2',
      text: 'Walking the fields of each span',
    },
    {
      type: 'p',
      text: "**The root span.** It has no parent id. It holds the trace id every other span will copy. In Dapper, creating and destroying a root span took 204 nanoseconds on average, against 176 for other spans. The extra time goes to generating a globally unique trace id.[^1] Its start and end times cover the whole request, so its duration is the number a user feels. The OpenTelemetry conventions list invoke_agent as a well-known operation name for this kind of span.[^5]",
    },
    {
      type: 'p',
      text: "**The retrieval span.** OpenTelemetry says this span should be named retrieval followed by the data source id, and should have the CLIENT kind, meaning it records an outgoing call.[^5] Recommended attributes include gen_ai.retrieval.top_k, the most documents the retriever was asked to return. The query text and the documents themselves are Opt-In attributes. They are not recorded unless someone turns them on.[^5] Dapper made a similar choice. It stored RPC method names but no payload data, because payloads might hold information that should not be shown even to engineers debugging performance. Developers could still attach data as annotations if they chose to.[^1]",
    },
    {
      type: 'p',
      text: "**The first chat span.** The name should be the operation name plus the requested model, for example \"chat\" followed by the model name.[^5] This is the span with the fields that Dapper never had. gen_ai.usage.input_tokens counts the prompt, and the spec says it should include cached tokens. gen_ai.usage.output_tokens counts the completion. gen_ai.response.finish_reasons records why generation stopped, with values such as stop or length.[^5] The full prompt and reply live in gen_ai.input.messages and gen_ai.output.messages, and those are Opt-In as well.[^5] AgentOps lists the same kinds of data for its LLM span: model name, model version, and parameters such as temperature and max tokens, along with token metrics that track cost.[^3]",
    },
    {
      type: 'p',
      text: "**The tool span.** Its name should be execute_tool plus the tool name, and its kind INTERNAL, since application code usually runs the tool itself.[^5] gen_ai.tool.call.id links it back to the specific request in the model's output. The arguments and result are Opt-In.[^5] If the call fails, error.type becomes conditionally required, and the spec gives \"timeout\" as an example value.[^5] AgentOps asks for the tool's name, version and configuration settings, including timeouts, because those settings affect how the tool behaves.[^3]",
    },
    {
      type: 'p',
      text: "**The second chat span.** It has the same fields as the first, but its input now includes the tool's result, so its input token count is higher. The total cost of the request is the sum of the token attributes over every chat span in the tree. Reading that sum off the tree is a reason to record tokens per span and not only per request. This is my reading of the conventions, not a rule stated in them.",
    },
    {
      type: 'callout',
      title: 'Why a span is more than a log line',
      text: "Dapper describes a span as a simple log of timestamped records.[^1] What separates it from an ordinary log line is the trace id and parent id. With those two fields, records written by different processes on different hosts can be joined back into one tree. Dapper even notes that a single RPC span holds annotations from both the client and the server, so two-host spans are the most common kind.[^1]",
    },
    {
      type: 'h2',
      text: "What Dapper measured about sampling and overhead",
    },
    {
      type: 'p',
      text: "Low overhead is the first design goal the paper lists, because teams running highly optimized services might otherwise turn tracing off.[^1] The paper reports costs at each layer. Adding an annotation to a span that is not sampled costs about 9 nanoseconds, just a thread-local lookup. On a sampled span, a string annotation costs about 40 nanoseconds. These numbers come from a 2.2 GHz x86 server.[^1] Under a deliberately heavy load test, the collection daemon never used more than 0.3% of one CPU core. Each stored span averaged 426 bytes, and trace collection was less than 0.01% of network traffic in Google's production environment.[^1]",
    },
    {
      type: 'p',
      text: "The cost that mattered was writing traces to local disk. To measure it, the team varied the sampling rate on a web search cluster:[^1]",
    },
    {
      type: 'chart',
      kind: 'bar',
      title: 'Average latency change on a web search cluster, by sampling rate',
      yLabel: 'Latency change (%)',
      series: [{ label: 'Avg. latency change', key: 'l' }],
      data: [
        { label: '1/1', values: { l: 16.3 } },
        { label: '1/2', values: { l: 9.4 } },
        { label: '1/4', values: { l: 6.38 } },
        { label: '1/8', values: { l: 4.12 } },
        { label: '1/16', values: { l: 2.12 } },
        { label: '1/1024', values: { l: -0.2 } },
      ],
      caption: 'Redrawn from Table 2 of Sigelman et al., 2010.[^1] Non-adaptive sampling. Throughput fell by 1.48% when every request was traced and by 0.06% at 1/1024. The stated experimental error is 2.5% for latency and 0.15% for throughput.',
    },
    {
      type: 'p',
      text: "Tracing every request added 16.3% to average latency. Below 1/16, the latency and throughput penalties were within experimental error. In practice, a rate of 1/1024 still gave high-volume services enough trace data.[^1] The authors' explanation: in a high-throughput system, \"if a notable execution pattern surfaces once in such systems, it will surface thousands of times.\"[^1] They also noted the other end of the scale. A service handling dozens of requests per second, not tens of thousands, can afford to trace every one, and that is why they moved to adaptive sampling.[^1]",
    },
    {
      type: 'p',
      text: "Adaptive sampling sets a target number of sampled traces per unit of time, not a fixed probability. Low-traffic services then sample more of their requests and high-traffic ones sample fewer, and the probability actually used is stored with each trace so analysis tools can count correctly.[^1] A second round of sampling happens during collection. Dapper hashes the trace id to a number between 0 and 1 and keeps the span only if that number is below a coefficient. Every span of a trace shares the same id, so whole traces are kept or dropped together, never partial trees.[^1] That second knob existed because production clusters were producing more than a terabyte of sampled trace data per day.[^1]",
    },
    {
      type: 'h2',
      text: 'Why those sampling numbers transfer badly to model calls',
    },
    {
      type: 'p',
      text: "This section is my application of Dapper's results, not a finding of any paper. Dapper's case for aggressive sampling rests on two conditions: overhead that shows up in latency, and traffic high enough that any pattern repeats thousands of times. An agent request can fail both.",
    },
    {
      type: 'p',
      text: "Overhead first. Dapper's worst costs were measured against a heavily optimized search service. Next to a model call that takes seconds, a few hundred nanoseconds of span bookkeeping is too small to see. The cost that matters for an LLM trace is storage. Dapper's average span was 426 bytes and held no payloads.[^1] A chat span with Opt-In message content holds the whole prompt and reply,[^5] and that can be thousands of tokens. So the pressure is on Dapper's second sampling knob, the one that controls what gets written to storage, not the first.",
    },
    {
      type: 'p',
      text: "Then repetition. The line about a pattern surfacing thousands of times assumes that the same bug gives the same trace. AgentOps points out that agents are non-deterministic and can \"produce varied outputs even when given the same inputs.\"[^3] A bad tool choice seen once may not happen again the same way. Many agent products also run at the dozens-per-second scale that Dapper said could afford full tracing.[^1] My conclusion: record every trace with its structure, token counts and errors, which are cheap, and sample the Opt-In message content. When you do drop data, drop whole traces the way Dapper's trace-id hash does, so an agent run is never missing its middle.",
    },
    {
      type: 'h2',
      text: 'What the agent observability papers add to the tree',
    },
    {
      type: 'p',
      text: "Dong, Lu and Zhu at CSIRO's Data61 surveyed 17 tools for tracing agents and LLM applications, found through GitHub and Google searches, including Langfuse, LangSmith, Arize, Datadog and TraceLoop. Every one of them implemented tracing.[^3] Their contribution is a taxonomy of what an agent trace should hold. On top of Dapper's basics (name, start time, duration, parent id), each span carries inputs and outputs, error type with message and traceback, metrics such as input and output tokens, events, and links to other spans.[^3]",
    },
    {
      type: 'p',
      text: "The bigger change is the list of span types. A Dapper span is almost always an RPC. The AgentOps taxonomy adds agent, reasoning, plan, workflow, task, tool, evaluation, guardrail and LLM spans, each with its own fields. A plan span records its goal, constraints and past plans. A guardrail span records what action was taken, such as blocking or filtering, and what it was applied to.[^3] Evaluation spans hold test cases and results, so a quality score sits in the same tree as the latency.[^3] The survey also describes tools that attach user feedback as a score to a trace or to a single LLM generation.[^3]",
    },
    {
      type: 'p',
      text: "AgentSight, from 2025, points out a blind spot in all of this. Traces built inside the application are built from the agent's cooperation, and the authors argue that \"a single shell command escapes their view.\"[^4] They propose boundary tracing: using eBPF, a Linux feature that runs small verified programs inside the kernel, to read decrypted LLM traffic at the TLS library and to watch system calls such as execve and connect.[^4] A correlation engine links the two streams using process lineage, timing within a 100 to 500 millisecond window, and matching arguments, for example a filename in the model's reply that later shows up in a system call.[^4]",
    },
    {
      type: 'p',
      text: "Their results make the case for this outside view. On three developer tasks run with Claude Code, the average overhead was 2.9%.[^4] In a prompt-injection test, a README led an agent to a page that told it to send /etc/passwd to a collection server. AgentSight captured the chain from the URL fetch to the exfiltration as 521 events, which its engine merged into 37.[^4] In another case a crewAI agent kept calling a search tool with the same wrong arguments, and the observer model identified the loop from the trace of API calls.[^4] My reading is that this goes back to the black-box versus annotation debate: Dapper chose library instrumentation over statistical inference,[^1] and AgentSight chooses instrumentation at the kernel and network boundary, which the agent cannot skip.",
    },
    {
      type: 'h2',
      text: 'Where a span tree stops explaining',
    },
    {
      type: 'p',
      text: "Dapper's authors list the limits of their own model, and one of them fits LLM calls closely. Dapper is good at finding which part of a system is slow, they write, but \"is not always sufficient for finding the root causes.\" A request can be slow \"not because of its own behavior, but because other requests were queued ahead of it.\"[^1] They also describe coalescing: when a subsystem buffers several requests and handles them as one batch, one traced request can be blamed for a misleadingly large piece of work, and if several traced requests share the batch, only one of them looks responsible.[^1] Their suggested fix was for programs to report queue sizes or overload through annotations.[^1] Applied to an agent trace (my reading, not the paper's): for a wide chat span, the tree tells you the time went to the model call. It cannot tell you whether that time was your prompt or someone else's requests queued ahead of it, unless the model server reports its queue into the span.",
    },
    {
      type: 'sources',
      numbered: true,
      items: [
        { title: 'Sigelman et al., "Dapper, a Large-Scale Distributed Systems Tracing Infrastructure," Google Technical Report dapper-2010-1, 2010', url: 'https://static.googleusercontent.com/media/research.google.com/en//archive/papers/dapper-2010-1.pdf' },
        { title: 'Fonseca, Porter, Katz, Shenker and Stoica, "X-Trace: A Pervasive Network Tracing Framework," NSDI 2007', url: 'https://www.usenix.org/legacy/event/nsdi07/tech/full_papers/fonseca/fonseca.pdf' },
        { title: 'Dong, Lu and Zhu, "AgentOps: Enabling Observability of LLM Agents," arXiv 2411.05285, 2024', url: 'https://arxiv.org/abs/2411.05285' },
        { title: 'Zheng, Hu, Yu and Quinn, "AgentSight: System-Level Observability for AI Agents Using eBPF," arXiv 2508.02736, 2025', url: 'https://arxiv.org/abs/2508.02736' },
        { title: 'OpenTelemetry, "Semantic conventions for generative client AI spans" (spec, Development status; used for attribute names only)', url: 'https://github.com/open-telemetry/semantic-conventions-genai/blob/main/docs/gen-ai/gen-ai-spans.md' },
      ],
    },
  ],
};
