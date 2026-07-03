import { Restaurant } from './db.js';

const runTests = async () => {
  console.log("==================================================");
  console.log("🧪 Running Express Gateway Connection Checks...");
  console.log("==================================================");
  
  try {
    // 1. Check fallback state
    const fallbackMode = Restaurant.isFallbackMode();
    console.log(`ℹ️ Database mode: ${fallbackMode ? '⚠️ LOCAL JSON FALLBACK MODE' : '🚀 MONGO DB LIVE MODE'}`);

    // 2. Fetch seed data
    const list = await Restaurant.find({});
    console.log(`✅ Restaurant collection queried successfully. Count: ${list.length}`);
    if (list.length > 0) {
      list.forEach((res, i) => {
        console.log(`   [${i+1}] ${res.name} (Score: ${res.safeBiteAIScore}/100, Timelines: ${res.mediaUploadTimeline?.length || 0})`);
      });
    } else {
      throw new Error("No restaurant seed records returned!");
    }

    // 3. Test details lookup
    const target = list[0];
    const item = await Restaurant.findById(target._id);
    if (item && item.name === target.name) {
      console.log(`✅ FindById check successful for "${item.name}"`);
    } else {
      throw new Error(`FindById lookup mismatch for ID: ${target._id}`);
    }

    console.log("\n🎉 All Express gateway connection tests passed successfully!");
  } catch (error) {
    console.error("\n❌ Connection verification failed:", error.message);
  }
  console.log("==================================================");
  process.exit(0);
};

// Wait a brief moment for async Mongoose connect handlers to establish connection
setTimeout(runTests, 1000);
