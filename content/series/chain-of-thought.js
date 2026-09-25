// Original AI Engineering series post. Rendered by src/pages/blog/SeriesPost.jsx;
// scheduled and given its sources in src/data/seriesPosts.js.
export const POST = {
  "id": "chain-of-thought",
  "title": "Chain of thought: giving a model room to think",
  "excerpt": "Why \"show your work\" makes models better at hard problems, and where it helps and where it does not.",
  "category": "AI",
  "chapter": "Chapter 5",
  "tags": [
    "Prompting",
    "Reasoning"
  ],
  "seriesNum": 26,
  "publishAt": "2026-05-27T12:00:00Z",
  "body": [
    {
      "type": "p",
      "text": "In 2022, [Kojima and colleagues](https://arxiv.org/abs/2205.11916) found something that sounds like a party trick. They took a model that was getting arithmetic word problems wrong most of the time and added five words to the prompt before it answered: \"Let's think step by step.\" On MultiArith, a set of elementary arithmetic word problems, accuracy went from 17.7 percent to 78.7 percent. On GSM8K, a harder grade-school math set, the same five words took it from 10.4 percent to 40.7 percent, which is a large gain and still a minority of problems solved."
    },
    {
      "type": "p",
      "text": "No retraining, no new model, no extra examples. Just an instruction to work it out before answering. That result kicked off the whole idea of chain-of-thought prompting."
    },
    {
      "type": "p",
      "text": "It feels like magic and it is not. Once you see why those five words help, you understand something real about how models reason."
    },
    {
      "type": "h2",
      "text": "Scratch paper for the model"
    },
    {
      "type": "p",
      "text": "A model writes one token at a time, and every token it produces becomes part of what it reads to choose the next one. So the text it generates is also its scratch paper. When you force a one-shot answer to a multi-step problem, you are demanding the final number with no working, the way a teacher might demand a mental-math answer on the spot. Let the model write the steps first and it has somewhere to do the intermediate work, and each step gives it firmer ground for the next. The five words simply invite it to use that scratch space instead of blurting."
    },
    {
      "type": "h2",
      "text": "One problem, with and without reasoning"
    },
    {
      "type": "p",
      "text": "Take \"a shop has 23 apples, sells 17, then gets a delivery of 30, how many now.\" Asked for just the number, the model has to compress the whole calculation into a single guessed token, and it often lands near the answer but wrong. Asked to think step by step, it writes \"start with 23, sell 17 leaves 6, add 30 makes 36,\" and now the final \"36\" is read off its own correct working rather than guessed. Nothing about the model changed between the two tries. It just got to show its work, and showing the work is what made the work correct."
    },
    {
      "type": "h2",
      "text": "The reasoning terms"
    },
    {
      "type": "terms",
      "items": [
        {
          "term": "Chain of thought",
          "def": "prompting the model to write its intermediate reasoning before giving the final answer."
        },
        {
          "term": "Scratch space",
          "def": "the tokens the model writes and can then read back as it continues, acting as working memory on the page."
        }
      ]
    },
    {
      "type": "h2",
      "text": "A second case, where the structure is logic not math"
    },
    {
      "type": "p",
      "text": "It is not only about arithmetic. Take a scheduling puzzle: three meetings, a room that holds one at a time, and a set of \"this must come before that\" rules. Asked for the final order in one shot, a model often produces an ordering that quietly violates one of the constraints, because it tried to hold the whole tangle in its head and commit at once. Ask it to reason first and it writes out the rules one by one, places the meetings that have the fewest options, checks each constraint as it goes, and only then states the order."
    },
    {
      "type": "p",
      "text": "The visible work is doing real cognitive lifting. Each line it writes narrows the problem for the next line, the same way you would scribble on paper rather than solve it in your head."
    },
    {
      "type": "h2",
      "text": "Why writing it down actually helps"
    },
    {
      "type": "p",
      "text": "The mechanism is worth being precise about, because it explains both the power and the limits. A model picks each token based on all the tokens before it. The final answer token is therefore conditioned on whatever came right before it."
    },
    {
      "type": "p",
      "text": "If what came before is nothing, the model has to leap straight to the answer. If what came before is a correct chain of intermediate steps, the answer is now the natural, high-probability continuation of that chain. **Chain of thought** does not give the model a new ability. It rearranges the problem so the hard part is broken into many small, local predictions, each of which the model is far more likely to get right than one giant leap."
    },
    {
      "type": "h2",
      "text": "When it helps, and where it backfires"
    },
    {
      "type": "p",
      "text": "It helps most on problems with real steps: math, logic, planning, multi-part questions. It helps little on simple recall or lookups, where there is nothing to unfold, and it always costs extra tokens and latency, since the model now writes a paragraph instead of a word. There is also a subtler trap."
    },
    {
      "type": "p",
      "text": "The written reasoning is not a guarantee of a correct answer. A model can produce a confident, fluent chain of steps that rationalizes a wrong conclusion, the way a student can show convincing work and still get the wrong number. So treat the reasoning as a way to raise the odds of a right answer and as something to inspect, not as proof that the answer is right. The newest \"reasoning\" models bake this habit in, doing the step-by-step thinking internally, which is the same idea moved inside the model."
    },
    {
      "type": "h2",
      "text": "How to use it in practice"
    },
    {
      "type": "p",
      "text": "Day to day this becomes a few simple habits. For a hard task, add an instruction that invites reasoning before the answer, something as plain as \"work through it step by step, then give the final answer on its own line.\" Keeping the final answer on its own line is a small trick that matters in real systems, because it lets your code read the conclusion cleanly without having to parse the whole chain of reasoning around it. For anything you run at scale, weigh the cost: reasoning can easily triple the length of a response, so reserve it for the calls that genuinely need it and let the easy ones answer in a word. And when correctness really matters, add a separate step that checks the final answer, rather than trusting the chain that produced it. Used this way, chain of thought is a dial you turn up for hard problems and down for simple ones, not a setting you leave on everywhere."
    },
    {
      "type": "h2",
      "text": "Let the model show its work"
    },
    {
      "type": "p",
      "text": "For genuinely multi-step tasks, let the model think on the page before it answers, and you will often turn a wrong answer into a right one for the price of a few extra tokens. For simple lookups, skip it and save the tokens, and never assume that confident-looking working means the conclusion is correct. The lesson under the trick is that a model reasons better when it is allowed to write down the middle of the problem, not just the end, because every step it writes becomes firmer ground for the step after it."
    },
    {
      "type": "sources",
      "items": [
        {
          "title": "Kojima et al., \"Large Language Models are Zero-Shot Reasoners\" (NeurIPS 2022)",
          "url": "https://arxiv.org/abs/2205.11916"
        },
        {
          "title": "Wei et al., \"Chain-of-Thought Prompting Elicits Reasoning in Large Language Models\" (NeurIPS 2022)",
          "url": "https://arxiv.org/abs/2201.11903"
        },
        {
          "title": "Cobbe et al., \"Training Verifiers to Solve Math Word Problems\" (GSM8K, 2021)",
          "url": "https://arxiv.org/abs/2110.14168"
        }
      ]
    }
  ]
};
