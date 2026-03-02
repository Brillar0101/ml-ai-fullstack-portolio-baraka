import React from 'react';
import { useNode, Element } from '@craftjs/core';

export function GlassCard({ padding, children }) {
  const { connectors: { connect, drag }, selected } = useNode((node) => ({
    selected: node.events.selected,
  }));

  return (
    <div
      ref={(ref) => connect(drag(ref))}
      className={`glass-card ${selected ? 'builder-selected' : ''}`}
      style={{ padding: `${padding}px` }}
    >
      {children}
    </div>
  );
}

GlassCard.craft = {
  displayName: 'Glass Card',
  props: { padding: 24 },
  rules: { canDrag: () => true, canMoveIn: () => true },
};

GlassCard.Settings = function GlassCardSettings() {
  const { actions: { setProp }, props } = useNode((node) => ({ props: node.data.props }));

  return (
    <div className="settings-panel-fields">
      <div className="settings-field">
        <label>Padding</label>
        <div className="settings-range-row">
          <input
            type="range"
            min={0}
            max={64}
            value={props.padding}
            onChange={(e) => setProp((p) => { p.padding = parseInt(e.target.value); })}
          />
          <span>{props.padding}px</span>
        </div>
      </div>
    </div>
  );
};
