// AI Engineering series post. Every factual claim is taken from the numbered sources at the end.
// The HotpotQA trajectory figure is reproduced under CC BY 4.0 (arXiv 2210.03629).
// Both bar charts are redrawn from reported table values. WebArena (arXiv 2307.13854) is not
// under a license that permits figure reuse.
export const POST = {
  "id": "what-an-agent-is",
  "title": "An agent is a loop, and the loop still loses to people",
  "excerpt": "On WebArena's 812 realistic web tasks, the best GPT-4 agent succeeded 14.41% of the time and humans 78.24%. What the ReAct loop of thought, action and observation is, what it gained over acting or reasoning alone, and where it measurably breaks.",
  "category": "AI",
  "chapter": "Chapter 6",
  "tags": [
    "Agents",
    "Tools",
    "ReAct"
  ],
  "seriesNum": 11,
  "publishAt": "2026-02-11T12:00:00Z",
  "body": [
    {
      "type": "p",
      "text": "In July 2023 a team at Carnegie Mellon put GPT-4 in front of four working websites and gave it 812 everyday chores: find out how much was spent on food in March, fork a set of repositories, post a question to a forum. The sites were real open-source software filled with real-looking data, and each task was graded on its outcome, the answer given or the state the site was left in, rather than by comparing the agent's clicks with a reference path. The best GPT-4 agent finished 14.41% of the tasks. Five computer science graduate students, given a sample of the same tasks, finished 78.24%.[^1]"
    },
    {
      "type": "p",
      "text": "That gap is the honest starting point for any explanation of what an LLM agent is. The agent in that paper is not exotic. It is a language model in a loop: it reads the page, writes a little reasoning, picks one browser action, sees the new page, and goes again. That loop has a name and a paper behind it, ReAct, and most of what is known about why agents succeed or stall comes from measuring it."
    },
    {
      "type": "h2",
      "text": "The scoreboard: 812 tasks on self-hosted websites"
    },
    {
      "type": "p",
      "text": "WebArena, the benchmark from that paper, runs its own copies of four kinds of site: an online shop, a Reddit-style forum, a GitLab instance for code collaboration, and a content management system for running a store. It adds a map, a calculator, a scratchpad and its own copy of English Wikipedia, and ships everything as Docker containers that reset to the same starting state, so two agents tested months apart see the same world.[^1] The 812 tasks come from 241 templates written by the authors, such as \"create a {{site1}} account identical to my {{site2}} one\", each filled in several ways.[^1]"
    },
    {
      "type": "p",
      "text": "Grading is **functional**. For a question, the agent's answer is compared with a reference answer, by exact match, by required substrings, or by GPT-4 judging whether two phrasings mean the same thing. For a task that changes something, a small program inspects the site afterward: did a post appear in the right forum, does the README contain the right text.[^1] Some tasks are deliberately impossible, like asking for a phone number the shop never lists, and the correct answer there is \"N/A\".[^1]"
    },
    {
      "type": "p",
      "text": "The agent sees each page as an **accessibility tree**, a trimmed version of the page structure where every element has a role, its text and an ID number. It acts with keyboard and mouse style commands such as click [1582], type, scroll, open a tab or go to a URL.[^1] Each baseline agent got two worked examples in its prompt, a description of the browser and a set of rules, and was cut off after 30 steps.[^1]"
    },
    {
      "type": "chart",
      "kind": "bar",
      "title": "End-to-end task success on WebArena",
      "yLabel": "Success rate (%)",
      "series": [
        {
          "label": "Success rate",
          "key": "sr"
        }
      ],
      "data": [
        {
          "label": "text-bison-001, CoT",
          "values": {
            "sr": 5.05
          }
        },
        {
          "label": "GPT-3.5, direct",
          "values": {
            "sr": 6.41
          }
        },
        {
          "label": "GPT-3.5, CoT",
          "values": {
            "sr": 8.75
          }
        },
        {
          "label": "GPT-4, CoT",
          "values": {
            "sr": 11.7
          }
        },
        {
          "label": "GPT-4, CoT, no UA hint",
          "values": {
            "sr": 14.41
          }
        },
        {
          "label": "Human",
          "values": {
            "sr": 78.24
          }
        }
      ],
      "caption": "Redrawn from Table 2 of Zhou et al., 2023.[^1] CoT means the model writes reasoning before each action. The first five agents were told to stop if a task looked impossible (the \"UA hint\"); the last GPT-4 bar is the run without that instruction. Humans did one task from each of 170 templates."
    },
    {
      "type": "p",
      "text": "The humans were not perfect either. Half of their failures came from misreading the intent, such as giving a travel distance when asked for a travel time, or leaving an answer or an execution incomplete.[^1] Still, the distance between 14 and 78 is not a rounding problem. To see where it comes from, it helps to take the loop apart."
    },
    {
      "type": "h2",
      "text": "Thought, action, observation"
    },
    {
      "type": "p",
      "text": "ReAct was published by Shunyu Yao and colleagues at Princeton and Google in October 2022.[^2] Its setup starts with a plain description of any agent. At step \\(t\\) the agent receives an **observation** \\(o_t\\) from its environment and picks an **action** \\(a_t\\), based on the context \\(c_t\\), which is everything seen and done so far.[^2] The trouble, the authors argue, is that mapping a long context straight to the next action can require a lot of hidden computation, so a model asked to act directly often picks the wrong move.[^2]"
    },
    {
      "type": "p",
      "text": "Their fix is to let the model take a kind of action that does nothing to the world:"
    },
    {
      "type": "eq",
      "tex": "\\hat{\\mathcal{A}} = \\mathcal{A} \\cup \\mathcal{L}",
      "caption": "The ReAct action space, from Section 2 of Yao et al., 2022.[^2] \\(\\mathcal{A}\\) holds the environment actions, \\(\\mathcal{L}\\) is the space of language."
    },
    {
      "type": "p",
      "text": "An action drawn from language is a **thought**. The environment ignores it and returns no observation. It only gets appended to the context, so the next decision can lean on it.[^2] The paper lists what thoughts end up doing in practice: breaking the goal into steps, bringing in common sense, pulling the useful part out of an observation, tracking progress, and changing the plan when something goes wrong.[^2]"
    },
    {
      "type": "diagram",
      "essential": true,
      "nodes": [
        {
          "label": "Thought",
          "detail": "free text added to the context; the environment does not see it"
        },
        {
          "label": "Action",
          "detail": "one command from a fixed set, e.g. search[entity] or click [id]"
        },
        {
          "label": "Observation",
          "detail": "what the environment returns, appended to the context"
        },
        {
          "label": "Repeat or finish",
          "detail": "loop back to a thought, or emit finish[answer]"
        }
      ],
      "caption": "One step of the ReAct loop.[^2] On question answering the model alternates thought, action and observation on every step. On long decision tasks it decides for itself when a thought is worth writing, so thoughts appear only here and there."
    },
    {
      "type": "p",
      "text": "In the main experiments nothing is trained. ReAct prompts a frozen PaLM-540B with a handful of human-written example trajectories, six for HotpotQA and three for Fever, and the model continues the pattern.[^2] The comparison baselines come from deleting parts of those same examples. Remove the thoughts and you get **Act**, an acting-only agent. Remove the actions and observations and you get **chain-of-thought** (CoT), which the original CoT paper describes as a series of intermediate reasoning steps written before the answer.[^2,4] So every comparison below uses the same examples with pieces removed."
    },
    {
      "type": "image",
      "src": "/blog-images/what-an-agent-is/react-hotpotqa-trajectory.webp",
      "alt": "Four panels answering the same HotpotQA question about the Apple Remote. Standard prompting answers iPod, wrong. Chain-of-thought reasons from memory to iPhone, iPad and iPod Touch, wrong. Act-only searches three times and finishes with yes, wrong. ReAct writes a thought before each search, recovers from a failed search for Front Row, and answers keyboard function keys, correct.",
      "width": 1690,
      "height": 700,
      "caption": "Figure 1, part (1), from Yao et al., 2022,[^2] reproduced under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). The same question under four prompting styles."
    },
    {
      "type": "p",
      "text": "The figure shows the difference in one question. The acting-only agent finds the right page on its third search but cannot put the pieces together, and finishes with \"yes\". Chain-of-thought reasons fluently from memory and invents a wrong fact. ReAct's second search fails, its third thought notices that and rewrites the query to \"Front Row (software)\", and the answer comes out right.[^2]"
    },
    {
      "type": "h2",
      "text": "What the thoughts bought on four benchmarks"
    },
    {
      "type": "p",
      "text": "For the two knowledge tasks the agent could use a deliberately weak Wikipedia tool with three commands: search[entity] returns the first five sentences of a page or five similar titles, lookup[string] returns the next sentence containing the string, and finish[answer] ends the episode.[^2] ReAct beat Act on both: 27.4 against 25.7 exact match on HotpotQA, a multi-hop question set, and 60.9 against 58.9 accuracy on Fever, a fact-checking set.[^2] Against reasoning alone the result was split. ReAct won on Fever (60.9 against 56.3 for CoT) and lost slightly on HotpotQA (27.4 against 29.4).[^2] The best prompting results came from switching between the two, for example falling back from ReAct to self-consistent CoT when ReAct had not answered within seven steps, which reached 35.1 on HotpotQA.[^2] All of these stayed far below the supervised state of the art of 67.5 and 89.5.[^2]"
    },
    {
      "type": "p",
      "text": "The larger gains came on the interactive tasks. ALFWorld is a text game that is aligned with household tasks from the embodied ALFRED benchmark, such as finding a pepper shaker and putting it in a drawer; a single task can involve more than 50 locations and take an expert more than 50 steps.[^2,5] Across 134 unseen games, the best of six ReAct prompts succeeded on 71% against 45% for the best Act prompt and 37% for BUTLER, an imitation learning agent trained on \\(10^5\\) expert trajectories per task type. Even the worst ReAct prompt, at 48%, beat the best of either baseline.[^2] WebShop is a simulated store with 1.18 million real products and 12,087 crowd-sourced shopping instructions.[^6] There ReAct's success rate was 40.0% against 30.1% for Act and 29.1% for an imitation learning baseline trained on 1,012 human demonstrations, with expert humans at 59.6%.[^2]"
    },
    {
      "type": "chart",
      "kind": "bar",
      "title": "ReAct against the acting-only baseline, PaLM-540B",
      "yLabel": "Score (%)",
      "series": [
        {
          "label": "Act (no thoughts)",
          "key": "act",
          "baseline": true
        },
        {
          "label": "ReAct",
          "key": "react"
        }
      ],
      "data": [
        {
          "label": "HotpotQA EM",
          "values": {
            "act": 25.7,
            "react": 27.4
          }
        },
        {
          "label": "Fever accuracy",
          "values": {
            "act": 58.9,
            "react": 60.9
          }
        },
        {
          "label": "ALFWorld success",
          "values": {
            "act": 45,
            "react": 71
          }
        },
        {
          "label": "WebShop success",
          "values": {
            "act": 30.1,
            "react": 40.0
          }
        }
      ],
      "caption": "Redrawn from Tables 1, 3 and 4 of Yao et al., 2022.[^2] ALFWorld bars are the best of six prompts for each method; ReAct averaged 57% across its six. The prompts are identical apart from the thoughts."
    },
    {
      "type": "p",
      "text": "A control run separates reasoning from simple feedback. The authors wrote a version called ReAct-IM whose thoughts only restated what the environment showed and what was left to do, in the style of an earlier robotics system named Inner Monologue. It scored 53% on ALFWorld against ReAct's 71%, and the authors saw it lose track of which subgoal it was on and where objects were likely to be.[^2] On this evidence the useful part is the planning and common sense written into the thoughts, not merely repeating the observation back."
    },
    {
      "type": "h2",
      "text": "Where the ReAct loop broke"
    },
    {
      "type": "p",
      "text": "To see how the two styles fail, the authors hand-labeled 200 HotpotQA trajectories: 50 correct and 50 incorrect from ReAct, and the same from CoT.[^2] The result is a trade. CoT's main failure was hallucination, at 56% of its errors, and 14% of its correct answers rested on hallucinated reasoning or facts. ReAct hallucinated in 0% of its errors and 6% of its successes.[^2]"
    },
    {
      "type": "ul",
      "items": [
        "**Reasoning error, 47% of ReAct failures** (16% for CoT). This includes a pattern the paper singles out as specific to ReAct: the model repeats its previous thought and action and cannot break out of the loop.[^2] The authors suspect greedy decoding and suggest better decoding such as beam search might help.[^2]",
        "**Search result error, 23%.** The search came back empty or unhelpful, and the model had a hard time recovering and rewording its plan afterward.[^2]",
        "**Label ambiguity, 29%** (28% for CoT). The prediction was right but did not match the reference answer's exact wording.[^2]"
      ]
    },
    {
      "type": "p",
      "text": "The paper explains the trade in its own terms. Interleaving thought, action and observation keeps the agent grounded, but that structure also makes it less flexible at forming reasoning steps than free-form CoT.[^2] Grounding does not help if the tool returns nothing useful, and a model that has decided on an action can keep choosing it."
    },
    {
      "type": "p",
      "text": "There is one hopeful result about scale. With only prompting, ReAct was the worst of the four methods on the smaller PaLM-8B and 62B models. Fine-tuned on 3,000 correct trajectories generated by ReAct itself, it became the best, and fine-tuned PaLM-8B ReAct beat every prompting method on PaLM-62B.[^2]"
    },
    {
      "type": "h2",
      "text": "The four parts the survey names"
    },
    {
      "type": "p",
      "text": "By 2023 enough agent systems existed that Lei Wang and colleagues at Renmin University surveyed them and proposed one framework for their design. It has four modules.[^3]"
    },
    {
      "type": "terms",
      "optional": false,
      "items": [
        {
          "term": "Profile",
          "def": "The role the agent plays, such as coder or domain expert, usually written into the prompt to shape the model's behavior.[^3]"
        },
        {
          "term": "Memory",
          "def": "What the agent has perceived, stored for later use. The survey maps short-term memory to what fits in the context window and long-term memory to external storage, such as a vector store the agent can query.[^3]"
        },
        {
          "term": "Planning",
          "def": "Breaking a task into subtasks. The survey splits it into planning without feedback, like a fixed chain of reasoning steps, and planning with feedback, where results from the environment reshape the plan.[^3]"
        },
        {
          "term": "Action",
          "def": "The module that turns the agent's decisions into concrete outcomes and touches the environment directly. The other three modules all feed into it.[^3]"
        }
      ]
    },
    {
      "type": "p",
      "text": "The survey files ReAct under planning with feedback from the environment. The thought does the high-level planning, the act is the concrete step, and the observation is the external result, so each new thought depends on what the last action returned.[^3] Seen through that framework, the bare ReAct agent has a thin profile (the few-shot examples), no memory beyond its growing context, planning in the form of thoughts, and a small tool list for action. The WebArena baselines had even less memory: at each step the model saw the task, the current page and only its previous action.[^1] That mapping onto the survey's modules is my reading, but it helps explain which parts the WebArena error analysis found weak."
    },
    {
      "type": "h2",
      "text": "Why the GPT-4 agent still missed most WebArena tasks"
    },
    {
      "type": "p",
      "text": "The first cause WebArena found was the instruction itself. The prompt told agents to stop if they judged a task impossible, and under that hint GPT-4 labeled 54.9% of feasible tasks as impossible.[^1] Removing the hint raised its overall success from 11.70% to 14.41%, and it still recognized 44.44% of the truly impossible tasks by writing out reasons on its own.[^1] One sentence in the instructions moved the score by almost three points. GPT-3.5 rarely reasoned its way to \"impossible\" like that. It tended to invent answers, repeat invalid actions, or run past the step limit.[^1]"
    },
    {
      "type": "p",
      "text": "The second is inconsistency across near-identical tasks. Among the 61 templates where the models succeeded at least once, GPT-4 got every instance right on only four, and GPT-3.5 on none.[^1] \"Fork metaseq\" and \"Fork all repos from Facebook\" come from the same template, but the second needs many repeated operations.[^1]"
    },
    {
      "type": "p",
      "text": "The appendix describes two failures that, in my reading, resemble the stuck loops ReAct's authors saw on HotpotQA.[^1,2] One is **observation bias**. Asked for the best-selling product of 2022, the GPT-4 agent took the best-seller list on the store's home page, which reflects recent purchases, instead of generating the historical report.[^1] The other is misreading the observation. The accessibility tree showed the search box already held \"DMV area\", yet the agent kept issuing type [2430] [DMV area] until it hit the step limit, and it often ignored the record of its own previous action.[^1] The test harness already halted any run that repeated the same action more than three times on the same observation, because, the authors note, that pattern usually means the run will fail.[^1]"
    },
    {
      "type": "p",
      "text": "The authors guess that dialogue-style training is part of the cause. Models tuned to respond to the immediate conversation may explore too little, and because small wording changes rarely matter in dialogue, they may skim over small changes in what a page shows.[^1] They name what is missing as active exploration and recovery from failure.[^1]"
    },
    {
      "type": "h2",
      "text": "The limit ReAct wrote down"
    },
    {
      "type": "p",
      "text": "ReAct's conclusion does not claim the prompting recipe scales. Complex tasks with large action spaces need more demonstrations to learn well, the authors write, and those demonstrations can easily exceed the input length limit of in-context learning.[^2] On WebArena every element on every page is a possible target for a click, and the agents got two examples each.[^1]"
    },
    {
      "type": "sources",
      "numbered": true,
      "items": [
        {
          "title": "Zhou, Xu, Zhu, et al., \"WebArena: A Realistic Web Environment for Building Autonomous Agents,\" ICLR 2024 (arXiv 2307.13854)",
          "url": "https://arxiv.org/abs/2307.13854"
        },
        {
          "title": "Yao, Zhao, Yu, Du, Shafran, Narasimhan, Cao, \"ReAct: Synergizing Reasoning and Acting in Language Models,\" ICLR 2023 (arXiv 2210.03629)",
          "url": "https://arxiv.org/abs/2210.03629"
        },
        {
          "title": "Wang, Ma, Feng, et al., \"A Survey on Large Language Model based Autonomous Agents,\" Frontiers of Computer Science, 2025 (arXiv 2308.11432)",
          "url": "https://arxiv.org/abs/2308.11432"
        },
        {
          "title": "Wei, Wang, Schuurmans, et al., \"Chain-of-Thought Prompting Elicits Reasoning in Large Language Models,\" NeurIPS 2022 (arXiv 2201.11903)",
          "url": "https://arxiv.org/abs/2201.11903"
        },
        {
          "title": "Shridhar, Yuan, Cote, Bisk, Trischler, Hausknecht, \"ALFWorld: Aligning Text and Embodied Environments for Interactive Learning,\" ICLR 2021 (arXiv 2010.03768)",
          "url": "https://arxiv.org/abs/2010.03768"
        },
        {
          "title": "Yao, Chen, Yang, Narasimhan, \"WebShop: Towards Scalable Real-World Web Interaction with Grounded Language Agents,\" NeurIPS 2022 (arXiv 2207.01206)",
          "url": "https://arxiv.org/abs/2207.01206"
        }
      ]
    }
  ]
};
