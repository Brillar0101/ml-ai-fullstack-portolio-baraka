import React from 'react';
import './FlowDiagram.css';

/**
 * Data-driven architecture/pipeline diagram for series blog posts.
 * Declared as data in a post body, so authors never write SVG or JSX:
 *
 *   { type: 'diagram', caption, nodes: [{ label, detail? }] }
 *     -> a left-to-right pipeline with arrows (stacks vertically on mobile)
 *
 *   { type: 'diagram', caption, rows: [[{ label, detail? }], ...] }
 *     -> stacked layers top-to-bottom; nodes in a row sit side by side
 *        (use for layered architectures or fan-out/fan-in shapes)
 */
function Node({ node }) {
  return (
    <div className="flow-node">
      <span className="flow-node-label">{node.label}</span>
      {node.detail ? <span className="flow-node-detail">{node.detail}</span> : null}
    </div>
  );
}

export default function FlowDiagram({ nodes, rows, caption }) {
  const layers = rows || (nodes ? nodes.map((n) => [n]) : null);
  if (!layers || layers.length === 0) return null;
  const isPipeline = Boolean(nodes);

  return (
    <figure className={`flow-diagram ${isPipeline ? 'flow-diagram-pipeline' : 'flow-diagram-layers'}`}>
      <div className="flow-diagram-body">
        {layers.map((layer, i) => (
          <React.Fragment key={i}>
            {i > 0 && <span className="flow-arrow" aria-hidden="true">➜</span>}
            <div className="flow-row">
              {layer.map((n, j) => <Node node={n} key={j} />)}
            </div>
          </React.Fragment>
        ))}
      </div>
      {caption ? <figcaption>{caption}</figcaption> : null}
    </figure>
  );
}
