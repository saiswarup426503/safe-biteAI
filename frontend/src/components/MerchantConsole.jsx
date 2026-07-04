import React, { useState, useEffect, useRef } from "react";
import { 
  ShieldCheck, 
  Upload, 
  RefreshCw, 
  AlertTriangle, 
  HelpCircle, 
  Clock, 
  Eye, 
  CheckCircle2, 
  FileImage 
} from "lucide-react";

export default function MerchantConsole({ restaurant, onUploadSuccess }) {
  const [isUploading, setIsUploading] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(30 * 60); // 30 minutes in seconds
  const [uploadError, setUploadError] = useState(null);
  const [activeAnalysis, setActiveAnalysis] = useState(null);
  
  const canvasRef = useRef(null);

  // Set the active visualizer snapshot when the restaurant changes or a new upload occurs
  useEffect(() => {
    if (restaurant && restaurant.mediaUploadTimeline && restaurant.mediaUploadTimeline.length > 0) {
      // Set to latest upload by default
      setActiveAnalysis(restaurant.mediaUploadTimeline[restaurant.mediaUploadTimeline.length - 1]);
    } else {
      setActiveAnalysis(null);
    }
  }, [restaurant]);

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

  // Draw bounding boxes on canvas whenever active analysis image changes
  useEffect(() => {
    if (!activeAnalysis) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const img = new Image();
    
    // Load image from storage path
    img.src = activeAnalysis.imageStoragePath;
    
    img.onload = () => {
      // Set canvas size to match image dimensions
      canvas.width = img.naturalWidth || 400;
      canvas.height = img.naturalHeight || 400;
      
      // Draw base image
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      // Draw each predicted box
      const predictions = activeAnalysis.predictions || [];
      predictions.forEach(pred => {
        const [x1, y1, x2, y2] = pred.bbox;
        const w = x2 - x1;
        const h = y2 - y1;
        
        // Define color based on label type
        let boxColor = "#3b82f6"; // Cap -> blue
        if (pred.label === "apron") boxColor = "#fc8019"; // Apron -> orange
        if (pred.label === "gloves") boxColor = "#10b981"; // Gloves -> green
        
        // Bounding box rectangle
        ctx.strokeStyle = boxColor;
        ctx.lineWidth = Math.max(3, canvas.width / 130);
        ctx.strokeRect(x1, y1, w, h);
        
        // Tag label background
        ctx.fillStyle = boxColor;
        const fontSize = Math.max(12, canvas.width / 35);
        ctx.font = `600 ${fontSize}px Poppins, sans-serif`;
        const text = `${pred.label} (${Math.round(pred.confidence * 100)}%)`;
        const textWidth = ctx.measureText(text).width;
        
        // Draw tag background
        ctx.fillRect(x1 - ctx.lineWidth/2, y1 - fontSize - 6, textWidth + 12, fontSize + 6);
        
        // Draw tag text
        ctx.fillStyle = "white";
        ctx.fillText(text, x1 + 6, y1 - 4);
      });
    };
  }, [activeAnalysis]);

  // Format countdown string
  const formatTimer = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
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
    formData.append("snapshot", file);

    try {
      const response = await fetch(`/api/restaurants/${restaurant._id}/upload`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed with status ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        onUploadSuccess(data.restaurant);
        if (data.latestAnalysis) {
          setActiveAnalysis(data.latestAnalysis);
        }
      } else {
        throw new Error(data.error || "Unknown upload processing error");
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
    const canvas = document.createElement("canvas");
    canvas.width = 400;
    canvas.height = 400;
    const ctx = canvas.getContext("2d");

    // Background gradient representation of kitchen space
    const grad = ctx.createLinearGradient(0, 0, 400, 400);
    grad.addColorStop(0, "#111827");
    grad.addColorStop(1, "#1f2937");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 400, 400);

    // Grid lines for background detail
    ctx.strokeStyle = "rgba(255,255,255,0.03)";
    ctx.lineWidth = 2;
    for (let i = 0; i < 400; i += 40) {
      ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, 400); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(400, i); ctx.stroke();
    }

    // Render title label text on canvas
    ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
    ctx.font = "800 12px Poppins, sans-serif";
    ctx.fillText("KITCHENTRUST AUTOMATED CCTV SNAPSHOT", 20, 30);
    ctx.fillText(`CAM_ID: KITCHEN_BOM_01`, 20, 50);

    // Define coordinates representing a chef figure
    const cx = 200; // center x
    const cy = 180; // center y

    // Head
    ctx.fillStyle = "#fbcfe8";
    ctx.beginPath();
    ctx.arc(cx, cy - 60, 25, 0, Math.PI * 2);
    ctx.fill();

    // Torso body
    ctx.fillStyle = "#e5e7eb";
    ctx.fillRect(cx - 35, cy - 35, 70, 120);

    // Arms
    ctx.strokeStyle = "#fbcfe8";
    ctx.lineWidth = 12;
    ctx.lineCap = "round";
    // Left arm
    ctx.beginPath(); ctx.moveTo(cx - 35, cy - 25); ctx.lineTo(cx - 65, cy + 30); ctx.stroke();
    // Right arm
    ctx.beginPath(); ctx.moveTo(cx + 35, cy - 25); ctx.lineTo(cx + 65, cy + 30); ctx.stroke();

    let filenameSuffix = "clean_pass";

    // 1. Render chef cap if enabled
    if (presetType !== "no_cap" && presetType !== "dirty_fail") {
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      // Draw chef hat bubble curves
      ctx.arc(cx - 15, cy - 90, 20, 0, Math.PI * 2);
      ctx.arc(cx + 15, cy - 90, 20, 0, Math.PI * 2);
      ctx.arc(cx, cy - 105, 25, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(cx - 20, cy - 85, 40, 20); // base
    } else {
      // Draw messy hair to show no cap
      ctx.fillStyle = "#78350f";
      ctx.beginPath();
      ctx.arc(cx - 10, cy - 78, 10, 0, Math.PI * 2);
      ctx.arc(cx + 10, cy - 78, 10, 0, Math.PI * 2);
      ctx.fill();
      filenameSuffix = presetType === "no_cap" ? "dirty_nocap" : "dirty_fail";
    }

    // 2. Render apron if enabled
    if (presetType !== "dirty_fail") {
      // Draw apron cloth
      ctx.fillStyle = "#fc8019"; // Swiggy Orange apron!
      ctx.fillRect(cx - 25, cy - 15, 50, 95);
      // Draw apron straps
      ctx.strokeStyle = "#4b5563";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(cx - 25, cy - 15); ctx.lineTo(cx - 10, cy - 35);
      ctx.moveTo(cx + 25, cy - 15); ctx.lineTo(cx + 10, cy - 35);
      ctx.stroke();
    }

    // 3. Render gloves if enabled
    if (presetType === "compliant") {
      // Green hygiene gloves
      ctx.fillStyle = "#10b981";
      // Left glove
      ctx.beginPath(); ctx.arc(cx - 65, cy + 30, 8, 0, Math.PI * 2); ctx.fill();
      // Right glove
      ctx.beginPath(); ctx.arc(cx + 65, cy + 30, 8, 0, Math.PI * 2); ctx.fill();
    } else {
      // Plain hands
      ctx.fillStyle = "#fbcfe8";
      ctx.beginPath(); ctx.arc(cx - 65, cy + 30, 7, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(cx + 65, cy + 30, 7, 0, Math.PI * 2); ctx.fill();
      if (filenameSuffix === "clean_pass") filenameSuffix = "dirty_noglove";
    }

    // Convert Canvas to jpeg Blob and dispatch upload
    canvas.toBlob(async (blob) => {
      const file = new File([blob], `kitchen_${filenameSuffix}.jpg`, { type: "image/jpeg" });
      await uploadFile(file);
    }, "image/jpeg", 0.9);
  };

  const isWarningState = timeRemaining <= 0;
  const isUrgent = timeRemaining <= 5 * 60; // 5 minutes or less

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "25px", width: "100%" }}>
      {/* Top dashboard section */}
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 2fr", gap: "25px" }}>
        
        {/* Left Column: Timer & Controls */}
        <div className="live-kitchen" style={{ position: "static", padding: "24px" }}>
          <h3 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "15px", display: "flex", alignItems: "center", gap: "8px" }}>
            <Clock size={20} /> Audit Status
          </h3>

          <div style={{
            background: "#fdfcfa",
            border: "1.5px solid #fff3e8",
            borderRadius: "16px",
            padding: "20px",
            textAlign: "center",
            marginBottom: "20px"
          }}>
            <span style={{ fontSize: "11px", fontWeight: "600", color: "#888", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Next Scheduled Upload In
            </span>
            <div style={{
              fontSize: "36px",
              fontWeight: "700",
              color: isWarningState ? "#e53e3e" : isUrgent ? "#d69e2e" : "#2d2d2d",
              margin: "6px 0",
              fontVariantNumeric: "tabular-nums"
            }}>
              {formatTimer(timeRemaining)}
            </div>

            <div style={{ marginTop: "10px" }}>
              {isWarningState ? (
                <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#e53e3e", background: "#fff5f5", padding: "8px 12px", borderRadius: "10px", fontSize: "12px", fontWeight: "500", justifyContent: "center" }}>
                  <AlertTriangle size={14} />
                  <span>CCTV penalty warning! Score degrades 5pts/10m.</span>
                </div>
              ) : isUrgent ? (
                <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#d69e2e", background: "#fefcbf", padding: "8px 12px", borderRadius: "10px", fontSize: "12px", fontWeight: "500", justifyContent: "center" }}>
                  <AlertTriangle size={14} />
                  <span>Upload window closing! Action needed.</span>
                </div>
              ) : (
                <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#18a65d", background: "#e9fff2", padding: "8px 12px", borderRadius: "10px", fontSize: "12px", fontWeight: "500", justifyContent: "center" }}>
                  <ShieldCheck size={14} />
                  <span>Compliance score secured. Standards met.</span>
                </div>
              )}
            </div>
          </div>

          {/* Ingest buttons */}
          <div style={{ marginBottom: "20px" }}>
            {isUploading ? (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", background: "#f8f7f4", border: "2px dashed #ddd", borderRadius: "16px", height: "55px", color: "#777", fontSize: "14px" }}>
                <RefreshCw size={18} className="spinner-icon" style={{ animation: "spin 1.5s linear infinite" }} />
                <span>Running YOLOv8 scan...</span>
              </div>
            ) : (
              <label style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px",
                background: "#FC8019",
                color: "white",
                borderRadius: "16px",
                height: "55px",
                fontWeight: "600",
                cursor: "pointer",
                boxShadow: "0 6px 20px rgba(252,128,25,0.2)",
                transition: "all 0.3s ease"
              }}>
                <Upload size={20} />
                <span>Upload Kitchen Snap</span>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleFileUpload} 
                  style={{ display: "none" }}
                />
              </label>
            )}

            {uploadError && (
              <div style={{ color: "#e53e3e", fontSize: "12px", display: "flex", gap: "6px", alignItems: "center", marginTop: "8px" }}>
                <AlertTriangle size={14} />
                <span>Upload failed: {uploadError}</span>
              </div>
            )}
          </div>

          {/* Simulation Tools */}
          <div style={{ borderTop: "1.5px solid #eee", paddingTop: "15px" }}>
            <span style={{ fontSize: "12px", fontWeight: "600", color: "#777", display: "flex", alignItems: "center", gap: "5px", marginBottom: "10px" }}>
              <HelpCircle size={14} /> Simulated Camera Presets (YOLO Test Suite)
            </span>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <button 
                disabled={isUploading}
                onClick={() => triggerPresetUpload("compliant")}
                className="preset-btn green"
              >
                ✔️ Compliant Scene (100%)
              </button>
              <button 
                disabled={isUploading}
                onClick={() => triggerPresetUpload("no_gloves")}
                className="preset-btn amber"
              >
                ⚠️ Missing Gloves (70%)
              </button>
              <button 
                disabled={isUploading}
                onClick={() => triggerPresetUpload("no_cap")}
                className="preset-btn amber"
              >
                ⚠️ Missing Hairnet (70%)
              </button>
              <button 
                disabled={isUploading}
                onClick={() => triggerPresetUpload("dirty_fail")}
                className="preset-btn red"
              >
                ❌ Missing Cap/Apron/Gloves (0%)
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Visualizer Canvas */}
        <div className="live-kitchen" style={{ position: "static", padding: "24px", display: "flex", flexDirection: "column" }}>
          <h3 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "15px", display: "flex", alignItems: "center", gap: "8px" }}>
            <Eye size={20} /> YOLOv8 Compliance Scan Visualizer
          </h3>
          
          {activeAnalysis ? (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "15px" }}>
              {/* Canvas Container */}
              <div style={{
                position: "relative",
                background: "#0b0f19",
                borderRadius: "16px",
                overflow: "hidden",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                minHeight: "260px"
              }}>
                <canvas 
                  ref={canvasRef}
                  style={{
                    maxWidth: "100%",
                    maxHeight: "320px",
                    display: "block",
                    borderRadius: "8px"
                  }}
                />
              </div>

              {/* Stats overlay */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
                <div style={{ background: "#f8f7f4", padding: "12px 15px", borderRadius: "12px", border: "1.5px solid #eee" }}>
                  <span style={{ fontSize: "11px", color: "#888", display: "block" }}>Verification Score</span>
                  <strong style={{ fontSize: "18px", color: activeAnalysis.visionVerificationScore >= 80 ? "#18a65d" : "#e53e3e" }}>
                    {activeAnalysis.visionVerificationScore}%
                  </strong>
                </div>
                <div style={{ background: "#f8f7f4", padding: "12px 15px", borderRadius: "12px", border: "1.5px solid #eee" }}>
                  <span style={{ fontSize: "11px", color: "#888", display: "block" }}>Violations Found</span>
                  <strong style={{ fontSize: "14px", color: activeAnalysis.detectedViolations.length === 0 ? "#18a65d" : "#e53e3e" }}>
                    {activeAnalysis.detectedViolations.length === 0 ? "None - Compliant" : activeAnalysis.detectedViolations.join(", ")}
                  </strong>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", border: "2.5px dashed #eee", borderRadius: "20px", color: "#888", minHeight: "280px" }}>
              <FileImage size={40} style={{ marginBottom: "15px" }} />
              <p style={{ fontWeight: "600" }}>No audit log available</p>
              <p style={{ fontSize: "12px", marginTop: "4px" }}>Upload a camera snapshot or click a preset simulation to run verification.</p>
            </div>
          )}
        </div>
      </div>

      {/* History Log Timeline section */}
      <div className="live-kitchen" style={{ position: "static", padding: "24px" }}>
        <h3 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "15px" }}>Verification Timeline Log</h3>
        
        {restaurant.mediaUploadTimeline && restaurant.mediaUploadTimeline.length > 0 ? (
          <div style={{
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            maxHeight: "350px",
            overflowY: "auto",
            paddingRight: "10px"
          }}>
            {[...restaurant.mediaUploadTimeline].reverse().map((item, index) => {
              const dateStr = new Date(item.uploadedAt).toLocaleString();
              const isSelected = activeAnalysis?._id === item._id;
              
              return (
                <div
                  key={item._id || index}
                  onClick={() => setActiveAnalysis(item)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "15px 20px",
                    background: isSelected ? "#fff3e8" : "white",
                    border: isSelected ? "1.5px solid #FC8019" : "1.5px solid #eee",
                    borderRadius: "14px",
                    cursor: "pointer",
                    transition: "all 0.3s ease"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                    <div style={{
                      width: "48px",
                      height: "48px",
                      borderRadius: "10px",
                      overflow: "hidden",
                      background: "#eee",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center"
                    }}>
                      <img src={item.imageStoragePath} alt="Log" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </div>
                    <div>
                      <h4 style={{ fontSize: "14px", fontWeight: "600" }}>
                        Audit Check - {item.visionVerificationScore}% Score
                      </h4>
                      <span style={{ fontSize: "11px", color: "#888" }}>{dateStr}</span>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                    {item.detectedViolations.length === 0 ? (
                      <span style={{
                        fontSize: "12px",
                        color: "#18a65d",
                        background: "#e9fff2",
                        padding: "4px 10px",
                        borderRadius: "8px",
                        fontWeight: "600"
                      }}>
                        Passed
                      </span>
                    ) : (
                      <span style={{
                        fontSize: "12px",
                        color: "#e53e3e",
                        background: "#fff5f5",
                        padding: "4px 10px",
                        borderRadius: "8px",
                        fontWeight: "600"
                      }}>
                        {item.detectedViolations.length} Violations
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ padding: "20px", textAlign: "center", color: "#999", border: "1.5px dashed #eee", borderRadius: "16px" }}>
            No uploads registered in the verification history.
          </div>
        )}
      </div>

      <style>{`
        .preset-btn {
          width: 100%;
          padding: 10px 14px;
          border-radius: 10px;
          font-weight: 600;
          font-size: 13px;
          text-align: left;
          cursor: pointer;
          transition: all 0.2s ease;
          border: none;
          background: #f8f7f4;
          color: #2d2d2d;
        }
        .preset-btn:hover {
          transform: translateX(4px);
        }
        .preset-btn.green:hover { background: #e9fff2; color: #18a65d; }
        .preset-btn.amber:hover { background: #fefcbf; color: #d69e2e; }
        .preset-btn.red:hover { background: #fff5f5; color: #e53e3e; }
      `}</style>
    </div>
  );
}
