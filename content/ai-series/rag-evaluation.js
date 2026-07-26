export const POST = {
  id: 'rag-evaluation',
  title: 'A Wrong RAG Answer Has Two Suspects: Score Retrieval and Generation Apart',
  excerpt: 'A team watched their answer quality drop and spent a week rewriting prompts. The prompts were fine. Their retriever had stopped finding the right pages, and a single end-to-end score could never have told them.',
  category: 'AI',
  tags: ['RAG', 'Evaluation', 'Metrics'],
  body: [
    {
      type: 'p',
      text: 'Picture an internal question-answering system over a company handbook. One week users start complaining that answers have gone vague and sometimes plain wrong. The team looks at their dashboard, which shows a single number: an overall answer-quality score judged by another model. That number has dropped sharply. So they do what the number seems to suggest. They rewrite the system prompt, add instructions to be more careful, try a few phrasings, run the whole thing again. The score barely moves, and most of a week is gone.',
    },
    { type: 'p', text: 'The real problem was somewhere else. A few weeks earlier someone had re-chunked the handbook and quietly changed the embedding model. The retriever was now handing the generator the wrong pages.' },
      { type: 'p', text: 'The generator was doing its job perfectly well, writing faithful answers from whatever context it received. The context was just bad. No amount of prompt tuning fixes that, and the one score they were watching was blind to the difference. This post is about why that blindness happens and how to fix it by scoring the two halves of a **RAG** system on their own.' },
    {
      type: 'h2',
      text: 'Why a single answer score cannot tell you which half broke'
    },
    {
      type: 'p',
      text: 'Retrieval-augmented generation has two moving parts wired in series. First a retriever takes the question and pulls a handful of passages from your knowledge base. Then a generator, the language model, reads those passages plus the question and writes an answer. When the final answer is wrong, the cause lives in one of those two parts. Either the retriever brought back the wrong passages, or it brought back the right passages and the generator ignored them, misread them, or made something up on top of them.'
    },
    { type: 'p', text: 'These are two completely different repairs. Bad retrieval means you work on chunking, embeddings, the number of passages you fetch, or your index. Bad generation means you work on the prompt, the model, or how you format the context.' },
      { type: 'p', text: 'A single score that only looks at the final answer collapses both failures into one number. When that number falls, it points at nothing. You are left guessing, and guessing is exactly how the handbook team burned their week on the wrong half.' },
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
    { type: 'p', text: 'The first is whether the right passage came back at all. If you ask about the parental leave policy and the leave page is nowhere in the top few results, retrieval has failed before the generator even wakes up. **Hit rate at k** measures this across your test questions: for what fraction of questions did at least one correct passage land in the top k results. The second angle is coverage.' },
      { type: 'p', text: 'Sometimes the answer needs two passages, say the base policy and an exception, and the retriever found only one. **Context recall** asks how much of the information the answer truly needs was actually retrieved. The third angle is cleanliness. If the retriever returns ten passages and only one is relevant, the generator has to wade through nine distractors. **Context precision** asks what fraction of the retrieved passages were actually relevant, and whether the relevant ones ranked near the top.' },
    {
      type: 'terms',
      items: [
        { term: 'Context precision', def: 'Of the passages the retriever returned, what fraction were actually relevant to the question, and did the relevant ones rank high. High precision means little noise in the context.' },
        { term: 'Context recall', def: 'Of the information the correct answer requires, what fraction was present in the retrieved passages. High recall means the generator was given everything it needed to answer.' },
        { term: 'Hit rate at k', def: 'The fraction of test questions for which at least one correct passage appears in the top k retrieved results. A blunt but useful check that retrieval is finding anything relevant at all.' }
      ]
    },
    { type: 'p', text: 'Precision and recall pull against each other. Fetch more passages and recall usually climbs while precision falls, because you drag in more junk along with the gold. That tradeoff is exactly why you want both numbers in front of you rather than a single blended figure.' },
      { type: 'p', text: 'In the handbook case, context recall was the number that had quietly collapsed. The re-chunking had split policies across boundaries so the retriever kept returning half of what each answer needed. Had they been watching recall, the week would have been a day.' },
    {
      type: 'h2',
      text: 'The generation side: did the model use what it got'
    },
    {
      type: 'p',
      text: 'Now assume retrieval did its job and the right context is sitting in front of the model. The generator can still ruin the answer in two ways, and each gets its own measure.'
    },
    { type: 'p', text: 'The first way is that the model writes something the context does not support. It fills a gap with its own memory, blends two passages into a claim neither one makes, or states a number that appears nowhere in the retrieved text. This is a grounding failure. **Faithfulness**, sometimes called groundedness, asks whether every claim in the answer can be traced back to the retrieved context.' },
      { type: 'p', text: 'An answer is faithful when a reader holding only those passages would agree that each statement follows from them. The second way is subtler. The model can write something perfectly grounded and true that simply does not answer the question. Ask about refund timelines and get a faithful paragraph about how to start a return. **Answer relevance** asks whether the answer actually addresses what was asked.' },
    {
      type: 'terms',
      items: [
        { term: 'Faithfulness (groundedness)', def: 'Whether every claim in the generated answer is supported by the retrieved context. A faithful answer invents nothing beyond what the passages say, even if the extra claim happens to be true in the world.' },
        { term: 'Answer relevance', def: 'Whether the answer actually addresses the question that was asked. An answer can be fully grounded in the context yet still miss the point of the question.' }
      ]
    },
    { type: 'p', text: 'Keeping these two apart matters because they fail independently. A model can be faithful but off-topic, or on-topic but unfaithful. If you fold them together you lose the ability to tell a hallucination problem from a focus problem, and those need different fixes.' },
      { type: 'p', text: 'Notice too that faithfulness is measured only against the retrieved context, never against the wider truth. That is deliberate. Faithfulness is the generator behaving well given its inputs. Whether those inputs were correct is the retriever\'s job, and you already measured that separately.' },
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
    { type: 'p', text: 'None of this works without something to judge against. You need a small labeled evaluation set, and building it is the part teams most often skip. Each item needs three things: the question, the ideal context (which passages should be retrieved), and a reference answer.' },
      { type: 'p', text: 'The ideal context lets you score retrieval. The reference answer anchors relevance. The question drives the whole pipeline. Fifty to a couple hundred carefully chosen items usually beats a vague set of thousands, because a judge is only as good as the ground truth behind it.' },
    { type: 'lab', height: 460,
        title: 'Context recall and faithfulness, on three broken systems',
        caption: 'The first two rows both look bad end to end and broke for opposite reasons. Recall under 100 percent means the fact never arrived, so no prompt change helps. Faithfulness under 100 percent means it arrived and the model went past it, so no retriever change helps.',
        code: `# Two stage-level numbers that say WHICH half of a RAG
# system broke. An end-to-end score drops and leaves
# you guessing; these point at the culprit.

def context_recall(needed, passages):
    """Did retrieval bring back the facts a correct answer
    requires?"""
    ctx = " ".join(passages).lower()
    found = [f for f in needed if f.lower() in ctx]
    return len(found) / len(needed)

def faithfulness(claims, passages, judge):
    """Of the claims the answer made, how many does the
    context support?"""
    ok = [c for c in claims if judge(c, passages)]
    return len(ok) / max(len(claims), 1)

def judge(claim, passages):
    # Stand-in for a judge model: a claim counts as supported
    # when its text appears in the context. A real judge
    # reads for meaning.
    return claim.lower() in " ".join(passages).lower()

NEEDED = ["15 working days", "within 6 months"]

FULL = ["Paternity leave is 15 working days.",
        "Paternity leave must be taken within 6 months."]
PARTIAL = ["Paternity leave must be taken within 6 months."]

CASES = [
    ("retrieval broke", PARTIAL,
     ["within 6 months", "15 working days"]),
    ("generation broke", FULL,
     ["15 working days", "within 6 months",
      "carries over to next year"]),
    ("both healthy", FULL,
     ["15 working days", "within 6 months"]),
]

# ---- Report --------------------------------------------
E = chr(27)
DIM, OFF, BOLD = E + "[2m", E + "[0m", E + "[1m"
OK, WARN, BAD = E + "[32m", E + "[33m", E + "[31m"
note = lambda s: print(DIM + s + OFF)

def pct(v):
    if v >= 0.99:
        colour = OK
    else:
        colour = BAD if v < 0.6 else WARN
    return colour, "%.0f%%" % (v * 100)

hdr = BOLD + "RAG HEALTH" + OFF
print(hdr + "  three ways a week goes wrong")
note("-" * 54)
note("%-17s %5s %6s %6s  %s"
     % ("CASE", "E2E", "RECALL", "FAITH", "LOOK AT"))

for name, passages, claims in CASES:
    r = context_recall(NEEDED, passages)
    f = faithfulness(claims, passages, judge)
    e2e = r * f            # what one blended score would show

    if r < 1.0:
        where, colour = "the retriever", BAD
    elif f < 1.0:
        where, colour = "the prompt", WARN
    else:
        where, colour = "nothing, healthy", OK

    ec, e_s = pct(e2e)
    rc, r_s = pct(r)
    fc, f_s = pct(f)
    print("%-17s %s%5s%s %s%6s%s %s%6s%s  %s%s%s"
          % (name, ec, e_s, OFF, rc, r_s, OFF,
             fc, f_s, OFF, colour, where, OFF))

note("-" * 54)
pt = BOLD + "THE POINT" + OFF
print(pt + "  the first two both score badly end")
print("           to end, and that column cannot tell")
print("           you they broke for opposite reasons")

print()
note("Recall under 100% means the fact never arrived,")
note("so no prompt change helps. Faithfulness under")
note("100% means it arrived and the model went past it,")
note("so no retriever change helps. One blended number")
note("hides both, and sends you to the wrong half.")

# Try it: add a needed fact nobody retrieved, and watch
# recall move while faithfulness stays exactly put.
` },
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
    { type: 'p', text: 'A RAG answer can be wrong because retrieval fed the model bad context, or because the model mishandled good context. Those are two different failures with two different repairs, and a single answer-quality score cannot tell them apart. So measure the halves on their own. On the retrieval side, track context precision, context recall, and hit rate at k so you know whether the right pages are coming back. On the generation side, track faithfulness against the retrieved context and answer relevance against the question, and let an LLM judge do the reading, backed by a small labeled set of question, ideal context, and reference answer.' },
      { type: 'p', text: 'The handbook team eventually added those component scores. The next time quality dipped, the recall number moved first and the prompt stayed untouched, and they fixed the real problem in an afternoon. That is the whole payoff: when something breaks, your metrics point straight at the half that broke instead of leaving you to guess.' },
    {
      type: 'sources',
      items: [
        { title: 'Es et al., RAGAS: Automated Evaluation of Retrieval Augmented Generation (2023)', url: 'https://arxiv.org/abs/2309.15217' },
        { title: 'Lewis et al., Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks (2020)', url: 'https://arxiv.org/abs/2005.11401' }
      ]
    }
  ]
};
