import React from 'react';
import { useEditor } from '@craftjs/core';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Undo2, Redo2, Save, Eye, Monitor, Tablet, Smartphone, Upload } from 'lucide-react';

const PAGES = [
  { slug: '/', label: 'Home' },
  { slug: '/about', label: 'About' },
  { slug: '/projects', label: 'Projects' },
  { slug: '/blog', label: 'Blog' },
  { slug: '/contact', label: 'Contact' },
];

export function EditorToolbar({ currentPage, onPageChange, onSave, onPublish, saving, preview, onPreviewToggle, viewport, onViewportChange }) {
  const navigate = useNavigate();
  const { canUndo, canRedo, actions } = useEditor((state, query) => {
    try {
      return {
        canUndo: query.history?.canUndo() || false,
        canRedo: query.history?.canRedo() || false,
      };
    } catch {
      return { canUndo: false, canRedo: false };
    }
  });

  return (
    <div className="builder-toolbar">
      <div className="builder-toolbar-left">
        <button
          className="builder-toolbar-btn"
          onClick={() => navigate('/admin')}
          title="Back to Admin"
        >
          <ArrowLeft size={16} />
          <span>Back</span>
        </button>
        <div className="builder-toolbar-divider" />
        <select
          className="builder-page-select"
          value={currentPage}
          onChange={(e) => onPageChange(e.target.value)}
        >
          {PAGES.map((p) => (
            <option key={p.slug} value={p.slug}>{p.label}</option>
          ))}
        </select>
      </div>

      <div className="builder-toolbar-center">
        <button
          className="builder-toolbar-btn"
          onClick={() => actions.history.undo()}
          disabled={!canUndo}
          title="Undo (Ctrl+Z)"
        >
          <Undo2 size={16} />
        </button>
        <button
          className="builder-toolbar-btn"
          onClick={() => actions.history.redo()}
          disabled={!canRedo}
          title="Redo (Ctrl+Shift+Z)"
        >
          <Redo2 size={16} />
        </button>

        <div className="builder-toolbar-divider" />

        <button
          className={`builder-toolbar-btn ${viewport === 'desktop' ? 'active' : ''}`}
          onClick={() => onViewportChange('desktop')}
          title="Desktop"
        >
          <Monitor size={16} />
        </button>
        <button
          className={`builder-toolbar-btn ${viewport === 'tablet' ? 'active' : ''}`}
          onClick={() => onViewportChange('tablet')}
          title="Tablet"
        >
          <Tablet size={16} />
        </button>
        <button
          className={`builder-toolbar-btn ${viewport === 'mobile' ? 'active' : ''}`}
          onClick={() => onViewportChange('mobile')}
          title="Mobile"
        >
          <Smartphone size={16} />
        </button>
      </div>

      <div className="builder-toolbar-right">
        <button
          className={`builder-toolbar-btn ${preview ? 'active' : ''}`}
          onClick={onPreviewToggle}
          title="Preview"
        >
          <Eye size={16} />
          <span>Preview</span>
        </button>
        <button
          className="builder-toolbar-btn builder-save-btn"
          onClick={onSave}
          disabled={saving}
        >
          <Save size={16} />
          <span>{saving ? 'Saving...' : 'Save'}</span>
        </button>
        <button
          className="builder-toolbar-btn builder-publish-btn"
          onClick={onPublish}
        >
          <Upload size={16} />
          <span>Publish</span>
        </button>
      </div>
    </div>
  );
}
