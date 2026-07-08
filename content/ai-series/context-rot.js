export const POST = {
  id: 'context-rot',
  title: 'Context Rot: Why Feeding the Model More Can Make Answers Worse',
  excerpt: 'A bigger context window feels like a free upgrade. In practice, stuffing it full is one of the fastest ways to quietly degrade your RAG app. Here is why, and what to do instead.',
  category: 'AI',
  tags: ['Context Engineering', 'Long Context', 'Evaluation'],
  readTime: '8 min read',
  body: [
    {
      type: 'p',
      text: 'A team I talked to had a support bot backed by retrieval. It worked well. Then someone noticed the model occasionally missed an answer that clearly lived in the docs, so they made what felt like an obvious fix. They bumped the number of retrieved documents from 4 to 20. More context, more chances to include the right passage, better answers. That was the theory.'
    },
    {
      type: 'p',
      text: 'The opposite happened. Accuracy on their eval set dropped by several points. The bot started citing the wrong policy, blending two unrelated tickets into one confident paragraph, and sometimes ignoring a fact that was sitting right there in document number 11. Nothing about the model changed. The prompt template was identical. The only thing that moved was how much text they poured into the window.'
    },
    {
      type: 'p',
      text: 'This is context rot. The intuition that more context is always safer is wrong, and the failure is measurable. Let me walk through why it happens and what to actually do about it.'
    },
    {
      type: 'p',
      text: 'I want to be clear about what did and did not change here, because that is the part people skip. The retriever was still returning the right document. Recall, in the retrieval sense, went up: the correct passage was inside the window more often at k=20 than at k=4. And yet the final answer got worse. That gap between what you retrieve and what the model uses is the whole story. You can win the retrieval step and still lose the answer step, and if you only measure retrieval you will never see it happen.'
    },
    {
      type: 'h2',
      text: 'The plain intuition: a long context is not a filing cabinet'
    },
    {
      type: 'p',
      text: 'It is tempting to imagine the context window as storage. You put a fact in, the fact stays there, and the model reads it when needed. That mental model is where the trouble starts.'
    },
    {
      type: 'p',
      text: 'A better picture is a crowded room where you are trying to have a conversation. If two people are talking, you hear both clearly. If forty people are talking and you need to remember the one useful thing the person in the middle said twenty minutes ago, you probably lost it. The room did not delete their words. Your attention just got spread too thin to hold onto them. Language models behave in a surprisingly similar way. Every extra token competes for a fixed budget of attention, and the model does not weight all positions equally.'
    },
    {
      type: 'p',
      text: 'This is not a bug in one model or a quirk of one vendor. It falls out of how attention works. The mechanism that lets a transformer look across the whole input has to share its focus among every token present. Add more tokens and each one gets a thinner slice on average. Training also plays a role, since models see a lot of examples where the key information sits near the start of an instruction or the end of a prompt, and less practice pulling a single detail out of the middle of a long block. The result is a model that reads the edges of a long input with more care than the center.'
    },
    {
      type: 'h2',
      text: 'Lost in the middle, shown with a concrete example'
    },
    {
      type: 'p',
      text: 'Here is the effect that surprises people the most. Suppose you give a model twenty retrieved passages and ask a question whose answer is in exactly one of them. You would expect performance to stay flat no matter which slot holds the answer. It does not.'
    },
    {
      type: 'p',
      text: 'When the answer sits in the first passage or the last passage, models tend to find it. When the same answer sits in passage 9 or 10, out in the middle of the pile, accuracy sags. Researchers measured this and found a U-shaped curve: strong at the edges, weak in the belly. The finding held even for models built and marketed for long contexts. So the failure your bot showed, ignoring document 11, was not a fluke. It was the predicted shape.'
    },
    {
      type: 'diagram',
      rows: [
        [
          { label: 'Position: start', detail: 'high recall' },
          { label: 'Position: early-mid', detail: 'recall dropping' },
          { label: 'Position: middle', detail: 'lowest recall' },
          { label: 'Position: late-mid', detail: 'recall rising' },
          { label: 'Position: end', detail: 'high recall' }
        ]
      ],
      caption: 'The lost-in-the-middle U-curve. A fact placed at the edges of a long context is recalled far more reliably than the same fact buried in the middle.'
    },
    {
      type: 'p',
      text: 'The practical reading is blunt. Where a fact lands inside the window changes whether the model uses it. If your retrieval dumps twenty chunks in and the one that matters happens to land in the middle, you can lose the answer even though you retrieved it correctly. You did your job. The position undid it.'
    },
    {
      type: 'h2',
      text: 'The terms, defined before we go further'
    },
    {
      type: 'terms',
      items: [
        { term: 'Context window', def: 'The maximum span of tokens a model can read at once for a single request, including your instructions, the retrieved text, and the conversation so far.' },
        { term: 'Context rot', def: 'The observed decline in answer quality as a context window fills up, even when the correct information is present somewhere inside it.' },
        { term: 'Lost in the middle', def: 'The tendency of models to attend well to content near the start and end of a long context and poorly to content in the middle.' },
        { term: 'Distraction', def: 'Degradation caused by irrelevant retrieved chunks that pull the model toward wrong or blended answers.' },
        { term: 'Needle in a haystack', def: 'An evaluation that hides a known fact (the needle) inside a large block of filler (the haystack) and checks whether the model can recall it.' }
      ]
    },
    {
      type: 'h2',
      text: 'Distraction is the second failure, and it is sneaky'
    },
    {
      type: 'p',
      text: 'Lost in the middle is about position. Distraction is about noise. When the team went from 4 chunks to 20, most of those extra 16 chunks were not the answer. They were plausible-looking neighbors: a similar policy from a different region, an older version of the same rule, a ticket that used the same words but described a different problem.'
    },
    {
      type: 'p',
      text: 'Irrelevant text that looks relevant is worse than useless. The model has to decide what to trust, and every extra passage that resembles the target raises the odds it anchors on the wrong one. This is how you get a confident answer that stitches two documents together. Retrieval precision fell as recall rose, and the model paid for it. Adding chunks 5 through 20 did not add much signal. It added a lot of competing signal.'
    },
    {
      type: 'callout',
      title: 'The counterintuitive part',
      text: 'Higher recall in retrieval can lower accuracy in the final answer. Getting the right chunk into the window does nothing if you also drag in ten convincing distractors that crowd it out.'
    },
    {
      type: 'h2',
      text: 'What to do: fewer, better, and placed on purpose'
    },
    {
      type: 'p',
      text: 'Three moves fix most of this, and none of them require a bigger window.'
    },
    {
      type: 'ul',
      items: [
        'Retrieve fewer, higher-precision chunks. Prefer 3 to 6 strong matches over 20 loose ones. If your retriever cannot rank well enough to trust the top 5, fix the retriever before you widen the funnel. A reranker on top of your first-pass search usually helps more than adding raw chunks.',
        'Put the most important content at the edges. Since the middle is where recall dies, order matters. Place your strongest chunk first or last, not buried in slot 10. Some teams reorder so relevance decreases toward the center from both ends.',
        'Cut anything that is not pulling weight. Deduplicate near-identical passages, drop chunks below a similarity threshold, and trim boilerplate. Empty tokens are not free. They fill the budget and dilute attention.'
      ]
    },
    {
      type: 'p',
      text: 'The through-line is that context is a resource you spend, not a bucket you fill. Every chunk you add should earn its place. If you cannot say why a passage is in the window, it is probably a distractor.'
    },
    {
      type: 'p',
      text: 'There is a cost angle worth naming too. Longer prompts are slower and more expensive per call, so the 20-chunk version was paying more money to get worse answers. When you cut back to a handful of strong chunks, latency drops, the bill drops, and quality often rises at the same time. It is rare to get all three moving the right way at once, which is a good sign you were overfilling the window rather than feeding the model what it actually needed.'
    },
    {
      type: 'h2',
      text: 'Measure it: a needle-in-a-haystack test you can run today'
    },
    {
      type: 'p',
      text: 'You should not guess about any of this. You can measure it directly. Take a fact the model has no way of knowing on its own, hide it inside a large block of filler text, and vary where you place it. Then ask a question only that fact can answer and check whether the model recalls it. Sweep the depth from top to bottom and you will draw your own U-curve.'
    },
    {
      type: 'code',
      lang: 'python',
      title: 'needle_in_haystack.py',
      code: `NEEDLE = "The launch code for project Falcon is 7Q-ARROW-92."
QUESTION = "What is the launch code for project Falcon?"

def build_context(filler, needle, depth_ratio):
    # depth_ratio 0.0 = top, 0.5 = middle, 1.0 = bottom
    cut = int(len(filler) * depth_ratio)
    return filler[:cut] + "\\n" + needle + "\\n" + filler[cut:]

def run_sweep(filler, ask_model):
    results = {}
    for depth in [0.0, 0.25, 0.5, 0.75, 1.0]:
        ctx = build_context(filler, NEEDLE, depth)
        answer = ask_model(ctx, QUESTION)
        results[depth] = "7Q-ARROW-92" in answer
    return results  # e.g. {0.0: True, 0.5: False, 1.0: True}`
    },
    {
      type: 'p',
      text: 'Run this at a few context lengths too, say 8k, 32k, and 100k tokens of filler. Two patterns usually appear. Recall dips in the middle depths, and it also erodes as total length grows. Once you can see your own curve, tuning stops being folklore. You keep the chunk count and ordering that your eval rewards, and you stop trusting the raw feeling that more is safer. Run the sweep again every time you change the retriever, the reranker, or the prompt template, because each of those can move the curve in ways you will not notice from spot checks alone.'
    },
    {
      type: 'h2',
      text: 'Common mistakes that keep the rot alive'
    },
    {
      type: 'ul',
      items: [
        'Treating the window size as the target. A 200k window is a ceiling, not a goal. Filling it is not an achievement.',
        'Raising the retrieval count to paper over a weak retriever. If precision is bad at k=5, it is worse at k=20, just hidden under volume.',
        'Ignoring order entirely and letting the retriever decide placement. Sorting by raw similarity often drops your best match into a mid-context dead zone.',
        'Shipping without a recall eval. If you cannot show the curve, you cannot claim the change helped. The support team only caught their regression because they had an eval set to check against.'
      ]
    },
    {
      type: 'h2',
      text: 'The takeaway'
    },
    {
      type: 'p',
      text: 'Context rot is real, it is measurable, and it runs against the grain of how most people think about long windows. Models read the edges better than the middle, they get distracted by lookalike passages, and they degrade as the window fills. So the fix is not more room. It is fewer and cleaner chunks, the important ones parked at the edges, and a needle-in-a-haystack eval that tells you the truth instead of your gut. When the support team went back to 5 tightly ranked chunks and put the top result last, their accuracy climbed past where it started. They did not buy a bigger window. They spent the one they had more carefully.'
    },
    {
      type: 'sources',
      items: [
        { title: 'Liu et al., Lost in the Middle: How Language Models Use Long Contexts (2023)', url: 'https://arxiv.org/abs/2307.03172' },
        { title: 'Greg Kamradt, Pressure Testing GPT-4 128K via Needle-in-a-Haystack', url: 'https://github.com/gkamradt/LLMTest_NeedleInAHaystack' },
        { title: 'Anthropic, Long Context Prompting Tips', url: 'https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/long-context-tips' }
      ]
    }
  ]
};
