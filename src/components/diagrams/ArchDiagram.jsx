import React from 'react';
import './ArchDiagram.css';

/**
 * "Option B" diagram style: a clean architecture diagram with icon nodes,
 * labels beneath, straight orthogonal labeled arrows, and optional gray
 * grouping panels (the classic cloud-architecture look). Declared as data:
 *
 *   { type: 'diagram', title?, caption?,
 *     nodes: [{ id, label, icon, at: [col, row] }],
 *     edges: [{ from, to, label?, route? }],       // route: 'hv' | 'vh'
 *     groups: [{ label, from: [col, row], to: [col, row] }] }
 *
 * Icons: 'user' (blue circle), 'service' (green hexagon),
 *        'datastore' (orange square), 'model' (green hexagon outline).
 * Positions are grid coordinates; the component maps them to pixels.
 */
const COL_W = 190;
const ROW_H = 165;
const PAD = 100;
const H_TRIM = 46;
const TOP_TRIM = 44;
const BOT_TRIM = 72;

const px = (c) => PAD + c * COL_W;
const py = (r) => PAD * 0.7 + r * ROW_H;

function wrap(text, max = 14) {
  const words = String(text).split(' ');
  const lines = [];
  let cur = '';
  for (const w of words) {
    if ((cur + ' ' + w).trim().length > max && cur) { lines.push(cur); cur = w; }
    else cur = (cur + ' ' + w).trim();
  }
  if (cur) lines.push(cur);
  return lines;
}

function hexPoints(x, y, r) {
  const w = r * 0.866;
  return `${x},${y - r} ${x + w},${y - r / 2} ${x + w},${y + r / 2} ${x},${y + r} ${x - w},${y + r / 2} ${x - w},${y - r / 2}`;
}

function Icon({ type, x, y }) {
  switch (type) {
    case 'user':
      return (
        <g>
          <circle cx={x} cy={y} r="28" fill="#1a73e8" />
          <circle cx={x} cy={y - 8} r="8" fill="#fff" />
          <path d={`M ${x - 13} ${y + 17} L ${x - 7} ${y + 3} L ${x + 7} ${y + 3} L ${x + 13} ${y + 17} Z`} fill="#fff" />
        </g>
      );
    case 'datastore':
      return (
        <g>
          <rect x={x - 28} y={y - 28} width="56" height="56" rx="4" fill="#d9730d" />
          <ellipse cx={x} cy={y - 13} rx="14" ry="5" fill="#fff" />
          <path d={`M ${x - 14} ${y - 13} V ${y + 11} A 14 5 0 0 0 ${x + 14} ${y + 11} V ${y - 13}`} fill="#fff" />
          <path d={`M ${x - 14} ${y - 5} A 14 5 0 0 0 ${x + 14} ${y - 5}`} fill="none" stroke="#d9730d" strokeWidth="2" />
          <path d={`M ${x - 14} ${y + 3} A 14 5 0 0 0 ${x + 14} ${y + 3}`} fill="none" stroke="#d9730d" strokeWidth="2" />
        </g>
      );
    case 'model': {
      const dots = [[0, -13], [12, -4], [7, 11], [-7, 11], [-12, -4]];
      return (
        <g>
          <polygon points={hexPoints(x, y, 32)} fill="none" stroke="#76b900" strokeWidth="3" />
          {dots.map(([dx, dy], i) =>
            dots.slice(i + 1).map(([dx2, dy2], j) => (
              <line key={`${i}-${j}`} x1={x + dx} y1={y + dy} x2={x + dx2} y2={y + dy2} stroke="#76b900" strokeWidth="1.1" />
            ))
          )}
          {dots.map(([dx, dy], i) => <circle key={i} cx={x + dx} cy={y + dy} r="3.4" fill="#76b900" />)}
        </g>
      );
    }
    case 'service':
    default:
      return (
        <g>
          <polygon points={hexPoints(x, y, 32)} fill="#76b900" />
          <circle cx={x} cy={y - 11} r="4.5" fill="#fff" />
          <line x1={x} y1={y - 7} x2={x} y2={y + 2} stroke="#fff" strokeWidth="2" />
          <line x1={x - 12} y1={y + 2} x2={x + 12} y2={y + 2} stroke="#fff" strokeWidth="2" />
          {[-12, 0, 12].map((dx) => (
            <g key={dx}>
              <line x1={x + dx} y1={y + 2} x2={x + dx} y2={y + 8} stroke="#fff" strokeWidth="2" />
              <rect x={x + dx - 4} y={y + 8} width="8" height="8" fill="#fff" />
            </g>
          ))}
        </g>
      );
  }
}

