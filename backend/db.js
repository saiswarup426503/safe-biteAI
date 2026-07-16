import 'dotenv/config';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_DIR = path.join(__dirname, 'data');
const JSON_RESTAURANTS_PATH = path.join(DB_DIR, 'restaurants.json');
const JSON_CUSTOMERS_PATH = path.join(DB_DIR, 'customers.json');
const JSON_MERCHANTS_PATH = path.join(DB_DIR, 'merchants.json');

// Ensure data directory exists
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
    updatedAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    menu: [
      { name: "Special Chicken Biryani", price: 280, category: "Biryani", description: "Authentic fragrant Basmati rice cooked with tender spiced chicken piece." },
      { name: "Paneer Tikka Biryani", price: 240, category: "Biryani", description: "Layered biryani with grilled cottage cheese cubes in rich masala." },
      { name: "Chicken Lollipop (6 Pcs)", price: 220, category: "Starters", description: "Crispy fried chicken drums marinated in spicy herbs." },
      { name: "Cold Beverage", price: 40, category: "Beverages", description: "Refreshing soft drink served chilled." }
    ]
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
    updatedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    menu: [
      { name: "Classic Margherita Pizza", price: 320, category: "Pizzas", description: "Hand-stretched crust, premium mozzarella, rich marinara sauce, fresh basil." },
      { name: "Spiced Paneer Delight Pizza", price: 380, category: "Pizzas", description: "Topped with marinated paneer, capsicum, onion, and spicy paprika." },
      { name: "Cheesy Garlic Breadsticks", price: 160, category: "Starters", description: "Freshly baked dough loaded with cheese and brushed with garlic butter." },
      { name: "Chocolate Lava Cake", price: 120, category: "Desserts", description: "Warm chocolate cake with a molten lava gooey center." }
    ]
  },
  {
    _id: "6677889900112233445566cc",
    name: "Sagar Ratna (Jayanagar)",
    cctvStreamUrl: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
    lastMediaUploadTimestamp: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
    mediaUploadTimeline: [],
    safeBiteAIScore: 50,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
    menu: [
      { name: "Ghee Roast Masala Dosa", price: 110, category: "Dosa", description: "Crispy golden crepe roasted in pure ghee, filled with potato bhaji." },
      { name: "Idli Vada Combo", price: 80, category: "Breakfast", description: "Two soft steamed rice cakes and one crispy fried lentil donut." },
      { name: "Rava Onion Dosa", price: 120, category: "Dosa", description: "Crispy semolina crepe topped with roasted onions and green chilies." },
      { name: "South Indian Filter Coffee", price: 45, category: "Beverages", description: "Traditional hot brewed decoction coffee frothed with milk." }
    ]
  }
];

// Seed fallback databases if not present
if (!fs.existsSync(JSON_RESTAURANTS_PATH)) {
  const oldPath = path.join(DB_DIR, 'db.json');
  if (fs.existsSync(oldPath)) {
    fs.copyFileSync(oldPath, JSON_RESTAURANTS_PATH);
  } else {
    fs.writeFileSync(JSON_RESTAURANTS_PATH, JSON.stringify(initialSeedData, null, 2));
  }
}

// Fallback JSON-file DB Implementation
class JSONFileDB {
  constructor(filePath, initialData = [], idPrefix = 'rec_') {
    this.filePath = filePath;
    this.initialData = initialData;
    this.idPrefix = idPrefix;
    this.ensureExists();
  }

  ensureExists() {
    if (!fs.existsSync(this.filePath)) {
      fs.writeFileSync(this.filePath, JSON.stringify(this.initialData, null, 2));
    }
  }

  readData() {
    try {
      const content = fs.readFileSync(this.filePath, 'utf-8');
      return JSON.parse(content);
    } catch (e) {
      console.error("Error reading JSON database:", this.filePath, e);
      return [];
    }
  }

