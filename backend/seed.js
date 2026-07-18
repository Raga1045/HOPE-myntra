import { connectDB, User, CultureProfile, Festival, Product, Purchase } from './db.js';

const states = [
  "Andhra Pradesh",
  "Kerala",
  "Tamil Nadu",
  "Karnataka",
  "Telangana",
  "West Bengal",
  "Punjab",
  "Gujarat",
  "Maharashtra",
  "Odisha"
];

const festivals = [
  { festival: "Ugadi", date: "2026-03-18", states: ["Andhra Pradesh", "Telangana", "Karnataka"] },
  { festival: "Sankranti", date: "2026-01-14", states: ["Andhra Pradesh", "Telangana", "Karnataka", "Tamil Nadu"] },
  { festival: "Dasara", date: "2026-10-20", states: ["Andhra Pradesh", "Telangana", "Karnataka", "West Bengal"] },
  { festival: "Diwali", date: "2026-11-08", states: ["Andhra Pradesh", "Kerala", "Tamil Nadu", "Karnataka", "Telangana", "West Bengal", "Punjab", "Gujarat", "Maharashtra", "Odisha"] },
  { festival: "Christmas", date: "2026-12-25", states: ["Andhra Pradesh", "Kerala", "Tamil Nadu", "Karnataka", "Telangana", "West Bengal", "Punjab", "Gujarat", "Maharashtra", "Odisha"] },
  { festival: "Vishu", date: "2026-04-14", states: ["Kerala"] },
  { festival: "Onam", date: "2026-08-28", states: ["Kerala"] },
  { festival: "Pongal", date: "2026-01-14", states: ["Tamil Nadu"] },
  { festival: "Puthandu", date: "2026-04-14", states: ["Tamil Nadu"] },
  { festival: "Baisakhi", date: "2026-04-14", states: ["Punjab"] },
  { festival: "Lohri", date: "2026-01-13", states: ["Punjab"] },
  { festival: "Durga Puja", date: "2026-10-18", states: ["West Bengal", "Odisha"] },
  { festival: "Poila Baisakh", date: "2026-04-15", states: ["West Bengal"] },
  { festival: "Navratri", date: "2026-10-12", states: ["Gujarat", "Maharashtra", "Punjab"] },
  { festival: "Uttarayan", date: "2026-01-14", states: ["Gujarat"] },
  { festival: "Ganesh Chaturthi", date: "2026-09-04", states: ["Maharashtra"] },
  { festival: "Raja Parba", date: "2026-06-14", states: ["Odisha"] }
];

const categories = ["Kurta", "Saree", "Jewellery", "Sherwani", "Dhoti", "Dress", "Shirt", "Jeans"];
const brands = ["Roadster", "W", "Biba", "Libas", "Anouk", "Manyavar", "HRX", "Mast & Harbour"];
const colors = ["Black", "Pink", "Yellow", "Green", "Red", "White", "Blue", "Gold"];
const styles = ["Minimal", "Ethnic", "Trendy", "Traditional"];

const imagesMap = {
  "Kurta": [
    "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?q=80&w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1618244972963-dbee1a7edc95?q=80&w=600&auto=format&fit=crop"
  ],
  "Saree": [
    "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=600&auto=format&fit=crop"
  ],
  "Jewellery": [
    "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?q=80&w=600&auto=format&fit=crop"
  ],
  "Sherwani": [
    "https://images.unsplash.com/photo-1605518216938-7c31b7b14ad0?q=80&w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1597983073492-bc24058b37be?q=80&w=600&auto=format&fit=crop"
  ],
  "Dhoti": [
    "https://images.unsplash.com/photo-1560243563-062bfc001d68?q=80&w=600&auto=format&fit=crop"
  ],
  "Dress": [
    "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1566174053879-31528523f8ae?q=80&w=600&auto=format&fit=crop"
  ],
  "Shirt": [
    "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1581655353564-df123a1eb820?q=80&w=600&auto=format&fit=crop"
  ],
  "Jeans": [
    "https://images.unsplash.com/photo-1542272604-787c3835535d?q=80&w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=600&auto=format&fit=crop"
  ]
};

