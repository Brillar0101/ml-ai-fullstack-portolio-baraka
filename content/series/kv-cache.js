// Original AI Engineering series post. Rendered by src/pages/blog/SeriesPost.jsx.
// Every factual claim is taken from the numbered sources at the end. The GQA
// head-sharing figure is reproduced under CC BY 4.0 (arXiv 2305.13245); the
// charts are redrawn from table values in the GQA and DeepSeek-V2 papers.
export const POST = {
  "id": "kv-cache",
  "title": "The KV cache and three ways to shrink it",
  "excerpt": "DeepSeek-V2 reported a KV cache 93.3% smaller than its predecessor's. Why generation stores keys and values at all, how to size that store, and what multi-query, grouped-query and latent attention each gave up to make it smaller.",
  "category": "ML",
  "chapter": "Chapter 9",
  "tags": [
    "Inference",
    "KV Cache",
    "Attention"
  ],
  "seriesNum": 30,
  "publishAt": "2026-06-24T12:00:00Z",
  "body": [
    {
      "type": "p",
      "text": "In May 2024 DeepSeek-AI reported that its new model, DeepSeek-V2, needs 93.3% less KV cache than DeepSeek 67B, the dense model it replaced. Over the same comparison it cut training cost by 42.5% and raised maximum generation throughput to 5.76 times the old figure.[^1] On a single node of 8 H800 GPUs, the paper says, DeepSeek-V2 generates more than 50,000 tokens per second.[^1]"
    },
    {
      "type": "p",
      "text": "The throughput gain follows from the memory number. A server that stores less per token can keep more requests in flight at once, and the paper says as much: the smaller cache is what lets the deployed model \"serve a much larger batch size.\"[^1] This post follows that budget as it shrinks. First comes why the cache exists at all, then how big it is, then three changes to attention that each made it smaller: multi-query attention in 2019, grouped-query attention in 2023, and DeepSeek's multi-head latent attention in 2024. Each one bought memory and paid for it somewhere else."
    },
    {
      "type": "h2",
      "text": "Generating without a cache redoes the whole prefix"
    },
    {
      "type": "p",
      "text": "A language model writes one **token** (a word or piece of a word) at a time. Each new token is fed back in as input for the next step, which the Transformer paper calls being auto-regressive.[^2] Training does not have this problem, because the full target text is known in advance and every position can be processed in parallel. At generation time, the output at one position decides the input at the next, so the steps must run in order.[^3]"
    },
    {
      "type": "p",
      "text": "Inside every layer, each token is turned into a query, a key and a value (defined properly in the next section). The key and value for a past token never change once that token is written, because later tokens cannot influence earlier ones in a decoder. A naive generator ignores this and runs the whole prefix through the model again at every step."
    },
    {
      "type": "p",
      "text": "The Transformer paper lists the cost of one self-attention layer over a sequence of length \\(n\\) with width \\(d\\) as \\(O(n^2 \\cdot d)\\).[^2] Rerunning the prefix means paying that price again at every step \\(t = 1, \\dots, n\\), plus \\(O(t \\cdot d^2)\\) for the projections. Summing over the steps (standard arithmetic, not a figure from the papers) gives roughly \\(O(n^3 d + n^2 d^2)\\) for the whole output. If instead the model stores each token's key and value the first time it computes them, step \\(t\\) only has to project one new token and compare one query against \\(t\\) stored keys, which is \\(O(d^2 + t \\cdot d)\\) per layer. That totals \\(O(n d^2 + n^2 d)\\). Those stored tensors are the **KV cache**."
    },
    {
      "type": "p",
      "text": "Shazeer's 2019 paper analyses exactly this incremental loop. Under his simplifying assumptions, the arithmetic across \\(n\\) steps is \\(\\Theta(b n d^2)\\) for a batch of \\(b\\) sequences, the same as processing them in parallel. The memory traffic is the problem: \\(\\Theta(b n^2 d + n d^2)\\), where the first term is loading the cached keys and values and the second is loading the weights.[^3] The ratio of memory access to arithmetic is \\(\\Theta(n/d + 1/b)\\). When that ratio is near 1, he writes, memory bandwidth becomes a major bottleneck on modern hardware, where compute can be two orders of magnitude faster than memory.[^3] A bigger batch shrinks \\(1/b\\), memory permitting. The \\(n/d\\) term comes from reloading the cache at every step, and batching does nothing about it."
    },
    {
      "type": "p",
      "text": "So the cache removes the repeated arithmetic but leaves a new cost behind. It has to be stored, and it has to be read in full once per generated token."
    },
    {
      "type": "h2",
      "text": "The attention equation, one symbol at a time"
    },
    {
      "type": "eq",
      "tex": "\\mathrm{Attention}(Q, K, V) = \\mathrm{softmax}\\!\\left(\\frac{Q K^{\\top}}{\\sqrt{d_k}}\\right) V",
      "caption": "Scaled dot-product attention, equation 1 of Vaswani et al., 2017.[^2]"
    },
    {
      "type": "p",
      "text": "\\(Q\\) holds the **queries**, one row per position that is asking a question. \\(K\\) holds the **keys**, one row per position that can be looked at, and \\(V\\) holds the **values**, the content that gets passed along. Each row of \\(Q K^{\\top}\\) is a list of dot products between one query and every key, a score for how well each earlier token matches. Dividing by \\(\\sqrt{d_k}\\), where \\(d_k\\) is the key width, keeps those scores from growing large as vectors get wider; the authors suspect large scores push the softmax into regions with tiny gradients.[^2] The softmax turns each row of scores into weights that sum to 1, and multiplying by \\(V\\) returns a weighted average of the values.[^2] During generation, a mask sets the scores for future positions to minus infinity so a token can only look backward.[^2]"
    },
    {
      "type": "p",
      "text": "**Multi-head attention** runs \\(h\\) of these in parallel. Each head has its own learned projections that produce its own queries, keys and values from the same input, and the head outputs are concatenated and projected again.[^2] The base Transformer used \\(h = 8\\) heads of width \\(d_k = d_v = 64\\).[^2] For the cache, the fact that matters is that every head carries its own keys and values, so all of them must be stored."
    },
    {
      "type": "terms",
      "optional": false,
      "items": [
        {
          "term": "KV cache",
          "def": "the keys and values already computed for every earlier token, in every layer and head, kept in accelerator memory so they are not recomputed at each step."
        },
        {
          "term": "Decode step",
          "def": "one pass that produces one new token. It reads the weights and the entire KV cache once."
        },
        {
          "term": "Memory bandwidth",
          "def": "how fast data can move from the accelerator's main memory to its compute units. Decoding is usually limited by this, not by arithmetic."
        },
        {
          "term": "Head",
          "def": "one of the parallel attention computations inside a layer, each with its own projections."
        }
      ]
    },
    {
      "type": "h2",
      "text": "Sizing the cache"
    },
    {
      "type": "p",
      "text": "DeepSeek-V2's paper states the count for standard multi-head attention: it caches \\(2 n_h d_h l\\) elements per token, where \\(n_h\\) is the number of heads, \\(d_h\\) the width of each head and \\(l\\) the number of layers.[^1] The factor 2 is one key and one value. Multiplying out to bytes for a whole batch is standard arithmetic:"
    },
    {
      "type": "eq",
      "tex": "\\begin{gathered} \\text{bytes} = 2 \\cdot l \\cdot n_{kv} \\cdot d_h \\\\[2pt] \\times\\ p \\cdot n \\cdot b \\end{gathered}",
      "caption": "KV cache size. Standard arithmetic built on the per-token count in section 2.1.1 of DeepSeek-AI, 2024,[^1] with \\(n_h\\) replaced by the number of key/value heads \\(n_{kv}\\) so the same formula covers the variants below."
    },
    {
      "type": "p",
      "text": "Term by term: \\(l\\) layers each keep their own cache. \\(n_{kv}\\) is how many distinct key and value heads a layer stores; in plain multi-head attention it equals the number of query heads. \\(d_h\\) is the width of each head. \\(p\\) is bytes per element, 2 for 16-bit numbers. \\(n\\) is the number of tokens in the context, and \\(b\\) is the number of sequences served together. Every term is a straight multiplier, and the last two grow with traffic."
    },
    {
      "type": "p",
      "text": "A worked example uses DeepSeek 67B, the model in the opening. Its paper lists 95 layers, a model width of 8,192, 64 query heads, 8 key/value heads and a 4,096-token context.[^6] That gives a head width of 128 and \\(2 \\times 95 \\times 8 \\times 128 = 194{,}560\\) elements per token. At 2 bytes each, that is about 389 KB per token and roughly 1.6 GB for one full 4,096-token sequence. (This arithmetic is mine, not a number printed in either paper.)"
    },
    {
      "type": "p",
      "text": "At larger scale the figures get big. Pope and colleagues at Google give one: for a 500B+ parameter model with multi-head attention, a batch of 512 and a context of 2,048, the KV cache totals 3 TB, three times the size of the model's weights. The chip must load that cache from off-chip memory once for every token generated, and the compute cores sit mostly idle while it does.[^4] They also report that at batch sizes and sequence lengths around 512 and 2,048 and above, the time to load the cache dominates the time to load the weights.[^4]"
    },
    {
      "type": "p",
      "text": "Only a few terms in the size formula are open to change. Context length and batch size are what users want, so they are left alone. Precision can be lowered, and that is the subject of quantization work. The three designs below attack \\(n_{kv} \\cdot d_h\\)."
    },
    {
      "type": "h2",
      "text": "Multi-query attention: every query head shares one key and one value"
    },
    {
      "type": "p",
      "text": "Noam Shazeer's 2019 proposal is a small edit. **Multi-query attention** (MQA) keeps many query heads but has all of them share a single set of keys and values.[^3] In the size formula, \\(n_{kv}\\) drops from \\(h\\) to 1. His analysis shows the troublesome memory-to-arithmetic term falls from \\(n/d\\) to \\(n/(dh)\\), a factor of \\(h\\).[^3]"
    },
    {
      "type": "p",
      "text": "He tested it on WMT 2014 English to German translation with a 6-layer encoder-decoder model with \\(d_{model} = 1024\\), 8 heads of width 128 and 211 million parameters. To keep the parameter count equal, the MQA model's feed-forward layers were widened from 4,096 to 5,440.[^3] Incremental greedy decoding of 1,024 sequences on one TPUv2 took 46 microseconds per output token in the decoder for the baseline and 3.8 for MQA, about 12 times faster. With beam search of width 4 the decoder cost fell from 203 to 32 microseconds per token.[^3]"
    },
    {
      "type": "p",
      "text": "Quality moved a little. Dev-set BLEU went from 26.7 to 26.5, and log perplexity rose from 1.424 to 1.439. On the test set with beam search, MQA actually scored the higher BLEU, 28.5 against 28.4.[^3] On the Billion-Word language modeling benchmark, dev perplexity went from 29.9 to 30.2.[^3] Shazeer also tried the obvious alternative of shrinking the cache by using fewer or narrower heads. Those models were worse than MQA on both tasks; one head of width 128 dropped translation BLEU to 25.8.[^3] Sharing keys and values cost less quality than removing them."
    },
    {
      "type": "h2",
      "text": "Grouped-query attention: a few key heads instead of one"
    },
    {
      "type": "p",
      "text": "Four years later, Joshua Ainslie and colleagues at Google Research gave two reasons MQA had not spread everywhere. It can lower quality and make training unstable, and it may not be feasible to train a separate model just for fast inference. Many public models, including T5 and LLaMA, had been trained with full multi-head attention.[^5]"
    },
    {
      "type": "p",
      "text": "Their answer has two parts. **Grouped-query attention** (GQA) splits the query heads into \\(G\\) groups, and each group shares one key head and one value head. GQA-1 is MQA and GQA-\\(H\\) is ordinary multi-head attention.[^5] The second part is **uptraining**: take an existing multi-head checkpoint, build each group's key and value projections by averaging (mean pooling) the original heads in that group, and continue pre-training for a small fraction \\(\\alpha\\) of the original steps.[^5] Mean pooling beat both keeping the first head and starting the shared heads from random weights.[^5] For \\(\\alpha = 0.05\\) the extra training took about 600 TPUv3 chip-days.[^5]"
    },
    {
      "type": "image",
      "src": "/blog-images/kv-cache/gqa-head-sharing.webp",
      "alt": "Three panels of vertical boxes. Multi-head: eight query boxes, each linked to its own key box and value box. Grouped-query: eight query boxes in pairs, each pair linked to one of four key and value boxes. Multi-query: eight query boxes all linked to a single key box and value box.",
      "width": 1880,
      "height": 600,
      "caption": "Figure 2 from Ainslie et al., 2023,[^5] reproduced under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Only the key and value boxes are cached, so the grouped-query panel stores half as many as multi-head here, and multi-query stores one of each."
    },
    {
      "type": "p",
      "text": "The authors also argue that grouping scales better than MQA. Larger models tend to have more heads, so cutting to one key head is a harsher cut the bigger the model gets, while GQA keeps the reduction proportional. And standard sharding across chips copies MQA's single key/value head onto every partition, which GQA avoids.[^5]"
    },
    {
      "type": "p",
      "text": "They measured on T5 XXL, uptrained with \\(\\alpha = 0.05\\), across summarization, translation and question answering. GQA was applied to decoder attention only, since the encoder runs in parallel and is not bandwidth bound.[^5]"
    },
    {
      "type": "chart",
      "kind": "bar",
      "title": "Time per sample on TPUv4",
      "yLabel": "Time per sample",
      "series": [
        {
          "label": "Time per sample",
          "key": "t"
        }
      ],
      "data": [
        {
          "label": "MHA-Large",
          "values": {
            "t": 0.37
          }
        },
        {
          "label": "MHA-XXL",
          "values": {
            "t": 1.51
          }
        },
        {
          "label": "MQA-XXL",
          "values": {
            "t": 0.24
          }
        },
        {
          "label": "GQA-8-XXL",
          "values": {
            "t": 0.28
          }
        }
      ],
      "caption": "Redrawn from Table 1 of Ainslie et al., 2023.[^5] Lower is faster. The table labels the unit as seconds while the paper's Figure 3 axis says milliseconds; the ratios are the same either way."
    },
    {
      "type": "chart",
      "kind": "bar",
      "title": "Average score across seven tasks",
      "yLabel": "Average score",
      "series": [
        {
          "label": "Average",
          "key": "a"
        }
      ],
      "data": [
        {
          "label": "MHA-Large",
          "values": {
            "a": 46.0
          }
        },
        {
          "label": "MHA-XXL",
          "values": {
            "a": 47.2
          }
        },
        {
          "label": "MQA-XXL",
          "values": {
            "a": 46.6
          }
        },
        {
          "label": "GQA-8-XXL",
          "values": {
            "a": 47.1
          }
        }
      ],
      "caption": "Redrawn from Table 1 of Ainslie et al., 2023.[^5] The average covers ROUGE-1 on five summarization sets, BLEU on WMT and F1 on TriviaQA. The bars start at zero, so a gap of one point looks small; on this benchmark it separates model sizes."
    },
    {
      "type": "p",
      "text": "Read together, the two charts show the trade. Uptrained MQA-XXL ran about 6.3 times faster than multi-head XXL and lost 0.6 points of average score. GQA with 8 groups ran about 5.4 times faster and lost 0.1.[^5] Both XXL variants were faster than the much smaller MHA-Large and scored higher.[^5] Going from 1 group to 8 added only modest time, with the cost climbing as groups approached full multi-head, so the authors chose 8 as a middle ground.[^5] GQA also worked reasonably straight after conversion, while MQA needed the uptraining to be useful.[^5]"
    },
    {
      "type": "p",
      "text": "A later ablation in the DeepSeek-V2 paper tells a less comfortable story. There, 7B dense models trained from scratch on 1.33 trillion tokens were compared on harder benchmarks. MMLU accuracy was 45.2 with multi-head attention, 41.2 with 8-group GQA and 37.9 with MQA.[^1] My reading is that the settings differ enough (decoder-only models trained from scratch instead of uptrained encoder-decoders, and multiple-choice knowledge tests instead of summarization) that the two papers do not contradict each other. They do show that \"close to multi-head\" depends on what you measure."
    },
    {
      "type": "h2",
      "text": "Multi-head latent attention: cache a compressed vector instead"
    },
    {
      "type": "p",
      "text": "DeepSeek's position is that MQA and GQA cache less but \"their performance does not match MHA.\"[^1] Its **multi-head latent attention** (MLA) keeps full multi-head keys and values during computation and changes what gets stored. Each token's hidden state \\(h_t\\) is projected down to one short latent vector, and the keys and values for every head are rebuilt from it:"
    },
    {
      "type": "eq",
      "tex": "\\begin{gathered} c_t^{KV} = W^{DKV} h_t \\\\[4pt] k_t^{C} = W^{UK} c_t^{KV} \\\\[4pt] v_t^{C} = W^{UV} c_t^{KV} \\end{gathered}",
      "caption": "Low-rank joint compression of keys and values, equations 9 to 11 of DeepSeek-AI, 2024.[^1]"
    },
    {
      "type": "p",
      "text": "\\(W^{DKV}\\) is the down-projection, a learned matrix that maps the hidden state to the latent \\(c_t^{KV}\\) of width \\(d_c\\). \\(W^{UK}\\) and \\(W^{UV}\\) are up-projections that expand it back to full-width keys and values. Only \\(c_t^{KV}\\) is cached, so a layer stores \\(d_c\\) elements per token instead of \\(2 n_h d_h\\).[^1] The up-projection for keys can be folded into the query projection, and the one for values into the output projection, so at inference the full keys and values never have to be built at all.[^1] Queries get a similar compression, but only to save activation memory in training; it does not touch the cache.[^1]"
    },
    {
      "type": "p",
      "text": "One complication shows the constraint the design works under. DeepSeek uses rotary position embeddings (RoPE), which rotate queries and keys by an amount that depends on position. Applied to the compressed keys, that rotation would sit between the query projection and \\(W^{UK}\\), the fold would no longer work, and the paper says the model would have to \"recompute the keys for all the prefix tokens during inference\", which is the waste the cache exists to avoid.[^1] The fix is a separate small key of width \\(d_h^R\\), shared across heads, that carries the position information and is cached alongside the latent. The total becomes \\((d_c + d_h^R)\\,l\\) elements per token.[^1]"
    },
    {
      "type": "p",
      "text": "DeepSeek-V2 uses 60 layers, 128 heads of width 128, \\(d_c = 512\\) and \\(d_h^R = 64\\).[^1] Per layer that is 576 cached elements where full multi-head attention with those heads would store 32,768. The paper puts it as equal to GQA with only 2.25 groups.[^1] Its measured comparison is in Table 9, MoE models that differ only in attention:"
    },
    {
      "type": "chart",
      "kind": "bar",
      "title": "KV cache per token, MHA vs MLA",
      "yLabel": "Thousand elements per token",
      "series": [
        {
          "label": "MHA",
          "key": "mha",
          "baseline": true
        },
        {
          "label": "MLA",
          "key": "mla"
        }
      ],
      "data": [
        {
          "label": "Small MoE (about 16B)",
          "values": {
            "mha": 110.6,
            "mla": 15.6
          }
        },
        {
          "label": "Large MoE (about 250B)",
          "values": {
            "mha": 860.2,
            "mla": 34.6
          }
        }
      ],
      "caption": "Redrawn from Table 9 of DeepSeek-AI, 2024.[^1] Counts are elements, independent of storage precision. MLA needs 14% of the MHA cache for the small models and 4% for the large ones."
    },
    {
      "type": "p",
      "text": "Quality went the other way from MQA. For the large models, MLA scored 59.0 on MMLU against 57.5 for multi-head attention and 50.7 against 46.6 on BBH. For the small models MLA was ahead on three of four benchmarks and behind on C-Eval, 50.9 against 51.6.[^1] The large pair was trained on only 420 billion tokens.[^1]"
    },
    {
      "type": "p",
      "text": "Now the opening number can be traced. DeepSeek-V2 caches \\((512 + 64) \\times 60 = 34{,}560\\) elements per token, which matches the 34.6K in Table 9. The paper also says the deployed model was converted to FP8 and its KV cache quantized to about 6 bits per element on average.[^1] My arithmetic, assuming DeepSeek 67B stored its 194,560 elements per token in 16 bits: at 16 bits DeepSeek-V2's cache would be about 82% smaller, and at 6 bits it is 25,920 bytes against 389,120, a reduction of 93.3%. The paper does not show this breakdown, so treat it as a reconstruction. It suggests the headline combines two savings, a change to the architecture and a change to precision."
    },
    {
      "type": "h2",
      "text": "What the papers say they could not show"
    },
    {
      "type": "p",
      "text": "Each paper is candid about its gaps. Shazeer's timing runs used fixed-shape tensors, so the cache was padded to the full 128 positions and every decoding step took the same time; a cache that grew with the sequence could have been faster early on.[^3] DeepSeek's decoupled RoPE key is a second cached tensor, needed only because the compression trick and rotary positions do not combine.[^1]"
    },
    {
      "type": "p",
      "text": "The GQA authors state the widest limit. The memory overhead they target matters most for long generations, and long outputs are hard to evaluate. They scored summarization with ROUGE, which they call \"a flawed evaluation that does not tell the whole story,\" and conclude that \"it is difficult to be certain our trade-offs are correct.\"[^5] They did not compare their uptrained model to one trained from scratch, and they tested only encoder-decoder models, though they expect GQA's advantage over MQA to be larger in decoder-only models.[^5] In the same paragraph they note that decoder-only models had become extremely popular.[^5] That is the setting where GQA is now most used, and its own paper never measured it."
    },
    {
      "type": "sources",
      "numbered": true,
      "items": [
        {
          "title": "DeepSeek-AI (2024). DeepSeek-V2: A Strong, Economical, and Efficient Mixture-of-Experts Language Model. arXiv:2405.04434",
          "url": "https://arxiv.org/abs/2405.04434"
        },
        {
          "title": "Vaswani et al. (2017). Attention Is All You Need. arXiv:1706.03762",
          "url": "https://arxiv.org/abs/1706.03762"
        },
        {
          "title": "Shazeer (2019). Fast Transformer Decoding: One Write-Head is All You Need. arXiv:1911.02150",
          "url": "https://arxiv.org/abs/1911.02150"
        },
        {
          "title": "Pope et al. (2022). Efficiently Scaling Transformer Inference. arXiv:2211.05102",
          "url": "https://arxiv.org/abs/2211.05102"
        },
        {
          "title": "Ainslie et al. (2023). GQA: Training Generalized Multi-Query Transformer Models from Multi-Head Checkpoints. arXiv:2305.13245",
          "url": "https://arxiv.org/abs/2305.13245"
        },
        {
          "title": "DeepSeek-AI (2024). DeepSeek LLM: Scaling Open-Source Language Models with Longtermism. arXiv:2401.02954",
          "url": "https://arxiv.org/abs/2401.02954"
        }
      ]
    }
  ]
};
