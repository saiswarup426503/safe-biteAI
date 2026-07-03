import React, { useState, useEffect } from 'react';
import { ShieldCheck, ShieldAlert, Upload, HelpCircle, RefreshCw, AlertTriangle } from 'lucide-react';

export default function MerchantConsole({ restaurant, onUploadSuccess }) {
  const [isUploading, setIsUploading] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(30 * 60); // Default 30 mins in secs
  const [uploadError, setUploadError] = useState(null);

  // Calculate timer remaining based on last upload timestamp
  useEffect(() => {
    if (!restaurant) return;

    const calculateTimeRemaining = () => {
      const lastUpload = restaurant.lastMediaUploadTimestamp ? new Date(restaurant.lastMediaUploadTimestamp).getTime() : 0;
      if (!lastUpload) {
        setTimeRemaining(0);
        return;
      }

      const elapsedMs = Date.now() - lastUpload;
      const intervalMs = 30 * 60 * 1000; // 30 minutes
      const remainingMs = Math.max(0, intervalMs - elapsedMs);
      setTimeRemaining(Math.floor(remainingMs / 1000));
    };

    calculateTimeRemaining();
    const timer = setInterval(calculateTimeRemaining, 1000);

    return () => clearInterval(timer);
  }, [restaurant]);

  // Format countdown string
  const formatTimer = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    await uploadFile(file);
  };

  // Perform upload logic calling Node Express Server
  const uploadFile = async (file) => {
    setIsUploading(true);
    setUploadError(null);

    const formData = new FormData();
    formData.append('snapshot', file);

    try {
      const response = await fetch(`/api/restaurants/${restaurant._id}/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed with status ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        onUploadSuccess(data.restaurant);
      } else {
        throw new Error(data.error || 'Unknown upload processing error');
      }
    } catch (e) {
      console.error(e);
      setUploadError(e.message);
    } finally {
      setIsUploading(false);
    }
  };

  // Programmatically generate colored test canvas assets to simulate compliant/non-compliant cooks
  const triggerPresetUpload = async (presetType) => {
    setIsUploading(true);
    setUploadError(null);

    // Create a client-side mock image canvas to generate actual binary image files
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 400;
    const ctx = canvas.getContext('2d');

    // Background gradient representation of kitchen space
    const grad = ctx.createLinearGradient(0, 0, 400, 400);
    grad.addColorStop(0, '#111827');
    grad.addColorStop(1, '#1f2937');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 400, 400);

    // Grid lines for background detail
    ctx.strokeStyle = 'rgba(255,255,255,0.03)';
    ctx.lineWidth = 2;
    for (let i = 0; i < 400; i += 40) {
      ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, 400); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(400, i); ctx.stroke();
    }

    // Render title label text on canvas
    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.font = '800 12px Plus Jakarta Sans, sans-serif';
    ctx.fillText("KITCHENTRUST AUTOMATED CCTV SNAPSHOT", 20, 30);
    ctx.fillText(`CAM_ID: KITCHEN_BOM_01`, 20, 50);

    // Define coordinates representing a chef figure
    const cx = 200; // center x
    const cy = 180; // center y

    // Head
    ctx.fillStyle = '#fbcfe8';
    ctx.beginPath();
    ctx.arc(cx, cy - 60, 25, 0, Math.PI * 2);
    ctx.fill();

    // Torso body
    ctx.fillStyle = '#e5e7eb';
    ctx.fillRect(cx - 35, cy - 35, 70, 120);

    // Arms
    ctx.strokeStyle = '#fbcfe8';
    ctx.lineWidth = 12;
    ctx.lineCap = 'round';
    // Left arm
    ctx.beginPath(); ctx.moveTo(cx - 35, cy - 25); ctx.lineTo(cx - 65, cy + 30); ctx.stroke();
    // Right arm
    ctx.beginPath(); ctx.moveTo(cx + 35, cy - 25); ctx.lineTo(cx + 65, cy + 30); ctx.stroke();

    let filenameSuffix = "clean_pass";

    // 1. Render chef cap if enabled
    if (presetType !== 'no_cap' && presetType !== 'dirty_fail') {
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      // Draw chef hat bubble curves
      ctx.arc(cx - 15, cy - 90, 20, 0, Math.PI * 2);
      ctx.arc(cx + 15, cy - 90, 20, 0, Math.PI * 2);
      ctx.arc(cx, cy - 105, 25, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(cx - 20, cy - 85, 40, 20); // base
    } else {
      // Draw messy hair to show no cap
      ctx.fillStyle = '#78350f';
      ctx.beginPath();
      ctx.arc(cx - 10, cy - 78, 10, 0, Math.PI * 2);
      ctx.arc(cx + 10, cy - 78, 10, 0, Math.PI * 2);
      ctx.fill();
      filenameSuffix = presetType === 'no_cap' ? "dirty_nocap" : "dirty_fail";
    }

    // 2. Render apron if enabled
    if (presetType !== 'dirty_fail') {
      // Draw apron cloth
      ctx.fillStyle = '#fc8019'; // Swiggy Orange apron!
      ctx.fillRect(cx - 25, cy - 15, 50, 95);
      // Draw apron straps
      ctx.strokeStyle = '#4b5563';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(cx - 25, cy - 15); ctx.lineTo(cx - 10, cy - 35);
      ctx.moveTo(cx + 25, cy - 15); ctx.lineTo(cx + 10, cy - 35);
      ctx.stroke();
    }

    // 3. Render gloves if enabled
    if (presetType === 'compliant') {
      // Green hygiene gloves
      ctx.fillStyle = '#10b981';
      // Left glove
      ctx.beginPath(); ctx.arc(cx - 65, cy + 30, 8, 0, Math.PI * 2); ctx.fill();
      // Right glove
      ctx.beginPath(); ctx.arc(cx + 65, cy + 30, 8, 0, Math.PI * 2); ctx.fill();
    } else {
      // Plain hands
      ctx.fillStyle = '#fbcfe8';
      ctx.beginPath(); ctx.arc(cx - 65, cy + 30, 7, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(cx + 65, cy + 30, 7, 0, Math.PI * 2); ctx.fill();
      if (filenameSuffix === "clean_pass") filenameSuffix = "dirty_noglove";
    }

    // Convert Canvas to jpeg Blob and dispatch upload
    canvas.toBlob(async (blob) => {
      const file = new File([blob], `kitchen_${filenameSuffix}.jpg`, { type: 'image/jpeg' });
      await uploadFile(file);
    }, 'image/jpeg', 0.9);
  };

  const isWarningState = timeRemaining <= 0;
  const isUrgent = timeRemaining <= 5 * 60; // 5 minutes or less

  return (
    <div className="glass-panel panel-card-container merchant-console-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '1rem', fontWeight: '800', color: '#fff' }}>Merchant Audit Portal</span>
        <span style={{ fontSize: '0.7rem', background: 'rgba(255,255,255,0.06)', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: '600' }}>
          Console ID: M_RES_{restaurant._id.slice(-6)}
        </span>
      </div>

      {/* Countdown Timer Area */}
      <div style={{
        background: '#151c2f',
        borderRadius: '12px',
        padding: '1rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        border: '1px solid var(--border-light)'
      }}>
        <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Time Until Next Mandatory Media Check
        </span>
        <div style={{
          fontSize: '2.5rem',
          fontWeight: '800',
          color: isWarningState ? 'var(--color-red)' : isUrgent ? 'var(--color-amber)' : 'var(--text-primary)',
          letterSpacing: '0.025em',
          marginTop: '0.25rem',
          textShadow: isWarningState ? '0 0 15px rgba(239,68,68,0.3)' : 'none',
          fontVariantNumeric: 'tabular-nums'
        }}>
          {formatTimer(timeRemaining)}
        </div>
        
        <div style={{ marginTop: '0.5rem', width: '100%' }}>
          {isWarningState ? (
            <div className="merchant-alert-bar urgent">
              <AlertTriangle size={16} />
              <span>Hygienic Badge Suspended! Upload snapshot to restore.</span>
            </div>
          ) : isUrgent ? (
            <div className="merchant-alert-bar urgent" style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', color: '#fde68a' }}>
              <AlertTriangle size={16} />
              <span>Mandatory check closing soon! Upload required.</span>
            </div>
          ) : (
            <div className="merchant-alert-bar good">
              <ShieldCheck size={16} />
              <span>Hygienic Badge Active. Standards Met.</span>
            </div>
          )}
        </div>
      </div>

      {/* Ingestion Ingest File Inputs */}
      <div className="upload-button-wrapper">
        {isUploading ? (
          <div className="uploading-state">
            <RefreshCw size={16} className="spinner-icon" />
            <span>Analyzing snap with YOLOv8...</span>
          </div>
        ) : (
          <>
            <label className="upload-file-label">
              <Upload size={18} />
              <span>Ingest Kitchen Camera Snap</span>
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleFileUpload} 
                className="upload-file-input"
              />
            </label>
          </>
        )}
      </div>

      {uploadError && (
        <div style={{ fontSize: '0.75rem', color: 'var(--color-red)', display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
          <AlertTriangle size={12} />
          <span>Error: {uploadError}</span>
        </div>
      )}

      {/* Audit CV Test Generator presets */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border-light)' }}>
        <span style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <HelpCircle size={12} />
          Simulate Camera Presets (YOLO Test Suite)
        </span>
        <div className="demo-preset-pills">
          <button 
            disabled={isUploading}
            onClick={() => triggerPresetUpload('compliant')} 
            className="preset-pill"
          >
            🟢 All Safe (100%)
          </button>
          <button 
            disabled={isUploading}
            onClick={() => triggerPresetUpload('no_gloves')} 
            className="preset-pill"
          >
            🟡 No Gloves (70%)
          </button>
          <button 
            disabled={isUploading}
            onClick={() => triggerPresetUpload('no_cap')} 
            className="preset-pill"
          >
            🔴 No Cap (70%)
          </button>
          <button 
            disabled={isUploading}
            onClick={() => triggerPresetUpload('dirty_fail')} 
            className="preset-pill"
          >
            ⚫ No Cap/Apron/Gloves (0%)
          </button>
        </div>
      </div>
    </div>
  );
}
