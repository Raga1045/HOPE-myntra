import json
from http.server import BaseHTTPRequestHandler, HTTPServer
import random

# Maps region/festival combinations to recommended fashion categories
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

class AIServiceHandler(BaseHTTPRequestHandler):
    def log_message(self, format, *args):
        # Suppress logging to keep output clean, but print startup info
        pass

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def do_POST(self):
        content_length = int(self.headers.get('Content-Length', 0))
        post_data = self.rfile.read(content_length).decode('utf-8')
        
        try:
            payload = json.loads(post_data)
        except Exception:
            payload = {}

        response_body = {}
        
        if self.path == '/recommend':
            region = payload.get('region', '')
            festival = payload.get('festival', '')
            
            matched_categories = ["Kurta", "Saree", "Jewellery"]
            for (r, f), cats in FESTIVAL_CATEGORY_MAP.items():
                if r in region.lower() and f.lower() == festival.lower():
                    matched_categories = cats
                    break
                    
            response_body = {"recommendedCategories": matched_categories}
            
        elif self.path == '/confidence':
            state = payload.get('state', 'Andhra Pradesh')
            festivals = payload.get('festivals', ['Ugadi'])
            style = payload.get('style', 'Minimal')
            category = payload.get('category', 'Kurta')
            color = payload.get('color', 'Black')
            price = float(payload.get('price', 1500))
            age = int(payload.get('age', 25))
            gender = payload.get('gender', 'Female')
            
            # Weighted Similarity math
            # style (30%), category (25%), region (15%), budget (10%), festival (10%), age (5%), gender (5%)
            user_preferred_style = "Ethnic" if any(f in ["Ugadi", "Pongal", "Onam"] for f in festivals) else "Minimal"
            style_sim = 1.0 if style.lower() == user_preferred_style.lower() or style.lower() == "traditional" else 0.6
            
            is_trad_cat = category in ["Kurta", "Saree", "Jewellery", "Sherwani", "Dhoti"]
            category_sim = 1.0 if is_trad_cat else 0.5
            
            state_prefix = state.split(" ")[0].lower()
            region_match = False
            if state_prefix == "andhra" and color.lower() in ["yellow", "gold", "pink"]:
                region_match = True
            elif state_prefix == "kerala" and color.lower() in ["white", "gold"]:
                region_match = True
            elif state_prefix == "punjab" and color.lower() in ["red", "pink", "yellow"]:
                region_match = True
            else:
                region_match = (random.random() > 0.3)
            region_sim = 1.0 if region_match else 0.7
            
            target_budget = 2500.0
            budget_sim = max(0.0, 1.0 - (abs(price - target_budget) / target_budget))
            
            festivals_lower = [f.lower() for f in festivals]
            active_fest = festivals[0] if len(festivals) > 0 else "Ugadi"
            festival_sim = 1.0 if active_fest.lower() in festivals_lower else 0.5
            
            age_sim = 1.0 if 18 <= age <= 35 else 0.8
            
            gender_match = True
            if gender.lower() == "female" and category in ["Sherwani", "Dhoti"]:
                gender_match = False
            elif gender.lower() == "male" and category in ["Saree"]:
                gender_match = False
            gender_sim = 1.0 if gender_match else 0.3
            
            weighted_score = (
                style_sim * 0.30 +
                category_sim * 0.25 +
                region_sim * 0.15 +
                budget_sim * 0.10 +
                festival_sim * 0.10 +
                age_sim * 0.05 +
                gender_sim * 0.05
            )
            
            confidence_score = int(80 + (weighted_score * 18))
            confidence_score = min(98, max(65, confidence_score))
            true_to_size = int(85 + (style_sim * 10) + random.randint(0, 3))
            
            response_body = {
                "confidence": confidence_score,
                "trueToSize": true_to_size,
                "festival": active_fest
            }
            
        else:
            self.send_response(404)
            self.end_headers()
            return

        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(json.dumps(response_body).encode('utf-8'))

def run(server_class=HTTPServer, handler_class=AIServiceHandler, port=8000):
    server_address = ('', port)
    httpd = server_class(server_address, handler_class)
    print(f"Python standard library AI server running on port {port}...")
    httpd.serve_forever()

if __name__ == '__main__':
    run()
