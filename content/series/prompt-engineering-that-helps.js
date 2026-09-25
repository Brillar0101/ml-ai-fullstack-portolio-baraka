// Original AI Engineering series post. Rendered by src/pages/blog/SeriesPost.jsx;
// scheduled in src/data/seriesPosts.js. Every factual claim is taken from the
// numbered sources at the end. The OPRO figure is reproduced under CC0 1.0
// (arXiv 2309.03409); the charts are redrawn from table values in OPRO and GPT-3.
export const POST = {
  "id": "prompt-engineering-that-helps",
  "title": "Prompting Folklore, Checked Against What Papers Measured",
  "excerpt": "An optimizer found that \"Take a deep breath and work on this problem step-by-step.\" lifted PaLM 2-L to 80.2% on GSM8K. Four popular prompting claims, each set against what a paper actually measured, including where the effect was tiny or belonged to one model.",
  "category": "AI",
  "chapter": "Chapter 5",
  "tags": [
    "Prompt Engineering",
    "In-context Learning",
    "Prompt Optimization"
  ],
  "seriesNum": 8,
  "publishAt": "2026-01-21T12:00:00Z",
  "body": [
    {
      "type": "p",
      "text": "In September 2023 a Google DeepMind team published a table of instructions for grade school math problems. The best one was not written by a person. It was \"Take a deep breath and work on this problem step-by-step.\" Placed at the start of the answer, it got the pre-trained PaLM 2-L model to 80.2% accuracy on the GSM8K test set, with no worked examples in the prompt. The best human-written instruction the paper compared, \"Let's think step by step.\", scored 71.8%. With no instruction at all, the same model scored 34.0%.[^1] Another language model, an instruction-tuned PaLM 2-L, had proposed the winning sentence during an iterative search in which every candidate was scored on a small slice of training problems.[^1]"
    },
    {
      "type": "p",
      "text": "GSM8K is a dataset of 8.5K grade school math word problems that take several steps to solve, built by OpenAI to measure multi-step reasoning.[^2] The paper that ran the search calls its method OPRO, short for Optimization by PROmpting, and reports that its best prompts beat human-designed ones by up to 8% on GSM8K and by up to 50% on Big-Bench Hard tasks.[^1]"
    },
    {
      "type": "p",
      "text": "The deep-breath sentence sounds like prompting folklore: a motivational line that someone found once and everyone repeats. Here it is a measured number, with a model name, a benchmark and a baseline attached. That contrast is the point of this post. Most prompting advice arrives as a claim. A handful of papers took those claims and measured them. Below are four claims people repeat, each followed by what a paper actually found, including the places where the effect was small, flipped sign, or held only for one model."
    },
    {
      "type": "terms",
      "optional": false,
      "items": [
        {
          "term": "Instruction",
          "def": "the plain-language part of a prompt that says what to do, as opposed to the question itself or any worked examples."
        },
        {
          "term": "Zero-shot, one-shot, few-shot",
          "def": "how many solved examples (demonstrations) sit in the prompt before the real question: none, one, or several. No weights change in any of them."
        },
        {
          "term": "Scorer model",
          "def": "in OPRO, the model whose accuracy is being improved. Each candidate instruction is run on it and graded."
        },
        {
          "term": "Optimizer model",
          "def": "in OPRO, the model that reads past instructions and their scores and writes new candidates."
        },
        {
          "term": "Execution accuracy",
          "def": "the share of test questions a model gets right when it follows a given instruction. APE and OPRO both rank instructions by it."
        }
      ]
    },
    {
      "type": "chart",
      "kind": "bar",
      "title": "PaLM 2-L zero-shot accuracy on GSM8K, by instruction",
      "yLabel": "Test accuracy (%)",
      "series": [
        {
          "label": "Accuracy",
          "key": "a"
        }
      ],
      "data": [
        {
          "label": "No instruction",
          "values": {
            "a": 34.0
          }
        },
        {
          "label": "APE's step-by-step phrase",
          "values": {
            "a": 58.8
          }
        },
        {
          "label": "\"Let's solve the problem.\"",
          "values": {
            "a": 60.8
          }
        },
        {
          "label": "\"Let's think step by step.\"",
          "values": {
            "a": 71.8
          }
        },
        {
          "label": "Found by gpt-4",
          "values": {
            "a": 74.5
          }
        },
        {
          "label": "Found by gpt-3.5-turbo",
          "values": {
            "a": 78.5
          }
        },
        {
          "label": "\"Break this down.\"",
          "values": {
            "a": 79.9
          }
        },
        {
          "label": "\"Take a deep breath...\"",
          "values": {
            "a": 80.2
          }
        }
      ],
      "caption": "Redrawn from Table 4 of Yang et al., 2023.[^1] The first four are human-written or baseline instructions; the last four were found by OPRO with different optimizer models. All use pre-trained PaLM 2-L as the scorer, with the instruction placed at the start of the answer."
    },
    {
      "type": "h2",
      "text": "Claim one: putting examples in the prompt helps"
    },
    {
      "type": "p",
      "text": "This is the oldest claim and the best supported one. The GPT-3 paper built its whole evaluation around it. For each task the authors ran the 175 billion parameter model three ways: few-shot, with as many demonstrations as fit in the context window (typically 10 to 100); one-shot, with a single demonstration; and zero-shot, with only a plain-language instruction.[^3] Across 42 benchmarks scored by accuracy, zero-shot performance rose steadily with model size, and few-shot performance rose faster, which the authors read as larger models being better at learning from context.[^3]"
    },
    {
      "type": "p",
      "text": "The per-task tables are more interesting than the aggregate, because the gain from examples varies a lot. On WebQuestions, closed-book question answering went from 14.4% zero-shot to 41.5% few-shot. On three-digit addition it went from 34.2% to 80.4%. On TriviaQA, a task the model already did well, the rise was smaller: 64.3% to 71.2%.[^3] Then there are tasks where examples barely registered. On ARC Challenge, multiple-choice questions from grade school science exams filtered to defeat simple retrieval methods, the model scored 51.4% zero-shot and 51.5% few-shot. On the high school split of RACE, a set of English reading exams, 45.5% and 46.8%.[^3]"
    },
    {
      "type": "chart",
      "kind": "bar",
      "title": "GPT-3 175B: zero-shot vs one-shot vs few-shot",
      "yLabel": "Accuracy (%)",
      "series": [
        {
          "label": "Zero-shot",
          "key": "z",
          "baseline": true
        },
        {
          "label": "One-shot",
          "key": "o"
        },
        {
          "label": "Few-shot",
          "key": "f"
        }
      ],
      "data": [
        {
          "label": "WebQS",
          "values": {
            "z": 14.4,
            "o": 25.3,
            "f": 41.5
          }
        },
        {
          "label": "3-digit add",
          "values": {
            "z": 34.2,
            "o": 65.5,
            "f": 80.4
          }
        },
        {
          "label": "TriviaQA",
          "values": {
            "z": 64.3,
            "o": 68.0,
            "f": 71.2
          }
        },
        {
          "label": "LAMBADA",
          "values": {
            "z": 76.2,
            "o": 72.5,
            "f": 86.4
          }
        },
        {
          "label": "ARC Challenge",
          "values": {
            "z": 51.4,
            "o": 53.2,
            "f": 51.5
          }
        },
        {
          "label": "RACE-h",
          "values": {
            "z": 45.5,
            "o": 45.9,
            "f": 46.8
          }
        }
      ],
      "caption": "Redrawn from Tables 3.2, 3.3, 3.6, 3.7 and 3.9 of Brown et al., 2020.[^3] Same model and same tasks, only the number of demonstrations changes. The LAMBADA zero-shot run used a different prompt format from the other two settings."
    },
    {
      "type": "p",
      "text": "LAMBADA shows that one example can be worse than none. The task asks for the last word of a passage. A plain language model does not know the answer must be exactly one word, so the authors framed it as a fill-in-the-blank test and let the examples teach that format. Few-shot reached 86.4%, but one-shot fell to 72.5%, below the 76.2% zero-shot score. The paper notes that this format \"is not effective one-shot, where it always performs worse than the zero-shot setting,\" and suggests the models need several examples to recognize the pattern.[^3] The same framing lowered the smallest model's score by almost 20% while raising GPT-3's by 10%.[^3] So the effect of examples depends on the model's size as well as the task."
    },
    {
      "type": "p",
      "text": "Some tasks resisted examples entirely. On WiC, which asks whether a word means the same thing in two sentences, GPT-3 scored 49.4% few-shot, which the paper calls random chance. The authors tried a number of different phrasings and formulations, and none reached strong performance.[^3] The paper itself lists natural language inference and some reading comprehension sets as tasks where few-shot performance struggles even at GPT-3's scale.[^3]"
    },
    {
      "type": "p",
      "text": "The authors are also careful about what the gain means. They write that it is unclear whether few-shot learning \"actually learns new tasks 'from scratch' at inference time, or if it simply recognizes and identifies tasks that it has learned during training,\" and that the answer may vary from task to task.[^3] For a practitioner the reading is modest: examples reliably help when the output has a format the model cannot infer from the instruction, and help little when the model either already knows the task or cannot do it at all."
    },
    {
      "type": "h2",
      "text": "Claim two: small changes in wording matter"
    },
    {
      "type": "p",
      "text": "This claim is true, and in a less comfortable way than the folklore suggests. OPRO's authors describe it as a core difficulty of their search. With PaLM 2-L on the GSM8K test set, \"Let's think step by step.\" scored 71.8% and \"Let's solve the problem together.\" scored 60.5%. \"Let's work together to solve this problem step by step.\", which the paper calls the semantic combination of the two, scored only 49.4%.[^1] Merging two decent instructions produced one worse than either. Swings like that made single instructions noisy and the search unstable, which is why OPRO generates eight candidates at every step rather than one.[^1]"
    },
    {
      "type": "p",
      "text": "Paraphrases can move scores upward too. On the Big-Bench Hard task ruin_names, which asks for the funniest pun on an artist or movie name, the search went from an empty instruction at 64.0% training accuracy to 72.0% at step 1, 80.0% at step 18 and 82.0% at step 38. The paper notes the later instructions were semantically similar and that a paraphrase still gave a notable accuracy improvement.[^1] Big-Bench Hard is a set of 23 BIG-Bench tasks on which earlier language model evaluations had not beaten the average human rater.[^5]"
    },
    {
      "type": "p",
      "text": "The part folklore skips is that the best wording depends on the model. OPRO ran the same human-written baselines on two scorers. On pre-trained PaLM 2-L, \"Let's think step by step.\" beat APE's longer step-by-step phrase by 71.8% to 58.8%. On text-bison, an instruction-tuned PaLM 2 model, the order reversed: 65.6% for APE's phrase and 64.4% for the short one.[^1] The gap from having any instruction also shrank. On text-bison the empty instruction already scored 56.8%, against 34.0% on the pre-trained model.[^1] My reading of that table: wording matters a lot for a model that was never trained to follow instructions and less for one that was, and the ranking of two phrasings on one model says little about their ranking on another."
    },
    {
      "type": "image",
      "src": "/blog-images/prompt-engineering-that-helps/opro-optimization-curves.webp",
      "alt": "Two line plots of training accuracy against optimization step. Left, GSM8K: accuracy starts near 60, dips to about 48, then climbs with large step-to-step swings to around 75 by step 50 and stays there through step 150. Right, BBH movie_recommendation: accuracy starts near 70 and rises unevenly to above 90 by step 200.",
      "width": 1200,
      "height": 470,
      "caption": "Figure 1 from Yang et al., 2023,[^1] reproduced under [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/). Each dot is the average training accuracy of up to eight instructions generated in one step; the shading is one standard deviation. The GSM8K run uses PaLM 2-L as scorer and PaLM 2-L-IT as optimizer."
    },
    {
      "type": "h2",
      "text": "Claim three: you can search for a better instruction instead of writing one"
    },
    {
      "type": "p",
      "text": "If wording matters and nobody can predict which wording wins, the natural move is to try many and measure. APE, the Automatic Prompt Engineer, did this in 2022. Given a handful of input and output pairs for a task, a language model proposes candidate instructions that could have produced those outputs. Each candidate is then run on the target model, scored by execution accuracy, and the best one is kept.[^4] The authors also tried an iterative version that asks the model for variations of the top candidates, and found that it gave only a marginal improvement, so they used the simple version by default.[^4]"
    },
    {
      "type": "p",
      "text": "On 24 instruction induction tasks, with InstructGPT (text-davinci-002) following the instructions, APE's picks matched or beat the human-written instructions on all 24. Summarized as an interquartile mean, a mean that drops the top and bottom quarters of the scores, APE scored 0.810 against 0.749 for the human instructions.[^4] On a harder curated set of 21 BIG-Bench tasks, APE was comparable or better on 17, which means the human instruction won on the other 4.[^4] Putting APE's instruction in front of ordinary few-shot examples was comparable or better than the examples alone on 21 of 24 tasks; on Rhymes, Large Animal and Second Letters the combination did worse. The authors suspect instructions chosen for the zero-shot setting overfit to it.[^4]"
    },
    {
      "type": "p",
      "text": "OPRO changes the search. Instead of rewording one candidate, the optimizer model sees a list of the 20 best instructions so far with their scores, in ascending order, plus three example problems, and is asked for a new instruction that scores higher.[^1] For GSM8K the scores came from a fixed 3.5% sample of the 7,473 training problems, about 260 of them by my arithmetic, and the finished instructions were then graded on the full test set.[^1] On Big-Bench Hard, the found instructions beat \"Let's think step by step.\" by more than 5% on 19 of 23 tasks with the PaLM 2-L scorer and on 15 of 23 with text-bison.[^1]"
    },
    {
      "type": "p",
      "text": "Two details in those results are easy to miss. First, the deep-breath sentence is one of several near the top. Pre-trained PaLM 2-L, acting as its own optimizer, found \"Break this down.\", which scored 79.9%, only 0.3 points behind.[^1] My reading is that the phrase itself is not special: the search found a family of instructions that work on this model, and many different sentences belong to it. Second, the search overfits. The authors report that training accuracies were often 5% to 20% higher than test accuracies, though test scores still mostly beat the human-written instructions.[^1] The GSM8K instructions did carry over to two other math sets with the same scorer: the deep-breath instruction scored 95.3% on MultiArith and 54.3% on AQuA, against 85.7% and 44.9% for \"Let's think step by step.\"[^1]"
    },
    {
      "type": "h2",
      "text": "Claim four: being polite, or offering a tip, changes the answer"
    },
    {
      "type": "p",
      "text": "The paper most often cited for this is Bsharat, Myrzakhan and Shen's 2023 \"Principled Instructions Are All You Need,\" which lists 26 prompting principles. Principle 1 says that if you prefer more concise answers there is no need to be polite, so drop phrases like \"please\" and \"thank you.\" Principle 6 says to add \"I'm going to tip $xxx for a better solution!\"[^6] The abstract-level result is large: on GPT-4, the principled prompts improved response quality by an average of 57.7% and accuracy by 36.4%.[^6]"
    },
    {
      "type": "p",
      "text": "How those numbers were produced matters. All evaluation ran on ATLAS, a benchmark the same authors built by hand. Each principle had 20 human-selected questions, asked with and without the principle, and each question got a single response from each model. Human evaluators judged whether the response improved and whether it was correct.[^6] The paper does not report repeated samples, confidence intervals, or how many evaluators there were."
    },
    {
      "type": "p",
      "text": "Read per principle, the tipping and politeness effects look small and uneven. In the paper's heatmaps, the tip line has a quality boosting score of 45% on GPT-4 and 25% on LLaMA-2-13B, and a correctness improvement of 35% on GPT-4 and 5% on LLaMA-2-13B. Dropping politeness scores 5% for quality on GPT-4 and 0% for correctness.[^6] Every value in those heatmaps is a multiple of 5, which fits 20 questions per principle. If that is how the percentages were computed, the politeness result for GPT-4 and the tip's correctness gain on the 13B model each come down to a single question. That is my reading of the paper's setup; the paper does not state it that way."
    },
    {
      "type": "p",
      "text": "The authors state the weaknesses themselves. They write that the assessment \"was based on a limited selection of questions,\" that models with different architectures might respond differently, and that \"the criteria and results may vary across various personnel assessments on the model responses.\"[^6] Compare that with OPRO, where every instruction was decoded at temperature 0 and scored automatically against known answers on public benchmarks.[^1] The Bsharat paper is a useful list of things to try. As evidence that any single item works, it is thin, and I found no test in it that separates the effect of politeness or tipping from sampling noise."
    },
    {
      "type": "h2",
      "text": "A tuned prompt belongs to the model it was tuned on"
    },
    {
      "type": "p",
      "text": "OPRO's own tests of transfer changed the dataset and kept the scorer fixed, so they say nothing about moving a prompt to a different model.[^1] Its conclusion lists other limits: the optimizer did not make good use of error cases, and the method needs a training set of at least tens of examples so the found prompt does not badly overfit.[^1]"
    },
    {
      "type": "p",
      "text": "APE tested the cross-model question directly, in an appendix. The authors took instructions that InstructGPT had generated and selected for itself, used them to steer the base GPT-3 model, and did the reverse. Both directions showed \"a significant performance drop,\" and a human-written instruction reduced the loss.[^4] Their conclusion is that the model that scores instructions and the model that runs them need to match, and that \"the instructions generated by InstructGPT work best for the InstructGPT itself but do not transfer well to a different model like GPT-3.\"[^4] GPT-3, which followed human instructions poorly, still generated prompts that steered it well, even though the authors describe those prompts as unintuitive.[^4]"
    },
    {
      "type": "p",
      "text": "That is the limit on everything above. The measured gains were real, and each was measured on one model, one benchmark and one scoring rule. When the model changes, the found instruction has to be found again, on data from the task it will actually serve."
    },
    {
      "type": "sources",
      "numbered": true,
      "items": [
        {
          "title": "Yang, Wang, Lu, Liu, Le, Zhou and Chen, \"Large Language Models as Optimizers\" (OPRO), 2023",
          "url": "https://arxiv.org/abs/2309.03409"
        },
        {
          "title": "Cobbe et al., \"Training Verifiers to Solve Math Word Problems\" (GSM8K), 2021",
          "url": "https://arxiv.org/abs/2110.14168"
        },
        {
          "title": "Brown et al., \"Language Models are Few-Shot Learners\" (GPT-3), 2020",
          "url": "https://arxiv.org/abs/2005.14165"
        },
        {
          "title": "Zhou et al., \"Large Language Models Are Human-Level Prompt Engineers\" (APE), 2022",
          "url": "https://arxiv.org/abs/2211.01910"
        },
        {
          "title": "Suzgun et al., \"Challenging BIG-Bench Tasks and Whether Chain-of-Thought Can Solve Them\" (BIG-Bench Hard), 2022",
          "url": "https://arxiv.org/abs/2210.09261"
        },
        {
          "title": "Bsharat, Myrzakhan and Shen, \"Principled Instructions Are All You Need for Questioning LLaMA-1/2, GPT-3.5/4\", 2023",
          "url": "https://arxiv.org/abs/2312.16171"
        }
      ]
    }
  ]
};
