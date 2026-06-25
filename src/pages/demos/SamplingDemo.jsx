import React, { useMemo, useState, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Dices } from 'lucide-react';
import PythonLab from '../../components/labs/PythonLab';
import './SamplingDemo.css';

// A frozen "next-token" distribution for the prompt below. These are raw logits,
// the unnormalized scores a model produces before softmax. The demo reshapes
// them live as you change temperature, top-k, and top-p.
const PROMPT = 'The sky turned a deep shade of ___';
const VOCAB = [
  { token: 'blue', logit: 3.2 },
  { token: 'orange', logit: 2.6 },
  { token: 'red', logit: 2.3 },
  { token: 'purple', logit: 1.9 },
  { token: 'gray', logit: 1.6 },
  { token: 'pink', logit: 1.2 },
  { token: 'gold', logit: 0.9 },
  { token: 'green', logit: 0.4 },
  { token: 'black', logit: 0.1 },
  { token: 'crimson', logit: -0.3 },
];

function softmax(logits, temperature) {
  const t = Math.max(temperature, 1e-6);
  const scaled = logits.map((l) => l / t);
  const max = Math.max(...scaled);
  const exps = scaled.map((s) => Math.exp(s - max));
  const sum = exps.reduce((a, b) => a + b, 0);
  return exps.map((e) => e / sum);
}

// Returns the final probability for every vocab item after temperature, then
// top-k, then top-p filtering. Filtered-out tokens get probability 0.
function shapeDistribution(temperature, topK, topP) {
  const base = softmax(VOCAB.map((v) => v.logit), temperature);
  let items = VOCAB.map((v, i) => ({ token: v.token, p: base[i], i }));

  // top-k: keep the k highest-probability tokens
  const byProb = [...items].sort((a, b) => b.p - a.p);
  const keepK = new Set(byProb.slice(0, topK).map((x) => x.i));

  // top-p (nucleus): keep the smallest set whose cumulative prob >= p
  const keepP = new Set();
  let cum = 0;
  for (const x of byProb) {
    keepP.add(x.i);
    cum += x.p;
    if (cum >= topP) break;
  }

  items = items.map((x) => ({ ...x, kept: keepK.has(x.i) && keepP.has(x.i) }));
  const total = items.reduce((s, x) => s + (x.kept ? x.p : 0), 0) || 1;
  return items.map((x) => ({ ...x, p: x.kept ? x.p / total : 0 }));
}

function sampleOnce(dist) {
  const r = Math.random();
  let cum = 0;
  for (const item of dist) {
    cum += item.p;
    if (r <= cum) return item.token;
  }
  const kept = dist.filter((d) => d.p > 0);
  return kept.length ? kept[kept.length - 1].token : dist[0].token;
}

const PY_CODE = `import numpy as np

# Raw logits for the next token after: "${PROMPT}"
tokens = ["blue","orange","red","purple","gray","pink","gold","green","black","crimson"]
logits = np.array([3.2, 2.6, 2.3, 1.9, 1.6, 1.2, 0.9, 0.4, 0.1, -0.3])

def softmax(z, temperature=1.0):
    z = z / max(temperature, 1e-6)
    z = z - z.max()
    e = np.exp(z)
    return e / e.sum()

def top_k(p, k):
    keep = np.argsort(p)[-k:]
    masked = np.zeros_like(p)
    masked[keep] = p[keep]
    return masked / masked.sum()

def top_p(p, thresh):
    order = np.argsort(p)[::-1]
    cum = np.cumsum(p[order])
    cutoff = np.searchsorted(cum, thresh) + 1
    keep = order[:cutoff]
    masked = np.zeros_like(p)
    masked[keep] = p[keep]
    return masked / masked.sum()

# Try changing these three numbers and re-run:
temperature = 0.8
k = 5
nucleus = 0.9

p = softmax(logits, temperature)
p = top_k(p, k)
p = top_p(p, nucleus)

for tok, prob in sorted(zip(tokens, p), key=lambda x: -x[1]):
    if prob > 0:
        bar = "#" * int(prob * 40)
        print(f"{tok:>8}  {prob:5.2f}  {bar}")

# Draw 12 samples from the shaped distribution
draws = np.random.choice(tokens, size=12, p=p)
print("\\nSamples:", ", ".join(draws))`;

