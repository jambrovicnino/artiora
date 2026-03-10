import { useRef, useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import './CameraModal.css';

export default function CameraModal({ isOpen, onClose, onCapture }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const [isStreamReady, setIsStreamReady] = useState(false);
  const [error, setError] = useState(null);

  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsStreamReady(false);
    setError(null);
  }, []);

  const handleClose = useCallback(() => {
    stopStream();
    onClose();
  }, [stopStream, onClose]);

  // Start webcam stream when modal opens
  useEffect(() => {
    if (!isOpen) return;

    let cancelled = false;

    navigator.mediaDevices
      .getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      })
      .then((stream) => {
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        streamRef.current = stream;
        // Video element is always rendered — ref should be available
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
        setIsStreamReady(true);
      })
      .catch((err) => {
        if (!cancelled) {
          console.warn('[ARTIORA] Camera error:', err);
          setError('Dostop do kamere ni mogoč. Preverite dovoljenja brskalnika.');
        }
      });

    return () => {
      cancelled = true;
      stopStream();
    };
  }, [isOpen, stopStream]);

  // Also set srcObject whenever video ref or stream changes (safety net)
  useEffect(() => {
    if (isOpen && streamRef.current && videoRef.current && !videoRef.current.srcObject) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch(() => {});
    }
  });

  function handleCapture() {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
    stopStream();
    onCapture(dataUrl);
  }

  if (!isOpen) return null;

  return createPortal(
    <div className="camera-overlay">
      <button
        className="camera-close"
        onClick={handleClose}
        aria-label="Zapri kamero"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>

      <div className="camera-content">
        {/* Error state */}
        {error && (
          <div className="camera-error">
            <p className="camera-error-text">{error}</p>
            <button className="btn-outline" onClick={handleClose}>
              ZAPRI
            </button>
          </div>
        )}

        {/* Loading state */}
        {!isStreamReady && !error && (
          <div className="camera-loading">
            <div className="camera-loading-spinner" />
            <p className="camera-loading-text">
              Dovolite dostop do kamere...
            </p>
          </div>
        )}

        {/* Video is ALWAYS rendered (not conditional) — just hidden while loading */}
        <div
          className="camera-video-wrapper"
          style={{ display: isStreamReady && !error ? 'block' : 'none' }}
        >
          <video
            ref={videoRef}
            className="camera-video"
            autoPlay
            playsInline
            muted
          />
        </div>

        {isStreamReady && !error && (
          <button
            className="camera-capture-btn"
            onClick={handleCapture}
            aria-label="Zajemi fotografijo"
          />
        )}

        <canvas ref={canvasRef} className="camera-canvas" />
      </div>
    </div>,
    document.body
  );
}
