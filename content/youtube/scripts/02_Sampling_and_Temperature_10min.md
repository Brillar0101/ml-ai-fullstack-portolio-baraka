# 🎬 SCRIPT — "Why the Same Prompt Gives Different Answers: Sampling & Temperature"
### Branch Education style · ~10-minute runtime · AI Engineering series #2
### ⭐ Continuing directive: define every term inline, in plain language, as it appears.

> Sources (papers/textbooks only): Holtzman, Buys, Du, Forbes & Choi, "The Curious Case of Neural Text Degeneration" (ICLR 2020, arXiv:1904.09751 — nucleus/top-p sampling) · Ackley, Hinton & Sejnowski, "A Learning Algorithm for Boltzmann Machines" (Cognitive Science, 1985 — temperature in neural networks) · Goodfellow, Bengio & Courville, "Deep Learning" (MIT Press, 2016 — softmax) · Jurafsky & Martin, "Speech and Language Processing" (3rd ed. draft — decoding and sampling).
> Section markers: [HOOK] [INTRO] [SECTION] [TRANSITION] [CTA] [OUTRO]

---

**[HOOK]**

Try this experiment. Ask an AI model a question. Copy its answer. Now open a fresh chat and ask the exact same question, word for word. You'll get a different answer. Same model, same billions of parameters, same prompt — different words.

If your calculator did this, you'd return it. So is the AI broken? No — and here's the part almost nobody realizes: the difference is not a glitch, it's a deliberate dice roll, added on purpose, at the very last step of the machine. And here's the stranger part: when engineers remove the dice and force the model to always pick its single most likely word — the "best" word, mathematically — the writing gets *worse*. It goes bland, starts looping, and repeats itself like a scratched record.

In this video, we're going to see how a language model actually chooses each word, what the temperature dial really does, and why a 2020 paper showed that a little randomness is the difference between fluent text and a machine caught in a loop.

**[INTRO]**

We'll do this in two parts. First, we'll zoom into the final layer of the model and watch a single word get chosen — that's where the dice live. Second, we'll see what happens when you take the dice away, and meet the two clever filters — top-k and nucleus sampling — that engineers built to keep the randomness without the nonsense.

---

**[SECTION 1 — The Last Step: One Word Gets Chosen]**

Let's zoom in on the exact moment a model produces one word. In the last video we saw that text becomes **tokens** — numbered chunks of text drawn from a fixed vocabulary of tens of thousands of entries. A language model does exactly one job: given all the tokens so far, it predicts what token comes next.

But here's what most people don't know: the model does not output a word. It outputs a *scorecard*. For every single token in its vocabulary — all fifty-thousand-plus of them — it produces a raw score called a **logit**, a number saying how strongly this token fits next. Then a standard mathematical function called **softmax** — you'll find it in every deep learning textbook — converts those raw scores into a **probability distribution**: a set of percentages, one per token, that all add up to 100%.

So picture the sentence "The capital of France is..." frozen mid-air. Inside the machine there is now a giant ranked list: "Paris" at, say, 96%, " the" at 1%, "located" at half a percent, and a long, long tail of thousands of tokens each carrying a sliver of a percent — down to genuinely absurd options at a millionth of a percent.

The model's work is done. It handed you a menu, not a meal. Something now has to actually *pick* — and that something is called a **decoding strategy**: the rule that turns the probability list into a single chosen token. The simplest rule imaginable is called **greedy decoding**: always take the top of the list. 96% Paris? Paris. Done.

And the obvious question is: why would anyone do anything else? Always taking the best option sounds perfect. Hold that thought — because that intuition is exactly what a team of researchers demolished, and their evidence is one of the most entertaining failure cases in AI research.

**[TRANSITION]**

So let's take the dice away, run the model greedily, and watch what happens.

---

**[SECTION 2 — The Loop of Doom, and the Dials That Fix It]**

In 2019, researchers led by Ari Holtzman studied what they called neural text degeneration. Their finding, published at ICLR 2020: when you make a strong language model always chase maximum probability — greedy decoding, or its lookahead cousin **beam search**, which plans several words ahead to find a high-probability phrase — the output turns bland and strangely repetitive. The model starts confidently, then falls into a phrase, and repeats it. And repeats it. Forever.

Why? The paper points to a vicious feedback loop: once a phrase has appeared, seeing it again becomes *more* probable — repetition feeds on itself. And there's a deeper reason, which is the real "aha" of the paper: humans don't talk in maximum-probability words. When the researchers plotted the probability of each word real humans wrote, against what the model expected, human text bounced around — sometimes likely words, sometimes surprising ones. Maximization produces text that is, statistically, *too* predictable. The most likely next word, chosen every single time, produces the least human paragraph. The surprise isn't a bug of human language. It's a feature — so the dice aren't decoration; they're doing the job of making text human-shaped.

