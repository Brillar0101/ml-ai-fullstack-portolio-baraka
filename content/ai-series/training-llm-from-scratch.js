export const POST = {
  id: 'training-llm-from-scratch',
  title: 'How an LLM Is Trained From Scratch: The Full Pipeline, End to End',
  excerpt: 'You can rent a foundation model in an afternoon. Building one from raw text takes months and millions. Here is the map of every stage in between.',
  category: 'AI',
  tags: ['LLMs', 'Training', 'Pretraining'],
  readTime: '9 min read',
  body: [
    {
      type: 'p',
      text: 'Picture two engineers who both ship a working chatbot on the same Friday. The first one signs up for an API, sends a few requests, and has a helpful assistant answering customer questions by lunch. The second one is nine months into a project to build a comparable model from raw text, and is still watching a GPU cluster grind through a data pipeline. Same end product, wildly different journeys. Most people only ever meet the first engineer. This post is about the second one, because the hidden work behind a foundation model explains why the first path exists at all.',
    },
    {
      type: 'p',
      text: 'Here is the intuition before any of the machinery. A large language model starts life knowing nothing, with billions of numbers set to noise. Training is the slow process of nudging those numbers until the model can guess what word comes next in almost any sentence humans have written. Everything downstream, following instructions, staying polite, refusing harmful requests, is a smaller adjustment layered on top of that one core skill. So the pipeline is really a story about teaching a blank system to predict text, and then reshaping that raw ability into something people can actually talk to.',
    },
    {
      type: 'h2',
      text: 'The four stages, and what each one hands to the next',
    },
    {
      type: 'p',
      text: 'It helps to see the whole assembly line first, then zoom into each station. A model passes through four hands. First, a data team assembles and cleans an enormous pile of text. Second, the **pretraining** run turns that text into a **base model** that predicts words but does not yet chat. Third, **supervised fine-tuning** teaches the base model to answer questions instead of just continuing them. Fourth, **preference alignment** polishes the tone and safety so the model behaves the way people expect. Each stage takes the output of the last as its raw material, which is why skipping one leaves you with something half finished.',
    },
    {
      type: 'diagram',
      nodes: [
        { label: 'Corpus', detail: 'Trillions of cleaned, deduplicated, tokenized words' },
        { label: 'Pretraining', detail: 'Next-token prediction on a GPU cluster, weeks to months' },
        { label: 'SFT', detail: 'Learn to follow instructions from example answers' },
        { label: 'Alignment', detail: 'RLHF or DPO tunes for helpful, safe replies' },
        { label: 'Deployed Model', detail: 'The instruct model users actually talk to' },
      ],
      caption: 'The full pipeline: raw text becomes a base model, then an instruction-following model, then a deployed assistant.',
    },
    {
      type: 'h2',
      text: 'Stage one: turning the internet into training fuel',
    },
    {
      type: 'p',
      text: 'The first stage is unglamorous and decides everything. A team gathers text from web crawls, books, code, and other sources, then spends most of its effort throwing text away. Duplicate pages get removed so the model does not memorize the same paragraph a thousand times. Low-quality junk, spam, and broken markup get filtered out. What survives gets **tokenized**, meaning it is chopped into the small units the model actually reads. The result is a **corpus**, a fixed body of text measured not in pages but in tokens, often trillions of them. If tokenization is new to you, the earlier post in this series on how text becomes tokens is the place to start, since every later stage counts its work in tokens.',
    },
    {
      type: 'p',
      text: 'The reason cleaning matters so much is that the model has no taste of its own. It will faithfully learn whatever patterns appear most often. Feed it duplicated boilerplate and it wastes capacity learning boilerplate. Feed it a balanced, deduplicated mix and it learns the shape of real language. This is why data work, not model architecture, is often where teams spend their scarce human hours. A concrete example makes the stakes clear. Suppose a single popular article got copied onto ten thousand sites. Without deduplication, the model sees that one article ten thousand times and learns its exact phrasing by heart, which crowds out ten thousand other pages it could have learned from instead. Good deduplication collapses those copies down to one, so the training budget buys variety rather than repetition.',
    },
    {
      type: 'terms',
      items: [
        { term: 'Corpus', def: 'The full, fixed collection of text a model trains on, usually measured in tokens rather than documents.' },
        { term: 'Tokenization', def: 'Splitting raw text into the small units, roughly word pieces, that the model reads and predicts.' },
      ],
    },
    {
      type: 'h2',
      text: 'Stage two: pretraining, where the money goes',
    },
    {
      type: 'p',
      text: '**Pretraining** is the expensive heart of the whole thing. The model reads the corpus and plays one game over and over: given the words so far, predict the next token. When it guesses wrong, its internal numbers get adjusted a tiny amount so the next guess is a little better. Repeat this across trillions of tokens on a cluster of hundreds or thousands of GPUs running for weeks, and the noise slowly organizes itself into a working language model. What comes out is a **base model**. It can complete text with startling fluency, but it does not know it is supposed to be an assistant. Ask it a question and it might just continue with more questions, because continuing text is the only thing it was ever trained to do.',
    },
    {
      type: 'p',
      text: 'The learning signal itself is simpler than it sounds. You take a chunk of text, shift it by one position so each token becomes the target for the token before it, and measure how surprised the model was by the real next token. That surprise is the loss, and training just means reducing it. Walk through one tiny case. The model reads "the cat sat on the" and has to guess the next token. Early in training it might spread its bet evenly across thousands of possibilities, so it is very surprised when the real answer turns out to be "mat", and the loss is high. After enough passes over similar sentences, it learns to put most of its bet on words that fit, the surprise shrinks, and the loss drops. Multiply that single guess by trillions and you have the entire pretraining run. The snippet below shows the core objective in a few lines.',
    },
    {
      type: 'code',
      lang: 'python',
      title: 'The next-token objective in miniature',
      code: `import torch
import torch.nn.functional as F

# logits: model output, shape (batch, seq_len, vocab)
# tokens: the input ids, shape (batch, seq_len)
def next_token_loss(logits, tokens):
    # predict token t+1 from everything up to t
    preds = logits[:, :-1, :]      # drop the last position
    targets = tokens[:, 1:]        # shift left by one
    # cross-entropy measures how surprised we were
    loss = F.cross_entropy(
        preds.reshape(-1, preds.size(-1)),
        targets.reshape(-1),
    )
    return loss  # lower loss means better predictions`,
    },
    {
      type: 'p',
      text: 'How big should the model be, and how much text does it need? That trade-off has a name in this series already, the scaling laws post, and the short version is that model size and data size have to grow together. A famous result from the Chinchilla work showed that many early models were oversized for the amount of text they saw, and that a smaller model trained on more tokens can beat a larger one trained on less. Your **compute budget**, the total amount of processing you can afford, is the real constraint, and it forces you to balance those two dials.',
    },
    {
      type: 'callout',
      title: 'Why almost nobody pretrains',
      text: 'A single frontier pretraining run can cost millions of dollars in compute and take months of cluster time, before a single user sees it. That is why the overwhelming majority of teams start from an open base model someone else already paid to pretrain, and only run the cheaper later stages themselves.',
    },
    {
      type: 'h2',
      text: 'Stages three and four: from raw predictor to real assistant',
    },
    {
      type: 'p',
      text: 'The base model is powerful but blunt. To make it useful, you show it examples of the behavior you want. In **supervised fine-tuning**, you feed it thousands of prompt-and-answer pairs written or curated by people, and it learns that when text looks like a question, the right continuation is a direct answer. This is a short, cheap stage compared to pretraining, often days rather than months, and it reuses the exact same next-token machinery, just pointed at curated conversations instead of raw web text. It is where the model first starts to feel like it is talking to you rather than rambling. The output is often called an instruct model.',
    },
    {
      type: 'p',
      text: 'The last stage, **preference alignment**, handles the softer judgments that are hard to write as example answers. Given two replies to the same prompt, which one is more helpful, clearer, or safer? Writing a single perfect answer for every case is impossible, but people are quite good at comparing two options and picking the better one. So the process leans on comparison instead of dictation. People rank pairs of responses, and methods like RLHF or the simpler DPO use those rankings to nudge the model toward the answers humans prefer. The InstructGPT work showed that a smaller model tuned this way was rated more helpful than a much larger untuned one, which is a strong hint that alignment, not raw size, drives a lot of the quality people feel. The difference between supervised fine-tuning and preference methods, and newer approaches like GRPO, each get their own treatment elsewhere in this series.',
    },
    {
      type: 'terms',
      items: [
        { term: 'Pretraining', def: 'The long, costly stage where a model learns next-token prediction over a huge corpus, producing a base model.' },
        { term: 'Base model', def: 'The raw output of pretraining: fluent at completing text but not yet trained to follow instructions.' },
        { term: 'SFT (supervised fine-tuning)', def: 'Teaching the base model to answer prompts by training it on curated question-and-answer examples.' },
        { term: 'Preference alignment / RLHF', def: 'Tuning the model toward responses humans rank as more helpful and safe, using ranked pairs of answers.' },
        { term: 'Compute budget', def: 'The total processing you can afford, which forces the trade-off between model size and training data size.' },
      ],
    },
    {
      type: 'h2',
      text: 'Common mistakes when reading this map',
    },
    {
      type: 'ul',
      items: [
        'Thinking the base model is broken because it will not chat. It is doing exactly its job, which is continuing text, and chatting is a later skill.',
        'Assuming a bigger model is always better. Chinchilla showed data and size must scale together, so a well-fed smaller model can win.',
        'Believing you need to pretrain to build a product. In practice you almost never do, since strong open base models already exist.',
        'Treating data cleaning as a quick preprocessing step. It is the stage that quietly sets the ceiling on everything after it.',
      ],
    },
    {
      type: 'p',
      text: 'The takeaway is the contrast we started with. Renting a foundation model is an afternoon of work because someone else already spent the months and the millions on stages one and two. When you fine-tune an open base model for your own task, you are stepping onto the assembly line at stage three, skipping the part that only a handful of well-funded labs can afford. Knowing the full pipeline does not mean you should run all of it. It means you can see exactly which stage your problem actually lives in, and pay only for that. Most product needs are met at stage three or four, on top of a base someone else built, and recognizing that early saves both money and months.',
    },
    {
      type: 'sources',
      items: [
        { title: 'Brown et al., Language Models are Few-Shot Learners (GPT-3), 2020', url: 'https://arxiv.org/abs/2005.14165' },
        { title: 'Ouyang et al., Training language models to follow instructions (InstructGPT), 2022', url: 'https://arxiv.org/abs/2203.02155' },
        { title: 'Hoffmann et al., Training Compute-Optimal Large Language Models (Chinchilla), 2022', url: 'https://arxiv.org/abs/2203.15556' },
      ],
    },
  ],
};
