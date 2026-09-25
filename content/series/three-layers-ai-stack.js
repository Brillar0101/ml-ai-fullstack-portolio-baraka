// Original AI Engineering series post. Rendered by src/pages/blog/SeriesPost.jsx;
// scheduled and given its sources in src/data/seriesPosts.js.
export const POST = {
  "id": "three-layers-ai-stack",
  "title": "The three layers of the AI stack",
  "excerpt": "Application, model, and infrastructure. Knowing which layer you live in tells you which problems are yours to solve.",
  "category": "AI",
  "chapter": "Chapter 1",
  "tags": [
    "AI Stack",
    "Architecture"
  ],
  "seriesNum": 18,
  "publishAt": "2026-04-01T12:00:00Z",
  "body": [
    {
      "type": "p",
      "text": "Picture two engineers arguing for an hour about whether their company should \"build its own AI.\" One insists it is reckless and they should just use an API. The other insists relying on someone else's model is a dead end and they need to own the model. They are both right and both wrong, because they are standing on different floors of the same building and do not realize it. One is talking about the application, the other about the model, and the argument only dissolves once you name the layers of the AI stack and notice you do not have to work on all of them."
    },
    {
      "type": "h2",
      "text": "The intuition: three floors"
    },
    {
      "type": "p",
      "text": "Picture a three-story building. At the bottom is infrastructure: the chips, the serving systems, the plumbing that makes a model actually run, fast and at scale."
    },
    {
      "type": "p",
      "text": "In the middle is the model itself, and the work of training or adapting it. At the top is the application: the product a real person touches, the prompts, the retrieval, the interface, and all the logic wrapped around the model. Each floor stands on the one below it. The crucial point for most people building with AI today is that you can work on the top floor while renting the lower two, the same way a web developer builds a site without manufacturing servers or writing a database from scratch."
    },
    {
      "type": "h2",
      "text": "Walk the argument"
    },
    {
      "type": "p",
      "text": "Replay the two engineers with the floors in mind. The one who says \"just use an API\" is describing the application layer: take a hosted model, wrap it in good prompts and retrieval, and ship a product, which is exactly right for most teams. The one who says \"own the model\" is describing the model and infrastructure layers: train or host your own, which is enormous, expensive work that pays off only for a few companies with very specific needs. They were never actually disagreeing about the same thing. Once you say \"we are building on the application layer and renting the rest,\" the argument is over, and the real questions, which model to rent and how to adapt it, come into focus."
    },
    {
      "type": "h2",
      "text": "Naming the three floors"
    },
    {
      "type": "terms",
      "items": [
        {
          "term": "Application layer",
          "def": "the product experience: prompts, retrieval, interface, and the logic around the model. Where most AI engineers work."
        },
        {
          "term": "Model layer",
          "def": "the model itself and the work of training or adapting it."
        },
        {
          "term": "Infrastructure layer",
          "def": "the compute, serving, and tooling that make models run quickly and at scale."
        }
      ]
    },
    {
      "type": "h2",
      "text": "Why your floor decides your problems"
    },
    {
      "type": "p",
      "text": "Naming the layer you are on tells you which problems are yours. On the application layer, your problems are prompts, retrieval, evaluation, and user experience, and your wins come from clarity and good product judgment. Drop to the model layer and your problems become training data, finetuning, and quality, a different and heavier set. Drop again to infrastructure and you are worrying about throughput, hardware, and serving efficiency. Confusing the layers is how teams over-engineer: a product team that should be tightening a prompt instead spends three months trying to host its own model, solving an infrastructure problem it never needed to have."
    },
    {
      "type": "h2",
      "text": "The floors are not sealed"
    },
    {
      "type": "p",
      "text": "The layers are a useful map, not rigid walls, and the boundaries keep shifting upward as tools mature. Work that used to require living on the model layer keeps moving up into the application layer where it is easier to reach. Managed finetuning services let you adapt a model with a few API calls instead of owning a training cluster. Hosted vector databases turn retrieval, once a serious infrastructure project, into something you configure from the top floor. This drift is good news for most builders: the ceiling on what you can do without descending keeps rising, so you can stay near the top and still build something sophisticated."
    },
    {
      "type": "h2",
      "text": "When to actually go down a floor"
    },
    {
      "type": "p",
      "text": "Sometimes you genuinely do need to descend, and the rule for it is simple: only go down a floor when you have a concrete, measured reason the floor above cannot solve, and go in knowing each step down multiplies the work. Dropping to the model layer means taking on training data, finetuning, and evaluation pipelines. Dropping to infrastructure means owning serving, scaling, and hardware."
    },
    {
      "type": "p",
      "text": "Both are real engineering organizations, not weekend projects. Most teams that descend early regret it, because they shouldered a hard problem to solve something a better prompt, a managed adaptation service, or a hosted database would have handled from the top floor. Go down when the evidence forces you, not when the lower floor sounds more impressive."
    },
    {
      "type": "h2",
      "text": "A real product across the floors"
    },
    {
      "type": "p",
      "text": "Make it concrete with one product, a customer-support assistant. On the application layer lives almost everything the team builds: the prompts that set the assistant's role and rules, the retrieval that pulls the right help-doc passages, the chat interface, the logic that hands off to a human when confidence is low, and the evaluation that checks answer quality. On the model layer sits the foundation model they chose, which they did not train and treat as a capable given. On the infrastructure layer sits the serving that runs that model with acceptable latency, which they rent from a provider."
    },
    {
      "type": "p",
      "text": "Notice how much work is on the top floor and how little the team touches below it. That ratio, lots of application work, a rented model, rented infrastructure, is what a healthy modern AI product usually looks like, and it is why \"should we build our own AI\" is the wrong first question for almost everyone."
    },
    {
      "type": "h2",
      "text": "Stay on the top floor until pushed"
    },
    {
      "type": "p",
      "text": "Locate yourself before you optimize. Most product teams live on the application layer and should stay there, leaning on managed models and infrastructure until they have a concrete, proven reason to go lower. The \"should we build our own AI\" argument almost always comes from forgetting the floors exist. Name your layer, rent the rest, and put your energy into the problems that floor actually owns."
    }
  ]
};
