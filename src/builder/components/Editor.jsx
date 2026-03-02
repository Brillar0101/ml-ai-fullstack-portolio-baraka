import React, { useState, useCallback, useEffect } from 'react';
import { Editor as CraftEditor, Frame, Element } from '@craftjs/core';
import { resolvers, Container, TextBlock, SectionHeader, GlassCard, InfoCard } from '../blocks';
import { EditorToolbar } from './EditorToolbar';
import { ComponentPalette } from './ComponentPalette';
import { PropertyPanel } from './PropertyPanel';
import { usePageContent } from '../hooks/usePageContent';
import '../styles/editor.css';
import '../styles/blocks.css';

const VIEWPORT_WIDTHS = {
  desktop: '100%',
  tablet: '768px',
  mobile: '375px',
};

// Default content when no saved state exists
function DefaultContent() {
  return (
    <Element is={Container} canvas padding={32} maxWidth={1200}>
      <SectionHeader heading="Welcome to the Page Builder" iconName="Layers" />
      <TextBlock text="Drag components from the left panel to build your page. Click on any element to edit it. Use the property panel on the right to customize." />
      <Element is={GlassCard} canvas padding={24}>
        <InfoCard title="Getting Started" subtitle="Drag and drop" body="Drag components from the palette on the left into this canvas area. Click any text to edit it inline." />
      </Element>
    </Element>
  );
}

export function PageBuilder() {
  const [currentPage, setCurrentPage] = useState('/');
  const [preview, setPreview] = useState(false);
  const [viewport, setViewport] = useState('desktop');
  const [editorRef, setEditorRef] = useState(null);
  const { content, loading, saving, saveContent, publishContent } = usePageContent(currentPage);

  const handleSave = useCallback(async () => {
    if (!editorRef) return;
    const json = editorRef.query.serialize();
    const result = await saveContent(json);
    if (result.success) {
      // Could show toast notification
    }
  }, [editorRef, saveContent]);

  const handlePublish = useCallback(async () => {
    // Save first, then publish
    await handleSave();
    const result = await publishContent();
    if (result.success) {
      alert('Page published successfully!');
    }
  }, [handleSave, publishContent]);

  const handlePageChange = useCallback(async (newSlug) => {
    // Save current page before switching
    if (editorRef) {
      const json = editorRef.query.serialize();
      await saveContent(json);
    }
    setCurrentPage(newSlug);
  }, [editorRef, saveContent]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        editorRef?.actions.history.undo();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && e.shiftKey) {
        e.preventDefault();
        editorRef?.actions.history.redo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSave, editorRef]);

  if (loading) {
    return (
      <div className="builder-loading">
        <p>Loading page builder...</p>
      </div>
    );
  }

  return (
    <CraftEditor
      resolver={resolvers}
      enabled={!preview}
      onRender={({ render }) => render}
      onNodesChange={(query) => {
        if (!editorRef) {
          setEditorRef({ query, actions: query });
        }
      }}
    >
      <EditorInner
        currentPage={currentPage}
        onPageChange={handlePageChange}
        onSave={handleSave}
        onPublish={handlePublish}
        saving={saving}
        preview={preview}
        onPreviewToggle={() => setPreview(!preview)}
        viewport={viewport}
        onViewportChange={setViewport}
        savedState={content?.craft_state}
        setEditorRef={setEditorRef}
      />
    </CraftEditor>
  );
}

function EditorInner({ currentPage, onPageChange, onSave, onPublish, saving, preview, onPreviewToggle, viewport, onViewportChange, savedState, setEditorRef }) {
  const { actions, query } = useEditor();

  // Store editor reference for parent
  useEffect(() => {
    setEditorRef({ query, actions });
  }, [query, actions, setEditorRef]);

  // Load saved state when page changes
  useEffect(() => {
    if (savedState) {
      try {
        actions.deserialize(savedState);
      } catch (err) {
        console.error('Failed to deserialize saved state:', err);
      }
    }
  }, [savedState, actions]);

  return (
    <div className={`builder-layout ${preview ? 'builder-preview-mode' : ''}`}>
      <EditorToolbar
        currentPage={currentPage}
        onPageChange={onPageChange}
        onSave={onSave}
        onPublish={onPublish}
        saving={saving}
        preview={preview}
        onPreviewToggle={onPreviewToggle}
        viewport={viewport}
        onViewportChange={onViewportChange}
      />
      {!preview && <ComponentPalette />}
      <div className="builder-canvas-wrapper">
        <div
          className="builder-canvas"
          style={{ maxWidth: VIEWPORT_WIDTHS[viewport] }}
        >
          <Frame>
            <DefaultContent />
          </Frame>
        </div>
      </div>
      {!preview && <PropertyPanel />}
    </div>
  );
}
