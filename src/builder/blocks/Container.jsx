import React from 'react';
import { useNode } from '@craftjs/core';

export function Container({ padding, background, borderRadius, maxWidth, children }) {
  const { connectors: { connect, drag }, selected } = useNode((node) => ({
    selected: node.events.selected,
  }));

  return (
    <div
      ref={(ref) => connect(drag(ref))}
      className={`${selected ? 'builder-selected' : ''}`}
      style={{
        padding: `${padding}px`,
        background: background || undefined,
        borderRadius: `${borderRadius}px`,
        maxWidth: maxWidth ? `${maxWidth}px` : undefined,
        margin: maxWidth ? '0 auto' : undefined,
      }}
    >
      {children}
    </div>
  );
}

Container.craft = {
  displayName: 'Container',
  props: {
    padding: 0,
    background: '',
    borderRadius: 0,
    maxWidth: 0,
  },
  rules: { canDrag: () => true, canMoveIn: () => true },
};

Container.Settings = function ContainerSettings() {
  const { actions: { setProp }, props } = useNode((node) => ({ props: node.data.props }));

  return (
    <div className="settings-panel-fields">
      <div className="settings-field">
        <label>Padding</label>
        <div className="settings-range-row">
          <input
            type="range"
            min={0}
            max={80}
            value={props.padding}
            onChange={(e) => setProp((p) => { p.padding = parseInt(e.target.value); })}
          />
          <span>{props.padding}px</span>
        </div>
      </div>
      <div className="settings-field">
        <label>Max Width (0 = none)</label>
        <input
          type="number"
          min={0}
          max={1400}
          value={props.maxWidth}
          onChange={(e) => setProp((p) => { p.maxWidth = parseInt(e.target.value) || 0; })}
        />
      </div>
      <div className="settings-field">
        <label>Border Radius</label>
        <div className="settings-range-row">
          <input
            type="range"
            min={0}
            max={32}
            value={props.borderRadius}
            onChange={(e) => setProp((p) => { p.borderRadius = parseInt(e.target.value); })}
          />
          <span>{props.borderRadius}px</span>
        </div>
      </div>
      <div className="settings-field">
        <label>Background</label>
        <input
          type="color"
          value={props.background || '#ffffff'}
          onChange={(e) => setProp((p) => { p.background = e.target.value; })}
        />
      </div>
    </div>
  );
};
