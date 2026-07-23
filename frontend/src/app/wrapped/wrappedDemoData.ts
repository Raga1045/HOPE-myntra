export interface PurchaseItem {
  category: string;
  brand: string;
  color: string;
  occasion: string;
  price: number;
  date: string;
}

// User 1 (Aditi Sharma): 31 purchases, total = ₹58,400
export const historyUser1: PurchaseItem[] = [
  { category: "Kurta", brand: "Libas", color: "Ivory", occasion: "Ugadi", price: 1500, date: "2025-03-10" },
  { category: "Kurta", brand: "Biba", color: "Gold", occasion: "Ugadi", price: 2000, date: "2025-03-12" },
  { category: "Jewellery", brand: "W for Woman", color: "Gold", occasion: "Ugadi", price: 1500, date: "2025-03-15" },
 
  { category: "Handbag", brand: "Libas", color: "Cream", occasion: "Ugadi", price: 3000, date: "2025-03-28" },

 
  { category: "Handbag", brand: "Libas", color: "Beige", occasion: "Diwali", price: 1500, date: "2025-10-30" },

  { category: "Minimal Shirt", brand: "H&M", color: "Cream", occasion: "Family Functions", price: 1100, date: "2025-12-05" },
  { category: "Straight Pants", brand: "Roadster", color: "Cream", occasion: "Family Functions", price: 1100, date: "2025-12-08" },
  { category: "Minimal Shirt", brand: "H&M", color: "Peach", occasion: "Family Functions", price: 1100, date: "2025-12-12" },
  { category: "Straight Pants", brand: "Roadster", color: "Beige", occasion: "Family Functions", price: 1100, date: "2025-12-15" },
  { category: "Kurta", brand: "Libas", color: "Maroon", occasion: "Family Functions", price: 1500, date: "2025-12-18" },
  { category: "Dupatta", brand: "Biba", color: "Olive", occasion: "Family Functions", price: 1100, date: "2025-12-22" },
  { category: "Kurta", brand: "W for Woman", color: "Ivory", occasion: "Family Functions", price: 1100, date: "2025-12-25" }
];

// User 2 (Riya Kapoor): 28 purchases, total = ₹47,900
export const historyUser2: PurchaseItem[] = [
  { category: "Oversized T-Shirt", brand: "Nike", color: "White", occasion: "College Fest", price: 1500, date: "2025-02-10" },
  { category: "Wide Leg Jeans", brand: "Levis", color: "Blue", occasion: "College Fest", price: 2000, date: "2025-02-12" },
  { category: "Oversized T-Shirt", brand: "Adidas", color: "Black", occasion: "College Fest", price: 1090, date: "2025-02-15" },
  { category: "Cargo Pants", brand: "Puma", color: "Black", occasion: "College Fest", price: 2000, date: "2025-02-18" },
  { category: "Crossbody Bag", brand: "Nike", color: "White", occasion: "College Fest", price: 1500, date: "2025-02-20" },
  { category: "Crop Top", brand: "H&M", color: "Grey", occasion: "College Fest", price: 1090, date: "2025-02-22" },
  { category: "Wide Leg Jeans", brand: "Roadster", color: "Grey", occasion: "College Fest", price: 1500, date: "2025-02-25" },

 

  
  { category: "Crossbody Bag", brand: "Nike", color: "Grey", occasion: "Weekend Hangouts", price: 1500, date: "2025-09-22" },
  { category: "Cap", brand: "H&M", color: "Black", occasion: "Weekend Hangouts", price: 1090, date: "2025-09-25" }
];

export interface StyleInsights {
  styleDNA: {
    archetype: string;
    confidence: number;
    tags: string[];
    quote: string;
  };
  palette: {
    colors: string[];
    gradient: string; // Tailored gradient background
    quote: string;
  };
  celebration: {
    timeline: string[];
    favourite: string;
    items: string[];
    quote: string;
  };
  brands: {
    name: string;
    compatibility: number;
    reason: string;
  }[];
  metrics: {
    orders: number;
    investment: number;
    categories: number;
    brands: number;
    badges: string[];
  };
  highlights: {
    silhouette: string;
    aesthetic: string;
    collection: string;
    evolution: string[];
  };
  story: string;
}

/**
 * Deterministic Style Intelligence Engine
 * Dynamically constructs the Wrapped Insights based on the mapped User History
 */
