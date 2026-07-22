import fs from 'fs';
import path from 'path';
const festivals = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'data', 'festivals.json'), 'utf8'));

import { connectDB, User, CultureProfile, Festival, Product, Purchase } from './db.js';

// const states = [
//   "Andhra Pradesh",
//   "Kerala",
//   "Tamil Nadu",
//   "Karnataka",
//   "Telangana",
//   "West Bengal",
//   "Punjab",
//   "Gujarat",
//   "Maharashtra",
//   "Odisha"
// ];
// const getFutureDate = (days) => {
//   const d = new Date();
//   d.setDate(d.getDate() + days);
//   return d.toISOString().split('T')[0];
// };

// const festivals = [
//   { festival: "Ugadi", date: getFutureDate(8), states: ["Andhra Pradesh", "Telangana", "Karnataka"] },
//   { festival: "Sankranti", date: getFutureDate(8), states: ["Andhra Pradesh", "Telangana", "Karnataka", "Tamil Nadu"] },
//   { festival: "Dasara", date: getFutureDate(8), states: ["Andhra Pradesh", "Telangana", "Karnataka", "West Bengal"] },
//   { festival: "Diwali", date: getFutureDate(8), states: ["Andhra Pradesh", "Kerala", "Tamil Nadu", "Karnataka", "Telangana", "West Bengal", "Punjab", "Gujarat", "Maharashtra", "Odisha"] },
//   { festival: "Christmas", date: getFutureDate(8), states: ["Andhra Pradesh", "Kerala", "Tamil Nadu", "Karnataka", "Telangana", "West Bengal", "Punjab", "Gujarat", "Maharashtra", "Odisha"] },
//   { festival: "Vishu", date: getFutureDate(8), states: ["Kerala"] },
//   { festival: "Onam", date: getFutureDate(8), states: ["Kerala"] },
//   { festival: "Pongal", date: getFutureDate(8), states: ["Tamil Nadu"] },
//   { festival: "Puthandu", date: getFutureDate(8), states: ["Tamil Nadu"] },
//   { festival: "Baisakhi", date: getFutureDate(8), states: ["Punjab"] },
//   { festival: "Lohri", date: getFutureDate(8), states: ["Punjab"] },
//   { festival: "Durga Puja", date: getFutureDate(8), states: ["West Bengal", "Odisha"] },
//   { festival: "Poila Baisakh", date: getFutureDate(8), states: ["West Bengal"] },
//   { festival: "Navratri", date: getFutureDate(8), states: ["Gujarat", "Maharashtra", "Punjab"] },
//   { festival: "Uttarayan", date: getFutureDate(8), states: ["Gujarat"] },
//   { festival: "Ganesh Chaturthi", date: getFutureDate(8), states: ["Maharashtra"] },
//   { festival: "Raja Parba", date: getFutureDate(8), states: ["Odisha"] }
// ];


const categories = ["Kurta", "Saree", "Jewellery", "Sherwani", "Dhoti", "Dress", "Shirt", "Jeans"];
const brands = ["Roadster", "W", "Biba", "Libas", "Anouk", "Manyavar", "HRX", "Mast & Harbour"];
const colors = ["Black", "Pink", "Yellow", "Green", "Red", "White", "Blue", "Gold"];
const styles = ["Minimal", "Ethnic", "Trendy", "Traditional"];

