import React from 'react';

const AIAgentPost = () => (
  <>
    {/* Opening Hook */}
    <p>
      Every AI agent framework, LangChain, CrewAI, LangGraph, is built on the same primitive:{' '}
      <strong>a loop that calls an LLM, checks if it wants to use a tool, executes that tool, and feeds the result back.</strong>{' '}
      That's it. Before you reach for a framework, you should build this loop yourself.
    </p>

    <p>
      I built a working agent in ~50 lines of Python last night. It checks real weather data, does math,
      and chains tool calls automatically. No dependencies beyond the Anthropic SDK. Once you see the pattern,
      every framework becomes transparent.
    </p>

    <p>Here's exactly what I built and how it works.</p>

    {/* Step 01 */}
    <h2><span className="step-num">01</span> The ReAct Loop</h2>

    <p>
      Every agent follows this flow. The model <em>reasons</em> about what tool to call,{' '}
      <em>acts</em> by requesting it, and <em>observes</em> the result. Your code is the glue in the middle:
    </p>

    {/* DIAGRAM 1: The ReAct Loop
        Create a circular flow diagram showing:
        User Query → Claude (Reason) → Tool Call (Act) → Tool Result (Observe) → back to Claude
        With a branch arrow from Claude → Final Answer when stop_reason = "end_turn"
        Use colors: blue for Claude, orange for tools, grey for user
        Place image at: public/assets/blog/diagram-react-loop.jpeg */}
    <div className="blog-diagram-img">
      <img src="/assets/blog/diagram-react-loop.jpeg" alt="The ReAct agent loop: User query flows to the LLM, which reasons and calls a tool, the tool result feeds back, repeating until a final answer" />
      <p className="blog-diagram-caption">The ReAct loop: Reason → Act → Observe, repeating until the model has enough information to answer</p>
    </div>

    <p>
      The key insight: <strong>Claude doesn't execute tools.</strong> It returns a structured JSON block saying
      "I'd like to call <code>get_weather</code> with <code>{`{"city": "Tokyo"}`}</code>."
      Your code runs the function and sends the result back. Claude then decides if it needs more tools or can answer.
    </p>

    {/* Step 02 */}
    <h2><span className="step-num">02</span> Define Your Tools</h2>

    <p>
      Tools are just JSON schemas. You describe what each tool does and what inputs it expects.
      Claude reads these descriptions to decide when to use them:
    </p>

    <pre data-lang="python"><code>{`TOOLS = [
    {
        "name": "get_weather",
        "description": "Get current weather for a city.",
        "input_schema": {
            "type": "object",
            "properties": {
                "city": {"type": "string", "description": "City name"}
            },
            "required": ["city"],
        },
    },
    {
        "name": "calculator",
        "description": "Evaluate a math expression. Supports +, -, *, /, **.",
        "input_schema": {
            "type": "object",
            "properties": {
                "expression": {"type": "string", "description": "e.g. '(72-32)*5/9'"}
            },
            "required": ["expression"],
        },
    },
]`}</code></pre>

    {/* Step 03 */}
    <h2><span className="step-num">03</span> Implement the Tools</h2>

    <p>
      These are just regular Python functions. The weather tool hits <code>wttr.in</code> (free, no API key),
      and the calculator safely evaluates math:
    </p>

    <pre data-lang="python"><code>{`def get_weather(city: str) -> dict:
    """Fetch weather from wttr.in (free, no API key)."""
    resp = httpx.get(f"https://wttr.in/{city}?format=j1", timeout=10)
    data = resp.json()["current_condition"][0]
    return {
        "city": city,
        "temp_f": data["temp_F"],
        "condition": data["weatherDesc"][0]["value"],
        "humidity": data["humidity"] + "%",
    }

def calculator(expression: str) -> dict:
    """Safely evaluate a math expression."""
    allowed = set("0123456789+-*/.() ")
    if not all(c in allowed for c in expression):
        return {"error": "Invalid characters"}
    result = eval(expression, {"__builtins__": {}}, {})
    return {"expression": expression, "result": round(result, 4)}`}</code></pre>

    <p>
      Nothing fancy. The tool returns a dict, we'll <code>json.dumps()</code> it and send it back to Claude.
      That's the entire contract between your tools and the LLM.
    </p>

    {/* Step 04 */}
    <h2><span className="step-num">04</span> The Agent Loop (The Core)</h2>

    <p>
      This is the whole agent. A <code>while True</code> loop that sends messages, checks for tool calls,
      executes them, and continues until Claude gives a final answer:
    </p>

    <pre data-lang="python"><code>{`def run_agent(user_message: str) -> str:
    messages = [{"role": "user", "content": user_message}]

    while True:
        response = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=1024,
            tools=TOOLS,
            messages=messages,
        )

        # Done? Return the text.
        if response.stop_reason == "end_turn":
            return "".join(b.text for b in response.content if b.type == "text")

        # Tool calls? Execute and loop.
        messages.append({"role": "assistant", "content": response.content})
        tool_results = []
        for block in response.content:
            if block.type == "tool_use":
                result = TOOL_DISPATCH[block.name](block.input)
                tool_results.append({
                    "type": "tool_result",
                    "tool_use_id": block.id,
                    "content": json.dumps(result),
                })
        messages.append({"role": "user", "content": tool_results})`}</code></pre>

    <p>Three things to notice:</p>

    <p>
      <strong>1. Check <code>stop_reason</code>.</strong> If it's <code>"end_turn"</code>,
      Claude is done thinking. If not, it wants to call a tool.
    </p>

    <p>
      <strong>2. Match the <code>tool_use_id</code>.</strong> Every tool result must reference the exact{' '}
      <code>id</code> from Claude's tool request. This is how it tracks which result belongs to which call.
    </p>

    <p>
      <strong>3. Append everything to messages.</strong> The assistant's response (including <code>tool_use</code> blocks)
      AND your <code>tool_result</code> both go into the conversation history. Claude sees the full chain.
    </p>

    {/* Step 05 */}
    <h2><span className="step-num">05</span> Run It</h2>

    <div className="blog-terminal">
      <div className="terminal-bar">
        <div className="terminal-dot dot-r" />
        <div className="terminal-dot dot-y" />
        <div className="terminal-dot dot-g" />
        <span>terminal</span>
      </div>
      <div className="terminal-body">
        <div><span className="t-prompt">$</span> pip install anthropic httpx</div>
        <div><span className="t-prompt">$</span> export ANTHROPIC_API_KEY="sk-ant-..."</div>
        <div><span className="t-prompt">$</span> python agent.py "What's the weather in Tokyo? Convert to Celsius."</div>
        <br />
        <div className="t-dim">{'─'.repeat(50)}</div>
        <div><span className="t-prompt">User:</span> What's the weather in Tokyo? Convert to Celsius.</div>
        <div className="t-dim">{'─'.repeat(50)}</div>
        <br />
        <div><span className="t-tool">Tool call:</span> get_weather({`{"city": "Tokyo"}`})</div>
        <div className="t-result">{'   '}{"↳"} {`{"city": "Tokyo", "temp_f": "72", "condition": "Partly cloudy", "humidity": "65%"}`}</div>
        <br />
        <div><span className="t-tool">Tool call:</span> calculator({`{"expression": "(72 - 32) * 5/9"}`})</div>
        <div className="t-result">{'   '}{"↳"} {`{"expression": "(72 - 32) * 5/9", "result": 22.2222}`}</div>
        <br />
        <div><span className="t-agent">Agent:</span> Right now in Tokyo it's 72F (22.2C) and partly cloudy with 65% humidity.</div>
      </div>
    </div>

    {/* Step 06 */}
    <h2><span className="step-num">06</span> What You Just Built</h2>

    <p>
      This ~50 line script is the same pattern underneath every agent framework. LangChain adds abstraction layers
      and a tool ecosystem. LangGraph adds stateful graphs with cycles. CrewAI adds multi agent roles. But strip
      the abstractions away, and you'll find this exact loop at the center.
    </p>

    <p>
      <strong>Understanding the raw protocol means you can debug any framework, build custom agent patterns,
      and know when a framework is adding value versus adding complexity.</strong> That's the difference between
      using tools and understanding them.
    </p>

    {/* Extend It */}
    <div className="blog-callout">
      <div className="callout-label">Extend it</div>
      <ul>
        <li>Add a <code>web_search</code> tool using Tavily or Serper. Claude will chain it with your other tools automatically</li>
        <li>Add a <code>read_file</code> tool and you've got a basic code assistant</li>
        <li>Wrap the whole thing in FastAPI and you have an agent API endpoint</li>
      </ul>
    </div>

    {/* Footer CTA */}
    <div className="blog-cta">
      <h3>Get the code</h3>
      <p>Full <code>agent.py</code>, runnable in 5 minutes. <code>pip install anthropic httpx</code> and go.</p>
    </div>
  </>
);

export default AIAgentPost;
