# Writing technical blogs

The authoring system for this site. Replaces the earlier draft of this file.

Every rule here traces to evidence about how people actually read, or to what
the technical blogs that earned lasting audiences actually do. Where the
evidence is thin, that is stated so you can argue with the rule instead of
obeying it.

---

## Part 1. What the evidence says

Four findings, in the order they should influence a decision.

**1. Readers scan. 28% of the words is the ceiling.**
Nielsen Norman Group's eyetracking found 79% of users always scan a new page
and only 16% read word-by-word. Given average page-view duration, a reader has
time for at most 28% of the words present. Scanning follows recognisable
shapes: F-pattern, spotted, layer-cake, commitment.
<https://www.nngroup.com/articles/how-users-read-on-the-web/>

Consequence: your headings, first sentences and bold phrases are not
decoration. They are the version of the post most people will read.

**2. Words plus pictures beat words alone.**
The multimedia principle, plus segmentation into bite-sized parts and multiple
representations of one idea.
<https://distill.pub/2020/communicating-with-interactive-articles/>

**3. Interactivity is the weakest of the three, and its advocates say so.**
The same Distill article admits "there is limited empirical evaluation of the
effectiveness of interactive articles" and cites NYT data that only a fraction
of readers touch non-static content. Their own conclusion: "not everything
needs to be interactive." Meanwhile the format that actually carried
introductory AI content into Stanford, Harvard and MIT syllabuses was static
step-by-step diagrams (Alammar, *The Illustrated Transformer*).
<https://jalammar.github.io/illustrated-transformer/>

**Order of investment: diagram first, prose second, interactivity last.**

