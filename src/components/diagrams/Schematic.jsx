import React from 'react';
import './Schematic.css';

/**
 * Data-driven circuit schematic for hardware posts. Original symbols only,
 * drawn in the site brand palette; never a reproduced datasheet figure.
 *
 *   { type: 'schematic', title?, caption?,
 *     parts: [
 *       { id, sym, at: [x,y], rot?: 'h'|'v', label?, sub? }   // 2-terminal + glyphs
 *       { id, sym: 'box', at:[x,y], w, h, label, pins: [{ name, side:'l'|'r'|'t'|'b', pos }] }
 *     ],
 *     wires: [ [ endpoint, endpoint, ... ] ]   // endpoint = "id.term" or [x,y]
 *   }
 *
 * Terminals: 2-terminal parts expose `a` and `b` along their axis; `gnd`/`dot`/
 * `rail` expose `p`; a `box` exposes each named pin. Wires route with orthogonal
 * elbows between consecutive endpoints; insert [x,y] waypoints for control.
 */
const G = 30;      // grid unit in px
const PAD = 26;
const gx = (x) => x * G + PAD;
const gy = (y) => y * G + PAD;

function axisTerms(p) {
  const [x, y] = p.at;
  return p.rot === 'v'
    ? { a: [x, y - 1], b: [x, y + 1] }
    : { a: [x - 1, y], b: [x + 1, y] };
}

function boxEdges(p) {
  const [x, y] = p.at;
  return { l: x - p.w / 2, r: x + p.w / 2, t: y - p.h / 2, b: y + p.h / 2 };
}

function boxPin(p, name) {
  const e = boxEdges(p);
  const pin = (p.pins || []).find((q) => q.name === name);
  if (!pin) return p.at;
  const pos = pin.pos == null ? 0.5 : pin.pos;
  if (pin.side === 'l') return [e.l, e.t + pos * p.h];
  if (pin.side === 'r') return [e.r, e.t + pos * p.h];
  if (pin.side === 't') return [e.l + pos * p.w, e.t];
  return [e.l + pos * p.w, e.b];
}

function resolve(ref, byId) {
  if (Array.isArray(ref)) return ref;
  const [id, term] = ref.split('.');
  const p = byId[id];
  if (!p) return [0, 0];
  if (p.sym === 'box') return boxPin(p, term);
  if (['res', 'cap', 'diode', 'battery'].includes(p.sym)) return axisTerms(p)[term] || p.at;
  return p.at;
}

function elbow(p1, p2) {
  // horizontal-first elbow in grid coords
  if (p1[0] === p2[0] || p1[1] === p2[1]) return [p1, p2];
  return [p1, [p2[0], p1[1]], p2];
}

export default function Schematic({ title, caption, parts = [], wires = [] }) {
  if (parts.length === 0) return null;
  const byId = {};
  parts.forEach((p) => { byId[p.id] = p; });

  // bounds
  let maxX = 1, maxY = 1;
  parts.forEach((p) => {
    const w = p.sym === 'box' ? p.w / 2 : 1;
    const h = p.sym === 'box' ? p.h / 2 : 1;
    maxX = Math.max(maxX, p.at[0] + w + 1);
    maxY = Math.max(maxY, p.at[1] + h + 1);
  });
  const W = gx(maxX) + PAD;
  const H = gy(maxY) + PAD;

  // build wire polylines in px
  const polylines = wires.map((w) => {
    const pts = w.map((e) => resolve(e, byId));
    const path = [];
    for (let i = 0; i < pts.length - 1; i++) {
      const seg = elbow(pts[i], pts[i + 1]);
      seg.forEach((pt, j) => { if (i === 0 || j > 0) path.push(pt); });
    }
    return path.map(([x, y]) => `${gx(x)},${gy(y)}`).join(' ');
  });

  return (
    <figure className="schematic">
      {title ? <div className="schematic-title">{title}</div> : null}
      <svg viewBox={`0 0 ${W} ${H}`} style={{ maxWidth: `${W}px` }} role="img" aria-label={title || 'circuit schematic'}>
        {polylines.map((pl, i) => (
          <polyline key={i} className="sch-wire" points={pl} />
        ))}
        {parts.map((p) => <Part key={p.id} p={p} />)}
      </svg>
      {caption ? <figcaption>{caption}</figcaption> : null}
    </figure>
  );
}

