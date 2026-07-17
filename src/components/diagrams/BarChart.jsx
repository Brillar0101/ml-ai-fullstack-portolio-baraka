import React from 'react';
import './BarChart.css';

/**
 * Data-driven bar chart for series blog posts. Declared as data:
 *
 *   { type: 'chart', kind: 'bar', title?, caption?, yLabel?,
 *     stacked?: boolean, valueLabels?: boolean (default true),
 *     series: [{ label, key, baseline?: boolean, color? }],
 *     data:   [{ label, values: { <key>: number, ... } }],
 *     gapArrow?: { from: groupIdx | {group, series}, to: ..., label } }
 *
 * Colors come from the site brand palette (blue / indigo / magenta / light
 * blue); a series flagged `baseline: true` renders gray so "before vs after"
 * reads before any label does. Axes, text, and gridlines use CSS variables so
 * the chart stays legible in both light and dark themes.
 */
const BRAND = ['#0066CC', '#004D99', '#003366', '#4394E5'];
const BASELINE_GRAY = '#8b909b';

const W = 720;
const PAD = { top: 34, right: 26, bottom: 40, left: 58 };
const PLOT_H = 300;

function niceCeil(x) {
  if (x <= 0) return 1;
  const exp = Math.floor(Math.log10(x));
  const base = Math.pow(10, exp);
  const f = x / base;
  const nf = f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10;
  return nf * base;
}

function fmt(v) {
  if (Math.abs(v) >= 1000) return `${(v / 1000).toFixed(v % 1000 === 0 ? 0 : 1)}k`;
  return Number.isInteger(v) ? String(v) : String(Math.round(v * 100) / 100);
}

export default function BarChart({ title, caption, yLabel, stacked = false, valueLabels = true, series = [], data = [], gapArrow }) {
  if (series.length === 0 || data.length === 0) return null;

  // Assign a color to each series: baseline -> gray, else next brand hue.
  let brandI = 0;
  const colorOf = series.map((s) => s.color || (s.baseline ? BASELINE_GRAY : BRAND[brandI++ % BRAND.length]));

  const groupTotal = (d) => series.reduce((sum, s) => sum + (d.values[s.key] || 0), 0);
  const rawMax = stacked
    ? Math.max(...data.map(groupTotal))
    : Math.max(...data.flatMap((d) => series.map((s) => d.values[s.key] || 0)));
  const maxV = niceCeil(rawMax);

  const plotW = W - PAD.left - PAD.right;
  const H = PAD.top + PLOT_H + PAD.bottom;
  const y0 = PAD.top + PLOT_H;
  const yOf = (v) => PAD.top + PLOT_H * (1 - v / maxV);

  const slotW = plotW / data.length;
  const groupPad = slotW * 0.16;
  const innerW = slotW - groupPad * 2;
  const barW = stacked ? innerW : innerW / series.length;

  // Compute every bar's geometry so gapArrow can reference tops by index.
  const barGeo = data.map((d, g) => {
    const slotX = PAD.left + g * slotW + groupPad;
    if (stacked) {
      let acc = 0;
      const segs = series.map((s, i) => {
        const v = d.values[s.key] || 0;
        const yTop = yOf(acc + v);
        const seg = { x: slotX, y: yTop, w: barW, h: yOf(acc) - yTop, v, color: colorOf[i] };
        acc += v;
        return seg;
      });
      return { segs, topY: yOf(acc), total: acc, centerX: slotX + barW / 2 };
    }
    const bars = series.map((s, i) => {
      const v = d.values[s.key] || 0;
      const x = slotX + i * barW;
      const yTop = yOf(v);
      return { x, y: yTop, w: barW, h: y0 - yTop, v, color: colorOf[i] };
    });
    const topY = Math.min(...bars.map((b) => b.y));
    return { bars, topY, centerX: slotX + innerW / 2 };
  });

  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => f * maxV);

  const resolveRef = (ref) => {
    const r = typeof ref === 'number' ? { group: ref } : ref;
    const geo = barGeo[r.group];
    if (!geo) return null;
    if (stacked || r.series == null) return { x: geo.centerX, y: geo.topY, v: stacked ? geo.total : geo.bars[0].v };
    const b = geo.bars[r.series];
    return { x: b.x + b.w / 2, y: b.y, v: b.v };
  };

  let arrow = null;
  if (gapArrow) {
    const a = resolveRef(gapArrow.from);
    const b = resolveRef(gapArrow.to);
    if (a && b) {
      const hi = a.y <= b.y ? a : b;
      const lo = a.y <= b.y ? b : a;
      arrow = { x: (a.x + b.x) / 2, yTop: hi.y, yBot: lo.y, label: gapArrow.label };
    }
  }

  return (
    <figure className="bar-chart">
      {title ? <div className="bar-chart-title">{title}</div> : null}
      <svg viewBox={`0 0 ${W} ${H}`} style={{ maxWidth: `${W}px` }} role="img" aria-label={title || 'bar chart'}>
        <defs>
          <marker id="bc-arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor" />
          </marker>
        </defs>

        {/* gridlines + y ticks */}
        {ticks.map((t, i) => (
          <g key={i}>
            <line className="bc-grid" x1={PAD.left} y1={yOf(t)} x2={W - PAD.right} y2={yOf(t)} />
            <text className="bc-tick" x={PAD.left - 8} y={yOf(t) + 4} textAnchor="end">{fmt(t)}</text>
          </g>
        ))}

        {/* y axis label */}
        {yLabel ? (
          <text className="bc-axis-label" transform={`translate(16 ${PAD.top + PLOT_H / 2}) rotate(-90)`} textAnchor="middle">{yLabel}</text>
        ) : null}

        {/* bars */}
        {barGeo.map((geo, g) => {
          const rects = stacked ? geo.segs : geo.bars;
          return (
            <g key={g}>
              {rects.map((r, i) => (
                <rect key={i} x={r.x} y={r.y} width={r.w} height={Math.max(r.h, 0)} rx="2" fill={r.color} />
              ))}
              {valueLabels && !stacked && geo.bars.map((b, i) => (
                <text key={i} className="bc-value" x={b.x + b.w / 2} y={b.y - 5} textAnchor="middle">{fmt(b.v)}</text>
              ))}
              {valueLabels && stacked ? (
                <text className="bc-value" x={geo.centerX} y={geo.topY - 5} textAnchor="middle">{fmt(geo.total)}</text>
              ) : null}
              <text className="bc-cat" x={geo.centerX} y={y0 + 18} textAnchor="middle">{data[g].label}</text>
            </g>
          );
        })}

        {/* baseline axis */}
        <line className="bc-axis" x1={PAD.left} y1={y0} x2={W - PAD.right} y2={y0} />

        {/* N× gap arrow */}
        {arrow ? (
          <g className="bc-gap">
            <line x1={arrow.x} y1={arrow.yBot} x2={arrow.x} y2={arrow.yTop} markerStart="url(#bc-arrow)" markerEnd="url(#bc-arrow)" />
            <text x={arrow.x + 8} y={(arrow.yTop + arrow.yBot) / 2 + 4} textAnchor="start">{arrow.label}</text>
          </g>
        ) : null}
      </svg>

      {/* legend */}
      <div className="bar-chart-legend">
        {series.map((s, i) => (
          <span key={i} className="bc-legend-item">
            <span className="bc-swatch" style={{ background: colorOf[i] }} />
            {s.label}
          </span>
        ))}
      </div>

      {caption ? <figcaption>{caption}</figcaption> : null}
    </figure>
  );
}
