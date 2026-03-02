import React from 'react';
import { useNode } from '@craftjs/core';

export function TextBlock({ text, fontSize, color, textAlign }) {
  const { connectors: { connect, drag }, selected, actions: { setProp } } = useNode((node) => ({
    selected: node.events.selected,
  }));

  return (
    <div
      ref={(ref) => connect(drag(ref))}
      className={`content-block ${selected ? 'builder-selected' : ''}`}
      style={{ textAlign }}
    >
      <p
        contentEditable={true}
        suppressContentEditableWarning={true}
        onBlur={(e) => setProp((props) => { props.text = e.target.innerText; })}
        style={{ fontSize: `${fontSize}px`, color: color || undefined }}
      >
        {text}
      </p>
    </div>
  );
}

TextBlock.craft = {
  displayName: 'Text Block',
  props: {
    text: 'Edit this text...',
    fontSize: 15,
    color: '',
    textAlign: 'left',
  },
  rules: { canDrag: () => true },
};

TextBlock.Settings = function TextBlockSettings() {
  const { actions: { setProp }, props } = useNode((node) => ({ props: node.data.props }));

  return (
    <div className="settings-panel-fields">
      <div className="settings-field">
        <label>Font Size</label>
        <div className="settings-range-row">
          <input
            type="range"
            min={12}
            max={48}
            value={props.fontSize}
            onChange={(e) => setProp((p) => { p.fontSize = parseInt(e.target.value); })}
          />
          <span>{props.fontSize}px</span>
        </div>
      </div>
      <div className="settings-field">
        <label>Text Align</label>
        <select
          value={props.textAlign}
          onChange={(e) => setProp((p) => { p.textAlign = e.target.value; })}
        >
          <option value="left">Left</option>
          <option value="center">Center</option>
          <option value="right">Right</option>
        </select>
      </div>
      <div className="settings-field">
        <label>Text Color</label>
        <input
          type="color"
          value={props.color || '#000000'}
          onChange={(e) => setProp((p) => { p.color = e.target.value; })}
        />
      </div>
    </div>
  );
};
