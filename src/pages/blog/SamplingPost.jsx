import React from 'react';
import { Link } from 'react-router-dom';
import PythonLab from '../../components/labs/PythonLab';

const PROBE = `import numpy as np

# A list of candidate next words and a raw score for each one.
words  = ["blue","orange","red","purple","gray","pink","gold","green","black","crimson"]
scores = np.array([3.2, 2.6, 2.3, 1.9, 1.6, 1.2, 0.9, 0.4, 0.1, -0.3])

def to_probabilities(scores, temperature=1.0):
    # softmax: exponentiate, then divide by the total so it all adds up to 1.
    s = scores / max(temperature, 1e-6)
    s = s - s.max()
    e = np.exp(s)
    return e / e.sum()

for T in [0.2, 0.7, 1.5]:
    p = to_probabilities(scores, T)
    best = words[int(p.argmax())]
    print(f"temperature {T:>4}:  favorite='{best}'  P(favorite)={p.max():.2f}  P('crimson')={p[-1]:.4f}")`;

const SamplingPost = () => (
  <>
    {/* 1. The question */}
    <p>
      Ask the same chatbot the same question twice and you can get two different answers. Nothing
      about the model changed between the two tries. So where does the variety come from? The answer
      is a small step at the very end called sampling, and once you see it, a lot of confusing model
      behavior starts to make sense.
    </p>

    {/* 2. Plain-language intuition, no jargon yet */}
    <p>
      Here is the whole idea in plain terms. When a model writes, it does not decide on a word. It
      lays out every word it knows and gives each one a number for how well it would fit next. Then
      it reaches into that pile and picks one, favoring the words with higher numbers but not always
      taking the highest. How greedy or how adventurous that pick is comes down to a few settings you
      control. Turn one way and it always grabs its top choice, which sounds safe and a little robotic.
      Turn the other way and it gives long shots a real chance, which sounds creative or, pushed too
      far, like nonsense.
    </p>

    {/* 3. Define the terms */}
    <h2>The words for the parts</h2>
    <p>Four terms cover everything below. Each one is simpler than it sounds.</p>
    <ul>
      <li><strong>Token</strong>: the unit a model reads and writes. Roughly a word or a word-piece. Treat it as "word" here and you lose nothing.</li>
      <li><strong>Logit</strong>: the raw score the model assigns to each candidate token before anything is normalized. Higher means "fits better." It can even be negative.</li>
      <li><strong>Softmax</strong>: the function that turns a list of logits into probabilities that add up to 1, so you can actually sample from them. It exaggerates the gaps a little, so a small lead in logits becomes a bigger lead in probability.</li>
      <li><strong>Sampling</strong>: drawing one token at random from those probabilities. A 60% token gets picked about 60% of the time, not always.</li>
    </ul>

    {/* 4. The mechanism */}
    <h2>The mechanism: three knobs</h2>
    <p>
      With those terms in hand, the three controls are easy. <strong>Temperature</strong> is a single
      number you divide the logits by before softmax. Divide by something small and the gaps between
      logits grow, so the favorite dominates and the model plays it safe. Divide by something large and
      the logits flatten toward each other, so unlikely tokens get a real shot.
    </p>

    <p>Run this to watch the same scores behave at three temperatures:</p>

    <PythonLab code={PROBE} packages={['numpy']} height={320} />

    <p>
      At temperature 0.2 the favorite is a near certainty and the long shot is basically impossible.
      At 1.5 the field opens up. Same scores, different divisor.
    </p>

    <p>
      Temperature reshapes the odds but never deletes a word, so there is always a tiny chance of
      something absurd. The other two knobs fix that by limiting who is even allowed to be picked.
      <strong> top-k</strong> keeps only the k highest tokens and drops the rest. <strong>top-p</strong>
      does the same job more cleverly: it keeps the smallest group of tokens whose probabilities add up
      to p. When the model is confident, that group is tiny. When it is unsure, the group grows. That
      adaptiveness is why top-p usually reads better than a fixed top-k.
    </p>

    {/* 5. Do it */}
    <h2>Feel it move</h2>
    <p>
      Numbers on a page only go so far. The interactive version of this post lets you drag all three
      knobs and watch the probabilities reshape live, then sample from them and run the same NumPy in
      your browser.
    </p>
    <p>
      <Link to="/demos/sampling" className="blog-cta-link">Open the interactive lab →</Link>
    </p>

    {/* 6. Takeaway */}
    <h2>What to remember</h2>
    <p>
      For most real applications you do not push any single knob to its extreme. A temperature around
      0.7 with top-p around 0.9 is a sane default: confident where the model is confident, varied where
      it is not. Drop the temperature toward 0 when you want the same answer every time, like pulling a
      field out of a document. Raise it when you want range, like brainstorming names. The point is to
      reach for these on purpose, instead of copying whatever was in the last code sample you saw.
    </p>
  </>
);

export default SamplingPost;
