import fs from 'fs';
import path from 'path';
import { connectDB, User, CultureProfile, Festival, Product, Purchase, ReturnOutcome } from './db.js';

const festivals = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'data', 'festivals.json'), 'utf8'));

const categories = ["Kurta", "Saree", "Jewellery", "Sherwani", "Dhoti", "Dress", "Shirt", "Jeans"];
const brands = ["Roadster", "W", "Biba", "Libas", "Anouk", "Manyavar", "HRX", "Mast & Harbour"];
const colors = ["Black", "Pink", "Yellow", "Green", "Red", "White", "Blue", "Gold"];
const styles = ["Minimal", "Ethnic", "Trendy", "Traditional"];
const states = [
  "Andhra Pradesh", "Kerala", "Tamil Nadu", "Karnataka", "Telangana",
  "West Bengal", "Punjab", "Gujarat", "Maharashtra", "Odisha"
];

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
  await ReturnOutcome.deleteMany({});

  console.log('Seeding Festivals...');
  await Festival.insertMany(festivals);

  console.log('Seeding 150 Users & hidden Fit Profiles...');
  const userDocs = [];
  const profileDocs = [];

  const namesMale = ["Judge User", "Aarav Sharma", "Kabir Mehta", "Arjun Nair", "Ishaan Dubey", "Vihaan Rao", "Reyansh Goel", "Sai Krishna", "Kartik Reddy", "Aditya Joshi"];
  const namesFemale = ["Diya Patel", "Ananya Iyer", "Riya Sen", "Prisha Nair", "Myra Saxena", "Kavya Murthy", "Shruti Hegde", "Zara Sheikh", "Meera Pillai", "Anya Sen"];

  for (let i = 1; i <= 150; i++) {
    let name = '';
    let gender = '';
    if (i === 1) {
      name = "Judge User";
      gender = "Male";
    } else if (i === 2) {
      name = "Aarav Sharma";
      gender = "Male";
    } else if (i === 3) {
      name = "Diya Patel";
      gender = "Female";
    } else if (i === 4) {
      name = "Ananya Iyer";
      gender = "Female";
    } else if (i === 5) {
      name = "Kabir Mehta";
      gender = "Male";
    } else if (i === 6) {
      name = "Riya Sen";
      gender = "Female";
    } else if (i === 7) {
      name = "Arjun Nair";
      gender = "Male";
    } else {
      gender = i % 2 === 0 ? "Female" : "Male";
      const namesList = gender === "Male" ? namesMale : namesFemale;
      const baseName = namesList[i % namesList.length];
      name = `${baseName} ${i}`;
    }

    userDocs.push({
      _id: String(i),
      id: String(i),
      name,
      email: `user${i}@myntra.com`
    });

    // Create fit profile parameters
    let heightBand = '';
    let weightBand = '';
    let bodyType = '';
    let preferredFit = '';

    if (i === 1) {
      heightBand = "170-180 cm";
      weightBand = "70-80 kg";
      bodyType = "Average";
      preferredFit = "Regular";
    } else if (i === 2) {
      heightBand = "170-180 cm";
      weightBand = "70-80 kg";
      bodyType = "Average";
      preferredFit = "Regular";
    } else if (i === 3) {
      heightBand = "160-170 cm";
      weightBand = "50-60 kg";
      bodyType = "Curvy";
      preferredFit = "Regular";
    } else if (i === 4) {
      heightBand = "160-170 cm";
      weightBand = "50-60 kg";
      bodyType = "Slim";
      preferredFit = "Slim";
    } else if (i === 5) {
      heightBand = "170-180 cm";
      weightBand = "70-80 kg";
      bodyType = "Athletic";
      preferredFit = "Slim";
    } else if (i === 6) {
      heightBand = "160-170 cm";
      weightBand = "60-70 kg";
      bodyType = "Average";
      preferredFit = "Regular";
    } else if (i === 7) {
      heightBand = "180-190 cm";
      weightBand = "80-90 kg";
      bodyType = "Large";
      preferredFit = "Loose";
    } else {
      // General user fits
      if (gender === "Male") {
        heightBand = i % 3 === 0 ? "180-190 cm" : "170-180 cm";
        weightBand = i % 4 === 0 ? "80-90 kg" : (i % 3 === 0 ? "70-80 kg" : "60-70 kg");
        bodyType = ["Slim", "Average", "Athletic", "Large"][i % 4];
      } else {
        heightBand = i % 3 === 0 ? "160-170 cm" : "150-160 cm";
        weightBand = i % 4 === 0 ? "60-70 kg" : (i % 3 === 0 ? "50-60 kg" : "50-60 kg");
        bodyType = ["Slim", "Average", "Curvy", "Slim"][i % 4];
      }
      preferredFit = ["Slim", "Regular", "Loose"][i % 3];
    }

    const state = states[i % states.length];
    const availableFests = festivals.filter(f => f.state === state || f.isNational).map(f => f.festival);
    const userFests = availableFests.slice(0, 2);

    profileDocs.push({
      _id: `prof_${i}`,
      userId: String(i),
      state,
      festivals: userFests.length > 0 ? userFests : ["Diwali"],
      language: i % 3 === 0 ? "Hindi" : (i % 3 === 1 ? "Telugu" : "English"),
      gender,
      heightBand,
      weightBand,
      bodyType,
      preferredFit
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

    const price = Math.floor(Math.random() * 3000) + 999;
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

  console.log('Seeding Purchase History (Year Wrapped metrics)...');
  const purchaseDocs = [];

  const seedUserPurchases = (userId, totalOrders, targetSpent, favBrand, favFestival, favColor, styleBreakdown) => {
    let userSpent = 0;
    const styleTargets = {};
    styleBreakdown.forEach(item => {
      styleTargets[item.name] = Math.round(totalOrders * (item.value / 100));
    });

    const styleKeys = Object.keys(styleTargets);
    let styleAssigned = { Minimal: 0, Ethnic: 0, Trendy: 0, Traditional: 0 };

    for (let o = 1; o <= totalOrders; o++) {
      const matchBrand = o <= Math.round(totalOrders * 0.35);
      const matchColor = o > 10 && o <= Math.round(totalOrders * 0.50);
      const matchFestival = o > 20 && o <= Math.round(totalOrders * 0.50);

      let targetStyle = "Minimal";
      for (let key of styleKeys) {
        if (styleAssigned[key] < styleTargets[key]) {
          targetStyle = key;
          break;
        }
      }
      styleAssigned[targetStyle]++;

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

  seedUserPurchases("1", 80, 54000, "Roadster", "Ugadi", "Black", [
    { name: "Minimal", value: 60 }, { name: "Ethnic", value: 25 }, { name: "Trendy", value: 15 }
  ]);
  seedUserPurchases("2", 65, 48000, "Manyavar", "Lohri", "Yellow", [
    { name: "Traditional", value: 50 }, { name: "Ethnic", value: 30 }, { name: "Minimal", value: 20 }
  ]);
  seedUserPurchases("3", 72, 60000, "Anouk", "Navratri", "Pink", [
    { name: "Ethnic", value: 65 }, { name: "Trendy", value: 20 }, { name: "Traditional", value: 15 }
  ]);
  seedUserPurchases("4", 55, 42000, "Biba", "Pongal", "Gold", [
    { name: "Traditional", value: 60 }, { name: "Minimal", value: 30 }, { name: "Trendy", value: 10 }
  ]);
  seedUserPurchases("5", 40, 35000, "HRX", "Ganesh Chaturthi", "White", [
    { name: "Trendy", value: 50 }, { name: "Minimal", value: 40 }, { name: "Ethnic", value: 10 }
  ]);
  seedUserPurchases("6", 90, 75000, "W", "Durga Puja", "Red", [
    { name: "Traditional", value: 70 }, { name: "Ethnic", value: 20 }, { name: "Trendy", value: 10 }
  ]);
  seedUserPurchases("7", 48, 38000, "Mast & Harbour", "Onam", "Green", [
    { name: "Minimal", value: 50 }, { name: "Traditional", value: 30 }, { name: "Ethnic", value: 20 }
  ]);

  // Seeding additional random purchases
  for (let p = 1; p <= 150; p++) {
    const userId = String(Math.floor(Math.random() * 143) + 8);
    const prodIdx = Math.floor(Math.random() * productDocs.length);
    const prod = productDocs[prodIdx];
    const month = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
    const day = String(Math.floor(Math.random() * 28) + 1).padStart(2, '0');
    const purchaseDate = `2025-${month}-${day}`;

    purchaseDocs.push({
      _id: `p_rand_${p}`,
      userId,
      productId: prod.id,
      festival: prod.festivalTags && prod.festivalTags.length > 0 ? prod.festivalTags[0] : "",
      price: prod.price,
      brand: prod.brand,
      color: prod.color,
      date: purchaseDate
    });
  }
  await Purchase.insertMany(purchaseDocs);

  console.log('Seeding ~950 Return Outcomes (Size Recommendations Cohort)...');
  const returnOutcomeDocs = [];

  // Sizing matrix generator
  const getCorrectSize = (profile, category) => {
    let base = 'M';

    if (profile.heightBand === '150-160 cm') base = 'S';
    else if (profile.heightBand === '160-170 cm') base = 'M';
    else if (profile.heightBand === '170-180 cm') base = 'L';
    else if (profile.heightBand === '180-190 cm') base = 'XL';

    // Adjust based on weight
    if (profile.weightBand === '80-90 kg') {
      if (base === 'S') base = 'M';
      else if (base === 'M') base = 'L';
      else if (base === 'L') base = 'XL';
      else if (base === 'XL') base = 'XXL';
    } else if (profile.weightBand === '50-60 kg') {
      if (base === 'XXL') base = 'XL';
      else if (base === 'XL') base = 'L';
      else if (base === 'L') base = 'M';
      else if (base === 'M') base = 'S';
    }

    // Body type adjustment
    if (profile.bodyType === 'Large' || profile.bodyType === 'Curvy') {
      if (base === 'S') base = 'M';
      else if (base === 'M') base = 'L';
      else if (base === 'L') base = 'XL';
      else if (base === 'XL') base = 'XXL';
    } else if (profile.bodyType === 'Slim') {
      if (base === 'XXL') base = 'XL';
      else if (base === 'XL') base = 'L';
      else if (base === 'L') base = 'M';
      else if (base === 'M') base = 'S';
    }

    // Preferred fit
    if (profile.preferredFit === 'Loose') {
      if (base === 'S') base = 'M';
      else if (base === 'M') base = 'L';
      else if (base === 'L') base = 'XL';
      else if (base === 'XL') base = 'XXL';
    }

    return base;
  };

  const sizes = ['S', 'M', 'L', 'XL', 'XXL'];

  // Seed 950 events
  for (let event = 1; event <= 950; event++) {
    const userProf = profileDocs[Math.floor(Math.random() * profileDocs.length)];
    const product = productDocs[Math.floor(Math.random() * productDocs.length)];

    const correctSize = getCorrectSize(userProf, product.category);
    let sizePurchased = correctSize;
    
    if (Math.random() < 0.3) {
      const currentIdx = sizes.indexOf(correctSize);
      if (Math.random() < 0.5 && currentIdx > 0) {
        sizePurchased = sizes[currentIdx - 1];
      } else if (currentIdx < sizes.length - 1) {
        sizePurchased = sizes[currentIdx + 1];
      }
    }

    let kept = true;

    if (product.brand === 'Libas') {
      const correctIdx = sizes.indexOf(correctSize);
      const targetSize = correctIdx < sizes.length - 1 ? sizes[correctIdx + 1] : 'XXL';
      if (sizePurchased === targetSize) {
        kept = Math.random() < 0.90;
      } else {
        kept = Math.random() < 0.15;
      }
    } else if (product.category === 'Shirt' && (product.brand === 'Roadster' || product.brand === 'HRX')) {
      if (sizes.indexOf(sizePurchased) <= sizes.indexOf(correctSize)) {
        kept = Math.random() < 0.50;
      } else {
        kept = Math.random() < 0.88;
      }
    } else if (product.category === 'Jeans' && sizePurchased === correctSize) {
      kept = Math.random() < 0.92;
    } else {
      if (sizePurchased === correctSize) {
        kept = Math.random() < 0.94;
      } else {
        kept = Math.random() < 0.20;
      }
    }

    const returned = !kept;
    const month = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
    const day = String(Math.floor(Math.random() * 28) + 1).padStart(2, '0');
    const eventDate = new Date(`2025-${month}-${day}`);

    returnOutcomeDocs.push({
      _id: `ro_${event}`,
      userId: userProf.userId,
      productId: product.id,
      brand: product.brand,
      category: product.category,
      gender: userProf.gender,
      heightBand: userProf.heightBand,
      weightBand: userProf.weightBand,
      bodyType: userProf.bodyType,
      preferredFit: userProf.preferredFit,
      state: userProf.state,
      sizePurchased,
      kept,
      returned,
      timestamp: eventDate
    });
  }

  await ReturnOutcome.insertMany(returnOutcomeDocs);
  console.log(`Seeded ${returnOutcomeDocs.length} ReturnOutcome events successfully.`);

  console.log('Seeding complete! Database is successfully populated.');
  process.exit(0);
}

seed().catch(err => {
  console.error("Seeding error:", err);
  process.exit(1);
});
