import React from 'react';
import { useEditor, Element } from '@craftjs/core';
import * as LucideIcons from 'lucide-react';
import { paletteItems } from '../blocks';

export function ComponentPalette() {
  const { connectors } = useEditor();

  return (
    <div className="builder-palette">
      <div className="builder-palette-header">
        <h3>Components</h3>
      </div>
      <div className="builder-palette-list">
        {paletteItems.map((item) => {
          const Icon = LucideIcons[item.icon] || LucideIcons.Box;
          const Component = item.component;

          // For container-type blocks, we need to use Element
          const isContainer = Component.craft?.rules?.canMoveIn;

          return (
            <div
              key={item.name}
              ref={(ref) => connectors.create(ref, isContainer
                ? <Element is={Component} canvas />
                : <Component />
              )}
              className="builder-palette-item"
            >
              <div className="builder-palette-icon">
                <Icon size={18} />
              </div>
              <div className="builder-palette-info">
                <span className="builder-palette-name">{item.component.craft?.displayName || item.name}</span>
                <span className="builder-palette-desc">{item.description}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
