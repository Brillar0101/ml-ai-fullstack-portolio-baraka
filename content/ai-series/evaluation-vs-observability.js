export const POST = {
  id: 'evaluation-vs-observability',
  title: 'Passing Evals Then Drowning in Complaints: Why Testing Before You Ship Is Only Half the Job',
  excerpt: 'A team scored high on every offline test, shipped with confidence, and a week later could not explain a wave of angry tickets. Nothing about the live traffic had been recorded. This is the gap between checking a version and watching a running system.',
  category: 'AI',
  tags: ['Observability', 'Evaluation', 'Production'],
  readTime: '8 min read',
  body: [
    {
      type: 'p',
      text: 'A team I spoke with built a support assistant on top of a language model. Before launch they did the responsible thing. They collected two hundred real customer questions, wrote out the ideal answer for each one, and ran their candidate version against that set. The scores came back strong. Faithfulness looked good, the answers matched the reference material, and a second model acting as a judge rated most responses highly. They shipped on a Thursday feeling safe.'
    },
    {
      type: 'p',
      text: 'By the next Wednesday the support inbox had filled with complaints. Users said the assistant was confidently wrong about refund windows, that it stalled on some questions, and that it gave different answers to what looked like the same request. The team pulled up their evaluation report to see what had changed. Nothing had changed there. The two hundred test cases still passed. The problem was that the assistant was failing on questions the test set had never contained, and the team had no record of any of it. They had not logged the live calls. They could see the score from before launch, and they could see the angry tickets, but they had nothing in between. They could not tell which questions triggered the bad answers, how slow the slow ones really were, or whether the model or their own code was at fault.'
    },
    {
      type: 'p',
      text: 'That missing middle is the subject of this post. The score before launch and the health of the running system are two different questions, answered by two different practices. One is **offline evaluation**. The other is **online observability**. You need both, and the team above had built only the first.'
    },
    {
      type: 'h2',
      text: 'The two questions: is this change safe to ship, and is the shipped thing working'
    },
    {
      type: 'p',
      text: 'Start with the plain intuition, because the two ideas are easy to blur together. Evaluation asks a question about a version of your system before real users touch it. You take a fixed set of inputs, you know what a good output looks like, and you measure how close your candidate gets. It happens in a controlled room with the doors closed. Observability asks a question about the system that is already running. It does not compare against a known answer, because in production you usually do not have one. Instead it records what actually happened on real traffic so you can look back and see where things went wrong.'
    },
    {
      type: 'p',
      text: 'Put simply, evaluation is a rehearsal and observability is a security camera. A rehearsal tells you whether the play is ready for an audience. It cannot tell you that on opening night an actor tripped over a cable that was never on the rehearsal stage. For that you need the camera running during the real performance. The support team had rehearsed well. They had no camera.'
    },
    {
      type: 'p',
      text: 'The reason both are needed comes down to what each one can and cannot see. Evaluation is precise but narrow. It gives you a clean number because it compares against answers you already trust, but it can only judge the inputs you put in front of it. Observability is broad but noisy. It sees everything that really happened, including the questions you never thought of, but it rarely comes with a tidy score, because on live traffic nobody wrote down the right answer in advance. One trades coverage for certainty and the other trades certainty for coverage. Lean on only the first and you are blind to the unexpected. Lean on only the second and you have no safe way to test a change before it reaches users.'
    },
    {
      type: 'h2',
      text: 'Walking through the refund-window failure'
    },
    {
      type: 'p',
      text: 'Here is why a high evaluation score can sit right next to real production failures. The test set had two hundred questions. Every one of them was a question someone on the team had thought of. Real users asked things nobody had imagined. Somebody asked about refund windows for a product bought during a promotion, a case the reference set never included. The retrieval step pulled a policy page for a different product line, and the model answered fluently and wrongly. On the evaluation set this failure was invisible, because that question was not in the set. The score stayed high because the score only measures the cases you already wrote down.'
    },
    {
      type: 'p',
      text: 'Now imagine the team had been recording live calls. For that bad answer there would be a record showing the exact user question, the passages the retriever fetched, the final answer, how long it took, how many tokens it used, and the fact that the user clicked thumbs down and then opened a human ticket. With that record in hand the diagnosis takes minutes instead of a week. You see the wrong policy page in the retrieved context and you know the failure is in retrieval, not in the prompt. Better still, that exact question becomes a new test case. You add it to the evaluation set so the next version is measured against the thing that actually broke.'
    },
    {
      type: 'terms',
      items: [
        { term: 'Offline evaluation', def: 'Running a fixed, known set of inputs against a candidate version and scoring the outputs against reference answers or rules, before any real users are involved. It answers whether a change is safe to ship.' },
        { term: 'Online observability', def: 'Instrumenting the live system so that every real request and its result are recorded and searchable. It answers what the shipped system actually did and where it went wrong on real traffic.' },
        { term: 'Trace', def: 'The full recorded story of one request as it moved through the system: the input, each intermediate step such as retrieval or a tool call, the timing of each step, and the final output. A trace lets you replay one interaction end to end.' },
        { term: 'Feedback signal', def: 'Any observed reaction that suggests whether an output was good or bad without a hand-written reference answer. Examples are a thumbs down, a retry, an escalation to a human, or an abandoned session.' }
      ]
    },
    {
      type: 'h2',
      text: 'The loop that connects the two'
    },
    {
      type: 'p',
      text: 'The two practices are strongest when you wire them into a loop rather than treating them as separate chores. You evaluate a candidate, ship the winner, watch the live traffic, mine the failures the camera caught, and turn those failures into fresh evaluation cases for the next round. Each trip around the loop makes the evaluation set look more like reality, because it grows from real production misses instead of only from what the team could imagine at the whiteboard.'
    },
    {
      type: 'diagram',
      nodes: [
        { label: 'Evaluate candidate', detail: 'Run the fixed test set, score against references, pick the version to ship' },
        { label: 'Ship winner', detail: 'Release the version that cleared the bar to real users' },
        { label: 'Observe live traffic', detail: 'Record a trace for every real call: input, steps, output, latency, tokens, feedback' },
        { label: 'Mine failures', detail: 'Search traces for thumbs down, escalations, retries, slow or costly calls' },
        { label: 'New eval cases', detail: 'Turn each real miss into a test case, then loop back to evaluate' }
      ],
      caption: 'Evaluation and observability form one loop. Live signals are not the end of the line, they are the source of the next generation of test cases.'
    },
    {
      type: 'p',
      text: 'The mechanism that makes the loop possible is structured logging. When a production call finishes, you write down one record that captures the inputs, the output, and the numbers around them: how long the call took, how many tokens it burned, and any feedback the user gave. Structured means the record is a set of named fields, not a line of free text, so you can later search for every call slower than three seconds or every call that got a thumbs down. Without that structure your logs are a haystack. With it, mining failures is a query.'
    },
    {
      type: 'code',
      lang: 'python',
      title: 'Logging one structured record for a production LLM call',
      code: `import time, json, uuid

def call_and_log(model, question, retrieved, sink):
    start = time.time()
    result = model.answer(question, context=retrieved)
    record = {
        "trace_id": str(uuid.uuid4()),
        "question": question,
        "retrieved_ids": [p["id"] for p in retrieved],
        "answer": result.text,
        "latency_ms": round((time.time() - start) * 1000),
        "prompt_tokens": result.prompt_tokens,
        "output_tokens": result.output_tokens,
        "feedback": None,      # filled in later: "up", "down", "escalated"
        "ts": time.time(),
    }
    sink.write(json.dumps(record) + "\\n")
    return record

# when the user reacts, attach the signal to the same trace
def attach_feedback(trace_id, signal, store):
    store.update(trace_id, {"feedback": signal})`
    },
    {
      type: 'p',
      text: 'Notice that the feedback field starts empty and gets filled in when the user reacts. The answer and the reaction arrive at different moments, so they are joined by the trace id. That single identifier is what lets you connect a slow, wrong answer to the thumbs down that followed it, and then to the human ticket after that.'
    },
    {
      type: 'h2',
      text: 'Common mistakes teams make with both'
    },
    {
      type: 'p',
      text: 'The first mistake is the one from the story: shipping with a strong evaluation score and no live instrumentation, then flying blind when reality diverges from the test set. The second is the opposite, pouring effort into dashboards while never feeding the observed failures back into the evaluation set, so the same class of bug keeps shipping. A third mistake is logging only the final answer and dropping the intermediate steps. If you do not record the retrieved passages or the tool calls, you can see that an answer was wrong but not why, and the wrong policy page stays hidden.'
    },
    {
      type: 'p',
      text: 'A quieter mistake is treating your evaluation set as finished. A test set written once at launch slowly drifts away from what users actually ask. The whole point of the loop is that production hands you real misses for free, and those misses are the most valuable test cases you will ever get because they are the ones your current system fails on. Ignoring them wastes the best source of coverage you have.'
    },
    {
      type: 'callout',
      title: 'The one-line test',
      text: 'For any live failure, ask: could I pull up the exact input, the intermediate steps, and the timing for that one request? If the answer is no, you have evaluation but not observability, and your next surprise will cost you a week.'
    },
    {
      type: 'h2',
      text: 'What to take away'
    },
    {
      type: 'p',
      text: 'Evaluation and observability are not competing ideas and you do not choose between them. Evaluation is a gate you pass before shipping, and it answers whether a specific change is safe to release. Observability is a window you keep open after shipping, and it answers whether the released thing is holding up on traffic you never anticipated. A great score behind the gate says nothing about the questions your users will invent tomorrow. Instrument the running system, record a structured trace for every call, watch the feedback signals, and route the real failures back into the test set. Do that and the two hundred cases you started with grow into a set that reflects the world, one caught failure at a time.'
    },
    {
      type: 'sources',
      items: [
        { title: 'LangSmith documentation: tracing and observability for LLM applications', url: 'https://docs.smith.langchain.com/' },
        { title: 'OpenTelemetry Generative AI semantic conventions', url: 'https://opentelemetry.io/docs/specs/semconv/gen-ai/' },
        { title: 'Arize Phoenix: open-source LLM tracing and evaluation', url: 'https://docs.arize.com/phoenix' }
      ]
    }
  ]
};
