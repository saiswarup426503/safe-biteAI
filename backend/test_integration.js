import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import FormData from 'form-data';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const runIntegration = async () => {
  console.log("==================================================");
  console.log("🧪 Running End-to-End Integration Verification...");
  console.log("==================================================");

  let fastApiProc = null;
  let expressProc = null;

  try {
    // 1. Launch Python FastAPI ML Engine in background on port 8000
    console.log("Starting Python FastAPI ML Engine...");
    fastApiProc = spawn('python', ['main.py'], {
      cwd: path.join(__dirname, '../ml-engine'),
      stdio: 'inherit',
      shell: true
    });

    // Wait 3 seconds for FastAPI to boot
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // 2. Launch Express Gateway on port 5000
    console.log("Starting Express Gateway Server...");
    expressProc = spawn('node', ['server.js'], {
      cwd: __dirname,
      stdio: 'inherit',
      shell: true
    });

    // Wait 2 seconds for Express to boot
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // 3. Perform a GET query to check restaurants list
    console.log("Fetching restaurant records from Express Gateway...");
    const resList = await axios.get('http://127.0.0.1:5000/api/restaurants');
    console.log(`Restaurants found: ${resList.data.length}`);
    const testRes = resList.data[0];
    console.log(`Selecting restaurant for upload: "${testRes.name}" (ID: ${testRes._id})`);

    // 4. Create mock test image file
    const testImageName = 'integration_test_kitchen.jpg';
    const testImagePath = path.join(__dirname, testImageName);
    
    // Simple 1x1 jpeg base64
    const base64Data = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    fs.writeFileSync(testImagePath, Buffer.from(base64Data, 'base64'));

    // 5. Send multipart upload POST request to Express Gateway
    console.log("Uploading snapshot to Express Gateway (triggers FastAPI YOLO analysis)...");
    const form = new FormData();
    form.append('snapshot', fs.createReadStream(testImagePath), {
      filename: 'kitchen_clean_pass_integration.jpg',
      contentType: 'image/jpeg'
    });

    const uploadResponse = await axios.post(
      `http://127.0.0.1:5000/api/restaurants/${testRes._id}/upload`,
      form,
      {
        headers: {
          ...form.getHeaders()
        }
      }
    );

    console.log("Ingestion Response status:", uploadResponse.status);
    const body = uploadResponse.data;
    
    if (body.success) {
      console.log("✅ Integration upload succeeded!");
      console.log("✅ Latest Analysis Verification Score:", body.latestAnalysis.visionVerificationScore);
      console.log("✅ Detected predictions count:", body.latestAnalysis.predictions?.length);
      console.log("✅ Updated Restaurant SafeBite AI Score:", body.restaurant.safeBiteAIScore);
    } else {
      throw new Error(`Integration upload failed: ${body.error || 'unknown error'}`);
    }

    // Clean up test image
    if (fs.existsSync(testImagePath)) {
      fs.unlinkSync(testImagePath);
    }

    console.log("\n🎉 End-to-End Integration Verification successful!");

  } catch (error) {
    console.error("\n❌ Integration verification failed:", error.message);
  } finally {
    // Kill processes
    console.log("Shutting down background test servers...");
    if (fastApiProc) {
      fastApiProc.kill('SIGINT');
    }
    if (expressProc) {
      expressProc.kill('SIGINT');
    }
    process.exit(0);
  }
};

runIntegration();
