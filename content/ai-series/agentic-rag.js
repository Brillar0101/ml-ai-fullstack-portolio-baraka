export const POST = {
  id: 'agentic-rag',
  title: 'Agentic RAG: When Retrieval Becomes a Decision, Not a Fixed Step',
  excerpt: 'Classic RAG always grabs the top-k chunks and answers. Agentic RAG lets the model decide whether to search, how to reword the query, and whether the context is good enough before it commits to an answer.',
  category: 'AI',
  tags: ['RAG', 'Agents', 'Retrieval'],
  readTime: '8 min read',
  body: [
    {
      type: 'p',
      text: 'A support team shipped a help-desk bot backed by a vector database. It worked well for a week, then a customer sent this: "My export keeps failing and I also want to move my billing to the yearly plan, and does the yearly plan even support exports over 2GB?" The bot pulled the five closest chunks, wrote a confident paragraph about fixing failed exports, and never touched billing or the file-size limit. The customer got a third of an answer and opened a ticket anyway.'
    },
    {
      type: 'p',
      text: 'Nothing was broken in the usual sense. The embeddings were fine, the index was fresh, the model was capable. The problem was the shape of the pipeline. It retrieved once, for one blob of text, and answered once. A question with three parts needs more than one look, and a fixed pipeline has no way to notice that. This is the gap agentic RAG is built to close.'
    },
    {
      type: 'p',
      text: 'It helps to name the thing that failed. When you embed a three-part question as a single vector, you get one point in space that sits somewhere in the average of all three topics. The nearest chunks to that average point tend to cluster around whichever topic dominates the wording, which here was the failing export. Billing and the file-size cap were minority themes in the sentence, so their chunks sat farther from that averaged point and never made the top five. The retriever did its job perfectly and still returned the wrong material, because the question it was handed was not really one question.'
    },
    {
      type: 'h2',
      text: 'The intuition: stop treating retrieval as a reflex'
    },
    {
      type: 'p',
      text: 'Think about how a human specialist handles that same message. They read it, notice it is really three questions, and go look things up one piece at a time. If the first search turns up something vague, they rephrase and search again. If the docs clearly do not cover the file-size limit, they say so instead of inventing a number. Retrieval, for a person, is a series of small judgment calls, not a single automatic grab.'
    },
    {
      type: 'p',
      text: 'Classic RAG throws that judgment away. It bolts retrieval to the front of every request as a reflex: question comes in, fetch top-k, stuff it in the prompt, answer. That reflex is cheap and predictable, and for simple lookups it is genuinely hard to beat. It falls apart exactly when the question stops being simple. Agentic RAG hands the judgment back to the model. Retrieval becomes something the model chooses to do, chooses how to do, and chooses when to stop.'
    },
    {
      type: 'p',
      text: 'None of this requires a bigger model or a fancier index. It is a change in control flow. The same retriever and the same embeddings can serve both the reflexive pipeline and the agentic one. What differs is who holds the steering wheel. In classic RAG the surrounding code decides everything in advance. In agentic RAG the model gets to make a handful of decisions at request time, and each of those decisions can save an answer that the fixed path would have botched.'
    },
    {
      type: 'h2',
      text: 'Walking through the hard question, step by step'
    },
    {
      type: 'p',
      text: 'Take the messy support question again and run it through an agentic version. First the model looks at it and decides it cannot answer from memory, so retrieval is worth doing. Then it splits the message into parts: one about failing exports, one about switching to yearly billing, one about the 2GB limit on the yearly plan. It searches for the first part, reads the result, and asks itself a quiet question: does this chunk actually address a failing export? Yes. It moves on.'
    },
    {
      type: 'p',
      text: 'For the billing part, the first search comes back with a page about billing in general but nothing about switching plans. The model notices the mismatch, rewrites the query to "change subscription from monthly to yearly," and searches again. That second search lands on the right page. For the file-size question it searches the yearly-plan docs, finds no mention of a 2GB cap, and rather than guessing it flags that the docs are silent and suggests the customer confirm with sales. Three sub-answers, several searches, one honest note about a gap. That is the behavior the fixed pipeline could never produce.'
    },
    {
      type: 'p',
      text: 'Look at what each of those moves actually is. Deciding to retrieve at all is one decision. Splitting the message into parts is a second. Judging whether a returned chunk fits its sub-question is a third. Rewording a weak query is a fourth. Choosing to admit a gap instead of filling it with a guess is a fifth. Classic RAG makes exactly zero of these decisions at request time, because they were all frozen when the pipeline was wired up. The agentic version makes all five, and the quality of the final answer rides on getting them roughly right.'
    },
    {
      type: 'h2',
      text: 'The words that make this precise'
    },
    {
      type: 'terms',
      items: [
        { term: 'Agentic RAG', def: 'A retrieval setup where the model actively decides whether to retrieve, what to search for, how many times, and whether to trust what came back, instead of always running one fixed top-k fetch.' },
        { term: 'Query rewriting', def: 'Reformulating the user\'s wording into a search query that matches how the documents are written. It also covers splitting one multi-part question into several focused sub-queries.' },
        { term: 'Retrieval grading', def: 'A check, usually done by the model itself, that scores whether the retrieved chunks are actually relevant and sufficient before they are used to answer.' },
        { term: 'Self-reflection', def: 'The model inspecting its own progress: is this context good enough, did I cover every part of the question, should I search again or admit I do not have the answer.' }
      ]
    },
    {
      type: 'h2',
      text: 'The loop that drives it'
    },
    {
      type: 'p',
      text: 'The mechanism underneath agentic RAG is a small loop rather than a straight line. The model decides whether to retrieve. If it does, it may rewrite the query first. It grades what comes back. Based on that grade it either searches again with a better query, or moves on to answer. Everything routes through that grading step, which is what lets the system correct itself instead of running off the first result it happened to get.'
    },
    {
      type: 'p',
      text: 'The grading step is the heart of it, and it is worth being clear about what it does. After a search returns its chunks, the model reads them against the sub-question and answers a plain question of its own: is this enough to answer well. This is the self-reflection that separates agentic RAG from a pipeline that simply retrieves more times. A retry without grading is just noise. A retry driven by an honest grade is a correction. The Self-RAG work by Asai and colleagues formalized this idea, training a model to emit small reflection signals about whether to retrieve and whether the retrieved passage actually supports the answer, so the model learns to critique its own evidence rather than trust it blindly.'
    },
    {
      type: 'diagram',
      title: 'The agentic retrieval loop',
      nodes: [
        { id: 'user', label: 'User question', icon: 'user', at: [0, 1] },
        { id: 'decide', label: 'Decide: retrieve?', icon: 'model', at: [1, 1] },
        { id: 'rewrite', label: 'Rewrite / split query', icon: 'service', at: [2, 0] },
        { id: 'search', label: 'Search index', icon: 'datastore', at: [3, 0] },
        { id: 'grade', label: 'Grade context', icon: 'model', at: [2, 2] },
        { id: 'answer', label: 'Answer', icon: 'service', at: [4, 1] }
      ],
      edges: [
        { from: 'user', to: 'decide', label: 'ask' },
        { from: 'decide', to: 'rewrite', label: 'yes' },
        { from: 'decide', to: 'answer', label: 'no, answer directly' },
        { from: 'rewrite', to: 'search', label: 'query' },
        { from: 'search', to: 'grade', label: 'chunks' },
        { from: 'grade', to: 'rewrite', label: 'weak, retry' },
        { from: 'grade', to: 'answer', label: 'good enough' }
      ],
      caption: 'Retrieval, rewriting, and grading form a loop. The model can exit early, search once, or circle back several times before it answers.'
    },
    {
      type: 'p',
      text: 'In code the loop stays small. You retrieve, ask the model to grade the result, and either accept it or rewrite and try once more, with a hard cap on attempts so it can never spin forever. The sketch below shows the core of one sub-question passing through that cycle.'
    },
    {
      type: 'code',
      lang: 'python',
      title: 'A retrieve, grade, answer loop',
      code: `def answer_subquestion(question, retriever, llm, max_tries=3):
    query = question
    for attempt in range(max_tries):
        chunks = retriever.search(query, k=4)
        grade = llm.grade(
            question=question,
            context=chunks,
        )  # returns "good", "weak", or "missing"

        if grade == "good":
            return llm.answer(question, chunks)

        if grade == "missing":
            return "The docs do not cover this. Please confirm with support."

        # grade == "weak": reword and search again
        query = llm.rewrite_query(question, previous=query)

    # ran out of tries without solid context
    return llm.answer(question, chunks, caveat="low confidence")`
    },
    {
      type: 'h2',
      text: 'Where teams get burned'
    },
    {
      type: 'p',
      text: 'The freedom that makes agentic RAG smart is also what makes it easy to get wrong. A few mistakes show up again and again.'
    },
    {
      type: 'ul',
      items: [
        'No loop cap. Without a hard limit on attempts, a model that keeps grading its own context as "weak" will retrieve forever, burning tokens and latency on a query the docs simply cannot answer.',
        'A grader that is too generous. If the grading prompt waves through anything vaguely on-topic, you get the same missed answers as classic RAG, just after paying for extra calls.',
        'A grader that is too strict. The opposite failure: perfectly good chunks get rejected, the loop retries needlessly, and simple questions become slow and expensive.',
        'Rewrites that drift. Each reformulation should stay anchored to the original question. Left unchecked, the query wanders away from what the user actually asked.',
        'Reaching for it everywhere. Most questions are simple lookups. Running the full decide-grade-loop on all of them adds cost and delay with nothing to show for it.'
      ]
    },
    {
      type: 'callout',
      title: 'The real tradeoff',
      text: 'Agentic RAG buys accuracy on hard, multi-part, or ambiguous questions by spending more time and more model calls, and by opening new failure modes like retrieval loops. Classic RAG stays fast and predictable but cannot adapt. The honest design move is to route: send easy queries down the cheap fixed path and reserve the loop for the questions that actually need it.'
    },
    {
      type: 'p',
      text: 'A practical version of the support bot does exactly that. A quick first pass judges whether the message is a single clean question or a tangle of several. Clean questions take the one-shot path and answer in a fraction of a second. Tangled ones enter the loop, get split, and each part is retrieved and graded on its own. The team that shipped this saw their "half-answered" complaints drop sharply, and their latency stayed flat for the common case because most messages never entered the loop at all.'
    },
    {
      type: 'h2',
      text: 'What to hold onto'
    },
    {
      type: 'p',
      text: 'The shift here is small to describe and large in effect. Classic RAG treats retrieval as a fixed step glued to the front of every answer. Agentic RAG treats it as a decision the model keeps making: whether to search, how to phrase the search, whether the result is good enough, and when to admit the answer is not there. That extra judgment is not free, so use it where it pays off and skip it where it does not. If your users ask messy, multi-part questions and your bot keeps answering a slice of them, the fix is usually not a better embedding model. It is letting the model retrieve like a person would, one considered step at a time.'
    },
    {
      type: 'p',
      text: 'If you want to try it, start small. Keep your existing pipeline as the default and add one grading call after retrieval. When the grade comes back weak, allow a single rewrite and one more search, capped hard at two total attempts. Log how often the grade fires and how often the retry actually improves the answer. That one measurement tells you whether the extra calls are earning their keep on your traffic, and it keeps you honest about when the fixed path was fine all along.'
    },
    {
      type: 'sources',
      items: [
        { title: 'Asai et al., Self-RAG: Learning to Retrieve, Generate, and Critique through Self-Reflection (2023)', url: 'https://arxiv.org/abs/2310.11511' },
        { title: 'Lewis et al., Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks (2020)', url: 'https://arxiv.org/abs/2005.11401' }
      ]
    }
  ]
};