async function seed() {
  await connectDB();

  console.log('Clearing existing database entries...');
  await User.deleteMany({});
  await CultureProfile.deleteMany({});
  await Festival.deleteMany({});
  await Product.deleteMany({});
  await Purchase.deleteMany({});

  console.log('Seeding Festivals...');
  await Festival.insertMany(festivals);

  console.log('Seeding 50 Users...');
  const userDocs = [
    { _id: "1", id: "1", name: "Judge User", email: "judge@myntra.com" },
    { _id: "2", id: "2", name: "Aarav Sharma", email: "aarav@myntra.com" },
    { _id: "3", id: "3", name: "Diya Patel", email: "diya@myntra.com" },
    { _id: "4", id: "4", name: "Ananya Iyer", email: "ananya@myntra.com" },
    { _id: "5", id: "5", name: "Kabir Mehta", email: "kabir@myntra.com" },
    { _id: "6", id: "6", name: "Riya Sen", email: "riya@myntra.com" },
    { _id: "7", id: "7", name: "Arjun Nair", email: "arjun@myntra.com" }
  ];

  // Pre-seed profiles for the 7 demo users
  const profileDocs = [
    { _id: "prof_1", userId: "1", state: "Andhra Pradesh", festivals: ["Ugadi", "Diwali"], language: "English" },
    { _id: "prof_2", userId: "2", state: "Punjab", festivals: ["Lohri", "Diwali"], language: "Hindi" },
    { _id: "prof_3", userId: "3", state: "Gujarat", festivals: ["Navratri", "Uttarayan"], language: "English" },
    { _id: "prof_4", userId: "4", state: "Tamil Nadu", festivals: ["Pongal", "Diwali"], language: "English" },
    { _id: "prof_5", userId: "5", state: "Maharashtra", festivals: ["Ganesh Chaturthi", "Navratri"], language: "English" },
    { _id: "prof_6", userId: "6", state: "West Bengal", festivals: ["Durga Puja", "Poila Baisakh"], language: "English" },
    { _id: "prof_7", userId: "7", state: "Kerala", festivals: ["Onam", "Vishu"], language: "English" }
  ];

  for (let i = 8; i <= 50; i++) {
    userDocs.push({
      _id: String(i),
      id: String(i),
      name: `Demo User ${i}`,
      email: `user${i}@myntra.com`
    });
  }

  await User.insertMany(userDocs);
  await CultureProfile.insertMany(profileDocs);

  console.log('Seeding 100 Products...');
  const productDocs = [];
  
  for (let i = 1; i <= 100; i++) {
    const category = categories[i % categories.length];
    const brand = brands[i % brands.length];
    const color = colors[i % colors.length];
    const style = styles[i % styles.length];
    
    const catImages = imagesMap[category] || imagesMap["Shirt"];
    const image = catImages[i % catImages.length];

    const price = Math.floor(Math.random() * 3000) + 999; // 999 to 3999
    const rating = parseFloat((Math.random() * 1.5 + 3.5).toFixed(1));

    let festivalTags = [];
    let regionTags = [];

    if (category === "Kurta" || category === "Saree" || category === "Jewellery" || category === "Sherwani" || category === "Dhoti") {
      const idxMod = i % 10;
      if (idxMod === 0) {
        festivalTags = ["Ugadi"];
        regionTags = ["Andhra", "Karnataka", "Telangana"];
      } else if (idxMod === 1) {
        festivalTags = ["Onam"];
        regionTags = ["Kerala"];
      } else if (idxMod === 2) {
        festivalTags = ["Pongal"];
        regionTags = ["Tamil Nadu"];
      } else if (idxMod === 3) {
        festivalTags = ["Durga Puja"];
        regionTags = ["West Bengal", "Odisha"];
      } else if (idxMod === 4) {
        festivalTags = ["Baisakhi"];
        regionTags = ["Punjab"];
      } else if (idxMod === 5) {
        festivalTags = ["Navratri"];
        regionTags = ["Gujarat", "Maharashtra", "Punjab"];
      } else if (idxMod === 6) {
        festivalTags = ["Ganesh Chaturthi"];
        regionTags = ["Maharashtra"];
      } else if (idxMod === 7) {
        festivalTags = ["Raja Parba"];
        regionTags = ["Odisha"];
      } else if (idxMod === 8) {
        festivalTags = ["Uttarayan"];
        regionTags = ["Gujarat"];
      } else {
        festivalTags = ["Diwali", "Sankranti"];
        regionTags = ["Andhra", "Karnataka", "Tamil Nadu", "Telangana", "Gujarat", "Maharashtra", "Odisha"];
      }
    } else {
      if (i % 3 === 0) {
        festivalTags = ["Christmas"];
        regionTags = ["Andhra", "Kerala", "Tamil Nadu", "Karnataka", "Telangana", "West Bengal", "Punjab", "Gujarat", "Maharashtra", "Odisha"];
      } else {
        festivalTags = [];
        regionTags = [];
      }
    }

    productDocs.push({
      _id: String(i),
      id: String(i),
      name: `${brand} Traditional ${color} ${category}`,
      price,
      brand,
      rating,
      category,
      image,
      festivalTags,
      regionTags,
      color,
      style
    });
  }
  await Product.insertMany(productDocs);

  console.log('Seeding Purchase History...');
  const purchaseDocs = [];

  // Helper function to seed exact Year Wrapped metrics for a user
  const seedUserPurchases = (userId, totalOrders, targetSpent, favBrand, favFestival, favColor, styleBreakdown) => {
    let userSpent = 0;
    
    // Convert style breakdown object array to mapped targets
    // E.g., [{ name: 'Minimal', val: 60 }, { name: 'Ethnic', val: 25 }, { name: 'Trendy', val: 15 }]
    const styleTargets = {};
    styleBreakdown.forEach(item => {
      styleTargets[item.name] = Math.round(totalOrders * (item.value / 100));
    });

    const styleKeys = Object.keys(styleTargets);
    let styleAssigned = { Minimal: 0, Ethnic: 0, Trendy: 0, Traditional: 0 };

    for (let o = 1; o <= totalOrders; o++) {
      // 1. Assign Brand (e.g. Roadster - 35%)
      const matchBrand = o <= Math.round(totalOrders * 0.35);
      
      // 2. Assign Color (e.g. Black - 40%)
      const matchColor = o > 10 && o <= Math.round(totalOrders * 0.50);
      
      // 3. Assign Festival (e.g. Ugadi - 30%)
      const matchFestival = o > 20 && o <= Math.round(totalOrders * 0.50);

      // Find appropriate style key to satisfy breakdown
      let targetStyle = "Minimal";
      for (let key of styleKeys) {
        if (styleAssigned[key] < styleTargets[key]) {
          targetStyle = key;
          break;
        }
      }
      styleAssigned[targetStyle]++;

      // Query mock product matching brand/color/festival
      let prod = null;
      if (matchBrand) {
        prod = productDocs.find(p => p.brand === favBrand && p.style === targetStyle && (matchColor ? p.color === favColor : true));
      }
      if (!prod && matchColor) {
        prod = productDocs.find(p => p.color === favColor && p.style === targetStyle);
      }
      if (!prod && matchFestival) {
        prod = productDocs.find(p => p.festivalTags.includes(favFestival));
      }
      if (!prod) {
        prod = productDocs.find(p => p.style === targetStyle) || productDocs[o % productDocs.length];
      }

      let price = prod.price;
      if (o === totalOrders) {
        price = Math.max(999, targetSpent - userSpent);
      } else {
        // Average price hover
        const avgPrice = Math.floor(targetSpent / totalOrders);
        price = Math.floor(Math.random() * (avgPrice * 0.5)) + Math.floor(avgPrice * 0.7);
      }
      userSpent += price;

      const month = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
      const day = String(Math.floor(Math.random() * 28) + 1).padStart(2, '0');
      const purchaseDate = `2025-${month}-${day}`;

      purchaseDocs.push({
        _id: `p_u${userId}_${o}`,
        userId: String(userId),
        productId: prod.id,
        festival: matchFestival ? favFestival : "",
        price,
        brand: matchBrand ? favBrand : prod.brand,
        color: matchColor ? favColor : prod.color,
        date: purchaseDate
      });
    }
  };

  // Seeding the 7 specific users
  console.log('Seeding User 1 (Judge User: 80 orders, ₹54,000, favorite brand Roadster, favorite festival Ugadi, top color Black)');
  seedUserPurchases("1", 80, 54000, "Roadster", "Ugadi", "Black", [
    { name: "Minimal", value: 60 },
    { name: "Ethnic", value: 25 },
    { name: "Trendy", value: 15 }
  ]);

  console.log('Seeding User 2 (Aarav Sharma: 65 orders, ₹48,000, favorite brand Manyavar, favorite festival Lohri, top color Yellow)');
  seedUserPurchases("2", 65, 48000, "Manyavar", "Lohri", "Yellow", [
    { name: "Traditional", value: 50 },
    { name: "Ethnic", value: 30 },
    { name: "Minimal", value: 20 }
  ]);

  console.log('Seeding User 3 (Diya Patel: 72 orders, ₹60,000, favorite brand Anouk, favorite festival Navratri, top color Pink)');
  seedUserPurchases("3", 72, 60000, "Anouk", "Navratri", "Pink", [
    { name: "Ethnic", value: 65 },
    { name: "Trendy", value: 20 },
    { name: "Traditional", value: 15 }
  ]);

  console.log('Seeding User 4 (Ananya Iyer: 55 orders, ₹42,000, favorite brand Biba, favorite festival Pongal, top color Gold)');
  seedUserPurchases("4", 55, 42000, "Biba", "Pongal", "Gold", [
    { name: "Traditional", value: 60 },
    { name: "Minimal", value: 30 },
    { name: "Trendy", value: 10 }
  ]);

  console.log('Seeding User 5 (Kabir Mehta: 40 orders, ₹35,000, favorite brand HRX, favorite festival Ganesh Chaturthi, top color White)');
  seedUserPurchases("5", 40, 35000, "HRX", "Ganesh Chaturthi", "White", [
    { name: "Trendy", value: 50 },
    { name: "Minimal", value: 40 },
    { name: "Ethnic", value: 10 }
  ]);

  console.log('Seeding User 6 (Riya Sen: 90 orders, ₹75,000, favorite brand W, favorite festival Durga Puja, top color Red)');
  seedUserPurchases("6", 90, 75000, "W", "Durga Puja", "Red", [
    { name: "Traditional", value: 70 },
    { name: "Ethnic", value: 20 },
    { name: "Trendy", value: 10 }
  ]);

  console.log('Seeding User 7 (Arjun Nair: 48 orders, ₹38,000, favorite brand Mast & Harbour, favorite festival Onam, top color Green)');
  seedUserPurchases("7", 48, 38000, "Mast & Harbour", "Onam", "Green", [
    { name: "Minimal", value: 50 },
    { name: "Traditional", value: 30 },
    { name: "Ethnic", value: 20 }
  ]);

  // Seed random purchases for remaining users (8 to 50)
  for (let p = 1; p <= 150; p++) {
    const userId = String(Math.floor(Math.random() * 43) + 8); // Users 8 to 50
    const prodIdx = Math.floor(Math.random() * productDocs.length);
    const prod = productDocs[prodIdx];
    const month = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
    const day = String(Math.floor(Math.random() * 28) + 1).padStart(2, '0');
    const purchaseDate = `2025-${month}-${day}`;
    let purchaseFest = prod.festivalTags && prod.festivalTags.length > 0 ? prod.festivalTags[0] : "";

    purchaseDocs.push({
      _id: `p_rand_${p}`,
      userId,
      productId: prod.id,
      festival: purchaseFest,
      price: prod.price,
      brand: prod.brand,
      color: prod.color,
      date: purchaseDate
    });
  }

  await Purchase.insertMany(purchaseDocs);
  console.log('Seeding complete! Database is successfully populated.');
  process.exit(0);
}

seed().catch(err => {
  console.error("Seeding error:", err);
  process.exit(1);
});
