import { connectDB, User, CultureProfile, Festival, Product, Purchase } from './db.js';

const states = [
  "Andhra Pradesh",
  "Kerala",
  "Tamil Nadu",
  "Karnataka",
  "Telangana",
  "West Bengal",
  "Punjab"
];

const festivals = [
  { festival: "Ugadi", date: "2026-03-18", states: ["Andhra Pradesh", "Telangana", "Karnataka"] },
  { festival: "Sankranti", date: "2026-01-14", states: ["Andhra Pradesh", "Telangana", "Karnataka", "Tamil Nadu"] },
  { festival: "Dasara", date: "2026-10-20", states: ["Andhra Pradesh", "Telangana", "Karnataka", "West Bengal"] },
  { festival: "Diwali", date: "2026-11-08", states: ["Andhra Pradesh", "Kerala", "Tamil Nadu", "Karnataka", "Telangana", "West Bengal", "Punjab"] },
  { festival: "Christmas", date: "2026-12-25", states: ["Andhra Pradesh", "Kerala", "Tamil Nadu", "Karnataka", "Telangana", "West Bengal", "Punjab"] },
  { festival: "Vishu", date: "2026-04-14", states: ["Kerala"] },
  { festival: "Onam", date: "2026-08-28", states: ["Kerala"] },
  { festival: "Pongal", date: "2026-01-14", states: ["Tamil Nadu"] },
  { festival: "Puthandu", date: "2026-04-14", states: ["Tamil Nadu"] },
  { festival: "Baisakhi", date: "2026-04-14", states: ["Punjab"] },
  { festival: "Lohri", date: "2026-01-13", states: ["Punjab"] },
  { festival: "Durga Puja", date: "2026-10-18", states: ["West Bengal"] },
  { festival: "Poila Baisakh", date: "2026-04-15", states: ["West Bengal"] }
];

const categories = ["Kurta", "Saree", "Jewellery", "Sherwani", "Dhoti", "Dress", "Shirt", "Jeans"];
const brands = ["Roadster", "W", "Biba", "Libas", "Anouk", "Manyavar", "HRX", "Mast & Harbour"];
const colors = ["Black", "Pink", "Yellow", "Green", "Red", "White", "Blue", "Gold"];
const styles = ["Minimal", "Ethnic", "Trendy", "Traditional"];

