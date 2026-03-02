import React from 'react';
import { useNode } from '@craftjs/core';

export function Divider({ thickness, color, marginY }) {
  const { connectors: { connect, drag }, selected } = useNode((node) => ({
    selected: node.events.selected,
  }));

  return (
    <div
      ref={(ref) => connect(drag(ref))}
      className={`builder-divider ${selected ? 'builder-selected' : ''}`}
      style={{ margin: `${marginY}px 0` }}
    >
      <hr style={{
        border: 'none',
        height: `${thickness}px`,
        backgroundColor: color || 'var(--border)',
      }} />
    </div>
  );
}

Divider.craft = {
  displayName: 'Divider',
  props: { thickness: 1, color: '', marginY: 24 },
  rules: { canDrag: () => true },
};

Divider.Settings = function DividerSettings() {
  const { actions: { setProp }, props } = useNode((node) => ({ props: node.data.props }));

  return (
    <div className="settings-panel-fields">
      <div className="settings-field">
        <label>Thickness</label>
        <div className="settings-range-row">
          <input
            type="range"
            min={1}
            max={8}
            value={props.thickness}
            onChange={(e) => setProp((p) => { p.thickness = parseInt(e.target.value); })}
          />
          <span>{props.thickness}px</span>
        </div>
      </div>
      <div className="settings-field">
        <label>Margin</label>
        <div className="settings-range-row">
          <input
            type="range"
            min={0}
            max={64}
            value={props.marginY}
            onChange={(e) => setProp((p) => { p.marginY = parseInt(e.target.value); })}
          />
          <span>{props.marginY}px</span>
        </div>
      </div>
      <div className="settings-field">
        <label>Color</label>
        <input
          type="color"
          value={props.color || '#e6e6e6'}
          onChange={(e) => setProp((p) => { p.color = e.target.value; })}
        />
      </div>
    </div>
  );
};
