import os
import json
import random
import numpy as np
import pandas as pd
from typing import List, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sklearn.preprocessing import StandardScaler
from sklearn.neighbors import NearestNeighbors

app = FastAPI(title="Myntra Regional ML Service", version="2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------
# CONSTANTS & CATEGORICAL DICTIONARIES (EXACT MATCHING)
# ---------------------------------------------------------
STATES = [
    "Andhra Pradesh", "Kerala", "Tamil Nadu", "Karnataka", "Telangana",
    "West Bengal", "Punjab", "Gujarat", "Maharashtra", "Odisha"
]
STYLES = ["Minimal", "Ethnic", "Trendy", "Traditional"]
CATEGORIES = ["Kurta", "Saree", "Jewellery", "Sherwani", "Dhoti", "Dress", "Shirt", "Jeans"]
BRANDS = ["Roadster", "W", "Biba", "Libas", "Anouk", "Manyavar", "HRX", "Mast & Harbour"]
FESTIVALS = [
    "Ugadi", "Sankranti", "Dasara", "Diwali", "Christmas", "Vishu", "Onam",
    "Pongal", "Puthandu", "Baisakhi", "Lohri", "Durga Puja", "Poila Baisakh",
    "Navratri", "Uttarayan", "Ganesh Chaturthi", "Raja Parba"
]

FESTIVAL_CATEGORY_MAP = {
    ("andhra", "ugadi"): ["Kurta", "Saree", "Jewellery"],
    ("telangana", "ugadi"): ["Kurta", "Saree", "Jewellery"],
    ("karnataka", "ugadi"): ["Kurta", "Saree", "Jewellery"],
    ("tamil", "pongal"): ["Saree", "Dhoti", "Jewellery"],
    ("kerala", "onam"): ["Saree", "Kurta", "Jewellery"],
    ("kerala", "vishu"): ["Saree", "Kurta", "Jewellery"],
    ("punjab", "baisakhi"): ["Kurta", "Jewellery", "Sherwani"],
    ("punjab", "lohri"): ["Kurta", "Sherwani", "Jewellery"],
    ("west bengal", "durga puja"): ["Saree", "Kurta", "Jewellery"],
    ("gujarat", "navratri"): ["Saree", "Jewellery", "Dress"],
    ("gujarat", "uttarayan"): ["Kurta", "Shirt", "Jeans"],
    ("maharashtra", "ganesh chaturthi"): ["Kurta", "Saree", "Jewellery"],
    ("maharashtra", "navratri"): ["Saree", "Jewellery", "Dress"],
    ("odisha", "raja parba"): ["Saree", "Jewellery", "Dress"],
    ("odisha", "durga puja"): ["Saree", "Kurta", "Jewellery"],
}

# ---------------------------------------------------------
# REUSABLE ENCODER FUNCTION (EXACT MATCHING, NO SUBSTRINGS)
# ---------------------------------------------------------
def encode_user_vector(state: str, style: str, budget: float, categories: List[str], brands: List[str], festivals: List[str]) -> np.ndarray:
    """
    Constructs an identical, consistent numerical feature vector for both training and inference.
    Feature Ordering:
    - State One-Hot (len(STATES))
    - Style One-Hot (len(STYLES))
    - Budget Numeric (1)
    - Categories Multi-Hot (len(CATEGORIES))
    - Brands Multi-Hot (len(BRANDS))
    - Festivals Multi-Hot (len(FESTIVALS))
    """
    vector = []
    
    # 1. State One-Hot
    norm_state = state.strip().title() if state else ""
    for s in STATES:
        vector.append(1.0 if s.lower() == norm_state.lower() else 0.0)
        
    # 2. Style One-Hot
    norm_style = style.strip().title() if style else ""
    for st in STYLES:
        vector.append(1.0 if st.lower() == norm_style.lower() else 0.0)
        
    # 3. Budget (Unscaled raw float, scaled via scaler later)
    vector.append(float(budget) if budget else 2500.0)
    
    # 4. Categories Multi-Hot
    user_cats = [c.strip().title() for c in (categories or [])]
    for c in CATEGORIES:
        vector.append(1.0 if any(c.lower() == uc.lower() for uc in user_cats) else 0.0)
        
    # 5. Brands Multi-Hot
    user_brands = [b.strip() for b in (brands or [])]
    for b in BRANDS:
        vector.append(1.0 if any(b.lower() == ub.lower() for ub in user_brands) else 0.0)
        
    # 6. Festivals Multi-Hot
    user_fests = [f.strip() for f in (festivals or [])]
    for f in FESTIVALS:
        vector.append(1.0 if any(f.lower() == uf.lower() for uf in user_fests) else 0.0)
        
    return np.array(vector, dtype=np.float64)

# ---------------------------------------------------------
# GLOBAL ML MODEL & DATASET STATE
# ---------------------------------------------------------
knn_model: Optional[NearestNeighbors] = None
scaler: Optional[StandardScaler] = None
synthetic_users_df: Optional[pd.DataFrame] = None
synthetic_purchases_df: Optional[pd.DataFrame] = None
historical_feature_matrix: Optional[np.ndarray] = None

# ---------------------------------------------------------
# DETERMINISTIC SYNTHETIC DATASET GENERATION
# ---------------------------------------------------------
def generate_synthetic_dataset():
    global synthetic_users_df, synthetic_purchases_df, historical_feature_matrix
    
    # Fixed seed for 100% reproducibility
    np.random.seed(42)
    random.seed(42)
    
    num_users = 200
    num_products = 100
    
    # 1. Generate Synthetic Users
    user_records = []
    user_vectors = []
    
    for i in range(1, num_users + 1):
        uid = f"user_{i}"
        state = STATES[i % len(STATES)]
        style = STYLES[i % len(STYLES)]
        budget = float(np.random.choice([1500, 2000, 2500, 3000, 3500, 4500, 5000]))
        user_cats = random.sample(CATEGORIES, k=random.randint(1, 3))
        user_brands = random.sample(BRANDS, k=random.randint(1, 3))
        user_fests = random.sample(FESTIVALS, k=random.randint(1, 3))
        
        user_records.append({
            "userId": uid,
            "state": state,
            "style": style,
            "budget": budget,
            "categories": user_cats,
            "brands": user_brands,
            "festivals": user_fests
        })
        
        vec = encode_user_vector(state, style, budget, user_cats, user_brands, user_fests)
        user_vectors.append(vec)
        
    synthetic_users_df = pd.DataFrame(user_records)
    historical_feature_matrix = np.array(user_vectors)
    
    # 2. Generate Synthetic Products
    products = []
    for p_id in range(1, num_products + 1):
        cat = CATEGORIES[p_id % len(CATEGORIES)]
        brand = BRANDS[p_id % len(BRANDS)]
        price = float((p_id * 37) % 3500 + 999)
        region = STATES[p_id % len(STATES)]
        fest_tag = FESTIVALS[p_id % len(FESTIVALS)]
        rating = float(round(3.8 + (p_id % 12) * 0.1, 1))
        products.append({
            "productId": str(p_id),
            "category": cat,
            "brand": brand,
            "price": price,
            "region": region,
            "festivalTag": fest_tag,
            "rating": rating
        })
    products_df = pd.DataFrame(products)
    
    # 3. Generate Correlated Purchase & Return Behavior
    purchase_records = []
    purchase_id = 1
    
    for _, u in synthetic_users_df.iterrows():
        # Pick 8-15 products per user based on preference alignment
        for _, p in products_df.iterrows():
            cat_match = p["category"] in u["categories"]
            brand_match = p["brand"] in u["brands"]
            budget_align = abs(p["price"] - u["budget"]) <= 1200
            
            # Base probability of purchase
            prob = 0.15
            if cat_match: prob += 0.35
            if brand_match: prob += 0.25
            if budget_align: prob += 0.15
            
            if random.random() < prob:
                # Retention probability correlated with match strength
                retention_prob = 0.50
                if cat_match: retention_prob += 0.25
                if brand_match: retention_prob += 0.15
                if budget_align: retention_prob += 0.08
                
                kept = random.random() < min(0.95, retention_prob)
                returned = not kept
                size_success = random.random() < (0.92 if kept else 0.40)
                
                purchase_records.append({
                    "purchaseId": f"pur_{purchase_id}",
                    "userId": u["userId"],
                    "productId": p["productId"],
                    "category": p["category"],
                    "brand": p["brand"],
                    "price": p["price"],
                    "region": p["region"],
                    "festivalTag": p["festivalTag"],
                    "kept": kept,
                    "returned": returned,
                    "sizeSuccess": size_success
                })
                purchase_id += 1
                
    synthetic_purchases_df = pd.DataFrame(purchase_records)
    print(f"Synthetic dataset generated: {len(synthetic_users_df)} users, {len(synthetic_purchases_df)} purchase records.")

# ---------------------------------------------------------
# MODEL FIT AT SERVICE STARTUP
# ---------------------------------------------------------
@app.on_event("startup")
def startup_event():
    global knn_model, scaler
    
    generate_synthetic_dataset()
    
    # Fit StandardScaler and NearestNeighbors ONCE at startup
    scaler = StandardScaler()
    scaled_matrix = scaler.fit_transform(historical_feature_matrix)
    
    knn_model = NearestNeighbors(n_neighbors=15, metric="cosine", algorithm="brute")
    knn_model.fit(scaled_matrix)
    print("KNN model fitted successfully on historical user feature vectors (metric='cosine', n_neighbors=15).")

# ---------------------------------------------------------
# PYDANTIC SCHEMAS FOR FASTAPI
# ---------------------------------------------------------
class ConfidenceRequest(BaseModel):
    userId: Optional[str] = "1"
    state: Optional[str] = "Andhra Pradesh"
    style: Optional[str] = "Ethnic"
    budget: Optional[float] = 2500.0
    category: Optional[str] = "Kurta"
    brand: Optional[str] = "W"
    productId: Optional[str] = "1"
    price: Optional[float] = 1899.0
    rating: Optional[float] = 4.4
    festivals: Optional[List[str]] = []
    categories: Optional[List[str]] = []
    brands: Optional[List[str]] = []
    productRegion: Optional[str] = ""
    productRegionTags: Optional[List[str]] = []
    productFestivalTag: Optional[str] = ""
    productFestivalTags: Optional[List[str]] = []

class RecommendRequest(BaseModel):
    region: Optional[str] = ""
    festival: Optional[str] = ""

# ---------------------------------------------------------
# FASTAPI ENDPOINTS
# ---------------------------------------------------------
@app.get("/health")
def health_check():
    return {
        "status": "online",
        "model": "KNN NearestNeighbors (Cosine Similarity)",
        "usersCount": len(synthetic_users_df) if synthetic_users_df is not None else 0,
        "purchasesCount": len(synthetic_purchases_df) if synthetic_purchases_df is not None else 0
    }

@app.post("/predict/confidence")
@app.post("/confidence")
def predict_confidence(req: ConfidenceRequest):
    global knn_model, scaler, synthetic_users_df, synthetic_purchases_df
    
    if knn_model is None or scaler is None:
        raise HTTPException(status_code=500, detail="ML model is not initialized.")
        
    user_state = req.state or "Andhra Pradesh"
    user_style = req.style or "Ethnic"
    user_budget = float(req.budget or 2500.0)
    user_cats = req.categories if req.categories else ([req.category] if req.category else ["Kurta"])
    user_brands = req.brands if req.brands else ([req.brand] if req.brand else ["W"])
    user_fests = req.festivals if req.festivals is not None else []
    
    prod_id = str(req.productId or "1")
    prod_cat = req.category or "Kurta"
    prod_brand = req.brand or "W"
    prod_rating = float(req.rating or 4.4)
    
    # 1. Encode user request into vector & scale using pre-fitted scaler
    raw_vec = encode_user_vector(user_state, user_style, user_budget, user_cats, user_brands, user_fests)
    scaled_vec = scaler.transform(raw_vec.reshape(1, -1))
    
    # 2. KNN inference: Find top 15 most behaviorally similar historical users
    distances, indices = knn_model.kneighbors(scaled_vec, n_neighbors=15)
    similar_indices = indices[0]
    similar_distances = distances[0]
    
    similar_user_ids = synthetic_users_df.iloc[similar_indices]["userId"].tolist()
    similar_shoppers_count = len(similar_user_ids)
    
    # 3. Cohort Analysis ONLY on these 15 similar shoppers
    cohort_purchases = synthetic_purchases_df[synthetic_purchases_df["userId"].isin(similar_user_ids)]
    
    # Fallback Levels Evaluation
    fallback_level = "exact_product"
    target_cohort = cohort_purchases[cohort_purchases["productId"] == prod_id]
    
    if len(target_cohort) < 3:
        fallback_level = "same_category_brand"
        target_cohort = cohort_purchases[
            (cohort_purchases["category"].str.lower() == prod_cat.lower()) & 
            (cohort_purchases["brand"].str.lower() == prod_brand.lower())
        ]
        
    if len(target_cohort) < 3:
        fallback_level = "same_category"
        target_cohort = cohort_purchases[cohort_purchases["category"].str.lower() == prod_cat.lower()]
        
    if len(target_cohort) < 3:
        fallback_level = "broad_cohort"
        target_cohort = cohort_purchases
        
    # Calculate cohort metrics
    similar_purchased_count = len(target_cohort)
    if similar_purchased_count > 0:
        similar_kept_count = int(target_cohort["kept"].sum())
        retention_rate = float(round((similar_kept_count / similar_purchased_count) * 100, 1))
        size_success_rate = float(round((target_cohort["sizeSuccess"].sum() / similar_purchased_count) * 100, 1))
    else:
        similar_kept_count = 0
        retention_rate = 80.0
        size_success_rate = 85.0
        
    # 4. Weighted Confidence Scoring Model
    # Components:
    # 1. retention_score (40%)
    # 2. rating_score (20%)
    # 3. regional_score (15%)
    # 4. festival_score (15%)
    # 5. size_score (10%)
    
    retention_score = retention_rate
    rating_score = float(round(min(100.0, max(0.0, (prod_rating / 5.0) * 100)), 1))
    
    # ---------------------------------------------------------
    # FIX 1: CORRECT REGIONAL RELEVANCE CALCULATION
    # ---------------------------------------------------------
    user_state_norm = user_state.strip().lower()
    prod_region_norm = (req.productRegion or "").strip().lower()
    prod_region_tags_norm = [r.strip().lower() for r in (req.productRegionTags or []) if r.strip()]

    REGIONAL_GROUPS = {
        "south": ["andhra pradesh", "telangana", "karnataka", "tamil nadu", "kerala"],
        "north": ["punjab", "haryana", "delhi (nct)", "himachal pradesh", "uttar pradesh", "uttarakhand"],
        "east": ["west bengal", "odisha", "assam", "bihar", "jharkhand", "sikkim"],
        "west": ["gujarat", "maharashtra", "goa", "rajasthan"]
    }

    user_zone = None
    for zone, states_in_zone in REGIONAL_GROUPS.items():
        if any(s in user_state_norm for s in states_in_zone):
            user_zone = zone
            break

    is_exact_region = False
    if prod_region_norm and prod_region_norm == user_state_norm:
        is_exact_region = True
    elif any(r == user_state_norm for r in prod_region_tags_norm):
        is_exact_region = True

    is_same_zone = False
    if not is_exact_region and user_zone:
        zone_states = REGIONAL_GROUPS[user_zone]
        if prod_region_norm and any(s in prod_region_norm for s in zone_states):
            is_same_zone = True
        elif any(any(s in r for s in zone_states) for r in prod_region_tags_norm):
            is_same_zone = True

    has_product_region_data = bool(prod_region_norm or prod_region_tags_norm)

    if is_exact_region:
        regional_score = 100.0
    elif is_same_zone:
        regional_score = 75.0
    elif has_product_region_data:
        regional_score = 50.0
    else:
        regional_score = 60.0 # Neutral score if product has no regional metadata

    # ---------------------------------------------------------
    # FIX 2: CORRECT FESTIVAL RELEVANCE CALCULATION
    # ---------------------------------------------------------
    user_fests_norm = [f.strip().lower() for f in (req.festivals or []) if f.strip()]
    prod_fest_tags_norm = [f.strip().lower() for f in (req.productFestivalTags or []) if f.strip()]
    if req.productFestivalTag and req.productFestivalTag.strip():
        pf_tag_norm = req.productFestivalTag.strip().lower()
        if pf_tag_norm not in prod_fest_tags_norm:
            prod_fest_tags_norm.append(pf_tag_norm)

    if not user_fests_norm:
        # User has no selected festivals -> neutral score
        festival_score = 60.0
    elif any(pf in user_fests_norm for pf in prod_fest_tags_norm):
        # Product matches at least one festival selected by the user
        festival_score = 100.0
    elif len(prod_fest_tags_norm) > 0:
        # Product is generally festive but does not match user selected festival
        festival_score = 70.0
    else:
        # Product has no festival relevance
        festival_score = 50.0

    size_score = size_success_rate
    
    weighted_score = (
        retention_score * 0.40 +
        rating_score    * 0.20 +
        regional_score  * 0.15 +
        festival_score  * 0.15 +
        size_score      * 0.10
    )
    
    final_confidence = int(round(weighted_score))
    final_confidence = min(99, max(50, final_confidence))
    
    # Match Label
    if final_confidence >= 90:
        match_label = "Perfect Match"
    elif final_confidence >= 80:
        match_label = "Highly Recommended"
    else:
        match_label = "Moderate Match"
        
    # ---------------------------------------------------------
    # FIX 3: MAKE FALLBACK EXPLANATIONS PRECISE
    # ---------------------------------------------------------
    if fallback_level == "exact_product":
        retention_reason = f"{similar_kept_count} of {similar_purchased_count} similar shoppers kept this exact product."
    elif fallback_level == "same_category_brand":
        retention_reason = f"{similar_kept_count} of {similar_purchased_count} similar shoppers kept comparable products from the same category and brand."
    elif fallback_level == "same_category":
        retention_reason = f"{similar_kept_count} of {similar_purchased_count} similar shoppers kept comparable products from the same category."
    else:
        retention_reason = f"{similar_kept_count} of {similar_purchased_count} similar shoppers retained products in the broader shopping cohort."

    reasons = [retention_reason]
    reasons.append(f"{size_success_rate}% size fit satisfaction among your demographic cohort")

    if regional_score == 100.0:
        reasons.append(f"Exact regional match for shoppers in {user_state}")
    elif regional_score == 75.0:
        reasons.append(f"Regional relevance for the {user_state} zone")

    if festival_score == 100.0:
        reasons.append("Product is relevant to your selected festival")
    elif festival_score == 70.0:
        reasons.append("Product has general festive styling")
    elif festival_score == 60.0:
        reasons.append("No active festival selected")
        
    active_fest = user_fests[0] if len(user_fests) > 0 else ""

    return {
        "confidence": final_confidence,
        "matchLabel": match_label,
        "similarShoppersCount": similar_shoppers_count,
        "similarPurchasedCount": similar_purchased_count,
        "similarKeptCount": similar_kept_count,
        "retentionRate": retention_rate,
        "sizeSuccessRate": size_success_rate,
        "ratingScore": rating_score,
        "regionalScore": regional_score,
        "festivalScore": festival_score,
        "sizeScore": size_score,
        "fallbackLevel": fallback_level,
        "breakdown": {
            "retentionScore": retention_score,
            "ratingScore": rating_score,
            "regionalScore": regional_score,
            "festivalScore": festival_score,
            "sizeScore": size_score
        },
        "reasons": reasons,
        "similarUsers": similar_user_ids[:5],
        "trueToSize": int(round(size_success_rate)),
        "festival": active_fest
    }

@app.post("/recommend")
def recommend(req: RecommendRequest):
    region = req.region or ""
    festival = req.festival or ""
    
    matched_categories = ["Kurta", "Saree", "Jewellery"]
    for (r, f), cats in FESTIVAL_CATEGORY_MAP.items():
        if r in region.lower() and f.lower() == festival.lower():
            matched_categories = cats
            break
            
    return {"recommendedCategories": matched_categories}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=False)