// High-quality fashion image mappings from Unsplash
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

  console.log('Seeding 20 Festivals...');
  await Festival.insertMany(festivals);

  console.log('Seeding 50 Users...');
  const userDocs = [];
  // User 1 is our main judge/demo user
  userDocs.push({
    _id: "1",
    id: "1",
    name: "Judge User",
    email: "judge@myntra.com"
  });
  for (let i = 2; i <= 50; i++) {
    userDocs.push({
      _id: String(i),
      id: String(i),
      name: `Demo User ${i}`,
      email: `user${i}@myntra.com`
    });
  }
  await User.insertMany(userDocs);

  console.log('Seeding 100 Products...');
  const productDocs = [];
  // Ensure we have specifically tagged festival products for Ugadi, Pongal, Onam, Christmas, Durga Puja, Baisakhi
  // Ugadi (Andhra, Karnataka, Telangana)
  // Pongal (Tamil Nadu)
  // Onam (Kerala)
  // Durga Puja (West Bengal)
  // Baisakhi (Punjab)
  
  for (let i = 1; i <= 100; i++) {
    const category = categories[i % categories.length];
    const brand = brands[i % brands.length];
    const color = colors[i % colors.length];
    const style = styles[i % styles.length];
    
    // Choose images from map
    const catImages = imagesMap[category] || imagesMap["Shirt"];
    const image = catImages[i % catImages.length];

    const price = Math.floor(Math.random() * 4000) + 999; // 999 to 4999
    const rating = parseFloat((Math.random() * 1.5 + 3.5).toFixed(1)); // 3.5 to 5.0

    // Assign festival and regional tags based on category & index
    let festivalTags = [];
    let regionTags = [];

    if (category === "Kurta" || category === "Saree" || category === "Jewellery" || category === "Sherwani" || category === "Dhoti") {
      // Ethnic wears get regional/festival assignments
      if (i % 6 === 0) {
        festivalTags = ["Ugadi"];
        regionTags = ["Andhra", "Karnataka", "Telangana"];
      } else if (i % 6 === 1) {
        festivalTags = ["Onam"];
        regionTags = ["Kerala"];
      } else if (i % 6 === 2) {
        festivalTags = ["Pongal"];
        regionTags = ["Tamil Nadu"];
      } else if (i % 6 === 3) {
        festivalTags = ["Durga Puja"];
        regionTags = ["West Bengal"];
      } else if (i % 6 === 4) {
        festivalTags = ["Baisakhi"];
        regionTags = ["Punjab"];
      } else {
        // Multi-festive
        festivalTags = ["Diwali", "Sankranti"];
        regionTags = ["Andhra", "Karnataka", "Tamil Nadu", "Telangana"];
      }
    } else {
      // Western/casual wears can be Christmas or general
      if (i % 4 === 0) {
        festivalTags = ["Christmas"];
        regionTags = ["Andhra", "Kerala", "Tamil Nadu", "Karnataka", "Telangana", "West Bengal", "Punjab"];
      } else {
        festivalTags = [];
        regionTags = [];
      }
    }

    // Explicitly make sure there is a Kurta and Saree specifically for Ugadi & Andhra
    if (i === 10) {
      festivalTags = ["Ugadi"];
      regionTags = ["Andhra"];
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

  console.log('Seeding 500 Purchases...');
  const purchaseDocs = [];
  
  // Seed random purchases for users 2 to 50
  for (let p = 1; p <= 420; p++) {
    const userId = String(Math.floor(Math.random() * 49) + 2); // Users 2 to 50
    const prodIdx = Math.floor(Math.random() * productDocs.length);
    const prod = productDocs[prodIdx];
    
    // Choose a date in the past year
    const month = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
    const day = String(Math.floor(Math.random() * 28) + 1).padStart(2, '0');
    const purchaseDate = `2025-${month}-${day}`;

    // Random festival association
    let purchaseFest = "";
    if (prod.festivalTags && prod.festivalTags.length > 0 && Math.random() > 0.4) {
      purchaseFest = prod.festivalTags[0];
    }

    purchaseDocs.push({
      _id: `p_${p}`,
      userId,
      productId: prod.id,
      festival: purchaseFest,
      price: prod.price,
      brand: prod.brand,
      color: prod.color,
      date: purchaseDate
    });
  }

  // Seed specifically for User 1 (80 orders, ₹54,000 spent, favorite brand "Roadster", favorite festival "Ugadi", top color "Black")
  // Let's generate exactly 80 purchases totaling around 54,000 for User 1
  let totalSpent = 0;
  const targetSpent = 54000;
  const targetOrders = 80;

  for (let o = 1; o <= targetOrders; o++) {
    // 30% Roadster purchases, 40% Black color purchases, 30% festival Ugadi
    const isRoadster = o <= 25; // 25 Roadster
    const isBlackColor = o > 15 && o <= 45; // 30 Black
    const isUgadiFestival = o > 40 && o <= 65; // 25 Ugadi

    let prod = null;
    if (isRoadster) {
      prod = productDocs.find(p => p.brand === "Roadster" && (isBlackColor ? p.color === "Black" : true));
    }
    if (!prod && isBlackColor) {
      prod = productDocs.find(p => p.color === "Black");
    }
    if (!prod && isUgadiFestival) {
      prod = productDocs.find(p => p.festivalTags.includes("Ugadi"));
    }
    if (!prod) {
      prod = productDocs[o % productDocs.length];
    }

    // Adjust prices to sum up close to targetSpent
    let price = prod.price;
    if (o === targetOrders) {
      price = Math.max(999, targetSpent - totalSpent);
    } else {
      // Scale price slightly to hover around average ~675 per item
      price = Math.floor(Math.random() * 400) + 475;
    }
    totalSpent += price;

    const month = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
    const day = String(Math.floor(Math.random() * 28) + 1).padStart(2, '0');
    const purchaseDate = `2025-${month}-${day}`;

    purchaseDocs.push({
      _id: `p_user1_${o}`,
      userId: "1",
      productId: prod.id,
      festival: isUgadiFestival ? "Ugadi" : "",
      price,
      brand: isRoadster ? "Roadster" : prod.brand,
      color: isBlackColor ? "Black" : prod.color,
      date: purchaseDate
    });
  }
  
  await Purchase.insertMany(purchaseDocs);

  console.log(`Seeding complete! Successfully seeded User 1 with ${targetOrders} orders totaling ₹${totalSpent} spent.`);
  process.exit(0);
}

seed().catch(err => {
  console.error("Seeding error:", err);
  process.exit(1);
});