But raw randomness has its own disaster mode. If you sample honestly from the full list, that long tail of absurd tokens — each individually tiny, but thousands of them — occasionally wins. One in a few hundred words comes out deranged, and one deranged word can derail everything after it. Engineers needed the randomness, but tamed. They built dials. Three of them.

Dial one: **temperature**. Before softmax turns scores into percentages, you divide every logit by a number T. The name comes straight out of physics — this exact mechanism appears in a 1985 paper on Boltzmann machines by Ackley, Hinton, and Sejnowski, borrowing from thermodynamics. Low temperature, below 1, exaggerates the gaps between scores: the rich get richer, "Paris" goes from 96% to 99.9%, and the model becomes nearly deterministic — cold, rigid, frozen. High temperature flattens the gaps: underdogs get real chances, the text gets adventurous, and past a point, chaotic. To conceptualize it: it's a fader between a frozen crystal, where every atom sits locked in place, and a hot gas, where anything can bounce anywhere.

Dial two: **top-k sampling**. Simply delete everything below the top k tokens — say, the top 50 — renormalize the percentages, and roll the dice only among survivors. The tail is gone. But Holtzman's paper exposes its flaw: k is rigid. After "The capital of France is," there's one good option — a top-50 pool is 49 tokens too generous. After "She opened the box and found a...", hundreds of tokens are genuinely reasonable — a top-50 pool amputates good options. A fixed guest list is wrong for both parties.

Dial three is the paper's own invention, and it's elegant: **nucleus sampling**, also called **top-p**. Instead of a fixed count, keep the smallest set of top tokens whose probabilities add up to some threshold p — say 95%. That set is the "nucleus," and it *breathes*. When the model is confident, the nucleus might be two tokens. When many continuations are plausible, it might be five hundred. The unreliable tail gets cut in both cases, but the cut adapts to the model's own certainty. In the paper's human evaluations, this simple rule produced text closest to human writing — beating greedy, beam, and fixed top-k.

---

**[SECTION 3 — What This Means When You Use AI]**

So let's bring this back to the chat box, with three takeaways.

First, the mystery from the hook is solved: same prompt, different answers, because between the model's probability list and your screen sits a dice roll, filtered through temperature and a nucleus. Fresh chat, fresh rolls.

Second, if you build with AI, the dials are yours — most model APIs expose them. Extracting data, writing code, grading answers? Turn temperature down toward zero; you want the frozen crystal. Brainstorming names, drafting stories? Warm it up and let the nucleus breathe. One model, two different tools, depending on where you set the fader.

And third, keep this picture: the intelligence produces the menu; a dumb little dice roll picks the meal. Some of the most powerful engineering in AI happens not inside the giant network, but in the tiny, careful rules bolted on after it. That theme returns next episode, when we follow the *cost* of generating token after token — and find out why your long conversations quietly get slow and expensive.

**[CTA]**

All sources are in the description — Holtzman's paper is a genuinely fun read, complete with the model melting down in its own figures.

**[OUTRO]**

That's pretty much it for sampling and temperature. The model proposes, the dice dispose, and a threshold that breathes keeps the whole thing sounding human. This is [CHANNEL NAME], where we take AI apart one specific concept at a time. Thanks for watching to the end.

---

### 📋 Production notes

- **Word count / runtime:** ~1,480 words ≈ 9.9 min at 150 wpm.
- **Scale-conceptualization beats:** the 50,000-row ranked scorecard frozen mid-sentence; frozen crystal ↔ hot gas fader for temperature; guest-list party sizes for top-k rigidity.
- **Open loops planted:** (1) "the writing gets worse without dice" in hook → paid off in Section 2 degeneration; (2) "hold that thought" on greedy → paid off by the Holtzman reveal; (3) "one of the most entertaining failure cases" tease → repetition loop payoff; (4) cost-of-generation tease → episode 3 (KV cache).
- **Analogies:** menu vs. meal (logits vs. decoding), scratched record (repetition), rich-get-richer (low T), breathing nucleus vs. fixed guest list (top-p vs. top-k).
- **Technical coverage checklist:** logits ✓ · softmax ✓ · probability distribution over vocabulary ✓ · greedy decoding ✓ · beam search (defined inline) ✓ · degeneration + repetition feedback loop (per paper) ✓ · human text is not maximum-probability (paper's core evidence) ✓ · long-tail failure of pure sampling ✓ · temperature mechanics + Boltzmann origin ✓ · top-k and its fixed-size flaw ✓ · nucleus/top-p and adaptivity ✓ · practical dial settings ✓.
- **Accuracy notes:** temperature dividing logits before softmax is standard (Goodfellow et al.; Ackley et al. 1985 for the physics-inspired origin). Holtzman et al. used p=0.95 in experiments — usable on-screen. The "probability of repeated phrase increases with each repetition" claim is directly from the paper. Numbers like "Paris at 96%" are illustrative, not measured — keep them clearly illustrative in visuals.
