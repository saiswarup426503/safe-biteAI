import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_KEY in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
console.log("Supabase HTTP client initialized successfully");

class SupabaseWrapper {
  constructor(tableName) {
    this.table = tableName;
  }

  async find(query = {}) {
    let req = supabase.from(this.table).select();
    for (const key in query) {
      // If the code sends _id, query by id instead
      const dbKey = key === '_id' ? 'id' : key;
      req = req.eq(dbKey, query[key]);
    }
    const { data, error } = await req;
    if (error) {
      console.error(`Error finding in ${this.table}:`, error);
      return [];
    }
    return data.map(d => ({ ...d, _id: d.id }));
  }

  async findOne(query = {}) {
    let req = supabase.from(this.table).select();
    for (const key in query) {
      const dbKey = key === '_id' ? 'id' : key;
      req = req.eq(dbKey, query[key]);
    }
    const { data, error } = await req.maybeSingle();
    if (error) {
      console.error(`Error findOne in ${this.table}:`, error);
      return null;
    }
    if (data) data._id = data.id;
    return data;
  }

  async findById(id) {
    const { data, error } = await supabase.from(this.table).select().eq('id', id).maybeSingle();
    if (error) {
      console.error(`Error findById in ${this.table}:`, error);
      return null;
    }
    if (data) data._id = data.id;
    return data;
  }

  async create(recordData) {
    // Supabase generates the id automatically (uuid)
    const { _id, id, createdAt, updatedAt, ...cleanData } = recordData;
    
    const { data, error } = await supabase.from(this.table).insert(cleanData).select().single();
    if (error) {
      console.error(`Error creating in ${this.table}:`, error);
      throw error;
    }
    if (data) data._id = data.id;
    return data;
  }

  async findByIdAndUpdate(id, update, options = {}) {
    // 1. Fetch current row
    const { data: current, error: fetchErr } = await supabase.from(this.table).select().eq('id', id).maybeSingle();
    if (fetchErr || !current) {
      return null;
    }

    let updatedObj = { ...current };

    // 2. Handle $push
    if (update.$push) {
      for (const key in update.$push) {
        const val = update.$push[key];
        const newTimelineItem = {
          _id: 't_' + Date.now() + Math.random().toString(36).substr(2, 4),
          ...val
        };
        const currentArr = Array.isArray(updatedObj[key]) 
          ? updatedObj[key] 
          : (typeof updatedObj[key] === 'string' ? JSON.parse(updatedObj[key]) : []);
        updatedObj[key] = [...currentArr, newTimelineItem];
      }
    }

    // 3. Handle $set or flat updates
    if (update.$set) {
      updatedObj = { ...updatedObj, ...update.$set };
    } else if (!update.$push) {
      for (const key in update) {
        updatedObj[key] = update[key];
      }
    }

    // 4. Clean up non-updatable fields
    delete updatedObj.id;
    delete updatedObj._id;
    delete updatedObj.created_at;
    updatedObj.updated_at = new Date().toISOString();

    // 5. Update back to Supabase
    const { data: saved, error: updateErr } = await supabase.from(this.table).update(updatedObj).eq('id', id).select().single();
    if (updateErr) {
      console.error(`Error updating in ${this.table}:`, updateErr);
      return null;
    }
    
    if (saved) saved._id = saved.id;
    return saved;
  }
}

export const Restaurant = new SupabaseWrapper('restaurants');
export const User = new SupabaseWrapper('users');
export const Merchant = new SupabaseWrapper('merchants');

Restaurant.isFallbackMode = () => false;
