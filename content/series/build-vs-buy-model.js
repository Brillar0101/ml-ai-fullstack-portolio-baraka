// Original AI Engineering series post. Rendered by src/pages/blog/SeriesPost.jsx;
// scheduled and given its sources in src/data/seriesPosts.js.
export const POST = {
  "id": "build-vs-buy-model",
  "title": "Build or buy a model: the question before you train anything",
  "excerpt": "Training your own model feels like the serious choice. For most teams, calling someone else's is the right one. How to decide without guessing.",
  "category": "AI",
  "tags": [
    "Strategy",
    "Cost",
    "Finetuning"
  ],
  "seriesNum": 37,
  "publishAt": "2026-07-02T12:00:00Z",
  "body": [
    {
      "type": "p",
      "text": "Picture a startup founder in a planning meeting, saying the line that kicks off a hundred doomed projects: \"we should train our own model, so we own it and it understands our domain.\" It sounds responsible, even strategic. Six weeks and a large cloud bill later, the team has a model that is worse than the one they could have called with an API key on day one, and they have learned the expensive way that \"build or buy\" is a real decision with a usually-boring answer. Knowing how to make that call before you spend the money is one of the most valuable judgments in applied AI."
    },
    {
      "type": "p",
      "text": "The first thing to clear up is that \"build\" and \"buy\" are not two options, they are a ladder with several rungs, and people collapse them into a false choice. At one end you call a hosted model through an API and write nothing but prompts."
    },
    {
      "type": "p",
      "text": "A step up, you take an existing open model and run it yourself. Further up, you finetune an open model on your own examples. At the far end, you train a model from scratch on your own data and hardware. The cost, the expertise required, and the time all climb steeply as you move up the ladder, and so does the chance you end up worse off than where you started."
    },
    {
      "type": "image",
      "src": "/blog-images/build-buy/acquisition-pathways.jpg",
      "alt": "Acquisition pathways for language models: buy (API calling, licensed model instances), hybrid (purchase base model and finetune, RAG with a purchased model, sovereign cloud partnerships), and build (adaptation from open models, pretraining from scratch), with cost, control, and capability requirements increasing from buy to build.",
      "caption": "The buy-to-build spectrum, with the hybrid middle most teams actually land on. Figure 1 from Lu et al., \"Buy versus Build an LLM: A Decision Framework for Governments\" (arXiv:2602.13033)."
    },
    {
      "type": "p",
      "text": "The rungs also combine, and the combinations are where most real systems live. You can buy a hosted model and keep your data sovereign by wiring retrieval to a local store. You can license a strong base model and finetune it inside your own environment. Researchers who studied this decision for governments call these hybrid pathways and note they are the common case in practice, because they split the question cleanly: rent the capability, keep control of the parts that are actually yours. Hold onto that, because the best answer below is often two rungs used together."
    },
    {
      "type": "h2",
      "text": "Why buying usually wins"
    },
    {
      "type": "p",
      "text": "The reason the bottom of the ladder wins so often is that the companies offering hosted models have spent amounts of money on training that a normal team cannot match, and you get the benefit of that for the price of a call. When you call a frontier model, you are renting the output of a training run that cost more than your entire company, billed by the token. Trying to beat that with your own from-scratch training is like trying to build a better search engine in a weekend. For the large majority of products, the hosted model is not the compromise option, it is simply better than anything you could realistically build, and cheaper once you count the salaries."
    },
    {
      "type": "p",
      "text": "Honesty requires the other side of that ledger, because buying carries risks the invoice does not show. The provider controls availability, pricing, and deprecation, so the model your product depends on can be retired, rate-limited, or repriced on someone else's schedule, and your only recourse is a migration you did not plan. The dependence also concentrates: when researchers measured which models serve real-world usage, some domains like translation and programming were about as concentrated as a market with only one or two firms in it. None of this flips the default answer. It earns a line in your plan instead: know which model you depend on, keep your prompts and evals portable, and know what you would switch to if the terms changed tomorrow."
    },
    {
      "type": "h2",
      "text": "Walk the founder's actual goals"
    },
    {
      "type": "p",
      "text": "Start with the question that sorts most of this out on its own: is the model your product, or a feature of it? If the model itself is the thing customers choose you for, then owning and shaping it can be the whole business, and the build math deserves a serious look. If the model is a feature, a way to make your actual product better, then every dollar spent training is a dollar taken from the product, and buying is almost always right. Most teams who say \"we should train our own\" are building a feature and pricing it like a product."
    },
    {
      "type": "p",
      "text": "Now look closely at why the founder wanted to build, because each reason has a cheaper answer than training. \"It should understand our domain\" is usually solved by feeding the model your documents at question time through retrieval, or by finetuning, both far down the ladder from training. \"We want to own it and not depend on a vendor\" is a real concern, but it is answered by running an open model yourself, which you can do without training anything. \"It will be cheaper at our scale\" is sometimes true at very high volume, but only after you have the volume, not before. None of the stated goals actually required a from-scratch model, which is the usual finding when you interrogate the impulse honestly."
    },
    {
      "type": "h2",
      "text": "The decision, in plain terms"
    },
    {
      "type": "terms",
      "items": [
        {
          "term": "Buy (hosted API)",
          "def": "calling someone else's model over the network. Lowest cost and effort, fastest to ship, you depend on the provider."
        },
        {
          "term": "Self-host",
          "def": "running an open model on your own machines. More control and no per-call vendor, in exchange for running the infrastructure."
        },
        {
          "term": "Finetune",
          "def": "training an existing model further on your own examples so it picks up your patterns. Mid-ladder, often the real answer."
        },
        {
          "term": "Train from scratch",
          "def": "building a model from nothing on your own data and hardware. Enormously expensive, rarely the right call."
        },
        {
          "term": "Total cost of ownership",
          "def": "the full bill including engineers, infrastructure, and maintenance, not just the per-call price."
        }
      ]
    },
    {
      "type": "h2",
      "text": "When building actually is right"
    },
    {
      "type": "p",
      "text": "There are real cases for climbing the ladder, and dismissing all of them would be as wrong as climbing it by default. Strict data rules can forbid sending information to an outside provider, which pushes you toward self-hosting an open model so nothing leaves your walls. Truly massive, steady volume can make the math favor running your own inference once you are big enough."
    },
    {
      "type": "p",
      "text": "A genuinely unusual domain that hosted models handle poorly even with retrieval and finetuning can justify training. And needing the model to run on a device with no network, like in a car or a remote sensor, rules out a hosted call entirely. The pattern is that building is right when a concrete constraint forces it, not when it merely sounds ambitious."
    },
    {
      "type": "p",
      "text": "Notice that even those cases mostly point at the middle of the ladder, not the top. Data rules and ownership concerns are answered by self-hosting or finetuning an open model, which is a completely different scale of effort from training from scratch. The number of teams that genuinely need to train a model from nothing is tiny, and almost none of them are deciding it in their first planning meeting."
    },
    {
      "type": "p",
      "text": "If you find yourself reaching for the top rung, the burden is on you to explain why every rung below it fails for your specific constraint. Training from scratch is also not one decision but a chain of them: sourcing legally defensible data, building evaluation, red-teaming, serving, and eventually deprecating your own model. Teams that have mapped that lifecycle count around nineteen distinct decision points, and every one of them is a place to be wrong."
    },
    {
      "type": "p",
      "text": "There is also a clock running on whichever choice you make, and it runs in both directions. The cost of building falls every year, because open models keep improving and the gap you would need to close keeps shrinking, so a build that is irrational today may be reasonable in eighteen months. But a model you have already trained depreciates the same way."
    },
    {
      "type": "p",
      "text": "The day training ends, the frontier keeps moving and your owned model does not, a problem worth naming: capability debt. Owning a model really means paying to rebuild it on a schedule. So treat build-or-buy as a standing decision, not a one-shot one. Decide cheap now, and write down the triggers that would reopen the question: a price change, a new data rule, a volume threshold, an open model crossing your quality bar."
    },
    {
      "type": "h2",
      "text": "How to decide without guessing"
    },
    {
      "type": "p",
      "text": "The way out of the argument is the same as everywhere else in this series: measure before you commit. Start at the cheapest rung that could plausibly work, usually a hosted model with a good prompt, and test it on your real tasks. If it meets the bar, you are done, and you just saved a project."
    },
    {
      "type": "p",
      "text": "If it falls short, add retrieval and test again. Still short, try finetuning and test again. Only climb to the next rung when the one below it has actually failed a real test, not when you imagine it might. Each rung up costs more in money and expertise, so make the rung below prove it is insufficient before you pay for the next one."
    },
    {
      "type": "p",
      "text": "The mirror-image failure deserves its own warning: buying blindly and wrapping nothing around it, no retrieval, no evaluation, no workflow, wastes the rung you are standing on. The teams that win with bought models are the ones that spend the saved budget on the integration."
    },
    {
      "type": "p",
      "text": "The founder's team eventually did this in the right order and landed two rungs down from where they started: a hosted model with their documents wired in through retrieval, no training at all, shipped in days instead of months. They still \"owned\" the part that mattered, which was the product and the data, and they spent their engineering budget on the experience instead of on a worse copy of something they could rent. That is the quiet truth behind build versus buy. The serious-sounding choice is usually the wrong one, and the discipline is to make the cheap option prove it cannot work before you reach for the expensive one."
    },
    {
      "type": "sources",
      "items": [
        {
          "title": "Lu et al., \"Buy versus Build an LLM: A Decision Framework for Governments\" (2026), arXiv:2602.13033",
          "url": "https://arxiv.org/abs/2602.13033"
        },
        {
          "title": "DataHub Analytics, \"Custom LLMs for Internal Enterprise Data: Build or Buy?\"",
          "url": "https://datahubanalytics.com/custom-llms-for-internal-enterprise-data-build-or-buy/"
        }
      ]
    }
  ]
};
