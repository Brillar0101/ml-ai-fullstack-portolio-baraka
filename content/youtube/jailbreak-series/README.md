# Jailbreak Series — video scripts

Educational explainer videos on how LLM/VLM **jailbreak attacks** work and how the
matching **defenses** stop them. Every attack episode is framed defensively: we
explain the *mechanism it exploits* and *why it works*, so the defense makes sense.
No working jailbreak payloads — this is understanding, not a how-to.

## Source

Chen, Li, Li, Zhang, Zhang & He, **"Jailbreaking LLMs & VLMs: Mechanisms,
Evaluation, and Unified Defense"** (2026, arXiv:2601.03594). The folder structure
mirrors the paper's Figure 1 taxonomy exactly.

## Style

- **Branch Education visual style** — deep, first-principles, animated: follow one
  concrete example through the system; open the machine and show why it behaves this way.
- **Documentary / media-reporting framing** — measured narration, "here is what
  researchers found," attribute claims to the survey.
- **Runtime:** 3–5 minutes each (~500–750 spoken words).
- **Section markers:** `[HOOK] [INTRO] [SECTION] [TRANSITION] [CTA] [OUTRO]`.
- **Directive (inherited from the series):** define every term inline, in plain
  language, the moment it appears.

## Structure

Each topic is its own folder with a `script.md` and a `screenshots/` folder — drop
reference images (paper figures, diagrams, UI captures) into the matching
`screenshots/` and we wire them into the visual notes.

```
attacks/
  01-template-attack           07-fine-tuning-based-attack
  02-steganography-attack      08-vlm-prompt-image-injection
  03-icl-based-attack          09-vlm-combined-perturbation
  04-adversarial-attack        10-vlm-proxy-model-transfer
  05-rl-based-attack
  06-llm-based-attack
defenses/
  01-llm-prompt-level          04-vlm-response-evaluation
  02-llm-model-level           05-vlm-model-fine-tuning
  03-vlm-prompt-perturbation
```

## Status

- ✅ `attacks/01-template-attack` — full script (style exemplar)
- ✅ `defenses/01-llm-prompt-level` — full script (style exemplar)
- 🟡 all others — stubs with the beat outline, awaiting screenshots + style sign-off

## Attack ↔ defense pairing (for the series arc)

| Attack | Countered mainly by |
|---|---|
| Template, ICL, Steganography | Prompt-level defenses (paraphrase, self-reminder, perplexity filter) |
| Adversarial, RL-based | Model-level defenses (alignment, adversarial training) + perplexity filter |
| LLM-based, Fine-tuning-based | Model-level defenses + response evaluation |
| VLM image injection / perturbation | Prompt-perturbation + response-evaluation defenses |
| VLM proxy-model transfer | Model-fine-tuning defenses |
