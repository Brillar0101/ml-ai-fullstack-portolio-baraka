# 🎬 SCRIPT — "Why AI Can't Count the R's in Strawberry: Tokenization"
### Branch Education style · ~10-minute runtime · AI Engineering series #1
### ⭐ Continuing directive: define every term inline, in plain language, as it appears.

> Sources (papers/textbooks only): Sennrich, Haddow & Birch, "Neural Machine Translation of Rare Words with Subword Units" (ACL 2016, arXiv:1508.07909) · Gage, "A New Algorithm for Data Compression" (C Users Journal, 1994) · Radford et al., "Language Models are Unsupervised Multitask Learners" (OpenAI technical report, 2019 — GPT-2, byte-level BPE, 50,257 vocabulary) · Jurafsky & Martin, "Speech and Language Processing" (3rd ed. draft), tokenization chapter.
> Section markers: [HOOK] [INTRO] [SECTION] [TRANSITION] [CTA] [OUTRO]

---

**[HOOK]**

Ask one of the smartest AI models on the planet how many r's are in the word "strawberry," and there's a decent chance it tells you two. This is a system that can write working code, pass graduate exams, and explain quantum mechanics — and it can fail to count three letters in a word a seven-year-old can spell.

Here's the twist: the model isn't bad at counting. It's that the model has never seen a letter in its life. Every piece of text you have ever sent to an AI was translated, before the model ever touched it, into a secret numeric code — and in that code, "strawberry" might not be eleven letters. It might be one single symbol, or two, and nowhere inside that symbol is there any r to count.

That translation step is called **tokenization** — the process of chopping text into chunks called tokens and replacing each chunk with a number. In this video, we're going to see how tokenization works, why engineers chose this strange design on purpose, and why it explains a whole family of famous AI failures.

**[INTRO]**

We'll do this in two parts. First, we'll follow your sentence on its journey into the model and watch it get chopped up and converted into numbers. And second, we'll open up the machine that decides where to chop — an algorithm borrowed, believe it or not, from a 1994 file-compression trick — and see exactly why "strawberry" becomes invisible along the way.

---

**[SECTION 1 — The Journey of a Sentence]**

Let's start by following one sentence into the machine. You type: "The strawberry is red." Before the model can do anything, that text hits a component called the **tokenizer** — a small, separate program that sits at the front door of every language model and converts text into tokens.

The tokenizer owns a fixed list called a **vocabulary** — the complete set of chunks it is allowed to use. For GPT-2, the model described in OpenAI's 2019 technical report, that vocabulary has exactly 50,257 entries. Not letters. Not words. Chunks. Some entries are single characters. Some are pieces of words, like "straw" or "berry". Some are entire common words, like "the", usually with the space attached.

To conceptualize that, imagine a label maker that ships with 50,257 pre-printed labels and no ability to print new ones. Every sentence ever written — every tweet, every legal contract, every line of Python, in every language the model handles — must be tiled, edge to edge, using only those labels. That is the tokenizer's entire job: find a way to cover your sentence perfectly with its fixed set of labels.

So "The strawberry is red." might come out as something like: "The" — "straw" — "berry" — " is" — " red" — "." Six labels. And then comes the step that changes everything: each label is swapped for its ID number in the vocabulary list. The model doesn't receive "straw". It receives something like token number 34,562. The text is gone. What flows into the neural network is a sequence of integers.

And that's the moment "strawberry" loses its r's. The word became two tokens — two opaque ID numbers. Nothing about token 34,562 says it contains an s, a t, or an r, any more than the number on a license plate tells you what color the car is. If the model wants to know how many r's are in "strawberry," it can't look. It has to have *memorized*, somewhere during training, the spelling of the chunks — the same way you know the Eiffel Tower is in Paris without being able to see it right now. Sometimes that memory is right. Sometimes it isn't. That's the strawberry bug.

**[TRANSITION]**

Which raises the obvious question: whose idea was this? Why chop text into weird chunks instead of just using letters, which would keep spelling visible — or whole words, which humans actually think in? To answer that, we need to open up the algorithm that builds the vocabulary. And it started life with nothing to do with AI at all.

---

**[SECTION 2 — The Compression Trick That Ate the AI World]**

In 1994, a programmer named Philip Gage published a data-compression technique in a programming journal, called **byte pair encoding** — a method that shrinks a file by repeatedly finding the pair of symbols that appears most often, side by side, and replacing that pair with a single new symbol. Run it again and again, and common patterns collapse into compact codes.

Twenty-two years later, researchers Rico Sennrich, Barry Haddow, and Alexandra Birch, working on machine translation, hit a wall that every language system of the era faced: the rare word problem. A translation model with a fixed word list falls apart the moment it meets a word that isn't on the list — a new name, a typo, a technical term. Their insight, published in 2016, was that Gage's compression trick could carve words into reusable pieces. Rare words stop being unknowable; they're just uncommon combinations of common parts.

