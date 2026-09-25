// Original AI Engineering series post. Rendered by src/pages/blog/SeriesPost.jsx;
// scheduled and given its sources in src/data/seriesPosts.js.
export const POST = {
  "id": "guardrails",
  "title": "Guardrails for real applications",
  "excerpt": "Shipping a model to users means planning for the bad outputs, not just the good ones. What guardrails are and where they go.",
  "category": "AI",
  "chapter": "Chapter 10",
  "tags": [
    "Guardrails",
    "Safety",
    "Production"
  ],
  "seriesNum": 16,
  "publishAt": "2026-03-18T12:00:00Z",
  "body": [
    {
      "type": "p",
      "text": "A grieving customer asked Air Canada's website chatbot about bereavement fares. The bot told him he could book now and apply for the discount within a few days."
    },
    {
      "type": "p",
      "text": "That was not the airline's actual policy, the bot had it wrong, and when he asked for the refund the airline refused. He took it to a tribunal, which in early 2024 ruled against Air Canada. The airline had argued, remarkably, that the chatbot was a separate entity responsible for its own statements. The tribunal disagreed. The company was on the hook for what its bot made up."
    },
    {
      "type": "p",
      "text": "A demo only has to work once. A product has to fail safely thousands of times a day, and \"the bot said it, not us\" is not a defense. The thing standing between a helpful feature and a liability is guardrails."
    },
    {
      "type": "h2",
      "text": "Seatbelts for a fast car"
    },
    {
      "type": "p",
      "text": "Treat the model as one component you do not fully control, wrapped in code you do. You cannot guarantee what it will say, so you guard the edges. On the way in, you screen what reaches it. On the way out, you check what it produced before anyone acts on it."
    },
    {
      "type": "p",
      "text": "The model is the engine. Guardrails are the seatbelts, and the Air Canada bot was driving without any."
    },
    {
      "type": "h2",
      "text": "One request runs the gauntlet"
    },
    {
      "type": "p",
      "text": "Picture the same bot built defensively. When asked about a policy, it does not answer from memory. It retrieves the real policy text and is instructed to answer only from it, and to hand off to a human when the policy is unclear."
    },
    {
      "type": "p",
      "text": "An output check confirms any refund or eligibility claim matches an approved source before it is shown. Now the bot can still be helpful, but it physically cannot invent a refund rule, because the one path to stating a policy runs through the real policy. The expensive failure was not the model being wrong. It was a system that let a wrong answer reach a customer unchecked."
    },
    {
      "type": "h2",
      "text": "The moving parts, named"
    },
    {
      "type": "terms",
      "items": [
        {
          "term": "Input guardrail",
          "def": "a check on what reaches the model, blocking or cleaning unsafe, abusive, or out-of-scope prompts."
        },
        {
          "term": "Output guardrail",
          "def": "a check on what the model produced, before it reaches a user or another system."
        },
        {
          "term": "Fallback",
          "def": "a safe default, like handing off to a human, for when a check fails or the model is unsure."
        }
      ]
    },
    {
      "type": "h2",
      "text": "The two sides in more detail"
    },
    {
      "type": "p",
      "text": "It helps to picture the model wrapped in two checkpoints. On the way in, an **input guardrail** screens what reaches the model: it can block obvious abuse, strip or flag injection attempts, and catch requests that are simply out of scope for your product, like someone asking your airline bot for medical advice. On the way out, an **output guardrail** screens what the model produced before anyone acts on it: it can confirm the answer matches an approved source, check that it does not leak a secret or personal data, and verify the format is what the next system expects."
    },
    {
      "type": "p",
      "text": "The input side reduces how often the model gets into trouble. The output side catches the trouble it gets into anyway. You generally want both, because each covers a gap the other cannot."
    },
    {
      "type": "h2",
      "text": "Guardrails are not perfect, and that is the point"
    },
    {
      "type": "p",
      "text": "It is tempting to imagine a perfect filter that catches every bad input and output. There is no such thing, and chasing it is the wrong goal."
    },
    {
      "type": "p",
      "text": "A determined attacker can sometimes slip past an input check, and a clever failure can sometimes pass an output check. Guardrails are not about reaching zero failures. They are about lowering the rate of bad outcomes and bounding how bad the worst one can be. This is why the most important guardrail is often structural rather than clever: limit what the system is allowed to do, so that even a failure that gets through cannot cause serious harm. A bot that can only suggest articles is safe in a way that a bot that can issue refunds is not, no matter how good the filters are."
    },
    {
      "type": "h2",
      "text": "A different failure: data walking out the door"
    },
    {
      "type": "p",
      "text": "Not every guardrail is about what the model says back. Some are about what your own people send in. In 2023, engineers at Samsung reportedly pasted confidential source code and internal notes into ChatGPT to get debugging help, not fully registering that handing sensitive text to an outside service meant it had left the building. The company moved to restrict employee use of such tools afterward."
    },
    {
      "type": "p",
      "text": "There was no malicious attacker and no hallucination in that story. The leak was ordinary people using a genuinely helpful tool without any guardrail on what was safe to share. The lesson generalizes to anything you build: if your application forwards user or company data to a model, an input guardrail should decide what is allowed to leave, redacting secrets and flagging sensitive content before it ever reaches the model provider. Guarding the output is not enough when the real risk is sitting in the input."
    },
    {
      "type": "h2",
      "text": "Where to put them"
    },
    {
      "type": "ul",
      "items": [
        "Ground answers that carry consequences in real source text, and refuse rather than guess when the source is silent.",
        "Validate outputs against your rules and format before acting on them or showing them.",
        "Give the model a clean way out, a human handoff, instead of forcing an answer it should not give.",
        "Limit the system's power so that the worst a failure can do is small and reversible.",
        "Log what the guardrails catch, so you learn what users and attackers actually send."
      ]
    },
    {
      "type": "h2",
      "text": "Layers, not a single gate"
    },
    {
      "type": "p",
      "text": "Design for the bad path, because a court will not accept \"the model did it.\" Assume the model will sometimes be confidently wrong, and build the system so that being wrong is caught before it becomes a promise to a customer. The teams whose AI features survive contact with the public are the ones who planned for the failure, not just the demo. Screen what goes in, check what comes out, give the model a safe way to say nothing, and keep its power small enough that any failure stays survivable."
    }
  ]
};
