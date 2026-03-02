import React from 'react';
import { Editor, Frame } from '@craftjs/core';
import { resolvers } from '../blocks';

/**
 * Read-only renderer for published page content.
 * Used by public pages to display content saved in the page builder.
 */
export function PageRenderer({ craftState }) {
  if (!craftState) return null;

  return (
    <Editor resolver={resolvers} enabled={false}>
      <Frame data={craftState} />
    </Editor>
  );
}