Here's how the vocabulary actually gets built, and it's satisfying to watch. You start with an alphabet of single characters — so at the beginning, "strawberry" really is eleven separate pieces. Then you scan a mountain of training text and ask one question: which two adjacent pieces appear together most often? Maybe it's "t" followed by "h". You glue them into a new piece, "th", and add it to the vocabulary. Then you repeat. And repeat. "th" plus "e" becomes "the". Somewhere along the way "s-t-r-a-w" fuses into "straw" and "b-e-r-r-y" into "berry", because English text is full of them. Each merge is one new label for the label maker. GPT-2's vocabulary is essentially 256 byte-level starting pieces plus about fifty thousand learned merges — that's where 50,257 comes from.

Now, why is this the winning design? Look at the two alternatives it beat. Use single characters, and spelling stays visible — but your sentence becomes enormously long, and the model burns its capacity gluing letters together instead of understanding meaning. Use whole words, and sequences are short — but your vocabulary explodes into the millions and still fails on every word it's never seen. Byte pair encoding sits in the sweet spot: common words ride as single tokens, and any weird new string — "Barakaeli", "x86_64", a misspelling — still tiles cleanly out of smaller pieces. Nothing is ever unknowable. The engineers didn't hide the letters out of carelessness. They traded letter-visibility for a system that can read *anything* efficiently.

But every trade has a bill, and now you can read the bill yourself. Counting letters inside a token? The letters aren't there — that's the strawberry failure. Comparing 9.11 and 9.9? Those digits may get chopped into tokens in inconsistent ways, so the model isn't reasoning about two clean numbers on a number line; it's reasoning about mismatched chunks. Arithmetic, rhyming, reversing a word, acrostics — every one of these classic stumbles happens at the front door, in the tokenizer, before the intelligent part of the system ever gets a turn.

---

**[SECTION 3 — What This Means When You Use AI]**

So let's bring it back to you, typing into a chat box. Three takeaways worth keeping.

First, when a model fumbles spelling or digit-level math, you're not watching it "be dumb." You're watching it answer questions about information that was compressed away before it arrived. It's like asking someone to count the brushstrokes in a painting they've only seen as a thumbnail.

Second, tokens are the unit of everything. The context window — the maximum amount of text a model can consider at once — is measured in tokens. API pricing is per token. When a document "doesn't fit," it's the token count, not the page count, that decided.

And third, this is the first domino of the whole series. Every system we'll look at — sampling, caching, attention itself — operates on these token IDs. Understand the label maker at the front door, and everything downstream starts making sense.

**[CTA]**

If you want to go deeper, the sources for everything in this video are in the description — including Sennrich's original 2016 paper, which is surprisingly readable.

**[OUTRO]**

That's pretty much it for tokenization. A 1994 compression trick, a fixed list of 50,257 labels, and a trade that made models able to read anything — at the price of never seeing a letter again. Next time, we'll look at why the same prompt gives you a different answer every time you ask. This is [CHANNEL NAME], where we take AI apart one specific concept at a time. Thanks for watching to the end.

---

### 📋 Production notes

- **Word count / runtime:** ~1,460 words ≈ 9.7 min at 150 wpm.
- **Scale-conceptualization beats:** label maker with 50,257 pre-printed labels and no printer; license plate number vs. car color; painting counted from a thumbnail.
- **Open loops planted:** (1) "secret numeric code" in hook → paid off in Section 1 ID-number reveal; (2) "a 1994 file-compression trick" teased in intro → paid off in Section 2 Gage story; (3) "why engineers chose this on purpose" → paid off in the sweet-spot tradeoff beat; (4) next-video tease (sampling) closes the loop into episode 2.
- **Analogies:** label maker (vocabulary), license plate (token ID opacity), Eiffel Tower memory (memorized spellings), tiling/labels (segmentation), first domino (series arc).
- **Technical coverage checklist:** tokenizer as separate front-door program ✓ · vocabulary and its 50,257 size with byte+merge breakdown ✓ · text→chunks→integer IDs pipeline ✓ · BPE merge loop from characters ✓ · Gage 1994 origin ✓ · Sennrich 2016 rare-word motivation and open-vocabulary claim ✓ · char-level vs word-level tradeoff ✓ · strawberry and 9.11-vs-9.9 failures explained mechanically ✓ · context window and pricing measured in tokens ✓.
- **Accuracy notes:** 50,257 = 256 byte tokens + ~50k merges + end-of-text special token (GPT-2 report). BLEU gains from Sennrich et al. (1.1 / 1.3 on WMT'15 En-De / En-Ru) available if a "does it actually work" beat is wanted. Exact token split of "strawberry" varies by tokenizer — script deliberately says "might" and uses straw/berry as an illustrative split; verify against the target tokenizer when recording visuals.
