// Original AI Engineering series post. Rendered by src/pages/blog/SeriesPost.jsx;
// scheduled and given its sources in src/data/seriesPosts.js.
export const POST = {
  "id": "foundation-models-explained",
  "title": "Foundation models, in one sitting",
  "excerpt": "What a foundation model actually is, with real examples, and why one model can power wildly different apps.",
  "category": "AI",
  "chapter": "Chapter 2",
  "tags": [
    "Foundation Models",
    "Pretraining",
    "Post-training"
  ],
  "seriesNum": 5,
  "publishAt": "2025-12-31T12:00:00Z",
  "body": [
    {
      "type": "p",
      "text": "Picture a small team shipping three features in a month. A support bot that answers from their help docs. An assistant that drafts marketing copy."
    },
    {
      "type": "p",
      "text": "A tool that explains confusing error messages to junior developers. A few years ago that would have been three separate machine learning projects: three datasets, three trained models, three teams. Today all three are the same model underneath, handed three different prompts. That reuse is the entire idea behind the word \"foundation.\""
    },
    {
      "type": "h2",
      "text": "So what is a foundation model"
    },
    {
      "type": "p",
      "text": "A foundation model is one large, general model, trained once on a huge amount of data, that can then be adapted to many different tasks without being retrained. The name is borrowed from building: it is the base you put many different things on top of. You have almost certainly used several."
    },
    {
      "type": "p",
      "text": "The model behind ChatGPT is one. So is Claude, so is Google's Gemini, and so are Meta's open Llama models that anyone can download. They are not only about text, either. Stable Diffusion is a foundation model for images, Whisper turns speech into text, and newer models like GPT-4o take in text, images, and audio at once."
    },
    {
      "type": "p",
      "text": "Two distinctions are worth holding from the start. Some of these models are closed and reached only through an API, like GPT-4, Claude, and Gemini. Others are open weights you can download and run yourself, like Llama and Mistral."
    },
    {
      "type": "p",
      "text": "They also span a huge size range, from models small enough to run on a laptop to ones that need a rack of expensive chips. The \"right\" foundation model is rarely the biggest one. It is the smallest that clears your quality bar, because everything downstream, cost and speed, gets easier the smaller you go."
    },
    {
      "type": "h2",
      "text": "One guessing game, played at scale"
    },
    {
      "type": "p",
      "text": "These models are not magic, and one simple idea explains where their generality comes from. Take an enormous pile of text and train the model to predict the next piece of it, over and over, billions of times. To get good at that guessing game, it is forced to absorb grammar, facts, writing styles, code, and a rough sense of how ideas connect. Nobody programs those in."
    },
    {
      "type": "p",
      "text": "They fall out of the prediction objective once the data and compute are large enough. That single goal, run at staggering scale, is what produces a model general enough to be a foundation."
    },
    {
      "type": "h2",
      "text": "Three features, one model"
    },
    {
      "type": "p",
      "text": "Go back to the team's three features. The support bot calls the model with a prompt that says \"answer using these help-doc passages.\" The code tool calls the same model with \"explain this Python error to a beginner.\" Same weights, same model, different instructions and context. One expensive training run was done once by a large lab, and everyone else adapts the result cheaply with prompts, retrieval, or light finetuning. Web developers build on databases they did not write. AI engineers build on foundation models they did not train."
    },
    {
      "type": "h2",
      "text": "The vocabulary you just earned"
    },
    {
      "type": "terms",
      "items": [
        {
          "term": "Foundation model",
          "def": "a large general model trained once and adapted to many tasks. Text ones are called LLMs; ones that also handle images or audio are LMMs."
        },
        {
          "term": "Pretraining",
          "def": "the first and most expensive stage, where the model learns to predict the next token on a massive general corpus."
        },
        {
          "term": "Post-training",
          "def": "later, cheaper stages that make a raw model helpful and safe, mainly supervised finetuning and preference tuning."
        },
        {
          "term": "Token",
          "def": "the unit a model reads and writes, roughly a word or word-piece."
        }
      ]
    },
    {
      "type": "h2",
      "text": "Why the raw model is not enough"
    },
    {
      "type": "p",
      "text": "A freshly pretrained model is a strong autocomplete, not an assistant. Ask it a question and it might continue with more questions, because completing text is all it learned to do. Post-training fixes that."
    },
    {
      "type": "p",
      "text": "Supervised finetuning shows it examples of good answers so it learns the shape of being helpful. Preference tuning then nudges it toward the responses people actually preferred. The model you chat with, like GPT-4 or Claude, is the pretrained base plus this polish."
    },
    {
      "type": "h2",
      "text": "Why this changed who gets to build"
    },
    {
      "type": "p",
      "text": "The shift is about who is allowed to play, not just about the technology. When every AI feature meant training your own model, you needed a labeled dataset, machine learning expertise, and a real compute budget, so only well-resourced teams could ship. Foundation models pushed that cost onto a handful of large labs and left everyone else with cheap **adaptation**."
    },
    {
      "type": "p",
      "text": "A solo developer can now stand up a genuinely useful AI feature in an afternoon by calling a model and writing a careful prompt. That is why AI products went from rare to everywhere almost overnight once these models arrived. The hard, expensive part had already been done and shared."
    },
    {
      "type": "h2",
      "text": "Where people get this wrong"
    },
    {
      "type": "p",
      "text": "Three confusions are worth heading off early, because each one costs teams real time and money. The first is believing you need to train your own model to do anything serious. For the large majority of products you do not, and the teams that try usually spend months rebuilding a worse version of something they could have rented through an API in a day. The second is assuming bigger is always better."
    },
    {
      "type": "p",
      "text": "A giant model is slower and far more expensive to run, and a smaller one, sometimes lightly finetuned or paired with retrieval, often clears the very same quality bar for a fraction of the cost and latency. The third, and the most dangerous in production, is treating the model as a reliable database of facts. It is not. It absorbed a fuzzy gist of its training data with no sources attached, which is precisely why grounding and evaluation, both covered later in this series, exist at all."
    },
    {
      "type": "p",
      "text": "Notice that all three mistakes come from the same root: forgetting that the model is a shared, general base you adapt, not a custom, all-knowing system you own. The foundation in foundation model is doing real work in that sentence. You are standing on it, not building it, and the engineering is in how well you adapt and check what stands on top."
    },
    {
      "type": "h2",
      "text": "Build on the base, do not rebuild it"
    },
    {
      "type": "p",
      "text": "A foundation model is one general base, GPT-4, Claude, Gemini, Llama, Stable Diffusion, that you adapt rather than retrain. When one surprises you, ask which stage explains it: broad knowledge and fluency come from pretraining, helpful and well-mannered behavior from post-training. The real shift to internalize is that you are building on a shared base you did not make, not a custom model you own. Pick the smallest one that does the job, never trust it as a fact store without grounding, and spend your effort on adaptation and evaluation. The rest of this series runs on that habit."
    }
  ]
};