const imagesMap = {
  "Kurta": [
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQQbaojXCX-N_2TE2oY-GUPS2DfMIOxxuJm0d-Qwl6e7w&s=10",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSAxyXHmlDsM5sVW4vPtBeqdpXk2gsi0YjLJ9Djhiio0A&s=10",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT47VRK1aBEZPwbxZPbHw4OwyueGwG8bvsjbP8jYyXlCg&s=10",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTsbJ3K6w_-6dT2Ba1TSmZ7PNyd6SFoG5v9n3cxoVGj5w&s=10",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRg4B9xt1qfIdp9FVV2ej4a_pMW8yqpyCAIfGCdnmI6BQ&s=10",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ6-iQ5-iOhrdRtNVVyR3f4UasXv1TGQkGIuBRsK-0Rng&s=10",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSC8qilW4xeHKXNzvFQYnBsHFELBoYDXWDxI3cxizhuoQ&s=10"
  ],
  "Saree": [
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSbDhJQSMYjTUyBUdrdDGUKHOpwxGCikQ6hdfnUJUvqig&s=10",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTIQ35rFms8fyC1h5SL1F7BK-y05rAHgyxSylxrvz7Czg&s=10",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTlXWo_kEfII6_pkloXXWE-8Gm8A2Pg6I10HidiO7H5MQ&s=10",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS0LngBrX1hnJbDKrMkkJAGhrs9F-OPypAEGH5nmgXxDw&s=10",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSimmeRdUs9j7b3LctM1TurTWfofwrpEDU8CYrOGQPKvA&s=10",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRxn6bj8y5BYeg4e6yXiyz5-o8YrDZOTGkKA19pbiB4Qw&s=10",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR56fnkzc4rX82yM3m8JDZVh0huwko1zUJhTYWBdXua1g&s=10"
  ],
  "Jewellery": [
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQU09N8cOC0Y6ui3ln8_LKKMqrSPKBW8Z9p8JzaSnpF3A&s=10",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTgviifvcUJ9SGDCOR8vqvu8IorJUHLdASKwnf0F_-K4Q&s=10",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ7VDZZ4n5_NHDroUHHDqbthXL0nZEbhKtwWTHfC-CF0w&s=10",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQfXHWfTn9JfZ8WaeodXJ-pkuQIA-KLbh2ZQ1u6PaRujQ&s=10",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSl__WcP8x0XN9J56aKCttADowZHrCzPE5Lq4Lzic-LAA&s=10",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQBKudWPnMplfbbdoeEP9Pd1RG11Qf74yt7Q95lfKG_Nw&s=10"
  ],
  "Sherwani": [
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTNNOwmDlP393qZ8Ms3KEUOrtGVw0HRqu2lRreiJ-kb3w&s=10",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ-TRjT6jQci_ls3zQAZYIf4slj1ljTYH6vP4iWz-rykA&s=10",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSdfSWOqp5UPWOdE9atEG4r1dCIZtEgBmq8n-LZVA4Wkw&s=10",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTi6oq1VcK5vAVPPhG9okvJuVNTP9jrSq5Ml5iMCSr8Uw&s=10",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSf7j9de0zfZG1a_7vdcXHik663BpvwoAAPBJ9am8cahA&s=10",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ9UHeVA2I38yNwMyVnAZshzNLDxa695A3SwsGi-U-TOA&s=10",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcStvDUrZ7rilITizJ6A_7wYYmooC4pCLDFcFleQrLL5Cw&s=10"
  ],
  "Dhoti": [
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTWOZKefh3aeETdmFoG6J6ah1Lx91ZCKzHUFtRHb_-6og&s=10",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSCyWG0B1ViHEc8KK9VEpJHcMrC9fjfmnZLi-MYAIEHhg&s=10",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ-cdyo6Kly1aZJSmYpAFjlk_ff0cbfKNSzUOzTmnaLew&s=10",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS8ELIYeic6TgWGDwqrqFulV3eryapMTs1N2TEf4l9O8g&s",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTmbViYqEh41M99CeFIrQXzfwR4-28gOOR708WK1Ya2Vw&s=10",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRTyVu4JP0tXNEkf3yuRclRftUVklnbo2Tq0la3OGTBig&s=10"
  ],
  "Dress": [
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcReJGUkIdpIsPLmAqH_Jhnxemz1Baee3EFUTUjY_lJzCA&s=10",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcShBCufpgErz0kNy_Lo3DJuG8nAc15Oy6rlEpiKzlfcUw&s=10",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS9Ir737R2MG48OhW7yNdWtw2parYTAg7_3itzkByZATQ&s=10",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT-17T_6A-SlKhJbR8uN3SskQMy6NSMsW4OgYktAbZ3JQ&s=10",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT2TvErlo9g1u312BQua7g-EoIruuW4_63aVwM1qoqwmQ&s=10",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRX2W_JmnWdnk7stKwhfVLjVjLOpCz1ASOy5XHVQ2KALw&s=10",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS2byMo-_eLOy1gPKCXRlJGYGGlczTbywwVYcpqJMkHwQ&s=10"
      ],
  "Shirt": [
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR7GFqcyV6NKzmXwFJJF0VKRu-8ZlgpcssvrRXOVet3lw&s=10",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRZrGo7kqvIXFaJvEhKTM_5ZrcLkp3Kq14rNfqrp2NW6Q&s=10",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR19w2BVt_0CpmZJsE0m31kOfL0Pz_DsAg59fpNfy4yhA&s=10",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ5L1UZcY4H9ITNULK1QCA-MKuj4qSXY8dlnVF-4AsLXg&s=10",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRyegVlLMuYPF5abR4Ha59AlacC0Iqzw7yu2Zug-b9TYg&s=10",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR2H2KcX1lWsrKYMkBvQa_Xf7cOgAQeVXwwmtP9iCLP_g&s=10",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRjbcNpFoglwPfrYT0_JsoTvzTdKOYWczqPw1-Q9UXGlg&s=10"
  ],
  "Jeans": [
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTB5gmkFFTst_bsCAxMI8JFhEEPt4l7ND6EkeL3BiAq1w&s=10",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ7OaCVbcYffMh3KBjs56-XODMsjoy8a2XzyVM0UwzHeg&s=10",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSYfz3S1TrAeLG9tqjCzLXVSBoPMnwy8R9yyKbX2Kn-ug&s=10",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQQE1xoQ-HDekgRf4sWgMRkD6ogp9J4rSChPumAaWN7cw&s",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRYKxWDVd5VDP2yW_aRTsn1vbTTkGNjdPGhjmhqdvOtYw&s=10",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRGVr6sH0zb8BEnpPtAzFBnKkd_2Ombd0K0UmNaqpKThw&s=10",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQl-EmdLRVA5VOnesdEeJAOalnmKJ-WP4qcJinweweo3g&s=10"
  ]
};

async function seed() {
  await connectDB();

  console.log('Clearing existing database entries...');
  await User.deleteMany({});
  await CultureProfile.deleteMany({});
  await Festival.deleteMany({}); //
  await Product.deleteMany({});
  await Purchase.deleteMany({});

  console.log('Seeding Festivals...');
  await Festival.insertMany(festivals); //

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
