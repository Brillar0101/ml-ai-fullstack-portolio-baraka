// Original AI Engineering series post. Rendered by src/pages/blog/SeriesPost.jsx;
// scheduled and given its sources in src/data/seriesPosts.js.
export const POST = {
  "id": "what-an-agent-is",
  "title": "What an AI agent really is",
  "excerpt": "Strip away the hype and an agent is a loop: the model picks an action, you run it, you feed back the result. That is the whole idea.",
  "category": "AI",
  "chapter": "Chapter 6",
  "tags": [
    "Agents",
    "Tools"
  ],
  "seriesNum": 11,
  "publishAt": "2026-02-11T12:00:00Z",
  "body": [
    {
      "type": "p",
      "text": "In early 2023, a project called AutoGPT became one of the fastest-starred repositories in GitHub's history. The pitch was intoxicating: give it a goal in plain English, like \"research my competitors and write a report,\" and it would break the goal into steps, search the web, write files, and keep going on its own. People expected magic. What many of them got was a model that opened a browser, got a little confused, decided to search again, got confused again, and looped like that until it had burned through their API budget without finishing. The hype and the disappointment came from the same place: a misunderstanding of what an agent actually is."
    },
    {
      "type": "p",
      "text": "Strip the mystique and an agent is almost embarrassingly simple. It is a model in a loop that can take actions and react to the results."
    },
    {
      "type": "h2",
      "text": "A model with hands"
    },
    {
      "type": "p",
      "text": "A normal model call is one question and one answer. An agent adds two things: a set of tools the model is allowed to use, and a loop. You ask a question. The model can either answer or say \"use this tool with these inputs.\" If it asks for a tool, your code runs it and hands the result back."
    },
    {
      "type": "p",
      "text": "The model reads that result and decides the next move. Repeat until it is done. That is the whole engine. AutoGPT was that loop pointed at a vague goal with a lot of tools and very little supervision."
    },
    {
      "type": "h2",
      "text": "Walk the loop"
    },
    {
      "type": "p",
      "text": "Say the goal is \"what is the weather in Tokyo in Celsius.\" Turn one: the model has no live weather, so it calls a weather tool for Tokyo. Your code runs it and returns \"22C.\" Turn two: the model reads that and answers. Two passes, done."
    },
    {
      "type": "p",
      "text": "Now see how AutoGPT got stuck. With a fuzzy goal like \"research competitors,\" there is no clear finish line, so after each search the model asks itself \"am I done?\", decides no, and searches again. Without a crisp stopping condition and a tight set of tools, the loop has nothing telling it to stop. The failure was not stupidity. It was an open-ended goal handed to an unconstrained loop."
    },
    {
      "type": "h2",
      "text": "What each piece is called"
    },
    {
      "type": "terms",
      "items": [
        {
          "term": "Tool",
          "def": "a function the model can ask to run, like search, a calculator, code execution, or a database query."
        },
        {
          "term": "Planning",
          "def": "the model deciding which actions to take, in what order, to reach the goal."
        },
        {
          "term": "Agent loop",
          "def": "the cycle of choose an action, execute it, observe the result, repeat until done."
        }
      ]
    },
    {
      "type": "h2",
      "text": "The failure modes, in detail"
    },
    {
      "type": "p",
      "text": "The ways agents fail are predictable, and AutoGPT put all of them on display. The first is looping without progress: with no clear finish line, the model searches, decides it is not done, and searches again, forever. The second is picking the wrong tool or feeding it the wrong input, then building on the bad result as if it were good."
    },
    {
      "type": "p",
      "text": "The third is the quietest and most dangerous: a small mistake early gets carried forward and compounded, so by turn eight the agent is confidently solving a problem that drifted away from what you asked at turn one. The root cause behind all three is the same. Each turn the model makes a fresh decision, and more turns means more decisions, and every decision is another chance to be wrong with no human in the loop to catch it."
    },
    {
      "type": "h2",
      "text": "When to use an agent, and when not to"
    },
    {
      "type": "p",
      "text": "Because every extra turn adds risk, the honest default is to prefer the simplest thing that works. If a task can be done in one well-prompted call, do that, it is cheaper, faster, and far easier to trust. Reach for an agent only when the task genuinely needs multiple steps whose order you cannot know in advance, like \"look something up, and depending on what you find, do one of several next things.\" Even then, keep it on a short leash: a tight goal with a clear stopping condition, the smallest set of tools the task needs, a hard limit on the number of turns, and tools whose worst case is reversible. An agent that can only read is a very different risk from one that can spend money."
    },
    {
      "type": "h2",
      "text": "The whole game is the tools you grant"
    },
    {
      "type": "p",
      "text": "If you remember one practical thing about agents, make it this: an agent is exactly as powerful, and exactly as dangerous, as the tools you give it. The model is the decision-maker, but the tools are the hands. An agent with a read-only search tool can, at worst, waste some tokens and hand you a wrong answer. An agent with tools to send email, run shell commands, or move money can, at worst, do real damage when it is confused or hijacked."
    },
    {
      "type": "p",
      "text": "So designing an agent is mostly designing its toolset. Grant the fewest tools the task needs, prefer tools whose actions are reversible, and put a confirmation step in front of anything that is not."
    },
    {
      "type": "p",
      "text": "A surprising amount of agent safety is not clever prompting at all. It is the boring discipline of not handing a sometimes-wrong system the keys to things it does not need to touch. A useful test before adding any tool: imagine it firing at the worst possible moment, on the worst possible input, and ask whether you could live with the result. If the answer is no, that tool needs a confirmation gate, or it does not belong in the agent at all."
    },
    {
      "type": "h2",
      "text": "Before you build one"
    },
    {
      "type": "p",
      "text": "Before reaching for a framework, build the loop yourself once. When you have written choose, execute, observe in plain code, the magic evaporates in the good way: you see that an agent is only as reliable as the goal you give it and the tools you let it touch. Constrain both, prefer a single call when one will do, and you avoid the trap that swallowed everyone's API credits in 2023. Autonomy is a cost you pay in reliability, so buy only as much of it as the task actually requires."
    }
  ]
};
