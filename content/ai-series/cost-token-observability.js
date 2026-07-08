export const POST = {
  id: 'cost-token-observability',
  title: 'Watching the Meter: Cost and Token Observability in Real Time',
  excerpt: 'A team woke up to a bill three times larger than the day before. One agent had started looping, and every loop re-sent a huge block of context. Here is how to make token spend visible before the invoice does it for you.',
  category: 'AI',
  tags: ['Observability', 'Cost', 'Tokens'],
  readTime: '8 min read',
  body: [
    {
      type: 'p',
      text: 'A small team ran a support agent that had behaved for weeks. It read a customer question, pulled a few relevant help articles, and wrote a reply. Cost was steady and boring, which is exactly what you want. Then one Tuesday the bill for a single day came in at three times the usual number. Nothing had crashed. No alarm had gone off. The agent had answered every ticket correctly. What changed was invisible from the outside: on certain tricky tickets the agent had started looping, retrying its own reasoning again and again, and on every single loop it re-sent the same large block of retrieved documents. The work looked the same. The token count did not.'
    },
    {
      type: 'p',
      text: 'This is the trap with language model spend. The price is driven by tokens, and tokens are easy to lose sight of because you never touch them directly. You write a prompt, you get an answer, and somewhere behind that exchange a meter is running. If you do not put that meter on a screen where people can see it, the first time you learn the number is when finance forwards you the invoice. The goal of this post is to make spend visible and attributable while it happens, so a looping agent or a quietly growing prompt shows up as a line on a chart the same afternoon, not as a surprise at the end of the month.'
    },
    {
      type: 'h2',
      text: 'A taxi meter you never looked at'
    },
    {
      type: 'p',
      text: 'Think about riding in a taxi with the fare display covered by a cloth. The ride feels fine. You get where you are going. You have no idea what it costs until the driver pulls the cloth off at the end. If the route was short you are relieved, and if the driver circled the block twenty times you are furious, but either way you found out too late to do anything about it. Most teams run their language model spend exactly this way. The request goes out, the answer comes back, and the fare is hidden until billing day.'
    },
    {
      type: 'p',
      text: 'Cost observability is just pulling the cloth off the meter and pointing a camera at it. Every request has a token count you can read the moment it finishes. If you capture that number, attach a price to it, and write it down with enough labels to know who the ride was for, then a strange trip stands out while it is still happening. The looping support agent would have shown up as a fat spike on a per-request chart, and someone could have stopped it before lunch instead of the next morning.'
    },
    {
      type: 'h2',
      text: 'Where the tokens actually pile up in one request'
    },
    {
      type: 'p',
      text: 'To watch spend well, you first need a feel for where it comes from inside a single call. A request to a model is not one clean question. It is a stack of text that you assemble and send, and every part of that stack is counted. There is the system prompt that sets the rules. There is any context you retrieved and pasted in, which for a document-heavy app is often the biggest piece. There is the running conversation history, which grows with every turn. And there is the output the model writes back, which you also pay for, usually at a higher rate than the input.'
    },
    {
      type: 'diagram',
      nodes: [
        { label: 'System prompt', detail: 'rules and instructions, roughly fixed per call' },
        { label: 'Retrieved context', detail: 'documents you pasted in, often the largest and most variable piece' },
        { label: 'Conversation history', detail: 'every earlier turn, grows the longer the session runs' },
        { label: 'Output tokens', detail: 'what the model writes back, usually priced higher than input' }
      ],
      caption: 'The four places tokens accumulate in a single request. The first three are input you send, the last is output you receive, and all four are billed.'
    },
    {
      type: 'p',
      text: 'That last point deserves a pause, because it catches people. Providers charge separately for the tokens you send in and the tokens the model generates, and output is typically the more expensive of the two, sometimes several times the input rate. So a request that reads a short question and writes a long essay can cost more than a request that reads a long document and writes one line, even though the second one feels heavier. If you track only a single lumped token number, you hide this. Track input and output apart from each other and the shape of your spend becomes readable.'
    },
    {
      type: 'p',
      text: 'It also helps to notice which pieces are steady and which ones swing. The system prompt is close to fixed, so it adds a predictable floor to every call. Retrieved context and history are the movers. They change from request to request and from session to session, which means most of the surprises in your bill come from them. When the support agent looped, it was the retrieved context that hurt, because that block was large and it went out again on every pass. If you know in advance which parts of the stack are volatile, you know where to look the moment a chart moves, instead of guessing across the whole request.'
    },
    {
      type: 'terms',
      items: [
        { term: 'Input tokens', def: 'The text you send to the model: system prompt, retrieved context, and history. Priced per token, usually lower than output.' },
        { term: 'Output tokens', def: 'The text the model generates in reply. Priced per token, usually higher than input, so long answers cost more than they look.' },
        { term: 'Cost attribution', def: 'Tagging each request with who or what it was for (a feature, a user, a customer) so total spend can be split by those labels.' },
        { term: 'Cost per outcome', def: 'Money spent divided by successful results, not by calls. Retries and loops inflate calls without adding outcomes, and this metric exposes that.' },
        { term: 'Token budget', def: 'A ceiling you set on tokens or cost for a request, feature, or customer, paired with an alert when the trend approaches it.' }
      ]
    },
    {
      type: 'h2',
      text: 'Turning a token count into a number you can chart'
    },
    {
      type: 'p',
      text: 'The mechanism is small and worth doing by hand once so it stops feeling like magic. Every response from a model API tells you how many input tokens and output tokens it used. You keep a table of prices per model, you multiply, and you log the result with a few labels. That log line is the whole game. Here is a compact version.'
    },
    {
      type: 'code',
      lang: 'python',
      title: 'Compute and log cost from token counts',
      code: `PRICES = {  # dollars per 1,000 tokens\n    "big-model":   {"in": 0.003, "out": 0.015},\n    "small-model": {"in": 0.0005, "out": 0.0015},\n}\n\ndef log_cost(model, usage, feature, customer_id):\n    rate = PRICES[model]\n    cost_in = usage["input_tokens"]  / 1000 * rate["in"]\n    cost_out = usage["output_tokens"] / 1000 * rate["out"]\n    total = cost_in + cost_out\n    emit({                       # send to your metrics store\n        "model": model,\n        "feature": feature,       # tags make spend attributable\n        "customer_id": customer_id,\n        "input_tokens": usage["input_tokens"],\n        "output_tokens": usage["output_tokens"],\n        "cost_usd": round(total, 6),\n    })\n    return total`
    },
    {
      type: 'p',
      text: 'The prices here are placeholders, so read the current numbers off your provider page before you trust them. What matters is the shape. Notice the tags for feature and customer. Those are what make the number attributable. Once every request carries them, you can group your spend by feature to see which one is expensive, or by customer to see whether one heavy account is quietly eating the margin on your flat-rate plan. Without tags you have one big total and no way to ask where it came from.'
    },
    {
      type: 'p',
      text: 'Where you send that log line is a smaller decision than getting into the habit of writing it at all. It can go to whatever metrics store you already run, or even a database table you query by hand at first. The point is that cost stops living inside a monthly invoice and starts living next to your other operational numbers, refreshed as requests come in. Once it sits there beside latency and error rate, cost becomes something you glance at during normal work rather than a report you dread. That shift, from a number you receive to a number you watch, is most of the value.'
    },
    {
      type: 'h2',
      text: 'The silent drivers that move the number'
    },
    {
      type: 'p',
      text: 'Now that the meter is visible, watch for the things that push it up without any code change. The looping agent from the opening is the loudest of them: a control flow bug that retries a step, and if each retry re-sends a large context, the cost per successful ticket climbs while the answers stay the same. This is why cost per outcome matters more than cost per call. Ten calls that produce one answer is nine calls of pure waste, and only the per-outcome view shows it.'
    },
    {
      type: 'ul',
      items: [
        'A retrieval step that stuffs the full document set into every call instead of the few passages that matter, inflating input tokens on requests that never needed them.',
        'Retries on timeouts or errors that quietly double or triple the token spend for a single logical request.',
        'An agent loop with no step ceiling, re-sending its whole context on each pass until something external stops it.',
        'A prompt that grew over months as people appended one more instruction, so every call now carries extra fixed cost nobody reviews.',
        'Conversation history that is never trimmed, so long sessions pay more per turn simply because the transcript keeps getting longer.'
      ]
    },
    {
      type: 'callout',
      title: 'Alert on the trend, not just the total',
      text: 'A monthly cap tells you the damage after it is done. Set budgets and alerts on cost per request and cost per outcome over a short window, so a sudden climb pages someone the same day. The looping agent tripled the daily bill in hours, and a trend alert on cost per ticket would have caught it long before the invoice did.'
    },
    {
      type: 'h2',
      text: 'Cheap wins once you can see the meter'
    },
    {
      type: 'p',
      text: 'Visibility pays off because it points you at the right fix instead of a guess. If a chart shows one feature dominating your input tokens, caching repeated context or trimming the retrieved passages down to what the answer needs can cut that line hard. If cheap, easy requests are being sent to your most expensive model, route the simple ones to a smaller model and keep the big model for the hard cases. If output tokens are the problem, ask for shorter answers or cap the maximum length. None of these are clever. They are only obvious once the meter is on the wall and you can see which number to attack.'
    },
    {
      type: 'p',
      text: 'The takeaway is plain. Language model cost is tokens, and tokens stay hidden unless you choose to surface them. Capture input and output counts on every request, multiply by a price table, tag the result with the feature and customer it served, and chart cost per successful outcome instead of cost per call. Put a budget and a trend alert on top. Do that, and the next agent that starts looping shows up as a spike you catch in an afternoon, back when it is a curiosity, rather than as a number finance hands you at the end of the month.'
    },
    {
      type: 'sources',
      items: [
        { title: 'Anthropic pricing and token usage', url: 'https://docs.anthropic.com/en/docs/about-claude/pricing' },
        { title: 'OpenAI API pricing', url: 'https://openai.com/api/pricing/' },
        { title: 'OpenAI usage and cost tracking guide', url: 'https://platform.openai.com/docs/guides/production-best-practices' }
      ]
    }
  ]
};
