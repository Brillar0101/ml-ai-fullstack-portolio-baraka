# Writing technical blogs

> The rules live in the `technical-blog` skill
> (`~/.claude/skills/technical-blog/SKILL.md`), so they apply automatically when
> writing rather than sitting in a file nobody opens. This document keeps only
> what is specific to *this site*: the block types, the renderers, and the
> publish gate.
>
> The skill deliberately does not prescribe a structure. Shapes are offered as
> things to recognise, not templates to fill.

## Block types available on this site

Declared as data in a post body; no JSX or SVG is written by hand.

| The concept is | Block | Renderer |
|---|---|---|
| a pipeline, stages, data flow | `diagram` with `nodes` | FlowDiagram |
| layers stacked on each other | `diagram` with `rows` | FlowDiagram |
| a choice with branches | `diagram` with `root` | SketchTreeDiagram |
| components and traffic | `diagram` with `edges` | ArchDiagram |
| a comparison of magnitudes | `chart` | BarChart / LineChart |
| something computational | `lab` | PythonLab |
| a trade-off with one knob | `explorer` | Explorer |
| real document or model output | `image` | figure |

Explorer frames are precomputed and committed: see
`scripts/gen-topk-explorer.py` for the pattern. The widget lets a reader drag
the parameter, never invent the numbers.

Renderers live in `src/components/diagrams/`. The block's shape selects one:
`root` gives the decision tree, `edges` the architecture, `nodes`/`rows` the
boxed flow.

## The publish gate

`src/lib/publishGate.js` holds back any post with fewer than 5 sourced
references, under 900 words, an unsourced citation, or an empty lab. Failing
posts become drafts rather than shipping thin.

`npm run verify` runs the gate tests, executes every lab, checks every source
URL and term link, and reports what is publishing versus held back.

**Better to publish nothing than something that cannot be checked.**

## The lab width hook

`scripts/hooks/pre-commit` blocks a commit whose staged lab lines would wrap on
a phone. Git does not version hooks, so install it once per clone:

```bash
cp scripts/hooks/pre-commit .git/hooks/pre-commit && chmod +x .git/hooks/pre-commit
```

It checks only the labs you staged, deliberately. An earlier version checked all
33 and blocked every commit against a backlog of 187 lines, which is a check
that gets switched off rather than obeyed.
