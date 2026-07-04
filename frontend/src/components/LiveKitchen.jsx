import {
  ShieldCheck,
  CheckCircle2,
  Video,
} from "lucide-react";

function LiveKitchen() {
  return (
    <div className="live-kitchen">

      <h2>Live Kitchen</h2>

      <div className="video-box">

        <Video size={50} />

        <p>Live Camera Feed</p>

      </div>

      <div className="hygiene-score">

        <ShieldCheck size={22} />

        <div>

          <h3>96 / 100</h3>

          <span>Overall Hygiene Score</span>

        </div>

      </div>

      <div className="checks">

        <div>
          <CheckCircle2 color="green" />
          Hairnet Detected
        </div>

        <div>
          <CheckCircle2 color="green" />
          Gloves Detected
        </div>

        <div>
          <CheckCircle2 color="green" />
          Apron Detected
        </div>

        <div>
          <CheckCircle2 color="green" />
          Clean Workspace
        </div>

      </div>

      <button className="order-btn">

        Order Now

      </button>

    </div>
  );
}

export default LiveKitchen;