// AI Engineering series post, rewritten against research papers.
// Rendered by src/pages/blog/SeriesPost.jsx and scheduled in src/data/seriesPosts.js.
// Every factual claim is cited to the numbered sources at the end. The bar chart
// is redrawn from Table 3 of Liu et al. (arXiv 2305.01210, arXiv non-exclusive
// license, so no figure reuse). SWE-bench Figure 1 is reproduced under CC BY 4.0
// (arXiv 2310.06770). The flow diagram is redrawn from Figure 2 of Liu et al.
export const POST = {
  "id": "functional-correctness",
  "title": "When the tests got bigger: how thin test suites overstate code correctness",
  "excerpt": "EvalPlus gave each HumanEval problem about 80 times more tests, and GPT-4's greedy pass rate fell from 88.4% to 76.2%. What the original tests missed, how pass@k is actually computed, and what changes when the task is a whole repository.",
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
      "text": "In 2023 a team at the University of Illinois took HumanEval, the 164-problem Python benchmark that most code models were being scored on, and changed one thing: the tests. The original problems carried 9.6 tests each on average. Their version, HumanEval+, carried 764.1.[^1] The problems and the models stayed the same (the authors also repaired some reference solutions, covered below). GPT-4's pass rate with greedy decoding went from 88.4% to 76.2%. ChatGPT went from 73.2% to 63.4%. CodeLlama-34B went from 51.8% to 42.7%.[^1]"
    },
    {
      "type": "p",
      "text": "The models did not get worse. Their code was checked against more inputs, and more of it was caught being wrong. The authors call this **test inadequacy**: a suite too thin to separate code that is correct from code that only looks correct on a handful of inputs. They describe the gap as correctness being \"largely over-approximated\" by existing benchmarks.[^1]"
    },
    {
      "type": "chart",
      "kind": "bar",
      "title": "Greedy pass@1 on the same problems, before and after adding tests",
      "yLabel": "pass@1 (%)",
      "series": [
        { "label": "HumanEval (original tests)", "key": "base", "baseline": true },
        { "label": "HumanEval+ (added tests)", "key": "plus" }
      ],
      "data": [
        { "label": "GPT-4", "values": { "base": 88.4, "plus": 76.2 } },
        { "label": "WizardCoder-CodeLlama 34B", "values": { "base": 73.2, "plus": 64.6 } },
        { "label": "ChatGPT", "values": { "base": 73.2, "plus": 63.4 } },
        { "label": "Phind-CodeLlama 34B", "values": { "base": 71.3, "plus": 67.1 } },
        { "label": "CodeLlama 34B", "values": { "base": 51.8, "plus": 42.7 } },
        { "label": "StarCoder 15B", "values": { "base": 34.1, "plus": 29.3 } },
        { "label": "CodeGen 16B", "values": { "base": 32.9, "plus": 26.8 } }
      ],
      "caption": "Redrawn from Table 3 of Liu et al., 2023.[^1] Each value is the pass rate of one greedy-decoded sample per problem (the paper's pass@1 with a star). The order changes: on the original tests neither 34B open model beats ChatGPT; on HumanEval+ both do."
    },
    {
      "type": "p",
      "text": "The ranking moved too, which matters more for anyone choosing a model. On the original tests, WizardCoder-CodeLlama and Phind-CodeLlama were no better than ChatGPT. With the added tests, both came out ahead.[^1] Across all 26 models and all values of k they measured, the paper reports pass@k falling by up to 19.3% to 28.9%, depending on k.[^1] Two ideas explain why a benchmark can be this far off and still be the right kind of benchmark: why code is graded by running it at all, and why running it is only as good as the inputs you run it on."
    },
    {
      "type": "terms",
      "optional": false,
      "items": [
        {
          "term": "Functional correctness",
          "def": "whether a program produces the expected output for its inputs. It is judged by executing the program, not by comparing its text to anything."
        },
        {
          "term": "Reference solution",
          "def": "the one correct implementation a benchmark author wrote for a problem. EvalPlus calls it the ground truth."
        },
        {
          "term": "Unit test",
          "def": "a single input paired with the expected output, run automatically. A test suite is the set of them for one problem."
        },
        {
          "term": "BLEU",
          "def": "a machine translation score that counts how many short word sequences (n-grams) a candidate shares with a reference text."
        }
      ]
    },
    {
      "type": "h2",
      "text": "A reference solution is one of many right answers"
    },
    {
      "type": "p",
      "text": "Before execution-based benchmarks, generated code was mostly scored the way translations are: line it up against a reference solution and measure the overlap, either as an exact match or with a fuzzy score such as BLEU.[^2] The Codex paper from OpenAI, which introduced HumanEval in 2021, argues that this is the wrong tool. Match-based metrics cannot account for the large and complex space of programs that are functionally equivalent to the reference.[^2] A loop and a list comprehension can compute the same thing and share few tokens. Two programs can also share almost every token and differ in one comparison operator."
    },
    {
      "type": "p",
      "text": "Chen et al. tested this directly. They computed BLEU for every Codex-12B sample on HumanEval against the reference solution, then plotted the scores separately for samples that passed the tests and samples that failed. On the four random problems they show, the two distributions overlap heavily.[^2] Since a failing sample must disagree with the reference on at least one input, they concluded that improvements in BLEU may not indicate improved rates of functional correctness.[^2] Put plainly, raising BLEU is not the same goal as making code work. Earlier work had reached a related conclusion from the other side: the CodeBLEU authors note that BLEU was designed for natural language, ignores the syntax and meaning of code, and can favor candidates with high n-gram overlap and serious logic errors.[^3]"
    },
    {
      "type": "p",
      "text": "So Codex graded by execution. Each HumanEval problem is a function signature and docstring, with a hand-written body as reference and an average of 7.7 unit tests.[^2] (EvalPlus counts 9.6 because four problems, such as add(x, y), check against the reference on more than 100 random inputs; without those the average is 7.3.[^1]) The problems were written by hand because Codex had been trained on a large share of GitHub, which already holds solutions to many public puzzle sets.[^2] Running untrusted model output is itself a risk, so the harness executed samples inside a gVisor sandbox with firewall rules blocking network connections other than those needed to control the experiment.[^2] The paper also makes the case in terms engineers use every day: test-driven development defines success as passing the tests, and merging new code usually depends on passing unit tests.[^2]"
    },
    {
      "type": "h2",
      "text": "Counting passes: pass@k, term by term"
    },
    {
      "type": "p",
      "text": "Once correctness is pass or fail, the next question is how many tries a model gets. Kulal et al. faced this in their 2019 SPoC work on translating pseudocode to C++: a system got a budget of up to 100 compile-and-run trials against public test cases, and its final program was then checked on hidden tests as well.[^4] Chen et al. cite that work for the metric they adopt, **pass@k**: generate k samples per problem, count the problem as solved if any sample passes all its unit tests, and report the fraction of problems solved.[^2]"
    },
    {
      "type": "p",
      "text": "Measured literally, with exactly k samples, that number is noisy. Chen et al. instead draw more samples than they need and compute an estimate from the counts.[^2] For each problem they generate \\(n \\ge k\\) samples (they used \\(n = 200\\) and \\(k \\le 100\\)) and count the \\(c\\) samples that pass.[^2] Then:"
    },
    {
      "type": "eq",
      "tex": "\\text{pass@}k = \\mathop{\\mathbb{E}}_{\\text{problems}} \\left[ 1 - \\frac{\\binom{n-c}{k}}{\\binom{n}{k}} \\right]",
      "caption": "The unbiased pass@k estimator, equation 1 of Chen et al., 2021.[^2]"
    },
    {
      "type": "p",
      "text": "Read it from the inside out. \\(\\binom{n}{k}\\) is the number of ways to choose k samples from the n you generated. \\(\\binom{n-c}{k}\\) is the number of ways to choose k samples that are all failures, taken only from the \\(n - c\\) failing ones. Their ratio is the chance that a random draw of k samples, without replacement, contains no passing sample. One minus that is the chance at least one passes. \\(\\mathbb{E}\\) averages this over every problem in the benchmark. When \\(n - c < k\\), any draw of k must include a passing sample, and the estimate is 1.[^2]"
    },
    {
      "type": "p",
      "text": "The obvious shortcut is to measure the single-sample pass rate \\(\\hat{p}\\) and report \\(1 - (1 - \\hat{p})^k\\). Chen et al. show in their appendix that this is biased: it consistently underestimates pass@k, and the gap does not fully close even with more than 5k samples.[^2] Their formula avoids that because it counts draws without replacement from a fixed pool, and they prove its expectation equals \\(1 - (1 - p)^k\\), where p is the true pass@1.[^2] Computing the binomial coefficients directly produces huge numbers, so the paper gives a numerically stable version that multiplies the terms one at a time.[^2]"
    },
    {
      "type": "p",
      "text": "With this estimator, Codex-12B scored 28.81% at pass@1, 46.81% at pass@10 and 72.31% at pass@100.[^2] EvalPlus used the same unbiased estimator, with 200 samples per problem at four temperatures, plus one greedy sample for the starred pass@1 in the chart above.[^1] Notice what the formula takes for granted. It trusts c completely. Every sample the tests call correct counts as correct, and a thin suite inflates c before any of the arithmetic starts."
    },
    {
      "type": "h2",
      "text": "What the added tests caught"
    },
    {
      "type": "p",
      "text": "Writing hundreds of good tests per problem by hand is slow, so EvalPlus generated them. First it prompted ChatGPT with the reference solution and a few existing test inputs and asked for difficult, complex and corner-case inputs, keeping about 30 seed inputs per problem.[^1] Then it ran type-aware mutation: repeatedly pick a seed and alter it according to its type, for example adding or subtracting 1 from a number, removing or repeating an item in a list, or repeating a substring.[^1] That produced about 1,000 more inputs per problem within a one-hour budget.[^1] Generated inputs carry no expected output, so EvalPlus used **differential testing**: run the reference solution and the model's code on the same input and flag any difference.[^1]"
    },
    {
      "type": "diagram",
      "nodes": [
        { "label": "Original tests", "detail": "9.6 per problem on average" },
        { "label": "ChatGPT seed inputs", "detail": "corner cases, read from the reference code" },
        { "label": "Type-aware mutation", "detail": "about 1,000 new inputs per problem" },
        { "label": "Differential testing", "detail": "model output must equal reference output" }
      ],
      "caption": "How EvalPlus builds HumanEval+, redrawn from Figure 2 of Liu et al., 2023.[^1] Invalid inputs are filtered out by contracts before they reach the comparison step."
    },
    {
      "type": "p",
      "text": "Some generated inputs would be unfair, such as a negative number for a function that only promises to handle positive ones. The authors added hand-written contracts, assertions like assert n > 0, to 83 of the 164 problems so that ill-formed inputs are discarded instead of being counted against the model.[^1] The oracle is also strict about time. Instead of the original three seconds for a whole suite, each test gets the larger of 200 ms or four times the reference solution's run time.[^1] Under that rule a slow solution is a wrong solution."
    },
    {
      "type": "p",
      "text": "The paper's opening example shows the kind of bug the original tests let through. Asked for the sorted unique elements common to two lists (HumanEval problem 58), ChatGPT wrote code that took a set intersection, sorted it, then converted the sorted list back into a set before returning it.[^1] A Python set does not preserve order. On the three original test inputs the output happened to come out sorted and the code passed. On the added input [6,8,1], [6,8,1] it returned [8,1,6].[^1]"
    },
    {
      "type": "p",
      "text": "Looking across problems, the authors found that the hardest tasks for models involved multiple conditions (splitting words), completeness (handling negative numbers in an is-prime check), reasoning (the Tribonacci sequence) and efficiency (the n-th prime Fibonacci number).[^1] Problems like adding two numbers were easy both to solve and to test by hand. The gap between original and added tests showed up at every level of difficulty.[^1]"
    },
    {
      "type": "p",
      "text": "The reference solutions had bugs too. Checking the originals against their own re-implementations, the authors found 18 defective ground truths, 11% of the benchmark: five that fail on corner-case inputs such as an empty list or string, ten with incorrect logic, and three too slow for reasonably sized inputs.[^1] One date validator used and and or without parentheses. Because Python's and binds tighter than or, it rejected the valid date 12-31-1999, and none of the original tests exposed it.[^1] A benchmark with a wrong reference solution penalizes models that write correct code."
    },
    {
      "type": "p",
      "text": "Most of the 764 tests turned out to be redundant. Using a greedy set-cover algorithm that keeps the same branch coverage, the same killed mutants (small artificial bugs seeded into the reference) and the same detected wrong samples from other models, they cut the suite to 16.1 tests per problem, 47 times smaller.[^1] GPT-4 scored 78.0% on the reduced suite, against 76.2% on the full one and 88.4% on the original.[^1] Since the reduced count includes the original tests, my reading is that most of the drop comes from roughly six or seven extra tests per problem, aimed at inputs the original authors had not thought of. Volume was not what the original suite lacked."
    },
    {
      "type": "h2",
      "text": "From one function to a whole repository"
    },
    {
      "type": "p",
      "text": "HumanEval problems are self-contained and usually solved in a few lines. SWE-bench, published by Jimenez et al. at Princeton in the same year, keeps execution as the judge but changes the unit of work to a real GitHub issue in a real codebase.[^5] The authors started from about 90,000 pull requests in 12 popular Python repositories and kept only those that resolved an issue, changed test files, and had at least one test that failed before the pull request and passed after it. That left 2,294 tasks.[^5]"
    },
    {
      "type": "image",
      "src": "/blog-images/functional-correctness/swe-bench-task.webp",
      "alt": "A SWE-bench task: an issue about a data leak in scikit-learn's gradient boosting plus a codebase go into a language model, which produces a patch touching several files; the patch is scored by unit tests that failed before the real pull request and passed after it.",
      "width": 1800,
      "height": 450,
      "caption": "Figure 1 from Jimenez et al., 2024,[^5] reproduced under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). The Pre PR and Post PR columns show test status before and after the human fix."
    },
    {
      "type": "p",
      "text": "The model receives the issue text and the codebase and must produce a patch. The patch counts only if it applies cleanly and every associated test passes.[^5] Those tests come in two kinds. **Fail-to-pass** tests check that the issue is fixed; every task has at least one, and 40% have two or more. **Pass-to-pass** tests check that nothing that already worked is broken, and a median of 51 of them run per task.[^5] That second group is something HumanEval never had. A function-level benchmark asks whether new code is right. A repository benchmark also asks whether it broke anything else."
    },
    {
      "type": "p",
      "text": "The reference fixes edited 1.7 files, 3.0 functions and 32.8 lines on average.[^5] Results at publication were low. With BM25 retrieval choosing which files to show the model, Claude 2 resolved 1.96% of issues and ChatGPT-3.5 resolved 0.17%. Given the files the real fix had edited, Claude 2 reached 4.8%.[^5] The revised paper adds Claude 3 Opus at 3.79% with BM25 retrieval.[^5] Among applied patches that did not resolve their issue, most passed none of the fail-to-pass tests, and 60% to 70% of those changed nothing the tests could detect. The rest broke existing behavior.[^5]"
    },
    {
      "type": "callout",
      "title": "The same lesson, one level up",
      "text": "SWE-bench only admits a task if a human-written test flips from fail to pass, so each task has an executable definition of fixed.[^5] That definition is only as wide as the tests the original contributor wrote. The EvalPlus result is a reason to read a resolve rate the way you would read a HumanEval score: as an upper bound set by the tests.[^1] This is the author's reading, not a measurement from either paper."
    },
    {
      "type": "h2",
      "text": "What a passing test still cannot tell you"
    },
    {
      "type": "p",
      "text": "EvalPlus begins by admitting what tests cannot do. Ideally one would formally verify generated code for every input, the authors write, but building a general verifier for arbitrary problems is out of reach, so benchmarks fall back on tests. They close by suggesting that future work pair their generated tests with formal verification to get stronger guarantees.[^1] The SWE-bench authors state a limit in the other direction. Even with a program that passes, they write, relying solely on execution-based testing is insufficient to guarantee reliable performance of model generations, because they found model-written patches can frequently be less comprehensive, efficient or readable than human-written solutions.[^5]"
    },
    {
      "type": "sources",
      "numbered": true,
      "items": [
        { "title": "Liu, Xia, Wang and Zhang, \"Is Your Code Generated by ChatGPT Really Correct? Rigorous Evaluation of Large Language Models for Code Generation\" (EvalPlus), NeurIPS 2023", "url": "https://arxiv.org/abs/2305.01210" },
        { "title": "Chen et al., \"Evaluating Large Language Models Trained on Code\" (Codex and HumanEval), 2021", "url": "https://arxiv.org/abs/2107.03374" },
        { "title": "Ren et al., \"CodeBLEU: a Method for Automatic Evaluation of Code Synthesis\", 2020", "url": "https://arxiv.org/abs/2009.10297" },
        { "title": "Kulal et al., \"SPoC: Search-based Pseudocode to Code\", NeurIPS 2019", "url": "https://arxiv.org/abs/1906.04908" },
        { "title": "Jimenez et al., \"SWE-bench: Can Language Models Resolve Real-World GitHub Issues?\", ICLR 2024", "url": "https://arxiv.org/abs/2310.06770" }
      ]
    }
  ]
};
