import React from 'react';
import { Link } from 'react-router-dom';
import PythonLab from '../../components/labs/PythonLab';

const PROBE = `import numpy as np

tokens = ["blue","orange","red","purple","gray","pink","gold","green","black","crimson"]
logits = np.array([3.2, 2.6, 2.3, 1.9, 1.6, 1.2, 0.9, 0.4, 0.1, -0.3])

def softmax(z, temperature=1.0):
    z = z / max(temperature, 1e-6)
    z = z - z.max()
    e = np.exp(z)
    return e / e.sum()

for T in [0.2, 0.7, 1.5]:
    p = softmax(logits, T)
    top = tokens[int(p.argmax())]
    print(f"temp {T:>4}:  best='{top}'  P(best)={p.max():.2f}  P(crimson)={p[-1]:.4f}")`;

const SamplingPost = () => (
  <>
    <p>
      People talk about a language model "choosing" a word, which makes it sound like the model has
      an opinion. It does not. At each step the model produces a score for every token it knows,
      and then a sampler turns those scores into one pick. If you understand the sampler, a lot of
      strange model behavior stops being mysterious.
    </p>

    <p>
      There are three numbers that decide how that pick happens: <strong>temperature</strong>,{' '}
      <strong>top-k</strong>, and <strong>top-p</strong>. They are the difference between a model
      that sounds flat and safe and one that sounds loose and inventive. Same weights, same prompt,
      completely different output.
    </p>

    <h2>From scores to probabilities</h2>
    <p>
      The raw scores are called logits. To turn them into probabilities you run them through
      softmax, which exponentiates each score and divides by the total so everything adds up to one.
      Temperature is a single divisor you apply before that step. Divide by a small number and the
      gap between the top score and the rest grows, so the model almost always takes its favorite.
      Divide by a large number and the scores flatten toward each other, so unlikely words get a
      real chance.
    </p>

    <p>Run this and watch the same logits behave at three temperatures:</p>

    <PythonLab code={PROBE} packages={['numpy']} height={300} />

    <p>
      At temperature 0.2 the top word is a near certainty and the long-shot word is basically
      impossible. At 1.5 the field opens up. Nothing about the model changed. Only the divisor did.
    </p>

    <h2>top-k and top-p decide who is even allowed</h2>
    <p>
      Temperature reshapes the odds, but it never removes a word entirely, so there is always a tiny
      chance of something absurd. top-k fixes that by keeping only the k highest words and throwing
      the rest away before sampling. top-p does the same job but smarter: instead of a fixed count it
      keeps the smallest group of words whose probabilities add up to p. When the model is confident,
      that group is tiny. When it is unsure, the group grows. That is why top-p tends to read better
      than a fixed top-k.
    </p>

    <h2>See it move</h2>
    <p>
      Reading about this only gets you so far. The interactive version of this post lets you drag the
      three knobs and watch the distribution reshape in real time, then sample from it and run the
      same NumPy in your browser.
    </p>

    <p>
      <Link to="/demos/sampling" className="blog-cta-link">Open the interactive lab →</Link>
    </p>

    <h2>The practical version</h2>
    <p>
      For most applications you do not crank a single knob to its extreme. A moderate temperature
      around 0.7 with top-p around 0.9 is a sane default: confident where the model is confident,
      varied where it is not. Drop the temperature toward 0 when you want determinism, like extracting
      a field from a document. Raise it when you want range, like brainstorming. Once you have felt
      how the three numbers trade off, you will reach for them on purpose instead of copying whatever
      was in the last code sample.
    </p>
  </>
);

export default SamplingPost;
