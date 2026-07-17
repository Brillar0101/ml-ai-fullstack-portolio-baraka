import React from 'react';
import './LineChart.css';

/**
 * Data-driven line chart in the site brand palette (NVIDIA line-chart genre:
 * curves with shaded phase regions, axis-direction hints, optional gap arrow).
 * Supports a secondary (right) y-axis so two quantities on different scales can
 * share one plot. Declared as data:
 *
 *   { type: 'chart', kind: 'line', title?, caption?,
 *     xLabel?, yLabel?, yLabelRight?, xMax?, yMax?, yMaxRight?,
 *     series: [{ label, key, axis?: 'left'|'right', dashed?, color? }],
 *     data:   [{ x: number, values: { <key>: number } }],
 *     regions?: [{ from, to, label }] }
 *
 * Axes, text, gridlines use CSS variables (theme-aware); data marks use brand
 * hex. Put an arrow in a label ("time →") for the direction-of-goodness hint.
 */
const BRAND = ['#0066CC', '#003366', '#004D99', '#4394E5'];

const W = 720;
const PAD = { top: 34, right: 60, bottom: 52, left: 60 };
const PLOT_H = 280;

function niceCeil(x) {
  if (x <= 0) return 1;
  const exp = Math.floor(Math.log10(x));
  const base = Math.pow(10, exp);
  const f = x / base;
  const nf = f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10;
  return nf * base;
}
const fmt = (v) => (Number.isInteger(v) ? String(v) : String(Math.round(v * 100) / 100));

export default function LineChart({ title, caption, xLabel, yLabel, yLabelRight, xMax, yMax, yMaxRight, series = [], data = [], regions = [] }) {
  if (series.length === 0 || data.length === 0) return null;

  const xs = data.map((d) => d.x);
  const xLo = Math.min(...xs);
  const xHi = xMax != null ? xMax : Math.max(...xs);
  const hasRight = series.some((s) => s.axis === 'right');
  const leftKeys = series.filter((s) => s.axis !== 'right').map((s) => s.key);
  const rightKeys = series.filter((s) => s.axis === 'right').map((s) => s.key);
  const maxOf = (keys) => Math.max(...data.flatMap((d) => keys.map((k) => d.values[k] || 0)));
  const yHi = yMax != null ? yMax : niceCeil(maxOf(leftKeys));
  const yHiR = yMaxRight != null ? yMaxRight : (hasRight ? niceCeil(maxOf(rightKeys)) : 1);

  const plotW = W - PAD.left - PAD.right;
  const H = PAD.top + PLOT_H + PAD.bottom;
  const y0 = PAD.top + PLOT_H;
  const xOf = (x) => PAD.left + plotW * ((x - xLo) / (xHi - xLo || 1));
  const yOf = (v) => PAD.top + PLOT_H * (1 - v / yHi);
  const yOfR = (v) => PAD.top + PLOT_H * (1 - v / yHiR);

  let brandI = 0;
  const colorOf = series.map((s) => s.color || BRAND[brandI++ % BRAND.length]);
  const ticks = [0, 0.25, 0.5, 0.75, 1];

  return (
    <figure className="line-chart">
      {title ? <div className="line-chart-title">{title}</div> : null}
      <svg viewBox={`0 0 ${W} ${H}`} style={{ maxWidth: `${W}px` }} role="img" aria-label={title || 'line chart'}>
        {/* phase regions */}
        {regions.map((r, i) => {
          const rx = xOf(r.from);
          const rw = xOf(r.to) - rx;
          return (
            <g key={i}>
              <rect className="lc-region" x={rx} y={PAD.top} width={rw} height={PLOT_H} />
              {r.label ? <text className="lc-region-label" x={rx + rw / 2} y={PAD.top + 14} textAnchor="middle">{r.label}</text> : null}
              {i > 0 ? <line className="lc-divider" x1={rx} y1={PAD.top} x2={rx} y2={y0} /> : null}
            </g>
          );
        })}

        {/* gridlines + left ticks */}
        {ticks.map((f, i) => (
          <g key={i}>
            <line className="lc-grid" x1={PAD.left} y1={PAD.top + PLOT_H * f} x2={W - PAD.right} y2={PAD.top + PLOT_H * f} />
            <text className="lc-tick" x={PAD.left - 8} y={PAD.top + PLOT_H * f + 4} textAnchor="end">{fmt(yHi * (1 - f))}</text>
            {hasRight ? <text className="lc-tick lc-tick-right" x={W - PAD.right + 8} y={PAD.top + PLOT_H * f + 4} textAnchor="start">{fmt(yHiR * (1 - f))}</text> : null}
          </g>
        ))}

        {/* axes */}
        <line className="lc-axis" x1={PAD.left} y1={PAD.top} x2={PAD.left} y2={y0} />
        <line className="lc-axis" x1={PAD.left} y1={y0} x2={W - PAD.right} y2={y0} />
        {hasRight ? <line className="lc-axis" x1={W - PAD.right} y1={PAD.top} x2={W - PAD.right} y2={y0} /> : null}

        {/* x ticks */}
        {data.filter((_, i) => i % Math.ceil(data.length / 6) === 0).map((d, i) => (
          <text key={i} className="lc-tick" x={xOf(d.x)} y={y0 + 18} textAnchor="middle">{fmt(d.x)}</text>
        ))}

        {/* axis labels */}
        {xLabel ? <text className="lc-axis-label" x={PAD.left + plotW / 2} y={H - 8} textAnchor="middle">{xLabel}</text> : null}
        {yLabel ? <text className="lc-axis-label" transform={`translate(16 ${PAD.top + PLOT_H / 2}) rotate(-90)`} textAnchor="middle">{yLabel}</text> : null}
        {yLabelRight ? <text className="lc-axis-label" transform={`translate(${W - 14} ${PAD.top + PLOT_H / 2}) rotate(90)`} textAnchor="middle">{yLabelRight}</text> : null}

        {/* series */}
        {series.map((s, i) => {
          const scale = s.axis === 'right' ? yOfR : yOf;
          const pts = data.map((d) => `${xOf(d.x)},${scale(d.values[s.key] || 0)}`).join(' ');
          return <polyline key={i} className="lc-line" points={pts} stroke={colorOf[i]} strokeDasharray={s.dashed ? '6 5' : 'none'} />;
        })}
      </svg>
      <div className="line-chart-legend">
        {series.map((s, i) => (
          <span key={i} className="lc-legend-item">
            <span className="lc-swatch" style={{ borderTopColor: colorOf[i], borderTopStyle: s.dashed ? 'dashed' : 'solid' }} />
            {s.label}
          </span>
        ))}
      </div>
      {caption ? <figcaption>{caption}</figcaption> : null}
    </figure>
  );
}
