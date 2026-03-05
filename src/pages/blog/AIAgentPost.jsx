import React from 'react';

const AIAgentPost = () => (
  <>
    {/* Opening Hook */}
    <p>
      Every AI agent framework, LangChain, CrewAI, LangGraph, is built on the same primitive:{' '}
      <strong>a loop that calls an LLM, checks if it wants to use a tool, executes that tool, and feeds the result back.</strong>{' '}
      That is it. Before you reach for a framework, you should build this loop yourself.
    </p>

    <p>
      I built a working agent in ~50 lines of Python last night. It checks real weather data, does math,
      and chains tool calls automatically. No frameworks, just the OpenAI SDK and NVIDIA's NIM API running Llama 3.3 70B.
      Once you see the pattern, every framework becomes transparent.
    </p>

    <p>Here is exactly what I built and how it works. Watch the demo first:</p>

    {/* Demo Video */}
    <div className="blog-video-embed">
      <iframe
        src="https://www.youtube.com/embed/3kcxCMB5uXE"
        title="AI Agent Demo"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>

    <p>Three tests, all passing:</p>
    <table className="blog-test-table">
      <thead>
        <tr>
          <th>Command</th>
          <th>What Happens</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><code>python3 agent.py "What's the weather in New York?"</code></td>
          <td>Calls one tool, returns a clean answer</td>
        </tr>
        <tr>
          <td><code>python3 agent.py "What's the weather in Tokyo and convert the temperature to Celsius?"</code></td>
          <td>Chains weather → calculator automatically</td>
        </tr>
        <tr>
          <td><code>python3 agent.py "What is 1024 * 768 / 3.14?"</code></td>
          <td>Skips weather, only uses calculator</td>
        </tr>
      </tbody>
    </table>

    <p>Now let us break down how it works.</p>

    {/* Step 01 */}
    <h2><span className="step-num">01</span> The ReAct Loop</h2>

    <p>
      Every agent follows this flow. The model <em>reasons</em> about what tool to call,{' '}
      <em>acts</em> by requesting it, and <em>observes</em> the result. Your code is the glue in the middle:
    </p>

    {/* DIAGRAM 1: The ReAct Loop */}
    <div className="blog-diagram-img">
      <img src="/assets/blog/diagram-react-loop.jpeg" alt="The ReAct agent loop: User query flows to the LLM, which reasons and calls a tool, the tool result feeds back, repeating until a final answer" />
      <p className="blog-diagram-caption">The ReAct loop: Reason, Act, Observe, repeating until the model has enough information to answer</p>
    </div>

    <p>
      The key insight: <strong>the LLM doesn't execute tools.</strong> It returns a structured JSON block saying
      "I would like to call <code>get_weather</code> with <code>{`{"city": "Tokyo"}`}</code>."
      Your code runs the function and sends the result back. The model then decides if it needs more tools or can answer.
    </p>

    {/* Step 02 */}
    <h2><span className="step-num">02</span> Set Up the Client</h2>

    <p>
      This project uses <strong>NVIDIA's NIM API</strong> with <strong>Meta's Llama 3.3 70B</strong> model.
      NIM uses the OpenAI-compatible format, so we use the standard OpenAI SDK pointed at NVIDIA's endpoint:
    </p>

    <pre data-lang="python"><code>{`import json, sys, os, httpx
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()
client = OpenAI(
    base_url="https://integrate.api.nvidia.com/v1",
    api_key=os.getenv("NVIDIA_API_KEY"),
)
MODEL = "meta/llama-3.3-70b-instruct"`}</code></pre>

    <p>
      The beauty of the OpenAI-compatible format is that you can swap the model by changing
      the <code>base_url</code> and <code>MODEL</code>. The rest of your agent code stays the same.
    </p>

    {/* Step 03 */}
    <h2><span className="step-num">03</span> Define Your Tools</h2>

    <p>
      Tools are JSON schemas using the OpenAI function calling format. You describe what each tool
      does and what inputs it expects. The LLM reads these descriptions to decide when to use them:
    </p>

    <pre data-lang="python"><code>{`TOOLS = [
    {"type": "function", "function": {
        "name": "get_weather",
        "description": "Get current weather for a city.",
        "parameters": {
            "type": "object",
            "properties": {"city": {"type": "string"}},
            "required": ["city"],
        },
    }},
    {"type": "function", "function": {
        "name": "calculator",
        "description": "Evaluate a math expression.",
        "parameters": {
            "type": "object",
            "properties": {"expression": {"type": "string"}},
            "required": ["expression"],
        },
    }},
]`}</code></pre>

    {/* Step 04 */}
    <h2><span className="step-num">04</span> Implement the Tools</h2>

    <p>
      These are just regular Python functions. The weather tool hits the <strong>Open-Meteo API</strong> (free, no API key),
      and the calculator safely evaluates math:
    </p>

    <pre data-lang="python"><code>{`def get_weather(city):
    geo = httpx.get(
        f"https://geocoding-api.open-meteo.com/v1/search?name={city}&count=1",
        timeout=15,
    ).json()
    loc = geo["results"][0]
    weather = httpx.get(
        f"https://api.open-meteo.com/v1/forecast?"
        f"latitude={loc['latitude']}&longitude={loc['longitude']}"
        f"&current=temperature_2m,weather_code"
        f"&temperature_unit=fahrenheit",
        timeout=15,
    ).json()
    return {
        "city": city,
        "temp_f": weather["current"]["temperature_2m"],
        "weather_code": weather["current"]["weather_code"],
    }

def calculator(expression):
    safe = {"min": min, "max": max, "abs": abs, "round": round}
    return {"result": eval(expression, {"__builtins__": {}}, safe)}

DISPATCH = {"get_weather": get_weather, "calculator": calculator}`}</code></pre>

    <p>
      Nothing fancy. Each tool returns a dict, we <code>json.dumps()</code> it and send it back to the LLM.
      That is the entire contract between your tools and the model.
    </p>

    {/* Step 05 */}
    <h2><span className="step-num">05</span> The Agent Loop (The Core)</h2>

    <p>
      This is the whole agent. A loop that sends messages, checks for tool calls,
      executes them, and continues until the model gives a final answer:
    </p>

    <pre data-lang="python"><code>{`def run_agent(user_message):
    messages = [
        {"role": "system", "content":
            "You are a helpful assistant with access to tools. "
            "Only use tools when the query requires them. "
            "For general knowledge questions, answer directly."},
        {"role": "user", "content": user_message},
    ]

    for _ in range(10):                    # safety limit
        resp = client.chat.completions.create(
            model=MODEL, messages=messages,
            tools=TOOLS, tool_choice="auto",
        )
        msg = resp.choices[0].message

        if not msg.tool_calls:             # no tools? we're done
            return msg.content

        tc = msg.tool_calls[0]
        args = json.loads(tc.function.arguments)
        result = DISPATCH[tc.function.name](**args)

        messages.append(msg)               # assistant's tool request
        messages.append({                  # our tool result
            "role": "tool",
            "tool_call_id": tc.id,
            "content": json.dumps(result),
        })`}</code></pre>

    <p>Three things to notice:</p>

    <p>
      <strong>1. Check <code>msg.tool_calls</code>.</strong> If it's empty or <code>None</code>,
      the model is done thinking and <code>msg.content</code> has the final answer.
    </p>

    <p>
      <strong>2. Match the <code>tool_call_id</code>.</strong> Every tool result must reference the exact{' '}
      <code>id</code> from the model's tool call. This is how it tracks which result belongs to which call.
    </p>

    <p>
      <strong>3. Append everything to messages.</strong> The assistant's message (containing <code>tool_calls</code>)
      AND your <code>tool</code> result both go into the conversation history. The model sees the full chain.
    </p>

    {/* Step 06 */}
    <h2><span className="step-num">06</span> Run It</h2>

    <div className="blog-diagram-img">
      <img src="/assets/blog/terminal-output.png" alt="Terminal showing the agent running: fetches Tokyo weather, converts temperature to Celsius using the calculator tool, and returns the final answer" />
      <p className="blog-diagram-caption">The agent in action: it fetches weather data, chains a calculator call, and returns the answer</p>
    </div>

    {/* Step 07 */}
    <h2><span className="step-num">07</span> What You Just Built</h2>

    <p>
      This ~50 line script is the same pattern underneath every agent framework. LangChain adds abstraction layers
      and a tool ecosystem. LangGraph adds stateful graphs with cycles. CrewAI adds multi agent roles. But strip
      the abstractions away, and you will find this exact loop at the center.
    </p>

    <p>
      <strong>Understanding the raw protocol means you can debug any framework, build custom agent patterns,
      and know when a framework is adding value versus adding complexity.</strong> That is the difference between
      using tools and understanding them.
    </p>

    {/* Extend It */}
    <div className="blog-callout">
      <div className="callout-label">Extend it</div>
      <ul>
        <li>Add a <code>web_search</code> tool using Tavily or Serper. The model will chain it with your other tools automatically</li>
        <li>Add a <code>read_file</code> tool and you have a basic code assistant</li>
        <li>Swap <code>base_url</code> to use OpenAI, Anthropic, or any OpenAI-compatible API</li>
        <li>Wrap the whole thing in FastAPI and you have an agent API endpoint</li>
      </ul>
    </div>
  </>
);

export default AIAgentPost;
