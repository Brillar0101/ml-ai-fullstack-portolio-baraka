import React from 'react';
import { useEditor } from '@craftjs/core';
import { Trash2, Copy, ChevronUp, ChevronDown } from 'lucide-react';

export function PropertyPanel() {
  const { selected, actions, query } = useEditor((state) => {
    const currentNodeId = state.events.selected?.values().next().value;
    let selected;

    if (currentNodeId) {
      const node = state.nodes[currentNodeId];
      if (node) {
        selected = {
          id: currentNodeId,
          name: node.data.displayName || node.data.custom?.displayName || node.data.type?.craft?.displayName || 'Element',
          settings: node.related?.settings,
          isDeletable: query.node(currentNodeId).isDeletable(),
        };
      }
    }

    return { selected };
  });

  const handleDelete = () => {
    if (selected?.id) {
      actions.delete(selected.id);
    }
  };

  const handleDuplicate = () => {
    if (selected?.id) {
      const node = query.node(selected.id).get();
      const parentId = node.data.parent;
      const serialized = query.node(selected.id).toSerializedNode();
      // Clone and add to parent
      const freshNode = query.parseFreshNode({
        data: {
          ...serialized,
          parent: parentId,
        },
      }).toNode();
      actions.add(freshNode, parentId);
    }
  };

  if (!selected) {
    return (
      <div className="builder-properties">
        <div className="builder-properties-header">
          <h3>Properties</h3>
        </div>
        <div className="builder-properties-empty">
          <p>Select an element to edit its properties</p>
        </div>
      </div>
    );
  }

  const SettingsComponent = selected.settings;

  return (
    <div className="builder-properties">
      <div className="builder-properties-header">
        <h3>{selected.name}</h3>
        <div className="builder-properties-actions">
          <button
            className="builder-prop-action-btn"
            onClick={handleDuplicate}
            title="Duplicate"
          >
            <Copy size={14} />
          </button>
          {selected.isDeletable && (
            <button
              className="builder-prop-action-btn builder-prop-delete"
              onClick={handleDelete}
              title="Delete"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>
      <div className="builder-properties-content">
        {SettingsComponent ? (
          <SettingsComponent />
        ) : (
          <p className="builder-properties-empty">No settings available for this element.</p>
        )}
      </div>
    </div>
  );
}
