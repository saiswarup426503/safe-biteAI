import React from "react";
import { BookOpen, Video, ShieldAlert, BadgeAlert, AlertCircle } from "lucide-react";

export default function Guidelines() {
  return (
    <main className="container" style={{ padding: "40px 0", minHeight: "calc(100vh - 200px)" }}>
      <div style={{ maxWidth: "800px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "30px" }}>
        
        {/* Title */}
        <div className="section-title" style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: 0 }}>
          <div style={{ background: "#FC8019", padding: "8px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", color: "white" }}>
            <BookOpen size={24} />
          </div>
          <div>
            <h2 style={{ margin: 0 }}>SafeBite AI Audit Guidelines</h2>
            <p style={{ margin: 0 }}>Rules and specifications for dark kitchen media surveillance</p>
          </div>
        </div>

        {/* Guidelines Card 1 */}
        <div className="live-kitchen" style={{ position: "static", padding: "28px" }}>
          <h3 style={{ fontSize: "18px", fontWeight: "600", color: "#FC8019", display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
            <Video size={20} /> 1. Live CCTV Stream Ingestion
          </h3>
          <p style={{ fontSize: "14px", color: "#555", lineHeight: "1.6" }}>
            All participating dark kitchens must feed a constant RTSP/HLS live feed to the SafeBite API gateway. 
            The camera must cover the entire active preparation table. CCTV cameras must remain online 
            during business hours. Delays or connection drops will trigger automatic gateway re-routing warning status.
          </p>
        </div>

        {/* Guidelines Card 2 */}
        <div className="live-kitchen" style={{ position: "static", padding: "28px" }}>
          <h3 style={{ fontSize: "18px", fontWeight: "600", color: "#18a65d", display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
            <ShieldAlert size={20} /> 2. 30-Minute Interval Proofs
          </h3>
          <p style={{ fontSize: "14px", color: "#555", lineHeight: "1.6", marginBottom: "12px" }}>
            Merchant operators must submit camera snapshots every 30 minutes. The upload acts as audit proof:
            the image is parsed by our automated computer vision module to classify and locate:
          </p>
          <ul style={{ fontSize: "14px", color: "#555", paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "8px" }}>
            <li>👨‍🍳 <strong>Hairnets / Chef Caps</strong>: Must cover all hair to maintain hygiene. (Value: 30% compliance index).</li>
            <li>👕 <strong>Hygienic Aprons / Chef Coats</strong>: Must cover the torso. (Value: 40% compliance index).</li>
            <li>🧤 <strong>Sanitary Gloves</strong>: Must cover hands when handling active orders. (Value: 30% compliance index).</li>
          </ul>
        </div>

        {/* Guidelines Card 3 */}
        <div className="live-kitchen" style={{ position: "static", padding: "28px" }}>
          <h3 style={{ fontSize: "18px", fontWeight: "600", color: "#e53e3e", display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
            <BadgeAlert size={20} /> 3. Dynamic Penalty Rules
          </h3>
          <p style={{ fontSize: "14px", color: "#555", lineHeight: "1.6" }}>
            Failing to upload a snapshot within 30 minutes results in dynamic score degradation. 
            For every 10 minutes past the deadline, <strong>5 rating points</strong> are subtracted from the restaurant's 
            overall SafeBite AI Score. If the score drops below 80, the merchant's "Hygienic Badge" is suspended, 
            which will alert consumers on the Swiggy checkout app.
          </p>
        </div>

      </div>
    </main>
  );
}
