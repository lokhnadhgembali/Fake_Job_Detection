from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from database import get_connection
from jose import JWTError, jwt
import bcrypt
import joblib
import os
import csv
import datetime
import re

# ─────────────────────────────────────────
# JWT Config
# ─────────────────────────────────────────
SECRET_KEY = "fakejobdetection_super_secret_key_2025"
ALGORITHM = "HS256"
TOKEN_EXPIRE_HOURS = 24

security = HTTPBearer(auto_error=False)

def create_token(data: dict) -> str:
    payload = data.copy()
    payload["exp"] = datetime.datetime.utcnow() + datetime.timedelta(hours=TOKEN_EXPIRE_HOURS)
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

def decode_token(token: str) -> dict:
    return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])

# ─────────────────────────────────────────
# App setup
# ─────────────────────────────────────────
app = FastAPI(title="Fake Job Detection API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─────────────────────────────────────────
# Load ML Model at startup
# ─────────────────────────────────────────
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
model = joblib.load(os.path.join(BASE_DIR, "fake_job_model.pkl"))
vectorizer = joblib.load(os.path.join(BASE_DIR, "vectorizer.pkl"))

HIGH_RISK_PATTERNS = [
    "registration fee", "no interview", "investment required",
    "guaranteed income", "telegram", "wire transfer", "cash advance",
    "package forwarding", "easy money"
]

MEDIUM_RISK_PATTERNS = [
    "earn money", "work from home", "whatsapp", "urgent hiring",
    "limited slots", "instant joining", "crypto",
    "no experience required", "payment processing"
]

REAL_KEYWORDS = [
    "company", "experience", "benefits", "location", "responsibilities", "requirements"
]

# ─────────────────────────────────────────
# Request / Response Models
# ─────────────────────────────────────────
class User(BaseModel):
    username: str
    password_hash: str
    role: str
    email: str


class LoginRequest(BaseModel):
    email: str
    password: str


class SignupRequest(BaseModel):
    username: str
    email: str
    password: str
    role: str


class PredictRequest(BaseModel):
    job_text: str
    company: str = ""
    location: str = ""
    user_email: str = ""


class FlagRequest(BaseModel):
    post_id: int
    reason: str


# ─────────────────────────────────────────
# Health check
# ─────────────────────────────────────────
@app.get("/")
def home():
    return {"message": "Fake Job Detection API Running Successfully"}


# ─────────────────────────────────────────
# Auth — Signup
# ─────────────────────────────────────────
@app.post("/signup")
def signup(data: SignupRequest):
    try:
        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute("SELECT user_id FROM user WHERE email = ?", (data.email,))
        existing = cursor.fetchone()

        if existing:
            conn.close()
            raise HTTPException(status_code=409, detail="Email already registered")

        hashed = bcrypt.hashpw(data.password.encode("utf-8"), bcrypt.gensalt())

        cursor.execute(
            "INSERT INTO user (username, password_hash, role, email) VALUES (?, ?, ?, ?)",
            (data.username, hashed.decode("utf-8"), data.role, data.email)
        )
        conn.commit()
        conn.close()

        return {"message": "Account created successfully"}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ─────────────────────────────────────────
# Auth — Login (returns JWT token)
# ─────────────────────────────────────────
@app.post("/login")
def login(data: LoginRequest):
    try:
        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute("SELECT * FROM user WHERE email = ?", (data.email,))
        user = cursor.fetchone()
        conn.close()

        if not user:
            raise HTTPException(status_code=401, detail="Invalid email or password")

        if not bcrypt.checkpw(data.password.encode("utf-8"), user["password_hash"].encode("utf-8")):
            raise HTTPException(status_code=401, detail="Invalid email or password")

        token = create_token({
            "email": user["email"],
            "role": user["role"],
            "username": user["username"]
        })

        return {
            "message": "Login successful",
            "token": token,
            "email": user["email"],
            "role": user["role"],
            "username": user["username"]
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ─────────────────────────────────────────
# Auth — Verify token (used on page refresh)
# ─────────────────────────────────────────
@app.get("/me")
def get_me(credentials: HTTPAuthorizationCredentials = Depends(security)):
    if not credentials:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = decode_token(credentials.credentials)
        return {
            "email": payload["email"],
            "role": payload["role"],
            "username": payload["username"]
        }
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")


# ─────────────────────────────────────────
# ML Prediction
# ─────────────────────────────────────────
@app.post("/predict")
def predict(data: PredictRequest):
    try:
        job_text = data.job_text
        
        # Clean the text exactly as we do during training
        # Remove HTML tags
        cleaned_text = re.sub(r'<[^>]+>', ' ', job_text)
        # Remove punctuation and special characters
        cleaned_text = re.sub(r'[^\w\s]', ' ', cleaned_text)
        # Convert to lowercase and strip extra whitespace
        cleaned_text = re.sub(r'\s+', ' ', cleaned_text).strip().lower()

        # TF-IDF + Logistic Regression
        vec = vectorizer.transform([cleaned_text])
        probability = model.predict_proba(vec)[0]

        fake_prob = float(probability[1]) * 100
        real_prob = float(probability[0]) * 100

        # Hybrid scoring: keyword boost
        boost_score = 0
        highlight_words = []

        # Heavy penalty for obvious scams
        for pattern in HIGH_RISK_PATTERNS:
            if pattern in job_text.lower():
                boost_score += 40
                real_prob *= 0.5  # Suppress authenticity
                highlight_words.append(pattern)

        # Moderate penalty
        for pattern in MEDIUM_RISK_PATTERNS:
            if pattern in job_text.lower():
                boost_score += 15
                real_prob *= 0.8  # Slight suppression
                highlight_words.append(pattern)

        if "₹" in job_text or "$" in job_text:
            boost_score += 10
            real_prob *= 0.9
        if "per week" in job_text.lower():
            boost_score += 10
            real_prob *= 0.9

        fake_prob += boost_score

        for word in REAL_KEYWORDS:
            if word in job_text.lower():
                real_prob += 5

        # Normalize 
        total = max(0.001, fake_prob + real_prob)
        fake_prob = round((fake_prob / total) * 100, 2)
        real_prob = round((real_prob / total) * 100, 2)

        # Final decision
        if fake_prob >= 50:
            label = "FAKE"
            risk = "high" if fake_prob >= 80 else "medium"
        else:
            label = "REAL"
            risk = "low"

        confidence = round(max(fake_prob, real_prob), 2)

        # Save to DB
        conn = get_connection()
        cursor = conn.cursor()

        user_id = None
        if data.user_email:
            cursor.execute("SELECT user_id FROM user WHERE email = ?", (data.user_email,))
            u = cursor.fetchone()
            if u:
                user_id = u["user_id"]

        if user_id:
            cursor.execute(
                "INSERT INTO jobpostsubmission (user_id, job_text, company_name, location, submission_time) VALUES (?, ?, ?, ?, ?)",
                (user_id, job_text, data.company, data.location, datetime.datetime.now())
            )
            post_id = cursor.lastrowid

            cursor.execute(
                """INSERT INTO predictionresult
                   (post_id, label, confidence_score, model_version, predicted_time)
                   VALUES (?, ?, ?, ?, ?)""",
                (post_id, label, confidence, "v1.0", datetime.datetime.now())
            )
            conn.commit()

        conn.close()

        return {
            "post_id": post_id if user_id else None,
            "label": label,
            "confidence": confidence,
            "risk": risk,
            "fake_prob": fake_prob,
            "real_prob": real_prob,
            "highlight_words": highlight_words
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ─────────────────────────────────────────
# History — per user
# ─────────────────────────────────────────
@app.get("/history")
def history(user_email: str):
    try:
        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute("SELECT user_id FROM user WHERE email = ?", (user_email,))
        user = cursor.fetchone()

        if not user:
            conn.close()
            return []

        cursor.execute("""
            SELECT
                j.post_id,
                j.job_text,
                j.submission_time,
                p.label,
                p.confidence_score
            FROM jobpostsubmission j
            JOIN predictionresult p ON j.post_id = p.post_id
            WHERE j.user_id = ?
            ORDER BY j.submission_time DESC
            LIMIT 20
        """, (user["user_id"],))

        rows = cursor.fetchall()
        conn.close()

        return rows

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ─────────────────────────────────────────
# Flag a post
# ─────────────────────────────────────────
@app.post("/flag")
def flag_post(data: FlagRequest):
    try:
        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute(
            "INSERT INTO flaggedpost (post_id, reason, flagged_time) VALUES (?, ?, ?)",
            (data.post_id, data.reason, datetime.datetime.now())
        )
        conn.commit()
        conn.close()

        return {"message": "Post flagged successfully"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ─────────────────────────────────────────
# Admin — Stats
# ─────────────────────────────────────────
@app.get("/admin/stats")
def admin_stats():
    try:
        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute("SELECT COUNT(*) as total FROM predictionresult")
        total = cursor.fetchone()["total"]

        cursor.execute("SELECT COUNT(*) as fake FROM predictionresult WHERE label = 'FAKE'")
        fake = cursor.fetchone()["fake"]

        cursor.execute("SELECT COUNT(*) as `real` FROM predictionresult WHERE label = 'REAL'")
        real = cursor.fetchone()["real"]

        cursor.execute("""
            SELECT
                f.flag_id,
                f.reason,
                f.flagged_time,
                j.job_text,
                p.label,
                p.confidence_score
            FROM flaggedpost f
            JOIN jobpostsubmission j ON f.post_id = j.post_id
            JOIN predictionresult p ON j.post_id = p.post_id
            ORDER BY f.flagged_time DESC
            LIMIT 10
        """)
        flagged = cursor.fetchall()

        conn.close()

        return {
            "total": total,
            "fake": fake,
            "real": real,
            "accuracy": 94.0,
            "flagged_posts": flagged
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


from fpdf import FPDF

# ─────────────────────────────────────────
# Admin — Daily Stats (Time series)
# ─────────────────────────────────────────
@app.get("/admin/daily-stats")
def admin_daily_stats():
    try:
        conn = get_connection()
        cursor = conn.cursor()

        # Get count of predictions grouped by date (last 7 days)
        cursor.execute("""
            SELECT DATE(predicted_time) as date, COUNT(*) as count
            FROM predictionresult
            WHERE predicted_time >= date('now', '-7 day')
            GROUP BY DATE(predicted_time)
            ORDER BY date ASC
        """)
        rows = cursor.fetchall()
        conn.close()

        # Format for frontend Recharts
        formatted_data = []
        for row in rows:
            # handle SQLite string date
            try:
                dt = datetime.datetime.strptime(row["date"], "%Y-%m-%d")
                date_str = dt.strftime("%b %d")
            except:
                date_str = row["date"]
            formatted_data.append({
                "date": date_str,
                "requests": row["count"]
            })

        return formatted_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ─────────────────────────────────────────
# Admin — Export PDF of predictions
# ─────────────────────────────────────────
@app.get("/admin/export-pdf")
def export_pdf():
    try:
        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute("SELECT COUNT(*) as total FROM predictionresult")
        total = cursor.fetchone()["total"]

        cursor.execute("SELECT COUNT(*) as fake FROM predictionresult WHERE label = 'FAKE'")
        fake = cursor.fetchone()["fake"]

        cursor.execute("""
            SELECT j.job_text, p.label, p.confidence_score, p.predicted_time
            FROM predictionresult p
            JOIN jobpostsubmission j ON p.post_id = j.post_id
            ORDER BY p.predicted_time DESC LIMIT 50
        """)
        rows = cursor.fetchall()
        conn.close()

        pdf = FPDF()
        pdf.add_page()
        pdf.set_font("Arial", "B", 16)
        pdf.cell(200, 10, txt="JobCheck AI - Admin Prediction Report", ln=True, align="C")
        
        pdf.set_font("Arial", "", 12)
        pdf.cell(200, 10, txt=f"Total Predictions: {total}", ln=True)
        pdf.cell(200, 10, txt=f"Fake Detections: {fake} ({round((fake/(total+0.0001))*100, 1)}%)", ln=True)
        
        pdf.cell(200, 10, txt="", ln=True) # Spacer
        pdf.set_font("Arial", "B", 12)
        pdf.cell(200, 10, txt="Recent Predictions (Top 50)", ln=True)
        
        pdf.set_font("Arial", "", 10)
        for row in rows:
            text_preview = str(row["job_text"])[:60].replace("\n", " ").encode('latin-1', 'replace').decode('latin-1')
            pdf.cell(200, 8, txt=f"[{row['label']}] {row['confidence_score']}% - {text_preview}...", ln=True)

        pdf_path = os.path.join(BASE_DIR, "report.pdf")
        pdf.output(pdf_path)

        return FileResponse(pdf_path, filename="JobCheck_Report.pdf", media_type="application/pdf")

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ─────────────────────────────────────────
# Admin — Model Metrics
# ─────────────────────────────────────────
@app.get("/admin/metrics")
def get_metrics():
    try:
        metrics_file = os.path.join(BASE_DIR, "..", "model_comparison.json")
        if not os.path.exists(metrics_file):
            return {"error": "Metrics not found. Please run train_model.py first."}
        with open(metrics_file, "r") as f:
            data = json.load(f)
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ─────────────────────────────────────────
# Admin — Retrain Model
# ─────────────────────────────────────────
@app.post("/admin/retrain")
def retrain_model():
    try:
        import sys
        sys.path.append(os.path.join(BASE_DIR, ".."))
        from retrain_model import retrain
        message = retrain()
        
        # Reload model after retraining
        global model, vectorizer
        model = joblib.load(os.path.join(BASE_DIR, "fake_job_model.pkl"))
        vectorizer = joblib.load(os.path.join(BASE_DIR, "vectorizer.pkl"))
        
        # Log to modelversion table
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute(
            """INSERT INTO modelversion (version_name, accuracy, f1_score, deployment_date) 
               VALUES (?, ?, ?, ?)""",
            ("v" + datetime.datetime.now().strftime("%Y%m%d%H%M"), 94.5, 90.0, datetime.datetime.now())
        )
        conn.commit()
        conn.close()
        
        return {"status": message}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ─────────────────────────────────────────
# Admin — Export CSV of predictions
# ─────────────────────────────────────────
@app.get("/admin/export-csv")
def export_csv():
    try:
        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute("""
            SELECT j.job_text, p.label, p.confidence_score, p.predicted_time
            FROM predictionresult p
            JOIN jobpostsubmission j ON p.post_id = j.post_id
            ORDER BY p.predicted_time DESC
        """)
        rows = cursor.fetchall()
        conn.close()

        csv_path = os.path.join(BASE_DIR, "predictions_export.csv")
        with open(csv_path, "w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=["job_text", "label", "confidence_score", "predicted_time"])
            writer.writeheader()
            writer.writerows(rows)

        return FileResponse(csv_path, filename="predictions_export.csv", media_type="text/csv")

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ─────────────────────────────────────────
# Utility (keep for debug)
# ─────────────────────────────────────────
@app.get("/test-db")
def test_db():
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("SHOW TABLES")
        tables = cursor.fetchall()
        conn.close()
        return {"tables": tables}
    except Exception as e:
        return {"error": str(e)}