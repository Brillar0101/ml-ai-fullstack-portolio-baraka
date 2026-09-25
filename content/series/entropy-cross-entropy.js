// Original AI Engineering series post. Rendered by src/pages/blog/SeriesPost.jsx;
// scheduled and given its sources in src/data/seriesPosts.js.
// Every factual claim is taken from the numbered sources at the end. Figure 1 of
// Delétang et al. is reproduced under CC BY 4.0 (arXiv 2309.10668); the charts are
// redrawn from table values in Shannon 1951 and Delétang et al.
export const POST = {
  "id": "entropy-cross-entropy",
  "title": "Shannon's guessing game and the loss language models minimize",
  "excerpt": "In 1951 Shannon had people guess English text one letter at a time and put its entropy at roughly 0.6 to 1.3 bits per letter. The same arithmetic defines cross-entropy, perplexity and KL divergence, and it is why a language model is also a file compressor.",
  "category": "ML",
  "chapter": "Chapter 3",
  "tags": [
    "Entropy",
    "Cross-entropy",
    "Perplexity",
    "Information theory"
  ],
  "seriesNum": 23,
  "publishAt": "2026-05-06T12:00:00Z",
  "body": [
    {
      "type": "p",
      "text": "In 1951 Claude Shannon published a short paper in the Bell System Technical Journal built around a guessing game. A person was shown a passage of English they had not seen and asked to guess its first letter. If the guess was right, they were told so and moved on; if it was wrong, they were told the correct letter. Spaces counted as a 27th letter.[^1] In one run on a passage that began \"THE ROOM WAS NOT VERY LIGHT\", the subject got 89 of 129 letters right on the first try, 69%. The misses bunched at the starts of words and syllables, where, in Shannon's words, \"the line of thought has more possibility of branching out.\"[^1]"
    },
    {
      "type": "p",
      "text": "A second version let the subject keep guessing until they hit the right letter, and Shannon recorded how many tries each letter took. On a 102-symbol passage, 79 letters came on the first guess, 8 on the second, 3 on the third, 2 each on the fourth and fifth, and only 8 needed more than five.[^1] From experiments like these he estimated that ordinary literary English carries somewhere between about 0.6 and 1.3 bits of information per letter once a subject knows the previous 100 letters, \"something of the order of one bit per letter\" with a redundancy of roughly 75%.[^1] With no knowledge at all, a 27-symbol alphabet needs \\(\\log_2 27\\), about 4.76 bits per symbol, the figure Shannon lists for zero context,[^1] so people were squeezing out most of the uncertainty with what they already knew about the language."
    },
    {
      "type": "p",
      "text": "Change the guesser to a neural network and the question is still Shannon's: how many bits does it take to say what comes next? The number that answers it is cross-entropy, and it is the loss that language models are trained to push down.[^4] This post builds that number from Shannon's definitions."
    },
    {
      "type": "h2",
      "text": "A hundred passages from a Jefferson biography"
    },
    {
      "type": "p",
      "text": "The headline estimate came from a more careful experiment. Shannon picked 100 passages at random from a book, Dumas Malone's \"Jefferson the Virginian\", each 15 letters long. The subject guessed each passage letter by letter, which produced data for every amount of known context from 0 to 14 preceding letters. A similar test used passages where 100 letters were already known. The subject was allowed to use letter, digram and trigram frequency tables, a list of common words and a dictionary.[^1]"
    },
    {
      "type": "p",
      "text": "The trick that turned guesses into entropy is what Shannon called the **reduced text**. Replace each letter with the number of the guess that found it, so \"THERE IS NO REVERSE\" becomes a string of mostly 1s. That string holds the same information as the original, because an identical predictor could rebuild the text from it by guessing the same way and stopping at the recorded try.[^1] The reduced text is easy to measure, since its statistics are mostly \"1 is very common\". Shannon proved an upper and a lower bound on the entropy of the original text in terms of how often each guess number appears.[^1]"
    },
    {
      "type": "chart",
      "kind": "line",
      "title": "Shannon's bounds on the entropy of English",
      "xLabel": "Letters of context known, plus one (N)",
      "yLabel": "Bits per letter",
      "series": [
        {
          "label": "Upper bound",
          "key": "u"
        },
        {
          "label": "Lower bound",
          "key": "l",
          "dashed": true
        }
      ],
      "data": [
        {
          "x": 1,
          "values": {
            "u": 4.03,
            "l": 3.19
          }
        },
        {
          "x": 2,
          "values": {
            "u": 3.42,
            "l": 2.5
          }
        },
        {
          "x": 3,
          "values": {
            "u": 3.0,
            "l": 2.1
          }
        },
        {
          "x": 4,
          "values": {
            "u": 2.6,
            "l": 1.7
          }
        },
        {
          "x": 5,
          "values": {
            "u": 2.7,
            "l": 1.7
          }
        },
        {
          "x": 6,
          "values": {
            "u": 2.2,
            "l": 1.3
          }
        },
        {
          "x": 7,
          "values": {
            "u": 2.8,
            "l": 1.8
          }
        },
        {
          "x": 8,
          "values": {
            "u": 1.8,
            "l": 1.0
          }
        },
        {
          "x": 9,
          "values": {
            "u": 1.9,
            "l": 1.0
          }
        },
        {
          "x": 10,
          "values": {
            "u": 2.1,
            "l": 1.0
          }
        },
        {
          "x": 11,
          "values": {
            "u": 2.2,
            "l": 1.3
          }
        },
        {
          "x": 12,
          "values": {
            "u": 2.3,
            "l": 1.3
          }
        },
        {
          "x": 13,
          "values": {
            "u": 2.1,
            "l": 1.2
          }
        },
        {
          "x": 14,
          "values": {
            "u": 1.7,
            "l": 0.9
          }
        },
        {
          "x": 15,
          "values": {
            "u": 2.1,
            "l": 1.2
          }
        }
      ],
      "caption": "Redrawn from the table in Section 6 of Shannon, 1951,[^1] for a 27-letter alphabet. The final column of that table, with 100 letters known, gives 1.3 for the upper bound and 0.6 for the lower. The wobble between columns is sampling error, which Shannon notes himself."
    },
    {
      "type": "p",
      "text": "The first two columns of his table were not guessed by people. They were computed from published letter and digram frequencies, which is how a perfect predictor with no context, or with one letter of context, would rank its guesses.[^1] Everything after that came from a human."
    },
    {
      "type": "h2",
      "text": "Entropy, one symbol at a time"
    },
    {
      "type": "p",
      "text": "Shannon had defined the quantity three years earlier, in \"A Mathematical Theory of Communication\". For a source that picks one of \\(n\\) symbols with probabilities \\(p_1, \\dots, p_n\\), he wrote:[^2]"
    },
    {
      "type": "eq",
      "tex": "H = -\\sum_{i=1}^{n} p_i \\log_2 p_i",
      "caption": "Shannon's entropy, from Section 6 of the 1948 paper.[^2] He writes a positive constant \\(K\\) in front, which only fixes the unit."
    },
    {
      "type": "terms",
      "optional": false,
      "items": [
        {
          "term": "\\(p_i\\)",
          "def": "The probability that the next symbol is symbol \\(i\\). All the \\(p_i\\) add up to 1."
        },
        {
          "term": "\\(-\\log_2 p_i\\)",
          "def": "The information in seeing symbol \\(i\\), in bits. A symbol with probability 1/2 carries 1 bit and one with probability 1/8 carries 3. Rare symbols carry more."
        },
        {
          "term": "The sum weighted by \\(p_i\\)",
          "def": "An average. Entropy is the information per symbol you should expect, weighting each symbol by how often it actually shows up."
        },
        {
          "term": "Bit",
          "def": "The unit when the logarithm is base 2. Shannon credits the word to J. W. Tukey; a relay or flip-flop with two stable positions stores one.[^2]"
        }
      ]
    },
    {
      "type": "p",
      "text": "Two properties make it a sensible measure of uncertainty. \\(H\\) is zero only when one symbol has probability 1, so you are certain of the outcome. And for a fixed number of symbols, \\(H\\) is largest, equal to \\(\\log n\\), when every symbol is equally likely.[^2] Shannon also showed that any measure meeting three simple conditions has to take this form, though he said the real justification lies in what the definition lets you prove.[^2]"
    },
    {
      "type": "p",
      "text": "The result it lets you prove is about coding. Shannon's fundamental theorem for a noiseless channel, stated in terms of channel capacity, implies that a source with entropy \\(H\\) bits per symbol can be encoded to use, on average, as close to \\(H\\) binary digits per symbol as you like, and no fewer.[^2] His own example is a source that emits A, B, C and D with probabilities 1/2, 1/4, 1/8 and 1/8. Its entropy is 7/4 bits per symbol, and the code A = 0, B = 10, C = 110, D = 111 reaches that exactly: on average \\(\\tfrac12 \\cdot 1 + \\tfrac14 \\cdot 2 + \\tfrac28 \\cdot 3 = \\tfrac74\\) binary digits per symbol.[^2] Each code length is \\(-\\log_2 p\\) for its symbol. That is the pattern to keep in mind: a good code spends \\(-\\log_2 p\\) bits on an event of probability \\(p\\)."
    },
    {
      "type": "h2",
      "text": "Cross-entropy: the price of a wrong code"
    },
    {
      "type": "p",
      "text": "Now suppose you do not know the true probabilities. You have a model \\(M\\) that assigns its own probabilities, and you build your code from those. Real text arrives according to the true distribution \\(P\\), but every symbol costs you \\(-\\log_2 M(\\text{symbol})\\) bits. The average cost is the cross-entropy. Brown and colleagues at IBM, estimating the entropy of English in 1992, wrote it for text as:[^3]"
    },
    {
      "type": "eq",
      "tex": "\\begin{gathered} H(P, M) = \\\\ -\\,\\mathbb{E}_P \\log M(X_0 \\mid X_{-1}, X_{-2}, \\dots) \\end{gathered}",
      "caption": "Cross-entropy of the true process \\(P\\) as measured by a model \\(M\\), equation 4 of Brown et al., 1992.[^3]"
    },
    {
      "type": "p",
      "text": "Read it from the inside out. \\(M(X_0 \\mid X_{-1}, X_{-2}, \\dots)\\) is the probability the model gives to the character that actually comes next, given everything before it. The minus log turns that into bits of surprise. The expectation \\(\\mathbb{E}_P\\) averages over text drawn from the real process, not from the model. In practice you cannot compute that average exactly, so you take a long test sample of \\(n\\) characters and compute \\(-\\tfrac1n \\log M(\\text{sample})\\), which converges to the cross-entropy for a well-behaved source.[^3]"
    },
    {
      "type": "p",
      "text": "The fact that makes this useful: for any model, \\(H(P) \\le H(P, M)\\).[^3] No model can beat the true entropy, so every model's cross-entropy on real text is an upper bound on the entropy of that text. That is how Brown's group got their estimate. A word trigram model trained on 583 million words scored 1.75 bits per character on the 5.96 million character Brown Corpus, over the 95 printable ASCII characters.[^3] They add one warning: the model must be built without seeing the test sample. A model that assigns probability 1 to the test text would score zero and prove nothing.[^3]"
    },
    {
      "type": "p",
      "text": "A worked example makes the gap concrete. The numbers below are illustrative, built on Shannon's A/B/C/D source. The true probabilities stay at 1/2, 1/4, 1/8, 1/8, with entropy 1.75 bits."
    },
    {
      "type": "ul",
      "items": [
        "A model that thinks all four letters are equally likely, 1/4 each, spends 2 bits on every symbol. Its cross-entropy is exactly 2 bits.",
        "A model with the probabilities backwards, 1/8, 1/8, 1/4, 1/2 for A, B, C, D, spends 3 bits on each A, which shows up half the time. Its cross-entropy is \\(\\tfrac12 \\cdot 3 + \\tfrac14 \\cdot 3 + \\tfrac18 \\cdot 2 + \\tfrac18 \\cdot 1 = 2.625\\) bits.",
        "A model that matches the source exactly spends 1.75 bits, the entropy itself, and that is as low as the number can go."
      ]
    },
    {
      "type": "p",
      "text": "The wrong model's worst bill comes from the common symbol it thought was rare. Confident mistakes on frequent events are what cross-entropy punishes hardest, because \\(-\\log_2 M\\) grows without limit as \\(M\\) goes to zero."
    },
    {
      "type": "h2",
      "text": "Perplexity puts the bits back in the exponent"
    },
    {
      "type": "p",
      "text": "Speech recognition work commonly measured task difficulty by **perplexity** instead.[^3] Brown and colleagues state the link plainly: the cross-entropy they report \"is just the base two logarithm of the character perplexity\" of the text with respect to the model.[^3] Going the other way:"
    },
    {
      "type": "eq",
      "tex": "\\mathrm{PP}(P, M) = 2^{\\,H(P, M)}",
      "caption": "Perplexity as two to the power of cross-entropy in bits, following Brown et al., 1992.[^3]"
    },
    {
      "type": "p",
      "text": "Why bother? Because entropy of a uniform choice among \\(n\\) options is \\(\\log_2 n\\), which Shannon listed as the maximum case.[^2] So a perplexity of \\(k\\) means the model is, on average, as uncertain as if it were picking uniformly from \\(k\\) options at each step. That reading is mine, derived from the two definitions, not a claim from either paper. In the toy example, the true source has perplexity \\(2^{1.75} \\approx 3.36\\), the uniform model 4, and the backwards model about 6.17. Brown's 1.75 bits per character works out to a character perplexity of about 3.36 (my arithmetic), against 95 printable characters the model could have picked from."
    },
    {
      "type": "p",
      "text": "The base does not matter as long as you are consistent. Shannon notes that picking a logarithm base is just picking a unit: base 2 gives bits, base 10 gives decimal digits.[^2] If a loss is computed with the natural log, it comes out in nats, and the matching perplexity is \\(e\\) raised to the loss. The model is the same; only the unit changed."
    },
    {
      "type": "h2",
      "text": "The gap between them"
    },
    {
      "type": "p",
      "text": "Subtract the two quantities and you get how much the model costs you beyond the unavoidable minimum. Brown and colleagues call the difference between \\(H(P, M)\\) and \\(H(P)\\) \"a measure of the inaccuracy of the model \\(M\\).\"[^3] Written per symbol for a simple source, the gap is:"
    },
    {
      "type": "eq",
      "tex": "\\begin{aligned} D(P \\,\\|\\, M) &= H(P, M) - H(P) \\\\ &= \\sum_i p_i \\log_2 \\frac{p_i}{m_i} \\end{aligned}",
      "caption": "The gap between cross-entropy and entropy. The quantity is usually named after Kullback and Leibler's 1951 paper.[^5] The second line follows from the definitions by algebra."
    },
    {
      "type": "p",
      "text": "This gap is zero only when the model matches the source, and it can never be negative, since \\(H(P) \\le H(P, M)\\) for every model.[^3] In the toy example it is 0.25 bits for the uniform model and 0.875 for the backwards one. The name to watch for is **KL divergence**. It is not symmetric: swap \\(P\\) and \\(M\\) and you generally get a different number, because the average is always taken over whichever distribution sits first."
    },
    {
      "type": "p",
      "text": "One naming trap. Shannon's 1948 paper also uses the phrase \"relative entropy\", but for something else: the ratio of a source's entropy to the maximum it could have with the same symbols. One minus that ratio is his redundancy, which he put at roughly 50% for English when only statistics over about eight letters are counted.[^2] Do not confuse it with the gap between cross-entropy and entropy above."
    },
    {
      "type": "p",
      "text": "This split explains why training on cross-entropy makes sense even though we never learn the true entropy of text. \\(H(P)\\) is fixed by the data and the model cannot change it. So every step that lowers cross-entropy lowers the KL gap by the same amount, and the model moves closer to the real distribution."
    },
    {
      "type": "h2",
      "text": "Chinchilla as a file compressor"
    },
    {
      "type": "p",
      "text": "Shannon's coding theorem runs both ways, and in 2023 a Google DeepMind team, with Grégoire Delétang and Anian Ruoss as joint first authors, took it literally. Their point: the expected length of an optimal code equals the negative log2 likelihood under the model, so the cross-entropy that language models minimize is \"exactly the same objective\" as the length of the file you would get by compressing with that model. Current training, they write, uses a \"maximum-compression objective.\"[^4]"
    },
    {
      "type": "p",
      "text": "The bridge from probabilities to an actual file is **arithmetic coding**. The coder keeps an interval inside [0, 1) and, for each symbol, shrinks it to the slice the model assigns to that symbol. Likely symbols shrink it a little and cost few bits; unlikely ones shrink it a lot.[^4] With infinite precision it needs about \\(\\lceil -\\log \\rho(x_{1:n}) \\rceil + 1\\) bits, against an optimum of \\(-\\log \\rho(x_{1:n})\\).[^4]"
    },
    {
      "type": "image",
      "src": "/blog-images/entropy-cross-entropy/arithmetic-coding-aixi.webp",
      "alt": "Four stacked interval diagrams showing the string AIXI being encoded. Each step narrows the interval to the slice for the observed letter, from [0, 0.45) for A down to about [0.322, 0.341) for the final I, while the output bits grow to b0101010.",
      "width": 1830,
      "height": 770,
      "caption": "Figure 1 from Delétang et al., 2023,[^4] reproduced under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Encoding 'AIXI' with a toy model yields the 7-bit code b0101010. The model's probabilities for the four letters multiply to 0.45 x 0.6 x 0.35 x 0.2 = 0.0189, about 5.7 bits of cross-entropy (my arithmetic), which the coder rounds up to 7 whole bits."
    },
    {
      "type": "p",
      "text": "They then ran real models as compressors on 1 GB each of three kinds of data: enwik9 (Wikipedia text), grayscale ImageNet patches, and LibriSpeech audio. Because the Transformers can only see 2,048 tokens at once, every dataset was cut into 2,048-byte chunks and compressed chunk by chunk; the classical compressors were run both on chunks and on the whole file.[^4]"
    },
    {
      "type": "chart",
      "kind": "bar",
      "title": "Compressed size as a share of raw size, 2,048-byte chunks",
      "yLabel": "Raw compression rate (%)",
      "series": [
        {
          "label": "gzip",
          "key": "g",
          "baseline": true
        },
        {
          "label": "LZMA2",
          "key": "z"
        },
        {
          "label": "Llama 2 7B",
          "key": "l"
        },
        {
          "label": "Chinchilla 70B",
          "key": "c"
        }
      ],
      "data": [
        {
          "label": "enwik9 (text)",
          "values": {
            "g": 48.1,
            "z": 50.0,
            "l": 8.9,
            "c": 8.3
          }
        },
        {
          "label": "ImageNet (image)",
          "values": {
            "g": 68.6,
            "z": 62.4,
            "l": 53.4,
            "c": 48.0
          }
        },
        {
          "label": "LibriSpeech (audio)",
          "values": {
            "g": 38.5,
            "z": 38.2,
            "l": 23.1,
            "c": 21.0
          }
        }
      ],
      "caption": "Redrawn from Table 1 of Delétang et al., 2023.[^4] Lower is better. These are raw rates, which ignore the size of the model's own weights."
    },
    {
      "type": "p",
      "text": "Chinchilla 70B, trained mostly on internet text and books, compressed the image patches to 48.0% and the audio to 21.0% of their raw size in this setup. The paper's abstract compares the image result to PNG at 58.5% and the audio result to FLAC at 30.3%.[^4] The abstract gives Chinchilla figures of 43.4% and 16.4%, lower than the 48.0% and 21.0% in Table 1 of the same version; the chart uses the table. Either way, a text model beat the format built for the job. The authors attribute this to in-context learning: the model adapts to the data inside its context window, without any gradient update.[^4]"
    },
    {
      "type": "p",
      "text": "On text the gap is wide. Chinchilla 70B brought enwik9 to 8.3% of its size. gzip reached 48.1% on the same chunks and 32.3% on the unchunked file, where it can use its full 32 kilobyte window.[^4] Brown's 1992 comparison had the same shape at a smaller scale. On the Brown Corpus, a Huffman code over characters reached 4.46 bits per character, UNIX compress 4.43, an adaptive Lempel-Ziv scheme 4.20, and the trigram model 1.75.[^3] A better predictor means a smaller file, which is the same statement as a lower cross-entropy."
    },
    {
      "type": "h2",
      "text": "What the estimates cannot tell you"
    },
    {
      "type": "p",
      "text": "Delétang's own table has a column that sinks the headline results. Their adjusted compression rate counts the model's parameters, stored at 2 bytes each, as part of the compressed output. On that basis Chinchilla 70B does not compress enwik9 to 8.3%. It expands it to 14,008.3%, because the weights (140 GB at 2 bytes per parameter, by my arithmetic) cannot be paid off by compressing 1 GB of data.[^4] They estimate that a foundation model reaches useful adjusted rates only on datasets on the order of terabytes, and with small Transformers trained on enwik8 they show that each dataset size has a model size past which a bigger model makes the adjusted rate worse again.[^4] Cross-entropy measured on test text says nothing about the cost of the model that produced it."
    },
    {
      "type": "p",
      "text": "Shannon was just as frank about his numbers. Treating a subject's observed guess frequencies as true probabilities left \"considerable sampling error\" in the table. The lower bound was proved only for an ideal predictor, and his frequencies came from a human. He added that some rough calculations indicated the shortfall of the ideal lower bound more than makes up for the human failing to predict ideally, and so he felt \"reasonably confident of both bounds apart from sampling errors.\"[^1] He also warned that the figures depend on the text: newspaper writing, scientific work and poetry gave somewhat poorer scores than ordinary literary English, and as the stretch of context grows, the estimates \"depend more critically on the type of text involved.\"[^1]"
    },
    {
      "type": "p",
      "text": "Brown and colleagues named the opposite weakness in machine estimates. Their 1.75 bits was higher than earlier human-based estimates, and they judged it more reliable statistically because it rested on millions of characters instead of a few hundred letters. They still wrote that \"it is probable that people predict English text better than the simple model that we have employed here.\"[^3] So a cross-entropy number is always a statement about one model, on one kind of text, in one unit, and the true entropy it bounds sits somewhere below it."
    },
    {
      "type": "sources",
      "numbered": true,
      "items": [
        {
          "title": "Shannon, Prediction and Entropy of Printed English, Bell System Technical Journal 30(1), 1951",
          "url": "https://www.princeton.edu/~wbialek/rome/refs/shannon_51.pdf"
        },
        {
          "title": "Shannon, A Mathematical Theory of Communication, Bell System Technical Journal 27, 1948",
          "url": "https://people.math.harvard.edu/~ctm/home/text/others/shannon/entropy/entropy.pdf"
        },
        {
          "title": "Brown, Della Pietra, Della Pietra, Lai, and Mercer, An Estimate of an Upper Bound for the Entropy of English, Computational Linguistics 18(1), 1992",
          "url": "https://aclanthology.org/J92-1002/"
        },
        {
          "title": "Delétang, Ruoss, et al., Language Modeling Is Compression, ICLR 2024",
          "url": "https://arxiv.org/abs/2309.10668"
        },
        {
          "title": "Kullback and Leibler, On Information and Sufficiency, Annals of Mathematical Statistics 22(1), 1951",
          "url": "https://doi.org/10.1214/aoms/1177729694"
        }
      ]
    }
  ]
};
