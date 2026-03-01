import React, { useState, useEffect, useRef } from 'react';
import { Upload, Trash2, Link as LinkIcon } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function AdminMedia() {
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchMedia();
  }, []);

  async function fetchMedia() {
    if (!supabase) {
      setLoading(false);
      return;
    }

    try {
      const { data } = await supabase
        .from('media')
        .select('*')
        .order('created_at', { ascending: false });

      setMedia(data || []);
    } catch {
      // Silent fail
    }
    setLoading(false);
  }

  async function handleUpload(e) {
    const file = e.target.files?.[0];
    if (!file || !supabase) return;

    setUploading(true);
    const fileName = `${Date.now()}-${file.name}`;

    try {
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('media')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('media')
        .getPublicUrl(fileName);

      await supabase.from('media').insert({
        type: file.type.startsWith('image/') ? 'image' : 'file',
        url: publicUrl,
        alt_text: file.name,
        sort_order: 0
      });

      fetchMedia();
    } catch (err) {
      console.error('Upload failed:', err);
    }
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  async function addYoutubeLink() {
    if (!youtubeUrl.trim() || !supabase) return;

    try {
      await supabase.from('media').insert({
        type: 'youtube',
        url: youtubeUrl.trim(),
        alt_text: 'YouTube video',
        sort_order: 0
      });

      setYoutubeUrl('');
      fetchMedia();
    } catch (err) {
      console.error('Failed to add YouTube link:', err);
    }
  }

  async function deleteMedia(item) {
    if (!supabase) return;

    try {
      // Delete from storage if it's an uploaded file
      if (item.type !== 'youtube' && item.url.includes('supabase')) {
        const path = item.url.split('/media/')[1];
        if (path) {
          await supabase.storage.from('media').remove([path]);
        }
      }

      await supabase.from('media').delete().eq('id', item.id);
      setMedia(prev => prev.filter(m => m.id !== item.id));
    } catch (err) {
      console.error('Delete failed:', err);
    }
  }

  function getYoutubeThumbnail(url) {
    try {
      const u = new URL(url);
      let videoId = u.searchParams.get('v');
      if (!videoId && u.hostname === 'youtu.be') {
        videoId = u.pathname.slice(1);
      }
      if (videoId) {
        return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
      }
    } catch { /* invalid URL */ }
    return null;
  }

  if (loading) {
    return <div className="admin-empty"><p>Loading...</p></div>;
  }

  return (
    <div>
      <h1 className="admin-page-title">Media</h1>
      <p className="admin-page-desc">Upload images and add video links</p>

      {/* Upload Area */}
      <div
        className="admin-upload-area"
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload size={24} style={{ color: 'var(--text-muted)', marginBottom: '8px' }} />
        <p>{uploading ? 'Uploading...' : 'Click to upload an image'}</p>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleUpload}
          style={{ display: 'none' }}
        />
      </div>

      {/* YouTube URL */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '32px' }}>
        <input
          className="admin-form-input"
          type="url"
          placeholder="Paste YouTube URL..."
          value={youtubeUrl}
          onChange={(e) => setYoutubeUrl(e.target.value)}
          style={{ flex: 1 }}
        />
        <button
          className="btn-primary"
          onClick={addYoutubeLink}
          disabled={!youtubeUrl.trim()}
          style={{ whiteSpace: 'nowrap' }}
        >
          <LinkIcon size={16} />
          Add Video
        </button>
      </div>

      {/* Media Grid */}
      {media.length === 0 ? (
        <div className="admin-empty">
          <p>No media uploaded yet.</p>
        </div>
      ) : (
        <div className="admin-media-grid">
          {media.map((item) => (
            <div key={item.id} className="admin-media-card">
              {item.type === 'youtube' ? (
                <img
                  className="admin-media-thumb"
                  src={getYoutubeThumbnail(item.url) || ''}
                  alt={item.alt_text}
                />
              ) : (
                <img
                  className="admin-media-thumb"
                  src={item.url}
                  alt={item.alt_text}
                />
              )}
              <div className="admin-media-info">
                <div className="admin-media-name">{item.alt_text || 'Untitled'}</div>
                <div className="admin-media-meta">
                  {item.type === 'youtube' ? 'YouTube' : 'Image'}
                  {item.project_id && ` • Project linked`}
                </div>
              </div>
              <div className="admin-media-actions">
                <button onClick={() => window.open(item.url, '_blank')}>
                  Open
                </button>
                <button className="delete" onClick={() => deleteMedia(item)}>
                  <Trash2 size={12} style={{ marginRight: '4px' }} />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
