import React from 'react';
import { useNode } from '@craftjs/core';

const COLUMN_OPTIONS = [
  { value: '', label: '3 columns (default)' },
  { value: 'two-col', label: '2 columns' },
  { value: 'four-col', label: '4 columns' },
  { value: 'five-col', label: '5 columns' },
];

export function CardsGrid({ columns, gap, children }) {
  const { connectors: { connect, drag }, selected } = useNode((node) => ({
    selected: node.events.selected,
  }));

  return (
    <div
      ref={(ref) => connect(drag(ref))}
      className={`cards-grid ${columns} ${selected ? 'builder-selected' : ''}`}
      style={{ gap: gap ? `${gap}px` : undefined }}
    >
      {children}
    </div>
  );
}

CardsGrid.craft = {
  displayName: 'Cards Grid',
  props: { columns: '', gap: 16 },
  rules: { canDrag: () => true, canMoveIn: () => true },
};

CardsGrid.Settings = function CardsGridSettings() {
  const { actions: { setProp }, props } = useNode((node) => ({ props: node.data.props }));

  return (
    <div className="settings-panel-fields">
      <div className="settings-field">
        <label>Columns</label>
        <select
          value={props.columns}
          onChange={(e) => setProp((p) => { p.columns = e.target.value; })}
        >
          {COLUMN_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
      <div className="settings-field">
        <label>Gap</label>
        <div className="settings-range-row">
          <input
            type="range"
            min={0}
            max={48}
            value={props.gap}
            onChange={(e) => setProp((p) => { p.gap = parseInt(e.target.value); })}
          />
          <span>{props.gap}px</span>
        </div>
      </div>
    </div>
  );
};
