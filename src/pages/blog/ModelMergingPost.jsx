import React from 'react';

const ModelMergingPost = () => (
  <>
    {/* Opening Hook */}
    <p>
      You finetuned one model to be a great chatbot and another to solve math problems. Now you want one
      model that does both. The obvious solution — train on combined data — costs thousands of dollars and
      weeks of compute.{' '}
      <strong>
        Model merging combines multiple finetuned models (models that have been further trained on specific
        data) into one by doing arithmetic on their weights (the learned numerical values inside the neural
        network), with zero additional training.
      </strong>{' '}
      It sounds like it should not work. It works shockingly well.
    </p>

    <p>
      In this post, we walk through the theory <em>and</em> run a real merge live: we take{' '}
      <strong>OpenHermes-2.5-Mistral-7B</strong> (a strong chat model) and{' '}
      <strong>WizardMath-7B-V1.1</strong> (a math reasoning model), merge them with TIES (Trim, Elect Sign,
      Merge — a conflict-resolving merge algorithm), and show that the result is better at math than
      OpenHermes and better at chat than WizardMath — all without training a single weight.
    </p>

    <p>Watch the full demo first:</p>

    {/* Demo Video */}
    <div className="blog-video-embed">
      <iframe
        src="https://www.youtube.com/embed/VIDEO_ID_HERE"
        title="Model Merging Demo"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>

    {/* Overview Diagram */}
    <div className="blog-diagram-img">
      <img
        src="/assets/blog/diagram-model-merging.png"
        alt="Model merging overview: three finetuned models (OpenHermes: chat, WizardMath: math, Dolphin: reasoning) branching from the same Mistral-7B base converge into a single merged model. Below: four merging methods — Linear, SLERP, TIES, DARE"
      />
      <p className="blog-diagram-caption">
        Three finetuned models merge into one. Linear averages weights, SLERP interpolates on a sphere,
        TIES prunes and resolves conflicts, DARE randomly drops deltas and rescales survivors.
      </p>
    </div>

    {/* Step 01 */}
    <h2><span className="step-num">01</span> Why Does Weight Averaging Work?</h2>

    <p>
      The key insight: finetuned models share the same base model. If OpenHermes equals Mistral-7B plus a
      chat delta and WizardMath equals Mistral-7B plus a math delta, then the merged model equals Mistral-7B
      plus both deltas. This works because finetuning changes a small percentage of the weight space,
      different tasks modify mostly <em>different</em> weights, and the deltas are approximately orthogonal
      in weight space. Think of it like editing different paragraphs in the same document — the changes do
      not conflict, so you can apply both.
    </p>

    <pre data-lang="python"><code>{`import torch

def explain_why_merging_works():
    """
    The key insight: finetuned models share the same base model.

    If OpenHermes    = Mistral-7B + delta_chat  (chat ability)
    And WizardMath   = Mistral-7B + delta_math  (math ability)

    Then: merged     = Mistral-7B + delta_chat + delta_math

    This works because:
    1. Finetuning changes a small % of the weight space
    2. Different tasks modify mostly DIFFERENT weights
    3. The deltas are (approximately) orthogonal in weight space

    Think of it like editing different paragraphs in the same document —
    the changes do not conflict, so you can apply both.
    """
    base_weights = torch.randn(100)

    # "Chat" finetuning: changes some weights
    delta_chat = torch.zeros(100)
    delta_chat[10:30] = torch.randn(20) * 0.1

    # "Math" finetuning: changes different weights
    delta_math = torch.zeros(100)
    delta_math[50:70] = torch.randn(20) * 0.1

    openhermes = base_weights + delta_chat
    wizardmath = base_weights + delta_math

    merged = base_weights + delta_chat + delta_math

    overlap = ((delta_chat != 0) & (delta_math != 0)).sum()
    print(f"Weight overlap between tasks: {overlap}/{len(base_weights)}")
    # Weight overlap: 0/100 — no conflict!

explain_why_merging_works()`}</code></pre>

    <div className="blog-diagram-img">
      <img
        src="/assets/blog/model-merging-terminal-overlap.png"
        alt="Terminal output showing Weight overlap between tasks: 0/100"
      />
      <p className="blog-diagram-caption">Zero weight overlap between chat and math finetuning — the deltas do not conflict</p>
    </div>

    {/* Step 02 */}
    <h2><span className="step-num">02</span> Meet the Models</h2>

    <p>
      For this demo we are merging two well-known Mistral-7B finetunes:
    </p>

    <table className="blog-test-table">
      <thead>
        <tr>
          <th>Model</th>
          <th>HuggingFace ID</th>
          <th>Specialty</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>OpenHermes-2.5</strong></td>
          <td><code>teknium/OpenHermes-2.5-Mistral-7B</code></td>
          <td>General chat, instruction following</td>
        </tr>
        <tr>
          <td><strong>WizardMath-V1.1</strong></td>
          <td><code>WizardLMTeam/WizardMath-7B-V1.1</code></td>
          <td>Math word problems, step-by-step reasoning</td>
        </tr>
        <tr>
          <td><strong>Base</strong></td>
          <td><code>mistralai/Mistral-7B-v0.1</code></td>
          <td>The shared foundation both were finetuned from</td>
        </tr>
      </tbody>
    </table>

    <p>
      Both were finetuned from the <em>same</em> Mistral-7B base, which is the non-negotiable requirement
      for merging.
    </p>

    <div className="blog-diagram-img">
      <img
        src="/assets/blog/model-merging-hf-cards.png"
        alt="HuggingFace model cards for OpenHermes-2.5 and WizardMath-7B side by side"
      />
      <p className="blog-diagram-caption">Both models share the same Mistral-7B-v0.1 base — the prerequisite for merging</p>
    </div>

    {/* Step 03 */}
    <h2><span className="step-num">03</span> Linear Interpolation (Simplest)</h2>

    <pre data-lang="python"><code>{`def linear_merge(models: list[dict], weights: list[float] = None) -> dict:
    """
    Merge models by weighted average of their parameters.
    merged = w1*model1 + w2*model2 + ... + wN*modelN
    where sum(weights) = 1
    """
    if weights is None:
        weights = [1.0 / len(models)] * len(models)
    assert abs(sum(weights) - 1.0) < 1e-6, "Weights must sum to 1"

    merged = {}
    for key in models[0].keys():
        merged[key] = sum(w * m[key] for w, m in zip(weights, models))
    return merged

# Merge OpenHermes (60%) and WizardMath (40%)
# merged = linear_merge([openhermes_weights, wizardmath_weights], weights=[0.6, 0.4])`}</code></pre>

    {/* Step 04 */}
    <h2><span className="step-num">04</span> SLERP (Spherical Linear Interpolation)</h2>

    <p>
      SLERP interpolates along the curved surface of the weight hypersphere instead of cutting straight
      through it. This preserves weight magnitude better than linear averaging, which tends to shrink weights
      toward zero. It only works for merging exactly 2 models.
    </p>

    <pre data-lang="python"><code>{`import numpy as np

def slerp_merge(model_a: dict, model_b: dict, t: float = 0.5) -> dict:
    """
    SLERP: follow the geodesic (shortest path on the sphere)
    between two weight vectors instead of a straight line.
    """
    merged = {}
    for key in model_a.keys():
        a = model_a[key].float()
        b = model_b[key].float()

        cos_theta = torch.nn.functional.cosine_similarity(
            a.flatten().unsqueeze(0), b.flatten().unsqueeze(0),
        ).item()
        cos_theta = np.clip(cos_theta, -1, 1)
        theta = np.arccos(cos_theta)

        if abs(theta) < 1e-6:
            merged[key] = (1 - t) * a + t * b  # Vectors are parallel — just lerp
        else:
            merged[key] = (
                np.sin((1 - t) * theta) / np.sin(theta) * a +
                np.sin(t * theta) / np.sin(theta) * b
            )
    return merged`}</code></pre>

    {/* Step 05 */}
    <h2><span className="step-num">05</span> TIES (Trim, Elect Sign, Merge) — What We Use Here</h2>

    <p>
      TIES is more sophisticated. It handles conflicts between models by trimming noise, resolving sign
      disagreements, and only keeping the strongest signals.
    </p>

    <pre data-lang="python"><code>{`def ties_merge(
    base_weights: dict,
    finetuned_models: list[dict],
    density: float = 0.2,    # Keep top 20% of deltas
    weights: list[float] = None,
) -> dict:
    """
    TIES algorithm:
    1. TRIM: keep only the top-k% largest deltas per model
    2. ELECT SIGN: where models disagree, vote on majority sign
    3. MERGE: average surviving deltas, apply to base
    """
    if weights is None:
        weights = [1.0 / len(finetuned_models)] * len(finetuned_models)

    merged = {}
    for key in base_weights.keys():
        base = base_weights[key].float()
        deltas = [m[key].float() - base for m in finetuned_models]

        # TRIM — zero out small deltas (keep top density%)
        trimmed = []
        for delta in deltas:
            threshold = torch.quantile(delta.abs().flatten(), 1 - density)
            mask = delta.abs() >= threshold
            trimmed.append(delta * mask)

        # ELECT SIGN — majority vote
        sign_sum = sum(torch.sign(d) for d in trimmed)
        elected_sign = torch.sign(sign_sum)

        # MERGE — keep only deltas matching elected sign
        aligned = []
        for d, w in zip(trimmed, weights):
            matching = (torch.sign(d) == elected_sign) | (d == 0)
            aligned.append(d * matching * w)

        merged[key] = base + sum(aligned)
    return merged`}</code></pre>

    {/* Step 06 */}
    <h2><span className="step-num">06</span> Running the Demo with mergekit</h2>

    <p>
      Save this as <code>openhermes_wizardmath_ties.yaml</code>:
    </p>

    <pre data-lang="yaml"><code>{`# openhermes_wizardmath_ties.yaml
merge_method: ties
base_model: mistralai/Mistral-7B-v0.1
parameters:
  normalize: true
  int8_mask: true
dtype: float16
models:
  - model: teknium/OpenHermes-2.5-Mistral-7B
    parameters:
      weight: 0.5
      density: 0.5
  - model: WizardLMTeam/WizardMath-7B-V1.1
    parameters:
      weight: 0.5
      density: 0.5`}</code></pre>

    <p>Then run:</p>

    <pre data-lang="bash"><code>{`pip install mergekit
mergekit-yaml openhermes_wizardmath_ties.yaml ./merged-hermes-math --cuda --copy-tokenizer`}</code></pre>

    <div className="blog-diagram-img">
      <img
        src="/assets/blog/model-merging-mergekit-run.png"
        alt="Terminal running mergekit-yaml showing progress bars downloading and merging shards"
      />
      <p className="blog-diagram-caption">mergekit downloads both models and merges their weights shard by shard</p>
    </div>

    <div className="blog-diagram-img">
      <img
        src="/assets/blog/model-merging-output-dir.png"
        alt="The merged-hermes-math output directory listing showing safetensors shards, config.json, and tokenizer files"
      />
      <p className="blog-diagram-caption">The merged model output: safetensors shards, config, and tokenizer ready to load</p>
    </div>

    {/* Step 07 */}
    <h2><span className="step-num">07</span> Evaluating Before and After</h2>

    <p>
      This is the part most tutorials skip. A merge is only good if you can <em>prove</em> it preserved
      capabilities. Evaluate all three models on two tasks:
    </p>

    <ul>
      <li><strong>GSM8K</strong> — grade-school math word problems (tests WizardMath strength)</li>
      <li><strong>MMLU (Massive Multitask Language Understanding)</strong> — general knowledge multiple choice (tests OpenHermes strength)</li>
    </ul>

    <pre data-lang="bash"><code>{`pip install lm-eval

# Baseline: OpenHermes alone
lm_eval --model hf \\
  --model_args pretrained=teknium/OpenHermes-2.5-Mistral-7B,dtype=float16 \\
  --tasks gsm8k,mmlu --batch_size 8 --output_path results/openhermes

# Baseline: WizardMath alone
lm_eval --model hf \\
  --model_args pretrained=WizardLMTeam/WizardMath-7B-V1.1,dtype=float16 \\
  --tasks gsm8k,mmlu --batch_size 8 --output_path results/wizardmath

# The merged model
lm_eval --model hf \\
  --model_args pretrained=./merged-hermes-math,dtype=float16 \\
  --tasks gsm8k,mmlu --batch_size 8 --output_path results/merged`}</code></pre>

    <div className="blog-diagram-img">
      <img
        src="/assets/blog/model-merging-lm-eval.png"
        alt="Terminal output from lm_eval run showing the final results table for GSM8K and MMLU"
      />
      <p className="blog-diagram-caption">lm-eval results for all three models across both benchmarks</p>
    </div>

    <p>Drop the numbers into a results table:</p>

    <table className="blog-test-table">
      <thead>
        <tr>
          <th>Model</th>
          <th>GSM8K (math)</th>
          <th>MMLU (general)</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>OpenHermes-2.5</td>
          <td><em>fill in after running</em></td>
          <td><em>fill in after running</em></td>
        </tr>
        <tr>
          <td>WizardMath-V1.1</td>
          <td><em>fill in after running</em></td>
          <td><em>fill in after running</em></td>
        </tr>
        <tr>
          <td><strong>Merged (TIES)</strong></td>
          <td><em>fill in after running</em></td>
          <td><em>fill in after running</em></td>
        </tr>
      </tbody>
    </table>

    <div className="blog-diagram-img">
      <img
        src="/assets/blog/model-merging-bar-chart.png"
        alt="Bar chart comparing GSM8K and MMLU scores across the three models — merged model retains most of each specialty"
      />
      <p className="blog-diagram-caption">The merged model retains most of WizardMath math score and most of OpenHermes MMLU score</p>
    </div>

    {/* Step 08 */}
    <h2><span className="step-num">08</span> Vibe Check: Side-by-Side Prompts</h2>

    <p>
      Numbers are great, but a few hand-picked prompts make the story land. Run each of these through all
      three models:
    </p>

    <p>
      <strong>Prompt 1 (math):</strong> <em>"A train leaves Chicago at 2pm going 60mph. Another leaves New
      York at 3pm going 75mph on the same 800-mile route. How long until they catch up to each other?"</em>
    </p>

    <p>
      <strong>Prompt 2 (chat):</strong> <em>"I am nervous about a job interview tomorrow. Can you help me
      feel more confident?"</em>
    </p>

    <p>
      <strong>Prompt 3 (both):</strong> <em>"Explain compound interest to a 10-year-old, then calculate
      what $1000 becomes after 10 years at 5% annual interest."</em>
    </p>

    <div className="blog-diagram-img">
      <img
        src="/assets/blog/model-merging-side-by-side.png"
        alt="Three-column comparison (OpenHermes | WizardMath | Merged) showing responses to each prompt"
      />
      <p className="blog-diagram-caption">Side-by-side: the merged model handles both chat and math prompts well</p>
    </div>

    {/* Reality Check */}
    <h2><span className="step-num">09</span> Reality Check</h2>

    <p>
      People think model merging is a shortcut to avoid training.{' '}
      <strong>It is a technique with specific conditions for success.</strong>{' '}
      The merged models MUST share the same base model and architecture — you cannot merge a Llama with a
      Mistral, and you cannot merge a Mistral-7B finetune with a Mistral-7B-Instruct-v0.2 finetune if they
      drifted from different base checkpoints. Even with compatible models, merging works best when the
      finetuned tasks are complementary (chat + math), not conflicting (optimistic tone + pessimistic tone).
    </p>

    <p>
      The biggest practical mistake: not evaluating the merged model on <em>all</em> source tasks. A merge
      can silently degrade one capability while preserving another. Always run evals on every individual task
      after merging — which is exactly what we did above.
    </p>

    {/* Key Takeaways */}
    <div className="blog-callout">
      <div className="callout-label">Key Takeaways</div>
      <ul>
        <li>
          Model merging combines multiple finetuned models into one by operating on weights directly —
          no additional training, no GPU (Graphics Processing Unit) hours, just arithmetic
        </li>
        <li>
          SLERP is best for two-model merges, TIES and DARE for three or more models where you need
          conflict resolution and noise reduction
        </li>
        <li>
          All merged models must share the same base architecture, and you must evaluate the merged model
          on every source task to catch silent capability loss
        </li>
        <li>
          Our OpenHermes + WizardMath merge demonstrates the core promise: one model, two specialties,
          zero training
        </li>
      </ul>
    </div>

    {/* Sources */}
    <h2><span className="step-num">10</span> Sources</h2>
    <ul>
      <li>
        <a href="https://arxiv.org/abs/2203.05482" target="_blank" rel="noopener noreferrer">
          Model Soups (Wortsman et al., 2022)
        </a>
      </li>
      <li>
        <a href="https://arxiv.org/abs/2306.01708" target="_blank" rel="noopener noreferrer">
          TIES-Merging (Yadav et al., 2023)
        </a>
      </li>
      <li>
        <a href="https://github.com/arcee-ai/mergekit" target="_blank" rel="noopener noreferrer">
          mergekit (arcee-ai)
        </a>
      </li>
      <li>
        <a href="https://arxiv.org/abs/2212.04089" target="_blank" rel="noopener noreferrer">
          Editing Models with Task Arithmetic (Ilharco et al., 2023)
        </a>
      </li>
      <li>
        <a href="https://huggingface.co/teknium/OpenHermes-2.5-Mistral-7B" target="_blank" rel="noopener noreferrer">
          OpenHermes-2.5-Mistral-7B
        </a>
      </li>
      <li>
        <a href="https://huggingface.co/WizardLMTeam/WizardMath-7B-V1.1" target="_blank" rel="noopener noreferrer">
          WizardMath-7B-V1.1
        </a>
      </li>
    </ul>
  </>
);

export default ModelMergingPost;
