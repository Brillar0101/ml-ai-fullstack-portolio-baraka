export const POST = {
  id: 'build-finetuning-dataset',
  title: 'Why 2,000 Hand-Picked Examples Beat 50,000 Scraped Ones',
  excerpt: 'A team fine-tuned on fifty thousand scraped examples and shipped a model that was worse than the base. A rival team used two thousand they wrote by hand and won. The gap was never the model. It was the data.',
  category: 'AI',
  tags: ['Fine-tuning', 'Data', 'Instruction Tuning'],
  readTime: '8 min read',
  body: [
    {
      type: 'p',
      text: 'Two teams set out to fine-tune the same open base model for the same job: a support assistant that answers product questions in a calm, on-brand voice. The first team moved fast. They scraped fifty thousand question-and-answer pairs from old chat logs, forums, and a pile of internal docs, poured it all into the trainer, and waited. The result answered in three different tones depending on the question, repeated itself, and sometimes leaked half of a support macro into the reply. It scored worse on their own test set than the untouched base model did.'
    },
    {
      type: 'p',
      text: 'The second team was slower and, on paper, looked lazy. They wrote and curated two thousand examples by hand, checked each one, and threw away anything that felt off. Their model came out steady, consistent, and clearly better than the base. Same architecture, same trainer, same number of training epochs. The only thing that changed was the data going in. This post is about how the second team built their dataset, because that dataset is the real product, and the model is just what falls out of it.'
    },
    {
      type: 'h2',
      text: 'The model copies your data, flaws and all'
    },
    {
      type: 'p',
      text: 'Here is the intuition that makes everything else click. Fine-tuning does not teach a model new facts so much as it teaches a **behavior**: given this kind of request, respond in this kind of way. The model learns that behavior by imitating the examples you show it. If half your examples are curt and half are chatty, the model learns to be randomly curt or chatty. If a tenth of your examples contain a formatting glitch, the model learns that the glitch is sometimes correct. It has no way to know which examples were good and which slipped through. Every row you include is a small vote for how the model should act.'
    },
    {
      type: 'p',
      text: 'That is why volume alone can hurt you. Fifty thousand rows scraped without inspection carry fifty thousand votes, and a large share of them vote for the wrong thing. Two thousand clean rows carry two thousand votes that all point the same direction. The famous LIMA result put a number on this idea: a strong base model fine-tuned on roughly a thousand carefully written examples produced answers people preferred over models trained on far more. The lesson was that most of what a model needs to sound helpful is already inside the base model, and a small, clean dataset mostly wakes it up. Your job is to make sure every vote counts.'
    },
    {
      type: 'h2',
      text: 'What one example actually looks like'
    },
    {
      type: 'p',
      text: 'An instruction-tuning example is a small script for a single turn. In the most common shape it has three fields: an instruction that states the task, an optional input that carries the specific data the task acts on, and an output that shows the answer you want the model to produce. If you ask the model to "summarize this email," the instruction is the summarize request, the input is the email text, and the output is the summary you would be happy to ship.'
    },
    {
      type: 'p',
      text: 'When you feed this to the trainer, those fields get stitched into one flat string using a fixed template. The instruction and input become the **prompt**, the output becomes the **completion**, and the model is trained to produce the completion when it sees the prompt. The template matters more than people expect. If you train with one wrapper and serve with a different one, the model sees a prompt it never learned from and its quality drops. Pick a template early, write it down, and use the exact same one everywhere.'
    },
    {
      type: 'terms',
      items: [
        { term: 'Instruction tuning (IFT)', def: 'Fine-tuning a base model on many instruction-and-response examples so it learns to follow requests in a consistent, helpful way.' },
        { term: 'Prompt-completion format', def: 'The flat text shape the trainer sees: a prompt built from the instruction and input, and a completion the model learns to generate.' },
        { term: 'Synthetic data', def: 'Examples written by a stronger model instead of a person, usually generated in bulk and then filtered down to the good ones.' },
        { term: 'Deduplication', def: 'Removing rows that are identical or near-identical so the model does not over-weight a handful of repeated patterns.' },
        { term: 'Validation split', def: 'A slice of examples held out of training and used only to measure how the model does on data it never learned from.' },
        { term: 'Data diversity', def: 'How wide a range of tasks, phrasings, and topics your examples cover, which is what lets the model generalize past the exact rows you showed it.' }
      ]
    },
    {
      type: 'h2',
      text: 'Three ways to get examples, and how to trust them'
    },
    {
      type: 'p',
      text: 'Examples come from three main places, and each has a catch. The first is curated real interactions: transcripts of actual users talking to your current system or your support staff. These are gold because they match how people really ask, but raw logs are messy, full of typos, dead ends, and answers you would not want to repeat, so they need heavy cleaning. The second is expert-written examples, where a person who knows the task writes both the request and the ideal answer. These are the most reliable and the most expensive, and they are worth it for the core behaviors you care about most.'
    },
    {
      type: 'p',
      text: 'The third is synthetic generation, where you prompt a stronger model to invent instructions and answers for you. This is the Self-Instruct idea that powered Alpaca: start with a small seed set of human examples, ask a capable model to produce many more in the same spirit, and use those to train a smaller model cheaply. It scales fast, but a strong model still makes mistakes and tends to repeat itself, so synthetic data without a filtering pass will quietly poison your set. The practical move is to blend all three: expert examples for the hard core, cleaned real logs for realism, and synthetic data to fill gaps in tasks you are short on.'
    },
    {
      type: 'diagram',
      nodes: [
        { label: 'Collect', detail: 'Real logs, expert-written, synthetic' },
        { label: 'Format', detail: 'Map to instruction / input / output' },
        { label: 'Filter and dedup', detail: 'Drop bad rows and near-duplicates' },
        { label: 'Balance', detail: 'Even out the task mix' },
        { label: 'Split', detail: 'Hold out a validation slice' }
      ],
      caption: 'The dataset pipeline. Every stage throws examples away, and that is the point: what survives is what trains the model.'
    },
    {
      type: 'h2',
      text: 'The cleaning pass that saves the run'
    },
    {
      type: 'p',
      text: 'Once you have raw pairs, the middle of the pipeline is where a bad dataset becomes a good one. First you normalize every example into the same instruction shape so the trainer sees one consistent structure. Then you filter: drop rows with an empty answer, answers that are one word when the task needs a paragraph, or answers that are suspiciously long and rambling. Then you deduplicate, because scraped data is full of the same question asked ten times, and ten copies of one row teach the model that this one row is ten times as important as it should be. The code below shows the core of that pass on a small batch of raw pairs.'
    },
    {
      type: 'code',
      lang: 'python',
      title: 'Format raw pairs and drop bad or duplicate rows',
      code: `import re

def to_example(pair):
    instruction = pair["question"].strip()
    output = pair["answer"].strip()
    return {"instruction": instruction, "input": "", "output": output}

def is_good(ex):
    if not ex["instruction"] or not ex["output"]:
        return False
    if len(ex["output"].split()) < 3:      # too short to be a real answer
        return False
    if len(ex["output"].split()) > 400:    # likely a leaked macro or dump
        return False
    return True

def norm(text):
    return re.sub(r"\\s+", " ", text.lower()).strip()

clean, seen = [], set()
for pair in raw_pairs:
    ex = to_example(pair)
    if not is_good(ex):
        continue
    key = norm(ex["instruction"]) + "|" + norm(ex["output"])
    if key in seen:                        # exact-ish duplicate, skip it
        continue
    seen.add(key)
    clean.append(ex)`
    },
    {
      type: 'p',
      text: 'This is deliberately simple, and simple is the right starting point. The exact-match dedup key catches obvious repeats. For near-duplicates that differ by a word or two, teams reach for fuzzy methods like comparing text embeddings and dropping pairs that sit above a similarity threshold, but do not add that until you have measured that plain dedup is not enough. Getting the boring filters right first removes most of the damage.'
    },
    {
      type: 'h2',
      text: 'Balance the mix, then hold out a real test'
    },
    {
      type: 'p',
      text: 'After cleaning, look at what tasks are actually in your set. Scraped data is almost always lopsided: maybe seventy percent of your examples are one common question type and the tasks you care about most are barely present. If you train on that as-is, the model gets great at the common case and stays weak everywhere else. Balancing means capping the over-represented tasks and adding examples, often synthetic ones, for the under-represented ones, so the mix roughly matches how you want the model to spend its attention.'
    },
    {
      type: 'p',
      text: 'The last step is the one people skip and later regret. Before training, pull out a **validation split**, say five to ten percent of your examples, and never train on them. This held-out slice is how you find out whether the model learned the behavior or just memorized rows. There is one rule that cannot bend: an example that appears in training must never also appear in validation. If it does, the model has effectively seen the answer key, your validation score looks great, and the real-world performance quietly disappoints. Deduplicate across the split boundary, not just within training, or the leak sneaks back in.'
    },
    {
      type: 'callout',
      title: 'The mistakes that quietly wreck a run',
      text: 'Watch for these in order. Test data leaking into training, which inflates your scores and hides real problems. Duplicates that over-weight a few patterns. Inconsistent style, where the model learns to answer in a random voice. Format errors from a mismatched prompt template. And a lopsided task mix that makes the model sharp on one thing and dull on the rest. Every one of these is a data problem, not a model problem, so no bigger model or longer training run will fix them.'
    },
    {
      type: 'h2',
      text: 'What to hold onto'
    },
    {
      type: 'p',
      text: 'The story of the two teams is not really about size. The scraped fifty thousand lost because most of those rows voted for behavior nobody wanted, and the two thousand won because every row was a clear vote for the same clean behavior. So treat your dataset as the thing you are actually building. Write down one prompt template and use it everywhere. Clean, deduplicate, and balance before you ever launch a training run. Hold out a validation split and guard it from leaks. If you get the data right, a modest model will surprise you, and if you get it wrong, no amount of compute will save you.'
    },
    {
      type: 'sources',
      items: [
        { title: 'Zhou et al., LIMA: Less Is More for Alignment (2023)', url: 'https://arxiv.org/abs/2305.11206' },
        { title: 'Wang et al., Self-Instruct: Aligning Language Models with Self-Generated Instructions (2022)', url: 'https://arxiv.org/abs/2212.10560' }
      ]
    }
  ]
};
