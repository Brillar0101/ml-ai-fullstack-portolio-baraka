// Original AI Engineering series post. Rendered by src/pages/blog/SeriesPost.jsx;
// scheduled and given its sources in src/data/seriesPosts.js.
export const POST = {
  "id": "sft-vs-preference",
  "title": "Supervised vs preference finetuning",
  "excerpt": "The two post-training steps that turn a raw model into an assistant, and what each one fixes.",
  "category": "AI",
  "chapter": "Chapter 2",
  "tags": [
    "Post-training",
    "RLHF"
  ],
  "seriesNum": 20,
  "publishAt": "2026-04-15T12:00:00Z",
  "body": [
    {
      "type": "p",
      "text": "Here is a fact that surprises people the first time they hear it: the raw model that comes out of pretraining, the expensive part that read most of the internet, is not the helpful assistant you talk to. If you handed it your question directly, it might continue your sentence, or reply with three more questions, or drift into something unrelated, because all it learned to do was predict plausible text. Turning that powerful but aimless text predictor into something that answers you helpfully takes two more training steps after pretraining, and they fix two genuinely different problems. Knowing which step does what demystifies a lot of model behavior."
    },
    {
      "type": "h2",
      "text": "The intuition: shape, then taste"
    },
    {
      "type": "p",
      "text": "Think of it as teaching shape first, then taste. The first step, supervised finetuning, shows the model many examples of good question-and-answer pairs and has it imitate them. This teaches the shape of being helpful: when you get a question, you answer it, you follow the requested format, and you stop when you are done rather than rambling."
    },
    {
      "type": "p",
      "text": "The second step is subtler. You show the model pairs of possible answers along with which one people preferred, and you nudge it toward the kind people liked. The first step teaches it what a good answer looks like in form. The second teaches it what people actually value, which is harder to write down as examples."
    },
    {
      "type": "h2",
      "text": "Walk why the second step is needed"
    },
    {
      "type": "p",
      "text": "You might ask why imitation alone is not enough. Picture a model that has only had the first step. It answers questions in the right shape, but it tends to do things people quietly dislike: it states a shaky guess with the same confidence as a fact, or it writes a wall of text when a sentence would do, or it is needlessly hedging. None of those are format errors, so more example answers do not reliably fix them, because the problem is preference, not shape."
    },
    {
      "type": "p",
      "text": "The second step targets exactly this. By learning from \"people preferred answer A over answer B,\" the model picks up the softer qualities, admitting uncertainty, matching the right level of detail, being appropriately direct, that are easy to recognize and hard to specify. That is why the two steps are not redundant. One gives the model the form of a good answer, the other its judgment."
    },
    {
      "type": "h2",
      "text": "The training stages, named"
    },
    {
      "type": "terms",
      "items": [
        {
          "term": "Supervised finetuning",
          "def": "training on example prompt-and-answer pairs so the model imitates good responses. This teaches the shape of being helpful."
        },
        {
          "term": "Preference finetuning",
          "def": "nudging the model toward answers people rated higher, often called preference tuning or RLHF. This teaches taste."
        },
        {
          "term": "Pretraining",
          "def": "the earlier, expensive stage that produces the raw text predictor these two steps then refine."
        }
      ]
    },
    {
      "type": "h2",
      "text": "Why this matters to you"
    },
    {
      "type": "p",
      "text": "Even if you never run either step yourself, the distinction explains the models you use. When a model follows your format and answers on topic, that is the supervised step showing through. When it gracefully says \"I am not sure\" or matches the tone you wanted, that is preference tuning."
    },
    {
      "type": "p",
      "text": "And it explains a real limit: these steps shape behavior, not knowledge, so they cannot teach the model facts it never learned in pretraining. That is the gap retrieval fills. Behavior comes from these two passes, knowledge comes from pretraining and retrieval, and keeping those straight tells you which tool to reach for when a model disappoints."
    },
    {
      "type": "h2",
      "text": "Where the preferences come from"
    },
    {
      "type": "p",
      "text": "It is worth knowing where \"people preferred answer A\" actually comes from, because it explains both the power and the cost of the second step. Humans, or sometimes other models acting as stand-ins for humans, are shown pairs of responses and asked which is better, over and over, building up a large pile of preference judgments. This is the human feedback in the term RLHF, reinforcement learning from human feedback, that you will see attached to this stage."
    },
    {
      "type": "p",
      "text": "The model is then trained to produce the kind of answer those judges tended to pick. So the \"taste\" the model develops is not abstract. It is a compressed average of a lot of real people's opinions about what a good answer looks like, collected deliberately and at considerable expense."
    },
    {
      "type": "h2",
      "text": "Who actually does this, and what it costs"
    },
    {
      "type": "p",
      "text": "For nearly everyone building applications, these two steps are not something you run, they are something you consume. The large labs that make foundation models do the supervised and preference tuning themselves, because both require serious data, infrastructure, and money, and they ship the result as the chat or instruct version of a model. When you call that version through an API, you are using a model that has already been through both passes. This is why the distinction is mostly for understanding rather than doing: it tells you why the model behaves the way it does, even though you will rarely perform these steps yourself."
    },
    {
      "type": "h2",
      "text": "When taste training goes wrong"
    },
    {
      "type": "p",
      "text": "Preference tuning is powerful, and it has a well-known failure mode worth naming. Because the model learns to produce answers people rate highly, it can drift toward whatever raters tend to reward, even when that is not actually better. The common symptoms are a model that is too eager to agree, that flatters the user, or that pads short answers into long confident ones because length and confidence read as \"thorough.\" This is sometimes called sycophancy, and it is a direct consequence of optimizing for preference: if people reward agreeable, polished answers, the model becomes agreeable and polished, sometimes at the expense of being correct or direct. It is a reminder that \"what people preferred\" and \"what is true or useful\" are not always the same thing, and tuning hard for the first can quietly erode the second."
    },
    {
      "type": "h2",
      "text": "Two stages, two jobs"
    },
    {
      "type": "p",
      "text": "The assistant you talk to is a raw model plus these two passes: supervised finetuning for the shape of a good answer, preference tuning for the taste of one. When a model feels helpful and well-mannered, that behavior was trained in on purpose, after the heavy pretraining was done. It did not come for free, it is mostly done by the labs and handed to you in the chat version of a model, and when a model feels a little too agreeable, that is the taste step showing its seams. Either way, it is the difference between a powerful text predictor and something you can actually have a conversation with."
    }
  ]
};
