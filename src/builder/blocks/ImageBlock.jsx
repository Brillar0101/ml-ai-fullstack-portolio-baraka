import React from 'react';
import { useNode } from '@craftjs/core';

export function ImageBlock({ src, alt, width, height, borderRadius, objectFit }) {
  const { connectors: { connect, drag }, selected } = useNode((node) => ({
    selected: node.events.selected,
  }));

  return (
    <div
      ref={(ref) => connect(drag(ref))}
      className={`builder-image-block ${selected ? 'builder-selected' : ''}`}
    >
      {src ? (
        <img
          src={src}
          alt={alt}
          style={{
            width: width ? `${width}px` : '100%',
            height: height ? `${height}px` : 'auto',
            borderRadius: `${borderRadius}px`,
            objectFit,
            display: 'block',
          }}
        />
      ) : (
        <div
          className="builder-image-placeholder"
          style={{
            width: width ? `${width}px` : '100%',
            height: height ? `${height}px` : '200px',
            borderRadius: `${borderRadius}px`,
          }}
        >
          Click to set image URL
        </div>
      )}
    </div>
  );
}

ImageBlock.craft = {
  displayName: 'Image',
  props: {
    src: '',
    alt: '',
    width: 0,
    height: 0,
    borderRadius: 8,
    objectFit: 'cover',
  },
  rules: { canDrag: () => true },
};

ImageBlock.Settings = function ImageBlockSettings() {
  const { actions: { setProp }, props } = useNode((node) => ({ props: node.data.props }));

  return (
    <div className="settings-panel-fields">
      <div className="settings-field">
        <label>Image URL</label>
        <input
          type="text"
          value={props.src}
          placeholder="/assets/images/example.jpg"
          onChange={(e) => setProp((p) => { p.src = e.target.value; })}
        />
      </div>
      <div className="settings-field">
        <label>Alt Text</label>
        <input
          type="text"
          value={props.alt}
          onChange={(e) => setProp((p) => { p.alt = e.target.value; })}
        />
      </div>
      <div className="settings-field">
        <label>Width (0 = auto)</label>
        <input
          type="number"
          min={0}
          max={1200}
          value={props.width}
          onChange={(e) => setProp((p) => { p.width = parseInt(e.target.value) || 0; })}
        />
      </div>
      <div className="settings-field">
        <label>Height (0 = auto)</label>
        <input
          type="number"
          min={0}
          max={800}
          value={props.height}
          onChange={(e) => setProp((p) => { p.height = parseInt(e.target.value) || 0; })}
        />
      </div>
      <div className="settings-field">
        <label>Border Radius</label>
        <div className="settings-range-row">
          <input
            type="range"
            min={0}
            max={50}
            value={props.borderRadius}
            onChange={(e) => setProp((p) => { p.borderRadius = parseInt(e.target.value); })}
          />
          <span>{props.borderRadius}px</span>
        </div>
      </div>
      <div className="settings-field">
        <label>Object Fit</label>
        <select
          value={props.objectFit}
          onChange={(e) => setProp((p) => { p.objectFit = e.target.value; })}
        >
          <option value="cover">Cover</option>
          <option value="contain">Contain</option>
          <option value="fill">Fill</option>
          <option value="none">None</option>
        </select>
      </div>
    </div>
  );
};
