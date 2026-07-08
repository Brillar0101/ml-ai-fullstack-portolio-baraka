export const POST = {
  id: 'manual-rag-vs-agentic-context',
  title: 'Who Decides What Goes in the Window: Manual RAG vs Agentic Context',
  excerpt: 'A docs bot that runs a full retrieval on every "thanks" is burning money. The fix is not a bigger pipeline. It is letting the model decide when to fetch.',
  category: 'AI',
  tags: ['Context Engineering', 'RAG', 'Agents'],
  readTime: '8 min read',
  body: [
    {
      type: 'p',
      text: 'A support team I worked with shipped a documentation assistant for their developer portal. It answered questions about their API well enough. Then someone looked at the token bill. The bot was running a full vector search and pulling ten document chunks into the prompt on **every single message**, including the ones that were just a user typing \'thanks, that worked\' or \'ok\'. Roughly a third of the traffic needed no documents at all, and the system was paying retrieval and prompt costs on all of it.'
    },
    {
      type: 'p',
      text: 'That waste was not a bug in the code. It was a consequence of the design. The pipeline was built to retrieve first and ask questions later. Nobody had given the system a way to say \'this turn does not need any documents.\' To understand why, and to see the alternative, we need to look at who is actually in charge of filling the context window.'
    },
    {
      type: 'h2',
      text: 'The context window is a small desk, and someone has to decide what sits on it'
    },
    {
      type: 'p',
      text: 'Think of the model as a person working at a small desk. The desk is the context window: the text the model can see while it produces an answer. It is not huge, and even when it is large, cramming it full costs money and can bury the useful lines under noise. Every design that connects a model to a knowledge base is, underneath, a policy for what to put on that desk each turn. The interesting question is who writes that policy. In one design a fixed program decides. In the other the model decides for itself.'
    },
    {
      type: 'p',
      text: 'Hold onto the desk image, because the whole contrast comes down to this. A manual pipeline is like an assistant who drops the same stack of ten folders on your desk before every conversation, no matter what you asked. An agentic setup is like giving you the key to the filing cabinet and letting you walk over and grab a folder only when you actually need one.'
    },
    {
      type: 'h2',
      text: 'How a manual RAG pipeline fills the window without asking'
    },
    {
      type: 'p',
      text: 'The classic retrieval-augmented generation pipeline is a straight line. A message comes in. The system turns it into a vector, searches a database for the closest chunks, takes the top handful, pastes them above the question, and sends the whole thing to the model. The model answers. Same steps, same order, every turn. Nothing in that flow ever checks whether the documents were needed.'
    },
    {
      type: 'diagram',
      title: 'Manual RAG: a fixed line',
      nodes: [
        { id: 'u', label: 'User message', icon: 'user', at: [0, 0] },
        { id: 'r', label: 'Retriever (top-k)', icon: 'service', at: [1, 0] },
        { id: 'db', label: 'Vector store', icon: 'datastore', at: [1, 1] },
        { id: 's', label: 'Stuff prompt', icon: 'service', at: [2, 0] },
        { id: 'm', label: 'Model answers', icon: 'model', at: [3, 0] }
      ],
      edges: [
        { from: 'u', to: 'r', label: 'always' },
        { from: 'db', to: 'r', label: 'top-k chunks' },
        { from: 'r', to: 's', label: '' },
        { from: 's', to: 'm', label: '' }
      ],
      caption: 'Retrieval happens on every turn regardless of whether the turn needs it. The model never gets a vote.'
    },
    {
      type: 'p',
      text: 'This is exactly what the documentation bot was doing. When a user asked \'how do I paginate the results endpoint,\' the pipeline shone. It found the pagination page, dropped it in, and the model wrote a clean answer grounded in the real docs. When the user replied \'thanks,\' the same machinery fired. It searched, it found the ten chunks that were vaguely closest to the word thanks, and it stuffed them in front of a model that only needed to say \'you are welcome.\''
    },
    {
      type: 'p',
      text: 'The strength here is that the behavior is boring in the good sense. You can predict the cost of every turn to the token. You can cache. You can trace a bad answer back to the chunks that caused it. The weakness is that the pipeline has no judgment. It cannot tell a real question from a pleasantry, and it cannot decide to fetch a second, different document when the first batch turned out to be off topic.'
    },
    {
      type: 'h2',
      text: 'Agentic context engineering: the model treats retrieval as an action'
    },
    {
      type: 'p',
      text: 'The other design flips the control. Instead of a program deciding to retrieve, you hand the model a set of tools and let it choose. Retrieval becomes one option among several, something the model can call the way it would call any function. The model reads the incoming message, thinks about whether it can answer from what it already knows, and only reaches for the docs when it decides they would help. This is the shape behind the ReAct pattern, where a model interleaves reasoning with actions, and behind what Anthropic describes as context engineering: treating the assembly of the window as something the agent manages on purpose.'
    },
    {
      type: 'terms',
      items: [
        { term: 'Manual RAG pipeline', def: 'A fixed program that retrieves top-k chunks and inserts them into the prompt on every turn. The retrieval policy lives in code, not in the model.' },
        { term: 'Agentic context engineering', def: 'A design where the model itself decides when to retrieve, what to fetch, which tool to call, and what to keep in the window. Context assembly becomes an action the model controls.' },
        { term: 'Top-k retrieval', def: 'Pulling the k most similar chunks to the query from a vector store. A larger k means more coverage and more tokens.' }
      ]
    },
    {
      type: 'p',
      text: 'The flow stops being a line and becomes a loop. The model looks at the situation, picks an action, sees the result, and looks again. It might answer immediately. It might retrieve once, read what came back, decide it needs a different document, and retrieve again. It might call a tool that has nothing to do with documents at all.'
    },
    {
      type: 'diagram',
      title: 'Agentic: a decision loop',
      nodes: [
        { id: 'u', label: 'User message', icon: 'user', at: [0, 1] },
        { id: 'm', label: 'Model decides', icon: 'model', at: [1, 1] },
        { id: 'r', label: 'Retrieve docs', icon: 'service', at: [2, 0] },
        { id: 't', label: 'Call a tool', icon: 'service', at: [2, 1] },
        { id: 'a', label: 'Answer user', icon: 'user', at: [2, 2] }
      ],
      edges: [
        { from: 'u', to: 'm', label: '' },
        { from: 'm', to: 'r', label: 'if docs help' },
        { from: 'm', to: 't', label: 'if action needed' },
        { from: 'm', to: 'a', label: 'if already known' },
        { from: 'r', to: 'm', label: 'read result, loop' },
        { from: 't', to: 'm', label: 'read result, loop' }
      ],
      caption: 'The model chooses each step. A trivial message goes straight to answer with no retrieval at all.'
    },
    {
      type: 'p',
      text: 'Here is a small version of the decision the model makes before it commits to retrieving. In the manual design this branch does not exist. In the agentic design it is the whole point.'
    },
    {
      type: 'code',
      lang: 'python',
      title: 'An agent loop that decides whether to retrieve',
      code: `def handle_turn(message, model, retriever):
    # Ask the model what to do before touching the vector store.
    plan = model.decide(
        message,
        tools=["retrieve_docs", "answer_directly"],
    )

    if plan.action == "answer_directly":
        # Pleasantries, follow-ups, thanks: no docs needed.
        return model.answer(message, context=[])

    if plan.action == "retrieve_docs":
        chunks = retriever.search(plan.query, k=5)
        answer = model.answer(message, context=chunks)
        # The model can loop again if the chunks missed.
        if answer.needs_more:
            extra = retriever.search(answer.follow_up_query, k=3)
            return model.answer(message, context=chunks + extra)
        return answer

    return model.answer(message, context=[])`
    },
    {
      type: 'p',
      text: 'When the docs team switched their assistant to something like this, the \'thanks\' problem disappeared on its own. The model saw a message with no real question in it and chose to answer directly, skipping the vector store entirely. Retrieval fired on the turns that earned it. The token bill for the trivial traffic dropped close to zero because those turns stopped carrying ten unnecessary chunks.'
    },
    {
      type: 'p',
      text: 'The gain went beyond cost. Because the model now controlled retrieval, it could handle a follow-up that the fixed pipeline always fumbled. A user asks about pagination, gets an answer, then asks \'what about sorting.\' In the manual pipeline that second turn re-runs the same search against the word sorting and hopes the sort docs rank high enough to make the top ten. In the agentic version the model already knows it is mid-conversation about the results endpoint, so it phrases a sharper query, pulls the sorting section, and connects it to what it just told the user. The context window ended up holding fewer chunks and more of the right ones. That is the quiet win: control over retrieval is also control over relevance.'
    },
    {
      type: 'h2',
      text: 'The tradeoff you are actually choosing between'
    },
    {
      type: 'p',
      text: 'Adaptivity is not free. The moment the model is deciding whether to retrieve, it can decide wrong. It can skip retrieval on a question that genuinely needed the docs and answer from memory, which is where confident, wrong answers come from. It can loop too many times and run up latency. Its choices are harder to predict, so your cost per turn now varies with the model\'s judgment instead of sitting at a fixed number. The manual pipeline never makes those mistakes because it never makes a choice.'
    },
    {
      type: 'ul',
      items: [
        'Manual RAG wins when queries are uniform and always need grounding: a search box over a knowledge base, a compliance tool that must cite a source every time, anything where predictable cost and easy tracing matter more than flexibility.',
        'Agentic context wins when traffic is mixed: a conversational assistant where some turns are questions and some are chatter, a coding agent that sometimes needs to read a file and sometimes already has what it needs, any workflow where retrieving on every turn is obvious waste.',
        'Many real systems land in the middle. You can keep a cheap gate that decides retrieve-or-not, then run a fixed, predictable retrieval when the answer is yes. That buys most of the savings without a fully open-ended loop.'
      ]
    },
    {
      type: 'callout',
      title: 'The most common mistake',
      text: 'Reaching for agentic control to fix a problem that was really about k being too large or chunks being too big. If your retrieval is bloated, a model deciding when to run bloated retrieval still runs bloated retrieval. Fix the pipeline\'s content first, then decide whether the turn-by-turn choice is worth the added unpredictability.'
    },
    {
      type: 'p',
      text: 'Two other traps show up often. The first is giving the model the choice but no way to loop, so it retrieves once, gets bad chunks, and answers from them anyway because it cannot ask for more. The second is the opposite: an open loop with no cap, so a stuck model retrieves five times chasing an answer that was never in the docs. A good agentic design gives the model both the freedom to fetch again and a hard limit on how many times.'
    },
    {
      type: 'h2',
      text: 'What to carry away'
    },
    {
      type: 'p',
      text: 'Manual RAG and agentic context are not competing products. They are two answers to one question: who decides what goes on the desk. In a manual pipeline the code decides, and it decides the same way every time, which gives you predictable cost and no judgment. In an agentic setup the model decides, which gives you judgment and the failure modes that come with it. The documentation bot did not need a smarter retriever to stop wasting money on \'thanks.\' It needed to move the decision from the pipeline to the model, so that a turn with no real question could take no real action. When you design your next system, ask which turns actually need documents before you wire retrieval to run on all of them. Start with the cheapest design that fits your traffic, measure where the tokens really go, and add model-driven control only where the fixed line is clearly wasting them. The goal is never agentic for its own sake. It is putting the right small stack of pages on the desk, and giving that decision to whichever party can make it best.'
    },
    {
      type: 'sources',
      items: [
        { title: 'Yao et al., ReAct: Synergizing Reasoning and Acting in Language Models (2022)', url: 'https://arxiv.org/abs/2210.03629' },
        { title: 'Anthropic, Effective context engineering for AI agents', url: 'https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents' },
        { title: 'Lewis et al., Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks (2020)', url: 'https://arxiv.org/abs/2005.11401' }
      ]
    }
  ]
};
