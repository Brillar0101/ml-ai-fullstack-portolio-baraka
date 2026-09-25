// Original AI Engineering series post. Rendered by src/pages/blog/SeriesPost.jsx;
// scheduled and given its sources in src/data/seriesPosts.js.
export const POST = {
  "id": "finetuning-or-rag",
  "title": "Finetuning or RAG: which one first",
  "excerpt": "Two ways to make a model fit your task, often confused. They solve different problems. Here is how to choose.",
  "category": "AI",
  "chapter": "Chapter 7",
  "tags": [
    "Finetuning",
    "RAG"
  ],
  "seriesNum": 12,
  "publishAt": "2026-02-18T12:00:00Z",
  "body": [
    {
      "type": "p",
      "text": "Picture a team building a support assistant for their product, where the first version is not good enough. In the same meeting, two people propose opposite fixes with equal confidence. One says \"we need to finetune a model on our data.\" The other says \"no, we just need RAG.\" They argue for an hour. The frustrating part is that neither has said what is actually wrong with the assistant, and without that, both are guessing. This argument happens on nearly every AI team, and it almost always comes from skipping one question."
    },
    {
      "type": "p",
      "text": "The question is: what kind of \"not good enough\" is this. Finetuning and RAG are not competitors. They fix different problems, and naming the problem first tells you which one you need."
    },
    {
      "type": "h2",
      "text": "The intuition: knowledge versus behavior"
    },
    {
      "type": "p",
      "text": "There are two very different reasons a model disappoints. One is a knowledge gap: it does not know something it needs to, like your refund policy or a fact from last week. The other is a behavior gap: it knows plenty, but it does not act the way you need, maybe it will not hold your exact output format, or its tone is wrong, or it is shaky at one narrow skill."
    },
    {
      "type": "p",
      "text": "These two gaps want opposite tools. A knowledge gap wants the facts put in front of the model at question time, which is **RAG**. A behavior gap wants the model taught the behavior by example, which is **finetuning**. Using one to fix the other is the classic waste of weeks."
    },
    {
      "type": "h2",
      "text": "Walk the support-bot example"
    },
    {
      "type": "p",
      "text": "Go back to the team. Suppose the assistant answers in a friendly, correct voice but keeps inventing policy details that do not match the real docs. That is a knowledge gap, and finetuning it on conversation transcripts would not fix it, because the facts it needs change over time and live in documents. RAG is the answer: retrieve the real policy and have it answer from that."
    },
    {
      "type": "p",
      "text": "Now suppose the opposite, the assistant has the facts right because you already feed it the docs, but it rambles for three paragraphs when you need two tight sentences in a fixed format, no matter how you word the prompt. That is a behavior gap. No amount of retrieval teaches concision. A light finetune on a few hundred examples of the exact style you want will. Same product, two failures, two different tools, and the only way to tell them apart was to name the gap."
    },
    {
      "type": "h2",
      "text": "Terms for the two paths"
    },
    {
      "type": "terms",
      "items": [
        {
          "term": "Finetuning",
          "def": "continuing to train a model on your examples so it adjusts its behavior, its format, tone, or a narrow skill."
        },
        {
          "term": "RAG",
          "def": "retrieving relevant text and putting it in the prompt so the model answers from it instead of from memory."
        },
        {
          "term": "PEFT",
          "def": "parameter-efficient finetuning, which updates a small set of weights instead of all of them, to save memory and cost."
        }
      ]
    },
    {
      "type": "h2",
      "text": "A simple decision order"
    },
    {
      "type": "ul",
      "items": [
        "**Start with prompting.** It is free and fast, and it closes the gap more often than people expect. Do not skip it.",
        "**If the gap is missing or changing knowledge, add RAG.** It is cheaper than finetuning and keeps working as the facts change.",
        "**If the gap is consistent behavior a prompt cannot pin down, finetune,** ideally with PEFT so it is cheap to train and maintain.",
        "**Reach for full finetuning last.** It is the most expensive to run, the slowest to update, and the easiest to get wrong."
      ]
    },
    {
      "type": "h2",
      "text": "Why people reach for finetuning too early"
    },
    {
      "type": "p",
      "text": "Finetuning sounds like the serious, real-engineering answer, so teams jump to it first, and it is usually the wrong first move. It is expensive to do well, it needs a clean dataset you probably do not have yet, and the moment your facts change you may have to do it again."
    },
    {
      "type": "p",
      "text": "Worse, it cannot fix a knowledge gap that keeps moving, which is the most common gap of all. RAG is cheaper, updates instantly when you change a document, and solves the problem most support bots actually have. So the instinct to finetune first is almost exactly backwards. Exhaust prompting, then RAG, and only finetune when the gap is a stubborn behavior that neither could touch."
    },
    {
      "type": "h2",
      "text": "The cost nobody mentions: maintenance"
    },
    {
      "type": "p",
      "text": "The training run is the small part of what finetuning costs you. Everything after it is the expensive part."
    },
    {
      "type": "p",
      "text": "A finetuned model is a frozen snapshot of the examples you trained it on, so the day your product, your policies, or your preferred style changes, the model is quietly out of date and you may have to gather fresh data and train again. You now own a model artifact, with its own versioning, evaluation, and serving, that has to be kept in step with a moving product. RAG carries almost none of this overhead: change a document and the very next answer reflects it. That ongoing maintenance burden, not the difficulty of training itself, is the real reason to treat finetuning as a last resort. A trained model is a thing you have to keep feeding."
    },
    {
      "type": "h2",
      "text": "They are not mutually exclusive"
    },
    {
      "type": "p",
      "text": "One last thing the either-or framing hides: you can use both, and serious systems often do. An assistant might be finetuned so it reliably holds the right format and tone, and use RAG so it answers from current, correct facts. Behavior from finetuning, knowledge from retrieval, each doing the job it is suited for. So the question is rarely \"which one\" forever. It is \"which one fixes the gap in front of me right now,\" and once you are mature enough to need both, you apply each to the specific problem it solves best."
    },
    {
      "type": "h2",
      "text": "Choosing your adaptation path"
    },
    {
      "type": "p",
      "text": "Name the gap before you pick the tool, and the hour-long argument disappears. Knowledge gaps want retrieval. Behavior gaps want finetuning. Most teams should exhaust prompting and RAG before they ever touch a weight, because those are cheaper, faster to change, and solve the problems most products actually have. The teams that struggle are the ones that picked a tool before they understood what was broken."
    }
  ]
};
