import React, { useState, useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import './Gallery.css';

/**
 * Reusable image gallery with a click-to-zoom lightbox.
 * Shared by both case-study templates.
 *
 * @param {{ images: Array<{src:string, alt?:string, caption?:string}>, columns?: number }} props
 */
export default function Gallery({ images = [], columns = 3 }) {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);

  const close = useCallback(() => setOpen(false), []);
  const show = useCallback((i) => {
    setIndex(i);
    setOpen(true);
  }, []);
  const next = useCallback(
    (e) => {
      if (e) e.stopPropagation();
      setIndex((i) => (i + 1) % images.length);
    },
    [images.length]
  );
  const prev = useCallback(
    (e) => {
      if (e) e.stopPropagation();
      setIndex((i) => (i - 1 + images.length) % images.length);
    },
    [images.length]
  );

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') prev();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, close, next, prev]);

  if (!images.length) return null;

  const cols = Math.min(Math.max(columns, 1), 4);
  const current = images[index];

  return (
    <>
      <div className="cs-gallery" style={{ '--cs-gallery-cols': cols }}>
        {images.map((img, i) => (
          <button
            type="button"
            className="cs-gallery-item"
            key={i}
            onClick={() => show(i)}
            aria-label={`Open image ${i + 1} of ${images.length}`}
          >
            <img src={img.src} alt={img.alt || ''} loading="lazy" />
          </button>
        ))}
      </div>

      {open && (
        <div className="cs-lightbox" onClick={close} role="dialog" aria-modal="true">
          <button className="cs-lightbox-close" onClick={close} aria-label="Close">
            <X size={22} />
          </button>

          {images.length > 1 && (
            <button className="cs-lightbox-nav cs-lightbox-prev" onClick={prev} aria-label="Previous">
              <ChevronLeft size={28} />
            </button>
          )}

          <figure className="cs-lightbox-figure" onClick={(e) => e.stopPropagation()}>
            <img src={current.src} alt={current.alt || ''} />
            {(current.caption || current.alt) && (
              <figcaption className="cs-lightbox-caption">
                {current.caption || current.alt}
                <span className="cs-lightbox-count">
                  {index + 1} / {images.length}
                </span>
              </figcaption>
            )}
          </figure>

          {images.length > 1 && (
            <button className="cs-lightbox-nav cs-lightbox-next" onClick={next} aria-label="Next">
              <ChevronRight size={28} />
            </button>
          )}
        </div>
      )}
    </>
  );
}
