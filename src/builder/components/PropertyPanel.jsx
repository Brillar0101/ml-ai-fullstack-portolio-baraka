import React from 'react';
import { useEditor } from '@craftjs/core';
import { Trash2, Copy } from 'lucide-react';

export function PropertyPanel() {
  const { selectedNodeId, selectedName, selectedSettings, isDeletable, actions } = useEditor((state, query) => {
    let nodeId = null;

    // Get selected node ID safely
    if (state.events.selected) {
      const sel = state.events.selected;
      if (typeof sel.values === 'function') {
        nodeId = sel.values().next().value || null;
      } else if (sel.size > 0) {
        nodeId = [...sel][0];
      }
    }

    if (!nodeId || !state.nodes[nodeId]) {
      return { selectedNodeId: null };
    }

    const node = state.nodes[nodeId];
    return {
      selectedNodeId: nodeId,
      selectedName: node.data.displayName || node.data.name || 'Element',
      selectedSettings: node.related?.settings || null,
      isDeletable: nodeId !== 'ROOT',
    };
  });

  const handleDelete = () => {
    if (selectedNodeId) {
      actions.delete(selectedNodeId);
    }
  };

  if (!selectedNodeId) {
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

  const SettingsComponent = selectedSettings;

  return (
    <div className="builder-properties">
      <div className="builder-properties-header">
        <h3>{selectedName}</h3>
        <div className="builder-properties-actions">
          {isDeletable && (
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
          <p className="builder-properties-empty">No settings for this element.</p>
        )}
      </div>
    </div>
  );
}
