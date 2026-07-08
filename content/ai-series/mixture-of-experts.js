export const POST = {
  id: 'mixture-of-experts',
  title: 'Mixture of Experts vs a Dense Transformer: Why Only a Couple of Experts Fire',
  excerpt: 'A dense model runs every parameter for every token. Mixture of Experts keeps a huge pile of parameters around but wakes up only a couple of them per word. Here is how that trick works and where it bites.',
  category: 'AI',
  tags: ['LLMs', 'Mixture of Experts', 'Architecture'],
  readTime: '8 min read',
  body: [
    {
      type: 'p',
      text: "Picture a support team running a chatbot for a bank. Every answer has to come back in about 200 milliseconds, and finance keeps a close eye on the GPU bill. The team wants the bot to feel as sharp as a 70 billion parameter model. They cannot afford to run 70 billion parameters for every single word the model reads and writes. This is the exact corner that Mixture of Experts was built to escape."
    },
    {
      type: 'p',
      text: "A normal Transformer, the kind most people picture when they hear **LLM**, is dense. For each token, it pushes that token through the full stack of weights. Nothing sits idle. If the model holds 70 billion parameters, then answering one word touches roughly 70 billion parameters. Double the parameters and you double the compute per word. Quality and cost rise together, locked in step, and that lockstep is the problem."
    },
    {
      type: 'p',
      text: "Before Mixture of Experts, the only lever you had was size. Want a smarter bot? Add more layers and wider matrices, then watch the per-word cost climb right alongside the quality. For a product with a hard latency budget, that lever runs out fast. You hit a wall where the model you can afford is not the model you want, and the model you want is too slow to ship."
    },
    {
      type: 'h2',
      text: 'Why paying for every neuron on every word is wasteful'
    },
    {
      type: 'p',
      text: "Here is the intuition. When you write an email, you do not use your entire brain equally on every word. The part of you that handles grammar barely stirs for the word \"the,\" while a question about tax law lights up a very different set of memories. A dense network cannot do that. It has one giant block of weights and it runs all of them, always, whether the token is a comma or the start of a hard math proof."
    },
    {
      type: 'p',
      text: "Mixture of Experts asks a simple question: what if we kept many separate blocks of weights, each free to specialize, and picked only the blocks that matter for the token in front of us? You still own all the weights. You just stop paying to run the ones that have nothing to say about the current word. That gap between what you own and what you run is the whole idea."
    },
    {
      type: 'h2',
      text: 'Walking one token through eight small experts'
    },
    {
      type: 'p',
      text: "Take the Mixtral model as a running example. Inside each layer, the usual single feed-forward block is swapped for eight parallel feed-forward blocks. Each of the eight is a full little network in its own right. A small gate sits in front of them. When the token for the word \"balance\" arrives, the gate scores all eight blocks, keeps the two highest scorers, and ignores the other six. The token flows only through those two. Their outputs get blended by weight, and the layer moves on."
    },
    {
      type: 'p',
      text: "Now the arithmetic. Mixtral holds around 47 billion parameters in total across all eight experts and the shared layers. But any one token only ever visits two experts per layer, so the compute for a single token lands near 13 billion parameters. You store a 47 billion parameter model. You pay compute closer to a 13 billion parameter model. The bank’s bot can be large in knowledge yet cheap in the moment it answers."
    },
    {
      type: 'diagram',
      title: 'One token routed through top-2 of eight experts',
      nodes: [
        { id: 'tok', label: 'Token: "balance"', icon: 'user', at: [0, 1] },
        { id: 'router', label: 'Router / gate', icon: 'service', at: [1, 1] },
        { id: 'e1', label: 'Expert 1 (picked)', icon: 'model', at: [2, 0] },
        { id: 'e2', label: 'Expert 4 (picked)', icon: 'model', at: [2, 2] },
        { id: 'off', label: 'Experts 2,3,5,6,7,8 (idle)', icon: 'model', at: [2, 3] },
        { id: 'sum', label: 'Weighted combine', icon: 'service', at: [3, 1] }
      ],
      edges: [
        { from: 'tok', to: 'router', label: 'hidden vector' },
        { from: 'router', to: 'e1', label: 'score 0.6' },
        { from: 'router', to: 'e2', label: 'score 0.3' },
        { from: 'router', to: 'off', label: 'skipped' },
        { from: 'e1', to: 'sum', label: '' },
        { from: 'e2', to: 'sum', label: '' }
      ],
      caption: 'The router scores all experts but sends the token to only the top two. The rest stay dark for this token and cost nothing to run.'
    },
    {
      type: 'p',
      text: "Notice that a different token can pick a different pair. The word \"the\" a moment later might route to experts 3 and 7. Routing is decided fresh for every token, so over a long sentence the model spreads its work across many experts even though each single word only ever uses two."
    },
    {
      type: 'h2',
      text: 'The words you need before going deeper'
    },
    {
      type: 'terms',
      items: [
        { term: 'Dense model', def: 'A network that runs every parameter for every token. Compute per token scales directly with total size.' },
        { term: 'Expert', def: 'One of the parallel feed-forward sub-networks in an MoE layer. Each can specialize during training.' },
        { term: 'Router (gating network)', def: 'A small learned layer that scores the experts for each token and decides which ones get to process it.' },
        { term: 'Top-k routing', def: 'The rule that keeps only the k highest-scoring experts per token, often k equal to 2 out of 8.' },
        { term: 'Sparse activation', def: 'The property that most experts sit idle for any given token, so only a slice of the model runs at a time.' },
        { term: 'Active vs total parameters', def: 'Total is everything the model stores. Active is the subset that actually runs for one token. In MoE the two numbers are far apart.' },
        { term: 'Load balancing', def: 'Training pressure that keeps tokens spread across all experts instead of piling onto a favored few.' }
      ]
    },
    {
      type: 'h2',
      text: 'Inside the router: how top-2 selection actually runs'
    },
    {
      type: 'p',
      text: "The router is small and it does very little. It takes the token’s hidden vector, multiplies it by one weight matrix, and produces one score per expert. Those scores go through a softmax so they read as weights that sum to one. Then it keeps the top two, renormalizes just those two so they again sum to one, and uses them to blend the two expert outputs. Here is the core of it in a few lines."
    },
    {
      type: 'code',
      lang: 'python',
      title: 'A top-2 router weighting two expert outputs',
      code: `import torch
import torch.nn.functional as F

def moe_layer(x, gate_w, experts, k=2):
    # x: one token vector, shape [d]
    scores = x @ gate_w          # raw score per expert, shape [num_experts]
    top_val, top_idx = scores.topk(k)   # keep the k best experts
    weights = F.softmax(top_val, dim=-1)  # renormalize only the winners

    out = torch.zeros_like(x)
    for w, i in zip(weights, top_idx):
        out = out + w * experts[i](x)   # run ONLY the chosen experts
    return out                          # weighted blend of k expert outputs`
    },
    {
      type: 'p',
      text: "The line that matters is the loop. It runs only the chosen experts. The other six never get called, so their weights never touch the math for this token. That single choice is where the compute savings come from. Everything else in the layer, the attention and the normalization, stays exactly as it is in a dense Transformer."
    },
    {
      type: 'p',
      text: "One thing surprises people when they first read this code. The router does not understand what the experts know. It never inspects their weights or reasons about topics. It is just a learned scoring layer, trained end to end with the rest of the model, that slowly discovers which experts tend to help with which kinds of tokens. Any specialization that shows up, and it often does not map to neat human categories, emerged from gradient descent, not from a rule anyone wrote."
    },
    {
      type: 'h2',
      text: 'When every token wants the same expert'
    },
    {
      type: 'p',
      text: "The obvious failure mode shows up early in training. Suppose experts 1 and 4 get a small head start and produce slightly better outputs. The router learns to send more tokens their way. Those two experts then get more gradient signal, improve faster, and attract even more tokens. The other six starve, barely train, and become dead weight you are still paying to store. This runaway is called expert collapse, and it is the main thing that keeps MoE from working out of the box."
    },
    {
      type: 'p',
      text: "The fix is an extra term in the loss that punishes imbalance. During training the model tracks how many tokens each expert received and how much routing weight it got. If a handful of experts hog the traffic, the auxiliary load-balancing loss rises and nudges the router to spread tokens more evenly. Switch Transformers made this term simple and cheap, which is a big reason MoE became practical at scale. Without it, a model with eight experts can behave like a model with two."
    },
    {
      type: 'callout',
      title: 'The mistake people make reading the numbers',
      text: "Seeing \"47 billion parameters\" and assuming the inference cost of a 47 billion parameter dense model. The right number to look at for speed and GPU compute is the active count, near 13 billion for Mixtral. The right number to look at for memory is the total, the full 47 billion. They answer different questions."
    },
    {
      type: 'p',
      text: "In practice teams tune the auxiliary loss weight carefully. Push it too hard and the router is forced to spread tokens so evenly that experts cannot specialize, which drags quality down. Leave it too soft and collapse creeps back in. The sweet spot gives you balanced traffic while still letting each expert lean toward its own strengths."
    },
    {
      type: 'h2',
      text: 'The VRAM bill you still have to pay'
    },
    {
      type: 'p',
      text: "There is a catch that trips up teams planning a deployment. Even though only two experts run per token, all eight have to sit in GPU memory, ready. You never know in advance which expert the next token will demand, and a single batch of many tokens will scatter across all of them anyway. So your VRAM footprint tracks the total parameter count, not the active one. Mixtral needs memory for the whole 47 billion even while it computes like a 13 billion parameter model."
    },
    {
      type: 'p',
      text: "This flips the usual tradeoff on its head. MoE buys you cheaper compute and faster tokens, and it pays for that with a large memory reservation. If your constraint is latency and throughput on a machine that already has plenty of VRAM, MoE is a strong fit. If your constraint is fitting a model onto a small card, a dense model of the active size is often the saner choice, because it needs to store only what it runs."
    },
    {
      type: 'h2',
      text: 'What to remember when you see a big parameter count'
    },
    {
      type: 'p',
      text: "Mixture of Experts breaks the old link between model size and per-word cost. A dense network runs all of itself on every token, so knowledge and compute grow together. An MoE network keeps many experts on hand, routes each token to only the top few, and so grows its knowledge while holding its per-token compute roughly flat. The price is a load-balancing headache during training and a memory bill sized to the full model. Next time you read that a model has tens of billions of parameters, ask a second question right away: how many of them actually fire per token? For an MoE model, that smaller number is the one that sets your speed."
    },
    {
      type: 'sources',
      items: [
        { title: 'Shazeer et al., Outrageously Large Neural Networks: The Sparsely-Gated Mixture-of-Experts Layer (2017)', url: 'https://arxiv.org/abs/1701.06538' },
        { title: 'Fedus et al., Switch Transformers: Scaling to Trillion Parameter Models with Simple and Efficient Sparsity (2021)', url: 'https://arxiv.org/abs/2101.03961' },
        { title: 'Jiang et al., Mixtral of Experts (2024)', url: 'https://arxiv.org/abs/2401.04088' }
      ]
    }
  ]
};
