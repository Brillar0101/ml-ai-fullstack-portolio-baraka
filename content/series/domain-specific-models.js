// Original AI Engineering series post. Rendered by src/pages/blog/SeriesPost.jsx;
// scheduled and given its sources in src/data/seriesPosts.js.
export const POST = {
  "id": "domain-specific-models",
  "title": "When a general model is not enough for your field",
  "excerpt": "A general model is a generalist. For medicine, law, or finance, a model trained on that field can read the jargon a general one only guesses at.",
  "category": "AI",
  "tags": [
    "Domain models",
    "Finetuning",
    "Reliability"
  ],
  "seriesNum": 33,
  "publishAt": "2026-06-28T12:00:00Z",
  "body": [
    {
      "type": "p",
      "text": "Suppose a clinic tries a general assistant to turn doctors' shorthand notes into clean patient summaries. It works until a nurse reviews one and catches it: the note said \"the patient is on MS,\" meaning morphine sulfate on that ward, and the model cheerfully wrote a paragraph about multiple sclerosis. Nobody was harmed, this time, because a human read it. But it exposed the real problem. The model is fluent, confident, and wrong in a way that only someone who knows the field would catch, and that is exactly the situation where a general model quietly fails you."
    },
    {
      "type": "p",
      "text": "The instinct after a scare like that is to call the model broken, but it is doing precisely what a generalist does. It read a vast, broad slice of the internet and learned a little about almost everything. In a specialized field with its own vocabulary, its own abbreviations, and its own conventions, \"a little about everything\" is not the same as \"enough about this.\" That gap is the whole reason **domain-specific models** exist."
    },
    {
      "type": "h2",
      "text": "Generalist versus specialist"
    },
    {
      "type": "p",
      "text": "Think of the difference between a smart, well-read friend and a working specialist. Your friend can hold a conversation about medicine, law, or finance and sound reasonable, because they have picked things up over the years. But you would not hand them a patient chart, a contract, or a regulatory filing and act on what they say without checking. A **general model**, sometimes called a foundation model, is the well-read friend. A domain-specific model is one that has been trained, or further trained, on a large body of text from one field, so it has actually lived in that vocabulary rather than glimpsing it in passing."
    },
    {
      "type": "p",
      "text": "The reason this matters comes straight from how models learn. A model is good at what it saw a lot of. A general model saw enormous amounts of ordinary web text and comparatively little dense, specialized material, so its grasp of any one specialty is thin."
    },
    {
      "type": "p",
      "text": "When it meets a rare term or an in-field abbreviation, it does what it always does: it produces the most statistically plausible continuation. In everyday writing that guess is usually fine. In a specialty, the plausible guess and the correct answer are often two different things, and the model has no way to tell you which one it gave you."
    },
    {
      "type": "h2",
      "text": "Walk the failure"
    },
    {
      "type": "p",
      "text": "The \"MS\" mistake is a clean example because it shows the mechanism. In general English text, \"MS\" most often expands to multiple sclerosis, so that is the continuation the model reaches for. On a hospital ward, the same two letters mean morphine sulfate, and a model trained on clinical notes would have seen that usage thousands of times and read it correctly. Same input, opposite answer, and the difference is entirely about which body of text the model learned from. Multiply that by every abbreviation, every term of art, and every convention in a field, and you can see why fluency in general English does not transfer to competence in a specialty."
    },
    {
      "type": "h2",
      "text": "The specialist's glossary"
    },
    {
      "type": "terms",
      "items": [
        {
          "term": "General (foundation) model",
          "def": "a model trained broadly on general text. Capable across many topics, shallow in any single specialty."
        },
        {
          "term": "Domain-specific model",
          "def": "a model trained, or further trained, on text from one field such as medicine, law, or finance, so it knows that field's vocabulary and conventions."
        },
        {
          "term": "Continued pretraining",
          "def": "taking an existing model and training it further on a large pile of in-domain text, a common way to make a specialist."
        },
        {
          "term": "Jargon",
          "def": "the specialized vocabulary of a field, including abbreviations whose meaning flips depending on context."
        }
      ]
    },
    {
      "type": "h2",
      "text": "When a general model is actually fine"
    },
    {
      "type": "p",
      "text": "Here is the part people skip in their excitement to build something specialized: most of the time, a general model is enough, and reaching for a specialist is over-engineering. Drafting an email, summarizing a meeting, writing ordinary code, answering common questions, all of this sits comfortably in the broad middle that a general model handles well. You only need a specialist when your task lives in the dense, jargon-heavy corner of a field where a wrong-but-plausible answer carries real cost. Building or buying a domain model for a problem a general one already solves is effort and money spent to make almost no difference."
    },
    {
      "type": "h2",
      "text": "How to tell which case you are in"
    },
    {
      "type": "p",
      "text": "The honest way to decide is not to argue about it, it is to measure. Take a set of real tasks from your field, including the gnarly ones with the abbreviations and edge cases, and run them through a general model. Grade the answers with someone who actually knows the field. If it handles them well, you are done, and you just saved yourself a large project. If it confidently flubs the in-field cases the way the clinic's model did, you have your evidence that the broad knowledge is not deep enough, and now you can justify the cost of going specialist."
    },
    {
      "type": "p",
      "text": "And going specialist is a ladder, not a single jump. The cheapest rung is to feed the model the right reference material at question time, so a retrieval system pulls in the relevant policy or definition and the general model reads it on the spot. The next rung is to finetune a general model on examples from your field so it picks up the patterns. Above that sits using or commissioning a model that was continued-pretrained on a large body of domain text. Training a specialist from scratch is the top rung and almost never the right one, because it is enormously expensive and the rungs below it solve most problems for a fraction of the cost."
    },
    {
      "type": "p",
      "text": "The clinic did not need to train a medical model from nothing. They moved one rung up the ladder, kept a human reviewing anything clinical, and stopped treating general fluency as if it were domain expertise. That is the real takeaway. A general model knowing a little about your field is not the same as it knowing your field, and the only reliable way to learn which one you have is to test it on the hard cases before you trust it with the easy-looking ones."
    }
  ]
};