function Lead({ from, to }) {
  return <line className="sch-wire" x1={gx(from[0])} y1={gy(from[1])} x2={gx(to[0])} y2={gy(to[1])} />;
}

function Part({ p }) {
  const [x, y] = p.at;
  const cx = gx(x);
  const cy = gy(y);
  const horiz = p.rot !== 'v';

  switch (p.sym) {
    case 'dot':
      return <circle className="sch-node" cx={cx} cy={cy} r="4" />;

    case 'rail':
      return (
        <g>
          <circle className="sch-node" cx={cx} cy={cy} r="3.5" />
          <text className="sch-rail" x={cx} y={cy - 9} textAnchor="middle">{p.label}</text>
        </g>
      );

    case 'gnd':
      return (
        <g className="sch-part">
          <line className="sch-wire" x1={cx} y1={cy} x2={cx} y2={cy + G * 0.4} />
          <line className="sch-body" x1={cx - 11} y1={cy + G * 0.4} x2={cx + 11} y2={cy + G * 0.4} />
          <line className="sch-body" x1={cx - 7} y1={cy + G * 0.4 + 4} x2={cx + 7} y2={cy + G * 0.4 + 4} />
          <line className="sch-body" x1={cx - 3} y1={cy + G * 0.4 + 8} x2={cx + 3} y2={cy + G * 0.4 + 8} />
        </g>
      );

    case 'res': {
      const t = axisTerms(p);
      return (
        <g className="sch-part">
          <Lead from={t.a} to={horiz ? [x - 0.5, y] : [x, y - 0.5]} />
          <Lead from={horiz ? [x + 0.5, y] : [x, y + 0.5]} to={t.b} />
          <rect className="sch-body-fill" x={horiz ? cx - G * 0.5 : cx - 8} y={horiz ? cy - 8 : cy - G * 0.5} width={horiz ? G : 16} height={horiz ? 16 : G} rx="2" />
          {p.label ? <text className="sch-label" x={cx} y={horiz ? cy - 13 : cy} dominantBaseline={horiz ? 'auto' : 'middle'} textAnchor="middle">{p.label}</text> : null}
        </g>
      );
    }

    case 'cap': {
      const t = axisTerms(p);
      return (
        <g className="sch-part">
          {horiz ? (
            <>
              <Lead from={t.a} to={[x - 0.13, y]} />
              <Lead from={[x + 0.13, y]} to={t.b} />
              <line className="sch-body" x1={cx - 4} y1={cy - 11} x2={cx - 4} y2={cy + 11} />
              <line className="sch-body" x1={cx + 4} y1={cy - 11} x2={cx + 4} y2={cy + 11} />
            </>
          ) : (
            <>
              <Lead from={t.a} to={[x, y - 0.13]} />
              <Lead from={[x, y + 0.13]} to={t.b} />
              <line className="sch-body" x1={cx - 11} y1={cy - 4} x2={cx + 11} y2={cy - 4} />
              <line className="sch-body" x1={cx - 11} y1={cy + 4} x2={cx + 11} y2={cy + 4} />
            </>
          )}
          {p.label ? <text className="sch-label" x={cx + 14} y={cy + 4} textAnchor="start">{p.label}</text> : null}
        </g>
      );
    }

    case 'diode': {
      const t = axisTerms(p);
      // anode = a, cathode = b (triangle points a->b)
      return (
        <g className="sch-part">
          {horiz ? (
            <>
              <Lead from={t.a} to={[x - 0.4, y]} />
              <Lead from={[x + 0.32, y]} to={t.b} />
              <polygon className="sch-body-fill" points={`${cx - 12},${cy - 9} ${cx + 9},${cy} ${cx - 12},${cy + 9}`} />
              <line className="sch-body" x1={cx + 9} y1={cy - 9} x2={cx + 9} y2={cy + 9} />
            </>
          ) : (
            <>
              <Lead from={t.a} to={[x, y - 0.4]} />
              <Lead from={[x, y + 0.32]} to={t.b} />
              <polygon className="sch-body-fill" points={`${cx - 9},${cy - 12} ${cx},${cy + 9} ${cx + 9},${cy - 12}`} />
              <line className="sch-body" x1={cx - 9} y1={cy + 9} x2={cx + 9} y2={cy + 9} />
            </>
          )}
          {p.label ? <text className="sch-label" x={cx + (horiz ? 0 : 14)} y={cy - (horiz ? 15 : 0)} textAnchor="middle">{p.label}</text> : null}
        </g>
      );
    }

    case 'battery': {
      const t = axisTerms(p);
      // vertical default reads best for a cell
      return (
        <g className="sch-part">
          {p.rot === 'v' || p.rot == null ? null : null}
          <Lead from={t.a} to={horiz ? [x - 0.45, y] : [x, y - 0.45]} />
          <Lead from={horiz ? [x + 0.45, y] : [x, y + 0.45]} to={t.b} />
          {horiz ? (
            <>
              <line className="sch-body" x1={cx - 6} y1={cy - 12} x2={cx - 6} y2={cy + 12} />
              <line className="sch-body" x1={cx - 1} y1={cy - 6} x2={cx - 1} y2={cy + 6} />
              <line className="sch-body" x1={cx + 4} y1={cy - 12} x2={cx + 4} y2={cy + 12} />
              <line className="sch-body" x1={cx + 9} y1={cy - 6} x2={cx + 9} y2={cy + 6} />
            </>
          ) : (
            <>
              <line className="sch-body" x1={cx - 12} y1={cy - 6} x2={cx + 12} y2={cy - 6} />
              <line className="sch-body" x1={cx - 6} y1={cy - 1} x2={cx + 6} y2={cy - 1} />
              <line className="sch-body" x1={cx - 12} y1={cy + 4} x2={cx + 12} y2={cy + 4} />
              <line className="sch-body" x1={cx - 6} y1={cy + 9} x2={cx + 6} y2={cy + 9} />
            </>
          )}
          {p.label ? <text className="sch-label" x={cx + 16} y={cy + 4} textAnchor="start">{p.label}</text> : null}
        </g>
      );
    }

    case 'box': {
      const e = boxEdges(p);
      const bx = gx(e.l);
      const by = gy(e.t);
      const bw = p.w * G;
      const bh = p.h * G;
      // wrap the label to fit the box width (~6px per char at 12px)
      const maxChars = Math.max(4, Math.floor((bw - 12) / 6.4));
      const words = String(p.label).split(' ');
      const lines = [];
      let cur = '';
      words.forEach((w) => {
        if ((cur + ' ' + w).trim().length > maxChars && cur) { lines.push(cur); cur = w; }
        else cur = (cur + ' ' + w).trim();
      });
      if (cur) lines.push(cur);
      const lh = 14;
      const y0 = by + bh / 2 - ((lines.length - 1) * lh) / 2 + 4;
      return (
        <g className="sch-part">
          <rect className="sch-box" x={bx} y={by} width={bw} height={bh} rx="6" />
          <text className="sch-box-label" x={bx + bw / 2} textAnchor="middle">
            {lines.map((ln, i) => <tspan key={i} x={bx + bw / 2} y={y0 + i * lh}>{ln}</tspan>)}
          </text>
          {(p.pins || []).map((pin, i) => {
            const [px, py] = boxPin(p, pin.name);
            const out = pin.side === 'l' ? [px - 0.5, py] : pin.side === 'r' ? [px + 0.5, py] : pin.side === 't' ? [px, py - 0.5] : [px, py + 0.5];
            return (
              <g key={i}>
                <Lead from={[px, py]} to={out} />
                {pin.label ? (
                  <text className="sch-pin" x={gx(px) + (pin.side === 'l' ? 5 : pin.side === 'r' ? -5 : 0)} y={gy(py) + (pin.side === 't' ? 12 : pin.side === 'b' ? -6 : -4)} textAnchor={pin.side === 'l' ? 'start' : pin.side === 'r' ? 'end' : 'middle'}>{pin.label}</text>
                ) : null}
              </g>
            );
          })}
        </g>
      );
    }

    default:
      return null;
  }
}
