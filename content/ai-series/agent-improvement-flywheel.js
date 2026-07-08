export const POST = {
  id: 'agent-improvement-flywheel',
  title: 'The Agent Improvement Flywheel: Turning Production Traces Into a Better Agent',
  excerpt: 'A coding agent kept botching the same class of task in production. The team stopped guessing at prompt tweaks and mined their trace logs instead. Here is the loop that turned those failures into a fix that stuck.',
  category: 'AI',
  tags: ['Agents', 'Evaluation', 'Observability'],
  readTime: '8 min read',
  body: [
    {
      type: 'p',
      text: 'A team I worked alongside shipped a coding agent that opened pull requests from plain-English tickets. For simple tasks it was great. Rename a variable, add a field, write a small test, and it did the job. But there was one kind of ticket it kept getting wrong: anything that touched two files at once. Ask it to add a database column and update the API that reads it, and roughly one run in three would edit the migration, forget the API layer, and open a half-finished pull request that a human had to clean up.'
    },
    {
      type: 'p',
      text: 'The first instinct was to argue about the prompt. Someone added a line telling the agent to check for related files. Someone else rewrote the system message to be firmer about finishing the whole task. Every change felt reasonable in the moment, and none of them moved the number. The team was steering blind, tweaking words and hoping the next batch of tickets would go better. The thing they were missing was sitting right there in their logs.'
    },
    {
      type: 'h2',
      text: 'An agent is not a build you ship once'
    },
    {
      type: 'p',
      text: 'Here is the shift that changed how they worked. A traditional program is mostly done when it passes its tests. An agent is different. It meets a stream of real requests you never wrote down, in an order you never planned, and its behavior drifts as the model, the tools, and the users all change around it. You do not ship it and walk away. You put it in front of real traffic, watch what it actually does, and feed what you learn back into the next version. That feedback path is the whole game, and it works like a flywheel: slow to start, but each turn makes the next one easier.'
    },
    {
      type: 'p',
      text: 'The fuel for that flywheel is trace data. Every time the agent runs, it leaves behind a record of what it thought, which tools it called, what arguments it passed, and how the run ended. Most teams collect this and never look at it. The insight is that your production logs are not just for debugging one broken request. They are a supply of real failure cases, written by real users, that no synthetic test set could invent. If you mine them well, they tell you exactly what to fix next.'
    },
    {
      type: 'h2',
      text: 'The loop that turns failures into a fix that sticks'
    },
    {
      type: 'p',
      text: 'The flywheel has a small number of stages, and the point is that you keep going around it rather than stopping after one lap. You capture traces from production. You look through them and sort the failures by what went wrong. You take the clearest failures and turn them into permanent test cases. You change a prompt, a tool, or some logic to fix that class of problem. You re-run your test set to confirm the fix helped and broke nothing else. You deploy. Then you capture the next batch of traces, because the fix will surface new edge cases you could not see before.'
    },
    {
      type: 'diagram',
      nodes: [
        { label: 'Capture traces', detail: 'log every step, tool call, outcome' },
        { label: 'Triage failures', detail: 'sort bad runs by cause' },
        { label: 'Grow eval set', detail: 'add each failure as a case' },
        { label: 'Fix', detail: 'change prompt, tool, or logic' },
        { label: 'Re-run eval', detail: 'confirm fix, check for regressions' },
        { label: 'Deploy', detail: 'ship and watch fresh traffic' }
      ],
      caption: 'The improvement flywheel. Deploy loops back to Capture: each release produces new traces, so the cycle never really ends. Trace data is the fuel, and the growing eval set is the ratchet that stops you sliding backward.'
    },
    {
      type: 'p',
      text: 'Two of these stages do the heavy lifting. Trace data is the fuel because without real runs you have nothing concrete to study. The eval set is the ratchet because once a failure lives in it, that specific mistake can never quietly come back. You caught it once, you wrote it down, and now every future version has to pass it. That is what separates a flywheel from a hamster wheel: the flywheel keeps the ground you gained.'
    },
    {
      type: 'p',
      text: 'It helps to be honest about why the loop feels slow at first. The first lap is the expensive one. You have to set up logging that captures whole runs, sit down and read failures that are often boring and repetitive, and hand-label the first handful of eval cases. None of that produces a visible win on day one. But the second lap is cheaper, because the logging already exists and you know what a bad run looks like. By the fifth lap you are adding cases in minutes and the eval set is catching regressions you would never have found by hand. The flywheel earns its name here: the early turns cost you effort, and the later turns start giving effort back.'
    },
    {
      type: 'h2',
      text: 'The words you need before the next part makes sense'
    },
    {
      type: 'terms',
      items: [
        { term: 'Trace', def: 'The full record of one agent run from the request to the final answer, including the model\'s reasoning, each tool it called, and the result it returned.' },
        { term: 'Span', def: 'One step inside a trace. A single tool call, one model response, or one retrieval is a span. A trace is a tree of spans, so you can zoom in on the exact step that went wrong.' },
        { term: 'Failure triage', def: 'Reading through failed runs and grouping them by root cause, such as wrong tool, bad plan, or a hallucinated argument, so you fix a class of problem instead of one instance.' },
        { term: 'Eval set', def: 'A curated collection of cases, each with an input and a way to check the output, that you run the agent against to measure quality. It grows over time as new failures get added.' },
        { term: 'Regression', def: 'When a change fixes one thing and quietly breaks another that used to work. Re-running the eval set after every change is how you catch regressions before users do.' }
      ]
    },
    {
      type: 'h2',
      text: 'How the coding agent actually got fixed'
    },
    {
      type: 'p',
      text: 'The team stopped arguing about prompts and pulled a week of traces instead. They filtered to failed runs, which for them meant a pull request that got rejected or reverted. Reading through them, a pattern jumped out fast. In almost every failure, the agent had opened a file, edited it, and stopped, without ever searching for the other files that referenced what it just changed. The bad plan was not random. It was the same missing step every time: the agent never looked for downstream callers.'
    },
    {
      type: 'p',
      text: 'That is the payoff of good triage. A vague complaint like "it fails on hard tickets" turns into a precise one: "it skips the step of finding related files before deciding it is done." With the failure named that sharply, the fix almost writes itself. They gave the agent a search tool that returned every file referencing a given symbol, and they changed the system prompt to require running that search before finishing any edit. But they did the fix second. First they turned twelve of those real failing tickets into eval cases, so they could prove the change worked and would keep working.'
    },
    {
      type: 'p',
      text: 'That ordering is easy to get backward, so it is worth dwelling on. The tempting move is to spot the pattern, feel confident, and go straight to the code change. The problem is that you then have no way to measure whether you actually helped. You are back to steering by vibes, the same trap that ate the first week. Writing the eval cases first flips that. You now have twelve runs that fail today, on purpose, and a fix is only real when they pass. It also protects you later. Six weeks from now, when someone rewrites that system prompt for an unrelated reason, these twelve cases stand guard and fail loudly if the old behavior sneaks back in.'
    },
    {
      type: 'p',
      text: 'This next sketch is the plumbing that makes the flywheel turn. It reads a trace log, flags the runs that failed, and appends them to an eval dataset. It is deliberately small, because the value is in doing this at all, not in doing it fancily.'
    },
    {
      type: 'code',
      lang: 'python',
      title: 'mine_traces.py',
      code: `import json

def flag_failures(trace_path):
    """Read a trace log and yield runs that ended badly."""
    with open(trace_path) as f:
        for line in f:
            trace = json.loads(line)
            reverted = trace["outcome"] == "reverted"
            errored = any(s.get("error") for s in trace["spans"])
            if reverted or errored:
                yield {
                    "input": trace["request"],
                    "trace_id": trace["id"],
                    "expected": "",  # a human fills this in
                    "note": "reverted" if reverted else "tool error",
                }

def append_to_eval_set(cases, eval_path):
    with open(eval_path, "a") as out:
        for case in cases:
            out.write(json.dumps(case) + "\\n")

if __name__ == "__main__":
    failures = list(flag_failures("prod_traces.jsonl"))
    append_to_eval_set(failures, "eval_set.jsonl")
    print(f"Added {len(failures)} cases for review")`
    },
    {
      type: 'p',
      text: 'Notice the empty `expected` field. The script does not decide what a correct answer looks like. It collects candidates and hands them to a human, who confirms the failure is real and writes down what should have happened. That review step matters. If you connect a judge to your eval set, you want its labels checked against human judgment, because an automatic grader that nobody audits will happily approve the wrong behavior. This connects to the eval pipeline idea from earlier in the series: the trace miner is the front door that keeps feeding that pipeline fresh, real cases instead of ones you made up at your desk.'
    },
    {
      type: 'p',
      text: 'With the twelve cases in place, they added the search tool and the prompt rule, then re-ran the whole eval set. Ten of the twelve now passed. Two still failed for a different reason, which was fine, because now those two were named and tracked too. Nothing that used to pass had broken. They deployed, and the two-file failure rate dropped from roughly a third to under one in twenty. The next week of traces surfaced a new, smaller problem, and the loop went around again.'
    },
    {
      type: 'h2',
      text: 'The ways teams stall the flywheel'
    },
    {
      type: 'callout',
      title: 'Where the loop breaks in practice',
      text: 'Almost every stalled agent I have seen is missing one of these, not all of them. The most common gap is the first one: no usable traces, so every fix is a guess.'
    },
    {
      type: 'ul',
      items: [
        'Logging outcomes but not the steps in between. If you record only the final answer, you cannot tell whether a bad result came from a wrong tool, a bad plan, or a hallucinated argument. Capture the spans, not just the verdict.',
        'Fixing single tickets instead of classes. Patching the one ticket a user complained about feels productive, but the same category will keep coming back. Triage to the root cause first.',
        'Skipping the eval set and going straight to the fix. Without a case that fails before and passes after, you have no proof the change helped, and no guard against it regressing later.',
        'Letting an unaudited judge grade everything. A model-as-judge is useful, but if no human ever spot-checks its labels, it drifts and starts blessing the exact behavior you were trying to kill.',
        'Treating a passing eval set as done. The set is a floor that should keep rising. Every new batch of production traces is a chance to add cases you could not have imagined at the start.'
      ]
    },
    {
      type: 'p',
      text: 'The takeaway is smaller than it sounds. You do not need a fancier model or a cleverer prompt to make an agent better over time. You need to treat your production traces as the raw material they are, sort the failures honestly, and pin each one down with a permanent test case before you touch the code. Do that and the agent stops drifting and starts compounding. Every real failure a user hits becomes a case the next version can never fail again, and the flywheel, once it is spinning, does most of the work for you.'
    },
    {
      type: 'sources',
      items: [
        { title: 'Arize Phoenix: Tracing and Evaluation for LLM Applications', url: 'https://docs.arize.com/phoenix' },
        { title: 'Anthropic: Building Effective Agents', url: 'https://www.anthropic.com/research/building-effective-agents' },
        { title: 'Zheng et al., Judging LLM-as-a-Judge with MT-Bench and Chatbot Arena (2023)', url: 'https://arxiv.org/abs/2306.05685' }
      ]
    }
  ]
};
