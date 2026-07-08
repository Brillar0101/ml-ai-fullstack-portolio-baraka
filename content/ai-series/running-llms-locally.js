export const POST = {
  id: 'running-llms-locally',
  title: 'Running an LLM on Your Own Laptop: llama.cpp, Ollama, and GGUF',
  excerpt: 'A developer wants a coding assistant that works on a plane with no wifi and never ships their code to a server. Here is how a 7B model fits in a few gigabytes and answers from a MacBook.',
  category: 'AI',
  tags: ['LLMs', 'Local', 'Quantization'],
  readTime: '8 min read',
  body: [
    {
      type: 'p',
      text: 'A developer is on a long flight with no wifi, and she wants a coding assistant that can explain a stack trace and draft a function. She also works on a codebase her employer will not let leave the building, so sending snippets to a cloud API is off the table. For years the answer to both problems was the same shrug: you need a server, a GPU, and a network connection, so wait until you land. That answer is now out of date. The model she wants runs on the laptop already in her bag, offline, with nothing leaving the machine. This post is about how that became possible, and how you set it up yourself.'
    },
    {
      type: 'p',
      text: 'The reason people assume you cannot run a real model locally is a memory scare. A model with billions of parameters sounds like it needs a data center, and in its raw form it nearly does. The trick that changed everything is that you do not have to store the model in its raw form. You can shrink each number inside it, keep most of the quality, and suddenly a capable model fits in the RAM of a normal laptop. Once you see that one idea, the tools built on top of it stop looking like magic and start looking like plumbing.'
    },
    {
      type: 'h2',
      text: 'Why a big model does not need a big machine anymore'
    },
    {
      type: 'p',
      text: 'Start with the intuition, because the math follows from it. A model is a giant pile of numbers called weights, and every weight takes up space in memory. If you store each weight in high precision, meaning many bits per number, the pile is large. But those numbers do not all need to be exact. The model still gives good answers if you round each weight to a coarser value, the way a photo still looks fine when you save it as a smaller JPEG instead of a raw camera file. Rounding the weights to fewer bits is called **quantization**, and it is the single move that puts a serious model inside a laptop.'
    },
    {
      type: 'p',
      text: 'Now walk a concrete example so the size becomes real. Take a model with 8 billion parameters, which is a common and genuinely useful size. In full 16-bit precision each weight eats 2 bytes, so the whole thing needs roughly 8 billion times 2, about 16 gigabytes, just to load. That is already a stretch for many laptops. Quantize the same model down to 4 bits per weight and each weight now costs half a byte. The arithmetic becomes 8 billion times 0.5, which lands near 4 to 5 gigabytes once you add the small amount of bookkeeping the format needs. A machine with 16 gigabytes of memory holds that comfortably and still has room to run your editor. Nothing about the model changed except how finely each number is written down, and that one adjustment is what turns an impossible download into a routine one.'
    },
    {
      type: 'diagram',
      nodes: [
        { label: 'Pick a model', detail: 'Choose an open-weights model at a size you can run, for example a 7B or 8B chat or coding model.' },
        { label: 'Pick a quantization that fits your RAM', detail: 'Q4 for a 7-8B model lands near 4-5 GB. Check it fits your memory with room to spare.' },
        { label: 'Run it via Ollama', detail: 'One pull command downloads the GGUF file, one run command starts chatting. No server to manage.' }
      ],
      caption: 'The whole local setup is three decisions: which model, which quantization level fits your memory, then run it.'
    },
    {
      type: 'p',
      text: 'That memory rule is worth keeping in your head, because it is the number that decides everything. Multiply the parameter count by the bytes per weight, and you get the floor for how much memory you need. Params times bytes-per-weight. A 7B model at 4 bits needs about 4 gigabytes, a 13B model at 4 bits needs about 8, and a 70B model at 4 bits needs around 40 and is out of reach for most laptops. When you browse model files online and see labels like Q4 or Q8, that number is telling you the bytes-per-weight, and therefore the size of the download and the memory it will occupy.'
    },
    {
      type: 'h2',
      text: 'The words on the download page, defined'
    },
    {
      type: 'p',
      text: 'Before going further, it helps to pin down the terms you will meet the moment you go looking for a model to run. These four show up on every page and in every tutorial, and once they click the rest of the setup reads like a recipe.'
    },
    {
      type: 'terms',
      items: [
        { term: 'Quantization', def: 'Rounding a model\'s weights to fewer bits each, so the model takes far less memory. Going from 16-bit to 4-bit cuts the size by roughly four times while keeping most of the answer quality.' },
        { term: 'Quantization level (Q4, Q8)', def: 'A label for how many bits each weight keeps. Q8 is 8 bits per weight, larger and closer to the original. Q4 is 4 bits per weight, half the size, with a small quality dip. Higher Q means bigger and more faithful.' },
        { term: 'GGUF', def: 'A single file format that packages a quantized model plus everything needed to run it: the weights, the tokenizer, and the settings. One .gguf file is the whole model, ready to load.' },
        { term: 'llama.cpp', def: 'The engine underneath. A C and C++ program that loads a GGUF file and runs the model efficiently on ordinary CPUs, on GPUs, and on Apple Silicon, with no heavy Python stack required.' },
        { term: 'Ollama', def: 'A friendly wrapper around that engine. It downloads the right GGUF for you, manages the models on disk, and gives you a single command to pull and chat, so you never touch the low-level flags.' },
        { term: 'Unified memory', def: 'On Apple Silicon Macs the CPU and GPU share one pool of memory. The model does not have to be copied into separate video memory, so a Mac with 16 or 32 GB can feed the GPU directly and run models that would need a costly graphics card elsewhere.' }
      ]
    },
    {
      type: 'h2',
      text: 'What actually happens when you type two commands'
    },
    {
      type: 'p',
      text: 'Here is the mechanism, layer by layer, so you know what each piece is doing. At the bottom sits **llama.cpp**, the engine that reads the numbers and does the math to turn your prompt into text. It is written in C and C++ specifically so it can run fast on hardware you already own, without a pile of Python dependencies. It reads a **GGUF** file, which is the neat package holding the quantized weights and the tokenizer together in one place. On top of that sits **Ollama**, which hides the sharp edges: it knows which GGUF to fetch for the model name you asked for, stores it, and hands your prompts to llama.cpp underneath.'
    },
    {
      type: 'diagram',
      rows: [
        [{ label: 'You', detail: 'Type a prompt in the terminal or send an HTTP request from your app.' }],
        [{ label: 'Ollama', detail: 'Finds and manages the model, exposes a simple command and a local API.' }],
        [{ label: 'llama.cpp', detail: 'The engine that loads the weights and generates tokens on your CPU or GPU.' }],
        [{ label: 'GGUF file', detail: 'The quantized model on disk: weights plus tokenizer in one package.' }],
        [{ label: 'Your hardware', detail: 'CPU, a GPU if you have one, or Apple Silicon unified memory.' }]
      ],
      caption: 'Each layer hides the one below it. Ollama is what you talk to; GGUF and your hardware are where the work lands.'
    },
    {
      type: 'p',
      text: 'The hardware layer is where the experience differs most between machines. On a plain **CPU** the model runs, but slowly, because a processor works through the math a few lanes at a time. A dedicated **GPU** is far faster, since it does thousands of small calculations at once, but it can only run a model that fits inside its own separate video memory, which is often smaller and pricier than system RAM. Apple Silicon sits in a happy middle: its **unified memory** means the GPU reaches straight into the same large pool the rest of the machine uses, so a MacBook with 32 gigabytes can run models that would demand an expensive graphics card on a Windows or Linux box. That is exactly why the developer on the plane, on her MacBook, gets a genuinely usable coding assistant with no extra hardware.'
    },
    {
      type: 'p',
      text: 'In practice you never invoke these layers by hand. You install Ollama, then two commands stand up the whole stack. The first pulls the model, which downloads the GGUF once and caches it. The second runs it, loading the weights and dropping you into a chat. Everything below stays invisible.'
    },
    {
      type: 'code',
      lang: 'bash',
      title: 'Pull a quantized coding model and run it fully offline',
      code: `# Install once (macOS example). See ollama.com for other systems.
brew install ollama
ollama serve &                 # start the local engine in the background

# Pull an 8B model at 4-bit quantization: a ~4-5 GB download, cached on disk.
ollama pull llama3.1:8b        # Ollama picks a Q4 GGUF by default

# Now unplug the network if you like. This runs entirely on your machine:
ollama run llama3.1:8b "Explain what a segfault is, with a short C example."

# Want a smaller or larger tradeoff? Ask for an explicit quantization tag:
ollama pull llama3.1:8b-instruct-q8_0   # Q8: bigger, closer to full quality
ollama pull qwen2.5-coder:7b            # a coding-tuned model, still a few GB`
    },
    {
      type: 'h2',
      text: 'The tradeoff dial, and where people set it wrong'
    },
    {
      type: 'p',
      text: 'Quantization is a dial, and the common mistakes are about turning it too far in one direction. **Q8** keeps 8 bits per weight, so it stays close to the original model and gives up almost nothing in quality, at the cost of a larger file and more memory. **Q4** keeps 4 bits, halving the size, with a quality drop that is usually small and often hard to notice for everyday tasks. Push below 4 bits and the model starts making more mistakes, repeating itself, or losing the thread, and at that point the memory you saved is not worth the answers you got. The first mistake is going too low to fit a model your machine was never going to run well anyway.'
    },
    {
      type: 'p',
      text: 'The opposite mistake is grabbing the highest quality file without checking your memory. If you have 16 gigabytes of RAM and you download a Q8 version of a 13B model, it will not fit alongside your operating system and editor, and the machine will either refuse to load it or crawl as it swaps to disk. The fix is the rule from earlier: multiply parameters by bytes-per-weight, compare against your free memory, and leave a couple of gigabytes of headroom. A third quiet mistake is expecting a local 8B model to match a frontier cloud model. It will not, and that is the point of the next paragraph.'
    },
    {
      type: 'callout',
      title: 'When local is the right call, and when it is not',
      text: 'Run local when privacy, offline access, per-request cost, or tinkering matter more than peak quality: your code never leaves the machine, it works on a plane, and it costs nothing per token. Reach for a cloud API instead when you need frontier-level reasoning, very high throughput across many users, or a model far larger than your RAM. The two are not rivals; many developers use a local model for private and quick work and a hosted one for the hardest questions.'
    },
    {
      type: 'p',
      text: 'So the developer on the plane ends up in a good place. She picked an 8-billion-parameter coding model, chose a 4-bit quantization that fits her MacBook with room to spare, and pulled it with one Ollama command before takeoff. In the air, with the network off, the model explains her stack traces and drafts functions, and not a single line of her employer\'s code leaves the laptop. It is not the smartest model in the world, and for a gnarly architecture question she will still want a frontier API when she lands. But for private, offline, everyday help, the machine already in her bag is enough. The whole trick was learning that a big model does not need a big machine, only smaller numbers.'
    },
    {
      type: 'sources',
      items: [
        { title: 'llama.cpp (ggml-org) on GitHub', url: 'https://github.com/ggml-org/llama.cpp' },
        { title: 'Ollama documentation', url: 'https://github.com/ollama/ollama/tree/main/docs' },
        { title: 'GGUF file format specification', url: 'https://github.com/ggml-org/ggml/blob/master/docs/gguf.md' }
      ]
    }
  ]
};
