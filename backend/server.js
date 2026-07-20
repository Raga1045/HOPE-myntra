import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";
import {
  connectDB,
  User,
  CultureProfile,
  Festival,
  Product,
  Purchase,
} from "./db.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://localhost:8000";

app.use(cors());
app.use(express.json());

// Initialize Database Connection
connectDB();

// 1. LOGIN ROUTE
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    let user = await User.findOne({ email });
    if (!user) {
      // Create user if not exists
      const newUserId = String(Date.now());
      user = await User.create({
        _id: newUserId,
        id: newUserId,
        name: email.split("@")[0],
        email: email,
      });
    }
    res.json({ success: true, user });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2. PROFILE SETUP ROUTE
app.post("/api/profile", async (req, res) => {
  const { userId, state, festivals, language } = req.body;
  try {
    const updated = await CultureProfile.updateOne(
      { userId },
      { userId, state, festivals, language },
      { upsert: true },
    );
    res.json({
      success: true,
      profile: { userId, state, festivals, language },
    });
  } catch (err) {
    console.error("Profile error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET PROFILE ROUTE
app.get("/api/profile/:userId", async (req, res) => {
  try {
    const profile = await CultureProfile.findOne({ userId: req.params.userId });
    res.json({ success: true, profile });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET ALL STATES & FESTIVALS
app.get("/api/festivals", async (req, res) => {
  try {
    const festivals = await Festival.find({});

    const result = {};

    festivals.forEach((item) => {
      if (!result[item.state]) {
        result[item.state] = [];
      }

      if (!result[item.state].includes(item.festival)) {
        result[item.state].push(item.festival);
      }
    });

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});
// Dynamic Confidence Card generator helper
function generateConfidenceData(product, profile, user) {
  const activeFestival = profile && profile.festivals && profile.festivals[0] ? profile.festivals[0] : "Diwali";
  const stateName = profile && profile.state ? profile.state : "Andhra Pradesh";
  const regionTag = stateName.split(" ")[0];
  
  // 1. Festival Match (30% weight)
  const hasFestivalTag = product.festivalTags && product.festivalTags.some(t => t.toLowerCase() === activeFestival.toLowerCase());
  const isFestiveCat = ["Kurta", "Saree", "Jewellery", "Sherwani", "Dhoti"].includes(product.category);
  const festivalMatch = hasFestivalTag ? (95 + Math.floor(Math.random() * 6)) : (isFestiveCat ? (85 + Math.floor(Math.random() * 9)) : (70 + Math.floor(Math.random() * 15)));
  
  // 2. Regional Match (20% weight)
  const hasRegionTag = product.regionTags && product.regionTags.some(r => r.toLowerCase().includes(regionTag.toLowerCase()));
  const regionalMatch = hasRegionTag ? (94 + Math.floor(Math.random() * 6)) : (72 + Math.floor(Math.random() * 18));
  
  // 3. Weather (15% weight)
  const isLightFabric = ["Kurta", "Saree", "Dhoti", "Shirt"].includes(product.category);
  const weatherScore = isLightFabric ? (92 + Math.floor(Math.random() * 8)) : (78 + Math.floor(Math.random() * 12));
  
  // 4. Comfort (15% weight)
  const comfortScoreVal = parseFloat((8.8 + Math.random() * 1.0).toFixed(1));
  const comfortScore = Math.round(comfortScoreVal * 10); // convert to percent for weight
  
  // 5. Style Match (10% weight)
  const isStyleMatch = product.style && (product.style.toLowerCase() === "ethnic" || product.style.toLowerCase() === "traditional");
  const styleScore = isStyleMatch ? (90 + Math.floor(Math.random() * 10)) : (75 + Math.floor(Math.random() * 15));
  
  // 6. Popularity (10% weight)
  const popularityScore = 85 + Math.floor(Math.random() * 14);
  
  // Weighted calculation
  let score = (
    festivalMatch * 0.30 +
    regionalMatch * 0.20 +
    weatherScore * 0.15 +
    comfortScore * 0.15 +
    styleScore * 0.10 +
    popularityScore * 0.10
  );
  
  const confidenceScore = Math.max(80, Math.min(100, Math.round(score)));
  
  // Match Label
  const matchLabel = confidenceScore >= 92 ? "Perfect Match" : "Highly Recommended";

  // City Map
  const stateCityMap = {
    "Andhra Pradesh": "Hyderabad",
    "Telangana": "Hyderabad",
    "Kerala": "Kochi",
    "Tamil Nadu": "Chennai",
    "Karnataka": "Bengaluru",
    "West Bengal": "Kolkata",
    "Punjab": "Chandigarh",
    "Gujarat": "Ahmedabad",
    "Maharashtra": "Mumbai",
    "Assam": "Guwahati",
    "Bihar": "Patna",
    "Goa": "Panaji",
    "Haryana": "Gurugram",
    "Himachal Pradesh": "Shimla",
    "Jharkhand": "Ranchi",
    "Madhya Pradesh": "Bhopal",
    "Odisha": "Bhubaneswar",
    "Rajasthan": "Jaipur",
    "Sikkim": "Gangtok",
    "Uttar Pradesh": "Lucknow",
    "Uttarakhand": "Dehradun",
    "Delhi (NCT)": "New Delhi"
  };
  const cityName = stateCityMap[stateName] || "Hyderabad";

  // Demographics
  let demographics = "Shoppers with your profile";
  if (product.category === "Saree" || product.category === "Jewellery" || product.category === "Dress") {
    demographics = "Women (20–25)";
  } else if (product.category === "Sherwani" || product.category === "Dhoti" || product.category === "Shirt") {
    demographics = "Men (25–30)";
  }

  // checklist
  const whyPickedChecklist = [
    { label: `Perfect for ${activeFestival}`, iconType: 'Sparkles' },
    { label: `Trending in ${stateName}`, iconType: 'MapPin' },
    { label: `Matches your preferred ${product.style || 'ethnic'} style`, iconType: 'Palette' },
    { label: `Ideal for current weather`, iconType: 'Sun' },
    { label: `Great for family celebrations`, iconType: 'Heart' }
  ];

  // sales estimates
  const salesCount = 80 + Math.floor((12000 / product.price) * (product.rating || 4.2)) + Math.floor(Math.random() * 20);
  const wishlistsCount = 220 + Math.floor(salesCount * 3.5) + Math.floor(Math.random() * 50);

  const peopleLikeYou = [
    { label: `${demographics} loved this`, iconType: 'User' },
    { label: `Trending in ${cityName}`, iconType: 'MapPin' },
    { label: `Bought ${salesCount} times this month`, iconType: 'ShoppingBag' },
    { label: `Rated ${product.rating || 4.5} by similar shoppers`, iconType: 'Star' },
    { label: `Added to ${wishlistsCount} wishlists`, iconType: 'Heart' },
    { label: `Frequently purchased this week`, iconType: 'Flame' }
  ];

  const matchBreakdown = [
    { name: 'Festival Match', value: festivalMatch, color: 'saffron' },
    { name: 'Regional Match', value: regionalMatch, color: 'purple' },
    { name: 'Weather', value: weatherScore, color: 'blue' },
    { name: 'Style Match', value: styleScore, color: 'pink' },
    { name: 'Comfort', value: comfortScore, color: 'green' },
    { name: 'Popularity', value: popularityScore, color: 'purple' }
  ];

  // Cultural Authenticity
  let culturalTag = "Traditional Ethnic Style";
  const rLower = regionTag.toLowerCase();
  if (rLower.includes("andhra") || rLower.includes("telangana") || rLower.includes("karnataka")) {
    culturalTag = `Traditional ${regionTag} Style`;
  } else if (rLower.includes("kerala")) {
    culturalTag = "Kerala Kasavu Inspired";
  } else if (rLower.includes("bengal") || rLower.includes("west")) {
    culturalTag = "Bengali Heritage Motif";
  } else if (rLower.includes("punjab")) {
    culturalTag = "Phulkari Punjabi Accent";
  } else if (rLower.includes("gujarat")) {
    culturalTag = "Gujarati Bandhani Heritage";
  } else if (rLower.includes("maharashtra")) {
    culturalTag = "Maharashtrian Paithani Style";
  }

  const styleInsights = [
    culturalTag,
    "Handloom Certified",
    product.category === "Jewellery" ? "Handcrafted Detailing" : "Breathable Cotton"
  ];

  let stylingTips = ["Oxidized Jhumkas", "White Kolhapuris", "Silver Bangles", "Potli Bag"];
  if (product.category === "Sherwani" || product.category === "Dhoti") {
    stylingTips = ["Leather Mojaris", "Metallic Watch", "Silk Safa", "Designer Stole"];
  } else if (product.category === "Shirt" || product.category === "Jeans") {
    stylingTips = ["Casual Sneakers", "Smart Watch", "Brown Leather Belt", "Sunglasses"];
  } else if (product.category === "Jewellery") {
    stylingTips = ["Matching Silk Saree", "Pastel Kurtas", "Embroidered Potli", "Gilded Heels"];
  }

  const trustSignals = [
    "AI Verified",
    "Community Favourite",
    "Regionally Relevant",
    "Festival Approved"
  ];
  
  // Explanation text
  const explanation = `Our AI selected this outfit because it closely matches your preferred ${product.style || "Traditional"} style, your selected festival (${activeFestival}), and is one of the most popular choices among ${demographics.toLowerCase()} in ${stateName}. The breathable fabric also makes it ideal for today's weather.`;

  return {
    festivalMatch,
    regionalMatch,
    weatherScore,
    comfortScore: comfortScoreVal,
    styleScore,
    confidenceScore,
    culturalTag,
    explanation,
    festivalName: activeFestival,
    stateName,
    matchLabel,
    whyPickedChecklist,
    peopleLikeYou,
    matchBreakdown,
    styleInsights,
    stylingTips,
    trustSignals
  };
}

// 3. HOMEPAGE FEED ROUTE
app.get("/api/homepage", async (req, res) => {
  const { userId, cultureMode } = req.query;
  const isCultureMode = cultureMode !== "false";

  try {
    if (!isCultureMode) {
      // NORMAL MODE: Generic Trending, Recommended, and Top Brands
      const allProducts = await Product.find({});

      // Shuffle products helper
      const shuffle = (arr) => arr.sort(() => 0.5 - Math.random());

      const trendingRaw = shuffle([...allProducts]).slice(0, 8);
      const recommendedRaw = shuffle([...allProducts]).slice(0, 8);
      const topBrandsRaw = allProducts
        .filter((p) => ["Roadster", "HRX", "Mast & Harbour"].includes(p.brand))
        .slice(0, 8);

      // Fetch user profile if any for normal mode confidence calculations
      let profile = await CultureProfile.findOne({ userId });
      if (!profile) {
        profile = {
          state: "Delhi (NCT)",
          festivals: ["Diwali"],
          language: "English",
        };
      }

      const trending = trendingRaw.map(p => {
        const pObj = p.toObject ? p.toObject() : p;
        return { ...pObj, confidence: generateConfidenceData(pObj, profile, null) };
      });
      const recommended = recommendedRaw.map(p => {
        const pObj = p.toObject ? p.toObject() : p;
        return { ...pObj, confidence: generateConfidenceData(pObj, profile, null) };
      });
      const topBrands = topBrandsRaw.map(p => {
        const pObj = p.toObject ? p.toObject() : p;
        return { ...pObj, confidence: generateConfidenceData(pObj, profile, null) };
      });

      return res.json({
        cultureMode: false,
        feed: {
          trending,
          recommended,
          topBrands,
        },
      });
    }

    // CULTURE MODE: Entire Homepage changes based on regional preferences
    // Find user's culture profile, default to Andhra/Ugadi if not set
    let profile = await CultureProfile.findOne({ userId });
    if (!profile) {
      profile = {
        state: "Andhra Pradesh",
        festivals: ["Ugadi", "Diwali"],
        language: "English",
      };
    }

    const stateName = profile.state;
    const regionTag = stateName.split(" ")[0];

    const regionFestivals = await Festival.find({
      state: stateName,
    });
    if (regionFestivals.length === 0) {
    return res.json({
        cultureMode: true,
        activeFestival: null,
        heroBanner: null,
        clothingRecommendations: {},
        feed: {
            trendingFestival: [],
            popularState: [],
            regionalBrands: [],
            festivalOffers: [],
            familyMatching: [],
        },
    });
}
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Calculate dynamic status and daysLeft for all state festivals
    const processedFestivals = regionFestivals.map((f) => {
      const start = new Date(f.startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(f.endDate);
      end.setHours(0, 0, 0, 0);

      let status = "Upcoming";
      let daysLeft = 0;
      let showCountdown = false;

      if (today >= start && today <= end) {
        status = "Today";
        daysLeft = 0;
        showCountdown = true;
      } else if (today > end) {
        status = "Completed";
        daysLeft = 0;
        showCountdown = false;
      } else {
        status = "Upcoming";
        const diffTime = start - today;
        daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        showCountdown = daysLeft <= 100;
      }

      return {
        doc: f,
        status,
        daysLeft,
        showCountdown,
      };
    });

    // 1. Prioritize ongoing (Today) festivals, sorted by priority descending
    let activeItem = processedFestivals
      .filter((f) => f.status === "Today")
      .sort((a, b) => b.doc.priority - a.doc.priority)[0];

    // 2. Fall back to nearest upcoming, sorted by startDate ascending
    if (!activeItem) {
      activeItem = processedFestivals
        .filter((f) => f.status === "Upcoming")
        .sort((a, b) => {
          const diff = new Date(a.doc.startDate) - new Date(b.doc.startDate);
          if (diff !== 0) return diff;
          return b.doc.priority - a.doc.priority;
        })[0];
    }

    // 3. Fall back to recently completed, sorted by endDate descending
    if (!activeItem) {
      activeItem = processedFestivals
        .filter((f) => f.status === "Completed")
        .sort((a, b) => new Date(b.doc.endDate) - new Date(a.doc.endDate))[0];
    }

    const activeFestDoc = activeItem ? activeItem.doc : regionFestivals[0];
    const activeFestival = activeFestDoc ? activeFestDoc.festival : "Diwali";
    const festivalStatus = activeItem ? activeItem.status : "Completed";
    const daysLeft = activeItem ? activeItem.daysLeft : 0;
    const showCountdown = activeItem ? activeItem.showCountdown : false;

    // Call Python FastAPI service for AI Regional Recommendations
    let recommendedCategories = ["Kurta", "Saree", "Jewellery"]; // fallback
    try {
      const aiResponse = await axios.post(
        `${AI_SERVICE_URL}/recommend`,
        {
          region: regionTag,
          festival: activeFestival,
        },
        { timeout: 2000 },
      );
      if (aiResponse.data && aiResponse.data.recommendedCategories) {
        recommendedCategories = aiResponse.data.recommendedCategories;
      }
    } catch (err) {
      console.warn(
        "AI Service offline, falling back to local categories ranking.",
      );
    }

    // Query products
    const allProducts = await Product.find({});

    // Section 1: Trending For Festival (Tagged with Festival & Region)
    let trendingFestival = allProducts.filter(
      (p) =>
        p.festivalTags.some(tag => tag.toLowerCase() === activeFestival.toLowerCase()) &&
        p.regionTags.some((r) => r.toLowerCase().includes(regionTag.toLowerCase()))
    );

    if (trendingFestival.length === 0) {
      trendingFestival = allProducts.filter(
        (p) => p.festivalTags.some(tag => tag.toLowerCase() === activeFestival.toLowerCase())
      );
    }
    if (trendingFestival.length === 0) {
      trendingFestival = allProducts.filter(
        (p) => p.regionTags.some((r) => r.toLowerCase().includes(regionTag.toLowerCase()))
      );
    }
    trendingFestival = trendingFestival.slice(0, 8);

    // Section 2: Popular In State (Region matching products)
    const popularState = allProducts
      .filter((p) =>
        p.regionTags.some((r) =>
          r.toLowerCase().includes(regionTag.toLowerCase()),
        ),
      )
      .slice(0, 8);

    // Section 3: Regional Brands (W, Biba, Libas, Anouk, Manyavar)
    const regionalBrands = allProducts
      .filter((p) =>
        ["W", "Biba", "Libas", "Anouk", "Manyavar"].includes(p.brand),
      )
      .slice(0, 8);

    // Section 4: Festival Offers (Simulate discount pricing)
    let festivalOffersRaw = allProducts.filter(
      (p) =>
        p.festivalTags.some(tag => tag.toLowerCase() === activeFestival.toLowerCase()) &&
        p.regionTags.some((r) => r.toLowerCase().includes(regionTag.toLowerCase()))
    );

    if (festivalOffersRaw.length === 0) {
      festivalOffersRaw = allProducts.filter(
        (p) =>
          p.festivalTags.some(tag => tag.toLowerCase() === activeFestival.toLowerCase()) ||
          p.regionTags.some((r) => r.toLowerCase().includes(regionTag.toLowerCase()))
      );
    }

    const festivalOffers = festivalOffersRaw.map((p) => {
      const pObj = p.toObject ? p.toObject() : p;
      return {
        ...pObj,
        originalPrice: Math.round(p.price * 1.4),
        discountText: "30% OFF",
      };
    }).slice(0, 8);

    // Section 5: Family Matching Looks
    const familyMatching = allProducts
      .filter((p) => recommendedCategories.includes(p.category))
      .slice(0, 8);

    const heroBanner = {
      festival: activeFestDoc.festival,
      daysLeft: daysLeft ?? 0,
      title: `🌸 ${activeFestDoc.festival}`,
      subtitle: `Celebrate ${activeFestDoc.category} in Style`,
      cta: "Explore Collection",
      language: activeFestDoc.primaryLanguage,
      showCountdown,
      artwork: activeFestDoc.artwork,
      themeGradient: activeFestDoc.themeGradient,
      offerText: activeFestDoc.offerText,
      greeting: activeFestDoc.greeting,
      countdownText: festivalStatus === "Today"
        ? `Celebrate ${activeFestDoc.festival} Today`
        : festivalStatus === "Upcoming"
        ? `Only ${daysLeft} Days Left for ${activeFestDoc.festival}`
        : `${activeFestDoc.festival} Celebrations Completed`,
      status: festivalStatus
    };

    return res.json({
      cultureMode: true,
      activeFestival,
      state: stateName,
      heroBanner,

      clothingRecommendations: {
        women: activeFestDoc?.womenClothing || [],
        men: activeFestDoc?.menClothing || [],
        accessories: activeFestDoc?.accessories || [],
        footwear: activeFestDoc?.footwear || [],
      },

      feed: {
        trendingFestival: trendingFestival.map(p => {
          const pObj = p.toObject ? p.toObject() : p;
          return { ...pObj, confidence: generateConfidenceData(pObj, profile, null) };
        }),
        popularState: popularState.map(p => {
          const pObj = p.toObject ? p.toObject() : p;
          return { ...pObj, confidence: generateConfidenceData(pObj, profile, null) };
        }),
        regionalBrands: regionalBrands.map(p => {
          const pObj = p.toObject ? p.toObject() : p;
          return { ...pObj, confidence: generateConfidenceData(pObj, profile, null) };
        }),
        festivalOffers: festivalOffers.map(p => {
          const pObj = p.toObject ? p.toObject() : p;
          return { ...pObj, confidence: generateConfidenceData(pObj, profile, null) };
        }),
        familyMatching: familyMatching.map(p => {
          const pObj = p.toObject ? p.toObject() : p;
          return { ...pObj, confidence: generateConfidenceData(pObj, profile, null) };
        }),
      },
    });
  } catch (err) {
    console.error("Homepage feed error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET PRODUCT DETAILS ROUTE
app.get("/api/product/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.json({
      success: true,
      product,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

// 4. CONFIDENCE TWIN ROUTE
app.get("/api/confidence/:productId", async (req, res) => {
  const { userId } = req.query;
  const { productId } = req.params;

  try {
    const product = await Product.findById(productId);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    let profile = await CultureProfile.findOne({ userId });
    if (!profile) {
      profile = {
        state: "Andhra Pradesh",
        festivals: ["Ugadi"],
        language: "English",
      };
    }

    let user = await User.findById(userId);
    if (!user) {
      user = { id: userId, name: "Guest User", age: 25, gender: "Male" };
    }

    // Call Python FastAPI service for AI calculations
    let score = 92; // default fallback
    let trueToSize = 95; // default fallback
    let festival = "Diwali";
    const activeFestival = await Festival.findOne({
      state: profile.state,
    }).sort({ startDate: 1 });

    festival = activeFestival?.festival || "Diwali";

    try {
      const aiResponse = await axios.post(
        `${AI_SERVICE_URL}/confidence`,
        {
          userId,
          productId,
          state: profile.state,
          festivals: profile.festivals,
          language: profile.language,
          style: product.style || "Minimal",
          category: product.category,
          brand: product.brand,
          price: product.price,
          color: product.color || "Black",
          age: user.age || 26,
          gender: user.gender || "Female",
        },
        { timeout: 2000 },
      );

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
      const statePrefix = profile.state.split(" ")[0];
      if (
        product.regionTags &&
        product.regionTags.some((r) => r.includes(statePrefix))
      ) {
        scoreBonus += 10;
      }
      if (
        product.festivalTags &&
        product.festivalTags.some((f) => profile.festivals.includes(f))
      ) {
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
      explanation: `Based on shoppers in ${profile.state} with similar style (${product.style || "Ethnic"}), budget (₹${product.price}), and buying preferences.`,
      tags: [
        "95% kept this product",
        `${trueToSize}% found true-to-size`,
        `Popular for ${festival}`,
        `Recommended for ${product.style || "Minimal"} Style`,
      ],
    });
  } catch (err) {
    console.error("Confidence score error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 5. PURCHASE SIMULATION / CHECKOUT ROUTE
app.post("/api/checkout", async (req, res) => {
  const { userId, productId, festival } = req.body;
  try {
    const product = await Product.findById(productId);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
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
      date: new Date().toISOString().split("T")[0],
    });

    res.json({ success: true, message: "Order Placed", purchase });
  } catch (err) {
    console.error("Checkout error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 6. MYNTRA WRAPPED ENDPOINT
app.get("/api/wrapped", async (req, res) => {
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
              { name: "Trendy", value: 30 },
            ],
          },
        },
      });
    }

    // Summing purchases
    const totalOrders = purchases.length;
    const totalSpent = purchases.reduce((sum, p) => sum + (p.price || 0), 0);

    // Brands frequency
    const brandCounts = {};
    const colorCounts = {};
    const festivalCounts = {};

    purchases.forEach((p) => {
      if (p.brand) brandCounts[p.brand] = (brandCounts[p.brand] || 0) + 1;
      if (p.color) colorCounts[p.color] = (colorCounts[p.color] || 0) + 1;
      if (p.festival)
        festivalCounts[p.festival] = (festivalCounts[p.festival] || 0) + 1;
    });

    const getTopKey = (obj) => {
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
    const favoriteFestival =
      getTopKey(festivalCounts) === "None"
        ? "Ugadi"
        : getTopKey(festivalCounts);
    const topColor = getTopKey(colorCounts);

    // Calculate style analysis based on purchased product style profiles
    // Let's count matching styles of purchased products
    const productIds = purchases.map((p) => p.productId);
    const purchasedProducts = await Product.find({ _id: { $in: productIds } });

    const styleCounts = { Minimal: 0, Ethnic: 0, Trendy: 0, Traditional: 0 };
    purchasedProducts.forEach((p) => {
      if (p.style) {
        styleCounts[p.style] = (styleCounts[p.style] || 0) + 1;
      }
    });

    // Provide weighted default if styles are empty
    const totalStyles = Object.values(styleCounts).reduce((a, b) => a + b, 0);
    let breakdown = [];
    let archetype = "Minimal Traditionalist";

    if (totalStyles > 0) {
      breakdown = Object.entries(styleCounts)
        .map(([name, count]) => ({
          name,
          value: Math.round((count / totalStyles) * 100),
        }))
        .filter((b) => b.value > 0);

      // Determine archetype
      const topStyleEntry = Object.entries(styleCounts).sort(
        (a, b) => b[1] - a[1],
      )[0];
      if (topStyleEntry[0] === "Minimal") archetype = "Minimal Traditionalist";
      else if (topStyleEntry[0] === "Ethnic")
        archetype = "Cultural Connoisseur";
      else if (topStyleEntry[0] === "Trendy")
        archetype = "Vanguard Trendsetter";
      else archetype = "Heritage Revivalist";
    } else {
      breakdown = [
        { name: "Minimal", value: 60 },
        { name: "Ethnic", value: 25 },
        { name: "Trendy", value: 15 },
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
          breakdown,
        },
      },
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
