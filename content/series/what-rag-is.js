// Original AI Engineering series post. Rendered by src/pages/blog/SeriesPost.jsx;
// scheduled and given its sources in src/data/seriesPosts.js.
export const POST = {
  "id": "what-rag-is",
  "title": "What RAG is and when you actually need it",
  "excerpt": "Retrieval-augmented generation in plain terms: give the model the right pages before it answers. Why it works and when to skip it.",
  "category": "AI",
  "chapter": "Chapter 6",
  "tags": [
    "RAG",
    "Retrieval"
  ],
  "seriesNum": 10,
  "publishAt": "2026-02-04T12:00:00Z",
  "body": [
    {
      "type": "p",
      "text": "In 2023 a New York lawyer used ChatGPT to research a personal injury case. It handed him a tidy list of supporting decisions, complete with names, courts, and quotes. He put them in a brief and filed it. The problem was that several of the cases did not exist."
    },
    {
      "type": "p",
      "text": "The model had invented them. The court noticed, the opposing side could not find the cases either, and the lawyer ended up sanctioned and publicly embarrassed. The model was never connected to a single real law book. It was answering from memory."
    },
    {
      "type": "p",
      "text": "That story is the best argument for RAG there is. The fix was never a smarter model. The fix was to stop asking the model to recall and start handing it the real documents."
    },
    {
      "type": "h2",
      "text": "An open-book exam"
    },
    {
      "type": "p",
      "text": "A model knows two things: what it absorbed during training, in a fuzzy way with no sources attached, and whatever you put in the prompt right now. Ask it about your company's refund policy or a case from last week and it has neither, so it does what it always does and produces something that sounds right. RAG turns the closed-book exam into an open-book one. Before the model answers, you go find the few passages most likely to hold the answer and paste them into the prompt. Now it is reading, not guessing."
    },
    {
      "type": "h2",
      "text": "Following one question through"
    },
    {
      "type": "p",
      "text": "Redo the lawyer's task the RAG way. The question comes in: \"find precedent for X.\" First you search an actual legal database and pull the five most relevant real opinions. You paste those into the prompt and instruct the model to answer using only them, and to say so when they do not cover the question."
    },
    {
      "type": "p",
      "text": "Now the model cannot invent \"Varghese v. China Southern,\" because it is working from text in front of it rather than a shape in its memory. The same move turns a support bot that bluffs about your product into one that quotes your real docs."
    },
    {
      "type": "h2",
      "text": "The parts of a retrieval system"
    },
    {
      "type": "terms",
      "items": [
        {
          "term": "Retrieval",
          "def": "finding the passages most relevant to a question, usually by comparing meaning with embeddings."
        },
        {
          "term": "Embedding",
          "def": "a list of numbers that captures the meaning of text, so similar meanings sit close together and can be matched."
        },
        {
          "term": "RAG",
          "def": "retrieval-augmented generation: retrieve relevant context first, then generate an answer grounded in it."
        }
      ]
    },
    {
      "type": "h2",
      "text": "How the retrieval part actually works"
    },
    {
      "type": "p",
      "text": "The \"find the relevant passages\" step is the engine, and it runs on meaning, not keywords. Every chunk of your documents is converted into an **embedding**, a list of numbers that captures what the text is about, placed so that passages with similar meaning sit close together. Your question gets the same treatment."
    },
    {
      "type": "p",
      "text": "Then the system measures which chunk embeddings are closest to the question embedding, usually with **cosine similarity**, and pulls the top few. That is why RAG can answer a question phrased completely differently from the source text: it is matching meaning, not exact words. The retrieved chunks get pasted into the prompt, and the model answers from them."
    },
    {
      "type": "h2",
      "text": "A second case, the support bot"
    },
    {
      "type": "p",
      "text": "The lawyer story is the dramatic version. The everyday version is a support bot. Without RAG, you ask it \"how do I cancel my plan,\" and it answers from a vague memory of how cancellation usually works on the internet, which may not match your product at all."
    },
    {
      "type": "p",
      "text": "With RAG, the question first retrieves the two passages from your actual help docs that mention cancellation, and the model answers from those. Same model, completely different reliability, because one is recalling and the other is reading your real policy. This is the single most common use of RAG in production, and it is the same mechanism as the legal example scaled down to a help center."
    },
    {
      "type": "h2",
      "text": "Where RAG breaks"
    },
    {
      "type": "p",
      "text": "RAG is not magic, and it fails in specific, fixable ways worth knowing. If your documents are chopped into bad chunks, the right answer can be split across two pieces and never retrieved cleanly. If retrieval pulls the wrong passages, the model is now grounded in irrelevant text and will answer confidently from the wrong source. And even with the right passage in the prompt, the model can occasionally ignore it and fall back on memory. So a real RAG system is not just \"add retrieval and relax.\" It needs good chunking, retrieval you actually measure, and an instruction to answer only from the provided text and to admit when the answer is not there."
    },
    {
      "type": "h2",
      "text": "It also solves the staleness problem"
    },
    {
      "type": "p",
      "text": "There is a second reason RAG matters, beyond private documents: time. A model only knows the world up to when its training data was collected, so it cannot tell you about an event from last week or a price that changed yesterday. Retraining a model to add recent facts is absurdly expensive and slow. Retrieval sidesteps it entirely. You keep your documents current, and at question time the model reads the up-to-date version."
    },
    {
      "type": "p",
      "text": "The model itself can be a year old and still answer about today, because the freshness lives in the documents you retrieve, not in the model. That is why RAG is the standard way to give a fixed, frozen model access to a world that keeps moving."
    },
    {
      "type": "h2",
      "text": "When to use it, and when not to"
    },
    {
      "type": "p",
      "text": "Reach for RAG when the answer must come from a specific, changing, or private body of text: your docs, a knowledge base, recent events, legal cases. Skip it when the task is reasoning or style rather than recall. Pasting in documents does not make a model think better, only know more. RAG fixes \"the model does not know this.\" It does not fix \"the model cannot reason about this,\" and confusing those two is how teams bolt retrieval onto a problem it was never going to solve."
    },
    {
      "type": "h2",
      "text": "When to reach for retrieval"
    },
    {
      "type": "p",
      "text": "RAG is grounding, not intelligence, and it is the cheapest reliable way to make a model speak accurately about facts it never trained on. The lawyer did not need a genius model. He needed the one thing RAG provides: the real pages, in front of the model, before it answers. Get the retrieval right, instruct the model to stick to what it retrieved, and you turn a confident guesser into something that can be trusted to cite your own sources."
    }
  ]
};