export function generateStyleInsights(userEmail: string, userName: string): StyleInsights {
  const isRiya = (userEmail || "").toLowerCase().includes("riya") || (userName || "").toLowerCase().includes("riya");
  const history = isRiya ? historyUser2 : historyUser1;

  // 1. Calculate base stats
  const orders = history.length;
  const investment = history.reduce((sum, item) => sum + item.price, 0);
  
  const uniqueCategories = new Set(history.map(item => item.category)).size;
  const uniqueBrands = new Set(history.map(item => item.brand)).size;

  if (isRiya) {
    return {
      styleDNA: {
        archetype: "Streetwear Rebel",
        confidence: 77,
        tags: ["Streetwear", "Oversized", "Gen Z", "Bold", "Experimental"],
        quote: "Rules are meant to be broken. Your outfits prove it."
      },
      palette: {
        colors: ["Black", "Grey", "White"],
        gradient: "from-[#0A0B10] via-[#1F2833] to-[#0A0B10]", // Streetwear dark luxury
        quote: "Bold monochromes dominated your rotation, creating an industrial, high-impact aesthetic."
      },
      celebration: {
        timeline: ["College Fest", "Concert Season", "Travel"],
        favourite: "Concert Season",
        items: ["Nike Sneakers", "Cargo Pants", "Oversized Hoodie"],
        quote: "Every music beat and travel journey was a runway for your street persona."
      },
      brands: [
        { name: "Nike", compatibility: 85, reason: "Fueled your sneaker obsession and activewear fit." },
        { name: "Levis", compatibility: 55, reason: "Perfect denim frames for oversized cargo styles." },
        { name: "H&M", compatibility: 75, reason: "Supplied essential boxy crops and modern layers." }
      ],
      metrics: {
        orders,
        investment,
        categories: uniqueCategories,
        brands: uniqueBrands,
        badges: ["Trend Explorer", "Sneakerhead", "Street Icon"]
      },
      highlights: {
        silhouette: "Oversized Fit",
        aesthetic: "Techwear Inspired",
        collection: "Gen Z Active",
        evolution: ["Basics", "Oversized", "Streetwear", "Techwear Inspired"]
      },
      story: "2026 was your year of bold self-expression. You dominated the street scene in monochrome hoodies and sneakers, turning every college fest and concert into a display of techwear-inspired style. You rejected basic expectations in favor of comfortable, oversized silhouettes that speak volumes."
    };
  } else {
    // Default: Aditi Sharma (User 1)
    return {
      styleDNA: {
        archetype: "Cultural Minimalist",
        confidence: 94,
        tags: ["Elegant", "Minimal", "Ethnic", "Festival Lover", "Classic"],
        quote: "You don't follow trends. You define them."
      },
      palette: {
        colors: ["Ivory", "Maroon", "Gold"],
        gradient: "from-[#1C0D15] via-[#2F1122] to-[#14080F]", // Crimson gold elegance
        quote: "Ivory neutrals met deep maroons, building a luxury wardrobe of quiet heritage elegance."
      },
      celebration: {
        timeline: ["Ugadi", "Wedding Season", "Diwali"],
        favourite: "Diwali",
        items: ["Libas Kurta", "W Dupatta", "Aurelia Saree"],
        quote: "Dressing in tradition, celebrating in timeless elegance."
      },
      brands: [
        { name: "Libas", compatibility: 89, reason: "Provided clean ethnic lines that support your minimal taste." },
        { name: "Biba", compatibility: 77, reason: "Satisfied your wedding season needs with luxury fabrics." },
        { name: "W for Woman", compatibility: 88, reason: "Kept your everyday styles structured and classic." }
      ],
      metrics: {
        orders,
        investment,
        categories: uniqueCategories,
        brands: uniqueBrands,
        badges: ["Festival Stylist", "Quiet Luxury", "Timeless Shopper"]
      },
      highlights: {
        silhouette: "Straight Silhouette",
        aesthetic: "Traditional Chic",
        collection: "Festival Silk",
        evolution: ["Traditional", "Elegant", "Minimal Luxury"]
      },
      story: "2026 was your year of timeless elegance. You embraced minimal silhouettes, celebrated every festival in style, and built a wardrobe that perfectly balances tradition with modern fashion. You prioritized classic, long-lasting investments over brief micro-trends."
    };
  }
}
