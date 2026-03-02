import React, { useState, useEffect, useRef, useCallback, lazy, Suspense } from 'react';
import { Link } from 'react-router-dom';
import { Github, Linkedin, ArrowRight } from 'lucide-react';
import { usePublicPage } from '../hooks/usePublicPage';
import { CONFIG } from '../config';
import './HomePage.css';

const PageRenderer = lazy(() => import('../builder/components/PageRenderer').then(m => ({ default: m.PageRenderer })));

const YOUTUBE_VIDEO_ID = 'oqUrfFeTF88';

const HomePage = () => {
  const { content: builderContent, loading: builderLoading } = usePublicPage('/');
  const [showName, setShowName] = useState(false);
  const [showRole, setShowRole] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const playerRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const t1 = setTimeout(() => setShowName(true), 200);
    const t2 = setTimeout(() => setShowRole(true), 700);
    const t3 = setTimeout(() => setShowContent(true), 1100);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  const onPlayerReady = useCallback((event) => {
    event.target.mute();
    event.target.playVideo();
  }, []);

  const onPlayerStateChange = useCallback((event) => {
    if (event.data === 0) {
      event.target.seekTo(0);
      event.target.playVideo();
    }
  }, []);

  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      document.head.appendChild(tag);
    }

    function createPlayer() {
      if (!containerRef.current) return;
      playerRef.current = new window.YT.Player(containerRef.current, {
        videoId: YOUTUBE_VIDEO_ID,
        playerVars: {
          autoplay: 1,
          mute: 1,
          controls: 0,
          showinfo: 0,
          rel: 0,
          modestbranding: 1,
          playsinline: 1,
          disablekb: 1,
          fs: 0,
          iv_load_policy: 3,
          vq: 'hd1080',
        },
        events: {
          onReady: onPlayerReady,
          onStateChange: onPlayerStateChange,
        },
      });
    }

    if (window.YT && window.YT.Player) {
      createPlayer();
    } else {
      window.onYouTubeIframeAPIReady = createPlayer;
    }

    return () => {
      if (playerRef.current && playerRef.current.destroy) {
        playerRef.current.destroy();
      }
    };
  }, [onPlayerReady, onPlayerStateChange]);

  if (builderLoading) return <div style={{ minHeight: '100vh' }} />;
  if (builderContent) return (
    <Suspense fallback={<div style={{ minHeight: '100vh' }} />}>
      <PageRenderer craftState={builderContent} />
    </Suspense>
  );

  return (
    <div className="hero-wrapper">
      {/* Background YouTube video */}
      <div className="hero-video-bg">
        <div ref={containerRef} />
      </div>
      <div className="hero-overlay" />

      <div className="hero-content">
        <h1 className={`hero-name ${showName ? 'visible' : ''}`}>
          {CONFIG.name}
        </h1>

        <p className={`hero-role ${showRole ? 'visible' : ''}`}>
          Computer Engineer
        </p>

        <p className={`hero-tagline ${showContent ? 'visible' : ''}`}>
          Building intelligent systems at the intersection of hardware and software.
          <br />
          ML/AI, Embedded Systems, and Hardware Design.
        </p>

        <div className={`hero-ctas ${showContent ? 'visible' : ''}`}>
          <Link to="/projects" className="btn-primary">
            View Projects
            <ArrowRight size={16} />
          </Link>
          <Link to="/contact" className="btn-secondary">
            Contact
          </Link>
        </div>

        <div className={`hero-social ${showContent ? 'visible' : ''}`}>
          <a href={`https://${CONFIG.github}`} target="_blank" rel="noopener noreferrer" aria-label="GitHub">
            <Github size={20} />
          </a>
          <a href={`https://${CONFIG.linkedin}`} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
            <Linkedin size={20} />
          </a>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
