// Original AI Engineering series post. Rendered by src/pages/blog/SeriesPost.jsx;
// scheduled in src/data/seriesPosts.js. Every factual claim is taken from the
// numbered sources at the end. The interpolation figure is reproduced from
// Chen et al. 2023 under CC BY 4.0 (arXiv 2306.15595). The line chart is
// redrawn from Table 2 of Press et al. 2022, whose arXiv license does not
// allow reuse of its figures.
export const POST = {
  "id": "context-length",
  "title": "How 2,048 Tokens Became 32,768: A History of the Context Window",
  "excerpt": "In 2023 a Meta team stretched LLaMA from 2,048 to 32,768 tokens with about 1,000 fine-tuning steps. The number had held because of how models encode position. This is the story of RoPE, ALiBi, position interpolation and YaRN, told through the perplexity each one measured.",
  "category": "AI",
  "chapter": "Chapter 5",
  "tags": [
    "Context",
    "Position encoding",
    "LLMs"
  ],
  "seriesNum": 27,
  "publishAt": "2026-06-03T12:00:00Z",
  "body": [
    {
      "type": "p",
      "text": "In June 2023 four researchers at Meta published a paper about one number. Inputs to the LLaMA models, they wrote, must be fewer than 2,048 tokens.[^1] They took the pretrained 7B, 13B, 33B and 65B models, rescaled the position indices fed into attention, changed nothing else in the architecture, and fine-tuned for 1,000 steps on the Pile dataset.[^1] The 7B model came out able to read 32,768 tokens. On the PG19 book test set, the original model scored a perplexity of 7.20 at 2,048 tokens; the extended one scored 6.77 at 32,768.[^1]"
    },
    {
      "type": "p",
      "text": "The comparison in the same paper is what makes the result stand out. The obvious approach, fine-tuning the unchanged model on longer text, was also tried. After more than 10,000 steps the effective context window had moved from 2,048 to 2,560 tokens.[^1] And if you simply fed the untouched 7B model 4,096 tokens, its perplexity went above 1,000, which the authors describe as comparable to an untrained model.[^1]"
    },
    {
      "type": "p",
      "text": "So 1,000 steps of the right change bought a 16 times longer window, while 10,000 steps of the wrong one bought 25% more. The gap comes from how a transformer knows where each token sits. The rest of this post follows that number through the papers that set it and then moved it."
    },
    {
      "type": "terms",
      "optional": false,
      "items": [
        {
          "term": "Context window",
          "def": "the maximum number of tokens a model reads at once. For LLaMA it was 2,048."
        },
        {
          "term": "Position encoding",
          "def": "the extra signal that tells attention where each token sits. Attention by itself has no sense of order."
        },
        {
          "term": "Perplexity",
          "def": "how surprised a language model is by real text, on average. Lower is better. A score in the thousands means the model is guessing."
        },
        {
          "term": "Extrapolation",
          "def": "running a model on positions larger than any it saw in training."
        },
        {
          "term": "Interpolation",
          "def": "squeezing a longer input's positions back into the trained range, so every position the model sees falls between ones it already knows."
        }
      ]
    },
    {
      "type": "h2",
      "text": "Why nobody just trained on longer text"
    },
    {
      "type": "p",
      "text": "The number was small because long training runs were expensive. Self-attention compares every token with every other token, so its time and memory grow with the square of the sequence length.[^5] Press and colleagues give a concrete case: training their sinusoidal baseline at 3,072 tokens needed a GPU with more than 16 GB of memory just to fit the attention matrices.[^2] FlashAttention, published in 2022, reorganized the computation so that attention memory grows linearly with length, and it produced the first transformer to beat chance on the Path-X benchmark at 16K tokens.[^5] The Meta extension work fine-tuned with FlashAttention, and YaRN later made a point of staying compatible with FlashAttention 2.[^1,4]"
    },
    {
      "type": "p",
      "text": "Cheaper attention helped, but it did not remove the other half of the problem. Even if you could afford a long input, a model trained on short ones did not know what to do with it."
    },
    {
      "type": "h2",
      "text": "What happens one token past the limit"
    },
    {
      "type": "p",
      "text": "The transformer's layers do not care about length. The embedding lookup, the feedforward sublayer and the softmax act on each vector separately, and attention's weights do not depend on how many tokens arrive.[^2] Position is the only part tied to a length. With learned position embeddings, the model simply has no vector for position 2,049.[^2] The original 2017 transformer used fixed sinusoidal embeddings partly on the hope that they might extrapolate to longer sequences.[^2]"
    },
    {
      "type": "p",
      "text": "Ofir Press, Noah Smith and Mike Lewis tested that hope in 2021. They trained a 16-layer language model on WikiText-103 with 512-token inputs and then evaluated it on longer and longer inputs.[^2] With sinusoidal embeddings, perplexity improved for the first 20 extra tokens, held steady to 50, and then climbed: 20.05 at 512 tokens, 24.86 at 712, 43.54 at 1,012 and 132.41 at 2,512.[^2] By 15,512 tokens it was 406.01. Rotary embeddings, the method LLaMA would later use, held on longer, improving for about 200 extra tokens before rising to 31.58 at 2,512 and 79.25 at 15,512.[^2]"
    },
    {
      "type": "chart",
      "kind": "line",
      "title": "Perplexity of models trained on 512 tokens, evaluated on longer inputs",
      "xLabel": "Evaluation input length (tokens) →",
      "yLabel": "Perplexity (lower is better)",
      "yMax": 400,
      "series": [
        { "label": "Sinusoidal", "key": "sin" },
        { "label": "Rotary (RoPE)", "key": "rot" },
        { "label": "T5 bias", "key": "t5", "dashed": true },
        { "label": "ALiBi", "key": "ali" }
      ],
      "data": [
        { "x": 512, "values": { "sin": 20.05, "rot": 20.07, "t5": 19.65, "ali": 19.73 } },
        { "x": 612, "values": { "sin": 20.59, "rot": 19.81, "t5": 19.27, "ali": 19.38 } },
        { "x": 712, "values": { "sin": 24.86, "rot": 19.79, "t5": 19.10, "ali": 19.14 } },
        { "x": 1012, "values": { "sin": 43.54, "rot": 21.37, "t5": 18.79, "ali": 18.73 } },
        { "x": 1512, "values": { "sin": 76.23, "rot": 25.99, "t5": 18.91, "ali": 18.52 } },
        { "x": 2512, "values": { "sin": 132.41, "rot": 31.58, "t5": 20.41, "ali": 18.41 } },
        { "x": 4512, "values": { "sin": 209.37, "rot": 39.15, "t5": 25.91, "ali": 18.41 } },
        { "x": 6512, "values": { "sin": 271.40, "rot": 47.81, "t5": 34.48, "ali": 18.35 } },
        { "x": 8512, "values": { "sin": 305.65, "rot": 54.98, "t5": 43.08, "ali": 18.34 } },
        { "x": 10512, "values": { "sin": 341.53, "rot": 60.77, "t5": 52.95, "ali": 18.32 } },
        { "x": 12512, "values": { "sin": 373.17, "rot": 69.70, "t5": 64.94, "ali": 18.31 } }
      ],
      "caption": "Redrawn from Table 2 of Press et al., 2022.[^2] WikiText-103 validation set, 16-layer models trained on 512-token inputs, nonoverlapping evaluation. The T5 bias model ran out of memory past 12,512 tokens, so the chart stops there."
    },
    {
      "type": "p",
      "text": "LLaMA showed the same failure at a much larger scale. The Meta team reported perplexity above 1,000 for the 7B model at 4,096 tokens, only twice its training length.[^1] To see why rotary embeddings break, and why the fixes work, you need to look at what they compute."
    },
    {
      "type": "h2",
      "text": "RoPE: position as an angle"
    },
    {
      "type": "p",
      "text": "Jianlin Su and colleagues at Zhuiyi Technology introduced Rotary Position Embedding (RoPE) in 2021. Earlier methods added a position vector to each word vector. RoPE multiplies instead: it rotates the query and key vectors by an angle that depends on the token's position.[^3]"
    },
    {
      "type": "eq",
      "tex": "\\begin{gathered} f(\\mathbf{x}_m, m) = R^d_{\\Theta,m} W \\mathbf{x}_m \\\\[6pt] \\theta_i = 10000^{-2(i-1)/d}, \\quad i = 1, \\dots, d/2 \\\\[6pt] \\mathbf{q}_m^{\\top} \\mathbf{k}_n = \\mathbf{x}_m^{\\top} W_q^{\\top} R^d_{\\Theta,n-m} W_k \\mathbf{x}_n \\end{gathered}",
      "caption": "Equations 14 to 16 of Su et al., 2021.[^3] The rotation matrix turns each pair of coordinates by the angle \\(m\\theta_i\\). The last line shows that the attention score depends only on the gap \\(n - m\\)."
    },
    {
      "type": "p",
      "text": "Term by term: \\(\\mathbf{x}_m\\) is the vector for the token at position \\(m\\), and \\(W\\) is the learned projection that turns it into a query or a key. The head's \\(d\\) coordinates are split into \\(d/2\\) pairs, and each pair is treated as a point on a 2D plane. \\(R^d_{\\Theta,m}\\) rotates pair \\(i\\) by the angle \\(m\\theta_i\\), which is position times a fixed frequency.[^3] The frequencies \\(\\theta_i\\) fall off geometrically, so the first pairs spin fast and the last ones spin very slowly. When a rotated query meets a rotated key, the two rotations cancel down to one rotation by \\(n - m\\), so attention sees only how far apart two tokens are.[^3] The authors also proved that with these frequencies, the query and key product tends to shrink as the distance grows, a property they call long-term decay.[^3]"
    },
    {
      "type": "p",
      "text": "On paper, a method that sees only relative distance should handle any length. So why did it fail? The Meta team's answer was to write the attention score as a sum of sine and cosine terms in the distance, one per frequency, with coefficients set by the query and key.[^1] A sum like that can match almost any curve. They fitted such sums to random points in the range 0 to 2,048. Inside that range the fitted scores stayed around −1 to 1. Beyond it, the same curve could pass 8,000, and they note they did not cherry pick: almost every fitted curve had the problem.[^1] Training only constrains the score on distances the model has seen."
    },
    {
      "type": "p",
      "text": "The YaRN authors gave a second reason. Each coordinate pair has a wavelength \\(\\lambda = 2\\pi/\\theta\\), the number of tokens it takes to complete one full turn. Some pairs have wavelengths longer than the training length, so during training they never complete a single rotation.[^4] The authors presume those slow pairs carry absolute position, which means longer distances are out of distribution for them.[^4] My own arithmetic, using LLaMA's head size of 128 and base 10,000, puts the slowest pair's wavelength at about 54,000 tokens, far longer than 2,048."
    },
    {
      "type": "h2",
      "text": "ALiBi: drop the position vectors, penalize distance"
    },
    {
      "type": "p",
      "text": "Press, Smith and Lewis took a different route. Their method, Attention with Linear Biases (ALiBi), adds no position embeddings anywhere in the network. It changes one thing: after the query and key dot product, it subtracts a penalty that grows linearly with distance.[^2]"
    },
    {
      "type": "eq",
      "tex": "\\begin{gathered} \\mathrm{softmax}\\big(\\mathbf{q}_i K^{\\top} + m \\cdot [-(i-1), \\dots, -2, -1, 0]\\big) \\\\[6pt] m \\in \\left\\{ \\tfrac{1}{2^1}, \\tfrac{1}{2^2}, \\dots, \\tfrac{1}{2^8} \\right\\} \\text{ for 8 heads} \\end{gathered}",
      "caption": "Section 3 of Press et al., 2022.[^2] For \\(n\\) heads the slopes form a geometric sequence that starts at \\(2^{-8/n}\\) and uses that value as its ratio."
    },
    {
      "type": "p",
      "text": "Term by term: \\(\\mathbf{q}_i\\) is the query for the token at position \\(i\\), and \\(K\\) holds the keys of the first \\(i\\) tokens, the ones it may look at. The bracket is a row of distances, 0 for the token itself, −1 for its neighbor, down to \\(-(i-1)\\) for the first token. \\(m\\) is a slope, fixed before training and different for each head, so some heads forget distant tokens fast and others slowly.[^2] The authors tried learned slopes, but these did not extrapolate well. The fixed set came from a brief manual search over about ten options.[^2] Nothing in the formula refers to a maximum length, so a longer input just means a longer row of penalties."
    },
    {
      "type": "p",
      "text": "The flat line in the chart above is ALiBi. Trained on 512 tokens, it scored 19.73 at 512 and 18.40 when run on 3,072, better than a sinusoidal model trained on the full 3,072 tokens, which scored 18.67.[^2] The 512-token model was also 1.84 times faster to train.[^2] At 1.3 billion parameters, an ALiBi model trained on 1,024 tokens beat a sinusoidal model trained on 2,048 by 0.09 perplexity at 2,048 tokens, using 3.1 GB less memory, and reached a given perplexity 11% faster on average.[^2] On that larger corpus the best scores came at about twice the training length, and quality held up as far as 10,000 tokens.[^2]"
    },
    {
      "type": "p",
      "text": "ALiBi solved extrapolation for models trained with it from the start. LLaMA had already been trained with RoPE, and retraining a 65B model is not a small ask. The Meta paper says it plainly: many existing pretrained models use position encodings with weak extrapolation, so ALiBi's results do not directly help them.[^1]"
    },
    {
      "type": "h2",
      "text": "Position interpolation: squeeze the positions instead"
    },
    {
      "type": "p",
      "text": "Shouyuan Chen, Sherman Wong, Liangjian Chen and Yuandong Tian started from the curve-fitting result. If attention scores are only trustworthy for distances seen in training, then never show the model any other distance. Their method, Position Interpolation (PI), divides every position index by the stretch factor before RoPE sees it.[^1]"
    },
    {
      "type": "eq",
      "tex": "f'(\\mathbf{x}, m) = f\\!\\left(\\mathbf{x}, \\frac{mL}{L'}\\right)",
      "caption": "Equation 4 of Chen et al., 2023.[^1] \\(f\\) is the original RoPE function, \\(L\\) the trained window (2,048 for LLaMA), and \\(L'\\) the new, longer window."
    },
    {
      "type": "p",
      "text": "Term by term: \\(m\\) is the real position, which now runs up to \\(L'\\). Multiplying by \\(L/L'\\) maps it back into the range 0 to \\(L\\). To reach 4,096 tokens, position 4,000 is encoded as if it were 2,000, and the token at 4,001 gets 2,000.5. RoPE works fine at fractional positions, because an angle can take any value.[^1] The largest distance the model ever sees is back to 2,048."
    },
    {
      "type": "image",
      "src": "/blog-images/context-length/pi-interpolation.webp",
      "alt": "Two panels plotting one RoPE sine wave against position. Top: blue dots from 0 to 2048 lie in the pre-trained range; red dots from 2048 to 4096 lie in a shaded unseen range labelled Extrapolation. Bottom: Position Interpolation, f prime of x and m equals f of x and m over 2. Blue and green dots from 0 to 4096 are packed twice as densely onto the same stretch of the wave that the pre-trained range covered.",
      "width": 1200,
      "height": 622,
      "caption": "Extrapolation sends positions past 2,048 into angles the model never trained on. Interpolation packs 4,096 positions into the trained range. Figure 1 from Chen et al., 2023,[^1] reproduced under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)."
    },
    {
      "type": "p",
      "text": "The paper backs this with a bound. Between two trained integer distances, the interpolated score cannot stray far from a straight line between them, and with RoPE's base of 10,000 that bound is at least about 600 times smaller than the known bound for extrapolated scores.[^1] The measured numbers agree. With no fine-tuning at all, the 7B model stretched to 8,192 tokens scored a perplexity of 16.10, poor but nowhere near the thousands. After 200 steps it reached 7.12, already better than the original model's 7.20 at 2,048 tokens. At 1,000 steps it was 6.95.[^1]"
    },
    {
      "type": "p",
      "text": "The passkey test tells the same story. A five-digit number is hidden in filler text, and the model must repeat it. Models extended with PI reached their full target window after 200 steps, for 7B and 33B, up to 32,768 tokens.[^1] One cell in the table breaks the pattern: the 32,768-token model dipped to 18,432 at step 600 before returning to 32,768 at step 800.[^1]"
    },
    {
      "type": "p",
      "text": "Squeezing has a price, and the authors state it. Because positions inside the original window are packed into a narrower region, quality there dropped slightly. On Proof-pile, perplexity at 2,048 tokens worsened by 0.01 to 0.05 across models.[^1] On benchmarks the 8,192-token models lost up to 2%, while the 32,768-token 7B model fell further; its BoolQ score went from 76.1 to 64.7.[^1]"
    },
    {
      "type": "h2",
      "text": "YaRN: stretch the slow pairs, leave the fast ones"
    },
    {
      "type": "p",
      "text": "Bowen Peng, Jeffrey Quesnelle, Honglu Fan and Enrico Shippole argued that PI treats every coordinate pair the same when it should not. Dividing all positions by \\(s\\) slows every rotation, including the fast pairs that tell the model which of two neighbors comes first. They report that PI fine-tunes from several groups only reached a stretch of about 8 before outputs degraded.[^4] Their fix builds on two methods that first appeared as a Reddit post and a GitHub pull request from the open-source community, which the paper writes up formally.[^4]"
    },
    {
      "type": "p",
      "text": "The first, \"NTK-aware\" interpolation, changes RoPE's base from 10,000 to a larger number so that low frequencies are slowed a lot and high frequencies hardly at all. Code Llama used this idea with a base of 1 million.[^4] Its weakness is that the best base has to be found by trial.[^4] The second, \"NTK-by-parts,\" makes the choice explicit for each pair, using the ratio of the training length to that pair's wavelength."
    },
    {
      "type": "eq",
      "tex": "\\begin{gathered} r(d) = \\frac{L}{\\lambda_d}, \\qquad \\gamma(r) = \\begin{cases} 0 & r < \\alpha \\\\ 1 & r > \\beta \\\\ \\frac{r-\\alpha}{\\beta-\\alpha} & \\text{otherwise} \\end{cases} \\\\[8pt] h(\\theta_d) = \\big(1 - \\gamma(r(d))\\big)\\frac{\\theta_d}{s} + \\gamma(r(d))\\,\\theta_d \\\\[8pt] \\sqrt{1/t} = 0.1 \\ln(s) + 1 \\end{gathered}",
      "caption": "Equations 10 to 15 of Peng et al., 2023.[^4] For the Llama family the authors found \\(\\alpha = 1\\) and \\(\\beta = 32\\) worked well."
    },
    {
      "type": "p",
      "text": "Term by term: \\(\\lambda_d\\) is the wavelength of pair \\(d\\), so \\(r(d)\\) counts how many full turns that pair makes across the training window \\(L\\). \\(s = L'/L\\) is the stretch factor. \\(\\gamma\\) is a ramp. A pair that turns fewer than \\(\\alpha\\) times gets \\(\\gamma = 0\\), and its frequency is divided by \\(s\\), exactly as in PI. A pair that turns more than \\(\\beta\\) times gets \\(\\gamma = 1\\) and is left alone. Pairs in between get a blend.[^4] The last line sets a temperature \\(t\\) that divides the attention logits before the softmax; the authors found the formula by fitting it to the lowest perplexity across stretch factors on LLaMA 7B to 65B without fine-tuning.[^4] YaRN is that ramp plus that temperature."
    },
    {
      "type": "p",
      "text": "The ablation table on LLaMA 7B shows the difference most clearly without any fine-tuning. Stretched 16 times, PI scored perplexity above 100 at every length. YaRN scored 3.45 at 32,768 tokens.[^4] After 400 fine-tuning steps at the same stretch, PI reached 3.57 at 32,768 and YaRN 2.77.[^4] With Llama 2 7B, whose window was 4,096, the team trained a 16-times version for 400 steps on 64K-token chunks of PG19, then trained 200 more steps for a 32-times version. That model scored 2.37 at 131,072 tokens despite never training on anything longer than 64K.[^4]"
    },
    {
      "type": "p",
      "text": "The cost column is the other headline. The paper's comparison lists 128 A100 GPU-hours for its 32K LLaMA 7B model and 640 for the Meta team's 16K PI model.[^4] The abstract puts it as 10 times fewer tokens and 2.5 times fewer training steps than earlier methods.[^4] Short-context skills mostly survived: Llama 2 7B's MMLU score went from 43.8 to 42.5 at 16 times and 41.7 at 32 times.[^4]"
    },
    {
      "type": "h2",
      "text": "The cliff moves, it does not go away"
    },
    {
      "type": "p",
      "text": "Every method in these tables still has an edge. YaRN's 16-times Llama 2 model, built for 64K, scored above 10 at 131,072 tokens, while its 32-times sibling scored 2.37.[^4] A public PI model extended to 32K scored above 10,000 at the same length.[^4] Each paper moved the number. None made the number meaningless."
    },
    {
      "type": "p",
      "text": "There is also a question under all of these perplexity curves: does the model use the far text, or does it merely stop being confused by it? Press and colleagues checked for ALiBi. Scoring a long document in fixed chunks means tokens at the start of each chunk get little context, so longer chunks improve perplexity even if the model only ever looks nearby. When they re-ran the evaluation with a window sliding one token at a time, so that every prediction had full context, ALiBi's perplexity stayed flat instead of improving.[^2] Their conclusion was that ALiBi, when run on inputs longer than its training length, \"might not be using contexts longer than the ones it was trained on.\"[^2]"
    },
    {
      "type": "sources",
      "numbered": true,
      "items": [
        { "title": "Chen, Wong, Chen, and Tian, Extending Context Window of Large Language Models via Positional Interpolation, 2023", "url": "https://arxiv.org/abs/2306.15595" },
        { "title": "Press, Smith, and Lewis, Train Short, Test Long: Attention with Linear Biases Enables Input Length Extrapolation, ICLR 2022", "url": "https://arxiv.org/abs/2108.12409" },
        { "title": "Su et al., RoFormer: Enhanced Transformer with Rotary Position Embedding, 2021", "url": "https://arxiv.org/abs/2104.09864" },
        { "title": "Peng, Quesnelle, Fan, and Shippole, YaRN: Efficient Context Window Extension of Large Language Models, 2023", "url": "https://arxiv.org/abs/2309.00071" },
        { "title": "Dao, Fu, Ermon, Rudra, and Ré, FlashAttention: Fast and Memory-Efficient Exact Attention with IO-Awareness, 2022", "url": "https://arxiv.org/abs/2205.14135" }
      ]
    }
  ]
};
