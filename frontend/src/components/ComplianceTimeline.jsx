import React, { useState, useEffect, useRef } from 'react';
import { ShieldCheck, ShieldAlert, Clock, Image as ImageIcon, AlertTriangle, CheckCircle, HelpCircle } from 'lucide-react';

export default function ComplianceTimeline({ timeline }) {
  const [selectedIdx, setSelectedIdx] = useState(null);
  const imgRef = useRef(null);
  const canvasRef = useRef(null);
  const observerRef = useRef(null);

  // Default to the most recent snapshot (last item in list)
  useEffect(() => {
    if (timeline && timeline.length > 0) {
      setSelectedIdx(timeline.length - 1);
    } else {
      setSelectedIdx(null);
    }
  }, [timeline]);

  const selectedItem = selectedIdx !== null ? timeline[selectedIdx] : null;

  // Redraw predictions bounding boxes on canvas
  const drawBoxes = () => {
    const img = imgRef.current;
    const canvas = canvasRef.current;
    if (!img || !canvas || !selectedItem) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions matching current displayed image dimensions
    const displayWidth = img.clientWidth;
    const displayHeight = img.clientHeight;
    
    canvas.width = displayWidth;
    canvas.height = displayHeight;
    
    ctx.clearRect(0, 0, displayWidth, displayHeight);

    const naturalWidth = img.naturalWidth;
    const naturalHeight = img.naturalHeight;

    if (!naturalWidth || !naturalHeight) return;

    const scaleX = displayWidth / naturalWidth;
    const scaleY = displayHeight / naturalHeight;

    const predictions = selectedItem.predictions || [];
    
    predictions.forEach(pred => {
      const [x1, y1, x2, y2] = pred.bbox;
      const rx = x1 * scaleX;
      const ry = y1 * scaleY;
      const rw = (x2 - x1) * scaleX;
      const rh = (y2 - y1) * scaleY;

      // Class-specific styling
      let strokeColor = '#10b981'; // Green for glove/success
      let labelBg = 'rgba(16, 185, 129, 0.85)';
      
      if (pred.label === 'cap') {
        strokeColor = '#3b82f6'; // Blue for cap
        labelBg = 'rgba(59, 130, 246, 0.85)';
      } else if (pred.label === 'apron') {
        strokeColor = '#f59e0b'; // Amber for apron
        labelBg = 'rgba(245, 158, 11, 0.85)';
      }

      // Draw bounding box
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 2.5;
      ctx.strokeRect(rx, ry, rw, rh);

      // Draw glowing double border line
      ctx.strokeStyle = 'rgba(255,255,255,0.4)';
      ctx.lineWidth = 1;
      ctx.strokeRect(rx - 1, ry - 1, rw + 2, rh + 2);

      // Draw class label background tag
      ctx.font = 'bold 10px Plus Jakarta Sans, sans-serif';
      const labelText = `${pred.label.toUpperCase()} (${Math.round(pred.confidence * 100)}%)`;
      const textWidth = ctx.measureText(labelText).width;
      
      ctx.fillStyle = labelBg;
      // Draw label above box (if height allows), otherwise inside box
      const tagY = ry - 16 > 0 ? ry - 16 : ry + 2;
      ctx.fillRect(rx, tagY, textWidth + 10, 16);

      // Draw label text
      ctx.fillStyle = '#ffffff';
      ctx.fillText(labelText, rx + 5, tagY + 12);
    });
  };

  // ResizeObserver to redraw bounding boxes on viewport resize
  useEffect(() => {
    const img = imgRef.current;
    if (!img) return;

    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    const observer = new ResizeObserver(() => {
      drawBoxes();
    });
    observerRef.current = observer;
    observer.observe(img);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [selectedItem]);

  const handleImageLoad = () => {
    drawBoxes();
  };

  // Helper to format date
  const formatTime = (dateStr) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return '';
    }
  };

  const getTimelineTime = (dateStr) => {
    try {
      const date = new Date(dateStr);
      // E.g., "14:30"
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    } catch (e) {
      return '--:--';
    }
  };

  // Check state of elements
  const hasApron = selectedItem?.predictions?.some(p => p.label === 'apron');
  const hasCap = selectedItem?.predictions?.some(p => p.label === 'cap');
  const hasGloves = selectedItem?.predictions?.some(p => p.label === 'gloves');

  return (
    <div className="timeline-section">
      <div className="timeline-title-row">
        <span className="section-title">
          <Clock size={18} style={{ color: 'var(--color-orange)' }} />
          30-Min Ingestion Logs
        </span>
        {timeline && timeline.length > 0 && (
          <span className="timeline-subtitle">
            {timeline.length} uploads today
          </span>
        )}
      </div>

      {!timeline || timeline.length === 0 ? (
        <div className="empty-state-card glass-panel">
          <ImageIcon size={28} style={{ color: 'var(--text-muted)' }} />
          <p style={{ fontSize: '0.8rem', fontWeight: '500' }}>No snapshots uploaded yet today</p>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Use the merchant panel below to upload audit proof</p>
        </div>
      ) : (
        <>
          {/* Timeline Blocks */}
          <div className="timeline-scroller">
            {timeline.map((item, idx) => {
              const score = item.visionVerificationScore;
              const isPass = score >= 80;
              const isSelected = selectedIdx === idx;
              
              return (
                <div
                  key={item._id || idx}
                  className={`timeline-block ${isSelected ? 'selected' : ''} ${isPass ? 'pass' : 'fail'}`}
                  onClick={() => setSelectedIdx(idx)}
                >
                  <span className="timeline-block-time">{getTimelineTime(item.uploadedAt)}</span>
                  <span className="timeline-block-score">{score}%</span>
                </div>
              );
            })}
          </div>

          {/* Selected Snapshot Details Panel */}
          {selectedItem && (
            <div className="snapshot-detail-card">
              <div className="snapshot-detail-header">
                <span style={{ fontWeight: '700', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  Snapshot - {formatTime(selectedItem.uploadedAt)}
                </span>
                <span className={`score-badge ${selectedItem.visionVerificationScore >= 80 ? 'hygienic' : 'warning'}`} style={{ position: 'relative', top: 0, right: 0, padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}>
                  {selectedItem.visionVerificationScore >= 80 ? <ShieldCheck size={14} /> : <ShieldAlert size={14} />}
                  Score: {selectedItem.visionVerificationScore}%
                </span>
              </div>

              {/* Bounding Box Image Overlay Canvas */}
              <div className="snapshot-viewer-container">
                <img
                  ref={imgRef}
                  src={selectedItem.imageStoragePath}
                  alt={`Kitchen Ingestion at ${formatTime(selectedItem.uploadedAt)}`}
                  className="snapshot-image"
                  onLoad={handleImageLoad}
                  crossOrigin="anonymous"
                />
                <canvas
                  ref={canvasRef}
                  className="predictions-canvas"
                />
              </div>

              {/* Verification Class Breakdown */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.25rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)' }}>YOLOv8 Detection Overlay</span>
                <div className="detected-tags-row">
                  <span className={`prediction-pill ${hasCap ? 'pass' : 'fail'}`}>
                    {hasCap ? <CheckCircle size={12} /> : <AlertTriangle size={12} />}
                    Cap: {hasCap ? 'Detected' : 'Missing'}
                  </span>
                  <span className={`prediction-pill ${hasApron ? 'pass' : 'fail'}`}>
                    {hasApron ? <CheckCircle size={12} /> : <AlertTriangle size={12} />}
                    Apron: {hasApron ? 'Detected' : 'Missing'}
                  </span>
                  <span className={`prediction-pill ${hasGloves ? 'pass' : 'fail'}`}>
                    {hasGloves ? <CheckCircle size={12} /> : <AlertTriangle size={12} />}
                    Gloves: {hasGloves ? 'Detected' : 'Missing'}
                  </span>
                </div>
              </div>

              {/* Violations Warning Bar */}
              {selectedItem.detectedViolations && selectedItem.detectedViolations.length > 0 ? (
                <div style={{
                  background: 'rgba(239, 68, 68, 0.08)',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  borderRadius: '6px',
                  padding: '0.5rem 0.75rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.15rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#fca5a5', fontSize: '0.75rem', fontWeight: '700' }}>
                    <AlertTriangle size={14} />
                    <span>Compliance Violations Detected:</span>
                  </div>
                  <ul style={{ paddingLeft: '1.25rem', color: 'var(--text-secondary)', fontSize: '0.7rem' }}>
                    {selectedItem.detectedViolations.map((v, i) => (
                      <li key={i}>{v}</li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div style={{
                  background: 'rgba(16, 185, 129, 0.08)',
                  border: '1px solid rgba(16, 185, 129, 0.2)',
                  borderRadius: '6px',
                  padding: '0.5rem 0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  color: '#a7f3d0',
                  fontSize: '0.75rem',
                  fontWeight: '700'
                }}>
                  <ShieldCheck size={14} />
                  <span>Kitchen compliant. Hygienic Badge maintained.</span>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
