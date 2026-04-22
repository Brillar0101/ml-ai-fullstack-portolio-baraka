import React, { useState, useEffect, useRef, useCallback, lazy, Suspense } from 'react';
import { Link } from 'react-router-dom';
import { usePublicPage } from '../hooks/usePublicPage';
import { CONFIG } from '../config';
import './HomePage.css';

const PageRenderer = lazy(() => import('../builder/components/PageRenderer').then(m => ({ default: m.PageRenderer })));

const YOUTUBE_VIDEO_ID = 'oqUrfFeTF88';

const HomePage = () => {
  const { content: builderContent, loading: builderLoading } = usePublicPage('/');
  const playerRef = useRef(null);
  const containerRef = useRef(null);

  const [videoActivated, setVideoActivated] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return undefined;
    const mql = window.matchMedia('(max-width: 640px)');
    const update = () => setIsMobile(mql.matches);
    update();
    mql.addEventListener('change', update);
    return () => mql.removeEventListener('change', update);
  }, []);

  const shouldDefer =
    isMobile ||
    (typeof navigator !== 'undefined' && navigator.connection?.saveData === true);

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
    // Only load/initialize the YouTube IFrame API when we're actually
    // rendering the iframe container (desktop, or after user activation).
    if (shouldDefer && !videoActivated) return undefined;

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
  }, [onPlayerReady, onPlayerStateChange, shouldDefer, videoActivated]);

  if (builderLoading) return <div style={{ minHeight: '100vh' }} />;
  if (builderContent) return (
    <Suspense fallback={<div style={{ minHeight: '100vh' }} />}>
      <PageRenderer craftState={builderContent} />
    </Suspense>
  );

  const githubUrl = `https://${CONFIG.github}`;
  const linkedinUrl = `https://${CONFIG.linkedin}`;

  const renderIframePlayer = !shouldDefer || videoActivated;

  return (
    <div className="home-root">
      {/* Background YouTube video (or lite-youtube poster on mobile / save-data) */}
      <div className="home-video-bg">
        {renderIframePlayer ? (
          <div ref={containerRef} />
        ) : (
          <button
            type="button"
            className="home-lite-yt"
            aria-label="Play background video"
            onClick={() => setVideoActivated(true)}
          >
            <img
              className="home-lite-yt-poster"
              src={`https://img.youtube.com/vi/${YOUTUBE_VIDEO_ID}/maxresdefault.jpg`}
              alt=""
            />
            <span className="home-lite-yt-play" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
            </span>
          </button>
        )}
      </div>

      {/* Hero */}
      <section className="home-hero">
        <div className="home-hero-overlay" />

        <div className="home-hero-inner">
          <div className="home-eyebrow">
            COMPUTER ENGINEER <span className="sep">·</span> <b>VIRGINIA TECH</b>
          </div>

          <h1 className="home-h1">Barakaeli Lawuo</h1>

          <p className="home-subhead">
            My work lies at the intersection of cybersecurity, artificial intelligence, and embedded systems.
          </p>

          <div className="home-meta">
            <span className="home-meta-by">B.S. Computer Engineering</span>
            <span className="home-meta-divider" />
            <span className="home-meta-white">Class of 2027</span>
          </div>

          <div className="home-actions">
            <Link to="/projects" className="home-btn-primary">
              View Projects &nbsp;→
            </Link>
            <div className="home-socials">
              <a
                className="home-social"
                href={githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12 .5C5.73.5.5 5.73.5 12a11.5 11.5 0 0 0 7.86 10.92c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.53-1.34-1.3-1.7-1.3-1.7-1.06-.72.08-.7.08-.7 1.17.08 1.78 1.2 1.78 1.2 1.04 1.78 2.73 1.27 3.4.97.1-.76.4-1.27.74-1.56-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.18-3.1-.12-.3-.51-1.48.11-3.08 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.78 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.6.24 2.78.12 3.08.74.81 1.18 1.84 1.18 3.1 0 4.42-2.7 5.39-5.26 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 23.5 12C23.5 5.73 18.27.5 12 .5Z"/>
                </svg>
              </a>
              <a
                className="home-social"
                href={linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.13 1.45-2.13 2.94v5.67H9.35V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.38-1.85 3.61 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.07 2.07 0 1 1 0-4.13 2.07 2.07 0 0 1 0 4.13ZM7.12 20.45H3.56V9h3.56v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45C23.2 24 24 23.23 24 22.28V1.72C24 .77 23.2 0 22.22 0Z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