  writeData(data) {
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2));
    } catch (e) {
      console.error("Error writing to JSON database:", this.filePath, e);
    }
  }

  async find(query = {}) {
    const data = this.readData();
    return data.filter(item => 
      Object.keys(query).every(key => item[key] === query[key])
    );
  }

  async findOne(query = {}) {
    const data = this.readData();
    return data.find(item => 
      Object.keys(query).every(key => item[key] === query[key])
    ) || null;
  }

  async findById(id) {
    const data = this.readData();
    return data.find(r => r._id === id || r.id === id) || null;
  }

  async findByIdAndUpdate(id, update, options = {}) {
    const data = this.readData();
    const index = data.findIndex(r => r._id === id || r.id === id);
    if (index === -1) return null;

    const current = data[index];
    let updatedObj = { ...current };

    if (update.$push) {
      for (const key in update.$push) {
        const val = update.$push[key];
        const newTimelineItem = {
          _id: 't_' + Date.now() + Math.random().toString(36).substr(2, 4),
          ...val
        };
        updatedObj[key] = [...(updatedObj[key] || []), newTimelineItem];
      }
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

  async create(recordData) {
    const data = this.readData();
    const newRecord = {
      _id: this.idPrefix + Date.now() + Math.random().toString(36).substr(2, 5),
      ...recordData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    data.push(newRecord);
    this.writeData(data);
    return newRecord;
  }
}

const JSONRestaurant = new JSONFileDB(JSON_RESTAURANTS_PATH, initialSeedData, 'res_');
const JSONUser = new JSONFileDB(JSON_CUSTOMERS_PATH, [], 'usr_');
const JSONMerchant = new JSONFileDB(JSON_MERCHANTS_PATH, [], 'mer_');

let useFallback = false;
let customerDb, merchantDb;

const CUSTOMER_MONGODB_URI = process.env.CUSTOMER_MONGODB_URI || 'mongodb://localhost:27017/safebite_customer';
const MERCHANT_MONGODB_URI = process.env.MERCHANT_MONGODB_URI || 'mongodb://localhost:27017/safebite_merchant';

try {
  console.log(`Connecting to Customer DB at: ${CUSTOMER_MONGODB_URI}...`);
  customerDb = mongoose.createConnection(CUSTOMER_MONGODB_URI, { serverSelectionTimeoutMS: 2000 });
  
  console.log(`Connecting to Merchant/Restaurant DB at: ${MERCHANT_MONGODB_URI}...`);
  merchantDb = mongoose.createConnection(MERCHANT_MONGODB_URI, { serverSelectionTimeoutMS: 2000 });

  // Wait for connections to resolve
  await new Promise((resolve, reject) => {
    let customerConnected = false;
    let merchantConnected = false;
    
    const timeout = setTimeout(() => {
      reject(new Error("Mongoose connection timeout"));
    }, 2500);

    customerDb.on('connected', () => {
      customerConnected = true;
      if (customerConnected && merchantConnected) {
        clearTimeout(timeout);
        resolve();
      }
    });

    merchantDb.on('connected', () => {
      merchantConnected = true;
      if (customerConnected && merchantConnected) {
        clearTimeout(timeout);
        resolve();
      }
    });

    customerDb.on('error', (err) => {
      clearTimeout(timeout);
      reject(err);
    });

    merchantDb.on('error', (err) => {
      clearTimeout(timeout);
      reject(err);
    });
  });
  console.log('MongoDB connections established successfully.');
} catch (err) {
  console.warn('\n⚠️ MongoDB connections failed. Falling back to local JSON database mode.');
  console.warn(`Customer JSON DB: ${JSON_CUSTOMERS_PATH}`);
  console.warn(`Merchant JSON DB: ${JSON_MERCHANTS_PATH}`);
  console.warn(`Restaurant JSON DB: ${JSON_RESTAURANTS_PATH}\n`);
  useFallback = true;
}

// Define Mongoose Schemas
const RestaurantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: { type: String },
  cctvStreamUrl: { type: String, required: true },
  lastMediaUploadTimestamp: { type: Date },
  mediaUploadTimeline: [{
    _id: { type: String },
    uploadedAt: { type: Date, default: Date.now },
    imageStoragePath: { type: String },
    visionVerificationScore: { type: Number },
    detectedViolations: [{ type: String }],
    predictions: [{
      label: { type: String },
      confidence: { type: Number },
      bbox: [{ type: Number }] // [x1, y1, x2, y2]
    }],
    modelUsed: { type: String }
  }],
  safeBiteAIScore: { type: Number, default: 100 },
  menu: [{
    name: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: String },
    description: { type: String }
  }]
}, { timestamps: true });

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'customer' },
  address: { type: String },
  orderHistory: { type: Array, default: [] }
}, { timestamps: true });

const MerchantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'merchant' },
  linkedRestaurantId: { type: String, required: true },
  restaurantName: { type: String }
}, { timestamps: true });

let MongooseRestaurant;
let MongooseUser;
let MongooseMerchant;

if (!useFallback) {
  MongooseRestaurant = merchantDb.model('Restaurant', RestaurantSchema);
  MongooseUser = customerDb.model('User', UserSchema);
  MongooseMerchant = merchantDb.model('Merchant', MerchantSchema);

  // Auto-seed MongoDB on initial run if empty
  try {
    const count = await MongooseRestaurant.countDocuments();
    if (count === 0) {
      console.log('🌱 Seeding initial restaurant data to MongoDB...');
      await MongooseRestaurant.insertMany(initialSeedData);
      console.log('✅ MongoDB seeding completed successfully.');
    }
  } catch (seedError) {
    console.error('⚠️ MongoDB seeding check failed:', seedError.message);
  }
}

// Unified Database Interfaces
export const Restaurant = {
  find: async (query = {}) => {
    if (useFallback) return await JSONRestaurant.find(query);
    return await MongooseRestaurant.find(query);
  },
  findById: async (id) => {
    if (useFallback) return await JSONRestaurant.findById(id);
    return await MongooseRestaurant.findById(id);
  },
  findByIdAndUpdate: async (id, update, options = { new: true }) => {
    if (useFallback) return await JSONRestaurant.findByIdAndUpdate(id, update, options);
    return await MongooseRestaurant.findByIdAndUpdate(id, update, options);
  },
  create: async (data) => {
    if (useFallback) return await JSONRestaurant.create(data);
    return await MongooseRestaurant.create(data);
  },
  isFallbackMode: () => useFallback
};

export const User = {
  find: async (query = {}) => {
    if (useFallback) return await JSONUser.find(query);
    return await MongooseUser.find(query);
  },
  findOne: async (query = {}) => {
    if (useFallback) return await JSONUser.findOne(query);
    return await MongooseUser.findOne(query);
  },
  findById: async (id) => {
    if (useFallback) return await JSONUser.findById(id);
    return await MongooseUser.findById(id);
  },
  create: async (data) => {
    if (useFallback) return await JSONUser.create(data);
    return await MongooseUser.create(data);
  },
  findByIdAndUpdate: async (id, update, options = { new: true }) => {
    if (useFallback) return await JSONUser.findByIdAndUpdate(id, update, options);
    return await MongooseUser.findByIdAndUpdate(id, update, options);
  }
};

export const Merchant = {
  find: async (query = {}) => {
    if (useFallback) return await JSONMerchant.find(query);
    return await MongooseMerchant.find(query);
  },
  findOne: async (query = {}) => {
    if (useFallback) return await JSONMerchant.findOne(query);
    return await MongooseMerchant.findOne(query);
  },
  findById: async (id) => {
    if (useFallback) return await JSONMerchant.findById(id);
    return await MongooseMerchant.findById(id);
  },
  create: async (data) => {
    if (useFallback) return await JSONMerchant.create(data);
    return await MongooseMerchant.create(data);
  },
  findByIdAndUpdate: async (id, update, options = { new: true }) => {
    if (useFallback) return await JSONMerchant.findByIdAndUpdate(id, update, options);
    return await MongooseMerchant.findByIdAndUpdate(id, update, options);
  }
};
