export const POST = {
  id: 'grpo-rl-for-reasoning',
  title: 'GRPO: Teaching a Model to Reason by Grading Its Own Guesses',
  excerpt: 'Give a model a math problem with a checkable answer, let it try several times, then push it toward the tries that beat its own average. That simple loop, called GRPO, is a big part of how reasoning models got good.',
  category: 'AI',
  tags: ['Fine-tuning', 'Reinforcement Learning', 'Reasoning'],
  readTime: '9 min read',
  body: [
    {
      type: 'p',
      text: 'A model is staring at a grade-school word problem. A train leaves a station, another train leaves later, and the question wants to know when they meet. There is one correct number at the end, and a simple script can check it in a millisecond. The model writes out some steps and lands on an answer. It is wrong. Nobody hands it the right solution. Nobody labels which step went sideways. All the model gets back is a single bit: the final number did not match. The interesting question is how you turn that one bit of feedback into a model that, a few thousand attempts later, gets these problems right far more often.'
    },
    {
      type: 'p',
      text: 'That is the puzzle reinforcement learning solves for reasoning, and **GRPO** is one of the cleaner ways to solve it. GRPO stands for Group Relative Policy Optimization. It came out of the DeepSeekMath work in 2024 and later powered the reasoning behavior in DeepSeek-R1. The short version: for a hard problem where the answer can be checked automatically, you let the model take several swings, score each swing by whether it worked, and then nudge the model toward the swings that beat the group average while pulling it away from the ones that fell below. There is no teacher writing perfect solutions. The model learns from the spread of its own attempts.'
    },
    {
      type: 'h2',
      text: 'Grading on a curve inside a single question'
    },
    {
      type: 'p',
      text: 'Here is an intuition worth holding onto. Imagine a teacher who gives one student the same problem five times and gets five different attempts back. The teacher does not have an answer key with full worked solutions. What the teacher does have is a way to check the final answer, so they can mark each of the five attempts right or wrong. Now the teacher grades on a curve inside that little batch of five. Attempts that did better than the batch average get a thumbs up. Attempts that did worse get a thumbs down. The student is told to write more like the good ones and less like the bad ones.'
    },
    {
      type: 'p',
      text: 'The clever part is that the batch supplies its own standard. The teacher never needs to know how hard the problem is in absolute terms. If all five attempts are strong, the average is high and only the best stand out. If all five are weak, the average is low and the least-bad ones still get encouraged, which keeps the student improving even on brutal problems. This idea of comparing each attempt to the average of its own group is the heart of GRPO, and it is what lets the whole thing run without a separate machine estimating how good a partial solution is.'
    },
    {
      type: 'h2',
      text: 'One math problem, five attempts, step by step'
    },
    {
      type: 'p',
      text: 'Let us walk a concrete round. Take that train problem. The correct answer is 4 hours. We ask the model to produce five separate solutions, sampling with a bit of randomness so they come out different. Call them attempts A through E. A verifier, which here is just a small program, reads the final number in each and marks it. Say A, C, and D reach 4 hours and score 1, while B and E reach the wrong number and score 0.'
    },
    {
      type: 'p',
      text: 'The average score across the five is 0.6. Now we compute how far each attempt sits from that average. A, C, and D are at 1, so they land 0.4 above the average, giving them a positive signal. B and E are at 0, so they sit 0.6 below, giving them a negative signal. During the update, the model is pushed to make the word choices and reasoning steps inside A, C, and D more likely next time, and the steps inside B and E less likely. Run this loop over thousands of different problems and the model slowly shifts its habits toward the kinds of reasoning that tend to check out. Notice what never happened: nobody wrote a model solution, and nobody scored any individual step. The only ground truth was the final answer.'
    },
    {
      type: 'diagram',
      nodes: [
        { label: 'Problem', detail: 'A math question with one checkable answer' },
        { label: 'Sample K answers', detail: 'Model writes K attempts with some randomness' },
        { label: 'Score each', detail: 'Verifier marks right or wrong, plus format checks' },
        { label: 'Group-relative advantage', detail: 'Each attempt minus the group average score' },
        { label: 'Update policy', detail: 'Raise likelihood of above-average attempts, lower the rest' }
      ],
      caption: 'One GRPO training step. The group of K samples for a single problem is both the material to learn from and the yardstick it is measured against.'
    },
    {
      type: 'h2',
      text: 'The words behind the loop'
    },
    {
      type: 'p',
      text: 'Before going further, it helps to pin down the vocabulary, because these terms get thrown around loosely. Each one names a specific piece of the loop you just watched.'
    },
    {
      type: 'terms',
      items: [
        { term: 'Policy', def: 'The model being trained, viewed as a thing that takes a problem and produces text. Training changes the policy so it favors reasoning that scores well.' },
        { term: 'Reward and verifier', def: 'The reward is a number saying how good one attempt was. The verifier is what produces it. For math it is often a script that checks the final answer and also checks the output follows the required format.' },
        { term: 'RLVR', def: 'Reinforcement learning with verifiable rewards. The reward comes from an automatic check, like a math answer or a unit test passing, rather than a human rating or a learned scoring model.' },
        { term: 'PPO', def: 'Proximal Policy Optimization, a widely used RL method from 2017. It trains the policy while a second model, the critic, estimates how good the current state is to serve as a baseline.' },
        { term: 'GRPO', def: 'Group Relative Policy Optimization. A variant that removes the critic and instead uses a group of sampled answers to the same problem as the baseline.' },
        { term: 'Group-relative advantage', def: 'For each sampled answer, its reward minus the average reward of its group. Positive means push toward it, negative means push away.' }
      ]
    },
    {
      type: 'h2',
      text: 'What GRPO throws away that PPO kept'
    },
    {
      type: 'p',
      text: 'To see why GRPO is simpler, look at what PPO carries. PPO needs a baseline, a running sense of how much reward to expect, so it can tell whether an outcome was better or worse than normal. Without a baseline the training signal is noisy and pushes on everything. PPO builds that baseline with a second neural network called the critic, roughly the same size as the model itself. The critic has to be trained alongside the policy, which means more memory, more compute, and another moving part that can go wrong.'
    },
    {
      type: 'p',
      text: 'GRPO asks a blunt question: if we are already sampling several answers per problem, why train a whole extra network to guess the baseline when the group of answers can be the baseline? The average reward across the group is a perfectly good stand-in for what to expect on that problem. So GRPO drops the critic entirely. The advantage for each answer becomes its reward minus the group mean, sometimes divided by the group standard deviation to keep the scale steady. That single swap cuts the memory footprint, removes an entire training loop, and takes out a component that was often finicky to get right. You pay for it by needing several samples per problem, but for tasks with cheap automatic checking that trade is usually worth it.'
    },
    {
      type: 'code',
      lang: 'python',
      title: 'Group-relative advantages from a batch of rewards',
      code: `import torch

def group_advantages(rewards, group_size, eps=1e-4):
    # rewards: 1D tensor, laid out as groups of \`group_size\`
    # e.g. 2 problems x 4 samples each -> length 8
    groups = rewards.view(-1, group_size)          # shape: [n_problems, group_size]
    mean = groups.mean(dim=1, keepdim=True)         # baseline per problem
    std = groups.std(dim=1, keepdim=True)           # spread per problem
    advantages = (groups - mean) / (std + eps)      # center, then scale
    return advantages.view(-1)                      # back to flat, aligned with rewards

# One problem, four sampled answers, two of them correct
rewards = torch.tensor([1.0, 0.0, 1.0, 0.0])
print(group_advantages(rewards, group_size=4))
# tensor([ 0.9998, -0.9998,  0.9998, -0.9998])
# correct answers get a positive push, wrong ones a negative push`
    },
    {
      type: 'p',
      text: 'That function is the whole idea in a few lines. Reshape the flat list of rewards so each row is one problem\'s group of samples, subtract the row mean to center them, divide by the row spread to normalize, and flatten back out. The real training code multiplies these advantages against the change in each token\'s probability and adds a term that keeps the updated model from drifting too far from where it started, but the advantage computation you see here is the piece that replaces PPO\'s critic.'
    },
    {
      type: 'h2',
      text: 'Where people trip when they try this'
    },
    {
      type: 'p',
      text: 'The first stumble is trusting a weak verifier. If your check only compares raw text, then a correct answer written as "4 hours" fails against an expected "4" and the model gets punished for being right. Bad reward signal poisons everything downstream, so the checker deserves real care. Many setups add a separate format reward that pays the model for putting its final answer where the verifier can find it, which makes checking reliable and teaches a tidy output habit at the same time.'
    },
    {
      type: 'p',
      text: 'A second trap is reward hacking. If the only thing scored is the final answer, a model can learn to guess the number and skip the reasoning, or to pad its output with tricks that happen to correlate with reward. You catch this by reading actual samples during training, not by watching the reward curve alone. A third issue is groups that are too small or too uniform. If every sample in a group gets the same score, the advantages are all zero and that problem teaches nothing that step, so you want problems at a difficulty where attempts actually disagree.'
    },
    {
      type: 'callout',
      title: 'Why this produced strong reasoners',
      text: 'When the reward is honest and the problems sit at the edge of what the model can do, GRPO rewards longer, more careful reasoning simply because careful reasoning checks out more often. DeepSeek-R1 showed that with enough of this pressure a model starts to reflect, backtrack, and verify its own steps, behaviors nobody hand-coded. They emerged because they raised the odds of a correct, checkable answer.'
    },
    {
      type: 'h2',
      text: 'The one idea to keep'
    },
    {
      type: 'p',
      text: 'If you remember one thing, make it this: GRPO turns a single bit of feedback, right or wrong, into a useful training signal by comparing each attempt to the average of its sibling attempts on the same problem. That comparison is the baseline, which is why no separate critic model is needed, which is why the method is cheaper and easier to run than classic PPO. The catch that makes it all work is a trustworthy automatic verifier. When you have a way to check answers cheaply, whether that is math, code that must pass tests, or any task with a clear right result, this loop lets a model teach itself to reason better from nothing more than its own graded guesses. Start there, get the checker right, and the rest of the machinery is smaller than it looks.'
    },
    {
      type: 'sources',
      items: [
        { title: 'Shao et al., DeepSeekMath: Pushing the Limits of Mathematical Reasoning (GRPO), 2024', url: 'https://arxiv.org/abs/2402.03300' },
        { title: 'DeepSeek-AI, DeepSeek-R1: Incentivizing Reasoning Capability in LLMs via Reinforcement Learning, 2025', url: 'https://arxiv.org/abs/2501.12948' },
        { title: 'Schulman et al., Proximal Policy Optimization Algorithms, 2017', url: 'https://arxiv.org/abs/1707.06347' }
      ]
    }
  ]
};
