// Original AI Engineering series post. Rendered by src/pages/blog/SeriesPost.jsx;
// scheduled and given its sources in src/data/seriesPosts.js.
export const POST = {
  "id": "quantization-plain-terms",
  "title": "Quantization in plain terms",
  "excerpt": "How models get smaller and faster by storing numbers with less precision, and what you trade away when they do.",
  "category": "ML",
  "chapter": "Chapter 7",
  "tags": [
    "Quantization",
    "Inference",
    "Memory"
  ],
  "seriesNum": 13,
  "publishAt": "2026-02-25T12:00:00Z",
  "body": [
    {
      "type": "p",
      "text": "In early 2023, running a capable language model meant renting expensive cloud GPUs. Then a developer released a project called llama.cpp that did something that felt impossible: it ran Meta's Llama model on a regular laptop, even a MacBook, with no special hardware. Within days people were running chatbots offline on their own machines. The trick that made it work was not a smaller model or a faster chip. It was quantization, storing the model's numbers with fewer bits."
    },
    {
      "type": "p",
      "text": "That moment is the whole concept in a sentence. The same model, stored more compactly, suddenly fit somewhere it never could before. Here is how that works and what it costs."
    },
    {
      "type": "h2",
      "text": "Rounding without ruining"
    },
    {
      "type": "p",
      "text": "A model is billions of numbers, called parameters. Each number can be stored with more or fewer bits, the same way you can write a price as 19.99 or round it to 20. Full precision keeps a lot of decimal places per number, accuracy the model mostly does not need to behave well. Quantization rounds every number to fewer bits."
    },
    {
      "type": "p",
      "text": "The model gets dramatically smaller and faster, and in exchange each number is slightly off. Most of the time the model barely notices, the way rounding prices to the nearest dollar barely changes your total."
    },
    {
      "type": "h2",
      "text": "Walk the math"
    },
    {
      "type": "p",
      "text": "Memory is close to the number of parameters times the bytes per parameter, and that simple multiplication is the whole story. Take a 7-billion-parameter model. At 2 bytes per number it needs about 14 GB just to hold the weights, which will not fit on a typical laptop. Quantize it down to 4 bits, half a byte, and the same model needs around 3.5 GB."
    },
    {
      "type": "p",
      "text": "That is the difference between \"cloud only\" and \"runs on the machine in front of you,\" and it is exactly the jump llama.cpp made. Push too far, to extreme low-bit settings, and the rounding finally starts to show as worse output, which is why 4-bit became a popular sweet spot."
    },
    {
      "type": "h2",
      "text": "Precision, in precise terms"
    },
    {
      "type": "terms",
      "items": [
        {
          "term": "Precision",
          "def": "how many bits store each number. More bits means finer detail and more memory."
        },
        {
          "term": "Quantization",
          "def": "storing weights with fewer bits, like 8-bit or 4-bit instead of 16 or 32, to shrink and speed up the model."
        },
        {
          "term": "Memory footprint",
          "def": "roughly the number of parameters times the bytes per parameter."
        }
      ]
    },
    {
      "type": "h2",
      "text": "See the rounding on one number"
    },
    {
      "type": "p",
      "text": "It helps to watch the trade on a single value. Suppose a weight is 0.7341. In high precision the model stores all those digits. Quantize hard and it might store the nearest step it can represent, say 0.73, throwing away the rest. One number being off by a hundredth sounds harmless, and on its own it is."
    },
    {
      "type": "p",
      "text": "The reason quantization works at all is that a model has billions of these numbers, and the tiny errors mostly wash out across so many of them rather than piling up. The reason extreme quantization eventually breaks is that, past a point, the steps get so coarse that important distinctions between weights collapse, and the model starts to behave noticeably worse. So the whole craft is finding how coarse you can go before the wash-out stops saving you."
    },
    {
      "type": "lab",
      "height": 460,
      "title": "The memory arithmetic, and the rounding error underneath it",
      "caption": "At 8 bits the error sits in the fourth decimal place. At 2 bits the steps get so coarse that different weights collapse onto the same value, which is where quality starts to go.",
      "code": "# What rounding a model's numbers actually costs. No model\n# here, just the arithmetic that decides whether a 7B model\n# fits on your laptop.\n\ndef memory_gb(params_billion, bits):\n    return params_billion * 1e9 * (bits / 8) / 1e9\n\nprint(\"a 7-billion-parameter model, stored at different precisions:\")\nprint(\"%-10s %-12s %s\" % (\"precision\", \"memory\", \"fits in 8 GB of RAM?\"))\nfor label, bits in [(\"fp16\", 16), (\"int8\", 8), (\"4-bit\", 4), (\"2-bit\", 2)]:\n    gb = memory_gb(7, bits)\n    print(\"%-10s %-12s %s\" % (label, \"%.1f GB\" % gb, \"yes\" if gb < 8 else \"no\"))\n\nprint()\nprint(\"now watch the rounding on individual weights:\")\n\ndef quantize(x, bits, lo=-1.0, hi=1.0):\n    \"\"\"Map x onto the nearest of 2**bits evenly spaced steps.\"\"\"\n    levels = 2 ** bits - 1\n    step = (hi - lo) / levels\n    return lo + round((x - lo) / step) * step\n\nWEIGHTS = [0.7341, -0.1200, 0.0042, 0.9987, -0.5555]\nprint(\"%-10s %s\" % (\"original\", \"  \".join(\"%+.4f\" % w for w in WEIGHTS)))\nfor bits in (8, 4, 2):\n    q = [quantize(w, bits) for w in WEIGHTS]\n    err = sum(abs(a - b) for a, b in zip(WEIGHTS, q)) / len(WEIGHTS)\n    print(\"%-10s %s   mean error %.4f\"\n          % (\"%d-bit\" % bits, \"  \".join(\"%+.4f\" % w for w in q), err))\n\nprint()\nprint(\"At 8 bits the error is in the fourth decimal place and nothing notices.\")\nprint(\"At 2 bits the steps are so coarse that different weights collapse onto\")\nprint(\"the same value, and distinctions the model was relying on disappear.\")\nprint(\"The craft is finding how coarse you can go before that starts to show,\")\nprint(\"which is a question only your own evaluation can answer.\")\n\n# Try it: add a weight very close to another one, say 0.7341\n# and 0.7350, then quantize to 2 bits and check whether they\n# are still different numbers.\n"
    },
    {
      "type": "h2",
      "text": "The trade you are making"
    },
    {
      "type": "p",
      "text": "Quantization buys you smaller and faster for a small, usually acceptable quality cost. The more aggressively you quantize, the more memory you save and the more rounding error you accept, so the job is to find the lowest precision your task can tolerate. For many uses, **8-bit** is nearly free quality-wise and **4-bit** is a strong default that most people cannot tell apart from full precision in normal use. Go lower than that and the losses usually start to show. It is one of the highest-leverage moves in all of inference optimization, which is why it is everywhere."
    },
    {
      "type": "h2",
      "text": "A caveat worth knowing"
    },
    {
      "type": "p",
      "text": "Two honest footnotes keep you out of trouble. First, quantization is not uniformly free across tasks."
    },
    {
      "type": "p",
      "text": "A model that still chats fine at 4-bit might get measurably worse at something demanding like precise math or code, so you quantize and then evaluate on your actual task rather than assuming. Second, not all bits are equal. Modern methods are smart about which weights to keep precise and which to crush, so a well-done 4-bit model can beat a naive one by a lot. The takeaway is not \"always pick the smallest number.\" It is \"pick the smallest number that still passes your evaluation,\" which is the same discipline that runs through this whole series."
    },
    {
      "type": "h2",
      "text": "Why this matters even if you never touch a laptop"
    },
    {
      "type": "p",
      "text": "It is easy to file quantization under \"hobbyist trick for running models at home,\" but it quietly decides the economics of anything you deploy. A quantized model needs less memory, so it fits on cheaper hardware, and it usually runs faster because there are fewer bits to move around, which means lower latency for your users and a smaller bill for you. For a service handling many requests at once, moving from full precision to a solid 8-bit or 4-bit model can roughly halve or quarter the memory each copy of the model needs, which lets you serve far more users on the same machine. So even if you only ever call a model through an API, quantization is part of why that API is affordable, and when you run your own models it becomes one of the very first levers you pull when the costs start to hurt. The headline is laptops, but the real story is cost per user."
    },
    {
      "type": "h2",
      "text": "Smaller numbers, same answers"
    },
    {
      "type": "p",
      "text": "Quantization is why a model that once needed a data center can now run on your laptop. It does not change what the model knows, only how precisely its numbers are stored. Nearly every deployed model uses some form of it, because smaller and faster for a sliver of quality is a trade almost everyone wants to make. Just quantize, then check, because the sliver of quality you give up is small on average and occasionally lands right on the task you care about."
    }
  ]
};
