import React from 'react';
import './SketchTreeDiagram.css';

/**
 * "Option A" diagram style: a hand-drawn-looking decision tree with pastel
 * nodes and curved, labeled arrows (the Excalidraw-style flowchart look).
 * Declared as data in a post body:
 *
 *   { type: 'diagram', title?, caption?, root: {
 *       label, color?,                    // purple | blue | yellow | green
 *       children: [{ edge?, node }]       // edge = text along the arrow
 *   } }
 *
 * Layout is a tidy tree computed at render time; the wobble comes from an
 * SVG turbulence filter, so no images or external assets are involved.
 */
const COLORS = {
  purple: '#cdb4f6',
  blue: '#8ed1f9',
  yellow: '#fbe38e',
  green: '#a9e8a1',
};

const CHAR_W = 8;
const LINE_H = 19;
const PAD_X = 18;
const PAD_Y = 12;
const H_GAP = 30;
const V_GAP = 78;
const MARGIN = 130;

function wrap(text, max = 24) {
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

function measure(node) {
  const lines = wrap(node.label);
  const w = Math.max(...lines.map((l) => l.length)) * CHAR_W + PAD_X * 2;
  const h = lines.length * LINE_H + PAD_Y * 2;
  const children = (node.children || []).map((c) => ({ edge: c.edge, node: measure(c.node) }));
  const kidsW = children.reduce((s, c) => s + c.node.subtreeW, 0) + Math.max(children.length - 1, 0) * H_GAP;
  return { color: node.color, lines, w, h, children, subtreeW: Math.max(w, kidsW) };
}

function levelHeights(node, depth, levels) {
  levels[depth] = Math.max(levels[depth] || 0, node.h);
  node.children.forEach((c) => levelHeights(c.node, depth + 1, levels));
}

function place(node, left, depth, levelY, out) {
  const x = left + node.subtreeW / 2;
  const y = levelY[depth];
  out.nodes.push({ ...node, x, y });
  const kidsW = node.children.reduce((s, c) => s + c.node.subtreeW, 0) + Math.max(node.children.length - 1, 0) * H_GAP;
  let cx = left + (node.subtreeW - kidsW) / 2;
  node.children.forEach((c) => {
    const childX = cx + c.node.subtreeW / 2;
    out.edges.push({ x1: x, y1: y + node.h, x2: childX, y2: levelY[depth + 1], label: c.edge });
    place(c.node, cx, depth + 1, levelY, out);
    cx += c.node.subtreeW + H_GAP;
  });
}

function curve(e) {
  const dy = e.y2 - e.y1;
  return `M ${e.x1} ${e.y1} C ${e.x1} ${e.y1 + dy * 0.5}, ${e.x2} ${e.y2 - dy * 0.5}, ${e.x2} ${e.y2 - 4}`;
}

export default function SketchTreeDiagram({ title, caption, root }) {
  if (!root) return null;
  const tree = measure(root);
  const levels = [];
  levelHeights(tree, 0, levels);
  const levelY = [];
  let y = 8;
  levels.forEach((h, d) => { levelY[d] = y; y += h + V_GAP; });
  const height = y - V_GAP + 10;
  const width = tree.subtreeW + MARGIN * 2;
  const out = { nodes: [], edges: [] };
  place(tree, MARGIN, 0, levelY, out);

  return (
    <figure className="sketch-tree">
      {title ? <div className="sketch-tree-title">{title}</div> : null}
      <svg viewBox={`0 0 ${width} ${height}`} style={{ maxWidth: `${width}px` }} role="img" aria-label={title || 'diagram'}>
        <defs>
          <filter id="sketch-wobble" x="-5%" y="-5%" width="110%" height="110%">
            <feTurbulence type="fractalNoise" baseFrequency="0.015" numOctaves="2" seed="11" result="n" />
            <feDisplacementMap in="SourceGraphic" in2="n" scale="3" />
          </filter>
          <marker id="sketch-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M 0 1 L 9 5 L 0 9 z" fill="currentColor" />
          </marker>
        </defs>
        <g filter="url(#sketch-wobble)">
          {out.edges.map((e, i) => (
            <path key={i} d={curve(e)} fill="none" stroke="currentColor" strokeWidth="1.8" markerEnd="url(#sketch-arrow)" />
          ))}
          {out.nodes.map((n, i) => (
            <rect
              key={i}
              x={n.x - n.w / 2}
              y={n.y}
              width={n.w}
              height={n.h}
              rx="14"
              fill={COLORS[n.color] || COLORS.yellow}
              stroke="#1f1f1f"
              strokeWidth="1.8"
            />
          ))}
        </g>
        {out.nodes.map((n, i) => (
          <text key={i} className="sketch-node-text" textAnchor="middle">
            {n.lines.map((l, j) => (
              <tspan key={j} x={n.x} y={n.y + PAD_Y + (j + 0.78) * LINE_H}>{l}</tspan>
            ))}
          </text>
        ))}
        {out.edges.filter((e) => e.label).map((e, i) => {
          const side = e.x2 >= e.x1 ? 1 : -1;
          const mx = (e.x1 + e.x2) / 2 + side * 12;
          const my = (e.y1 + e.y2) / 2 - 6;
          const lines = wrap(e.label, 26);
          return (
            <text key={i} className="sketch-edge-text" textAnchor={side > 0 ? 'start' : 'end'}>
              {lines.map((l, j) => (
                <tspan key={j} x={mx} y={my + j * 16}>{l}</tspan>
              ))}
            </text>
          );
        })}
      </svg>
      {caption ? <figcaption>{caption}</figcaption> : null}
    </figure>
  );
}