**4. What long-lived technical blogs have in common.**
From practitioners who have sustained one
(<https://notes.eatonphil.com/2024-04-10-what-makes-a-great-tech-blog.html>):
tackle genuinely hard topics; include complete working code, not fragments;
simplify without becoming reductive; publish on a consistent cadence;
acknowledge limitations and downsides, because that is what builds trust; keep
a professional tone, since slang and sarcasm alienate readers who are not
native English speakers.

**The counterweight.** Distill, the flagship of this entire format, shut down
in 2021 after five years, largely from burnout. The labour is real and it is
what they named [research debt](https://distill.pub/2017/research-debt/): the
interpretive work of making something clear. Scope accordingly. A format you
cannot sustain is worse than a simpler one you can.

---

## Part 2. Pick an archetype before you write

Most bad drafts are a good post fighting the wrong shape. Choose one, and let
it dictate the sections.

### A. Concept explainer
*"What is X, and why should I care?"* The default for introductory content.

Reader leaves knowing: what it is, why it exists, when it applies.

```
scenario            a concrete situation, real and cited where one exists
intuition           the whole idea, zero new terms
walk the example    trace the mechanism through that one case
terms               name the parts, each linked to a source
mechanism           the actual algorithm or fix, plus the tradeoff
where it breaks     the failure modes
takeaway            when to reach for it, and the one thing to remember
```
Visual: a flow or a decision tree. Interactivity: only if computational.

### B. Mechanism teardown
*"How does X actually work under the hood?"* Where "tackle hard topics" lives.

Reader leaves able to reason about behaviour they could previously only observe.

```
the observable      the surface behaviour everyone has noticed
the question        why that behaviour is surprising
first principles    the smallest true model that explains it
build it up         add one layer at a time, each earning its place
now re-explain      return to the observable, now obvious
limits              where this model stops being accurate
```
Visual: architecture diagram, or a sequence. Strong candidate for a lab.

### C. Decision guide
*"Should I use X or Y?"* The most useful and most-skipped archetype.

Reader leaves able to make the call for their own situation.

```
the argument        the disagreement, stated fairly from both sides
the wrong question  why "which is better" has no answer
the right question  the property that actually decides it
each option         what it is genuinely good at
the decision        a tree or table keyed to reader circumstances
when to revisit     what would change the answer later
```
Visual: a decision tree, always. This archetype is a tree in prose form.

### D. Failure study
*"This broke, here is why."* The highest-trust archetype, and the most
dangerous to fake.

Reader leaves with a failure mode they can now recognise.

```
the incident        what happened, sourced if real, marked if illustrative
why it was possible the structural condition, not the proximate mistake
the mechanism       how the failure actually propagated
the fix             what changes, and what it costs
the general lesson  the class of system this applies to
```
**Never invent an incident.** If you have no real one, use an explicitly
hypothetical scenario and say so in the first sentence.

### E. Build-along
*"Let's build a small version."* Where "complete working code" belongs.

Reader leaves having run something that works.

```
what we are building   the finished thing, shown first
the shape              the design before any code
build in stages        each stage runs and does something visible
the interesting part   where the real difficulty was
what we skipped        honest scope boundaries
```
Visual: the running output. Interactivity: mandatory, this is the archetype
that earns it.

### F. Measurement post
*"I measured X, here are the numbers."* Rare and valuable. Requires real data.

```
the claim under test   what is commonly asserted
how it was measured    method, in enough detail to reproduce
the numbers            actual output, quoted verbatim
what surprised me      the finding that contradicted expectation
caveats                sample size, conditions, what this does not show
```
**Every number must come from a run you actually did.** No exceptions.
Visual: a chart. This is the one archetype where a chart beats a diagram.

---

## Part 3. Rules that apply to every archetype

### Structure (from finding 1)

- **No paragraph over five sentences.** Long blocks are skipped whole, not read
  slowly.
- **First sentence of every section carries the point.** Layer-cake scanners
  read headings and opening lines only. A warm-up sentence gives them nothing.
- **Headings are read out of context** in the jump list. Front-load the
  meaningful words: "The scorer ladder" not "Some thoughts on scoring".
- **One bold phrase per substantive paragraph, never more.** Spotted-pattern
  scanners jump between bold islands; several per paragraph destroys the path.
- **Length is set by the concept, never by a quota.** If thirty consecutive
  posts land within a few hundred words of each other, that is a quota, and it
  shows.

### Every post carries a visual (from finding 2)

Prose plus a terms list opts out of the multimedia principle entirely. Pick by
what the concept *is*:

| The concept is | Block | Renderer |
|---|---|---|
| a pipeline, stages, data flow | `diagram` with `nodes` | FlowDiagram |
| layers stacked on each other | `diagram` with `rows` | FlowDiagram |
| a choice with branches | `diagram` with `root` | SketchTreeDiagram |
| components and traffic | `diagram` with `edges` | ArchDiagram |
| a comparison of magnitudes | `chart` | BarChart / LineChart |
| something computational | `lab` | PythonLab |
| real document or model output | `image` | figure |

A diagram replaces the paragraph of "first this, then that". Do not keep both.

### Code and interactivity (from findings 3 and 4)

- **Complete and working, not fragments.** A snippet calling three functions
  that do not exist teaches nobody. If it cannot run, it is an illustration and
  should be labelled as one.
- **The static path must be complete.** A reader who never presses Run gets the
  whole argument. The lab deepens; it never carries.
- **Real API surfaces stay real.** When code teaches a third-party API, show
  the true API even though it cannot execute here. Faking it into a runnable
  demo teaches an API that does not exist.
- **Stand-ins are labelled as stand-ins**, in a comment, at the point of use.
- **Every lab ends with `# Try it:`** naming one knob and what changes. This is
  the one interactive pattern with real evidence: a predict-before-reveal
  prompt, and self-explanation improves recall.

### Evidence

- **5+ verified sources per post.** Every URL checked; every arXiv title
  matched against the API. `npm run verify:sources`.
- **Defined terms link out** to a paper, spec, or neutral reference.
- **Inline `[text](url)`** on claims a sceptical reader would want to check.
  Sparingly: a link in every clause stops being prose.
- **Acknowledge the downside.** Every technique has one. A post that presents
  only upside reads as marketing and is treated as such.

### Never invent

- No fabricated anecdote told as fact.
- No invented measurement. A composite scenario may state its own setup and a
  qualitative outcome; it may not report a number as if measured.
- No claimed personal experience that did not happen. "A team I worked with"
  is a factual claim about you.
- A composite scenario announces itself: "Picture...", "Suppose...".
- Empirical claims about model behaviour need a real run behind them.

### Voice

- No em dashes or en dashes. Straight quotes only.
- No AI-vocabulary filler, negative parallelisms ("not just X, it's Y"),
  rule-of-three padding, or generic upbeat conclusions.
- Vary sentence length. A run of short sentences reads as manufactured drama.
- **No slang, memes, sarcasm or ranting.** Much of your audience reads English
  as a second language, and edgy register is where they fall off.

### The shape rule

No two consecutive posts share a skeleton. The archetype fixes the order of
ideas, not the surface. Vary which optional beats appear, where the visual
lands, how sections are headed.

Two failure modes, both of which this series has actually hit:

- 37 posts of `p + h2 + terms` with no visual at all.
- 34 posts of the identical `callout + diagram + lab + terms + ul` skeleton.

Monotony in either direction is the same bug.

---

## Part 4. A worked opening

The archetype is a concept explainer. Watch each rule land.

> Picture a pipeline that reads invoices. Every night a model pulls the vendor,
> date and total out of each one and returns them as JSON, which a script loads
> into a database. It works in testing and runs fine for weeks.
>
> Then one night the job dies at 3am. The cause, found the next morning, is
> almost funny: the model decided to be friendly and answered "Sure! Here is
> the JSON you asked for:" before the actual data. The script tried to parse
> that sentence, threw an error, and the whole batch failed. **One stray
> pleasantry took down the pipeline.**

What it is doing:

- Opens with a concrete situation, not a definition.
- `Picture` marks it as illustrative in the first word. No reader will mistake
  this for a real incident.
- Four sentences, then a break. Neither paragraph exceeds five.
- One bold phrase, at the point the reader should remember.
- No term has been used that a beginner would not know. "Structured output"
  has not appeared yet and will not until the terms beat.
- The failure is specific and slightly funny, which is what makes it stick.

---

## Part 5. Before you publish

Structure
- [ ] Archetype chosen, and the sections match it
- [ ] No paragraph over five sentences
- [ ] Every section's first sentence carries its point
- [ ] Headings make sense read alone, in order
- [ ] One bold phrase per substantive paragraph

Substance
- [ ] Carries a visual, and it is the right shape for the concept
- [ ] Any code is complete and runs, or is labelled as illustration
- [ ] Labs end with a `# Try it:` line
- [ ] The downside or limitation is stated
- [ ] Every term defined before it is leaned on

Honesty
- [ ] Every scenario is either sourced or explicitly marked hypothetical
- [ ] Every number comes from a real run or a cited source
- [ ] No claimed experience that did not happen
- [ ] 5+ verified sources

Mechanics
- [ ] `npm run verify` passes
- [ ] Read it aloud once. Anywhere you stumble, the reader stops.

The gate in `src/lib/publishGate.js` enforces the mechanical subset: 5+ sourced
references, 900+ words, no unsourced citation, no empty lab. Anything short is
held back as a draft rather than published thin.

**Better to publish nothing than something that cannot be checked.**
