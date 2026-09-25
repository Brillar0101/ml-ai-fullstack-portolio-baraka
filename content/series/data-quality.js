// Original AI Engineering series post. Rendered by src/pages/blog/SeriesPost.jsx;
// scheduled and given its sources in src/data/seriesPosts.js.
export const POST = {
  "id": "data-quality",
  "title": "Garbage in, garbage out: data quality for AI",
  "excerpt": "Whether you finetune or build datasets for evaluation, the data decides the ceiling. What \"quality\" actually means here.",
  "category": "ML",
  "chapter": "Chapter 8",
  "tags": [
    "Data",
    "Dataset Engineering"
  ],
  "seriesNum": 14,
  "publishAt": "2026-03-04T12:00:00Z",
  "body": [
    {
      "type": "p",
      "text": "Researchers built an image model to spot skin cancer from photos of moles and lesions. On its test set it did well."
    },
    {
      "type": "p",
      "text": "Then someone looked closely at what it had actually learned, and the answer was embarrassing: it had partly learned to look for **rulers**. Dermatologists tend to place a little ruler next to a lesion they already suspect is malignant, to record its size. So in the training photos, cancer and rulers showed up together. The model, asked only to predict cancer, quietly learned that a ruler in the frame was a strong clue. On a real photo with no ruler, it could miss the cancer entirely."
    },
    {
      "type": "p",
      "text": "Nothing was wrong with the model. It learned exactly what was in the data. The lesson is the oldest one in machine learning, and it did not go away with foundation models: **garbage in, garbage out**. The model reflects your data, including the parts you did not mean to teach it."
    },
    {
      "type": "h2",
      "text": "The model eats what you feed it"
    },
    {
      "type": "p",
      "text": "A model does not learn what you intended. It learns whatever reliably predicts the answer in the examples you gave it. If a useless or misleading signal happens to line up with the right answer in your data, the model will happily seize it, because it has no idea which clues are \"real.\" That is why data quality is not a nice-to-have. The data is the actual specification of what the model will do, far more than any prompt or architecture choice."
    },
    {
      "type": "h2",
      "text": "The ruler in the photo"
    },
    {
      "type": "p",
      "text": "Trace how the ruler crept in. The team collected malignant images from clinical records, where lesions were photographed with a ruler for scale, and benign images from sources where the ruler was often absent. They never told the model \"rulers mean cancer.\" They did not have to."
    },
    {
      "type": "p",
      "text": "The correlation was sitting in the data, so the model found it. This is a **spurious correlation**: a pattern that holds in your dataset but not in the real world. The fix was never a better model. It was better data, balanced so rulers appeared with both cancerous and healthy skin, breaking the false clue."
    },
    {
      "type": "h2",
      "text": "Names for the ways data goes bad"
    },
    {
      "type": "terms",
      "items": [
        {
          "term": "Coverage",
          "def": "how well the data spans the real situations the model will face, including the awkward ones you did not collect by default."
        },
        {
          "term": "Spurious correlation",
          "def": "a signal that predicts the answer in your data but not in reality, like rulers predicting cancer."
        },
        {
          "term": "Deduplication",
          "def": "removing repeated or near-identical examples so a handful of items do not quietly dominate training."
        },
        {
          "term": "Annotation",
          "def": "the labels or target answers attached to each example. A wrong label teaches the wrong thing."
        }
      ]
    },
    {
      "type": "h2",
      "text": "What to actually check"
    },
    {
      "type": "ul",
      "items": [
        "**Look at your data by hand.** A sample of fifty examples reveals problems, like the ruler, that no aggregate metric will.",
        "**Check coverage** against the cases real users will send, not the cases that were easy to gather.",
        "**Deduplicate.** Near-identical examples bias the model toward whatever they happen to share.",
        "**Fix labels.** A confidently wrong target is worse than a missing one, because the model trusts it."
      ]
    },
    {
      "type": "h2",
      "text": "A second kind of garbage: duplicates"
    },
    {
      "type": "p",
      "text": "The ruler is a coverage problem. A quieter one is repetition. When you scrape data at scale, the same text shows up over and over: boilerplate footers, reposted articles, near-identical product blurbs. If you train on it as-is, the model sees those repeated passages far more often than anything else and over-learns them, the way a student who only ever re-reads one chapter aces that chapter and fails the rest."
    },
    {
      "type": "p",
      "text": "Worse, if a duplicate sneaks from your training data into your test data, your evaluation is now graded on material the model has effectively memorized, and the score lies to you. This is why **deduplication** is a standard, unglamorous step in real dataset work. Removing the repeats is not housekeeping. It is the difference between a model that learned the material and one that learned a few loud passages by heart."
    },
    {
      "type": "h2",
      "text": "Quality beats quantity"
    },
    {
      "type": "p",
      "text": "The instinct is that more data is always better, and for clean data, more usually helps. But a smaller, carefully curated dataset routinely beats a larger messy one, because every bad or duplicated example is not neutral, it actively teaches the model something wrong. A few thousand correct, diverse, well-labeled examples can outperform a million scraped ones full of noise and repetition. That is a genuinely hopeful fact: you do not need an enormous budget to build good data, you need attention. The teams that win at finetuning are often not the ones with the most data, but the ones who looked at their data most carefully and threw the junk away."
    },
    {
      "type": "h2",
      "text": "Where good data actually comes from"
    },
    {
      "type": "p",
      "text": "Knowing data matters is one thing, getting good data is another, and it is more hands-on than people hope. The most reliable source is your own real usage: the actual questions users ask, the actual documents your product handles, warts and all, because those carry the awkward cases a synthetic set never imagines. When you cannot collect enough real examples, you can generate some, but generated data inherits the blind spots of whatever made it, so it needs the same scrutiny as anything else. And whatever the source, the single highest-value habit is unglamorous: sit down and read a sample. Reading fifty real examples by hand will teach you more about what is wrong, the ruler, the duplicates, the mislabeled rows, than any dashboard of averages ever will, because the problems that sink a model are usually specific and visible, not statistical."
    },
    {
      "type": "h2",
      "text": "Curate before you scale"
    },
    {
      "type": "p",
      "text": "Spend on data before you spend on a bigger model. The dermatology system did not need more parameters, it needed photos where the ruler did not give the game away. Look at your data by hand, remove duplicates, cover the cases users actually send, and fix the labels. Curation is unglamorous, and it is usually the highest-return work in the whole pipeline, because the model can only ever be as honest as the data you hand it."
    }
  ]
};
