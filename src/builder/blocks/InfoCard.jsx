import React from 'react';
import { useNode } from '@craftjs/core';

export function InfoCard({ title, subtitle, body, highlight }) {
  const { connectors: { connect, drag }, selected, actions: { setProp } } = useNode((node) => ({
    selected: node.events.selected,
  }));

  return (
    <div
      ref={(ref) => connect(drag(ref))}
      className={`info-card ${highlight ? 'highlight' : ''} ${selected ? 'builder-selected' : ''}`}
    >
      <h3
        contentEditable={true}
        suppressContentEditableWarning={true}
        onBlur={(e) => setProp((p) => { p.title = e.target.innerText; })}
      >
        {title}
      </h3>
      {subtitle && (
        <p
          className="info-card-subtitle"
          contentEditable={true}
          suppressContentEditableWarning={true}
          onBlur={(e) => setProp((p) => { p.subtitle = e.target.innerText; })}
        >
          {subtitle}
        </p>
      )}
      <p
        contentEditable={true}
        suppressContentEditableWarning={true}
        onBlur={(e) => setProp((p) => { p.body = e.target.innerText; })}
      >
        {body}
      </p>
    </div>
  );
}

InfoCard.craft = {
  displayName: 'Info Card',
  props: {
    title: 'Card Title',
    subtitle: '',
    body: 'Card content goes here.',
    highlight: false,
  },
  rules: { canDrag: () => true },
};

InfoCard.Settings = function InfoCardSettings() {
  const { actions: { setProp }, props } = useNode((node) => ({ props: node.data.props }));

  return (
    <div className="settings-panel-fields">
      <div className="settings-field">
        <label>Title</label>
        <input
          type="text"
          value={props.title}
          onChange={(e) => setProp((p) => { p.title = e.target.value; })}
        />
      </div>
      <div className="settings-field">
        <label>Subtitle</label>
        <input
          type="text"
          value={props.subtitle}
          onChange={(e) => setProp((p) => { p.subtitle = e.target.value; })}
        />
      </div>
      <div className="settings-field">
        <label>Body</label>
        <textarea
          value={props.body}
          onChange={(e) => setProp((p) => { p.body = e.target.value; })}
        />
      </div>
      <div className="settings-field">
        <label>
          <input
            type="checkbox"
            checked={props.highlight}
            onChange={(e) => setProp((p) => { p.highlight = e.target.checked; })}
          />
          Highlight
        </label>
      </div>
    </div>
  );
};
