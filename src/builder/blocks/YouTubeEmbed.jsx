import React from 'react';
import { useNode } from '@craftjs/core';

export function YouTubeEmbed({ videoId, aspectRatio, borderRadius }) {
  const { connectors: { connect, drag }, selected } = useNode((node) => ({
    selected: node.events.selected,
  }));

  return (
    <div
      ref={(ref) => connect(drag(ref))}
      className={`builder-video-embed ${selected ? 'builder-selected' : ''}`}
      style={{ borderRadius: `${borderRadius}px`, overflow: 'hidden' }}
    >
      {videoId ? (
        <div style={{ position: 'relative', paddingBottom: aspectRatio === '4:3' ? '75%' : '56.25%', height: 0 }}>
          <iframe
            src={`https://www.youtube.com/embed/${videoId}`}
            title="YouTube video"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
            }}
          />
        </div>
      ) : (
        <div className="builder-video-placeholder">
          Paste a YouTube video ID
        </div>
      )}
    </div>
  );
}

YouTubeEmbed.craft = {
  displayName: 'YouTube Video',
  props: {
    videoId: '',
    aspectRatio: '16:9',
    borderRadius: 12,
  },
  rules: { canDrag: () => true },
};

YouTubeEmbed.Settings = function YouTubeEmbedSettings() {
  const { actions: { setProp }, props } = useNode((node) => ({ props: node.data.props }));

  return (
    <div className="settings-panel-fields">
      <div className="settings-field">
        <label>YouTube Video ID</label>
        <input
          type="text"
          value={props.videoId}
          placeholder="e.g. dQw4w9WgXcQ"
          onChange={(e) => setProp((p) => { p.videoId = e.target.value; })}
        />
      </div>
      <div className="settings-field">
        <label>Aspect Ratio</label>
        <select
          value={props.aspectRatio}
          onChange={(e) => setProp((p) => { p.aspectRatio = e.target.value; })}
        >
          <option value="16:9">16:9</option>
          <option value="4:3">4:3</option>
        </select>
      </div>
      <div className="settings-field">
        <label>Border Radius</label>
        <div className="settings-range-row">
          <input
            type="range"
            min={0}
            max={24}
            value={props.borderRadius}
            onChange={(e) => setProp((p) => { p.borderRadius = parseInt(e.target.value); })}
          />
          <span>{props.borderRadius}px</span>
        </div>
      </div>
    </div>
  );
};
