// Original AI Engineering series post. Rendered by src/pages/blog/SeriesPost.jsx;
// scheduled and given its sources in src/data/seriesPosts.js.
export const POST = {
  "id": "prompt-engineering-that-helps",
  "title": "Prompt engineering that actually moves the needle",
  "excerpt": "Most prompt advice is folklore. A few principles do real work. Here are the ones worth keeping.",
  "category": "AI",
  "chapter": "Chapter 5",
  "tags": [
    "Prompt Engineering",
    "In-context Learning"
  ],
  "seriesNum": 8,
  "publishAt": "2026-01-21T12:00:00Z",
  "body": [
    {
      "type": "p",
      "text": "Suppose a developer asks a model to \"write a product description for my running shoe.\" Back comes a paragraph of warm air: \"Experience the ultimate fusion of comfort and performance with our revolutionary footwear, designed for those who demand the best.\" It is grammatical, it is useless, and it could describe any shoe ever made. The developer concludes the model is not very good. The model is fine. The prompt told it almost nothing, so it returned the average of everything."
    },
    {
      "type": "p",
      "text": "Prompting got a reputation as magic words and secret phrases. Strip that away and what is left is mostly clear specification, plus a couple of techniques that genuinely change behavior. The shoe example shows why."
    },
    {
      "type": "h2",
      "text": "Instructions in, behavior out"
    },
    {
      "type": "p",
      "text": "A prompt is the entire brief the model gets for one task. It has no memory of your intent beyond what is in that text, and no chance to ask a clarifying question. So a vague prompt does not get a lazy answer, it gets a generic one, because \"write a product description\" genuinely has a million valid completions and the model gave you the blandest safe middle."
    },
    {
      "type": "h2",
      "text": "Walk the rewrite"
    },
    {
      "type": "p",
      "text": "Now specify. \"Write a 40-word product description for a lightweight trail running shoe aimed at beginner runners. Lead with the cushioning and the grippy outsole. Plain, friendly tone, no hype words like revolutionary or ultimate. Output just the description.\" Suddenly the model has a length, an audience, the two features that matter, a banned-words rule, and an output format."
    },
    {
      "type": "p",
      "text": "The result is specific and usable, not because the model got smarter, but because you removed the freedom that was producing fluff. Almost every \"the model is bad at this\" complaint dissolves the same way: the task was under-specified, and the fix was to say what you actually wanted."
    },
    {
      "type": "h2",
      "text": "What the pieces of a prompt are called"
    },
    {
      "type": "terms",
      "items": [
        {
          "term": "System prompt",
          "def": "standing instructions that set the model's role and rules for the whole conversation."
        },
        {
          "term": "Few-shot",
          "def": "including a couple of worked input-output examples in the prompt so the model copies the pattern."
        },
        {
          "term": "In-context learning",
          "def": "the model adapting its behavior from examples in the prompt, with no training involved."
        }
      ]
    },
    {
      "type": "h2",
      "text": "A second case, pulling data out instead of writing it"
    },
    {
      "type": "p",
      "text": "The same lesson holds when you are extracting rather than creating. Say you want the sender, amount, and due date out of an email. \"Get the key details from this email\" gives you a friendly paragraph you then have to parse, and it will be shaped differently every time."
    },
    {
      "type": "p",
      "text": "The specified version says: \"Extract the sender name, the amount owed as a number, and the due date in YYYY-MM-DD format. Return only a JSON object with keys sender, amount, and due_date. If a field is missing, use null.\" Now the output is predictable enough for a program to read, and the model has no room to be creatively unhelpful. The shift is the same as the shoe description: you removed the freedom that was producing variety you did not want."
    },
    {
      "type": "h2",
      "text": "Show, do not tell: few-shot in action"
    },
    {
      "type": "p",
      "text": "When a rule is hard to describe, a couple of examples teaches it instantly. Suppose you want product names normalized: \"iPhone 14 Pro Max 256gb\" should become \"Apple iPhone 14 Pro Max.\" Rather than write a paragraph of rules about capitalization and brand prefixes, you show two or three input-output pairs in the prompt and then give the real input. The model reads the pattern off your examples and applies it. This is **few-shot** prompting, and it leans on **in-context learning**: the model adapts from the examples in the prompt without any training. For anything with a consistent shape, two good examples routinely beat a long description of the rules, because you are showing the target instead of describing it."
    },
    {
      "type": "h2",
      "text": "Common mistakes"
    },
    {
      "type": "ul",
      "items": [
        "**Vague adjectives.** \"Be professional\" or \"be creative\" mean nothing precise to a model. Say what professional looks like here: no slang, second person, under 60 words.",
        "**Contradictory instructions.** \"Be thorough but keep it very short\" pulls two ways, and the model picks one at random. Decide which you actually want.",
        "**Overstuffing.** Ten competing rules in one prompt is worse than the three that matter. Extra instructions dilute the important ones.",
        "**No examples for shaped output.** If the output has a format, show it. Describing a format in prose and then being surprised it varies is the most common self-inflicted wound."
      ]
    },
    {
      "type": "h2",
      "text": "How to actually improve a prompt"
    },
    {
      "type": "p",
      "text": "The reliable loop is dull and it works. Collect a handful of real inputs, including the awkward ones. Run your prompt against all of them, not just the one you had in mind. When something is off, change one thing, the format instruction, an example, the tone rule, and run the set again, so you can tell what the change did. Iterating against a fixed set of examples beats tweaking until a single output looks nice, because a prompt that nails one case and breaks five others is not an improvement, it just feels like one."
    },
    {
      "type": "h2",
      "text": "Structure helps as much as wording"
    },
    {
      "type": "p",
      "text": "How you arrange a prompt matters nearly as much as the words in it. Put the instruction first and the data it applies to second, clearly separated, so the model is not guessing where one ends and the other begins. Label the parts: \"Instructions:\" and then \"Email to extract from:\" beats running them together into one block."
    },
    {
      "type": "p",
      "text": "For longer prompts, a short numbered list of requirements is easier for the model to satisfy than the same requirements buried in a paragraph, because each one stands on its own and is harder to skip. None of this is a trick. It is the same courtesy you would extend to a person doing the task: tell them clearly what to do, then hand them the thing to do it to, with a visible line between the two."
    },
    {
      "type": "h2",
      "text": "Where prompting stops being enough"
    },
    {
      "type": "p",
      "text": "Good prompting closes a surprising amount of the gap, and it does have a ceiling worth recognizing so you do not waste days fighting it. If the model keeps getting facts wrong because it simply does not know them, no wording will fix that, and you reach for retrieval to put the facts in front of it. If the model understands the task but cannot hold a very specific format or style no matter how clearly you ask, that is a sign you may need finetuning to teach the behavior by example."
    },
    {
      "type": "p",
      "text": "The skill is partly knowing when you are out of prompt road. A vague answer almost always means a vague prompt, and you should fix the prompt first. But a knowledge gap or a stubborn behavior gap is a different problem, and those are what the next posts in this series are about."
    },
    {
      "type": "h2",
      "text": "The principles that pay off"
    },
    {
      "type": "ul",
      "items": [
        "Be explicit. State the task, the audience, the format, the length, and what to avoid, instead of hinting at them.",
        "Show, do not just tell. One or two examples of the output you want beats a paragraph describing it.",
        "Break hard tasks into steps and let the model work before it commits to a final answer.",
        "Iterate against an evaluation set, not your gut, so you know a change actually helped."
      ]
    },
    {
      "type": "h2",
      "text": "Fix the prompt before anything else"
    },
    {
      "type": "p",
      "text": "Treat prompting as specification, not incantation. The shoe description did not need a magic phrase. It needed a length, an audience, two real features, and a tone. Say exactly what you want, show an example, and test the result against real inputs, and most prompt problems stop being mysterious."
    },
    {
      "type": "p",
      "text": "The skill is not collecting secret phrases. It is learning to specify clearly, which is a skill that keeps working as the models underneath you change."
    }
  ]
};
