export const POST = {
  id: 'rag-evaluation',
  title: 'A Wrong RAG Answer Has Two Suspects: Score Retrieval and Generation Apart',
  excerpt: 'A team watched their answer quality drop and spent a week rewriting prompts. The prompts were fine. Their retriever had stopped finding the right pages, and a single end-to-end score could never have told them.',
  category: 'AI',
  tags: ['RAG', 'Evaluation', 'Metrics'],
  readTime: '8 min read',
  body: [
    {
      type: 'p',
      text: 'A team I talked to ran an internal question-answering system over their company handbook. One week their users started complaining that answers had gone vague and sometimes plain wrong. The team looked at their dashboard, which showed a single number: an overall answer-quality score judged by another model. That number had dropped from the high eighties into the sixties. So they did what the number seemed to suggest. They rewrote the system prompt, added instructions to be more careful, tried a few phrasings, ran the whole thing again. The score barely moved. They lost most of a week this way.'
    },
    {
      type: 'p',
      text: 'The real problem was somewhere else. A few weeks earlier someone had re-chunked the handbook and quietly changed the embedding model. The retriever was now handing the generator the wrong pages. The generator was doing its job perfectly well, writing faithful answers from whatever context it received. The context was just bad. No amount of prompt tuning fixes that, and the one score they were watching was blind to the difference. This post is about why that blindness happens and how to fix it by scoring the two halves of a **RAG** system on their own.'
    },
    {
      type: 'h2',
      text: 'Why a single answer score cannot tell you which half broke'
    },
    {
      type: 'p',
      text: 'Retrieval-augmented generation has two moving parts wired in series. First a retriever takes the question and pulls a handful of passages from your knowledge base. Then a generator, the language model, reads those passages plus the question and writes an answer. When the final answer is wrong, the cause lives in one of those two parts. Either the retriever brought back the wrong passages, or it brought back the right passages and the generator ignored them, misread them, or made something up on top of them.'
    },
    {
      type: 'p',
      text: 'These are two completely different repairs. Bad retrieval means you work on chunking, embeddings, the number of passages you fetch, or your index. Bad generation means you work on the prompt, the model, or how you format the context. A single score that only looks at the final answer collapses both failures into one number. When that number falls, it points at nothing. You are left guessing, and guessing is exactly how the handbook team burned their week on the wrong half.'
    },
    {
      type: 'p',
      text: 'The fix is to stop treating the answer as one thing to grade. Score the retriever by itself. Score the generator by itself. Then the dashboard has two numbers instead of one, and a drop lands on the guilty part instead of smearing across the whole pipeline.'
    },
    {
      type: 'diagram',
      title: 'Two scores, not one',
      nodes: [
        { id: 'q', label: 'Question', icon: 'user', at: [0, 1] },
        { id: 'r', label: 'Retriever', icon: 'service', at: [1, 1] },
        { id: 'db', label: 'Knowledge base', icon: 'datastore', at: [1, 2] },
        { id: 'g', label: 'Generator', icon: 'model', at: [2, 1] },
        { id: 'rs', label: 'Retrieval score', icon: 'service', at: [2, 0] },
        { id: 'gs', label: 'Generation score', icon: 'service', at: [3, 0] },
        { id: 'o', label: 'Overall view', icon: 'service', at: [3, 1] }
      ],
      edges: [
        { from: 'q', to: 'r', label: '' },
        { from: 'db', to: 'r', label: 'passages' },
        { from: 'r', to: 'g', label: 'context' },
        { from: 'r', to: 'rs', label: 'precision, recall' },
        { from: 'g', to: 'gs', label: 'faithfulness, relevance' },
        { from: 'rs', to: 'o', label: '' },
        { from: 'gs', to: 'o', label: '' }
      ],
      caption: 'The retrieval step and the generation step each feed their own score. The overall view is a combination, not a replacement, for the two component scores.'
    },
    {
      type: 'h2',
      text: 'The retrieval side: did we fetch the right pages'
    },
    {
      type: 'p',
      text: 'Start with the retriever, because that was the culprit in the handbook story. You want to know whether the passages it returned actually contain the information needed to answer the question. There are three angles worth measuring, and they answer slightly different questions.'
    },
    {
      type: 'p',
      text: 'The first is whether the right passage came back at all. If you ask about the parental leave policy and the leave page is nowhere in the top few results, retrieval has failed before the generator even wakes up. **Hit rate at k** measures this across your test questions: for what fraction of questions did at least one correct passage land in the top k results. The second angle is coverage. Sometimes the answer needs two passages, say the base policy and an exception, and the retriever found only one. **Context recall** asks how much of the information the answer truly needs was actually retrieved. The third angle is cleanliness. If the retriever returns ten passages and only one is relevant, the generator has to wade through nine distractors. **Context precision** asks what fraction of the retrieved passages were actually relevant, and whether the relevant ones ranked near the top.'
    },
    {
      type: 'terms',
      items: [
        { term: 'Context precision', def: 'Of the passages the retriever returned, what fraction were actually relevant to the question, and did the relevant ones rank high. High precision means little noise in the context.' },
        { term: 'Context recall', def: 'Of the information the correct answer requires, what fraction was present in the retrieved passages. High recall means the generator was given everything it needed to answer.' },
        { term: 'Hit rate at k', def: 'The fraction of test questions for which at least one correct passage appears in the top k retrieved results. A blunt but useful check that retrieval is finding anything relevant at all.' }
      ]
    },
    {
      type: 'p',
      text: 'Precision and recall pull against each other. Fetch more passages and recall usually climbs while precision falls, because you drag in more junk along with the gold. That tradeoff is exactly why you want both numbers in front of you rather than a single blended figure. In the handbook case, context recall was the number that had quietly collapsed. The re-chunking had split policies across boundaries so the retriever kept returning half of what each answer needed. Had they been watching recall, the week would have been a day.'
    },
    {
      type: 'h2',
      text: 'The generation side: did the model use what it got'
    },
    {
      type: 'p',
      text: 'Now assume retrieval did its job and the right context is sitting in front of the model. The generator can still ruin the answer in two ways, and each gets its own measure.'
    },
    {
      type: 'p',
      text: 'The first way is that the model writes something the context does not support. It fills a gap with its own memory, blends two passages into a claim neither one makes, or states a number that appears nowhere in the retrieved text. This is a grounding failure. **Faithfulness**, sometimes called groundedness, asks whether every claim in the answer can be traced back to the retrieved context. An answer is faithful when a reader holding only those passages would agree that each statement follows from them. The second way is subtler. The model can write something perfectly grounded and true that simply does not answer the question. Ask about refund timelines and get a faithful paragraph about how to start a return. **Answer relevance** asks whether the answer actually addresses what was asked.'
    },
    {
      type: 'terms',
      items: [
        { term: 'Faithfulness (groundedness)', def: 'Whether every claim in the generated answer is supported by the retrieved context. A faithful answer invents nothing beyond what the passages say, even if the extra claim happens to be true in the world.' },
        { term: 'Answer relevance', def: 'Whether the answer actually addresses the question that was asked. An answer can be fully grounded in the context yet still miss the point of the question.' }
      ]
    },
    {
      type: 'p',
      text: 'Keeping these two apart matters because they fail independently. A model can be faithful but off-topic, or on-topic but unfaithful. If you fold them together you lose the ability to tell a hallucination problem from a focus problem, and those need different fixes. Notice too that faithfulness is measured only against the retrieved context, never against the wider truth. That is deliberate. Faithfulness is the generator behaving well given its inputs. Whether those inputs were correct is the retriever\'s job, and you already measured that separately.'
    },
    {
      type: 'h2',
      text: 'How a model grades faithfulness and relevance'
    },
    {
      type: 'p',
      text: 'Retrieval metrics are mostly counting. You have a labeled set of questions with their correct passages, so you can compute precision and recall by comparing what came back to what should have. Generation metrics are harder, because judging whether a paragraph is supported by some context is a reading task, not a counting task. The common approach is LLM-as-judge: you give a separate model the answer and the context and ask it to rate them against a rubric.'
    },
    {
      type: 'p',
      text: 'For faithfulness a typical judge prompt first breaks the answer into individual claims, then checks each claim against the context and asks whether the passages support it. The faithfulness score becomes the fraction of claims that are supported. Splitting into claims matters because it turns a fuzzy holistic judgment into many small verifiable ones, which a model does far more reliably. For answer relevance the judge reads the question and the answer and rates how directly the answer speaks to the question, ignoring whether it is grounded. This is roughly the decomposition the RAGAS framework formalized, and it is worth reaching for a tested library before hand-rolling your own judge.'
    },
    {
      type: 'p',
      text: 'None of this works without something to judge against. You need a small labeled evaluation set, and building it is the part teams most often skip. Each item needs three things: the question, the ideal context (which passages should be retrieved), and a reference answer. The ideal context lets you score retrieval. The reference answer anchors relevance. The question drives the whole pipeline. Fifty to a couple hundred carefully chosen items usually beats a vague set of thousands, because a judge is only as good as the ground truth behind it.'
    },
    {
      type: 'code',
      lang: 'python',
      title: 'Context recall from labels, plus a faithfulness judge call',
      code: `def context_recall(needed_facts, retrieved_passages):
    # needed_facts: atomic facts the reference answer requires
    # retrieved_passages: text the retriever returned this turn
    context = " ".join(retrieved_passages).lower()
    found = [f for f in needed_facts if f.lower() in context]
    return len(found) / len(needed_facts)  # 1.0 = all needed facts present

def faithfulness(answer, retrieved_passages, judge):
    claims = judge.extract_claims(answer)  # split answer into atomic claims
    supported = 0
    for claim in claims:
        verdict = judge.ask(
            f"Context:\\n{retrieved_passages}\\n\\n"
            f"Claim: {claim}\\n"
            "Is this claim supported by the context? Answer yes or no."
        )
        if verdict.strip().lower().startswith("yes"):
            supported += 1
    return supported / max(len(claims), 1)  # fraction of grounded claims`
    },
    {
      type: 'p',
      text: 'The recall function here uses simple substring matching to stay readable; in practice you would match facts semantically rather than by exact text. The shape is what matters. Retrieval scoring compares against known labels, while faithfulness scoring hands the reading work to a judge model and counts how many claims survive.'
    },
    {
      type: 'h2',
      text: 'The mistakes that make these numbers lie'
    },
    {
      type: 'p',
      text: 'The biggest mistake is the one the handbook team made: watching only the end-to-end score and tuning whatever is easiest to reach, usually the prompt. When the score drops, resist the reflex to edit the prompt until you have looked at the retrieval numbers. If recall fell, the prompt was never the problem.'
    },
    {
      type: 'ul',
      items: [
        'Judging faithfulness against world truth instead of the retrieved context. A grounded answer that repeats a wrong passage is faithful and should score as faithful. Mixing in outside knowledge turns your grounding metric into a fact-checker and hides retrieval failures.',
        'Skipping the labeled set and asking a judge to score answers with no reference. Without ideal context you cannot score retrieval at all, and relevance judgments drift without an anchor.',
        'Reporting one blended generation number. Faithfulness and relevance fail for different reasons and need different fixes, so averaging them back into a single figure throws away the signal you just worked to separate.',
        'Trusting the judge blindly. Spot-check the judge against a few human ratings. If the model and a person disagree often, your rubric is vague or the task is too big per call.'
      ]
    },
    {
      type: 'callout',
      title: 'Read the two scores together',
      text: 'A drop in retrieval recall with steady faithfulness means fix the retriever. Steady recall with falling faithfulness means the model is drifting from good context, so look at the prompt or the model. High faithfulness with low answer relevance means the model is grounded but answering the wrong question. Each pair of readings points at a different half of the system.'
    },
    {
      type: 'h2',
      text: 'What to carry away'
    },
    {
      type: 'p',
      text: 'A RAG answer can be wrong because retrieval fed the model bad context, or because the model mishandled good context. Those are two different failures with two different repairs, and a single answer-quality score cannot tell them apart. So measure the halves on their own. On the retrieval side, track context precision, context recall, and hit rate at k so you know whether the right pages are coming back. On the generation side, track faithfulness against the retrieved context and answer relevance against the question, and let an LLM judge do the reading, backed by a small labeled set of question, ideal context, and reference answer. The handbook team eventually added those component scores. The next time quality dipped, the recall number moved first and the prompt stayed untouched, and they fixed the real problem in an afternoon. That is the whole payoff: when something breaks, your metrics point straight at the half that broke instead of leaving you to guess.'
    },
    {
      type: 'sources',
      items: [
        { title: 'Es et al., RAGAS: Automated Evaluation of Retrieval Augmented Generation (2023)', url: 'https://arxiv.org/abs/2309.15217' },
        { title: 'Lewis et al., Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks (2020)', url: 'https://arxiv.org/abs/2005.11401' }
      ]
    }
  ]
};
