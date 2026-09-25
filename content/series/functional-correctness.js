// Original AI Engineering series post. Rendered by src/pages/blog/SeriesPost.jsx;
// scheduled and given its sources in src/data/seriesPosts.js.
export const POST = {
  "id": "functional-correctness",
  "title": "Grading a model by running its code, not reading it",
  "excerpt": "For most outputs you argue about quality. For code you have a superpower: run it. Functional correctness turns grading into a thing you can measure.",
  "category": "AI",
  "tags": [
    "Evaluation",
    "Code",
    "Testing"
  ],
  "seriesNum": 34,
  "publishAt": "2026-06-29T12:00:00Z",
  "body": [
    {
      "type": "p",
      "text": "Picture a feature where a model writes small functions on request. The team hits the question everyone hits: how do you know the code is any good. Two engineers eyeball each generated function and disagree. One says it looks clean, the other spots a case it probably misses."
    },
    {
      "type": "p",
      "text": "They are both guessing, and they are about to ship guesses to users. Then someone points out the obvious thing they were all walking past: this is code. You do not have to argue about whether it works. You can run it."
    },
    {
      "type": "p",
      "text": "That sounds too simple to be a technique, but it is the most reliable evaluation method in the entire field, and it only works for a special kind of output. Most of what models produce, like an essay or a summary, has no single right answer, so you are stuck judging quality by opinion. Code is different. Code either produces the right output for a given input or it does not, and a machine can check that in milliseconds without caring how elegant the code looks. That checkability is the whole idea behind **functional correctness**."
    },
    {
      "type": "h2",
      "text": "The intuition: a checkable answer changes everything"
    },
    {
      "type": "p",
      "text": "When an answer is checkable, evaluation stops being a debate and becomes a measurement. You do not read the function and form an impression. You define what it should do as a set of inputs paired with the outputs you expect, you feed the inputs in, and you compare what comes out against what should have come out. The code passes or it fails, and your opinion of its style never enters into it. This is exactly how a human engineer gains confidence in their own code, and it works just as well for code a model wrote."
    },
    {
      "type": "h2",
      "text": "Walk a concrete example"
    },
    {
      "type": "p",
      "text": "Say you asked for a function that checks whether a number is prime. You do not squint at the logic. You write down cases you already know the answer to: 2 is prime, 7 is prime, 9 is not, 1 is not, and a large known prime is. You run the generated function on each one and compare."
    },
    {
      "type": "p",
      "text": "If it returns the right verdict on all of them, your confidence jumps. If it calls 1 a prime, you have found a real bug in seconds, and notice that the code may have looked perfectly reasonable to a human skimming it. Running it caught what reading it missed."
    },
    {
      "type": "h2",
      "text": "Naming the testing ideas"
    },
    {
      "type": "terms",
      "items": [
        {
          "term": "Functional correctness",
          "def": "whether code actually produces the right output for given inputs, judged by running it rather than reading it."
        },
        {
          "term": "Test case",
          "def": "one input paired with the output you expect, used to check the code."
        },
        {
          "term": "Test suite",
          "def": "the full set of test cases. The more thorough it is, the more the result means."
        },
        {
          "term": "Pass rate",
          "def": "the fraction of generated solutions that pass the whole suite. The headline number for this kind of evaluation."
        },
        {
          "term": "Edge case",
          "def": "an unusual or boundary input where naive code tends to break, like zero, an empty list, or a negative number."
        }
      ]
    },
    {
      "type": "h2",
      "text": "How this scales into a real evaluation"
    },
    {
      "type": "p",
      "text": "The same idea, scaled up, is how serious code benchmarks work. You collect a batch of programming problems, and for each one you write a hidden test suite that a correct solution must pass. You ask the model to solve all of them, run every solution against its tests in an automated harness, and report the **pass rate**: the share of problems it got fully right. Now you have a single honest number you can compare across models and across versions of your own prompt, and it came from execution, not from anybody's impression of the code. When a new model claims to be better at coding, this is usually the kind of measurement behind the claim."
    },
    {
      "type": "h2",
      "text": "The two catches that bite people"
    },
    {
      "type": "p",
      "text": "The first catch is that your evaluation is only as good as your tests. Passing the suite does not prove the code is correct, it only proves the code is not wrong in any way your tests check. If you never test the empty input, a function that crashes on empty input still passes, and you ship the crash. This is why **edge cases** matter so much: the boundary inputs are exactly where weak code fails and lazy test suites stay silent. A green checkmark means \"nothing I looked for is broken,\" not \"everything works,\" and treating the first as the second is how confident teams ship bugs."
    },
    {
      "type": "p",
      "text": "The second catch is safety. You are about to execute code that a model generated and that no human has fully vetted, which means you cannot run it directly on a machine you care about. Generated code can do destructive things by mistake, so it has to run inside a **sandbox**: an isolated environment with no access to your real files, network, or secrets, where the worst case is that the sandbox dies and you move on. Skipping this because \"it is just a prime checker\" is how an evaluation harness turns into a security incident. Isolate first, run second."
    },
    {
      "type": "h2",
      "text": "Where else this works"
    },
    {
      "type": "p",
      "text": "The method reaches beyond functions that return numbers. Anything with a checkable answer can be graded this way. Did the generated SQL return the rows it was supposed to."
    },
    {
      "type": "p",
      "text": "Does the regular expression match the strings it should and reject the ones it should not. Does the generated configuration actually parse. Whenever you can state success as \"produces this specific result,\" you can stop debating quality and start measuring it, and your evaluation becomes something you trust rather than something you argue about."
    },
    {
      "type": "p",
      "text": "So the team stopped eyeballing functions. They wrote test cases, including the nasty edge ones, ran every generated solution in a sandbox, and tracked the pass rate as they tuned their prompt. The disagreement between the two engineers evaporated, because there was now a number to point at instead of two opinions to defend. That is the quiet gift of any checkable task: evaluation gets to be a measurement, and you should take that gift every single time the task hands it to you."
    }
  ]
};
