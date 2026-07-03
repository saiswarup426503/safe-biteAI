import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_DIR = path.join(__dirname, 'data');
const JSON_DB_PATH = path.join(DB_DIR, 'db.json');

// Ensure data directory and JSON DB exist
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

// Initial mock data to seed the database
const initialSeedData = [
  {
    _id: "6677889900112233445566aa",
    name: "Biryani Zone (BTM Layout)",
    cctvStreamUrl: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
    lastMediaUploadTimestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    mediaUploadTimeline: [
      {
        _id: "t1",
        uploadedAt: new Date(Date.now() - 105 * 60 * 1000).toISOString(),
        imageStoragePath: "/uploads/seed_kitchen_1.jpg",
        visionVerificationScore: 100,
        detectedViolations: [],
        predictions: [
          { label: "apron", confidence: 0.95, bbox: [120, 150, 320, 480] },
          { label: "cap", confidence: 0.91, bbox: [180, 40, 280, 120] },
          { label: "gloves", confidence: 0.88, bbox: [140, 340, 220, 400] }
        ]
      },
      {
        _id: "t2",
        uploadedAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
        imageStoragePath: "/uploads/seed_kitchen_2.jpg",
        visionVerificationScore: 66,
        detectedViolations: ["Missing Gloves"],
        predictions: [
          { label: "apron", confidence: 0.93, bbox: [110, 160, 300, 470] },
          { label: "cap", confidence: 0.89, bbox: [175, 45, 275, 115] }
        ]
      }
    ],
    safeBiteAIScore: 83,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 45 * 60 * 1000).toISOString()
  },
  {
    _id: "6677889900112233445566bb",
    name: "The Pizza Palace (Indiranagar)",
    cctvStreamUrl: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
    lastMediaUploadTimestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    mediaUploadTimeline: [
      {
        _id: "t3",
        uploadedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
        imageStoragePath: "/uploads/seed_kitchen_3.jpg",
        visionVerificationScore: 100,
        detectedViolations: [],
        predictions: [
          { label: "apron", confidence: 0.97, bbox: [150, 120, 350, 450] },
          { label: "cap", confidence: 0.94, bbox: [200, 20, 300, 100] },
          { label: "gloves", confidence: 0.92, bbox: [160, 310, 240, 370] }
        ]
      }
    ],
    safeBiteAIScore: 100,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString()
  },
  {
    _id: "6677889900112233445566cc",
    name: "Sagar Ratna (Jayanagar)",
    cctvStreamUrl: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
    lastMediaUploadTimestamp: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
    mediaUploadTimeline: [],
    safeBiteAIScore: 50, // Warning badge since they missed multiple 30-min uploads
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 120 * 60 * 1000).toISOString()
  }
];

if (!fs.existsSync(JSON_DB_PATH)) {
  fs.writeFileSync(JSON_DB_PATH, JSON.stringify(initialSeedData, null, 2));
}

let useFallback = false;

// Attempt mongoose connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/safebite';

// We'll set a low timeout for connection to not hang the app during startup check
try {
  console.log(`Connecting to MongoDB at: ${MONGODB_URI}...`);
  await mongoose.connect(MONGODB_URI, {
    serverSelectionTimeoutMS: 2000
  });
  console.log('MongoDB connected successfully.');
} catch (err) {
  console.warn('\n⚠️  MongoDB connection failed. Falling back to local JSON database mode.');
  console.warn(`Local Database file path: ${JSON_DB_PATH}\n`);
  useFallback = true;
}

// Define Mongoose Schema
const RestaurantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  cctvStreamUrl: { type: String, required: true },
  lastMediaUploadTimestamp: { type: Date },
  mediaUploadTimeline: [{
    uploadedAt: { type: Date, default: Date.now },
    imageStoragePath: { type: String },
    visionVerificationScore: { type: Number },
    detectedViolations: [{ type: String }],
    predictions: [{
      label: { type: String },
      confidence: { type: Number },
      bbox: [{ type: Number }] // [x1, y1, x2, y2]
    }]
  }],
  safeBiteAIScore: { type: Number, default: 100 }
}, { timestamps: true });

const MongooseRestaurant = mongoose.model('Restaurant', RestaurantSchema);

// Fallback JSON-file DB Implementation
class JSONFileDB {
  readData() {
    try {
      const content = fs.readFileSync(JSON_DB_PATH, 'utf-8');
      return JSON.parse(content);
    } catch (e) {
      console.error("Error reading JSON database", e);
      return [];
    }
  }

  writeData(data) {
    try {
      fs.writeFileSync(JSON_DB_PATH, JSON.stringify(data, null, 2));
    } catch (e) {
      console.error("Error writing to JSON database", e);
    }
  }

  async find() {
    return this.readData();
  }

  async findById(id) {
    const data = this.readData();
    return data.find(r => r._id === id || r.id === id);
  }

  async findByIdAndUpdate(id, update, options = {}) {
    const data = this.readData();
    const index = data.findIndex(r => r._id === id || r.id === id);
    if (index === -1) return null;

    const current = data[index];
    
    // Process update fields (simple mongoose-like updates)
    let updatedObj = { ...current };

    if (update.$push && update.$push.mediaUploadTimeline) {
      const newTimelineItem = {
        _id: 't_' + Date.now(),
        ...update.$push.mediaUploadTimeline
      };
      updatedObj.mediaUploadTimeline = [...(updatedObj.mediaUploadTimeline || []), newTimelineItem];
    }

    if (update.$set) {
      updatedObj = { ...updatedObj, ...update.$set };
    } else {
      // Normal top level fields update
      for (const key in update) {
        if (key !== '$push' && key !== '$set') {
          updatedObj[key] = update[key];
        }
      }
    }

    updatedObj.updatedAt = new Date().toISOString();
    data[index] = updatedObj;
    this.writeData(data);
    return updatedObj;
  }

  async create(restaurantData) {
    const data = this.readData();
    const newRestaurant = {
      _id: 'res_' + Date.now() + Math.random().toString(36).substr(2, 5),
      ...restaurantData,
      mediaUploadTimeline: restaurantData.mediaUploadTimeline || [],
      safeBiteAIScore: restaurantData.safeBiteAIScore !== undefined ? restaurantData.safeBiteAIScore : 100,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    data.push(newRestaurant);
    this.writeData(data);
    return newRestaurant;
  }
}

const JSONRestaurant = new JSONFileDB();

// Unified Restaurant Interface
export const Restaurant = {
  find: async (query = {}) => {
    if (useFallback) {
      return await JSONRestaurant.find();
    } else {
      return await MongooseRestaurant.find(query);
    }
  },
  findById: async (id) => {
    if (useFallback) {
      return await JSONRestaurant.findById(id);
    } else {
      return await MongooseRestaurant.findById(id);
    }
  },
  findByIdAndUpdate: async (id, update, options = { new: true }) => {
    if (useFallback) {
      return await JSONRestaurant.findByIdAndUpdate(id, update, options);
    } else {
      return await MongooseRestaurant.findByIdAndUpdate(id, update, options);
    }
  },
  create: async (data) => {
    if (useFallback) {
      return await JSONRestaurant.create(data);
    } else {
      return await MongooseRestaurant.create(data);
    }
  },
  isFallbackMode: () => useFallback
};
