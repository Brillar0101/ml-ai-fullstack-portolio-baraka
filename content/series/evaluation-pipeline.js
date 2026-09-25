// AI Engineering series post. Every factual claim is taken from the numbered sources at the end.
// Both charts are redrawn from table values (Ribeiro et al. 2020 Table 1, Card et al. 2020 Table 2);
// those papers' arXiv licenses do not permit figure reuse.
export const POST = {
  "id": "evaluation-pipeline",
  "title": "From CheckList tests to error bars: building an eval pipeline",
  "excerpt": "In 2019, three commercial sentiment APIs failed nearly every sentence like \"I thought the plane would be awful, but it wasn't.\" Build an evaluation pipeline in order: capability tests from CheckList, per-case scores, standard errors and paired comparisons from Miller, and a case count large enough to see the difference you care about.",
  "category": "AI",
  "tags": [
    "Evaluation",
    "Testing",
    "Statistics"
  ],
  "seriesNum": 38,
  "publishAt": "2026-07-03T12:00:00Z",
  "body": [
    {
      "type": "p",
      "text": "In November 2019, Marco Tulio Ribeiro and three colleagues paid for access to three commercial sentiment analysis services: Microsoft's Text Analytics, Google Cloud's Natural Language and Amazon's Comprehend. They fed them short sentences that a person would find trivial. \"The food is not poor\" should come back positive or neutral. Google's service got sentences of that kind wrong 54.2% of the time and Amazon's 29.4%. When the negation came at the end, as in \"I thought the plane would be awful, but it wasn't,\" the failure rate was near 100% for all three commercial models.[^1]"
    },
    {
      "type": "p",
      "text": "None of these were adversarial tricks. The paper, which introduced a testing method called **CheckList**, also found that the services changed their answer on 7.0% to 20.8% of airline tweets when only a city name was swapped, for example Cuba for Canada. And two research models fine-tuned on movie reviews, BERT and RoBERTa, did better than all three commercial models on almost every test that did not depend on predicting \"neutral\". That surprised the authors, since the commercial services listed social media as a use case and were regularly tested and improved using customer feedback.[^1]"
    },
    {
      "type": "chart",
      "kind": "bar",
      "title": "Failure rates of three commercial sentiment APIs on CheckList tests",
      "yLabel": "Failure rate (%)",
      "series": [
        {
          "label": "Microsoft",
          "key": "ms"
        },
        {
          "label": "Google",
          "key": "g"
        },
        {
          "label": "Amazon",
          "key": "a"
        }
      ],
      "data": [
        {
          "label": "Swap a city name",
          "values": {
            "ms": 7.0,
            "g": 20.8,
            "a": 14.8
          }
        },
        {
          "label": "Add a URL or handle",
          "values": {
            "ms": 9.6,
            "g": 13.4,
            "a": 24.8
          }
        },
        {
          "label": "Past vs present",
          "values": {
            "ms": 41.0,
            "g": 36.6,
            "a": 42.2
          }
        },
        {
          "label": "Negated negative",
          "values": {
            "ms": 18.8,
            "g": 54.2,
            "a": 29.4
          }
        },
        {
          "label": "Negation at the end",
          "values": {
            "ms": 100.0,
            "g": 90.4,
            "a": 100.0
          }
        }
      ],
      "caption": "Redrawn from Table 1 of Ribeiro et al., 2020.[^1] Each bar is the share of generated test cases the service got wrong. \"Past vs present\" is the test where the present opinion should win, as in \"I used to hate this airline, although now I like it.\" The services were queried through their paid APIs in November 2019; the authors report similar results from April 2020."
    },
    {
      "type": "p",
      "text": "A single accuracy number on a held-out test set would not have shown any of this. That is the problem an evaluation pipeline for an LLM application has to solve, and it has two halves. You need test cases that ask about specific behaviors, so a failure tells you what broke. Then you need enough statistics to know whether a change in the numbers is a change in the system or just noise from which cases you happened to pick. CheckList supplies the first half. Evan Miller's 2024 paper \"Adding Error Bars to Evals\" supplies the second.[^1,2] What follows builds the pipeline in the order you would build it."
    },
    {
      "type": "h2",
      "text": "Stage 1: write tests that each name a capability"
    },
    {
      "type": "p",
      "text": "CheckList organizes tests as a grid. The rows are **capabilities**, the linguistic skills the task depends on: vocabulary, named entities, negation, time order, coreference (knowing who \"he\" or \"her\" refers to), and so on. The columns are three test types. The paper asks you to fill as many cells as make sense for your task, and the capability list is meant as a starting point you extend for your own domain.[^1]"
    },
    {
      "type": "terms",
      "optional": false,
      "items": [
        {
          "term": "Minimum functionality test (MFT)",
          "def": "A small set of simple, labeled examples that check one behavior, like a unit test. \"I didn't love the flight\" should be negative. The paper says MFTs are good at catching models that use shortcuts on complex inputs without having learned the skill.[^1]"
        },
        {
          "term": "Invariance test (INV)",
          "def": "Apply a change that should not affect the answer, and check that the answer stays the same. Swapping one city name for another, or adding a typo, should not change the sentiment of a tweet.[^1]"
        },
        {
          "term": "Directional expectation test (DIR)",
          "def": "Apply a change whose effect you know in advance, and check the output moves the right way. Adding \"You are lame.\" to a complaint to an airline should not make it read more positive.[^1]"
        }
      ]
    },
    {
      "type": "p",
      "text": "INV and DIR tests have a practical advantage: they need no ground-truth labels. They check a relationship between two outputs, before and after a perturbation, so you can run them over unlabeled real traffic. The CheckList authors ran their sentiment INV and DIR tests over a dataset of unlabeled airline tweets.[^1]"
    },
    {
      "type": "p",
      "text": "Writing test cases one at a time is slow, so CheckList generates them from templates. \"I {NEGATION} {POS_VERB} the {THING}.\" with lists such as {didn't, can't say I} for the negation and {love, like} for the verb expands into every combination. To fill those lists, the tool can ask a masked language model for suggestions: \"I really {mask} the flight.\" returns verbs like enjoyed, liked, loved and regret, which the user sorts into positive, negative and neutral lists.[^1] The variety matters because, as the paper notes, a small set of cases can miss a failure when a model handles some forms of negation and not others."
    },
    {
      "type": "p",
      "text": "The method held up on a team that already tested heavily. The authors ran a session of about five hours with the Microsoft team responsible for the sentiment service, whose evaluation already included public benchmarks and in-house ones for things like negation and emojis. The team brainstormed about 30 tests, implemented about 20 in the time available, and found many bugs they had not known about. Among the new tests were camel-cased hashtags like \"#IHateYou\" and implicit negation like \"I wish it was good\".[^1] In a separate study, 18 participants given two hours to test a BERT model on duplicate-question detection wrote 5.8 tests on average without CheckList and 13.5 with the full template tools, and found 2.2 versus 6.2 bugs they rated severity 3 or higher on a five-point scale.[^1]"
    },
    {
      "type": "p",
      "text": "For an LLM application the same grid carries over. This is my reading, not the paper's: the rows become the behaviors your product promises, such as refusing out-of-scope requests or quoting a policy correctly, and the columns stay the same. An MFT is a set of plain requests with known right answers. An INV test rephrases a request or changes a customer's name. A DIR test adds a detail that should change the answer in a known direction."
    },
    {
      "type": "h2",
      "text": "Stage 2: turn each test into a score"
    },
    {
      "type": "p",
      "text": "CheckList reports each test as a **failure rate**: the fraction of its generated cases the model got wrong. For MFTs, wrong means the prediction did not match the label. INV and DIR tests need a tolerance, because a model's confidence always moves a little. In the paper, an INV case fails only when the predicted label changes and the probability moves by more than 0.1. A DIR case adding positive phrases fails if the sentiment score goes down by more than 0.1.[^1] Choosing that tolerance is a design decision, and writing it down is part of the test."
    },
    {
      "type": "p",
      "text": "A score per test case is also the raw material for everything statistical that comes next. Call the score on case \\(i\\) \\(s_i\\). It can be 0 or 1 (pass or fail), or a continuous value such as a probability. Continuous scores tend to be less noisy. Miller shows that for multiple-choice questions answered in a single token, scoring with the probability of the correct token instead of grading one sampled answer removes the sampling noise entirely.[^2] Madaan and colleagues, who trained a set of 7B models that differed only in random seed, found that continuous metrics tracked training progress more steadily than discrete ones on almost every benchmark they studied.[^3]"
    },
    {
      "type": "p",
      "text": "When a probability is not available, for example with long generated answers, Miller suggests sampling each case \\(K\\) times and scoring the case by the mean of its \\(K\\) results. He advises against lowering the sampling temperature to make scores less noisy. That changes the model you are measuring, and in his worked examples it can raise the variance of per-question scores rather than lower it.[^2]"
    },
    {
      "type": "h2",
      "text": "Stage 3: put an error bar on every number"
    },
    {
      "type": "p",
      "text": "Miller's starting assumption is that your test cases are a random sample from a much larger, unseen population of cases you could have written. The mean score over your \\(n\\) cases is an estimate of the mean over that population, and it has a **standard error**: roughly, how far the estimate would typically move if you drew a fresh set of \\(n\\) cases.[^2]"
    },
    {
      "type": "eq",
      "tex": "\\begin{gathered} \\bar{s} = \\frac{1}{n}\\sum_{i=1}^{n} s_i \\\\[4pt] \\mathrm{SE} = \\sqrt{\\frac{1}{n}\\cdot\\frac{1}{n-1}\\sum_{i=1}^{n}(s_i-\\bar{s})^2} \\end{gathered}",
      "caption": "The mean score and its standard error from the Central Limit Theorem, Equation 1 of Miller, 2024.[^2]"
    },
    {
      "type": "p",
      "text": "Here \\(n\\) is the number of test cases, \\(s_i\\) is the score on case \\(i\\), and \\(\\bar{s}\\) is their average. The sum under the root is the sample variance of the scores, and dividing it by \\(n\\) gives the variance of the mean. When every score is 0 or 1, the formula reduces to \\(\\sqrt{\\bar{s}(1-\\bar{s})/n}\\), and a 95% confidence interval is \\(\\bar{s} \\pm 1.96 \\times \\mathrm{SE}\\).[^2] A pass rate of 80% on 400 cases has a standard error of 2 points, so its interval runs from about 76% to 84%. Miller also notes the Central Limit Theorem makes bootstrapping unnecessary for plain averages over many cases.[^2]"
    },
    {
      "type": "p",
      "text": "The formula assumes the cases were drawn independently. Many evals break that: reading comprehension sets ask several questions about one passage, and a multilingual set can contain the same question in several languages. For grouped questions, Miller gives a **clustered standard error** that adds the correlations within each group.[^2] On real Anthropic model results he reports, the clustered error was 3.05 times the naive one on DROP, 1.88 times on MGSM and 1.10 times on RACE-H.[^2] Template-generated CheckList cases look like clusters to me, since every case from one template shares its wording. That link is my inference; neither paper tests it."
    },
    {
      "type": "h2",
      "text": "Stage 4: compare two versions on the same cases"
    },
    {
      "type": "p",
      "text": "A pipeline is rarely asked \"how good is this model?\" It is asked whether version B beats version A. The naive way treats the two scores as independent, so the standard error of the difference is \\(\\sqrt{\\mathrm{SE}_A^2 + \\mathrm{SE}_B^2}\\). Both versions usually run on the same cases, though, and Miller's recommendation is to analyze the difference case by case.[^2]"
    },
    {
      "type": "eq",
      "tex": "\\begin{gathered} d_i = s_{A,i} - s_{B,i} \\\\[4pt] \\mathrm{SE}_{\\text{paired}} = \\sqrt{\\frac{1}{n}\\cdot\\frac{1}{n-1}\\sum_{i=1}^{n}(d_i-\\bar{d})^2} \\\\[4pt] z = \\bar{d}\\,/\\,\\mathrm{SE}_{\\text{paired}} \\end{gathered}",
      "caption": "The paired-difference standard error and z-score, Equations 6 and 7 of Miller, 2024.[^2]"
    },
    {
      "type": "p",
      "text": "\\(d_i\\) is the score difference on case \\(i\\), \\(\\bar{d}\\) is the mean difference, and \\(z\\) says how many standard errors that mean lies from zero. If \\(|z|\\) exceeds 1.96, the difference is significant at the 5% level, which is the same as saying the 95% interval \\(\\bar{d} \\pm 1.96 \\times \\mathrm{SE}_{\\text{paired}}\\) excludes zero. Pairing helps whenever the two versions agree on which cases are easy and which are hard, because that shared difficulty cancels in \\(d_i\\). Miller shows the paired variance equals the unpaired variance minus twice the covariance of the two versions' true per-case scores, divided by \\(n\\). In his example with a correlation of 0.5, pairing cuts the variance by a third.[^2]"
    },
    {
      "type": "p",
      "text": "His motivating example uses two fictional models. \"Dreadnought\" beats \"Galleon\" on two of three evals, HumanEval and MGSM, and looks like the better model. With paired standard errors, only Galleon's 2.5-point lead on MATH has an interval that excludes zero; Dreadnought's leads of 3.1 and 2.7 points do not. The careful reading reverses the first impression.[^2]"
    },
    {
      "type": "h2",
      "text": "How many test cases a 3-point gain needs"
    },
    {
      "type": "p",
      "text": "The last formula runs the other way: given the difference you care about, how many cases do you need? The inputs are a significance level \\(\\alpha\\) (the false-alarm rate you accept), a power \\(1-\\beta\\) (how often a real difference of that size should be detected), and the **minimum detectable effect** \\(\\delta\\).[^2]"
    },
    {
      "type": "eq",
      "tex": "n = \\frac{(z_{\\alpha/2} + z_{\\beta})^2\\,\\bigl(\\omega^2 + \\sigma_A^2/K_A + \\sigma_B^2/K_B\\bigr)}{\\delta^2}",
      "caption": "Sample-size formula for a paired comparison, Equation 9 of Miller, 2024.[^2]"
    },
    {
      "type": "p",
      "text": "\\(z_p\\) is the point of the standard normal distribution with probability \\(p\\) above it, so \\(z_{0.025} = 1.96\\) and \\(z_{0.20} \\approx 0.84\\). \\(\\omega^2\\) is the variance of the true per-case differences between the versions. \\(\\sigma_A^2\\) and \\(\\sigma_B^2\\) are the average sampling noise per case for each version, and \\(K_A\\), \\(K_B\\) are how many times each case is sampled. With \\(K=1\\), the three terms together are the variance of the observed \\(d_i\\), which a pilot run can estimate. That last step is my reading of his variance decomposition.[^2] Miller's own example, with \\(\\omega^2 = 1/9\\) and \\(\\delta = 0.03\\), needs about 969 questions, and he concludes new evals should contain at least 1,000.[^2]"
    },
    {
      "type": "callout",
      "title": "Worked example (illustrative, made-up counts)",
      "text": "A team tests a new prompt B against the current prompt A on 400 pass/fail cases. A passes 320 (80%) and B passes 332 (83%). The two prompts disagree on 40 cases: B alone passes 26 and A alone passes 14. So \\(\\bar{d} = 12/400 = 0.03\\) and each \\(d_i\\) is +1, 0 or \\(-1\\). The variance of \\(d_i\\) is \\(40/400 - 0.03^2 = 0.0991\\), so \\(\\mathrm{SE}_{\\text{paired}} = \\sqrt{0.0991/400} \\approx 0.0157\\) and \\(z \\approx 1.91\\). The 95% interval is \\(-0.1\\) to \\(+6.1\\) points. It includes zero, so this run cannot call the gain real. To detect a true 3-point gain 80% of the time at \\(\\alpha = 0.05\\), assuming the same 10% disagreement rate: \\(n = 7.85 \\times 0.0991 / 0.03^2 \\approx 865\\) cases. Without pairing, the variance would be \\(0.8 \\times 0.2 + 0.83 \\times 0.17 = 0.301\\) and the same target would need about 2,626 cases. At \\(n = 400\\), the smallest gain this test can reliably detect is about 4.4 points."
    },
    {
      "type": "p",
      "text": "The example shows where the leverage is. Most of a paired comparison's noise comes from the cases where the versions disagree, so two prompts that mostly agree can be compared on fewer cases than two unrelated models. And because \\(n\\) scales with \\(1/\\delta^2\\), halving the gain you want to detect quadruples the cases you need.[^2]"
    },
    {
      "type": "h2",
      "text": "Deciding when a change is real"
    },
    {
      "type": "p",
      "text": "The rule that falls out is short. Before running, decide the smallest difference worth acting on and check that your case count can detect it. After running, ship only if the paired interval excludes zero. A difference smaller than the minimum detectable effect is not evidence of no change. It means the test could not tell."
    },
    {
      "type": "p",
      "text": "Skipping the first step has a cost that Dallas Card and colleagues measured across NLP. They estimated, for several GLUE test sets, the smallest improvement over the top model that a test of that size could detect with 80% power, and compared it with the average improvement papers claiming a new state of the art had reported. For the three smallest test sets, WNLI, MRPC and SST-2, the typical claimed gain was well below that threshold.[^4] They also point out that when underpowered experiments do come out significant, the measured difference tends to overstate the true one.[^4]"
    },
    {
      "type": "chart",
      "kind": "bar",
      "title": "Smallest detectable gain vs. typical claimed gain, GLUE tasks",
      "yLabel": "Accuracy points",
      "series": [
        {
          "label": "Est. minimum detectable effect",
          "key": "mde",
          "baseline": true
        },
        {
          "label": "Mean claimed improvement",
          "key": "d"
        }
      ],
      "data": [
        {
          "label": "WNLI (147)",
          "values": {
            "mde": 5.26,
            "d": 1.72
          }
        },
        {
          "label": "MRPC (1,725)",
          "values": {
            "mde": 1.62,
            "d": 0.63
          }
        },
        {
          "label": "SST-2 (1,821)",
          "values": {
            "mde": 1.02,
            "d": 0.57
          }
        },
        {
          "label": "RTE (3,000)",
          "values": {
            "mde": 1.23,
            "d": 3.89
          }
        },
        {
          "label": "QNLI (5,463)",
          "values": {
            "mde": 0.55,
            "d": 1.31
          }
        },
        {
          "label": "QQP (390,965)",
          "values": {
            "mde": 0.11,
            "d": 0.36
          }
        }
      ],
      "caption": "Redrawn from Table 2 of Card et al., 2020.[^4] Test-set size in parentheses. The minimum detectable effect is their estimate at 80% power against the leaderboard's top model as of May 2020; the claimed improvement is the average gain over baseline reported by surveyed papers claiming a new state of the art. Where the blue bar is shorter than the gray one, a typical claim was smaller than the test could reliably detect."
    },
    {
      "type": "p",
      "text": "Their machine translation estimate gives a sense of scale: a typical test set of 2,000 sentences has about 75% power to detect a 1 BLEU point difference.[^4] By Miller's formula, a suite of a few dozen hand-written cases can only detect large differences, on the order of the collapses in the chart at the top of this post."
    },
    {
      "type": "p",
      "text": "There is a second way a static suite goes stale. The Dynabench authors point out that GLUE saturated within a year of release, and that challenge sets often lack statistical power, which is one reason they argue for collecting test data dynamically against current models.[^5] A pipeline's test cases need the same upkeep: once a model passes a test every time, the test tells you only about regressions."
    },
    {
      "type": "h2",
      "text": "What a clean run does not prove"
    },
    {
      "type": "p",
      "text": "CheckList's own authors state the limit plainly. The commercial models passed their simple fairness checks, such as always predicting \"I am a black woman.\" as neutral. \"Similar to software engineering,\" they write, \"absence of test failure does not imply that these models are fair,\" only that they are \"not unfair enough to fail these simple tests.\"[^1] They also list what behavioral testing cannot reach at all: data versioning problems, labeling errors, annotator biases, worst-case security issues and lack of interpretability.[^1] A pipeline built this way measures, with honest error bars, the behaviors someone thought to write down. Everything else is outside it."
    },
    {
      "type": "sources",
      "numbered": true,
      "items": [
        {
          "title": "Ribeiro, Wu, Guestrin, and Singh, Beyond Accuracy: Behavioral Testing of NLP Models with CheckList, ACL 2020",
          "url": "https://arxiv.org/abs/2005.04118"
        },
        {
          "title": "Miller, Adding Error Bars to Evals: A Statistical Approach to Language Model Evaluations, 2024",
          "url": "https://arxiv.org/abs/2411.00640"
        },
        {
          "title": "Madaan et al., Quantifying Variance in Evaluation Benchmarks, 2024",
          "url": "https://arxiv.org/abs/2406.10229"
        },
        {
          "title": "Card et al., With Little Power Comes Great Responsibility, EMNLP 2020",
          "url": "https://arxiv.org/abs/2010.06595"
        },
        {
          "title": "Kiela et al., Dynabench: Rethinking Benchmarking in NLP, NAACL 2021",
          "url": "https://arxiv.org/abs/2104.14337"
        }
      ]
    }
  ]
};
