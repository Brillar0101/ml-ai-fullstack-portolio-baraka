export const POST = {
  id: 'what-to-log-and-alert',
  title: 'The Dashboard Was Green While the Chatbot Quietly Broke: What to Log and Alert On for an LLM Feature',
  excerpt: 'Uptime said everything was fine for four days while a support chatbot slowly turned useless. Standard app monitoring watches for crashes and slow responses, but an LLM feature can fail while every server stays healthy. Here is what to actually capture and what deserves to wake someone up.',
  category: 'AI',
  tags: ['Observability', 'Monitoring', 'Production'],
  readTime: '8 min read',
  body: [
    {
      type: 'p',
      text: 'A company shipped a support chatbot in front of their help center. It ran on a boring, well-monitored stack: load balancer, a couple of API servers, the usual alerts on CPU, memory, error rates, and uptime. For the first month it worked. Then someone changed the retrieval index the bot used to ground its answers, and a config typo quietly pointed it at a stale copy of the docs. The bot kept answering. It kept returning HTTP 200. Every server stayed healthy, latency looked normal, and the uptime alert stayed green the entire time. Four days later a manager noticed the support queue had swelled with angry follow-ups, all variations of the bot told me the wrong thing. The feature had been failing since Tuesday, and nothing in the monitoring stack had said a word.'
    },
    {
      type: 'p',
      text: 'That gap is the whole point of this post. Standard application monitoring watches whether the software is running. It says almost nothing about whether the answers are any good. An LLM feature has a second, quieter way to fail: it stays up, stays fast, returns valid responses, and the content inside those responses is wrong, unsafe, or useless. If you only wire up the alerts you would use for a normal web service, you are blind to exactly the failures that make AI features different.'
    },
    {
      type: 'h2',
      text: 'Why a healthy server tells you nothing about answer quality'
    },
    {
      type: 'p',
      text: 'Start with the intuition. In a normal web app, a broken feature usually announces itself. A bad deploy throws exceptions, a slow query spikes latency, a dead dependency returns 500s. Your alerts fire because failure and error are close to the same thing. The output of most endpoints is either right or it visibly breaks.'
    },
    {
      type: 'p',
      text: 'A language model does not offer you that courtesy. Feed it a stale document, a confusing prompt, or an input it has never seen, and it will still produce a fluent, confident, perfectly well-formed answer. The HTTP layer sees success. The model, meanwhile, is hallucinating a refund policy that does not exist. Nothing in the request or response shape reveals the problem, because the problem lives in the meaning of the text, and your web monitoring cannot read. So you have to capture different signals: numbers that stand in for quality, safety, cost, and change, measured on the content itself rather than on the plumbing around it.'
    },
    {
      type: 'h2',
      text: 'Four families of signals worth capturing'
    },
    {
      type: 'p',
      text: 'It helps to sort the signals into four groups, because each group answers a different question and each earns a different response from you. The first group is **quality proxies**: numbers that correlate with whether users are getting good answers, even though you cannot measure good directly at scale. The clearest one is the thumbs-down rate, the fraction of responses users explicitly mark as unhelpful. Close behind are the regeneration or retry rate, how often a user asks the same thing again because the first answer missed, the escalation rate, how often a chat gets handed off to a human, and the refusal rate, how often the model declines to answer at all. When the stale index broke the support bot, the thumbs-down rate roughly tripled within hours. That signal existed. Nobody was watching it.'
    },
    {
      type: 'p',
      text: 'The second group is **safety flags**. These catch the responses that are not merely unhelpful but harmful or risky: outputs a toxicity classifier scores as abusive, inputs that look like jailbreak attempts trying to override the system prompt, and cases where the model echoes back personal data, a PII leak. These are low-frequency and high-consequence, which shapes how you alert on them later.'
    },
    {
      type: 'p',
      text: 'The third group is **operational metrics**, the LLM-flavored cousins of your normal ops dashboard. Time-to-first-token measures how long a user stares at a blank screen before words appear, which matters more than total latency for a streaming chat. Tokens per request and cost per request track spend, because a prompt that quietly grew from two thousand to twenty thousand tokens can multiply your bill without any error at all. Tool error rate matters when the model calls functions or APIs, because a failing tool can turn a capable agent into a confused one while the model itself looks fine.'
    },
    {
      type: 'p',
      text: 'The fourth group is **drift**: signals that the world has moved away from what your system was built for. A rising fallback rate, how often you drop to a default or canned response, is one sign. A changing input distribution, users suddenly asking about a product you launched last week that is not in your docs, is another. Drift is slow and easy to miss, which is exactly why the stale-index bug festered for days.'
    },
    {
      type: 'diagram',
      title: 'What to watch on an LLM feature',
      rows: [
        [
          { label: 'Quality proxies', detail: 'thumbs-down rate, regeneration/retry rate, escalation to human, refusal rate' }
        ],
        [
          { label: 'Safety flags', detail: 'toxicity score, jailbreak attempts, PII in output' }
        ],
        [
          { label: 'Operational', detail: 'time-to-first-token, tokens/request, cost/request, tool error rate' }
        ],
        [
          { label: 'Drift', detail: 'rising fallback rate, changing input distribution' }
        ]
      ],
      caption: 'Standard app monitoring covers only part of the operational row. The quality, safety, and drift rows are where LLM features fail silently, and they need their own capture.'
    },
    {
      type: 'terms',
      items: [
        { term: 'Quality proxy', def: 'A measurable signal that stands in for answer quality, which you cannot grade directly at scale. Thumbs-down rate, regeneration rate, and escalation rate all move when answers get worse, so you watch them as a stand-in for a human reading every reply.' },
        { term: 'Drift', def: 'A gradual shift between what your system was built for and what it now receives or produces. Inputs change (users ask new things), or outputs degrade (fallback and refusal rates creep up), so behavior that was fine at launch slowly stops fitting reality.' },
        { term: 'Alert fatigue', def: 'What happens when a monitor pages people so often, or so noisily, that they start ignoring it. Once an alert is mostly false positives, a real one gets dismissed too, which makes the alert worse than none.' },
        { term: 'SLO for an AI feature', def: 'A service level objective expressed in quality terms, not just uptime. For example: the thumbs-down rate stays under three percent over any rolling day, and time-to-first-token stays under two seconds for ninety-five percent of requests. It gives you a defined line that alerts can defend.' }
      ]
    },
    {
      type: 'h2',
      text: 'Emit one structured event per request so every signal is queryable'
    },
    {
      type: 'p',
      text: 'None of these signals exist unless you capture them, and the cleanest way to capture them is to emit one structured event for every request. Not a free-text log line, but a machine-readable record with named fields, so you can later count, average, group, and alert without parsing prose. The event ties together the operational numbers, the safety scores, and a place to attach feedback when it arrives. Here is a compact version of what that emitter can look like.'
    },
    {
      type: 'code',
      lang: 'python',
      title: 'A structured metrics event per LLM request',
      code: `import json, time

def emit_llm_event(req, resp, timings, safety):
    event = {
        "ts": time.time(),
        "request_id": req.id,
        "user_id": req.user_id,
        # operational
        "model": resp.model,
        "time_to_first_token_ms": timings.first_token_ms,
        "total_ms": timings.total_ms,
        "input_tokens": resp.usage.input_tokens,
        "output_tokens": resp.usage.output_tokens,
        "cost_usd": estimate_cost(resp.usage, resp.model),
        "tool_calls": resp.tool_call_count,
        "tool_errors": resp.tool_error_count,
        # quality and behavior
        "refused": resp.refused,
        "used_fallback": resp.used_fallback,
        # safety (scores from classifiers, 0..1)
        "toxicity": safety.toxicity,
        "jailbreak_score": safety.jailbreak,
        "pii_in_output": safety.pii_detected,
        # feedback is filled in later, keyed by request_id
        "thumbs": None,
    }
    print(json.dumps(event))  # ship to your log pipeline`
    },
    {
      type: 'p',
      text: 'Two details make this work in practice. First, thumbs is left empty at request time and filled in later when the user clicks, joined back by request_id, so a single record can carry both what happened and how the user felt about it. Second, every value is a field with a name, which means your thumbs-down rate is a query over these events rather than a special pipeline you had to build. Capture once, ask many questions later.'
    },
    {
      type: 'h2',
      text: 'Decide what pages a human and what just sits on a dashboard'
    },
    {
      type: 'p',
      text: 'Capturing every signal does not mean alerting on every signal. The hard part is deciding which ones deserve to wake someone at two in the morning and which ones belong on a dashboard you review each morning with coffee. The rule of thumb: page a human only when the signal is both urgent and actionable right now. Safety events usually clear that bar. A spike in jailbreak attempts or a confirmed PII leak is happening now and someone must act, so it pages. A gradual rise in tokens per request costs money but can wait until morning, so it lives on a dashboard with a weekly review.'
    },
    {
      type: 'p',
      text: 'Quality proxies sit in the interesting middle. A thumbs-down rate that jumps from three percent to nine percent and stays there is worth a page, because it is the exact signal that would have caught the stale-index bug on Tuesday afternoon instead of the following Saturday. But you do not page on a single thumbs-down, or even a handful. You page on a rate that crosses a threshold and holds. Here is the decision spine drawn out.'
    },
    {
      type: 'diagram',
      title: 'Alert or dashboard?',
      root: {
        label: 'A signal moved',
        color: 'purple',
        children: [
          {
            edge: 'unsafe or leaking now',
            node: { label: 'Page immediately (safety)', color: 'yellow' }
          },
          {
            edge: 'quality rate crossed SLO and held',
            node: { label: 'Page on-call (quality)', color: 'yellow' }
          },
          {
            edge: 'slow cost or drift trend',
            node: { label: 'Dashboard + weekly review', color: 'yellow' }
          },
          {
            edge: 'single bad response',
            node: { label: 'Log only, no alert', color: 'yellow' }
          }
        ]
      },
      caption: 'Urgency and actionability decide the response. Immediate harm pages, a sustained quality breach pages, slow trends go on a dashboard, and one-off events are just logged.'
    },
    {
      type: 'h2',
      text: 'Alert on rates and trends, never on single events'
    },
    {
      type: 'p',
      text: 'The fastest way to ruin your own monitoring is alert fatigue, and LLM signals are especially good at causing it because they are noisy by nature. Any single response can be bad. A user thumbs-downs a perfect answer because they were in a bad mood, a toxicity classifier trips on a quoted swear word, one request refuses because the phrasing was odd. If each of those pages someone, your team learns within a week to swipe the alerts away without reading them, and then the real one gets swiped away too. The alert becomes noise, and noise is worse than silence because it costs attention and gives nothing back.'
    },
    {
      type: 'p',
      text: 'The fix is to alert on rates and trends rather than events. A single thumbs-down means nothing. A thumbs-down rate above six percent sustained over an hour, measured across enough requests to be real, means something specific and worth waking up for. This does three useful things at once. It smooths out individual noise, it forces you to state a threshold, which forces you to define what good looks like, and it ties the alert to your SLO, the quality line you promised to hold. Define the objective first, then let the alert defend it. An alert without an SLO behind it is just a guess about when to panic.'
    },
    {
      type: 'callout',
      title: 'The one alert that would have caught it',
      text: 'The support bot broke on Tuesday and was found on Saturday because the only alert was uptime, which never dropped. A single rate alert, thumbs-down above six percent sustained for one hour, would have paged within the first afternoon. The data to build it was already flowing. Nobody had turned it into a threshold.'
    },
    {
      type: 'h2',
      text: 'The mistakes that keep teams blind'
    },
    {
      type: 'p',
      text: 'A few patterns show up again and again, and each one maps back to a specific way the support bot stayed broken for four days.'
    },
    {
      type: 'ul',
      items: [
        'Treating an LLM feature like a normal web service. Uptime and 500s tell you the server is alive, not that the answers are good. Add quality proxies or you are watching the wrong thing.',
        'Capturing nothing about the content. If you never emit thumbs, refusals, or safety scores as fields, you cannot query them later, and the incident is invisible until users complain.',
        'Alerting on single events. One bad response is not an incident. Page on sustained rates so noise does not train your team to ignore the pager.',
        'Ignoring cost and token growth until the bill arrives. Tokens per request creeping up is a slow, silent budget leak. Put it on a dashboard even though it never deserves a page.',
        'Having no quality SLO. Without a stated line for thumbs-down rate or time-to-first-token, every alert threshold is arbitrary and every argument about whether things are fine is unwinnable.'
      ]
    },
    {
      type: 'h2',
      text: 'What to carry away'
    },
    {
      type: 'p',
      text: 'An LLM feature can fail while every server is healthy, so the monitoring you copied from your web tier will miss the failures that matter most. Capture four families of signal on the content itself: quality proxies like thumbs-down and regeneration and escalation and refusal rates, safety flags like toxicity and jailbreak attempts and PII leaks, operational numbers like time-to-first-token and tokens and cost and tool errors, and drift like rising fallback and shifting inputs. Emit them as one structured event per request so any of them is a query away. Then split the response by urgency: page immediately on live safety events, page on-call when a quality rate crosses your SLO and holds, and leave slow cost and drift trends on a dashboard you actually read. Above all, alert on rates and trends, never on single events, so you never train your team to ignore the pager. The support team from the story added exactly one rate alert on thumbs-down. The next time an index went stale, they knew within the hour, while the dashboard was still green.'
    },
    {
      type: 'sources',
      items: [
        { title: 'Datadog: LLM Observability', url: 'https://docs.datadoghq.com/llm_observability/' },
        { title: 'Arize: LLM Observability and monitoring', url: 'https://arize.com/llm-observability/' },
        { title: 'OpenTelemetry: Semantic conventions for generative AI', url: 'https://opentelemetry.io/docs/specs/semconv/gen-ai/' }
      ]
    }
  ]
};
