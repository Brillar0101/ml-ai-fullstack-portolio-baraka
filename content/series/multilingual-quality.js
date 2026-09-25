// AI Engineering series post. Every factual claim is taken from the numbered sources at the end.
// The token premium chart is redrawn from Table 1 of Petrov et al. 2023 (arXiv 2305.15425, CC BY-NC-SA,
// so its figures are not reproduced). The XNLI chart is redrawn from Table 6 of Lai et al. 2023.
// The cost figure is Figure 5 of Ahia et al. 2023 (arXiv 2305.13707), reproduced under CC BY 4.0.
export const POST = {
  "id": "multilingual-quality",
  "title": "The price of a sentence: why models do worse outside English",
  "excerpt": "The tokenizer behind ChatGPT and GPT-4 needs about 15 times as many tokens for a sentence in Shan as for the same sentence in English. What that premium is made of, what it does to cost, context and latency, how accuracy falls with a language's share of the training data, and which fixes the papers measured.",
  "category": "AI",
  "tags": [
    "Multilingual",
    "Tokenization",
    "Evaluation"
  ],
  "seriesNum": 32,
  "publishAt": "2026-06-27T12:00:00Z",
  "body": [
    {
      "type": "p",
      "text": "In 2023, Aleksandar Petrov and three colleagues at the University of Oxford took FLORES-200, a set of 2,000 Wikipedia sentences that professional translators rendered into 200 languages, and ran every version through cl100k_base, the tokenizer shared by ChatGPT and GPT-4.[^1] Because the sentences say the same thing in every language, any difference in length comes from the language and not from the content. Portuguese came out closest to English and still needed 1.48 times as many tokens. Standard Arabic needed 3.04 times as many. Shan, spoken in the Shan State of Myanmar, needed 15.05 times as many.[^1] One Shan word for \"you\" is a single consonant carrying three diacritics, and cl100k_base splits it into 9 tokens. The English word \"you\" is 1 token.[^1]"
    },
    {
      "type": "p",
      "text": "That ratio is a price. Commercial APIs bill per token, context windows are measured in tokens, and a model writes its answer one token at a time. So the same sentence costs more, fits less, and takes longer depending on the language it is written in. Then, on top of that, the model tends to answer it worse. This post follows the ratio through each of those effects, using the papers that measured them."
    },
    {
      "type": "terms",
      "optional": false,
      "items": [
        { "term": "Token", "def": "The unit a language model reads and writes. A tokenizer cuts text into tokens from a fixed vocabulary; a common English word is often one token, a rare word or an unfamiliar script can take many." },
        { "term": "Parallel corpus", "def": "The same set of sentences translated into many languages. FLORES-200 is one. It lets you compare lengths across languages while holding the meaning fixed." },
        { "term": "Tokenization premium", "def": "How many tokens a tokenizer needs for a text in language A, divided by how many it needs for the same text in language B. English is usually B, so a premium of 3 means three times the tokens of English." },
        { "term": "Fertility", "def": "The average number of tokens a tokenizer produces per word. It is a related measure, but it needs word boundaries, which some languages do not mark with spaces." },
        { "term": "Resource level", "def": "A rough label for how much text in a language exists in training data. A high-resource language has a large share of the corpus, a low-resource language a tiny one." },
        { "term": "Zero-shot and few-shot", "def": "Zero-shot means asking the model to do a task from an instruction alone. Few-shot (in-context learning) means putting a handful of solved examples in the prompt first." }
      ]
    },
    {
      "type": "chart",
      "kind": "bar",
      "title": "Tokens needed for the same FLORES-200 text, relative to English (cl100k_base)",
      "yLabel": "Premium (English = 1.00)",
      "series": [
        { "label": "Tokenization premium", "key": "p" }
      ],
      "data": [
        { "label": "English", "values": { "p": 1.00 } },
        { "label": "Portuguese", "values": { "p": 1.48 } },
        { "label": "German", "values": { "p": 1.58 } },
        { "label": "Italian", "values": { "p": 1.64 } },
        { "label": "Chinese (Simp.)", "values": { "p": 1.91 } },
        { "label": "Japanese", "values": { "p": 2.30 } },
        { "label": "Bulgarian", "values": { "p": 2.64 } },
        { "label": "Std. Arabic", "values": { "p": 3.04 } },
        { "label": "Burmese", "values": { "p": 11.70 } },
        { "label": "Dzongkha", "values": { "p": 12.33 } },
        { "label": "Odia", "values": { "p": 12.48 } },
        { "label": "Shan", "values": { "p": 15.05 } }
      ],
      "caption": "Redrawn from the ChatGPT/GPT-4 column of Table 1 of Petrov et al., 2023.[^1] The paper reports 200 languages; this is a subset from its table. The paper notes that even the cheapest languages for this tokenizer, Portuguese, Pangasinan and German, pay about 50% more than English."
    },
    {
      "type": "h2",
      "text": "Where the extra tokens come from"
    },
    {
      "type": "p",
      "text": "Petrov et al. define the premium in the plainest way possible. Take a sentence \\(s_A\\) in language A and its translation \\(s_B\\) in language B, tokenize both with the same tokenizer \\(t\\), and divide the lengths.[^1]"
    },
    {
      "type": "eq",
      "tex": "\\text{premium}_{A/B} = \\frac{|t(s_A)|}{|t(s_B)|}",
      "caption": "The tokenization premium of language A relative to B (Petrov et al., 2023, Section 3).[^1] A value near 1 is what they call parity."
    },
    {
      "type": "p",
      "text": "Here \\(t(s_A)\\) is the list of tokens the tokenizer produces for the sentence, and the bars \\(|\\cdot|\\) mean its length. The numerator is what language A pays, the denominator is what B pays for the same meaning. Nothing about the model enters the formula. The disparity exists before the model has read a single token, which is the paper's main point.[^1]"
    },
    {
      "type": "p",
      "text": "Why would the same meaning need more tokens? The paper measured the same corpus at three levels: Unicode characters (the CANINE model reads one codepoint per token), UTF-8 bytes (ByT5 reads one byte per token), and subword tokens.[^1] That suggests a way to split the premium into parts. The split below is my own bookkeeping, not an equation from the paper, but every number that goes into it is from the paper."
    },
    {
      "type": "eq",
      "tex": "\\begin{aligned} \\frac{\\text{tokens}}{\\text{text}} &= \\frac{\\text{chars}}{\\text{text}} \\cdot \\frac{\\text{bytes}}{\\text{char}} \\\\ &\\quad \\cdot \\frac{\\text{tokens}}{\\text{byte}} \\end{aligned}",
      "caption": "The author's decomposition of token count into three factors. Divide each factor for language A by the same factor for English and the three ratios multiply to the premium."
    },
    {
      "type": "p",
      "text": "The first factor is how many characters a language uses to say something. It is a property of the language and its writing system. For Shan the character premium over English is 1.42; for Simplified Chinese it is 0.34, because each Chinese character carries a lot of meaning.[^1] The second factor is how many bytes each character takes in UTF-8, the standard way text is stored. ASCII letters, which cover English, take one byte. Other Latin letters, Greek, Cyrillic, Arabic and Hebrew take two, and Chinese, Japanese and Korean characters take three. Every Shan consonant and diacritic takes three.[^1] The byte premium over English that the paper reports is 3.94 for Shan and 0.93 for Chinese.[^1]"
    },
    {
      "type": "p",
      "text": "The third factor is how many bytes the tokenizer's vocabulary manages to glue into each token, and this is where training data comes in. A subword vocabulary is learned from a corpus, so it holds long, frequent chunks of whatever that corpus contained most. Dividing the paper's numbers (my arithmetic): cl100k_base spends about 3.8 times as many tokens per byte on Shan as on English (15.05 / 3.94), and about 2.1 times as many on Chinese (1.91 / 0.93). Put the three Shan ratios together, 1.42 × 2.77 × 3.82, and you get back the 15.05.[^1] Fewer letters do not save Chinese. Three bytes per character, and a vocabulary that packs fewer Chinese bytes into each token, add back more than the compact script saves."
    },
    {
      "type": "p",
      "text": "The corpus effect shows up in odd places. GPT-2's vocabulary contains a dedicated token for BuyableInstoreAndOnline, probably from an online store's backend, while the common Arabic word for \"why\" is broken into one token per letter.[^1] In cl100k_base, more than 65% of Japanese kanji still need three tokens each.[^1] Ahia et al. at the University of Washington and Carnegie Mellon checked whether this is only about data. They trained byte-level tokenizers on parallel text, one language per script, with the content and data size held equal and vocabularies from 5,000 to 50,000 entries. The disparity remained at every size, and most scripts suffered more than Latin and Hangul when the vocabulary was small.[^2] Their conclusion: the premium comes partly from each language's share of the tokenizer's training data and partly from properties of the language and its script.[^2]"
    },
    {
      "type": "h2",
      "text": "What a 15x premium does to a bill, a window and a wait"
    },
    {
      "type": "p",
      "text": "Cost is the direct one. When a service charges per token, the premium is the price multiplier. Petrov et al. put German and Italian at about 50% more than English on ChatGPT and GPT-4, and Dzongkha, Odia, Santali and Shan at more than 12 times.[^1] Pricing per character does not fix it, because Burmese, Dzongkha, Shan, Tok Pisin and Tumbuka need more than 4 times as many characters as Yue Chinese for the same text.[^1] Ahia et al. went past the corpus and measured what they actually spent running real tasks through gpt-3.5-turbo. On the XL-Sum summarization benchmark, prompt plus generated tokens cost up to about 4 times as much in Telugu and Amharic as in English.[^2]"
    },
    {
      "type": "image",
      "src": "/blog-images/multilingual-quality/ahia-cost-relative-to-english.webp",
      "alt": "Bar chart of experiment cost relative to English for XL-Sum on ChatGPT, for 14 languages. English is 1, French about 1.1, Portuguese 1.4, Swahili 1.6, Spanish 2.0, Vietnamese 2.2, Arabic 2.5, Korean 2.7, Russian 2.7, Japanese 2.8, Hindi 3.2, Thai 3.8, Telugu 4.4 and Amharic 4.6.",
      "width": 730,
      "height": 395,
      "caption": "What the same summarization job cost in each language, prompt plus output, relative to English. Figure 5 from Ahia et al., 2023,[^2] reproduced under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)."
    },
    {
      "type": "p",
      "text": "To make the multiplier concrete, here is some arithmetic of my own using the paper's premiums. Say a support queue spends $100 a month on input tokens in English. The same traffic in Italian costs about $164, in Standard Arabic about $304, in Shan about $1,505. That assumes the answers carry the same premium as the questions, which the corpus numbers suggest but no paper here measured for chat traffic."
    },
    {
      "type": "p",
      "text": "Context is the second effect. A window has a fixed number of tokens, so a premium shrinks how much content fits. Petrov et al. note that in Burmese or Dzongkha you can fit less than a tenth of the content you could fit in English.[^1] More arithmetic of mine: gpt-3.5-turbo at the time had a 4,096-token limit for prompt and output together.[^2] Divided by the premiums, that holds about 2,770 English tokens' worth of meaning in Portuguese, about 1,350 in Standard Arabic, and about 270 in Shan. Ahia et al. saw the practical result on XL-Sum: for most Telugu and Amharic test articles, not even one worked example fit next to the article, so those languages could only be run zero-shot.[^2] Few-shot examples raised scores for most tasks and languages they could test, so those languages lost that help because of token counts alone.[^2]"
    },
    {
      "type": "p",
      "text": "Latency is the third. Petrov et al. timed RoBERTa over FLORES-200 and found processing time grew roughly linearly with tokenized length. English sat in the fast, short corner. Shan had the longest encoding and took almost twice as long.[^1] That measurement is for reading input. For writing output my reasoning goes further: a model generates one token per decoding step, so an answer with 15 times the tokens needs 15 times the steps. I have not seen that measured across languages in these papers."
    },
    {
      "type": "h2",
      "text": "The accuracy gap follows the data, mostly"
    },
    {
      "type": "p",
      "text": "Cost would matter less if the expensive languages got equal answers. They do not. The training mix is lopsided to begin with: the MEGA paper from Microsoft cites documentation that about 93% of the tokens in GPT-3's pre-training data were English.[^4] Lai et al. at the University of Oregon and Adobe Research sorted 37 languages by their share of the CommonCrawl web corpus: high resource above 1%, medium above 0.1%, low above 0.01%, and extremely low below that. English was 45.88%. Hindi, with 602 million first- and second-language speakers, was 0.1588%. Swahili was 0.0077%.[^3]"
    },
    {
      "type": "p",
      "text": "They then tested ChatGPT zero-shot on seven tasks. One is XNLI, where the model reads two sentences and says whether the first entails, contradicts or is neutral to the second.[^3] The XNLI data in other languages was translated from English, so the test items mean the same thing everywhere.[^3]"
    },
    {
      "type": "chart",
      "kind": "bar",
      "title": "ChatGPT zero-shot accuracy on XNLI, by language and prompt language",
      "yLabel": "Accuracy (%)",
      "series": [
        { "label": "Instructions in English", "key": "en" },
        { "label": "Instructions in the test language", "key": "spc" }
      ],
      "data": [
        { "label": "en (H)", "values": { "en": 70.2, "spc": 70.2 } },
        { "label": "es (H)", "values": { "en": 65.8, "spc": 47.4 } },
        { "label": "de (H)", "values": { "en": 64.5, "spc": 51.1 } },
        { "label": "zh (H)", "values": { "en": 58.2, "spc": 35.5 } },
        { "label": "vi (H)", "values": { "en": 55.4, "spc": 44.8 } },
        { "label": "bg (M)", "values": { "en": 59.7, "spc": 44.6 } },
        { "label": "ar (M)", "values": { "en": 55.3, "spc": 22.3 } },
        { "label": "hi (M)", "values": { "en": 48.8, "spc": 5.6 } },
        { "label": "th (M)", "values": { "en": 44.7, "spc": 11.5 } },
        { "label": "ur (L)", "values": { "en": 43.7, "spc": 6.3 } },
        { "label": "sw (X)", "values": { "en": 50.3, "spc": 40.8 } }
      ],
      "caption": "Redrawn from Table 6 of Lai et al., 2023,[^3] a subset of its 15 languages. Letters give the paper's resource level (H high, M medium, L low, X extremely low). A fine-tuned mT5-XXL scored 82.9 to 92.4 on every language in the table."
    },
    {
      "type": "p",
      "text": "With English instructions, accuracy fell from 70.2% in English to 43.7% in Urdu, and a fine-tuned mT5-XXL model beat ChatGPT in every language by a wide margin.[^3] Lai et al. report that the gap between ChatGPT and the fine-tuned model looked smaller for high-resource languages.[^3] The summarization run adds a reliability angle. On XL-Sum, ChatGPT returned a non-empty summary for 99% of English requests but only 42% of Bengali and 43% of Burmese requests.[^3]"
    },
    {
      "type": "p",
      "text": "The trend is not a clean staircase, and the chart shows one exception: Swahili, extremely low resource, scored 50.3% while Urdu and Thai scored lower. Lai et al. list other cases. ChatGPT tagged parts of speech better in Urdu than in Vietnamese or Thai, and summarized better in Kyrgyz than in Hindi with in-language prompts.[^3] They conclude that data size is probably not the only factor, and that the task and a language's closeness to the dominant training languages matter too.[^3]"
    },
    {
      "type": "p",
      "text": "MEGA, which covered 16 datasets and 70 languages, tried to pin down those factors for GPT-3.5 and GPT-4.[^4] It found the OpenAI tokenizers were far worse for low-resource, non-Latin-script languages, with fertility near 10 tokens per word for Malayalam and Tamil, enough that the tokenizer essentially works byte by byte.[^4] On six tasks, GPT-3.5-Turbo's score fell as fertility rose, with statistically significant correlations. On four tasks, scores rose with the language's amount of pre-training data (GPT-3's language mix stood in, since GPT-3.5's is not public).[^4] The two factors are not the same thing. French and Japanese get similar fertility from these tokenizers, yet GPT-3.5-Turbo scored 72.1% in French and 67% in Japanese on the PAWS-X paraphrase task. GPT-3's data had roughly 3.5 billion French tokens and 214 million Japanese ones.[^4] The authors say plainly that these are correlations and may not be causes.[^4] GPT-4 narrowed the gap between English and other languages to some extent, but did not close it.[^4]"
    },
    {
      "type": "callout",
      "title": "Who pays the premium",
      "text": "Ahia et al. compared cost per language with the Human Development Index of the country where each language is most spoken. The correlations were negative on all three tasks they checked (Pearson from -0.43 to -0.60): speakers in less developed countries tended to pay more per task, and often got less accurate output.[^2]"
    },
    {
      "type": "h2",
      "text": "What the papers found that narrows it"
    },
    {
      "type": "p",
      "text": "The cheapest fix they measured is to translate the input into English. MEGA calls this translate-test: machine-translate the test example with Bing Translator, then prompt the model in English.[^4] For GPT-3.5-Turbo, the average relative gain over prompting in the original language was more than 30% for Burmese, Tamil and Telugu, while high-resource languages scored about the same either way.[^4] GPT-4 scored 77.6% on Burmese story completion (XStoryCloze) when prompted in Burmese and 93.2% with translate-test.[^4] It does not reach English. GPT-3.5-Turbo on Urdu XNLI went from 49.1% to 54% with translation, against 76.2% in English.[^4] My own addition: translating into English also shortens the prompt, since English has the lowest premium, but MEGA does not measure that saving."
    },
    {
      "type": "p",
      "text": "The prompt language matters as well. Lai et al. found English instructions beat in-language instructions for most tasks and languages, sometimes by a lot: Hindi XNLI went from 5.6% with Hindi instructions to 48.8% with English ones.[^3] The worked examples are a different story. When MEGA gave GPT-3.5-Turbo English examples for Quechua and Haitian Creole items, the model often replied, \"I'm sorry, but the premise is not in a language that I understand.\" With examples in the language itself, that almost never happened.[^4] My reading of the two papers together is that the model should get its instructions in English and see examples in the user's language."
    },
    {
      "type": "p",
      "text": "The deeper fixes change the tokenizer. Rust et al. trained models on the same data with two tokenizers, a dedicated one for the language and the multilingual mBERT one. The dedicated tokenizer won in 38 of 48 combinations of task, model and language. Swapping only the tokenizer improved the original mBERT in 20 of 24 language and task settings.[^5] Petrov et al. argue a fair tokenizer has to be built into the model from the start: a separate tokenizer used just for billing would fix the price but leave latency and context untouched.[^1] They propose training one tokenizer per language, then merging them, starting from the 256 byte values and repeatedly adding the most frequent token of whichever language currently has the highest premium.[^1] English would lose less than you might fear. Keeping only a third of cl100k_base's vocabulary would make English sequences just 10% longer, by their measurement.[^1] Ahia et al. also point to balancing languages in tokenizer data, as BLOOMZ does, to longer context windows, and to pricing that accounts for language and region.[^2]"
    },
    {
      "type": "h2",
      "text": "The languages nobody can score yet"
    },
    {
      "type": "p",
      "text": "Every accuracy number above depends on a benchmark existing in that language, and here the MEGA authors name a limit their method cannot get around. Even if they evaluated every multilingual dataset available, those datasets leave out many typologically diverse, under-resourced languages. There is very little from African languages or the Indigenous languages of the Americas in any benchmark available today.[^4] Petrov et al. add a caution about their own ruler: FLORES-200 contains many English-centric names and institutions, which may tilt the premiums in English's favor.[^1] The premium can be computed for any language with a translated sentence. For the languages where it is highest, the matching accuracy number mostly has not been measured."
    },
    {
      "type": "sources",
      "numbered": true,
      "items": [
        { "title": "Petrov, La Malfa, Torr, Bibi. Language Model Tokenizers Introduce Unfairness Between Languages. NeurIPS 2023.", "url": "https://arxiv.org/abs/2305.15425" },
        { "title": "Ahia, Kumar, Gonen, Kasai, Mortensen, Smith, Tsvetkov. Do All Languages Cost the Same? Tokenization in the Era of Commercial Language Models. EMNLP 2023.", "url": "https://arxiv.org/abs/2305.13707" },
        { "title": "Lai, Ngo, Pouran Ben Veyseh, Man, Dernoncourt, Bui, Nguyen. ChatGPT Beyond English: Towards a Comprehensive Evaluation of Large Language Models in Multilingual Learning. 2023.", "url": "https://arxiv.org/abs/2304.05613" },
        { "title": "Ahuja, Diddee, Hada, Ochieng, Ramesh, Jain, Nambi, Ganu, Segal, Axmed, Bali, Sitaram. MEGA: Multilingual Evaluation of Generative AI. EMNLP 2023.", "url": "https://arxiv.org/abs/2303.12528" },
        { "title": "Rust, Pfeiffer, Vulić, Ruder, Gurevych. How Good is Your Tokenizer? On the Monolingual Performance of Multilingual Language Models. ACL 2021.", "url": "https://arxiv.org/abs/2012.15613" }
      ]
    }
  ]
};
