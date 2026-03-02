import React from 'react';
import { useNode } from '@craftjs/core';

export function ButtonGroup({ buttons }) {
  const { connectors: { connect, drag }, selected } = useNode((node) => ({
    selected: node.events.selected,
  }));

  return (
    <div
      ref={(ref) => connect(drag(ref))}
      className={`header-ctas ${selected ? 'builder-selected' : ''}`}
    >
      {buttons.map((btn, i) => (
        <a
          key={i}
          href={btn.link}
          className={btn.variant === 'primary' ? 'cta-primary' : 'cta-secondary'}
          target={btn.link.startsWith('http') ? '_blank' : undefined}
          rel={btn.link.startsWith('http') ? 'noopener noreferrer' : undefined}
          onClick={(e) => e.preventDefault()}
        >
          {btn.text}
        </a>
      ))}
    </div>
  );
}

ButtonGroup.craft = {
  displayName: 'Button Group',
  props: {
    buttons: [
      { text: 'Primary Action', link: '#', variant: 'primary' },
      { text: 'Secondary', link: '#', variant: 'secondary' },
    ],
  },
  rules: { canDrag: () => true },
};

ButtonGroup.Settings = function ButtonGroupSettings() {
  const { actions: { setProp }, props } = useNode((node) => ({ props: node.data.props }));

  const updateButton = (index, field, value) => {
    setProp((p) => {
      p.buttons = p.buttons.map((btn, i) =>
        i === index ? { ...btn, [field]: value } : btn
      );
    });
  };

  const addButton = () => {
    setProp((p) => {
      p.buttons = [...p.buttons, { text: 'New Button', link: '#', variant: 'secondary' }];
    });
  };

  const removeButton = (index) => {
    setProp((p) => {
      p.buttons = p.buttons.filter((_, i) => i !== index);
    });
  };

  return (
    <div className="settings-panel-fields">
      {props.buttons.map((btn, i) => (
        <div key={i} className="settings-field-group">
          <div className="settings-field-group-header">
            <span>Button {i + 1}</span>
            {props.buttons.length > 1 && (
              <button className="settings-remove-btn" onClick={() => removeButton(i)}>Remove</button>
            )}
          </div>
          <div className="settings-field">
            <label>Text</label>
            <input
              type="text"
              value={btn.text}
              onChange={(e) => updateButton(i, 'text', e.target.value)}
            />
          </div>
          <div className="settings-field">
            <label>Link</label>
            <input
              type="text"
              value={btn.link}
              onChange={(e) => updateButton(i, 'link', e.target.value)}
            />
          </div>
          <div className="settings-field">
            <label>Variant</label>
            <select
              value={btn.variant}
              onChange={(e) => updateButton(i, 'variant', e.target.value)}
            >
              <option value="primary">Primary</option>
              <option value="secondary">Secondary</option>
            </select>
          </div>
        </div>
      ))}
      <button className="settings-add-btn" onClick={addButton}>+ Add Button</button>
    </div>
  );
};
