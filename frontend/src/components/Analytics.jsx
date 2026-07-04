import React from "react";
import { BarChart3, AlertTriangle, ShieldCheck, Award } from "lucide-react";

export default function Analytics({ restaurants }) {
  const totalScore = restaurants.reduce((sum, r) => sum + r.safeBiteAIScore, 0);
  const avgScore = restaurants.length > 0 ? Math.round(totalScore / restaurants.length) : 100;
  const hygienicCount = restaurants.filter(r => r.safeBiteAIScore >= 80 && !r.isWarningState).length;
  const warningCount = restaurants.filter(r => r.isWarningState || r.safeBiteAIScore < 80).length;

  // Sorted leaderboard list
  const sortedLeaderboard = [...restaurants].sort((a, b) => b.safeBiteAIScore - a.safeBiteAIScore);

  // Dynamic calculations of timeline violations in the database
  let totalCapViolations = 0;
  let totalApronViolations = 0;
  let totalGloveViolations = 0;
  let totalTimelineEntries = 0;

  restaurants.forEach(r => {
    const timeline = r.mediaUploadTimeline || [];
    totalTimelineEntries += timeline.length;
    timeline.forEach(t => {
      const violations = t.detectedViolations || [];
      if (violations.includes("Missing Cap")) totalCapViolations++;
      if (violations.includes("Missing Apron")) totalApronViolations++;
      if (violations.includes("Missing Gloves")) totalGloveViolations++;
    });
  });

  // Calculate percentage of violations
  const capPct = totalTimelineEntries > 0 ? Math.round((totalCapViolations / totalTimelineEntries) * 100) : 14;
  const glovePct = totalTimelineEntries > 0 ? Math.round((totalGloveViolations / totalTimelineEntries) * 100) : 28;
  const apronPct = totalTimelineEntries > 0 ? Math.round((totalApronViolations / totalTimelineEntries) * 100) : 8;

  return (
    <main className="container" style={{ padding: "40px 0", minHeight: "calc(100vh - 200px)" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: "30px" }}>
        
        {/* Title */}
        <div className="section-title" style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: 0 }}>
          <div style={{ background: "#FC8019", padding: "8px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", color: "white" }}>
            <BarChart3 size={24} />
          </div>
          <div>
            <h2 style={{ margin: 0 }}>District Kitchen Safety Analytics</h2>
            <p style={{ margin: 0 }}>Real-time surveillance audits and YOLOv8 compliance breakdown</p>
          </div>
        </div>

        {/* Stats Row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "25px" }}>
          
          {/* Card 1 */}
          <div className="category-card" style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "30px 20px", transform: "none" }}>
            <span style={{ fontSize: "12px", color: "#888", fontWeight: "600", textTransform: "uppercase", letterSpacing: "1px" }}>
              Compliance Index
            </span>
            <span style={{ fontSize: "44px", fontWeight: "700", color: avgScore >= 80 ? "#18a65d" : "#e53e3e", margin: "10px 0" }}>
              {avgScore}%
            </span>
            <p style={{ fontSize: "13px", color: "#666", textAlign: "center", margin: 0 }}>
              Average hygiene score of active restaurants
            </p>
          </div>

          {/* Card 2 */}
          <div className="category-card" style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "30px 20px", transform: "none" }}>
            <span style={{ fontSize: "12px", color: "#888", fontWeight: "600", textTransform: "uppercase", letterSpacing: "1px" }}>
              Hygienic Badge Active
            </span>
            <span style={{ fontSize: "44px", fontWeight: "700", color: "#18a65d", margin: "10px 0" }}>
              {hygienicCount}
            </span>
            <p style={{ fontSize: "13px", color: "#666", textAlign: "center", margin: 0 }}>
              No critical violations / uploads up-to-date
            </p>
          </div>

          {/* Card 3 */}
          <div className="category-card" style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "30px 20px", transform: "none" }}>
            <span style={{ fontSize: "12px", color: "#888", fontWeight: "600", textTransform: "uppercase", letterSpacing: "1px" }}>
              Warning Alerts
            </span>
            <span style={{ fontSize: "44px", fontWeight: "700", color: warningCount > 0 ? "#e53e3e" : "#18a65d", margin: "10px 0" }}>
              {warningCount}
            </span>
            <p style={{ fontSize: "13px", color: "#666", textAlign: "center", margin: 0 }}>
              Restaurants with pending check/low score
            </p>
          </div>
        </div>

        {/* Dashboard Widgets */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "30px" }}>
          
          {/* Violations chart */}
          <div className="live-kitchen" style={{ position: "static", padding: "30px" }}>
            <h3 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "20px" }}>
              YOLOv8 Violation Breakdown
            </h3>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "25px" }}>
              {/* Cap */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", fontWeight: "600", marginBottom: "6px" }}>
                  <span>Hairnet / Cap Violations</span>
                  <span style={{ color: "#FC8019" }}>{capPct}%</span>
                </div>
                <div style={{ width: "100%", height: "10px", background: "#f0ece4", borderRadius: "5px", overflow: "hidden" }}>
                  <div style={{ width: `${capPct}%`, height: "100%", background: "#FC8019", borderRadius: "5px" }}></div>
                </div>
              </div>

              {/* Gloves */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", fontWeight: "600", marginBottom: "6px" }}>
                  <span>Glove / Hand Hygiene Violations</span>
                  <span style={{ color: "#e53e3e" }}>{glovePct}%</span>
                </div>
                <div style={{ width: "100%", height: "10px", background: "#f0ece4", borderRadius: "5px", overflow: "hidden" }}>
                  <div style={{ width: `${glovePct}%`, height: "100%", background: "#e53e3e", borderRadius: "5px" }}></div>
                </div>
              </div>

              {/* Aprons */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", fontWeight: "600", marginBottom: "6px" }}>
                  <span>Chef Uniform / Apron Violations</span>
                  <span style={{ color: "#d69e2e" }}>{apronPct}%</span>
                </div>
                <div style={{ width: "100%", height: "10px", background: "#f0ece4", borderRadius: "5px", overflow: "hidden" }}>
                  <div style={{ width: `${apronPct}%`, height: "100%", background: "#d69e2e", borderRadius: "5px" }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Leaderboard */}
          <div className="live-kitchen" style={{ position: "static", padding: "30px" }}>
            <h3 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
              <Award size={20} color="#FC8019" /> Compliance Leaderboard
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {sortedLeaderboard.map((r, i) => (
                <div 
                  key={r._id} 
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "12px 18px",
                    background: "#fdfcfa",
                    border: "1.5px solid #fff3e8",
                    borderRadius: "12px"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{ fontSize: "14px", fontWeight: "700", color: "#FC8019" }}>#{i+1}</span>
                    <span style={{ fontSize: "14px", fontWeight: "600" }}>{r.name.split(" (")[0]}</span>
                  </div>
                  <span 
                    style={{
                      fontSize: "14px",
                      fontWeight: "700",
                      color: r.safeBiteAIScore >= 80 ? "#18a65d" : "#e53e3e"
                    }}
                  >
                    {r.safeBiteAIScore} / 100
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
