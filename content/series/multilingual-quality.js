// Original AI Engineering series post. Rendered by src/pages/blog/SeriesPost.jsx;
// scheduled and given its sources in src/data/seriesPosts.js.
export const POST = {
  "id": "multilingual-quality",
  "title": "Why a model is sharp in English and clumsy elsewhere",
  "excerpt": "The same model can write fluent English and stumble in Swahili or Burmese. The reasons are training data and how text becomes tokens.",
  "category": "AI",
  "tags": [
    "Multilingual",
    "Tokenization",
    "Data"
  ],
  "seriesNum": 32,
  "publishAt": "2026-06-27T12:00:00Z",
  "body": [
    {
      "type": "p",
      "text": "Picture a support assistant that tests beautifully in English. Then they turn it on for their users in East Africa, and the complaints start: the answers in Swahili are stiff, sometimes wrong, occasionally a mix of two languages in one sentence. The model did not get worse. It was always like this. The team just never tested the languages their users actually speak, and they ran into one of the most consistent facts about modern language models: the same model can be brilliant in one language and mediocre in another, and the gap is not random."
    },
    {
      "type": "p",
      "text": "There are two separate reasons for the gap, and it helps to keep them apart because they have different fixes. The first is about how much the model saw during training. The second is about how the model chops text into pieces before it can read it at all. Both quietly punish languages that are not English, and together they explain most of what the team was seeing."
    },
    {
      "type": "h2",
      "text": "Reason one: the model saw far more English"
    },
    {
      "type": "p",
      "text": "A model learns a language by reading enormous amounts of it. The trouble is that the text available on the internet is wildly lopsided. A large share of it is in English, a smaller share in a handful of major languages, and a tiny sliver in everything else. A language with a lot of training text is called **high-resource**, and one with little is called **low-resource**. The model becomes fluent in proportion to what it read, so it writes English like a native and writes a low-resource language the way you would speak a language you studied for one semester: the grammar is shaky, the idioms are off, and it reaches for the wrong word more often."
    },
    {
      "type": "p",
      "text": "This is why two languages with the same number of speakers can get very different quality. What matters to the model is not how many people speak a language, it is how much written text in that language ended up in the training data. A language spoken by tens of millions can still be low-resource if most of it lives in conversation rather than on indexed web pages, while a language with fewer speakers but a large written corpus can come out ahead."
    },
    {
      "type": "h2",
      "text": "Reason two: tokenization is not fair to every language"
    },
    {
      "type": "p",
      "text": "The second reason is sneakier. Before a model reads text, it breaks the text into **tokens**, the small chunks it actually processes. The tokenizer is trained mostly on English, so it learned to pack common English words into one or two tokens each. For a language it saw less of, especially one in a non-Latin script, it falls back to cutting words into many tiny pieces, sometimes one token per character."
    },
    {
      "type": "p",
      "text": "Walk a quick comparison. The English word \"information\" might be a single token. The same idea in a low-resource language could be split into eight or ten tokens. Same meaning, many times the tokens. That sounds like a technicality until you notice what rides on the token count."
    },
    {
      "type": "h2",
      "text": "Why the token count quietly costs you"
    },
    {
      "type": "p",
      "text": "Three things scale with tokens, and all three get worse for the penalized languages. You usually **pay per token**, so the same message costs several times more in Burmese or Amharic than in English. The model has a fixed **context window** measured in tokens, so a document that fits comfortably in English can overflow the window in another language and get truncated."
    },
    {
      "type": "p",
      "text": "And because the model generates one token at a time, more tokens means a **slower response**. So a user writing in a low-resource language can pay more, hit limits sooner, and wait longer, for an answer that is also lower quality. The unfairness compounds."
    },
    {
      "type": "p",
      "text": "Put numbers on it and the effect stops feeling abstract. Suppose a paragraph is 200 tokens in English and the tokenizer needs four times as many tokens for the same paragraph in a non-Latin script. That paragraph now costs four times as much to send, eats four times as much of your context budget, and takes noticeably longer to come back. Run a busy support queue in that language all day and the difference is no longer a rounding error, it is a real line on the invoice and a real lag your users feel on every reply. None of that shows up if you only ever test in English, which is exactly why the gap stays invisible until real users hit it."
    },
    {
      "type": "h2",
      "text": "Terms for the language gap"
    },
    {
      "type": "terms",
      "items": [
        {
          "term": "High-resource language",
          "def": "a language with a large amount of training text, so the model is more fluent in it. English is the clearest example."
        },
        {
          "term": "Low-resource language",
          "def": "a language with little training text, where quality, cost, and speed all tend to be worse."
        },
        {
          "term": "Token",
          "def": "the chunk of text a model actually processes. How many tokens a word becomes depends on the tokenizer, and it varies by language."
        },
        {
          "term": "Code-switching",
          "def": "mixing two languages in one response, a common failure when the model is unsure in the target language."
        }
      ]
    },
    {
      "type": "h2",
      "text": "What to do about it"
    },
    {
      "type": "p",
      "text": "You cannot retrain the model, but you are not helpless either. The first and most important step is to **test in the languages your users actually use**, not just English, because a benchmark score on English tells you almost nothing about Swahili. Beyond that: budget for the higher token cost in non-English languages instead of being surprised by the bill, give the model a clear instruction to answer only in the target language to cut down on code-switching, and for the languages that matter most to your product, check whether a model trained with more of that language exists, since some models are built specifically for regions the big general models neglect. Where quality has to be high and the language is low-resource, a human in the loop is still the honest answer."
    },
    {
      "type": "p",
      "text": "The lesson the team took away was not that the model was broken. It was that \"the model is good\" is an incomplete sentence. Good at what, and good in which language. A model fluent in English is making you a promise only about English, and the moment your users speak something else, you have to go and measure it yourself rather than assume the fluency carries over. It usually does not, and now you know the two reasons why."
    }
  ]
};
