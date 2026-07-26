import React, { useState } from 'react';
import './Explorer.css';

/**
 * A parameter you can drag, and the outcome redrawn as you drag it.
 *
 * Every state is precomputed and declared as data rather than calculated in
 * the browser. That is deliberate: the numbers a reader sees are results from
 * a real run, checked in with the post, not a formula invented to look
 * plausible. It also means the widget works with no runtime, no network and
 * no chance of drifting away from what the lab beside it prints.
 *
 *   { type: 'explorer',
 *     title, caption,
 *     param: { label, unit?, steps: [1, 2, 3] },
 *     bars:  { max?, unit? },
 *     data:  { 1: { note?, items: [{ label, value, state? }] }, ... } }
 *
 * `state` drives colour and carries the meaning: 'good' | 'warn' | 'bad'.
 */
export default function Explorer({ title, caption, param, bars = {}, data }) {
  const steps = param?.steps || [];
  const [i, setI] = useState(Math.floor(steps.length / 2));
  if (!steps.length || !data) return null;

  const current = steps[i];
  const frame = data[current] || data[String(current)];
  if (!frame) return null;

  const max = bars.max
    || Math.max(...Object.values(data).flatMap((f) => f.items.map((it) => it.value)), 1);

  return (
    <figure className="explorer">
      {title ? <figcaption className="explorer-title">{title}</figcaption> : null}

      <div className="explorer-control">
        <label htmlFor="explorer-range" className="explorer-label">
          {param.label}
          <strong className="explorer-value">
            {current}{param.unit ? ` ${param.unit}` : ''}
          </strong>
        </label>
        <input
          id="explorer-range"
          className="explorer-range"
          type="range"
          min={0}
          max={steps.length - 1}
          step={1}
          value={i}
          onChange={(e) => setI(Number(e.target.value))}
          aria-valuetext={`${param.label} ${current}`}
        />
        <div className="explorer-ticks" aria-hidden="true">
          {steps.map((s, n) => (
            <button
              key={s}
              type="button"
              className={`explorer-tick ${n === i ? 'is-on' : ''}`}
              onClick={() => setI(n)}
              tabIndex={-1}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <ul className="explorer-bars">
        {frame.items.map((item, n) => (
          <li key={n} className={`explorer-bar-row is-${item.state || 'neutral'}`}>
            <span className="explorer-bar-label">{item.label}</span>
            <span className="explorer-bar-track">
              <span
                className="explorer-bar-fill"
                style={{ width: `${Math.min(100, (item.value / max) * 100)}%` }}
              />
            </span>
            <span className="explorer-bar-value">
              {item.value}{bars.unit ? bars.unit : ''}
            </span>
          </li>
        ))}
      </ul>

      {frame.note ? <p className="explorer-note">{frame.note}</p> : null}
      {caption ? <figcaption className="explorer-caption">{caption}</figcaption> : null}
    </figure>
  );
}