function edgeGeometry(e, pos) {
  const a = pos[e.from];
  const b = pos[e.to];
  if (!a || !b) return null;
  if (a.y === b.y) {
    const d = Math.sign(b.x - a.x);
    return {
      path: `M ${a.x + d * H_TRIM} ${a.y} L ${b.x - d * H_TRIM} ${b.y}`,
      lx: (a.x + b.x) / 2, ly: a.y - 10, anchor: 'middle',
    };
  }
  const dv = Math.sign(b.y - a.y);
  const vStart = a.y + (dv > 0 ? BOT_TRIM : -TOP_TRIM);
  const vEnd = b.y - (dv > 0 ? TOP_TRIM : -BOT_TRIM);
  if (a.x === b.x) {
    return {
      path: `M ${a.x} ${vStart} L ${b.x} ${vEnd}`,
      lx: a.x + 10, ly: (vStart + vEnd) / 2, anchor: 'start',
    };
  }
  const dh = Math.sign(b.x - a.x);
  if ((e.route || 'hv') === 'hv') {
    return {
      path: `M ${a.x + dh * H_TRIM} ${a.y} L ${b.x} ${a.y} L ${b.x} ${vEnd}`,
      lx: (a.x + b.x) / 2, ly: a.y - 10, anchor: 'middle',
    };
  }
  return {
    path: `M ${a.x} ${vStart} L ${a.x} ${b.y} L ${b.x - dh * H_TRIM} ${b.y}`,
    lx: a.x + 10, ly: (vStart + b.y) / 2, anchor: 'start',
  };
}

export default function ArchDiagram({ title, caption, nodes = [], edges = [], groups = [] }) {
  if (nodes.length === 0) return null;
  const pos = {};
  let maxC = 0;
  let maxR = 0;
  for (const n of nodes) {
    pos[n.id] = { x: px(n.at[0]), y: py(n.at[1]) };
    maxC = Math.max(maxC, n.at[0]);
    maxR = Math.max(maxR, n.at[1]);
  }
  for (const g of groups) { maxC = Math.max(maxC, g.to[0]); maxR = Math.max(maxR, g.to[1]); }
  const width = px(maxC) + PAD;
  const height = py(maxR) + 110;

  return (
    <figure className="arch-diagram">
      {title ? <div className="arch-title">{title}</div> : null}
      <svg viewBox={`0 0 ${width} ${height}`} style={{ maxWidth: `${width}px` }} role="img" aria-label={title || 'architecture diagram'}>
        <defs>
          <marker id="arch-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M 0 1 L 9 5 L 0 9 z" fill="currentColor" />
          </marker>
        </defs>
        {groups.map((g, i) => {
          const x1 = px(g.from[0]) - 88;
          const y1 = py(g.from[1]) - 62;
          const x2 = px(g.to[0]) + 88;
          const y2 = py(g.to[1]) + 86;
          return (
            <g key={i}>
              <rect className="arch-group" x={x1} y={y1} width={x2 - x1} height={y2 - y1} rx="6" />
              <text className="arch-group-label" x={(x1 + x2) / 2} y={y1 + 22} textAnchor="middle">{g.label}</text>
            </g>
          );
        })}
        {edges.map((e, i) => {
          const geo = edgeGeometry(e, pos);
          if (!geo) return null;
          return (
            <g key={i}>
              <path d={geo.path} fill="none" stroke="currentColor" strokeWidth="1.6" markerEnd="url(#arch-arrow)" />
              {e.label ? (
                <text className="arch-edge-label" x={geo.lx} y={geo.ly} textAnchor={geo.anchor}>{e.label}</text>
              ) : null}
            </g>
          );
        })}
        {nodes.map((n) => {
          const p = pos[n.id];
          const lines = wrap(n.label);
          return (
            <g key={n.id}>
              <Icon type={n.icon} x={p.x} y={p.y} />
              <text className="arch-node-label" textAnchor="middle">
                {lines.map((l, j) => (
                  <tspan key={j} x={p.x} y={p.y + 48 + j * 17}>{l}</tspan>
                ))}
              </text>
            </g>
          );
        })}
      </svg>
      {caption ? <figcaption>{caption}</figcaption> : null}
    </figure>
  );
}
