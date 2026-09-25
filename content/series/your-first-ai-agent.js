// AI Engineering series post. Every factual claim is taken from the numbered sources at the end.
// The Chameleon error-analysis figure is reproduced under CC BY 4.0 (arXiv 2304.09842).
// The bar chart is redrawn from Table 3 of API-Bank (arXiv 2304.08244), whose arXiv license
// does not permit figure reuse. Provider docs are cited for API field names only.
export const POST = {
  "id": "your-first-ai-agent",
  "title": "One tool call, traced through four hops",
  "excerpt": "On API-Bank's 73 working APIs, GPT-4 made 63.66% of calls correctly when told which API to use and 37.04% when it had to find one first. How function calling moves a request from schema to call to runtime to answer, and which failures researchers measured at each hop.",
  "category": "AI",
  "tags": [
    "Tool Use",
    "Function Calling",
    "Agents"
  ],
  "seriesNum": 1,
  "publishAt": "2026-03-15T12:00:00Z",
  "body": [
    {
      "type": "p",
      "text": "In 2023 a team from Alibaba Group, HKUST and Peking University built 73 working APIs, from weather lookups to account management and alarm clocks, and spent 98 person-days of senior engineering time making them run inside one test system. Annotators then wrote 314 dialogues by hand that needed 753 API calls between them.[^1] The benchmark, API-Bank, scores three levels of skill. At **Call**, the model is shown the API descriptions and has to call the right one. At **Retrieve+Call**, it is not told which APIs exist and must first find one with a search tool. At **Plan+Retrieve+Call**, it has to find and chain several calls on its own.[^1]"
    },
    {
      "type": "p",
      "text": "The gpt-4-0613 checkpoint got 63.66% of calls right at the first level, 37.04% at the second and 70.00% at the third. The gpt-3.5-turbo-0613 checkpoint scored 59.40%, 38.52% and 22.00%. GPT-3 Davinci, a 175 billion parameter model, managed 0.50% at the easiest level; the authors suspect that calling an API needs the instruction following that only instruction tuning unlocks.[^1] The hardest level holds only 50 of the 314 test dialogues, so the 70% rests on a small sample.[^1] Even so, the pattern says something about how tool use works. A single accuracy number hides a chain of steps, and each step fails in its own way."
    },
    {
      "type": "chart",
      "kind": "bar",
      "title": "API call accuracy on API-Bank, by level",
      "yLabel": "Correct API calls (%)",
      "series": [
        {
          "label": "Call",
          "key": "call"
        },
        {
          "label": "Retrieve+Call",
          "key": "ret"
        },
        {
          "label": "Plan+Retrieve+Call",
          "key": "plan"
        }
      ],
      "data": [
        {
          "label": "Alpaca-7B",
          "values": {
            "call": 24.06,
            "ret": 5.19,
            "plan": 0.0
          }
        },
        {
          "label": "GPT-3 Davinci",
          "values": {
            "call": 0.5,
            "ret": 1.48,
            "plan": 0.0
          }
        },
        {
          "label": "GPT-3.5-turbo",
          "values": {
            "call": 59.4,
            "ret": 38.52,
            "plan": 22.0
          }
        },
        {
          "label": "GPT-4",
          "values": {
            "call": 63.66,
            "ret": 37.04,
            "plan": 70.0
          }
        },
        {
          "label": "Lynx-7B (fine-tuned)",
          "values": {
            "call": 49.87,
            "ret": 30.37,
            "plan": 20.0
          }
        }
      ],
      "caption": "Redrawn from Table 3 of Li et al., 2023.[^1] All models except Lynx were tested zero-shot. Lynx is initialized from Alpaca-7B and fine-tuned on API-Bank's machine-generated training dialogues. A call counts as correct when running it performs the same database queries or changes as the annotated call and returns the same result."
    },
    {
      "type": "p",
      "text": "This post follows one request through those steps. The API field names come from Anthropic's Messages API, but the shape is the same in any provider's function calling. **Function calling**, or **tool use**, means the model can ask for a function to be run and see what it returned. For tools the application defines, the model never runs anything itself. It writes a request, and the application's own code does the rest.[^5]"
    },
    {
      "type": "p",
      "text": "Qin and colleagues, in a 2023 survey of tool learning, gave the moving parts names. The **controller** is the foundation model that plans. The **tool set** is the collection of callable tools. The **environment** is where a tool actually executes, and the **perceiver** turns what came back, from the environment or from the user, into feedback for the controller.[^2] At each step \\(t\\) the controller picks an action \\(a_t\\) given the summarized feedback \\(x_t\\), the history \\(H_t\\) of earlier feedback and actions, and the user's query \\(q\\). The process repeats for several rounds until the task is done.[^2]"
    },
    {
      "type": "diagram",
      "nodes": [
        {
          "label": "1. Schema in",
          "detail": "tool names, descriptions and parameter types travel with the prompt"
        },
        {
          "label": "2. Call out",
          "detail": "the model stops and emits a tool name plus arguments"
        },
        {
          "label": "3. Runtime executes",
          "detail": "application code runs the function and captures the result or the error"
        },
        {
          "label": "4. Result back",
          "detail": "the result is added to the conversation; the model answers or calls again"
        }
      ],
      "caption": "One tool-using request in four hops. The component roles follow the framework of Qin et al., 2023;[^2] the hop boundaries are the author's framing of the Messages API round trip.[^5,6]"
    },
    {
      "type": "p",
      "text": "Take an illustrative request: a user asks what Alibaba's stock is trading at, and the application offers the model a single stock price tool."
    },
    {
      "type": "h2",
      "text": "Hop one: the model reads a description, not a function"
    },
    {
      "type": "p",
      "text": "Before the model sees the question, the application sends a list of tools with it. In the Messages API each tool has a \"name\", a \"description\" and an \"input_schema\", which is a JSON Schema listing the parameters, their types and which ones are required.[^5] For the stock question, that means a tool called get_stock_price with one string parameter, the ticker. That text is all the model knows about the tool. It cannot inspect the code behind it. API-Bank's prompt worked the same way: each API arrived as a JSON line with a name, a description, and typed input and output parameters.[^1]"
    },
    {
      "type": "p",
      "text": "Qin et al. split what the controller has to do at this point into two parts. Their equation 2 factors the choice of action into picking a tool and then deciding what to do with it:[^2]"
    },
    {
      "type": "eq",
      "tex": "\\begin{aligned} p(a_t \\mid x_t, H_t, q) &= \\sum_{T_i \\in \\mathcal{T}} p(a_t \\mid T_i, x_t, H_t, q) \\\\ &\\quad \\times\\, p(T_i \\mid x_t, H_t, q) \\end{aligned}",
      "caption": "The second factor is tool selection; the first is filling in the action for the chosen tool \\(T_i\\) from the tool set \\(\\mathcal{T}\\). Equation 2 of Qin et al., 2023.[^2]"
    },
    {
      "type": "p",
      "text": "The first thing that breaks at this hop is simply fitting the tools in. API-Bank's authors note that a user might define two or three APIs, which all fit in the prompt, or hundreds, which do not. Past that point the model has to retrieve candidate tools before it can call one.[^1] Their Retrieve+Call level tests exactly that, with an API Search tool that embeds the model's keywords and returns the single closest API description.[^1] When they sorted GPT-4's errors, 67.86% were failed retrievals: the model could not use the search step to reach the API it needed.[^1] GPT-3.5 lost about 21 points going from Call to Retrieve+Call.[^1]"
    },
    {
      "type": "p",
      "text": "The second thing is how the tool is described. Qin et al. tested 18 tools with text-davinci-003 and ChatGPT, once with only a task description and API information (zero-shot) and once with worked usage examples added (few-shot).[^2] On a curated map tool with 11 APIs, ChatGPT went from 29.7% zero-shot to 86.8% few-shot. On a knowledge graph tool, it reached only 14.1% even with examples.[^2] The authors single out tools that need generated code as an API argument, such as that tool's search_by_query API, as much harder to use.[^2]"
    },
    {
      "type": "h2",
      "text": "Hop two: the call is text the model writes"
    },
    {
      "type": "p",
      "text": "When the model decides to use a tool, the API response ends with \"stop_reason\" set to \"tool_use\", and the content holds a \"tool_use\" block with an \"id\", the tool's \"name\" and an \"input\" object.[^5] The whole mechanism, cut down to the definition and the call:"
    },
    {
      "type": "code",
      "essential": true,
      "lang": "json",
      "title": "A tool definition, then the call the model emits",
      "code": "{ \"name\": \"get_stock_price\",\n  \"description\": \"Latest price for one stock ticker.\",\n  \"input_schema\": {\n    \"type\": \"object\",\n    \"properties\": { \"ticker\": { \"type\": \"string\" } },\n    \"required\": [\"ticker\"] } }\n\n{ \"type\": \"tool_use\", \"id\": \"toolu_01A\",\n  \"name\": \"get_stock_price\",\n  \"input\": { \"ticker\": \"BABA\" } }"
    },
    {
      "type": "p",
      "text": "The second object is generated token by token like any other text, and every way it can go wrong was counted in API-Bank. The authors defined six error types.[^1] **No API Call** means the model answered without calling anything. **API Hallucination** means the name in the prediction does not match the ground truth. **False API Call Format** means the call could not be parsed. **Invalid Input Parameters** and **Miss Input Parameters** cover bad or missing arguments, and **Has Exception** means running the call raised a Python exception.[^1]"
    },
    {
      "type": "p",
      "text": "Which error dominates depends on the model. For the original Alpaca-7B, 36.77% of errors were no call at all and 23.65% were unparseable calls.[^1] After fine-tuning on API-Bank's training data, only 5.29% of Lynx's errors were skipped calls, but 61.38% were hallucinated API names. Sometimes it called APIs it had seen during training that were not in the test prompt.[^1] Argument problems, which the authors say surface as exceptions, invalid parameters or unparseable calls, made up about 32% of Lynx's errors. The examples the authors list are concrete: a placeholder passed as a value, a date not in the required format, a missing parameter, and a company name passed where the API wanted a stock code.[^1]"
    },
    {
      "type": "p",
      "text": "GPT-4's second largest error class, 17.86%, was calls the system could not parse. The cause was that GPT-4 sometimes made several API calls at once, which the test prompt did not allow.[^1] API-Bank asked for calls in a bracketed text format written into the prompt, such as [ApiName(key1='value1')].[^1] In the author's reading, part of that error class is about the prompt's own format rules rather than about the model misunderstanding the tool. The authors ended by calling for decoding methods that force strict adherence to the input parameter definitions.[^1]"
    },
    {
      "type": "p",
      "text": "Providers now ship something close to that. Setting \"strict: true\" on a tool definition constrains sampling so the tool input always matches the JSON Schema.[^7] Reading that against API-Bank's list, it can remove unparseable calls and wrongly typed or missing required arguments. It cannot catch a company name in a field typed as a string, because \"Alibaba\" is a valid string. That is the author's reading; API-Bank did not test constrained decoding."
    },
    {
      "type": "h2",
      "text": "Hop three: the runtime runs it and reports what happened"
    },
    {
      "type": "p",
      "text": "The call block is a request, not an action. Nothing has looked up BABA yet. The application reads the \"name\", runs its own function with the \"input\", and replies in a new user message containing a \"tool_result\" block. That block carries the \"tool_use_id\" of the call it answers, the output as \"content\", and optionally \"is_error\" when the tool failed.[^6] In Qin et al.'s terms this is the environment producing feedback \\(e_t\\), and the perceiver can be as simple as a fixed template that wraps it before the controller sees it.[^2]"
    },
    {
      "type": "p",
      "text": "API-Bank is built around this hop. The authors required evaluation to use a working system: the model offers a call, the system executes it and returns the result, and scoring looks at the effect of the execution.[^1] Database-backed APIs start each run from the same default entries. APIs that reach outside, like a search engine, return answers recorded at one moment and hard-coded so the benchmark repeats.[^1] A prediction is judged correct when it performs the same database queries or changes as the annotated call and returns the same result.[^1] Under that rule, a call that looks right but writes the wrong row is wrong."
    },
    {
      "type": "p",
      "text": "Failures surface here as exceptions. In the Lynx evaluation, 16.40% of errors were calls that raised an exception when executed.[^1] Shen et al., describing HuggingGPT, a system in which ChatGPT plans tasks and dispatches them to models hosted on Hugging Face, list instability as one of its limits: the LLM can fail to follow instructions or give wrong answers, which leads to exceptions in the program workflow.[^4] Chameleon, a planner system from UCLA and Microsoft Research, puts a Program Verifier module in front of its Program Executor to check generated programs for syntax and logic errors before they run.[^3]"
    },
    {
      "type": "h2",
      "text": "Hop four: the result goes back and the loop decides"
    },
    {
      "type": "p",
      "text": "The model is then called again with everything so far: the question, its own \"tool_use\" block and the \"tool_result\". It either writes an answer, here a sentence quoting the price, or emits another call.[^5] Qin et al.'s formulation has the same shape. The next feedback goes to the perceiver, and the cycle repeats until the controller finishes the task. After that, the controller may turn the execution results into a response for the user.[^2]"
    },
    {
      "type": "p",
      "text": "A correct call does not guarantee a better answer. In Qin et al.'s experiments ChatGPT answered 91.7% of ASDiv math word problems without any tool. Given a calculator with zero-shot prompting, it fell to 74.1%. With few-shot examples it reached 92.5%.[^2] On HotpotQA with a Wikipedia tool the drop was steeper: 34.5% with no tool, 8.5% zero-shot and 19.0% few-shot.[^2] The authors' conclusion is that sub-optimal use of a tool can make results worse than not using it.[^2]"
    },
    {
      "type": "p",
      "text": "HuggingGPT's human evaluation shows how steps compound. Across 130 requests, GPT-3.5 had a passing rate of 91.22% for task planning and 93.89% for model selection, yet the success rate, whether the user's request was finally resolved, was 63.08%.[^4] API-Bank scored the final reply separately with ROUGE-L, a word-overlap measure. GPT-4 made more correct calls than GPT-3.5 at the Call level but scored 0.3691 against GPT-3.5's 0.4598 on the reply that followed.[^1]"
    },
    {
      "type": "p",
      "text": "A request that needs several tools goes through these hops more than once. Chameleon asks an LLM planner to write the whole sequence up front as a natural-language-like program, such as a list of module names, and then runs the modules in order.[^3] With GPT-4 as the planner it reached 86.54% on the ScienceQA benchmark and 98.78% on TabMWP, a benchmark of math problems over tables.[^3] The planners differed in which tools they reached for. ChatGPT called Knowledge Retrieval on 72% of ScienceQA queries and Bing Search on 3%, which the authors attribute to the in-context examples. GPT-4 called them 81% and 11% of the time.[^3]"
    },
    {
      "type": "image",
      "src": "/blog-images/your-first-ai-agent/chameleon-mistakes.webp",
      "alt": "Grouped bar chart of mistake counts in 50 ScienceQA examples. ChatGPT: 50 total, 0 tool planning, 32 image, 37 knowledge, 27 solution. Chameleon with ChatGPT: 35 total, 13 tool planning, 10 image, 6 knowledge, 17 solution. Chameleon with GPT-4: 28 total, 1 tool planning, 19 image, 3 knowledge, 8 solution.",
      "width": 945,
      "height": 688,
      "caption": "Figure 6 from Lu et al., 2023,[^3] reproduced under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). The 50 examples are ones the plain ChatGPT baseline got wrong on ScienceQA. Adding tools brings in a new kind of mistake, tool planning, where the tool-free baseline shows none."
    },
    {
      "type": "p",
      "text": "The error counts show both sides. Starting from 50 questions plain ChatGPT got wrong, Chameleon with ChatGPT cut knowledge errors from 37 to 6 and image errors from 32 to 10. It also made 13 tool planning mistakes, a category where the tool-free baseline shows zero.[^3] With GPT-4 as the planner, tool planning mistakes fell to 1.[^3] The paper's appendix traces other failures to a hop: a search query too vague to bring back the needed facts, a plan that skipped the text detector and knowledge retrieval, and a picture of a food web with arrows that no module in the inventory could read.[^3]"
    },
    {
      "type": "h2",
      "text": "What Chameleon's authors said would not hold"
    },
    {
      "type": "p",
      "text": "Chameleon's limitations section names two assumptions that touch hops one and four. The system generates its program in one step, with no re-planning as the modules run. It also assumes the list of modules and their descriptions will fit within the LLM's context window, which the authors say may not always be the case as the module inventory grows.[^3] The second assumption is the one API-Bank built its retrieval levels around, and failed retrieval made up 67.86% of GPT-4's errors there.[^1]"
    },
    {
      "type": "sources",
      "numbered": true,
      "items": [
        {
          "title": "Li, Zhao, Yu, Song, Li, Yu, Li, Huang, Li, \"API-Bank: A Comprehensive Benchmark for Tool-Augmented LLMs,\" EMNLP 2023 (arXiv 2304.08244)",
          "url": "https://arxiv.org/abs/2304.08244"
        },
        {
          "title": "Qin, Hu, Lin, Chen, Ding, Cui, et al., \"Tool Learning with Foundation Models,\" 2023 (arXiv 2304.08354)",
          "url": "https://arxiv.org/abs/2304.08354"
        },
        {
          "title": "Lu, Peng, Cheng, Galley, Chang, Wu, Zhu, Gao, \"Chameleon: Plug-and-Play Compositional Reasoning with Large Language Models,\" NeurIPS 2023 (arXiv 2304.09842)",
          "url": "https://arxiv.org/abs/2304.09842"
        },
        {
          "title": "Shen, Song, Tan, Li, Lu, Zhuang, \"HuggingGPT: Solving AI Tasks with ChatGPT and its Friends in Hugging Face,\" 2023 (arXiv 2303.17580)",
          "url": "https://arxiv.org/abs/2303.17580"
        },
        {
          "title": "Anthropic, \"Tool use with Claude\" (overview), Claude API documentation (field names only)",
          "url": "https://platform.claude.com/docs/en/agents-and-tools/tool-use/overview"
        },
        {
          "title": "Anthropic, \"Handle tool calls,\" Claude API documentation (field names only)",
          "url": "https://platform.claude.com/docs/en/agents-and-tools/tool-use/handle-tool-calls"
        },
        {
          "title": "Anthropic, \"Strict tool use,\" Claude API documentation (field names only)",
          "url": "https://platform.claude.com/docs/en/agents-and-tools/tool-use/strict-tool-use"
        }
      ]
    }
  ]
};
