import axios from 'axios';
import fs from 'fs';
import path from 'path';
import FormData from 'form-data';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const testLive = async () => {
  console.log("==================================================");
  console.log("🧪 testing Live Upload and YOLO compliance check...");
  console.log("==================================================");

  try {
    // 1. Fetch restaurant list to find target ID
    const res = await axios.get('http://127.0.0.1:5000/api/restaurants');
    const target = res.data[0];
    console.log(`Target Restaurant: ${target.name} (ID: ${target._id})`);

    // 2. Create test image file
    const testFile = path.join(__dirname, 'test_live_chef.jpg');
    // base64 representations
    const base64Data = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    fs.writeFileSync(testFile, Buffer.from(base64Data, 'base64'));

    // 3. Post to Express Server
    const form = new FormData();
    form.append('snapshot', fs.createReadStream(testFile), {
      filename: 'kitchen_clean_pass_live.jpg',
      contentType: 'image/jpeg'
    });

    console.log("Uploading file to Express gateway...");
    const uploadRes = await axios.post(
      `http://127.0.0.1:5000/api/restaurants/${target._id}/upload`,
      form,
      {
        headers: {
          ...form.getHeaders()
        }
      }
    );

    console.log("Upload response status:", uploadRes.status);
    const body = uploadRes.data;

    if (body.success) {
      console.log("🎉 SUCCESS!");
      console.log("Returned timeline score:", body.latestAnalysis.visionVerificationScore);
      console.log("Detected compliance predictions:", body.latestAnalysis.predictions.map(p => p.label).join(", "));
      console.log("Detected violations:", body.latestAnalysis.detectedViolations);
      console.log("New average SafeBite AI Score:", body.restaurant.safeBiteAIScore);
    } else {
      console.error("❌ Failed:", body.error);
    }

    // Clean up file
    if (fs.existsSync(testFile)) {
      fs.unlinkSync(testFile);
    }

  } catch (error) {
    console.error("❌ Test script failed:", error.message);
  }
  console.log("==================================================");
};

testLive();
