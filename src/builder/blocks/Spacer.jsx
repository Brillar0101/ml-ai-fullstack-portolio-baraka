import React from 'react';
import { useNode } from '@craftjs/core';

export function Spacer({ height }) {
  const { connectors: { connect, drag }, selected } = useNode((node) => ({
    selected: node.events.selected,
  }));

  return (
    <div
      ref={(ref) => connect(drag(ref))}
      className={`builder-spacer ${selected ? 'builder-selected' : ''}`}
      style={{ height: `${height}px` }}
    >
      {selected && <span className="builder-spacer-label">{height}px</span>}
    </div>
  );
}

Spacer.craft = {
  displayName: 'Spacer',
  props: { height: 32 },
  rules: { canDrag: () => true },
};

Spacer.Settings = function SpacerSettings() {
  const { actions: { setProp }, props } = useNode((node) => ({ props: node.data.props }));

  return (
    <div className="settings-panel-fields">
      <div className="settings-field">
        <label>Height</label>
        <div className="settings-range-row">
          <input
            type="range"
            min={8}
            max={120}
            value={props.height}
            onChange={(e) => setProp((p) => { p.height = parseInt(e.target.value); })}
          />
          <span>{props.height}px</span>
        </div>
      </div>
    </div>
  );
};
