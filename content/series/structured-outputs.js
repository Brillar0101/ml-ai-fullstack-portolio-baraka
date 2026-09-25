// Original AI Engineering series post. Rendered by src/pages/blog/SeriesPost.jsx;
// scheduled and given its sources in src/data/seriesPosts.js.
export const POST = {
  "id": "structured-outputs",
  "title": "Structured outputs: getting JSON you can trust",
  "excerpt": "When a model feeds another system, free text is a liability. How to make outputs machine-readable and reliable.",
  "category": "AI",
  "chapter": "Chapter 2",
  "tags": [
    "Structured Output",
    "JSON"
  ],
  "seriesNum": 21,
  "publishAt": "2026-04-22T12:00:00Z",
  "body": [
    {
      "type": "p",
      "text": "Picture a pipeline that reads invoices. Every night a model pulls the vendor, date, and total out of each one and returns them as JSON, which a script loads into a database. It works in testing and runs fine for weeks. Then one night the job dies at 3am."
    },
    {
      "type": "p",
      "text": "The cause, found the next morning, is almost funny: the model decided to be friendly and answered \"Sure! Here is the JSON you asked for:\" before the actual data. The script tried to parse that sentence as JSON, threw an error, and the whole batch failed. One stray pleasantry took down the pipeline."
    },
    {
      "type": "p",
      "text": "That failure is the entire case for structured outputs. A model talking to a person can be a little loose. A model feeding another system cannot, because the next program reads it literally and breaks on anything unexpected."
    },
    {
      "type": "h2",
      "text": "A contract instead of a conversation"
    },
    {
      "type": "p",
      "text": "When a human reads model output, a stray sentence or an extra comma is nothing. When a parser reads it, those are fatal. The model was trained to produce helpful-sounding text, and \"here you go\" before the data is helpful-sounding. So the goal shifts from \"ask nicely for JSON\" to \"make malformed output impossible, and check what comes back anyway.\" You stop hoping and start constraining."
    },
    {
      "type": "h2",
      "text": "Walk the fix"
    },
    {
      "type": "p",
      "text": "Rebuild the invoice job defensively. First, define a schema: vendor is a string, date is a date, total is a number, and nothing else is allowed. Then use the provider's structured-output mode, which forces the model to emit only text that fits that schema, so it physically cannot add \"Sure, here you go.\" Finally, validate every response against the schema before the database ever sees it, and on the rare miss, retry or route it to a repair step instead of crashing. Now the friendly sentence cannot happen, and if anything else slips through, the validator catches it before it becomes a 3am page."
    },
    {
      "type": "h2",
      "text": "Terms for taming output"
    },
    {
      "type": "terms",
      "items": [
        {
          "term": "Structured output",
          "def": "model output in a fixed machine-readable shape, like JSON matching a defined schema."
        },
        {
          "term": "Schema",
          "def": "the contract that says exactly which fields and types are allowed, and nothing else."
        },
        {
          "term": "Constrained decoding",
          "def": "forcing the model to only generate tokens that keep the output valid as it writes."
        }
      ]
    },
    {
      "type": "h2",
      "text": "How to get it reliably"
    },
    {
      "type": "ul",
      "items": [
        "Define a schema and use the provider's structured-output mode when it exists, so invalid output cannot be produced.",
        "Validate every response against the schema before acting on it, even with structured mode on.",
        "Have a retry or repair path for the rare invalid output, instead of letting it crash the job.",
        "Keep the schema small. The more fields you demand, the more there is to get wrong."
      ]
    },
    {
      "type": "h2",
      "text": "The old way, and why it hurt"
    },
    {
      "type": "p",
      "text": "Before structured-output modes existed, teams did this the hard way, and the scars are instructive. You would beg in the prompt, \"respond only with valid JSON and no other text,\" then write defensive code to clean up whatever actually came back: stripping a leading \"Here is the JSON,\" cutting the markdown code fences the model liked to wrap around it, fixing trailing commas, retrying when a parse failed. It mostly worked, and \"mostly\" was the trap, because at any real scale a steady trickle of failures lands at the worst possible times."
    },
    {
      "type": "p",
      "text": "Every patch was a guess about how the model might misbehave, and the model would eventually find a new way you had not patched yet. Moving to a real schema and a constrained mode is the shift from guessing at the model's bad habits to making those habits impossible in the first place. You stop cleaning up after the model and start preventing the mess, which is the only version of this that holds up in production."
    },
    {
      "type": "h2",
      "text": "Why this matters even more for agents"
    },
    {
      "type": "p",
      "text": "Structured output is not just for nightly data jobs. It is what makes tool use and agents possible at all. When a model decides to call a tool, it has to say which tool and with what inputs, and your code has to read that decision and act on it."
    },
    {
      "type": "p",
      "text": "If the model expresses \"search for X\" as a free-form sentence, your code cannot reliably parse it. If it expresses it as a strict object, a tool name and a set of arguments matching a schema, your code can execute it safely. Every agent framework leans on this under the hood. So the same discipline that keeps an invoice pipeline alive is also the foundation of letting a model take actions in the world, which raises the stakes: a malformed tool call is not a missed field, it is a wrong action or a crash mid-task."
    },
    {
      "type": "h2",
      "text": "Keep the schema as small as the task allows"
    },
    {
      "type": "p",
      "text": "One practical rule saves a lot of pain: ask for the least structure you actually need. Every field you demand is another thing the model can get wrong, another place a value can come back null or mistyped, another branch your validation has to handle. A schema with three required fields is far more reliable than one with fifteen optional ones. If you find yourself asking the model for a deeply nested object with a dozen keys, that is often a sign to break the work into two simpler steps rather than one fragile mega-call. Simpler schemas are not just easier to write, they fail less, which in production is the same as being smarter."
    },
    {
      "type": "h2",
      "text": "Trust schemas, not promises"
    },
    {
      "type": "p",
      "text": "Treat any model output bound for another system as untrusted until validated, the same way you would treat a string from the internet. Constrain the generation so malformed output cannot happen, check it against a schema anyway, keep that schema as small as the task allows, and a flaky text generator becomes a dependable component your pipeline, and your agents, can actually rely on at 3am. The goal is not to ask the model nicely for good output. It is to build a system where bad output cannot reach the next step, whether that step is a database row or an action in the world."
    }
  ]
};
