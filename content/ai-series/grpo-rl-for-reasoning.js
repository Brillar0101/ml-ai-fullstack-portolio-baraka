// Every factual claim below is taken from the numbered sources at the end.
// The figure from Liu et al. (arXiv 2503.20783) is CC BY 4.0. The DeepSeek,
// PPO, GAE, and DAPO papers are arXiv non-exclusive, so their numbers are
// redrawn as charts rather than reproduced as figures.
export const POST = {
  id: 'grpo-rl-for-reasoning',
  title: 'Working GRPO by Hand: The Arithmetic Behind DeepSeek-R1\'s Aha Moment',
  excerpt: 'DeepSeek-R1-Zero learned to stop and write "Wait" using nothing but a pass/fail grade. This post computes GRPO\'s group-relative advantage for eight sampled answers by hand, builds the full objective from it, and shows why DeepSeek dropped PPO\'s value network.',
  category: 'AI',
  tags: ['Reinforcement Learning', 'Reasoning', 'Fine-tuning'],
  body: [
    {
      type: 'p',
      text: 'Partway through training DeepSeek-R1-Zero, its authors caught the model doing something nobody had asked for. It was working through an equation with nested square roots, squaring both sides, when it wrote: "Wait, wait. Wait. That\'s an aha moment I can flag here." Then it went back and re-checked the steps it had already taken. The team printed the transcript as Table 2 of the DeepSeek-R1 paper and called it "an aha moment for us" as well.[^1]',
    },
    {
      type: 'p',
      text: 'What makes the moment strange is how little the model was told. R1-Zero started from DeepSeek-V3-Base with no supervised fine-tuning first. Its reward came from rules: one part checked whether the final answer was correct, the other whether the reasoning sat inside the right tags.[^1] Nobody graded individual steps, and no demonstrations showed what reflection looks like. Even so, its average pass@1 on the AIME 2024 math competition rose from 15.6% to 77.9% during training, and 86.7% with majority voting.[^1] Its responses grew longer as training went on. The word "wait" was nearly absent early, showed up now and then between steps 4,000 and 7,000, and spiked after step 8,000.[^1]',
    },
    {
      type: 'chart',
      kind: 'bar',
      title: 'DeepSeek-R1-Zero on AIME 2024, before and after RL',
      yLabel: 'Accuracy (%)',
      series: [{ label: 'Accuracy', key: 'acc' }],
      data: [
        { label: 'Start, pass@1', values: { acc: 15.6 } },
        { label: 'End, pass@1', values: { acc: 77.9 } },
        { label: 'End, cons@16', values: { acc: 86.7 } },
      ],
      caption: 'Redrawn from the numbers reported with Figure 1(a) of DeepSeek-AI, 2025.[^1] Pass@1 averages the correctness of several sampled answers per question. Cons@16 takes a majority vote over 16 samples.',
    },
    {
      type: 'p',
      text: 'The algorithm doing the learning is **GRPO**, Group Relative Policy Optimization, which DeepSeek introduced a year earlier in the DeepSeekMath paper.[^2] Its central step is small enough to do on paper, so that is where this post starts. The full objective and the comparison with PPO follow from it.',
    },
    {
      type: 'h2',
      text: 'Eight attempts at one problem, graded by a script',
    },
    {
      type: 'p',
      text: 'Take one math question \\(q\\). GRPO asks the current model, called the **policy**, to answer it several times. The group size is \\(G\\). DeepSeekMath sampled 64 answers per question and R1-Zero sampled 16.[^2,1] To keep the arithmetic readable, use \\(G = 8\\).',
    },
    {
      type: 'p',
      text: 'A script checks each final answer against the known solution and returns 1 for correct, 0 for wrong. (R1-Zero also added a format reward with the same weight.[^1] It is left out here to keep the numbers clean.) Suppose answers 1, 4, and 7 are right and the other five are wrong. The rewards are \\(r = (1, 0, 0, 1, 0, 0, 1, 0)\\).',
    },
    {
      type: 'p',
      text: 'GRPO\'s rule for turning rewards into a learning signal is to subtract the group mean and divide by the group standard deviation.[^2] Written out for this group:',
    },
    {
      type: 'eq',
      tex: '\\begin{aligned} \\text{mean}(r) &= \\tfrac{3}{8} = 0.375 \\\\[2pt] \\text{std}(r) &= \\sqrt{\\tfrac{3(0.625)^2 + 5(0.375)^2}{8}} \\\\ &= \\sqrt{0.2344} \\approx 0.484 \\end{aligned}',
      caption: 'Group statistics for three correct answers out of eight.',
    },
    {
      type: 'eq',
      tex: '\\begin{aligned} A_{\\text{right}} &= \\frac{1 - 0.375}{0.484} \\approx +1.29 \\\\[4pt] A_{\\text{wrong}} &= \\frac{0 - 0.375}{0.484} \\approx -0.77 \\end{aligned}',
      caption: 'The advantage of each answer: its reward relative to its own group.',
    },
    {
      type: 'p',
      text: 'The number \\(A\\) is called the **advantage**: how much better an answer did than what was expected. Here "expected" means the average of the model\'s own attempts at the same question. A quick check: three answers at +1.29 and five at −0.77 add up to about zero. That always happens, because subtracting the mean centers the group. Every update pushes some answers up and others down by matching amounts.',
    },
    {
      type: 'p',
      text: 'The advantage belongs to the whole answer, not to one step. With a reward only at the end, DeepSeekMath sets the advantage of every token in answer \\(i\\) to that answer\'s normalized reward.[^2] So each token of answer 1, including any lucky guesses along the way, gets +1.29. Each token of answer 2 gets −0.77. With outcome rewards like these, GRPO has no way to know which line of a wrong answer went bad.',
    },
    {
      type: 'callout',
      title: 'Which standard deviation?',
      text: 'The papers write \\(\\text{std}(r)\\) without saying whether it divides by \\(G\\) or \\(G - 1\\).[^1,2] The example above divides by \\(G\\). Dividing by \\(G - 1\\) makes the magnitudes a little smaller but leaves every sign the same.',
    },
    {
      type: 'h2',
      text: 'An easy question and a hopeless one',
    },
    {
      type: 'p',
      text: 'Now suppose a different question where seven of the eight answers are right. The mean is 0.875 and the standard deviation is about 0.331. Each correct answer gets a small advantage of about +0.38. The one wrong answer gets about −2.65, a hard push down. The general pattern for pass/fail rewards falls out of the same arithmetic. If a fraction \\(p\\) of the group is correct:',
    },
    {
      type: 'eq',
      tex: '\\begin{aligned} A_{\\text{right}} &= +\\sqrt{\\frac{1 - p}{p}} \\\\[4pt] A_{\\text{wrong}} &= -\\sqrt{\\frac{p}{1 - p}} \\end{aligned}',
      caption: 'Advantages for 0/1 rewards, using the divide-by-G standard deviation.',
    },
    {
      type: 'p',
      text: 'A rare success on a hard question gets a large positive advantage, and a rare failure on an easy one gets a large negative one. It is grading on a curve, one question at a time.',
    },
    {
      type: 'p',
      text: 'The last case is the degenerate one. If all eight answers are right, or all eight are wrong, every reward equals the mean, the numerator is zero for everyone, and the question contributes no gradient at all. The DAPO paper points out that this gets worse as training goes on: the number of questions the model always solves keeps rising, so fewer questions in each batch carry any signal. DAPO\'s fix is to over-sample and drop questions whose group accuracy is exactly 1 or 0 until the batch is full.[^6]',
    },
    {
      type: 'h2',
      text: 'From one group to the loss the optimizer sees',
    },
    {
      type: 'p',
      text: 'Knowing that answer 1 should become more likely does not say how far to move. The full GRPO objective handles that, and it borrows most of its parts from PPO. Five terms first:',
    },
    {
      type: 'terms',
      optional: false,
      items: [
        { term: 'Old policy', def: 'A frozen snapshot of the model taken just before an update. It is the model that actually generated the group of answers.' },
        { term: 'Probability ratio', def: 'How much more (or less) likely the updated model makes a token than the old policy did. A ratio of 1 means no change.' },
        { term: 'Clipping', def: 'Cutting the ratio off at \\(1 - \\varepsilon\\) and \\(1 + \\varepsilon\\) so one update cannot move the model too far. PPO\'s paper uses \\(\\varepsilon = 0.2\\) as its example value.[^3]' },
        { term: 'Reference policy', def: 'A separate frozen copy of the model that training is kept from drifting too far away from.' },
        { term: 'KL divergence', def: 'A measure of how different two probability distributions are. Here it measures how far the policy has moved from the reference.' },
      ],
    },
    {
      type: 'p',
      text: 'With those in hand, here is the objective as DeepSeekMath writes it, where \\(o_{i,t}\\) is token \\(t\\) of answer \\(i\\):[^2]',
    },
    {
      type: 'eq',
      tex: '\\begin{gathered} \\mathcal{J}(\\theta) = \\mathbb{E}\\Bigg[ \\frac{1}{G} \\sum_{i=1}^{G} \\frac{1}{|o_i|} \\sum_{t=1}^{|o_i|} \\Big( \\min\\big( \\rho_{i,t} \\hat{A}_{i,t},\\ \\\\ \\text{clip}(\\rho_{i,t}, 1 - \\varepsilon, 1 + \\varepsilon)\\, \\hat{A}_{i,t} \\big) \\\\ - \\beta\\, \\mathbb{D}_{KL}\\big[\\pi_\\theta \\,\\|\\, \\pi_{ref}\\big] \\Big) \\Bigg] \\\\[6pt] \\rho_{i,t} = \\frac{\\pi_\\theta(o_{i,t} \\mid q, o_{i,<t})}{\\pi_{\\theta_{old}}(o_{i,t} \\mid q, o_{i,<t})} \\end{gathered}',
      caption: 'The GRPO objective (Shao et al., 2024, equation 3), with the probability ratio written as \\(\\rho\\) to save space.[^2]',
    },
    {
      type: 'p',
      text: 'Read it from the inside out. \\(\\hat{A}_{i,t}\\) is the number computed by hand above: +1.29 for every token of answer 1. Multiplying by the ratio \\(\\rho\\) means the objective goes up when the model makes those tokens more likely. The min and the clip stop the incentive at \\(1 + \\varepsilon\\): once answer 1\'s tokens are, say, 20% more likely than under the old policy, pushing further earns nothing. For answer 2, with a negative advantage, the same trick caps how hard its tokens get pushed down. PPO\'s authors describe this as a pessimistic bound: the objective ignores changes that would make it look better and keeps changes that make it look worse.[^3]',
    },
    {
      type: 'p',
      text: 'The two averages matter more than they look. The inner \\(1/|o_i|\\) averages over the tokens of one answer, and the outer \\(1/G\\) averages over the answers in the group. That inner average will come back later.',
    },
    {
      type: 'p',
      text: 'The last term keeps the model near the reference policy. DeepSeekMath estimates it per token with a form that is guaranteed to be positive:[^2]',
    },
    {
      type: 'eq',
      tex: '\\begin{gathered} \\mathbb{D}_{KL} = u - \\log u - 1 \\\\[4pt] u = \\frac{\\pi_{ref}(o_{i,t} \\mid q, o_{i,<t})}{\\pi_\\theta(o_{i,t} \\mid q, o_{i,<t})} \\end{gathered}',
      caption: 'The KL estimator GRPO adds directly to the loss (Shao et al., 2024, equation 4), with the ratio written as \\(u\\).[^2]',
    },
    {
      type: 'p',
      text: 'The actual settings were modest. For DeepSeekMath-RL 7B the policy learning rate was 1e-6, the KL coefficient \\(\\beta\\) was 0.04, answers were capped at 1,024 tokens, and the policy got a single update after each round of sampling.[^2] R1-Zero used a learning rate of 3e-6, a much smaller KL coefficient of 0.001, and 32 questions per step with 16 answers each, a batch of 512. Its maximum answer length was 32,768 tokens until step 8,200 and 65,536 after. The paper says both accuracy and response length jumped at that step. Training ran for 10,400 steps, and every 400 steps the reference model was replaced with the latest policy.[^1] The R1 paper also writes the ratio over the whole answer, \\(\\pi_\\theta(o_i \\mid q)\\), rather than token by token.[^1]',
    },
    {
      type: 'h2',
      text: 'What PPO needs that GRPO throws away',
    },
    {
      type: 'p',
      text: 'The clipped ratio came from PPO. What GRPO changed is where the advantage comes from. In standard PPO for language models, the advantage of each token is estimated with Generalized Advantage Estimation (GAE), which depends on a learned **value function**: a second network that looks at a partial answer and predicts the reward the rest of it will earn.[^2,3] GAE combines one-step errors of that prediction,',
    },
    {
      type: 'eq',
      tex: '\\begin{gathered} \\delta_t = r_t + \\gamma V(s_{t+1}) - V(s_t) \\\\[4pt] \\hat{A}_t = \\sum_{l \\ge 0} (\\gamma \\lambda)^l\\, \\delta_{t+l} \\end{gathered}',
      caption: 'Generalized Advantage Estimation (Schulman et al., 2016).[^4]',
    },
    {
      type: 'p',
      text: 'where \\(\\lambda\\) trades bias against variance. At \\(\\lambda = 1\\) the estimate stays unbiased however wrong \\(V\\) is, but it has high variance. At \\(\\lambda = 0\\) it has much lower variance but is biased unless \\(V\\) is accurate.[^4] The value network is trained alongside the policy with a squared-error loss.[^3]',
    },
    {
      type: 'p',
      text: 'DeepSeekMath gives two reasons for dropping it. The first is cost: the value function "is typically another model of comparable size as the policy model," which brings "a substantial memory and computational burden." The second is that the reward usually arrives only at the last token, which makes it hard to train a value function that is accurate at every token.[^2] GRPO replaces the learned prediction with the average reward of other answers to the same question, which is exactly the 0.375 computed above.[^2] The authors also note that comparing answers to the same question fits the way reward models are trained, since those are usually trained on comparisons between outputs for one question.[^2]',
    },
    {
      type: 'p',
      text: 'The R1 paper adds a reason specific to long reasoning. When a model reflects and revises, an early part of the answer may be contradicted later, so predicting the final reward from a partial answer gets even less feasible.[^1] It also points to a difference in the KL term. PPO usually adds a per-token KL penalty into the reward, and since RL maximizes cumulative reward, this penalizes cumulative KL. That may implicitly penalize longer responses and keep them from growing. GRPO puts the KL term in the loss instead.[^1]',
    },
    {
      type: 'p',
      text: 'The same appendix runs PPO and GRPO against each other on the MATH benchmark with DeepSeek-Coder-V2-Lite, a mixture-of-experts model with 16B parameters and 2.4B active. With GAE\'s \\(\\lambda\\) at 0.95, which the paper calls the default in most open-source PPO code, PPO did considerably worse than GRPO. Tuned to \\(\\lambda = 1.0\\), PPO came close to GRPO.[^1] The authors\' conclusion is measured: PPO can match GRPO when tuned, but tuning costs compute, and the value model adds memory and compute on top, so GRPO is the more practical choice for large models on limited resources.[^1]',
    },
    {
      type: 'h2',
      text: 'What a 7B model gained, and what it did not',
    },
    {
      type: 'p',
      text: 'GRPO\'s first test was DeepSeekMath-Instruct 7B, trained further on about 144K chain-of-thought questions related to GSM8K and MATH.[^2] It improved on every benchmark reported, including Chinese math sets that were not in the RL data.[^2]',
    },
    {
      type: 'chart',
      kind: 'bar',
      title: 'DeepSeekMath 7B, chain-of-thought accuracy before and after GRPO',
      yLabel: 'Accuracy (%)',
      series: [
        { label: 'Instruct (before RL)', key: 'sft', baseline: true },
        { label: 'RL with GRPO', key: 'rl' },
      ],
      data: [
        { label: 'GSM8K', values: { sft: 82.9, rl: 88.2 } },
        { label: 'MATH', values: { sft: 46.8, rl: 51.7 } },
        { label: 'MGSM-zh', values: { sft: 73.2, rl: 79.6 } },
        { label: 'CMATH', values: { sft: 84.6, rl: 88.8 } },
      ],
      caption: 'Redrawn from Table 5 of Shao et al., 2024.[^2] GSM8K and MATH are in-domain for the RL data. The two Chinese benchmarks are out of domain.',
    },
    {
      type: 'p',
      text: 'The same paper then asked what RL had actually changed. It measured two things for different numbers of samples \\(K\\): **Pass@K**, whether any of \\(K\\) answers is right, and **Maj@K**, whether the majority vote of \\(K\\) answers is right. RL raised Maj@K but not Pass@K. The authors\' reading is that RL made the output distribution more robust, boosting correct answers that were already among the model\'s top candidates, "rather than the enhancement of fundamental capabilities."[^2] That fits the arithmetic: GRPO can only reinforce a correct answer the model has already sampled. A question the model never gets right gives an all-zero group and no signal.',
    },
    {
      type: 'h2',
      text: 'Later papers took both averages back out',
    },
    {
      type: 'p',
      text: 'In 2025, Liu and colleagues argued that the two normalizations in GRPO each add a bias.[^5] Their figure shows both at once.',
    },
    {
      type: 'image',
      src: '/blog-images/grpo-rl-for-reasoning/drgrpo-bias-illustration.webp',
      alt: 'Two groups of four sampled answers drawn as rows of gray (correct) and red (incorrect) blocks, with row length showing response length. Question q1 has two correct and two incorrect answers and a small blue circle. Question q2 has three correct and one incorrect and a larger blue circle. Orange arrows show each answer\'s advantage divided by its length. A legend gives GRPO\'s effective advantage as 1 over std(R) times the centered advantage over the response length.',
      width: 1690,
      height: 240,
      caption: 'Circle size is \\(1/\\text{std}\\), so a group with more agreement gets more weight. Arrow size is the advantage divided by answer length, so the long wrong answer to q1 gets a smaller push down than the short one. Figure 4 from Liu et al., 2025,[^5] reproduced under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).',
    },
    {
      type: 'p',
      text: 'The first is a **question-level difficulty bias**, caused by dividing by the standard deviation. Questions where rewards are almost all 1 or all 0 have a small standard deviation, so they get more weight in the update.[^5] The seven-out-of-eight example shows it: the lone wrong answer got −2.65, over three times the −0.77 from the three-out-of-eight group, only because the group agreed more. The authors note that advantage normalization is a common RL trick, but it is usually done across a whole batch, not per question.[^5]',
    },
    {
      type: 'p',
      text: 'The second is a **response-level length bias**, from the \\(1/|o_i|\\) average. A correct answer\'s advantage is spread over its tokens, so short correct answers get bigger per-token updates. A wrong answer\'s penalty is spread the same way, so long wrong answers get penalized less, and the policy drifts toward longer responses among the wrong ones.[^5] The authors say this bias may explain part of the length growth seen in R1-Zero-style training, and they found the same length normalization in several popular open-source PPO implementations.[^5] Their fix, Dr. GRPO, removes both the \\(1/|o_i|\\) and the standard deviation terms, leaving the plain difference \\(r_i - \\text{mean}(r)\\).[^5] Using it in a minimal recipe, they report 43.3% on AIME 2024 with a 7B base model.[^5]',
    },
    {
      type: 'p',
      text: 'The same paper also re-examined the aha moment. Running DeepSeek-V3-Base, the model R1-Zero started from, on 500 MATH questions with the R1 template, they found it already produced a fair amount of self-reflection, including words like "Aha" and "wait." In R1-Zero\'s own answers to those questions, self-reflection was more frequent, but it was not positively correlated with higher accuracy.[^5] The R1 paper itself reports a 5- to 7-fold rise in reflective words during training.[^1] Both findings can hold together: RL made a behavior the base model already had much more common. Whether that behavior is what raised the AIME score is a separate question, and Liu et al.\'s correlation result is a reason not to assume it.',
    },
    {
      type: 'p',
      text: 'Reproducing R1-Zero with plain GRPO also turned out to be hard. The DAPO team\'s first GRPO run on Qwen2.5-32B scored 30 points on AIME 2024, well short of the 47 points DeepSeek reported for DeepSeek-R1-Zero-Qwen-32B. They traced the gap to entropy collapse, reward noise, and training instability, and fixed it with four changes, one of them the zero-advantage filter from earlier. The result was 50 points in half the training steps.[^6] Much of that work, like Dr. GRPO\'s, comes down to the same few lines computed by hand at the top of this post: a mean, a standard deviation, and what to divide by.',
    },
    {
      type: 'sources',
      numbered: true,
      items: [
        { title: 'DeepSeek-AI, DeepSeek-R1: Incentivizing Reasoning Capability in LLMs via Reinforcement Learning, 2025', url: 'https://arxiv.org/abs/2501.12948' },
        { title: 'Shao et al., DeepSeekMath: Pushing the Limits of Mathematical Reasoning in Open Language Models, 2024', url: 'https://arxiv.org/abs/2402.03300' },
        { title: 'Schulman et al., Proximal Policy Optimization Algorithms, 2017', url: 'https://arxiv.org/abs/1707.06347' },
        { title: 'Schulman et al., High-Dimensional Continuous Control Using Generalized Advantage Estimation, 2016', url: 'https://arxiv.org/abs/1506.02438' },
        { title: 'Liu et al., Understanding R1-Zero-Like Training: A Critical Perspective, 2025', url: 'https://arxiv.org/abs/2503.20783' },
        { title: 'Yu et al., DAPO: An Open-Source LLM Reinforcement Learning System at Scale, 2025', url: 'https://arxiv.org/abs/2503.14476' },
      ],
    },
  ],
};
