export const POST = {
  id: 'tracing-llm-requests',
  title: 'Reading the Spans of One LLM Call: Tracing a Request End to End',
  excerpt: 'A RAG agent answered fine most of the time, then sometimes took nine seconds. The final text told us nothing. The trace showed one tool call timing out and being retried three times. Here is how to read that tree.',
  category: 'AI',
  tags: ['Observability', 'Tracing', 'Agents'],
  readTime: '8 min read',
  body: [
    {
      type: 'p',
      text: 'A support team shipped a RAG agent that answered product questions. Most of the time it felt quick, a second or two, and people liked it. Then the complaints started. Every so often the same kind of question took eight or nine seconds, and nobody could say why. The answer text looked normal when it finally arrived. The logs showed the request came in and a response went out, with a long quiet gap in the middle that no single log line explained. The team was staring at the last thing the system produced and trying to reason backward about everything that happened before it.'
    },
    {
      type: 'p',
      text: 'That gap in the middle is the real subject here. A single request to a modern AI feature is rarely one call. It fans out. The agent fetches documents from a retrieval service, calls a model once or maybe several times, invokes a tool or two, and then does some cleanup on the result before replying. When the answer is wrong or slow, the final output cannot tell you which of those steps went sideways. You need a record of the whole sequence, laid out as a tree, so you can see each step and how long it took. That record is called a **trace**, and learning to read one is the difference between guessing and knowing.'
    },
    {
      type: 'h2',
      text: 'Think of it like an itemized receipt for one request'
    },
    {
      type: 'p',
      text: 'Imagine you order at a restaurant and the food takes far too long. A single line on the bill that says "dinner: 40 minutes" tells you almost nothing. What you want is a breakdown. The kitchen received the ticket at this time, the appetizer went out here, the main course sat under the heat lamp for eleven minutes waiting on a side that had to be remade twice. With that breakdown you can point at the exact step that cost you, and you can tell the difference between a slow oven and a mistake that forced a redo.'
    },
    {
      type: 'p',
      text: 'A trace is that itemized breakdown for one request through your system. Instead of a flat total, you get every step with its own start time, its own duration, and a record of what went in and what came out. The steps nest inside each other the way a main course contains its sides, so you can see not only that the request was slow but which piece inside it was slow, and whether that piece had to be retried. Hold onto that picture of a receipt with nested line items, because that is exactly the shape of what we are about to build.'
    },
    {
      type: 'h2',
      text: 'Walking the RAG agent request one step at a time'
    },
    {
      type: 'p',
      text: 'Let us follow one question through the support agent. The user asks how to export their billing history. The request arrives and a clock starts. First the agent runs retrieval: it turns the question into a vector, searches the document store, and gets back the five most relevant help articles. Then it hands those articles plus the question to the model and asks for an answer. The model decides it needs a live value, the account plan tier, so it calls a tool that hits an internal billing API. When the tool returns, the model writes the final answer, and a last step trims the text and attaches source links before the reply goes back to the user.'
    },
    {
      type: 'p',
      text: 'Now picture all of that drawn as a tree. At the top sits one box that covers the entire request, from arrival to reply. Underneath it sit four child boxes lined up in time: retrieval, the model call, the tool call, and post-processing. Each box has a width that matches how long it took. On a healthy request the tool box is thin. On the slow requests the team was chasing, that tool box was enormous, and when they looked closer it was actually three boxes stacked back to back, because the billing API had timed out and the agent quietly retried it twice more before giving up on the wait. The final answer never mentioned any of that. The tree made it obvious.'
    },
    {
      type: 'diagram',
      title: 'One request, drawn as a trace tree',
      nodes: [
        { label: 'Request span', detail: 'covers the whole request, arrival to reply' },
        { label: 'Retrieval span', detail: 'embed question, search store, return 5 docs' },
        { label: 'Model span', detail: 'prompt in, tokens and response out' },
        { label: 'Tool span (x3)', detail: 'billing API call, timed out and retried twice' },
        { label: 'Post-process span', detail: 'trim text, attach source links' }
      ],
      caption: 'The child spans nest under the request span in time order. The repeated tool span is the slow step the final answer hid.'
    },
    {
      type: 'p',
      text: 'What made this readable was that each box carried its own facts. The retrieval box recorded how many documents came back and how long the search took. The model box recorded the prompt it received, the response it produced, and the token counts. The tool box recorded the arguments it was called with and, on the failed tries, the timeout error. Because every step stored its own inputs and outputs, the team did not have to reconstruct anything. They read it off the tree.'
    },
    {
      type: 'h2',
      text: 'The words for the parts you just saw'
    },
    {
      type: 'p',
      text: 'Now that you have seen the shape, here are the terms so the rest of the article and every tracing tool you touch will make sense. These four words describe almost everything you will work with.'
    },
    {
      type: 'terms',
      items: [
        { term: 'Trace', def: 'The whole tree for one request. It is the full journey from the moment the request arrives to the moment the reply leaves, made of many connected steps.' },
        { term: 'Span', def: 'One step inside the trace: a single unit of work with a start time, a duration, and a record of its inputs and outputs. The retrieval call is a span, the model call is a span, each tool call is a span.' },
        { term: 'Parent and child span', def: 'A span that contains other spans is the parent; the ones nested inside it are its children. The request span is the parent of the retrieval, model, and tool spans. This link is what turns a flat list into a tree.' },
        { term: 'Span attributes', def: 'The labeled facts stored on a span: the prompt text, the response, token counts, latency, tool arguments, the error message if it failed. Attributes are why a span can answer questions after the fact.' }
      ]
    },
    {
      type: 'h2',
      text: 'How a step becomes a span in code'
    },
    {
      type: 'p',
      text: 'A span does not appear on its own. Something in your code has to open it before a step runs and close it after, and record attributes along the way. The pattern is a wrapper around each unit of work. You start a span, tag it with what you know going in, run the step, tag it with what came out, and if the step throws you record the error before letting it close. Here is the tool call from the story wrapped that way.'
    },
    {
      type: 'code',
      lang: 'python',
      title: 'Wrapping a tool call in a span and recording attributes',
      code: `from opentelemetry import trace

tracer = trace.get_tracer("support-agent")

def call_billing_tool(account_id, timeout_s):
    with tracer.start_as_current_span("tool.billing_lookup") as span:
        # attributes describing the inputs
        span.set_attribute("tool.name", "billing_lookup")
        span.set_attribute("tool.args.account_id", account_id)
        span.set_attribute("tool.timeout_s", timeout_s)
        try:
            result = billing_api.get_plan(account_id, timeout=timeout_s)
            span.set_attribute("tool.plan_tier", result.tier)
            span.set_attribute("tool.status", "ok")
            return result
        except TimeoutError as err:
            # record the failure on the span before it closes
            span.set_attribute("tool.status", "timeout")
            span.record_exception(err)
            raise`
    },
    {
      type: 'p',
      text: 'The important part is what happens when this runs inside another active span. The retrieval and model steps are wrapped the same way, and the whole handler runs inside a request span opened at the top. Because each wrapper starts its span while the request span is still current, the library automatically records the parent link. You do not wire the tree by hand. Each span knows the span that was open when it began, and that single fact is what lets a tool draw the itemized tree later. When the billing call times out and your retry logic runs it two more times, each attempt opens its own span, so the three tries show up as three boxes rather than one confusing blur.'
    },
    {
      type: 'p',
      text: 'This maps directly onto **OpenTelemetry**, an open standard for exactly this kind of instrumentation. In its vocabulary a trace is a set of spans sharing one trace ID, and every span carries the ID of its parent, which is how any viewer can rebuild the tree. OpenTelemetry also publishes a set of naming conventions for AI systems, so that the token counts, model names, and prompts land in attribute names that tools recognize. Follow those names and a tracing product can show you a model span with its token usage without you teaching it anything about your code.'
    },
    {
      type: 'callout',
      title: 'Why the flat log failed',
      text: 'A log line is a point in time with no duration and no parent. It can tell you an event happened, but it cannot show you that one step contained three timed-out retries, because it has no notion of nesting or elapsed time. A span carries both, and the parent link stitches the spans into a tree. That structure is the whole reason a trace answers questions a pile of logs cannot.'
    },
    {
      type: 'h2',
      text: 'The mistakes that make traces useless'
    },
    {
      type: 'p',
      text: 'The first mistake is tracing only the outer request and nothing inside it. If you open one span for the whole handler and stop there, you get back the same flat total you already had, just in a fancier viewer. The value lives in the children. Wrap the retrieval call, each model call, and every tool invocation as its own span, or the tree has nothing to show.'
    },
    {
      type: 'p',
      text: 'The second mistake is recording too little on each span. A span with only a name and a duration tells you where time went but not why. When the answer is wrong rather than slow, you will want the actual prompt, the actual response, and the tool arguments so you can see the bad input that produced the bad output. Capture those attributes from the start, because you cannot go back and add them to a request that already failed in production.'
    },
    {
      type: 'p',
      text: 'The third mistake is hiding retries and errors inside a single span. If your retry loop swallows the failures and only reports the final outcome, the trace will show one tool call that happened to be slow, and you will never learn it actually failed twice first. Open a fresh span per attempt and record the exception on the ones that fail. The slow RAG agent was fixed in an afternoon precisely because the three retry spans were visible; the team lowered the timeout, added a fast fallback, and the nine-second tail disappeared.'
    },
    {
      type: 'ul',
      items: [
        'Give every real step its own span: retrieval, each model call, each tool call, and post-processing.',
        'Record inputs and outputs as attributes: prompt, response, token counts, latency, tool arguments, and any error.',
        'Open one span per retry attempt so failed tries stay visible instead of hiding in a single slow box.',
        'Use standard attribute names so your tracing tool understands token usage and model calls without custom setup.'
      ]
    },
    {
      type: 'p',
      text: 'The lesson the support team took away is small and worth keeping. When an AI feature misbehaves, do not interrogate the final answer, because it is only the last line of a long receipt. Build the receipt instead. Wrap each step in a span, record what went in and what came out, and let the parent links draw the tree. Once you can see the whole tree for one call, the slow step and the wrong step stop being mysteries and become the widest or the reddest box on the screen.'
    },
    {
      type: 'sources',
      items: [
        { title: 'OpenTelemetry: Semantic conventions for generative AI systems', url: 'https://opentelemetry.io/docs/specs/semconv/gen-ai/' },
        { title: 'OpenTelemetry: Traces concepts (spans, parent/child, attributes)', url: 'https://opentelemetry.io/docs/concepts/signals/traces/' },
        { title: 'Langfuse: LLM tracing documentation', url: 'https://langfuse.com/docs/tracing' }
      ]
    }
  ]
};
