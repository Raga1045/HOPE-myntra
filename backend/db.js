import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const useMongoose = !!process.env.MONGODB_URI;

// Mock database model implementation for JSON-based local fallback
class MockModel {
  constructor(filename) {
    this.filePath = path.join(process.cwd(), 'data', filename);
  }
  
  read() {
    const dir = path.dirname(this.filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    if (!fs.existsSync(this.filePath)) {
      fs.writeFileSync(this.filePath, JSON.stringify([], null, 2));
      return [];
    }
    try {
      return JSON.parse(fs.readFileSync(this.filePath, 'utf8'));
    } catch (e) {
      console.error(`Error reading mock file ${this.filePath}:`, e);
      return [];
    }
  }

  write(data) {
    const dir = path.dirname(this.filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2));
  }

  async find(filter = {}) {
    const data = this.read();
    return data.filter(item => {
      for (let key in filter) {
        const filterVal = filter[key];
        const itemVal = item[key];
        
        if (filterVal === undefined) continue;

        // Support exact matches and array tags check
        if (Array.isArray(itemVal)) {
          if (Array.isArray(filterVal)) {
            if (!filterVal.every(v => itemVal.includes(v))) return false;
          } else {
            if (!itemVal.includes(filterVal)) return false;
          }
        } else if (Array.isArray(filterVal)) {
          if (!filterVal.includes(itemVal)) return false;
        } else {
          // Normalize string comparison if matching mongo IDs vs numbers
          if (String(itemVal) !== String(filterVal)) {
            return false;
          }
        }
      }
      return true;
    });
  }

  async findOne(filter = {}) {
    const results = await this.find(filter);
    return results[0] || null;
  }

  async findById(id) {
    return this.findOne({ _id: String(id) });
  }

  async create(doc) {
    const data = this.read();
    const newDoc = { ...doc };
    if (!newDoc._id) {
      newDoc._id = String(Date.now() + Math.floor(Math.random() * 100000));
    }
    if (!newDoc.id) {
      newDoc.id = newDoc._id;
    }
    data.push(newDoc);
    this.write(data);
    return newDoc;
  }

  async insertMany(docs) {
    const data = this.read();
    const createdDocs = docs.map((doc, idx) => {
      const newDoc = { ...doc };
      if (!newDoc._id) {
        newDoc._id = String(Date.now() + idx + Math.floor(Math.random() * 100000));
      }
      if (!newDoc.id) {
        newDoc.id = newDoc._id;
      }
      return newDoc;
    });
    data.push(...createdDocs);
    this.write(data);
    return createdDocs;
  }

  async updateOne(filter, update, options = {}) {
    const data = this.read();
    let foundIndex = -1;
    
    for (let i = 0; i < data.length; i++) {
      let isMatch = true;
      for (let key in filter) {
        if (String(data[i][key]) !== String(filter[key])) {
          isMatch = false;
          break;
        }
      }
      if (isMatch) {
        foundIndex = i;
        break;
      }
    }

    const updateFields = update.$set || update;
    if (foundIndex !== -1) {
      data[foundIndex] = { ...data[foundIndex], ...updateFields };
      this.write(data);
      return { matchedCount: 1, modifiedCount: 1 };
    } else if (options.upsert) {
      const newDoc = { ...filter, ...updateFields };
      await this.create(newDoc);
      return { matchedCount: 0, modifiedCount: 1, upsertedId: newDoc._id };
    }
    return { matchedCount: 0, modifiedCount: 0 };
  }

  async deleteMany(filter = {}) {
    const data = this.read();
    if (Object.keys(filter).length === 0) {
      this.write([]);
      return { deletedCount: data.length };
    }
    const remaining = data.filter(item => {
      for (let key in filter) {
        if (String(item[key]) === String(filter[key])) return false;
      }
      return true;
    });
    this.write(remaining);
    return { deletedCount: data.length - remaining.length };
  }
}

// Schemas & Models Definition
let User, CultureProfile, Festival, Product, Purchase, ReturnOutcome;

if (useMongoose) {
  console.log('MongoDB Mode: Using Mongoose.');
  
  const UserSchema = new mongoose.Schema({
    _id: String,
    id: String,
    name: String,
    email: String
  });

  const CultureProfileSchema = new mongoose.Schema({
    _id: String,
    userId: String,
    state: String,
    festivals: [String],
    language: String,
    gender: String,
    heightBand: String,
    weightBand: String,
    bodyType: String,
    preferredFit: String
  });

  const FestivalSchema = new mongoose.Schema({
    _id: String,
    id: Number,
    festival: String,
    state: String,
    startDate: Date,
    endDate: Date,
    isRegional: Boolean,
    isNational: Boolean,
    priority: Number,
    primaryLanguage: String,
    category: String,
    womenClothing: [String],
    menClothing: [String],
    accessories: [String],
    footwear: [String],
    artwork: String,
    themeGradient: String,
    offerText: String,
    greeting: String
  });

  const ProductSchema = new mongoose.Schema({
    _id: String,
    name: String,
    price: Number,
    brand: String,
    rating: Number,
    category: String,
    image: String,
    festivalTags: [String],
    regionTags: [String],
    color: String,
    style: String
  });

  const PurchaseSchema = new mongoose.Schema({
    _id: String,
    userId: String,
    productId: String,
    festival: String,
    price: Number,
    brand: String,
    color: String,
    date: String
  });

  const ReturnOutcomeSchema = new mongoose.Schema({
    _id: String,
    userId: String,
    productId: String,
    brand: String,
    category: String,
    gender: String,
    heightBand: String,
    weightBand: String,
    bodyType: String,
    preferredFit: String,
    state: String,
    sizePurchased: String,
    kept: Boolean,
    returned: Boolean,
    timestamp: Date
  });

  User = mongoose.models.User || mongoose.model('User', UserSchema);
  CultureProfile = mongoose.models.CultureProfile || mongoose.model('CultureProfile', CultureProfileSchema);
  Festival = mongoose.models.Festival || mongoose.model('Festival', FestivalSchema);
  Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);
  Purchase = mongoose.models.Purchase || mongoose.model('Purchase', PurchaseSchema);
  ReturnOutcome = mongoose.models.ReturnOutcome || mongoose.model('ReturnOutcome', ReturnOutcomeSchema);
} else {
  console.log('Fallback Mode: Using Local JSON database.');
  User = new MockModel('users.json');
  CultureProfile = new MockModel('culture_profiles.json');
  Festival = new MockModel('festivals.json');
  Product = new MockModel('products.json');
  Purchase = new MockModel('purchases.json');
  ReturnOutcome = new MockModel('returns_outcomes.json');
}

export async function connectDB() {
  if (useMongoose) {
    try {
      await mongoose.connect(process.env.MONGODB_URI);
      console.log('Successfully connected to MongoDB.');
    } catch (err) {
      console.error('Failed to connect to MongoDB Atlas, falling back to JSON db.', err);
      // Fallback variables locally
      User = new MockModel('users.json');
      CultureProfile = new MockModel('culture_profiles.json');
      Festival = new MockModel('festivals.json');
      Product = new MockModel('products.json');
      Purchase = new MockModel('purchases.json');
      ReturnOutcome = new MockModel('returns_outcomes.json');
    }
  } else {
    console.log('Local JSON database initialized.');
  }
}

export { User, CultureProfile, Festival, Product, Purchase, ReturnOutcome };
