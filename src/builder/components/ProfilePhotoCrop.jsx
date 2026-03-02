import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { X, Check, ZoomIn } from 'lucide-react';

/**
 * Profile photo crop/zoom modal.
 * Allows zooming and panning to select a crop area.
 */
export function ProfilePhotoCrop({ imageSrc, initialCrop, onApply, onClose }) {
  const [crop, setCrop] = useState(initialCrop?.position || { x: 0, y: 0 });
  const [zoom, setZoom] = useState(initialCrop?.zoom || 1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const onCropComplete = useCallback((croppedArea, croppedAreaPx) => {
    setCroppedAreaPixels(croppedAreaPx);
  }, []);

  const handleApply = () => {
    onApply({
      position: crop,
      zoom,
      croppedAreaPixels,
    });
  };

  return (
    <div className="crop-modal-overlay">
      <div className="crop-modal">
        <div className="crop-modal-header">
          <h3>Crop Profile Photo</h3>
          <button className="crop-modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="crop-container">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={1}
            cropShape="round"
            showGrid={false}
            onCropChange={setCrop}
            onCropComplete={onCropComplete}
            onZoomChange={setZoom}
          />
        </div>

        <div className="crop-controls">
          <div className="crop-zoom-control">
            <ZoomIn size={16} />
            <input
              type="range"
              min={1}
              max={3}
              step={0.1}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="crop-zoom-slider"
            />
            <span className="crop-zoom-value">{zoom.toFixed(1)}x</span>
          </div>
        </div>

        <div className="crop-modal-footer">
          <button className="crop-cancel-btn" onClick={onClose}>
            Cancel
          </button>
          <button className="crop-apply-btn" onClick={handleApply}>
            <Check size={16} />
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}
