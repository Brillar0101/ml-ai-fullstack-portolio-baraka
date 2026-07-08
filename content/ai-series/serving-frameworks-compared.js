export const POST = {
  id: 'serving-frameworks-compared',
  title: 'vLLM, TGI, LitServe, or a Hosted API: Picking How to Serve Your LLM',
  excerpt: 'A four-person startup has a fine-tuned model and one week to ship. Do they stand up a GPU box or just call a hosted endpoint? This walks the axes that actually decide it.',
  category: 'AI',
  tags: ['Deployment', 'Serving', 'Infrastructure'],
  readTime: '8 min read',
  body: [
    {
      type: 'p',
      text: 'A four-person startup has a model they are proud of. They fine-tuned an open-weights LLM on their own support transcripts, and in the notebook it answers customer questions better than anything off the shelf. Now they have a week to put it behind their product. The engineer who drew the short straw opens a browser and finds a wall of options. vLLM, TGI, LitServe, and a dozen hosted APIs all promise to serve the model. Every one of them has a landing page that says it is fast and easy. None of them says which one is right for a team of four with a spiky traffic pattern and no dedicated ops person. That last question is the one that matters, and it is the one this post is about.'
    },
    {
      type: 'p',
      text: 'The trap here is treating this as a benchmark contest, where you pick whichever tool posts the biggest tokens-per-second number. Raw speed is real, but for most teams it is not the deciding factor. The decision turns on how much control you need, how your traffic behaves, and how many people you have to keep a server alive at 2am. Get those three right and the tool almost picks itself.'
    },
    {
      type: 'h2',
      text: 'Think of it like running a kitchen versus ordering delivery'
    },
    {
      type: 'p',
      text: 'Serving a model is a lot like feeding people. You can run your own kitchen: buy the equipment, hire cooks, and control every ingredient. You get exactly the food you want and, once the kitchen is busy, each plate is cheap. But you also own the gas bill, the broken oven, and the night the head cook calls in sick. The other option is ordering delivery. You pay more per plate and you eat what the restaurant makes, but you never touch a stove, and if nobody orders tonight you pay nothing.'
    },
    {
      type: 'p',
      text: 'Self-hosting a model is running the kitchen. A hosted inference API is ordering delivery. Neither is smarter than the other. A restaurant that serves a thousand covers a night should own its kitchen. A pop-up that sells lunch twice a week should not. Your model deployment sits somewhere on that same line, and the frameworks below are the equipment you would buy if you decide to cook.'
    },
    {
      type: 'terms',
      items: [
        { term: 'Serving framework', def: 'Software that wraps a model in a running server, so requests can come in over the network and answers go back out, handling batching, memory, and streaming for you instead of you writing that plumbing by hand.' },
        { term: 'Self-hosting vs hosted API', def: 'Self-hosting means you run the model on machines you rent or own and you manage the GPUs. A hosted API means a provider runs the model and you send requests and pay per token, with no servers of your own.' },
        { term: 'OpenAI-compatible endpoint', def: 'A server that accepts the same request shape OpenAI popularized, so client code written for one such endpoint works against another by changing only the URL and key.' },
        { term: 'Throughput', def: 'How many tokens the server can produce per second across all users at once. Higher throughput means the same GPU serves more people, which lowers your cost per answer.' }
      ]
    },
    {
      type: 'h2',
      text: 'Why a GPU sitting mostly idle is the real problem'
    },
    {
      type: 'p',
      text: 'Here is the mechanism that explains most of the throughput story. A GPU is expensive and it is happiest when it is doing a lot of math at once. When a single user sends a prompt, the model generates one token, then the next, then the next, and between those steps much of the chip is idle. Serving one request at a time wastes almost all of what you are paying for.'
    },
    {
      type: 'p',
      text: 'The fix is batching: processing several requests together so the GPU stays full. The older, clumsy way was to collect a fixed group of requests, run them as a block, and wait for the slowest one before starting the next block. **Continuous batching** is the modern version, and it is the single feature that separates a serious serving framework from a toy. Instead of waiting for a whole block to finish, the server adds and removes requests from the running batch token by token. A short request that finishes early frees its slot immediately, and a new request drops in without stalling anyone. The GPU stays packed, and throughput climbs several times over compared to naive serving. vLLM built its reputation on doing this well, and its memory trick for holding many requests at once is a big part of why.'
    },
    {
      type: 'diagram',
      title: 'How to choose',
      root: {
        label: 'How steady is your traffic, and how much control do you need?',
        color: 'purple',
        children: [
          {
            edge: 'high steady volume, need full control',
            node: {
              label: 'Self-host with vLLM: max throughput, OpenAI-compatible server, cheapest per token at scale',
              color: 'yellow'
            }
          },
          {
            edge: 'production self-host, want HF ecosystem',
            node: {
              label: 'Hugging Face TGI: solid serving with a mature toolchain around it',
              color: 'yellow'
            }
          },
          {
            edge: 'mixed models, not only LLMs',
            node: {
              label: 'LitServe: flexible serving for many model types with custom logic',
              color: 'yellow'
            }
          },
          {
            edge: 'spiky or low volume, tiny team',
            node: {
              label: 'Hosted API: no ops, pay per token, ship this week',
              color: 'yellow'
            }
          }
        ]
      },
      caption: 'Traffic shape and control needs point to a lane before speed does.'
    },
    {
      type: 'h2',
      text: 'Where each option actually fits'
    },
    {
      type: 'p',
      text: 'Start with **vLLM**. It is the throughput champion for self-hosting. If you have real, steady volume and you run it well, it will squeeze the most answers out of each GPU, which is the same as saying it gives you the lowest cost per token at scale. It also ships an OpenAI-compatible server out of the box, so your app talks to it the same way it would talk to a hosted provider. The catch is that you are still running GPUs, watching memory, and picking up the pager when the box dies.'
    },
    {
      type: 'p',
      text: '**Hugging Face TGI** (Text Generation Inference) is the production-serving option with the deepest surrounding ecosystem. It also does continuous batching and streaming, and it slots neatly into the wider Hugging Face world of models and tooling, which matters if your team already lives there. **LitServe**, from Lightning AI, plays a different game. It is a flexible serving engine that is not LLM-only. If you serve a mix of models, an LLM here, an image model there, some custom scoring logic in between, and you want one framework with room for your own code around each one, LitServe is built for that generality rather than for topping an LLM leaderboard.'
    },
    {
      type: 'p',
      text: 'Then there are **hosted APIs**. You send requests, you pay per token, and you never see a GPU. You give up some control: you serve whatever models the provider offers, at their prices, and features like multi-LoRA adapter swapping or exotic sampling may or may not be exposed. In exchange you get zero ops and instant scale. For a team of four shipping in a week, that trade is often the right one, even if the per-token price looks higher than a GPU bill on paper.'
    },
    {
      type: 'p',
      text: 'The quiet advantage that ties this together is the OpenAI-compatible shape. Because vLLM and most hosted APIs both speak it, you can write your client once and move between them by swapping a URL. Start on a hosted API to ship fast, and if volume grows enough to justify a kitchen, point the same code at a self-hosted vLLM server.'
    },
    {
      type: 'code',
      lang: 'python',
      title: 'One client, two backends: only the URL changes',
      code: `from openai import OpenAI

# Point base_url at a hosted provider OR your own vLLM server.
# The rest of the code does not change.
client = OpenAI(
    base_url="http://localhost:8000/v1",  # vLLM: OpenAI-compatible
    api_key="local-or-real-key",
)

stream = client.chat.completions.create(
    model="my-finetuned-model",
    messages=[{"role": "user", "content": "Where is my order?"}],
    stream=True,  # tokens arrive as they are generated
)

for chunk in stream:
    piece = chunk.choices[0].delta.content
    if piece:
        print(piece, end="", flush=True)`
    },
    {
      type: 'h2',
      text: 'The mistakes that burn teams'
    },
    {
      type: 'p',
      text: 'The most common one is chasing benchmark throughput when your traffic is spiky. A GPU that hits a huge tokens-per-second number under a saturated load still costs you the same money when it sits idle between bursts. If your usage comes in unpredictable spikes, a hosted API that scales to zero often beats a self-hosted box that you pay for around the clock. Match the tool to your traffic shape, not to someone else\'s benchmark.'
    },
    {
      type: 'p',
      text: 'The second mistake is underpricing operations. A GPU instance is the visible cost. The invisible cost is the person who patches it, watches memory, handles the driver upgrade that breaks everything, and gets paged when it falls over at midnight. A team of four rarely has a spare human for that, and burning your best engineer on server babysitting is far more expensive than the API bill you were trying to avoid.'
    },
    {
      type: 'p',
      text: 'The third is forgetting the features you will actually need in production. Streaming so users see tokens appear, structured output so the model returns clean JSON your code can parse, and multi-LoRA so you can serve many fine-tuned variants from one base model are not luxuries once you have real users. Check that your chosen path supports the ones you need before you commit, rather than discovering the gap after launch.'
    },
    {
      type: 'callout',
      title: 'The one-line rule',
      text: 'Steady, high volume and a need for full control point to self-hosting with vLLM. Spiky or low volume and a small team point to a hosted API. Write your client against the OpenAI-compatible shape so switching later costs you a URL, not a rewrite.'
    },
    {
      type: 'p',
      text: 'One trap catches teams no matter which side they pick, and it is measuring the wrong thing. A framework that wins on a single-request benchmark can lose badly under real concurrent load, because the number that decides your bill is throughput at your target latency, not the speed of one lonely request. Before committing, replay a realistic mix of prompt and output lengths at the concurrency you actually expect, and watch how time-to-first-token holds up as the batch fills. The second trap is lock-in to a non-standard API. If you speak the OpenAI-compatible protocol on both sides, moving from a hosted endpoint to self-hosted vLLM later is a config change, not a rewrite, which is exactly what keeps the decision reversible.'
    },
    {
      type: 'p',
      text: 'So the startup with four people and one week should almost certainly start on a hosted API. It ships now, it costs nothing on quiet nights, and it frees their engineers to build the product instead of nursing a GPU. If the day comes when traffic is steady and large enough that the per-token bill dwarfs what a rented GPU would cost, they revisit the question, stand up vLLM, and point the same client code at it. That is not indecision. It is buying the equipment only when the kitchen is busy enough to earn it.'
    },
    {
      type: 'sources',
      items: [
        { title: 'vLLM documentation', url: 'https://docs.vllm.ai/' },
        { title: 'Hugging Face Text Generation Inference (TGI) documentation', url: 'https://huggingface.co/docs/text-generation-inference/' },
        { title: 'LitServe documentation (Lightning AI)', url: 'https://lightning.ai/docs/litserve/' }
      ]
    }
  ]
};