export default function SamplingDemo() {
  const [temperature, setTemperature] = useState(0.8);
  const [topK, setTopK] = useState(5);
  const [topP, setTopP] = useState(0.9);
  const [samples, setSamples] = useState([]);

  useEffect(() => { window.scrollTo(0, 0); }, []);

  const dist = useMemo(() => shapeDistribution(temperature, topK, topP), [temperature, topK, topP]);
  const maxP = Math.max(...dist.map((d) => d.p), 0.0001);

  const draw = useCallback((n) => {
    setSamples(Array.from({ length: n }, () => sampleOnce(dist)));
  }, [dist]);

  return (
    <div className="demo-page">
      <div className="demo-container">
        <Link to="/demos" className="demo-back"><ArrowLeft size={16} /> All demos</Link>

        <p className="demo-eyebrow">AI Engineering Lab · Chapter 2</p>
        <h1 className="demo-title">How a model picks the next word</h1>
        <p className="demo-lead">
          A language model does not output a word. It outputs a score for every word it knows,
          and then samples one. Three knobs control how that sampling behaves: temperature, top-k,
          and top-p. Move them and watch the same model go from cautious to chaotic.
        </p>

        <p className="demo-companion">
          Prefer the written walkthrough? <Link to="/blog/next-word-sampling">Read the companion post →</Link>
        </p>

        <div className="demo-prompt">
          <span className="demo-prompt-label">Prompt</span>
          {PROMPT}
        </div>

        {/* Controls */}
        <div className="demo-controls">
          <label className="demo-control">
            <span>Temperature <b>{temperature.toFixed(2)}</b></span>
            <input type="range" min="0.1" max="2" step="0.05" value={temperature}
              onChange={(e) => setTemperature(parseFloat(e.target.value))} />
            <small>Low keeps it safe and repetitive. High flattens the odds and gets creative or random.</small>
          </label>
          <label className="demo-control">
            <span>top-k <b>{topK}</b></span>
            <input type="range" min="1" max={VOCAB.length} step="1" value={topK}
              onChange={(e) => setTopK(parseInt(e.target.value, 10))} />
            <small>Only the k most likely words stay in the running. The rest are dropped.</small>
          </label>
          <label className="demo-control">
            <span>top-p <b>{topP.toFixed(2)}</b></span>
            <input type="range" min="0.1" max="1" step="0.05" value={topP}
              onChange={(e) => setTopP(parseFloat(e.target.value))} />
            <small>Keep the smallest group of words whose combined probability reaches p.</small>
          </label>
        </div>

        {/* Distribution */}
        <div className="demo-dist">
          {dist.map((d) => (
            <div className={`demo-row ${d.p === 0 ? 'demo-row-off' : ''}`} key={d.token}>
              <div className="demo-row-token">{d.token}</div>
              <div className="demo-row-bar">
                <div className="demo-row-fill" style={{ width: `${(d.p / maxP) * 100}%` }} />
              </div>
              <div className="demo-row-p">{(d.p * 100).toFixed(1)}%</div>
            </div>
          ))}
        </div>

        <div className="demo-sample">
          <button className="demo-sample-btn" onClick={() => draw(1)}>
            <Dices size={16} /> Sample 1
          </button>
          <button className="demo-sample-btn" onClick={() => draw(20)}>
            <Dices size={16} /> Sample 20
          </button>
          {samples.length > 0 && (
            <div className="demo-sample-out">
              {samples.map((s, i) => <span className="demo-chip" key={i}>{s}</span>)}
            </div>
          )}
        </div>

        <h2 className="demo-h2">Try it in real Python</h2>
        <p className="demo-text">
          This is the same algorithm the sliders run, written in NumPy. It executes right here in
          your browser. Change <code>temperature</code>, <code>k</code>, and <code>nucleus</code> at
          the bottom, then press Run.
        </p>
        <PythonLab code={PY_CODE} packages={['numpy']} height={420} />

        <h2 className="demo-h2">What to take away</h2>
        <ul className="demo-list">
          <li>Temperature near 0 makes the model almost always take the single most likely word, which is why greedy decoding sounds flat.</li>
          <li>top-k caps how many words can ever be chosen. top-p adapts that count to how confident the model is in this specific spot.</li>
          <li>Most production systems combine a moderate temperature with top-p, which is what the book recommends for general use.</li>
        </ul>
      </div>
    </div>
  );
}
