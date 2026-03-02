import React, { useState, useCallback } from 'react';
import { Save, Crop, User } from 'lucide-react';
import { CONFIG } from '../../config';
import { supabase } from '../../lib/supabase';
import { ProfilePhotoCrop } from '../../builder/components/ProfilePhotoCrop';
import '../../builder/styles/editor.css';

export default function AdminSettings() {
  const [settings, setSettings] = useState({
    name: CONFIG.name,
    title: CONFIG.title,
    tagline: CONFIG.tagline,
    email: CONFIG.email,
    phone: CONFIG.phone,
    location: CONFIG.location,
    github: CONFIG.github,
    linkedin: CONFIG.linkedin,
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [showCrop, setShowCrop] = useState(false);
  const [photoCrop, setPhotoCrop] = useState(() => {
    try {
      const saved = localStorage.getItem('profile_photo_crop');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const handleChange = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleCropApply = (cropData) => {
    setPhotoCrop(cropData);
    localStorage.setItem('profile_photo_crop', JSON.stringify(cropData));
    setShowCrop(false);

    if (supabase) {
      supabase
        .from('site_settings')
        .upsert({ key: 'profile_photo_crop', value: cropData }, { onConflict: 'key' })
        .then(() => {})
        .catch(() => {});
    }
  };

  const handleSave = useCallback(async () => {
    setSaving(true);
    setMessage('');

    if (supabase) {
      try {
        for (const [key, value] of Object.entries(settings)) {
          await supabase
            .from('site_settings')
            .upsert({ key, value: JSON.stringify(value) }, { onConflict: 'key' });
        }
        setMessage('Settings saved successfully!');
      } catch (err) {
        setMessage(`Error: ${err.message}`);
      }
    } else {
      localStorage.setItem('site_settings', JSON.stringify(settings));
      setMessage('Settings saved to local storage.');
    }

    setSaving(false);
    setTimeout(() => setMessage(''), 3000);
  }, [settings]);

  return (
    <div>
      <h1 className="admin-page-title">Site Settings</h1>
      <p className="admin-page-desc">Manage your portfolio's global settings.</p>

      {message && (
        <div style={{
          padding: '12px 16px',
          marginBottom: '24px',
          background: message.startsWith('Error') ? 'rgba(239, 68, 68, 0.1)' : 'rgba(34, 197, 94, 0.1)',
          border: `1px solid ${message.startsWith('Error') ? 'rgba(239, 68, 68, 0.3)' : 'rgba(34, 197, 94, 0.3)'}`,
          borderRadius: 'var(--radius-md)',
          color: message.startsWith('Error') ? '#ef4444' : '#22c55e',
          fontSize: '14px',
        }}>
          {message}
        </div>
      )}

      <div style={{ maxWidth: '600px' }}>
        {/* Profile Photo Section */}
        <div className="admin-form-group">
          <label className="admin-form-label">Profile Photo</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              overflow: 'hidden',
              border: '1px solid var(--border)',
              background: 'var(--bg-secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <img
                src="/assets/images/profile.jpg"
                alt="Profile"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  transform: photoCrop ? `scale(${photoCrop.zoom})` : undefined,
                  transformOrigin: photoCrop ? `${50 - photoCrop.position.x}% ${50 - photoCrop.position.y}%` : undefined,
                }}
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            </div>
            <button
              className="admin-login-btn"
              style={{ padding: '8px 16px', fontSize: '13px' }}
              onClick={() => setShowCrop(true)}
            >
              <Crop size={14} />
              Crop & Zoom
            </button>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>
            Upload your photo to <code>public/assets/images/profile.jpg</code>
          </p>
        </div>

        <div className="admin-form-group">
          <label className="admin-form-label">Name</label>
          <input
            className="admin-form-input"
            value={settings.name}
            onChange={(e) => handleChange('name', e.target.value)}
          />
        </div>

        <div className="admin-form-group">
          <label className="admin-form-label">Title / Role</label>
          <input
            className="admin-form-input"
            value={settings.title}
            onChange={(e) => handleChange('title', e.target.value)}
          />
        </div>

        <div className="admin-form-group">
          <label className="admin-form-label">Tagline</label>
          <input
            className="admin-form-input"
            value={settings.tagline}
            onChange={(e) => handleChange('tagline', e.target.value)}
          />
        </div>

        <div className="admin-form-group">
          <label className="admin-form-label">Email</label>
          <input
            className="admin-form-input"
            type="email"
            value={settings.email}
            onChange={(e) => handleChange('email', e.target.value)}
          />
        </div>

        <div className="admin-form-group">
          <label className="admin-form-label">Phone</label>
          <input
            className="admin-form-input"
            value={settings.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
          />
        </div>

        <div className="admin-form-group">
          <label className="admin-form-label">Location</label>
          <input
            className="admin-form-input"
            value={settings.location}
            onChange={(e) => handleChange('location', e.target.value)}
          />
        </div>

        <div className="admin-form-group">
          <label className="admin-form-label">GitHub URL</label>
          <input
            className="admin-form-input"
            value={settings.github}
            onChange={(e) => handleChange('github', e.target.value)}
          />
        </div>

        <div className="admin-form-group">
          <label className="admin-form-label">LinkedIn URL</label>
          <input
            className="admin-form-input"
            value={settings.linkedin}
            onChange={(e) => handleChange('linkedin', e.target.value)}
          />
        </div>

        <button
          className="admin-login-btn"
          onClick={handleSave}
          disabled={saving}
          style={{ marginTop: '8px' }}
        >
          <Save size={16} />
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      {showCrop && (
        <ProfilePhotoCrop
          imageSrc="/assets/images/profile.jpg"
          initialCrop={photoCrop}
          onApply={handleCropApply}
          onClose={() => setShowCrop(false)}
        />
      )}
    </div>
  );
}
