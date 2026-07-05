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
  FileImage,
  Video,
  FileText,
  History,
  Plus,
  Trash2,
  Search
} from "lucide-react";

export default function MerchantConsole({ restaurant, onUploadSuccess }) {
  const [consoleTab, setConsoleTab] = useState("overview"); // overview, menu, history
  const [menuSearchQuery, setMenuSearchQuery] = useState("");
  
  const [isUploading, setIsUploading] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(30 * 60); // 30 minutes in seconds
  const [uploadError, setUploadError] = useState(null);
  const [activeAnalysis, setActiveAnalysis] = useState(null);
  
  const canvasRef = useRef(null);

  // Swiggy & Zomato menu management states
  const [newItemName, setNewItemName] = useState("");
  const [newItemPrice, setNewItemPrice] = useState("");
  const [newItemCategory, setNewItemCategory] = useState("Main");
  const [newItemDesc, setNewItemDesc] = useState("");
  const [isUpdatingMenu, setIsUpdatingMenu] = useState(false);

  const handleAddMenuItem = async (e) => {
    e.preventDefault();
    if (!newItemName.trim() || !newItemPrice) {
      alert("Please provide at least a dish name and price.");
      return;
    }

    setIsUpdatingMenu(true);
    const newItem = {
      name: newItemName.trim(),
      price: parseFloat(newItemPrice),
      category: newItemCategory.trim(),
      description: newItemDesc.trim()
    };

    const currentMenu = restaurant.menu || [];
    const updatedMenu = [...currentMenu, newItem];

    try {
      const response = await fetch(`/api/restaurants/${restaurant._id}/menu`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ menu: updatedMenu })
      });

      if (!response.ok) throw new Error("Failed to save menu");
      const updatedRes = await response.json();
      
      // Update parent state
      onUploadSuccess(updatedRes);
      
      // Reset form
      setNewItemName("");
      setNewItemPrice("");
      setNewItemCategory("Main");
      setNewItemDesc("");
      alert("🎉 Food item added to menu successfully!");
    } catch (err) {
      console.error(err);
      alert("Error adding menu item: " + err.message);
    } finally {
      setIsUpdatingMenu(false);
    }
  };

  const handleDeleteMenuItem = async (index) => {
    if (!window.confirm("Are you sure you want to remove this food item from your menu?")) {
      return;
    }

    setIsUpdatingMenu(true);
    const currentMenu = restaurant.menu || [];
    const updatedMenu = currentMenu.filter((_, idx) => idx !== index);

    try {
      const response = await fetch(`/api/restaurants/${restaurant._id}/menu`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ menu: updatedMenu })
      });

      if (!response.ok) throw new Error("Failed to delete menu item");
      const updatedRes = await response.json();
      
      // Update parent state
      onUploadSuccess(updatedRes);
    } catch (err) {
      console.error(err);
      alert("Error deleting menu item: " + err.message);
    } finally {
      setIsUpdatingMenu(false);
    }
  };

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

  // Draw bounding boxes on canvas whenever active analysis image changes or tab switches back to overview
  useEffect(() => {
    if (!activeAnalysis || consoleTab !== "overview") return;

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
  }, [activeAnalysis, consoleTab]);

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

  // Filtered menu items for the search feature in Menu Manager
  const filteredMenu = (restaurant.menu || []).filter(item => 
    item.name.toLowerCase().includes(menuSearchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(menuSearchQuery.toLowerCase())
  );

  return (
    <div className="console-wrapper">
      {/* Sleek Horizontal Tab Bar */}
      <div className="console-tabs-nav">
        <button 
          onClick={() => setConsoleTab("overview")} 
          className={`console-nav-btn ${consoleTab === "overview" ? "active" : ""}`}
        >
          <Video size={16} />
          <span>CCTV & Audit Status</span>
        </button>
        <button 
          onClick={() => setConsoleTab("menu")} 
          className={`console-nav-btn ${consoleTab === "menu" ? "active" : ""}`}
        >
          <FileText size={16} />
          <span>Menu Manager</span>
        </button>
        <button 
          onClick={() => setConsoleTab("history")} 
          className={`console-nav-btn ${consoleTab === "history" ? "active" : ""}`}
        >
          <History size={16} />
          <span>Verification Logs ({restaurant.mediaUploadTimeline?.length || 0})</span>
        </button>
      </div>

      {/* CCTV & Audit Status Tab */}
      {consoleTab === "overview" && (
        <div className="tab-fade-in" style={{ display: "grid", gridTemplateColumns: "1fr 1.6fr", gap: "25px", width: "100%" }}>
          {/* Controls Column */}
          <div style={{ display: "flex", flexDirection: "column", gap: "25px" }}>
            {/* Countdown / Audit Status Card */}
            <div className="console-premium-card status-card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
                <h3 className="card-title"><Clock size={18} /> Safety Timer</h3>
                <span className={`status-indicator-dot ${isWarningState ? "red" : isUrgent ? "yellow" : "green"}`}></span>
              </div>

              <div className="timer-tile">
                <span className="timer-label">Next Verification In</span>
                <span className={`timer-countdown-val ${isWarningState ? "danger-text" : isUrgent ? "warning-text" : ""}`}>
                  {formatTimer(timeRemaining)}
                </span>
              </div>

              <div style={{ marginTop: "12px" }}>
                {isWarningState ? (
                  <div className="status-alert-badge badge-red">
                    <AlertTriangle size={14} />
                    <span>Penalty Alert: SafeBite rating decaying.</span>
                  </div>
                ) : isUrgent ? (
                  <div className="status-alert-badge badge-yellow">
                    <AlertTriangle size={14} />
                    <span>Closing: Action required immediately!</span>
                  </div>
                ) : (
                  <div className="status-alert-badge badge-green">
                    <ShieldCheck size={14} />
                    <span>Kitchen is fully compliant. All clear.</span>
                  </div>
                )}
              </div>
            </div>

            {/* Ingestion Panel Card */}
            <div className="console-premium-card">
              <h3 className="card-title" style={{ marginBottom: "15px" }}><Upload size={18} /> Upload Audit Snap</h3>
              
              {isUploading ? (
                <div className="upload-loading-area">
                  <RefreshCw size={20} className="spinner-icon" />
                  <span>Scanning via YOLOv8 AI...</span>
                </div>
              ) : (
                <label className="upload-trigger-btn">
                  <Upload size={18} />
                  <span>Upload Kitchen Camera Snap</span>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleFileUpload} 
                    style={{ display: "none" }}
                  />
                </label>
              )}

              {uploadError && (
                <div className="upload-error-text">
                  <AlertTriangle size={14} />
                  <span>Error: {uploadError}</span>
                </div>
              )}
            </div>

            {/* Simulated camera presets */}
            <div className="console-premium-card">
              <h3 className="card-title" style={{ marginBottom: "12px" }}><HelpCircle size={18} /> Sim Test Suite</h3>
              <p className="card-subtitle">Quickly simulate standard camera reports for YOLO validation:</p>
              
              <div className="preset-buttons-grid">
                <button disabled={isUploading} onClick={() => triggerPresetUpload("compliant")} className="sim-action-btn green-btn">
                  ✔️ Compliant (100%)
                </button>
                <button disabled={isUploading} onClick={() => triggerPresetUpload("no_gloves")} className="sim-action-btn yellow-btn">
                  ⚠️ No Gloves (70%)
                </button>
                <button disabled={isUploading} onClick={() => triggerPresetUpload("no_cap")} className="sim-action-btn yellow-btn">
                  ⚠️ No Cap (70%)
                </button>
                <button disabled={isUploading} onClick={() => triggerPresetUpload("dirty_fail")} className="sim-action-btn red-btn">
                  ❌ Non-Compliant (0%)
                </button>
              </div>
            </div>
          </div>

          {/* Visualizer Canvas Column */}
          <div className="console-premium-card visualizer-card" style={{ display: "flex", flexDirection: "column" }}>
            <h3 className="card-title" style={{ marginBottom: "15px" }}>
              <Eye size={18} /> Live YOLOv8 Compliance Scan Visualizer
            </h3>

            {activeAnalysis ? (
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "18px" }}>
                {/* Canvas Container with sleek absolute bounds */}
                <div className="canvas-frame">
                  <canvas ref={canvasRef} className="yolo-canvas" />
                </div>

                {/* Verification Stats Grid */}
                <div className="stats-results-grid">
                  <div className="stats-results-card">
                    <span className="results-card-label">Verification Score</span>
                    <strong className={`results-card-val ${activeAnalysis.visionVerificationScore >= 80 ? "green-text" : "red-text"}`}>
                      {activeAnalysis.visionVerificationScore}%
                    </strong>
                  </div>
                  <div className="stats-results-card">
                    <span className="results-card-label">Violations Detected</span>
                    <strong className={`results-card-val ${activeAnalysis.detectedViolations.length === 0 ? "green-text" : "red-text"}`} style={{ fontSize: "14px" }}>
                      {activeAnalysis.detectedViolations.length === 0 ? "None - Compliant" : activeAnalysis.detectedViolations.join(", ")}
                    </strong>
                  </div>
                </div>
              </div>
            ) : (
              <div className="visualizer-empty-state">
                <FileImage size={38} className="empty-state-icon" />
                <h4>No Active Scan</h4>
                <p>Simulate a camera check or upload a kitchen snapshot to visualize compliance detections.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Menu Manager Tab */}
      {consoleTab === "menu" && (
        <div className="tab-fade-in" style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: "25px" }}>
          {/* Menu items list column */}
          <div className="console-premium-card" style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px", flexWrap: "wrap", gap: "10px" }}>
              <div>
                <h3 className="card-title">Active Digital Menu</h3>
                <p className="card-subtitle">These items sync directly to Swiggy & Zomato customer apps.</p>
              </div>

              {/* Minimal Search Bar */}
              <div className="search-input-wrapper">
                <Search size={14} className="search-icon" />
                <input 
                  type="text" 
                  value={menuSearchQuery} 
                  onChange={(e) => setMenuSearchQuery(e.target.value)} 
                  placeholder="Filter menu..." 
                  className="search-menu-input"
                />
              </div>
            </div>

            {filteredMenu.length > 0 ? (
              <div className="digital-menu-list">
                {filteredMenu.map((item, idx) => (
                  <div key={idx} className="menu-item-row">
                    <div style={{ flex: 1, paddingRight: "15px" }}>
                      <div className="menu-item-header">
                        <strong className="item-title">{item.name}</strong>
                        <span className="item-badge">{item.category}</span>
                      </div>
                      {item.description && <p className="item-description">{item.description}</p>}
                      <strong className="item-price">₹{item.price}</strong>
                    </div>

                    <button 
                      onClick={() => handleDeleteMenuItem(idx)} 
                      disabled={isUpdatingMenu}
                      className="delete-item-action-btn"
                      title="Remove Item"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="menu-empty-state">
                <FileText size={38} className="empty-state-icon" />
                <h4>No Items Match</h4>
                <p>{restaurant.menu?.length > 0 ? "Try search query again." : "Add your first dish in the sidebar form."}</p>
              </div>
            )}
          </div>

          {/* Add menu item form column */}
          <div className="console-premium-card">
            <h3 className="card-title" style={{ marginBottom: "15px" }}>
              <Plus size={18} style={{ verticalAlign: "middle", marginRight: "5px" }} />
              Add New Dish
            </h3>

            <form onSubmit={handleAddMenuItem} className="add-menu-form">
              <div className="form-group-item">
                <label className="form-group-label">Dish Name *</label>
                <input 
                  type="text" 
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  placeholder="e.g. Garlic Naan"
                  className="form-group-input"
                  required
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: "15px" }}>
                <div className="form-group-item">
                  <label className="form-group-label">Price (₹) *</label>
                  <input 
                    type="number" 
                    value={newItemPrice}
                    onChange={(e) => setNewItemPrice(e.target.value)}
                    placeholder="120"
                    className="form-group-input"
                    required
                  />
                </div>

                <div className="form-group-item">
                  <label className="form-group-label">Category</label>
                  <select 
                    value={newItemCategory}
                    onChange={(e) => setNewItemCategory(e.target.value)}
                    className="form-group-select"
                  >
                    <option value="Main">Main</option>
                    <option value="Starters">Starters</option>
                    <option value="Dosa">Dosa</option>
                    <option value="Biryani">Biryani</option>
                    <option value="Pizzas">Pizzas</option>
                    <option value="Desserts">Desserts</option>
                    <option value="Beverages">Beverages</option>
                  </select>
                </div>
              </div>

              <div className="form-group-item">
                <label className="form-group-label">Short Description</label>
                <textarea 
                  value={newItemDesc}
                  onChange={(e) => setNewItemDesc(e.target.value)}
                  placeholder="Crispy, buttered flatbread garnished with garlic..."
                  rows="3"
                  className="form-group-textarea"
                />
              </div>

              <button type="submit" disabled={isUpdatingMenu} className="add-dish-submit-btn">
                {isUpdatingMenu ? (
                  <>
                    <RefreshCw size={16} className="spinner-icon" />
                    <span>Adding...</span>
                  </>
                ) : (
                  <>
                    <Plus size={16} />
                    <span>Add Item to Menu</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Compliance History Logs Tab */}
      {consoleTab === "history" && (
        <div className="tab-fade-in console-premium-card" style={{ display: "flex", flexDirection: "column" }}>
          <h3 className="card-title" style={{ marginBottom: "5px" }}><History size={18} /> Verification Timeline Log</h3>
          <p className="card-subtitle" style={{ marginBottom: "20px" }}>Click on any record below to load and inspect details in the CCTV Visualizer.</p>

          {restaurant.mediaUploadTimeline && restaurant.mediaUploadTimeline.length > 0 ? (
            <div className="timeline-items-flow">
              {[...restaurant.mediaUploadTimeline].reverse().map((item, idx) => {
                const dateStr = new Date(item.uploadedAt).toLocaleString();
                const isSelected = activeAnalysis?._id === item._id;

                return (
                  <div 
                    key={item._id || idx}
                    onClick={() => {
                      setActiveAnalysis(item);
                      setConsoleTab("overview");
                    }}
                    className={`timeline-row-card ${isSelected ? "selected" : ""}`}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                      <div className="timeline-img-thumbnail">
                        <img src={item.imageStoragePath} alt="Log" />
                      </div>
                      <div>
                        <h4 className="timeline-item-title">
                          Audit Completed - {item.visionVerificationScore}% Score
                        </h4>
                        <span className="timeline-item-date">{dateStr}</span>
                      </div>
                    </div>

                    <div>
                      {item.detectedViolations.length === 0 ? (
                        <span className="timeline-badge-passed">Passed</span>
                      ) : (
                        <span className="timeline-badge-violations">
                          {item.detectedViolations.length} {item.detectedViolations.length === 1 ? "Violation" : "Violations"}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="history-empty-state">
              <History size={38} className="empty-state-icon" />
              <h4>No Log History</h4>
              <p>Reports will accumulate here as CCTV checks are performed.</p>
            </div>
          )}
        </div>
      )}

      {/* Sleek Minimal Stylesheet */}
      <style>{`
        .console-wrapper {
          display: flex;
          flex-direction: column;
          gap: 20px;
          width: 100%;
          font-family: 'Outfit', 'Inter', sans-serif;
        }

        /* Top sub-navigation menu styles */
        .console-tabs-nav {
          display: flex;
          background: rgba(243, 244, 246, 0.7);
          backdrop-filter: blur(10px);
          padding: 5px;
          border-radius: 16px;
          border: 1px solid rgba(229, 231, 235, 0.8);
          gap: 5px;
          max-width: 600px;
          margin-bottom: 5px;
        }
        .console-nav-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 12px 16px;
          border-radius: 12px;
          border: none;
          background: transparent;
          color: #4b5563;
          font-size: 13.5px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .console-nav-btn:hover {
          color: #111827;
          background: rgba(255, 255, 255, 0.4);
        }
        .console-nav-btn.active {
          background: #ffffff;
          color: #FC8019;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
        }

        /* Cards and Core Panels */
        .console-premium-card {
          background: #ffffff;
          border: 1.5px solid #f0f0f0;
          border-radius: 24px;
          padding: 22px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.02);
          transition: all 0.3s ease;
        }
        .console-premium-card:hover {
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.04);
        }
        .card-title {
          display: flex;
          align-items: center;
          gap: 8px;
          margin: 0;
          font-size: 16px;
          font-weight: 700;
          color: #1f2937;
        }
        .card-subtitle {
          margin: 4px 0 0 0;
          font-size: 12px;
          color: #6b7280;
        }

        /* Status & Timer Styles */
        .timer-tile {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: #fafaf9;
          border: 1.5px solid #f5f5f4;
          border-radius: 20px;
          padding: 18px;
          margin-top: 10px;
          text-align: center;
        }
        .timer-label {
          font-size: 11px;
          font-weight: 600;
          color: #78716c;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .timer-countdown-val {
          font-size: 34px;
          font-weight: 800;
          color: #292524;
          margin-top: 5px;
          font-variant-numeric: tabular-nums;
          letter-spacing: -0.02em;
        }
        .timer-countdown-val.danger-text {
          color: #ef4444;
        }
        .timer-countdown-val.warning-text {
          color: #f59e0b;
        }

        /* Alert badges styling */
        .status-alert-badge {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 8px 12px;
          border-radius: 10px;
          font-size: 11.5px;
          font-weight: 600;
          text-align: center;
        }
        .badge-red {
          color: #dc2626;
          background: #fef2f2;
        }
        .badge-yellow {
          color: #d97706;
          background: #fffbeb;
        }
        .badge-green {
          color: #059669;
          background: #ecfdf5;
        }
        .status-indicator-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          display: block;
        }
        .status-indicator-dot.green {
          background: #10b981;
          box-shadow: 0 0 10px #10b981;
          animation: pulse 2s infinite;
        }
        .status-indicator-dot.yellow {
          background: #f59e0b;
          box-shadow: 0 0 10px #f59e0b;
          animation: pulse 2s infinite;
        }
        .status-indicator-dot.red {
          background: #ef4444;
          box-shadow: 0 0 10px #ef4444;
          animation: pulse 2s infinite;
        }

        /* Upload area styling */
        .upload-trigger-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          background: #FC8019;
          color: white;
          border-radius: 14px;
          height: 48px;
          font-size: 13.5px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.25s ease;
          box-shadow: 0 4px 15px rgba(252, 128, 25, 0.15);
        }
        .upload-trigger-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(252, 128, 25, 0.25);
        }
        .upload-loading-area {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          background: #fafaf9;
          border: 1.5px dashed #d6d3d1;
          border-radius: 14px;
          height: 48px;
          color: #78716c;
          font-size: 13.5px;
          font-weight: 600;
        }
        .upload-error-text {
          color: #ef4444;
          font-size: 11px;
          font-weight: 500;
          margin-top: 8px;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        /* YOLO Presets */
        .preset-buttons-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          margin-top: 10px;
        }
        .sim-action-btn {
          padding: 10px 12px;
          border-radius: 10px;
          font-weight: 600;
          font-size: 11px;
          text-align: left;
          cursor: pointer;
          transition: all 0.2s ease;
          border: 1px solid #e5e7eb;
          background: #fdfdfd;
          color: #4b5563;
        }
        .sim-action-btn:hover {
          transform: translateY(-1px);
        }
        .sim-action-btn.green-btn:hover { background: #ecfdf5; border-color: #a7f3d0; color: #047857; }
        .sim-action-btn.yellow-btn:hover { background: #fffbeb; border-color: #fde68a; color: #b45309; }
        .sim-action-btn.red-btn:hover { background: #fef2f2; border-color: #fca5a5; color: #b91c1c; }

        /* YOLO Visualizer Canvas Styles */
        .canvas-frame {
          position: relative;
          background: #0b0f19;
          border-radius: 20px;
          overflow: hidden;
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 280px;
          flex: 1;
        }
        .yolo-canvas {
          max-width: 100%;
          max-height: 300px;
          display: block;
          border-radius: 8px;
        }
        .stats-results-grid {
          display: grid;
          grid-template-columns: 1fr 1.5fr;
          gap: 12px;
        }
        .stats-results-card {
          background: #fafaf9;
          border: 1.5px solid #f5f5f4;
          padding: 10px 14px;
          border-radius: 14px;
        }
        .results-card-label {
          font-size: 10px;
          color: #78716c;
          display: block;
          text-transform: uppercase;
          font-weight: 600;
        }
        .results-card-val {
          font-size: 18px;
          font-weight: 700;
          margin-top: 2px;
          display: block;
        }
        .green-text { color: #10b981; }
        .red-text { color: #ef4444; }

        .visualizer-empty-state {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          border: 2px dashed #e5e7eb;
          border-radius: 20px;
          color: #9ca3af;
          padding: 40px 20px;
          text-align: center;
        }
        .empty-state-icon {
          color: #d1d5db;
          margin-bottom: 12px;
        }
        .visualizer-empty-state h4 {
          margin: 0;
          font-size: 14px;
          font-weight: 700;
          color: #4b5563;
        }
        .visualizer-empty-state p {
          margin: 4px 0 0 0;
          font-size: 11px;
          color: #9ca3af;
          max-width: 250px;
        }

        /* Menu Manager Styles */
        .search-input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }
        .search-icon {
          position: absolute;
          left: 10px;
          color: #9ca3af;
        }
        .search-menu-input {
          padding: 7px 10px 7px 28px;
          border-radius: 10px;
          border: 1.5px solid #e5e7eb;
          font-size: 12.5px;
          font-family: inherit;
          width: 170px;
          outline: none;
          transition: border-color 0.2s;
        }
        .search-menu-input:focus {
          border-color: #FC8019;
        }
        .digital-menu-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
          max-height: 400px;
          overflow-y: auto;
          padding-right: 5px;
        }
        .menu-item-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 14px;
          background: #fafaf9;
          border-radius: 16px;
          border: 1px solid #f0efed;
          transition: all 0.2s;
        }
        .menu-item-row:hover {
          background: #f5f4f0;
          border-color: #e5e3df;
        }
        .menu-item-header {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }
        .item-title {
          font-size: 13.5px;
          font-weight: 700;
          color: #1f2937;
        }
        .item-badge {
          font-size: 9px;
          color: #059669;
          background: #ecfdf5;
          padding: 1px 6px;
          border-radius: 6px;
          font-weight: 700;
        }
        .item-description {
          font-size: 11px;
          color: #6b7280;
          margin: 3px 0 0 0;
          line-height: 1.3;
        }
        .item-price {
          font-size: 12.5px;
          color: #FC8019;
          display: block;
          margin-top: 4px;
        }
        .delete-item-action-btn {
          background: #fee2e2;
          border: none;
          color: #ef4444;
          cursor: pointer;
          padding: 8px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }
        .delete-item-action-btn:hover {
          background: #fecaca;
          color: #dc2626;
          transform: scale(1.05);
        }
        .menu-empty-state {
          padding: 50px 20px;
          text-align: center;
          color: #9ca3af;
        }
        .menu-empty-state h4 {
          margin: 0;
          font-size: 14px;
          font-weight: 700;
          color: #4b5563;
        }
        .menu-empty-state p {
          margin: 4px 0 0 0;
          font-size: 11px;
          color: #9ca3af;
        }

        /* Form Controls */
        .add-menu-form {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .form-group-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .form-group-label {
          font-size: 10.5px;
          font-weight: 700;
          color: #4b5563;
          text-transform: uppercase;
          letter-spacing: 0.02em;
        }
        .form-group-input, .form-group-select, .form-group-textarea {
          padding: 9px 12px;
          border-radius: 10px;
          border: 1.5px solid #e5e7eb;
          font-size: 13px;
          font-family: inherit;
          outline: none;
          transition: border-color 0.2s;
          background: #fafaf9;
        }
        .form-group-input:focus, .form-group-select:focus, .form-group-textarea:focus {
          border-color: #FC8019;
          background: #ffffff;
        }
        .form-group-textarea {
          resize: none;
        }
        .add-dish-submit-btn {
          margin-top: 5px;
          padding: 11px;
          background: #FC8019;
          color: white;
          border: none;
          border-radius: 12px;
          font-weight: 700;
          font-size: 13px;
          cursor: pointer;
          box-shadow: 0 4px 15px rgba(252, 128, 25, 0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          transition: all 0.25s;
        }
        .add-dish-submit-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(252, 128, 25, 0.25);
        }

        /* Timeline History Styles */
        .timeline-items-flow {
          display: flex;
          flex-direction: column;
          gap: 10px;
          max-height: 420px;
          overflow-y: auto;
          padding-right: 5px;
        }
        .timeline-row-card {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          background: #ffffff;
          border: 1.5px solid #f3f4f6;
          border-radius: 16px;
          cursor: pointer;
          transition: all 0.25s ease;
        }
        .timeline-row-card:hover {
          transform: translateX(3px);
          border-color: #e5e7eb;
          background: #fafaf9;
        }
        .timeline-row-card.selected {
          border-color: #FC8019;
          background: #fff7ed;
        }
        .timeline-img-thumbnail {
          width: 42px;
          height: 42px;
          border-radius: 8px;
          overflow: hidden;
          background: #e5e7eb;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .timeline-img-thumbnail img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .timeline-item-title {
          font-size: 13px;
          font-weight: 700;
          margin: 0;
          color: #1f2937;
        }
        .timeline-item-date {
          font-size: 10px;
          color: #9ca3af;
        }
        .timeline-badge-passed {
          font-size: 10px;
          color: #059669;
          background: #ecfdf5;
          padding: 3px 8px;
          border-radius: 8px;
          font-weight: 700;
        }
        .timeline-badge-violations {
          font-size: 10px;
          color: #dc2626;
          background: #fef2f2;
          padding: 3px 8px;
          border-radius: 8px;
          font-weight: 700;
        }
        .history-empty-state {
          padding: 40px;
          text-align: center;
          color: #9ca3af;
        }

        /* Micro animations */
        .spinner-icon {
          animation: spin 1.2s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0% { transform: scale(0.95); opacity: 0.8; }
          50% { transform: scale(1.05); opacity: 1; }
          100% { transform: scale(0.95); opacity: 0.8; }
        }
        .tab-fade-in {
          animation: tabFade 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes tabFade {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
