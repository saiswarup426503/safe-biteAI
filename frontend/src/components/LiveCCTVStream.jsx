import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { Play, Pause, RefreshCw, Volume2, VolumeX, Radio } from 'lucide-react';

export default function LiveCCTVStream({ streamUrl, restaurantName }) {
  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !streamUrl) return;

    setIsLoading(true);
    setHasError(false);

    // If Hls.js is supported
    if (Hls.isSupported()) {
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }

      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
      });
      hlsRef.current = hls;

      hls.loadSource(streamUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setIsLoading(false);
        video.play()
          .then(() => setIsPlaying(true))
          .catch(() => {
            // Auto-play was prevented (often because of muted state required)
            video.muted = true;
            setIsMuted(true);
            video.play().then(() => setIsPlaying(true));
          });
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        console.error('HLS.js Error:', data);
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              hls.recoverMediaError();
              break;
            default:
              setHasError(true);
              setIsLoading(false);
              hls.destroy();
              break;
          }
        }
      });
    } 
    // Fallback for native Safari HLS support
    else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
      video.addEventListener('loadedmetadata', () => {
        setIsLoading(false);
        video.play()
          .then(() => setIsPlaying(true))
          .catch(() => {
            video.muted = true;
            setIsMuted(true);
            video.play().then(() => setIsPlaying(true));
          });
      });

      video.addEventListener('error', () => {
        setHasError(true);
        setIsLoading(false);
      });
    } else {
      setHasError(true);
      setIsLoading(false);
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [streamUrl]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(err => console.error(err));
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleReload = () => {
    if (hlsRef.current && streamUrl) {
      setIsLoading(true);
      setHasError(false);
      hlsRef.current.loadSource(streamUrl);
      hlsRef.current.startLoad();
    } else if (videoRef.current) {
      videoRef.current.load();
    }
  };

  return (
    <div className="video-player-wrapper">
      {/* CCTV Status Badge Overlay */}
      <div className="stream-status-overlay">
        <div className="live-pulse-dot"></div>
        <span style={{ color: '#fff', fontSize: '0.65rem', fontWeight: '800' }}>Live Kitchen Feed</span>
      </div>

      <div className="stream-watermark">
        CAM_01_BACK_HOUSE
      </div>

      {hasError ? (
        <div style={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-secondary)',
          background: '#151b2c',
          padding: '1.5rem',
          textAlign: 'center'
        }}>
          <Radio size={36} color="var(--color-red)" style={{ marginBottom: '0.5rem' }} />
          <p style={{ fontWeight: '700', color: '#fff', fontSize: '0.9rem' }}>Feed Connection Failed</p>
          <p style={{ fontSize: '0.75rem', marginTop: '0.25rem', marginBottom: '1rem' }}>RTSP stream multiplexer offline</p>
          <button 
            onClick={handleReload}
            style={{
              padding: '0.35rem 0.75rem',
              borderRadius: '6px',
              border: '1px solid var(--color-orange)',
              background: 'rgba(252,128,25,0.1)',
              color: 'var(--color-orange)',
              fontSize: '0.75rem',
              fontWeight: '700',
              cursor: 'pointer'
            }}
          >
            Reconnect Stream
          </button>
        </div>
      ) : (
        <>
          <video
            ref={videoRef}
            className="cctv-video-element"
            playsInline
            muted={isMuted}
          />

          {/* Loader Overlay */}
          {isLoading && (
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: '#0b0f19',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-secondary)'
            }}>
              <RefreshCw size={24} className="spinner-icon" style={{ color: 'var(--color-orange)', marginBottom: '0.5rem' }} />
              <span style={{ fontSize: '0.75rem', fontWeight: '600' }}>Loading secure CCTV link...</span>
            </div>
          )}

          {/* Controls Overlay */}
          <div className="stream-controls-overlay">
            <button 
              onClick={togglePlay} 
              style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}
            >
              {isPlaying ? <Pause size={18} /> : <Play size={18} />}
            </button>
            
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <button 
                onClick={toggleMute} 
                style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}
              >
                {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
              </button>
              
              <button 
                onClick={handleReload} 
                style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}
              >
                <RefreshCw size={16} />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
