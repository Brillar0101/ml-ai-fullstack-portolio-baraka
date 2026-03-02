import React from 'react';
import { useNode } from '@craftjs/core';
import * as LucideIcons from 'lucide-react';

const ICON_OPTIONS = [
  'Brain', 'Globe', 'Cpu', 'Wrench', 'Target', 'GraduationCap',
  'FileText', 'Mail', 'Code', 'Layers', 'Zap', 'Shield',
  'Monitor', 'Gamepad2', 'Heart', 'Star', 'Settings', 'Users',
];

export function SectionHeader({ heading, iconName }) {
  const { connectors: { connect, drag }, selected, actions: { setProp } } = useNode((node) => ({
    selected: node.events.selected,
  }));

  const Icon = LucideIcons[iconName] || LucideIcons.Layers;

  return (
    <div
      ref={(ref) => connect(drag(ref))}
      className={`section-header ${selected ? 'builder-selected' : ''}`}
    >
      <Icon size={20} />
      <h2
        contentEditable={true}
        suppressContentEditableWarning={true}
        onBlur={(e) => setProp((props) => { props.heading = e.target.innerText; })}
      >
        {heading}
      </h2>
    </div>
  );
}

SectionHeader.craft = {
  displayName: 'Section Header',
  props: {
    heading: 'Section Title',
    iconName: 'Layers',
  },
  rules: { canDrag: () => true },
};

SectionHeader.Settings = function SectionHeaderSettings() {
  const { actions: { setProp }, props } = useNode((node) => ({ props: node.data.props }));

  return (
    <div className="settings-panel-fields">
      <div className="settings-field">
        <label>Heading</label>
        <input
          type="text"
          value={props.heading}
          onChange={(e) => setProp((p) => { p.heading = e.target.value; })}
        />
      </div>
      <div className="settings-field">
        <label>Icon</label>
        <select
          value={props.iconName}
          onChange={(e) => setProp((p) => { p.iconName = e.target.value; })}
        >
          {ICON_OPTIONS.map((name) => (
            <option key={name} value={name}>{name}</option>
          ))}
        </select>
      </div>
    </div>
  );
};
