import React from 'react';
import { useNode } from '@craftjs/core';
import * as LucideIcons from 'lucide-react';

export function MetricCard({ iconName, value, label, iconColor }) {
  const { connectors: { connect, drag }, selected, actions: { setProp } } = useNode((node) => ({
    selected: node.events.selected,
  }));

  const Icon = LucideIcons[iconName] || LucideIcons.BarChart3;

  return (
    <div
      ref={(ref) => connect(drag(ref))}
      className={`metric-card ${selected ? 'builder-selected' : ''}`}
    >
      <div className="metric-icon" style={{ color: iconColor || 'var(--primary)' }}>
        <Icon size={24} />
      </div>
      <div
        className="metric-value"
        contentEditable={true}
        suppressContentEditableWarning={true}
        onBlur={(e) => setProp((p) => { p.value = e.target.innerText; })}
      >
        {value}
      </div>
      <div
        className="metric-label"
        contentEditable={true}
        suppressContentEditableWarning={true}
        onBlur={(e) => setProp((p) => { p.label = e.target.innerText; })}
      >
        {label}
      </div>
    </div>
  );
}

MetricCard.craft = {
  displayName: 'Metric Card',
  props: {
    iconName: 'BarChart3',
    value: '100',
    label: 'Metric Label',
    iconColor: '',
  },
  rules: { canDrag: () => true },
};

MetricCard.Settings = function MetricCardSettings() {
  const { actions: { setProp }, props } = useNode((node) => ({ props: node.data.props }));

  return (
    <div className="settings-panel-fields">
      <div className="settings-field">
        <label>Value</label>
        <input
          type="text"
          value={props.value}
          onChange={(e) => setProp((p) => { p.value = e.target.value; })}
        />
      </div>
      <div className="settings-field">
        <label>Label</label>
        <input
          type="text"
          value={props.label}
          onChange={(e) => setProp((p) => { p.label = e.target.value; })}
        />
      </div>
      <div className="settings-field">
        <label>Icon Color</label>
        <input
          type="color"
          value={props.iconColor || '#0068FF'}
          onChange={(e) => setProp((p) => { p.iconColor = e.target.value; })}
        />
      </div>
    </div>
  );
};
