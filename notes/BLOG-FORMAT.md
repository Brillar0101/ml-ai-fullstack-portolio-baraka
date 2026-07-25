# The blog format

How every post in the AI Engineering series is built, and why. Derived from
reading-behaviour research rather than taste, so the rules below can be argued
with on evidence.

## The three findings this format is built on

1. **Readers scan.** Nielsen Norman Group's eyetracking found 79% of users
   always scan a new page and only 16% read word-by-word, and that given
   average page-view duration a reader has time for at most **28% of the words
   on the page**. Scanning follows recognisable shapes: F-pattern, spotted,
   layer-cake, commitment.
   <https://www.nngroup.com/articles/how-users-read-on-the-web/>

2. **Words plus pictures beat words alone.** The multimedia principle, plus
   segmentation into bite-sized parts and multiple representations of one idea.
   <https://distill.pub/2020/communicating-with-interactive-articles/>

3. **Interactivity is the weakest of the three.** The same Distill article
   admits "there is limited empirical evaluation of the effectiveness of
   interactive articles" and cites NYT data that only a fraction of readers
   touch non-static content. Their own conclusion: "not everything needs to be
   interactive." The format that actually carried introductory AI content to
   Stanford, Harvard and MIT syllabuses was static step-by-step diagrams
   (Alammar, *The Illustrated Transformer*).

The order matters. **Diagram first, prose second, interactivity last.**

## Hard rules

### Structure

- **No paragraph over 5 sentences.** A reader covering 28% of the words needs
  entry points. Long paragraphs are skipped whole, not read slowly.
- **One bold phrase per substantive paragraph, never more.** Spotted-pattern
  scanners jump between bold islands. Several per paragraph destroys the path.
- **Headings are the navigation.** Front-load the important words: a heading is
  read out of context in the jump list. Posts with 4+ h2s get an automatic
  in-post table of contents.
- **First sentence of every section carries the point.** Layer-cake scanners
  read headings and first lines only. If the first line is a warm-up, they get
  nothing.

### Every post carries a visual

Not optional. A post that is prose plus a terms list is the weakest thing the
series can publish, because it opts out of the multimedia principle entirely.
Pick by what the concept *is*:

| The concept is | Use | Renderer |
|---|---|---|
| a pipeline, stages, data flow | `diagram` with `nodes` | FlowDiagram |
| layers stacked on each other | `diagram` with `rows` | FlowDiagram |
| a choice with branches | `diagram` with `root` | SketchTreeDiagram |
| components and traffic between them | `diagram` with `edges` | ArchDiagram |
| a comparison of magnitudes | `chart` | BarChart / LineChart |
| something computational | `lab` | PythonLab |
| real document or model output | `image` | figure |

A diagram replaces the paragraph of "first this, then that" prose. Do not keep
both.

### Interactivity, where it earns its place

- A lab is for a concept you can *compute*. If the idea is structural, a diagram
  teaches it better and costs the reader nothing.
- **The static path must be complete.** A reader who never presses Run must
  still get the whole argument. The lab deepens; it never carries.
- Every lab ends with a **"Try it:"** line naming one knob and what it changes.
  This is the one interactive pattern with real backing: it is a
  predict-before-reveal prompt, and self-explanation improves recall.
- Labs use honest stand-ins, clearly labelled, and print real output.

### Evidence

- **5+ verified sources per post**, every URL checked, every arXiv title matched
  against the API. Enforced by `scripts/verify-sources.mjs`.
- **Defined terms link out** to a paper, spec, or neutral reference.
- **Inline `[text](url)`** on the specific claims a sceptical reader would want
  to check, used sparingly. A link in every clause stops being prose.
- **Never invent.** No fabricated anecdote told as fact, no invented
  measurement, no claimed personal experience that did not happen. A composite
  scenario is fine and must announce itself: "Picture...", "Suppose...".
- Empirical claims about model behaviour need a real run behind them.

### Voice

- No em dashes or en dashes. Straight quotes only.
- No AI-vocabulary filler, negative parallelisms ("not just X, it's Y"),
  rule-of-three padding, or generic upbeat conclusions.
- Vary sentence length. Short sentences carry weight; a run of them reads as
  manufactured drama.

## The teaching spine

Required beats, in order of first appearance. These are the *order of ideas*,
never literal headings.

1. **Scenario** — a concrete situation, a real cited incident where one exists.
2. **Plain-language intuition** — the whole idea with zero new terms.
3. **Walk the example** — trace the mechanism through the concrete case.
4. **Name the terms** — a `terms` block, each linked to its source.
5. **The mechanism** — the actual algorithm or fix, plus the tradeoff.
6. **What to take away** — when to reach for this, and the one thing to remember.

Optional, chosen per concept: diagram, lab, common-mistakes beat, second case
study, callout, sources (always last).

## The shape rule

No two consecutive posts should share a skeleton. The spine fixes the order of
ideas, not the surface. Vary which optional beats appear, where the visual
lands, and how sections are headed. A reader flipping through should never feel
a template.

Two failure modes, both of which this series has actually hit:

- 37 posts of `p + h2 + terms` with no visual at all.
- 34 posts of the identical `callout + diagram + lab + terms + ul` skeleton.

Monotony in either direction is the same bug.

## Before publishing

`npm run verify` runs the gate tests, executes every lab, checks every source
URL and term link, and prints what is publishing versus held back.

A post ships only if it clears `src/lib/publishGate.js`: 5+ sourced references,
900+ words, no unsourced citation, no empty lab. Anything short is held back as
a draft rather than published thin. Better to publish nothing than something
that cannot be checked.
