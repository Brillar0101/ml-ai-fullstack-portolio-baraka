import React from 'react';
import { useNode } from '@craftjs/core';

export function TagList({ tags }) {
  const { connectors: { connect, drag }, selected } = useNode((node) => ({
    selected: node.events.selected,
  }));

  return (
    <div
      ref={(ref) => connect(drag(ref))}
      className={`project-tags ${selected ? 'builder-selected' : ''}`}
    >
      {tags.map((tag, i) => (
        <span key={i} className="tag">{tag}</span>
      ))}
    </div>
  );
}

TagList.craft = {
  displayName: 'Tag List',
  props: {
    tags: ['Tag 1', 'Tag 2', 'Tag 3'],
  },
  rules: { canDrag: () => true },
};

TagList.Settings = function TagListSettings() {
  const { actions: { setProp }, props } = useNode((node) => ({ props: node.data.props }));

  const updateTag = (index, value) => {
    setProp((p) => {
      p.tags = p.tags.map((t, i) => i === index ? value : t);
    });
  };

  const addTag = () => {
    setProp((p) => { p.tags = [...p.tags, 'New Tag']; });
  };

  const removeTag = (index) => {
    setProp((p) => { p.tags = p.tags.filter((_, i) => i !== index); });
  };

  return (
    <div className="settings-panel-fields">
      {props.tags.map((tag, i) => (
        <div key={i} className="settings-field settings-inline">
          <input
            type="text"
            value={tag}
            onChange={(e) => updateTag(i, e.target.value)}
          />
          <button className="settings-remove-btn" onClick={() => removeTag(i)}>×</button>
        </div>
      ))}
      <button className="settings-add-btn" onClick={addTag}>+ Add Tag</button>
    </div>
  );
};
