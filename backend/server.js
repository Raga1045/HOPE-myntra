import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';
import { connectDB, User, CultureProfile, Festival, Product, Purchase } from './db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

app.use(cors());
app.use(express.json());

// Initialize Database Connection
connectDB();

// 1. LOGIN ROUTE
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    let user = await User.findOne({ email });
    if (!user) {
      // Create user if not exists
      const newUserId = String(Date.now());
      user = await User.create({
        _id: newUserId,
        id: newUserId,
        name: email.split('@')[0],
        email: email
      });
    }
    res.json({ success: true, user });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2. PROFILE SETUP ROUTE
app.post('/api/profile', async (req, res) => {
  const { userId, state, festivals, language } = req.body;
  try {
    const updated = await CultureProfile.updateOne(
      { userId },
      { userId, state, festivals, language },
      { upsert: true }
    );
    res.json({ success: true, profile: { userId, state, festivals, language } });
  } catch (err) {
    console.error("Profile error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET PROFILE ROUTE
app.get('/api/profile/:userId', async (req, res) => {
  try {
    const profile = await CultureProfile.findOne({ userId: req.params.userId });
    res.json({ success: true, profile });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. HOMEPAGE FEED ROUTE
app.get('/api/homepage', async (req, res) => {
  const { userId, cultureMode } = req.query;
  const isCultureMode = cultureMode !== 'false';

  try {
    if (!isCultureMode) {
      // NORMAL MODE: Generic Trending, Recommended, and Top Brands
      const allProducts = await Product.find({});
      
      // Shuffle products helper
      const shuffle = arr => arr.sort(() => 0.5 - Math.random());
      
      const trending = shuffle([...allProducts]).slice(0, 8);
      const recommended = shuffle([...allProducts]).slice(0, 8);
      const topBrands = allProducts.filter(p => ["Roadster", "HRX", "Mast & Harbour"].includes(p.brand)).slice(0, 8);

      return res.json({
        cultureMode: false,
        feed: {
          trending,
          recommended,
          topBrands
        }
      });
    }

    // CULTURE MODE: Entire Homepage changes based on regional preferences
    // Find user's culture profile, default to Andhra/Ugadi if not set
    let profile = await CultureProfile.findOne({ userId });
    if (!profile) {
      profile = {
        state: "Andhra Pradesh",
        festivals: ["Ugadi", "Diwali"],
        language: "English"
      };
    }

    const stateName = profile.state;
    // Map State name to region tag prefix
    const regionTag = stateName.split(' ')[0]; // Andhra Pradesh -> Andhra, Tamil Nadu -> Tamil, etc.
    
    // Find user's active festival
    // Query upcoming festivals for this state
    const regionFestivals = await Festival.find({ states: stateName });
    let activeFestival = "Ugadi"; // Default fallback
    
    if (profile.festivals && profile.festivals.length > 0) {
      // Pick first matching profile festival that is relevant for this state
      const matchingFest = profile.festivals.find(f => regionFestivals.some(rf => rf.festival === f));
      if (matchingFest) activeFestival = matchingFest;
    }

    // Call Python FastAPI service for AI Regional Recommendations
    let recommendedCategories = ["Kurta", "Saree", "Jewellery"]; // fallback
    try {
      const aiResponse = await axios.post(`${AI_SERVICE_URL}/recommend`, {
        region: regionTag,
        festival: activeFestival
      }, { timeout: 2000 });
      if (aiResponse.data && aiResponse.data.recommendedCategories) {
        recommendedCategories = aiResponse.data.recommendedCategories;
      }
    } catch (err) {
      console.warn("AI Service offline, falling back to local categories ranking.");
    }

    // Query products
    const allProducts = await Product.find({});
    
    // Section 1: Trending For Festival (Tagged with Festival & Region)
    const trendingFestival = allProducts.filter(p => 
      p.festivalTags.includes(activeFestival) && 
      p.regionTags.some(r => r.toLowerCase().includes(regionTag.toLowerCase()))
    ).slice(0, 8);

    // Section 2: Popular In State (Region matching products)
    const popularState = allProducts.filter(p => 
      p.regionTags.some(r => r.toLowerCase().includes(regionTag.toLowerCase()))
    ).slice(0, 8);

    // Section 3: Regional Brands (W, Biba, Libas, Anouk, Manyavar)
    const regionalBrands = allProducts.filter(p => 
      ["W", "Biba", "Libas", "Anouk", "Manyavar"].includes(p.brand)
    ).slice(0, 8);

    // Section 4: Festival Offers (Simulate discount pricing)
    const festivalOffers = allProducts.filter(p => 
      p.festivalTags.includes(activeFestival) || p.regionTags.some(r => r.toLowerCase().includes(regionTag.toLowerCase()))
    ).map(p => ({
      ...p,
      originalPrice: Math.floor(p.price * 1.4),
      discountText: "30% OFF"
    })).slice(0, 8);

    // Section 5: Family Matching Looks
    const familyMatching = allProducts.filter(p => 
      recommendedCategories.includes(p.category)
    ).slice(0, 8);

    return res.json({
      cultureMode: true,
      activeFestival,
      state: stateName,
      heroBanner: {
        festival: activeFestival,
        daysLeft: 8,
        title: `🌸 ${activeFestival}`,
        subtitle: "Celebrate in Style",
        cta: "Explore Collection"
      },
      feed: {
        trendingFestival,
        popularState,
        regionalBrands,
        festivalOffers,
        familyMatching
      }
    });

  } catch (err) {
    console.error("Homepage feed error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET PRODUCT DETAILS ROUTE
app.get('/api/product/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }
    res.json({ success: true, product });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4. CONFIDENCE TWIN ROUTE
app.get('/api/confidence/:productId', async (req, res) => {
  const { userId } = req.query;
  const { productId } = req.params;

  try {
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    let profile = await CultureProfile.findOne({ userId });
    if (!profile) {
      profile = {
        state: "Andhra Pradesh",
        festivals: ["Ugadi"],
        language: "English"
      };
    }

    let user = await User.findById(userId);
    if (!user) {
      user = { id: userId, name: "Guest User", age: 25, gender: "Male" };
    }

    // Call Python FastAPI service for AI calculations
    let score = 92; // default fallback
    let trueToSize = 95; // default fallback
    let festival = profile.festivals[0] || "Ugadi";

    try {
      const aiResponse = await axios.post(`${AI_SERVICE_URL}/confidence`, {
        userId,
        productId,
        state: profile.state,
        festivals: profile.festivals,
        language: profile.language,
        style: product.style || 'Minimal',
        category: product.category,
        brand: product.brand,
        price: product.price,
        color: product.color || 'Black',
        age: user.age || 26,
        gender: user.gender || 'Female'
      }, { timeout: 2000 });

      if (aiResponse.data) {
        score = aiResponse.data.confidence;
        trueToSize = aiResponse.data.trueToSize;
        festival = aiResponse.data.festival;
      }
    } catch (err) {
      console.warn("AI Service offline. Using fallback confidence algorithm.");
      // Fallback calculation algorithm
      // Give higher confidence scores if state/festival tags align
      let scoreBonus = 0;
      const statePrefix = profile.state.split(' ')[0];
      if (product.regionTags && product.regionTags.some(r => r.includes(statePrefix))) {
        scoreBonus += 10;
      }
      if (product.festivalTags && product.festivalTags.some(f => profile.festivals.includes(f))) {
        scoreBonus += 15;
      }
      score = Math.min(98, 70 + scoreBonus + Math.floor(Math.random() * 10));
      trueToSize = 90 + Math.floor(Math.random() * 8);
    }

    res.json({
      success: true,
      confidence: score,
      trueToSize,
      festival,
      explanation: `Based on shoppers in ${profile.state} with similar style (${product.style || 'Ethnic'}), budget (₹${product.price}), and buying preferences.`,
      tags: [
        "95% kept this product",
        `${trueToSize}% found true-to-size`,
        `Popular for ${festival}`,
        `Recommended for ${product.style || 'Minimal'} Style`
      ]
    });

  } catch (err) {
    console.error("Confidence score error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 5. PURCHASE SIMULATION / CHECKOUT ROUTE
app.post('/api/checkout', async (req, res) => {
  const { userId, productId, festival } = req.body;
  try {
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    const purchaseId = `p_${Date.now()}`;
    const purchase = await Purchase.create({
      _id: purchaseId,
      id: purchaseId,
      userId,
      productId,
      festival: festival || "",
      price: product.price,
      brand: product.brand,
      color: product.color || "Black",
      date: new Date().toISOString().split('T')[0]
    });

    res.json({ success: true, message: "Order Placed", purchase });
  } catch (err) {
    console.error("Checkout error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 6. MYNTRA WRAPPED ENDPOINT
app.get('/api/wrapped', async (req, res) => {
  const { userId } = req.query;
  try {
    const purchases = await Purchase.find({ userId });
    
    if (purchases.length === 0) {
      // Default placeholder statistics if new user has no purchases
      return res.json({
        success: true,
        wrappedData: {
          totalOrders: 0,
          totalSpent: 0,
          favoriteBrand: "None",
          favoriteFestival: "None",
          topColor: "None",
          styleAnalysis: {
            archetype: "Style Explorer",
            breakdown: [
              { name: "Minimal", value: 40 },
              { name: "Ethnic", value: 30 },
              { name: "Trendy", value: 30 }
            ]
          }
        }
      });
    }

    // Summing purchases
    const totalOrders = purchases.length;
    const totalSpent = purchases.reduce((sum, p) => sum + (p.price || 0), 0);

    // Brands frequency
    const brandCounts = {};
    const colorCounts = {};
    const festivalCounts = {};
    
    purchases.forEach(p => {
      if (p.brand) brandCounts[p.brand] = (brandCounts[p.brand] || 0) + 1;
      if (p.color) colorCounts[p.color] = (colorCounts[p.color] || 0) + 1;
      if (p.festival) festivalCounts[p.festival] = (festivalCounts[p.festival] || 0) + 1;
    });

    const getTopKey = obj => {
      let topKey = "None";
      let maxVal = -1;
      for (let k in obj) {
        if (obj[k] > maxVal) {
          maxVal = obj[k];
          topKey = k;
        }
      }
      return topKey;
    };

    const favoriteBrand = getTopKey(brandCounts);
    const favoriteFestival = getTopKey(festivalCounts) === "None" ? "Ugadi" : getTopKey(festivalCounts);
    const topColor = getTopKey(colorCounts);

    // Calculate style analysis based on purchased product style profiles
    // Let's count matching styles of purchased products
    const productIds = purchases.map(p => p.productId);
    const purchasedProducts = await Product.find({ _id: { $in: productIds } });
    
    const styleCounts = { Minimal: 0, Ethnic: 0, Trendy: 0, Traditional: 0 };
    purchasedProducts.forEach(p => {
      if (p.style) {
        styleCounts[p.style] = (styleCounts[p.style] || 0) + 1;
      }
    });

    // Provide weighted default if styles are empty
    const totalStyles = Object.values(styleCounts).reduce((a, b) => a + b, 0);
    let breakdown = [];
    let archetype = "Minimal Traditionalist";

    if (totalStyles > 0) {
      breakdown = Object.entries(styleCounts).map(([name, count]) => ({
        name,
        value: Math.round((count / totalStyles) * 100)
      })).filter(b => b.value > 0);
      
      // Determine archetype
      const topStyleEntry = Object.entries(styleCounts).sort((a, b) => b[1] - a[1])[0];
      if (topStyleEntry[0] === 'Minimal') archetype = "Minimal Traditionalist";
      else if (topStyleEntry[0] === 'Ethnic') archetype = "Cultural Connoisseur";
      else if (topStyleEntry[0] === 'Trendy') archetype = "Vanguard Trendsetter";
      else archetype = "Heritage Revivalist";
    } else {
      breakdown = [
        { name: "Minimal", value: 60 },
        { name: "Ethnic", value: 25 },
        { name: "Trendy", value: 15 }
      ];
      archetype = "Minimal Traditionalist";
    }

    res.json({
      success: true,
      wrappedData: {
        totalOrders,
        totalSpent,
        favoriteBrand,
        favoriteFestival,
        topColor,
        styleAnalysis: {
          archetype,
          breakdown
        }
      }
    });

  } catch (err) {
    console.error("Wrapped error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Run server
app.listen(PORT, () => {
  console.log(`Express Backend running on http://localhost:${PORT}`);
});
