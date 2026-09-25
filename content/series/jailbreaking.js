// Original AI Engineering series post. Rendered by src/pages/blog/SeriesPost.jsx;
// scheduled and given its sources in src/data/seriesPosts.js.
export const POST = {
  "id": "jailbreaking",
  "title": "Jailbreaking: how people talk a model past its own rules",
  "excerpt": "A model trained to refuse can still be coaxed into complying. The tricks that work, why they work, and what actually defends against them.",
  "category": "AI",
  "tags": [
    "Safety",
    "Jailbreaking",
    "Security"
  ],
  "seriesNum": 36,
  "publishAt": "2026-07-01T12:00:00Z",
  "body": [
    {
      "type": "p",
      "text": "Picture a chatbot launched with clear safety training. Ask it for something harmful and it refuses politely, exactly as designed. Then within days, screenshots are circulating of the same bot happily giving the answer it just refused, because someone wrapped the request in a little story."
    },
    {
      "type": "p",
      "text": "They did not hack a server or steal a password. They typed a clever paragraph into the same box every other user types into, and the model walked right past its own rules. That is **jailbreaking**, and understanding it is part of building anything that puts a model in front of the public."
    },
    {
      "type": "p",
      "text": "The thing to get straight first is why this is even possible. A model's safety training is not a hard gate like a password check that either passes or fails. It is a strong tendency, learned from examples, to refuse certain kinds of requests. Tendencies can be pushed against."
    },
    {
      "type": "p",
      "text": "The model is also relentlessly trying to be helpful and to follow the instructions in front of it, and a jailbreak is essentially a way of making the \"be helpful, follow these instructions\" pull stronger than the \"refuse this\" pull. The attacker is not breaking the model, they are putting its two trained instincts in conflict and tilting the result."
    },
    {
      "type": "h2",
      "text": "The roleplay trick"
    },
    {
      "type": "p",
      "text": "The most famous family of jailbreaks works through roleplay. The early ones told the model to pretend to be an alter ego with no restrictions, an unfiltered character who \"can do anything now,\" and to answer as that character instead of as itself. Framed as fiction, the model would often produce content it would have refused if asked directly, because in its read of the situation it was writing a story rather than giving real advice. The pattern keeps reappearing in new costumes: be a fictional character, write a movie script, play a game where refusing is against the rules. The common move is to relabel a real request as make-believe."
    },
    {
      "type": "h2",
      "text": "The bedtime-story and indirection tricks"
    },
    {
      "type": "p",
      "text": "A gentler cousin is the indirection trick, and the bedtime-story version made the rounds because it is so disarming. Instead of asking for forbidden instructions outright, someone asks the model to play a beloved grandmother who used to soothe them to sleep by reciting, step by step, exactly the dangerous procedure the model would otherwise refuse to give. Wrapped in warmth and nostalgia, the request slips past the part of the model trained to say no, and the harmful content comes out dressed as a tender memory. The lesson underneath the gimmick is general: harmful intent can be hidden inside an innocent-looking frame, and the frame is doing the work."
    },
    {
      "type": "h2",
      "text": "Know the tricks by name"
    },
    {
      "type": "terms",
      "items": [
        {
          "term": "Jailbreaking",
          "def": "crafting input that gets a model to do something its safety training was meant to prevent."
        },
        {
          "term": "Safety training",
          "def": "the learned tendency to refuse harmful requests. A strong bias, not an unbreakable gate."
        },
        {
          "term": "Roleplay attack",
          "def": "reframing a forbidden request as fiction or a character's lines so the model treats it as make-believe."
        },
        {
          "term": "Prompt injection",
          "def": "a related attack where hidden instructions in data the model reads hijack its behavior. Jailbreaking targets the rules, injection targets the instructions."
        },
        {
          "term": "Red-teaming",
          "def": "deliberately attacking your own system to find these holes before outsiders do."
        }
      ]
    },
    {
      "type": "h2",
      "text": "Why no single fix closes it"
    },
    {
      "type": "p",
      "text": "It would be comforting if there were one patch that ended jailbreaking, but there is not, and the reason is structural. The model accepts open-ended natural language, and natural language is infinitely flexible, so the space of possible framings is unbounded. Every time providers train against a known trick, someone finds a new wording that the training did not cover. This is the same cat-and-mouse shape you see in spam filtering and other adversarial security problems: you are not solving it once, you are raising the cost of the attack and shrinking the surface, continuously. Anyone who promises a model that \"cannot be jailbroken\" is selling something."
    },
    {
      "type": "p",
      "text": "Because of that, the realistic goal is layers, not a wall. Safety training on the model is the first layer and it catches the lazy attempts. On top of that you add an independent check that reads the final output before it reaches the user and blocks clearly harmful content regardless of how the model was talked into producing it, which matters because that filter does not care about the clever framing, only the result. You keep the model's real capabilities scoped so that even a successful jailbreak cannot reach anything truly dangerous, like real user data or the ability to take destructive actions. And you **red-team** your own system, paying people to attack it, so you find the holes before strangers on the internet do."
    },
    {
      "type": "h2",
      "text": "What this means for what you build"
    },
    {
      "type": "p",
      "text": "The practical mindset is to assume the model can and eventually will be talked out of its rules, and to design so that this is survivable rather than catastrophic. Never let a refusal be the only thing standing between a user and something harmful or expensive. If a model has the power to issue refunds, send emails, or run code, a jailbreak of that model is now a jailbreak of those powers, so the limits have to live outside the model, in the system around it, where no clever paragraph can argue them away. The safety training reduces how often you get probed. The architecture decides how much damage a successful probe can do, and that second number is the one you actually control."
    },
    {
      "type": "p",
      "text": "So the company that got embarrassed by a screenshot did not respond by hunting for the one prompt that would make their model unbreakable, because that prompt does not exist. They added an output filter, narrowed what the bot was allowed to actually do, and started red-teaming every release. Jailbreaks still got through occasionally, but they stopped mattering, because there was nothing valuable on the other side of the rule for a jailbreak to reach. That is the whole game: not a model that never gets fooled, but a system where being fooled is not enough."
    }
  ]
};
