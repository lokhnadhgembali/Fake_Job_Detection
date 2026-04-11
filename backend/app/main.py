from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, RedirectResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from .database import get_connection
from jose import JWTError, jwt
import bcrypt
import joblib
import os
import csv
import datetime
import re
import httpx
from dotenv import load_dotenv

# Load .env from same directory as this file
load_dotenv(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env"))

# ─────────────────────────────────────────
# OAuth Config (from .env)
# ─────────────────────────────────────────
GOOGLE_CLIENT_ID     = os.getenv("GOOGLE_CLIENT_ID", "")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET", "")
GITHUB_CLIENT_ID     = os.getenv("GITHUB_CLIENT_ID", "")
GITHUB_CLIENT_SECRET = os.getenv("GITHUB_CLIENT_SECRET", "")
LINKEDIN_CLIENT_ID   = os.getenv("LINKEDIN_CLIENT_ID", "")
LINKEDIN_CLIENT_SECRET = os.getenv("LINKEDIN_CLIENT_SECRET", "")
FRONTEND_URL         = os.getenv("FRONTEND_URL", "http://localhost:3000")

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


# ═══════════════════════════════════════════════════════════════
# OAUTH HELPERS - DISABLED (OAuth callback feature removed)
# ═══════════════════════════════════════════════════════════════

# def _upsert_oauth_user(email: str, username: str, provider: str) -> dict:
#     """Find or create a user that signed in via OAuth. Returns user dict."""
#     conn = get_connection()
#     cursor = conn.cursor()
#     cursor.execute("SELECT * FROM user WHERE email = ?", (email,))
#     user = cursor.fetchone()
#     if not user:
#         # Auto-register: no password (OAuth users never set one)
#         cursor.execute(
#             "INSERT INTO user (username, password_hash, role, email) VALUES (?, ?, ?, ?)",
#             (username, "", "user", email)
#         )
#         conn.commit()
#         cursor.execute("SELECT * FROM user WHERE email = ?", (email,))
#         user = cursor.fetchone()
#     conn.close()
#     return {
#         "email": user["email"],
#         "role": user["role"],
#         "username": user["username"],
#     }
#
#
# def _oauth_success_redirect(user_data: dict) -> RedirectResponse:
#     """Issue a JWT and redirect to the frontend /auth/callback page."""
#     token = create_token(user_data)
#     import urllib.parse
#     params = urllib.parse.urlencode({
#         "token": token,
#         "email": user_data["email"],
#         "role": user_data["role"],
#         "username": user_data["username"],
#     })
#     return RedirectResponse(url=f"{FRONTEND_URL}/auth/callback?{params}")
#
#
# def _oauth_error_redirect(msg: str) -> RedirectResponse:
#     import urllib.parse
#     return RedirectResponse(url=f"{FRONTEND_URL}/login?error={urllib.parse.quote(msg)}")


# ═══════════════════════════════════════════════════════════════
# GOOGLE OAUTH - DISABLED (OAuth callback feature removed)
# ═══════════════════════════════════════════════════════════════

# GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth"
# GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
# GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo"
# GOOGLE_REDIRECT_URI = "http://localhost:8000/auth/google/callback"
#
# @app.get("/auth/google")
# def auth_google():
#     if not GOOGLE_CLIENT_ID:
#         return _oauth_error_redirect("Google OAuth not configured. Please set GOOGLE_CLIENT_ID in .env")
#     import urllib.parse
#     params = urllib.parse.urlencode({
#         "client_id": GOOGLE_CLIENT_ID,
#         "redirect_uri": GOOGLE_REDIRECT_URI,
#         "response_type": "code",
#         "scope": "openid email profile",
#         "access_type": "offline",
#         "prompt": "select_account",
#     })
#     return RedirectResponse(url=f"{GOOGLE_AUTH_URL}?{params}")
#
#
# @app.get("/auth/google/callback")
# async def auth_google_callback(code: str = None, error: str = None):
#     if error or not code:
#         return _oauth_error_redirect(error or "Google login cancelled")
#     try:
#         async with httpx.AsyncClient() as client:
#             # Exchange code for tokens
#             token_resp = await client.post(GOOGLE_TOKEN_URL, data={
#                 "code": code,
#                 "client_id": GOOGLE_CLIENT_ID,
#                 "client_secret": GOOGLE_CLIENT_SECRET,
#                 "redirect_uri": GOOGLE_REDIRECT_URI,
#                 "grant_type": "authorization_code",
#             })
#             token_resp.raise_for_status()
#             access_token = token_resp.json()["access_token"]
#
#             # Fetch user info
#             user_resp = await client.get(
#                 GOOGLE_USERINFO_URL,
#                 headers={"Authorization": f"Bearer {access_token}"}
#             )
#             user_resp.raise_for_status()
#             info = user_resp.json()
#
#         email = info.get("email", "")
#         name  = info.get("name") or email.split("@")[0]
#         if not email:
#             return _oauth_error_redirect("Google did not return an email address")
#
#         user_data = _upsert_oauth_user(email, name, "google")
#         return _oauth_success_redirect(user_data)
#     except Exception as e:
#         return _oauth_error_redirect(f"Google login failed: {str(e)}")


# ═══════════════════════════════════════════════════════════════
# GITHUB OAUTH - DISABLED (OAuth callback feature removed)
# ═══════════════════════════════════════════════════════════════

# GITHUB_AUTH_URL = "https://github.com/login/oauth/authorize"
# GITHUB_TOKEN_URL = "https://github.com/login/oauth/access_token"
# GITHUB_USER_URL = "https://api.github.com/user"
# GITHUB_EMAIL_URL = "https://api.github.com/user/emails"
# GITHUB_REDIRECT_URI = "http://localhost:8000/auth/github/callback"
#
# @app.get("/auth/github")
# def auth_github():
#     if not GITHUB_CLIENT_ID:
#         return _oauth_error_redirect("GitHub OAuth not configured. Please set GITHUB_CLIENT_ID in .env")
#     import urllib.parse
#     params = urllib.parse.urlencode({
#         "client_id": GITHUB_CLIENT_ID,
#         "redirect_uri": GITHUB_REDIRECT_URI,
#         "scope": "read:user user:email",
#     })
#     return RedirectResponse(url=f"{GITHUB_AUTH_URL}?{params}")
#
#
# @app.get("/auth/github/callback")
# async def auth_github_callback(code: str = None, error: str = None):
#     if error or not code:
#         return _oauth_error_redirect(error or "GitHub login cancelled")
#     try:
#         async with httpx.AsyncClient() as client:
#             # Exchange code for access token
#             token_resp = await client.post(
#                 GITHUB_TOKEN_URL,
#                 data={
#                     "client_id": GITHUB_CLIENT_ID,
#                     "client_secret": GITHUB_CLIENT_SECRET,
#                     "code": code,
#                     "redirect_uri": GITHUB_REDIRECT_URI,
#                 },
#                 headers={"Accept": "application/json"},
#             )
#             token_resp.raise_for_status()
#             access_token = token_resp.json().get("access_token", "")
#             if not access_token:
#                 return _oauth_error_redirect("GitHub did not return an access token")
#
#             auth_header = {"Authorization": f"Bearer {access_token}"}
#
#             # Fetch user profile
#             user_resp = await client.get(GITHUB_USER_URL, headers=auth_header)
#             user_resp.raise_for_status()
#             user_info = user_resp.json()
#
#             # Fetch primary email (may be private)
#             email = user_info.get("email")
#             if not email:
#                 email_resp = await client.get(GITHUB_EMAIL_URL, headers=auth_header)
#                 email_resp.raise_for_status()
#                 emails = email_resp.json()
#                 primary = next((e for e in emails if e.get("primary") and e.get("verified")), None)
#                 email = primary["email"] if primary else (emails[0]["email"] if emails else None)
#
#         if not email:
#             return _oauth_error_redirect("GitHub did not return an email address")
#
#         username = user_info.get("login") or email.split("@")[0]
#         user_data = _upsert_oauth_user(email, username, "github")
#         return _oauth_success_redirect(user_data)
#     except Exception as e:
#         return _oauth_error_redirect(f"GitHub login failed: {str(e)}")


# ═══════════════════════════════════════════════════════════════
# LINKEDIN OAUTH - DISABLED (OAuth callback feature removed)
# ═══════════════════════════════════════════════════════════════

# LINKEDIN_AUTH_URL = "https://www.linkedin.com/oauth/v2/authorization"
# LINKEDIN_TOKEN_URL = "https://www.linkedin.com/oauth/v2/accessToken"
# LINKEDIN_USER_URL = "https://api.linkedin.com/v2/userinfo"
# LINKEDIN_REDIRECT_URI = "http://localhost:8000/auth/linkedin/callback"
#
# @app.get("/auth/linkedin")
# def auth_linkedin():
#     if not LINKEDIN_CLIENT_ID:
#         return _oauth_error_redirect("LinkedIn OAuth not configured. Please set LINKEDIN_CLIENT_ID in .env")
#     import urllib.parse
#     params = urllib.parse.urlencode({
#         "response_type": "code",
#         "client_id": LINKEDIN_CLIENT_ID,
#         "redirect_uri": LINKEDIN_REDIRECT_URI,
#         "scope": "openid profile email",
#     })
#     return RedirectResponse(url=f"{LINKEDIN_AUTH_URL}?{params}")
#
#
# @app.get("/auth/linkedin/callback")
# async def auth_linkedin_callback(code: str = None, error: str = None):
#     if error or not code:
#         return _oauth_error_redirect(error or "LinkedIn login cancelled")
#     try:
#         async with httpx.AsyncClient() as client:
#             # Exchange code for access token
#             token_resp = await client.post(
#                 LINKEDIN_TOKEN_URL,
#                 data={
#                     "grant_type": "authorization_code",
#                     "code": code,
#                     "redirect_uri": LINKEDIN_REDIRECT_URI,
#                     "client_id": LINKEDIN_CLIENT_ID,
#                     "client_secret": LINKEDIN_CLIENT_SECRET,
#                 },
#                 headers={"Content-Type": "application/x-www-form-urlencoded"}
#             )
#             token_resp.raise_for_status()
#             access_token = token_resp.json().get("access_token", "")
#             if not access_token:
#                 return _oauth_error_redirect("LinkedIn did not return an access token")
#
#             # Fetch user info via OpenID Connect userinfo endpoint
#             user_resp = await client.get(
#                 LINKEDIN_USER_URL,
#                 headers={"Authorization": f"Bearer {access_token}"}
#             )
#             user_resp.raise_for_status()
#             info = user_resp.json()
#
#         email = info.get("email", "")
#         name  = info.get("name") or info.get("given_name", "") or email.split("@")[0]
#         if not email:
#             return _oauth_error_redirect("LinkedIn did not return an email address")
#
#         user_data = _upsert_oauth_user(email, name, "linkedin")
#         return _oauth_success_redirect(user_data)
#     except Exception as e:
#         return _oauth_error_redirect(f"LinkedIn login failed: {str(e)}")


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
        # Fetch profile_pic from DB
        profile_pic = ""
        try:
            conn = get_connection()
            cursor = conn.cursor()
            cursor.execute("SELECT profile_pic FROM user WHERE email = ?", (payload["email"],))
            row = cursor.fetchone()
            if row and row["profile_pic"]:
                profile_pic = row["profile_pic"]
            conn.close()
        except Exception:
            pass
        return {
            "email": payload["email"],
            "role": payload["role"],
            "username": payload["username"],
            "profile_pic": profile_pic
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

        cursor.execute("SELECT COUNT(*) as cnt FROM user")
        user_count = cursor.fetchone()["cnt"]

        cursor.execute("SELECT COUNT(*) as cnt FROM flaggedpost")
        flagged_count = cursor.fetchone()["cnt"]

        cursor.execute("SELECT COUNT(*) as cnt FROM flaggedpost WHERE reviewed = 0")
        pending_review = cursor.fetchone()["cnt"]

        fake_pct = round((fake / total * 100), 1) if total > 0 else 0

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
            "user_count": user_count,
            "flagged_count": flagged_count,
            "pending_review": pending_review,
            "fake_percent": fake_pct,
            "flagged_posts": flagged
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))



# ─────────────────────────────────────────
# Admin — User Distribution (donut chart)
# ─────────────────────────────────────────
@app.get("/admin/user-distribution")
def admin_user_distribution():
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT role, COUNT(*) as count FROM user GROUP BY role")
        rows = cursor.fetchall()
        conn.close()
        return [{"name": row["role"].capitalize(), "value": row["count"]} for row in rows]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ─────────────────────────────────────────
# Admin — Prediction Trends (grouped bar)
# ─────────────────────────────────────────
@app.get("/admin/prediction-trends")
def admin_prediction_trends():
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT DATE(predicted_time) as date,
                   COUNT(*) as total,
                   SUM(CASE WHEN label = 'FAKE' THEN 1 ELSE 0 END) as fake
            FROM predictionresult
            WHERE predicted_time >= date('now', '-30 day')
            GROUP BY DATE(predicted_time)
            ORDER BY date ASC
        """)
        rows = cursor.fetchall()
        conn.close()

        formatted = []
        for row in rows:
            try:
                dt = datetime.datetime.strptime(row["date"], "%Y-%m-%d")
                date_str = dt.strftime("%b %d")
            except:
                date_str = row["date"]
            formatted.append({
                "date": date_str,
                "total": row["total"],
                "fake": row["fake"],
            })
        return formatted
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ─────────────────────────────────────────
# Admin — Recent Activity Feed
# ─────────────────────────────────────────
@app.get("/admin/recent-activity")
def admin_recent_activity():
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT
                j.post_id,
                u.email   AS user_email,
                p.label,
                p.confidence_score,
                j.submission_time,
                SUBSTR(j.job_text, 1, 120) AS preview
            FROM jobpostsubmission j
            JOIN predictionresult  p ON j.post_id = p.post_id
            LEFT JOIN user         u ON j.user_id  = u.user_id
            ORDER BY j.submission_time DESC
            LIMIT 20
        """)
        rows = cursor.fetchall()
        conn.close()
        return [dict(r) for r in rows]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ─────────────────────────────────────────
# Admin — List all users
# ─────────────────────────────────────────
@app.get("/admin/users")
def admin_users():
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT user_id AS id, username, email, role, '' AS created_at
            FROM user
            ORDER BY user_id DESC
        """)
        rows = cursor.fetchall()
        conn.close()
        return [dict(r) for r in rows]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ─────────────────────────────────────────
# Admin — Change user role
# ─────────────────────────────────────────
class RoleUpdateRequest(BaseModel):
    role: str

@app.put("/admin/users/{user_id}/role")
def admin_update_role(user_id: int, data: RoleUpdateRequest):
    try:
        if data.role not in ("admin", "user"):
            raise HTTPException(status_code=400, detail="Role must be 'admin' or 'user'")
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("UPDATE user SET role = ? WHERE user_id = ?", (data.role, user_id))
        conn.commit()
        conn.close()
        return {"message": "Role updated successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ─────────────────────────────────────────
# Admin — Flagged posts list
# ─────────────────────────────────────────
@app.get("/admin/flagged")
def admin_flagged():
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT
                j.post_id,
                j.job_text,
                p.label,
                p.confidence_score,
                j.submission_time,
                u.email AS user_email,
                COALESCE(f.reviewed, 0) AS reviewed
            FROM flaggedpost f
            JOIN jobpostsubmission j ON f.post_id  = j.post_id
            JOIN predictionresult  p ON j.post_id  = p.post_id
            LEFT JOIN user         u ON j.user_id  = u.user_id
            ORDER BY j.submission_time DESC
            LIMIT 50
        """)
        rows = cursor.fetchall()
        conn.close()
        return [dict(r) for r in rows]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ─────────────────────────────────────────
# Admin — Mark flagged post as reviewed
# ─────────────────────────────────────────
@app.put("/admin/flagged/{post_id}/review")
def admin_review_flagged(post_id: int):
    try:
        conn = get_connection()
        cursor = conn.cursor()
        # Upsert: if a flaggedpost row exists update it, otherwise insert
        cursor.execute("SELECT flag_id FROM flaggedpost WHERE post_id = ?", (post_id,))
        existing = cursor.fetchone()
        if existing:
            cursor.execute("UPDATE flaggedpost SET reviewed = 1 WHERE post_id = ?", (post_id,))
        else:
            cursor.execute(
                "INSERT INTO flaggedpost (post_id, reason, flagged_time, reviewed) VALUES (?, ?, ?, ?)",
                (post_id, "admin_review", datetime.datetime.now(), 1)
            )
        conn.commit()
        conn.close()
        return {"message": "Post marked as reviewed"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ─────────────────────────────────────────
# Admin — Delete flagged post
# ─────────────────────────────────────────
@app.delete("/admin/flagged/{post_id}")
def admin_delete_flagged(post_id: int):
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM flaggedpost       WHERE post_id = ?", (post_id,))
        cursor.execute("DELETE FROM predictionresult  WHERE post_id = ?", (post_id,))
        cursor.execute("DELETE FROM jobpostsubmission WHERE post_id = ?", (post_id,))
        conn.commit()
        conn.close()
        return {"message": "Post deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ─────────────────────────────────────────
# Admin — Keyword / threat statistics
# ─────────────────────────────────────────
SCAM_KEYWORDS = [
    "work from home", "no experience needed", "guaranteed income",
    "registration fee", "urgent hiring", "earn per day",
    "send bank details", "100% genuine", "unlimited earnings",
    "investment required",
]

@app.get("/admin/keyword-stats")
def admin_keyword_stats():
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT j.job_text FROM jobpostsubmission j
            JOIN predictionresult p ON j.post_id = p.post_id
            WHERE p.label = 'FAKE'
        """)
        rows = cursor.fetchall()
        conn.close()

        counts = {kw: 0 for kw in SCAM_KEYWORDS}
        for row in rows:
            text = (row["job_text"] or "").lower()
            for kw in SCAM_KEYWORDS:
                if kw in text:
                    counts[kw] += 1

        result = [{"keyword": k, "count": v} for k, v in counts.items() if v > 0]
        result.sort(key=lambda x: x["count"], reverse=True)
        return result if result else [{"keyword": kw, "count": 0} for kw in SCAM_KEYWORDS[:5]]
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

        # Get count of predictions grouped by date and label (last 7 days)
        cursor.execute("""
            SELECT DATE(predicted_time) as date,
                   COUNT(*) as total,
                   SUM(CASE WHEN label = 'FAKE' THEN 1 ELSE 0 END) as fake,
                   SUM(CASE WHEN label = 'REAL' THEN 1 ELSE 0 END) as real
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
                "requests": row["total"],
                "fake": row["fake"],
                "real": row["real"],
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


# ─────────────────────────────────────────
# Profile — get current user profile
# ─────────────────────────────────────────
import shutil
from fastapi import UploadFile, File

@app.get("/profile")
def get_profile(credentials: HTTPAuthorizationCredentials = Depends(security)):
    if not credentials:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = decode_token(credentials.credentials)
        email = payload["email"]
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT username, email, role, bio, profession, linkedin, github, website, profile_pic FROM user WHERE email = ?",
        (email,)
    )
    user = cursor.fetchone()
    conn.close()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return {
        "username": user["username"],
        "email": user["email"],
        "role": user["role"],
        "bio": user["bio"] or "",
        "profession": user["profession"] or "",
        "linkedin": user["linkedin"] or "",
        "github": user["github"] or "",
        "website": user["website"] or "",
        "profile_pic": user["profile_pic"] or "",
    }


class ProfileUpdateRequest(BaseModel):
    bio: str = ""
    profession: str = ""
    linkedin: str = ""
    github: str = ""
    website: str = ""


# ─────────────────────────────────────────
# Profile — update bio / social links
# ─────────────────────────────────────────
@app.put("/profile")
def update_profile(data: ProfileUpdateRequest, credentials: HTTPAuthorizationCredentials = Depends(security)):
    if not credentials:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = decode_token(credentials.credentials)
        email = payload["email"]
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        """UPDATE user SET bio=?, profession=?, linkedin=?, github=?, website=?
           WHERE email=?""",
        (data.bio, data.profession, data.linkedin, data.github, data.website, email)
    )
    conn.commit()
    conn.close()
    return {"message": "Profile updated successfully"}


# ─────────────────────────────────────────
# Profile — upload profile picture
# ─────────────────────────────────────────
UPLOAD_DIR = os.path.join(BASE_DIR, "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

from fastapi import Form
from fastapi.staticfiles import StaticFiles
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

@app.post("/profile/picture")
async def upload_profile_picture(
    file: UploadFile = File(...),
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    if not credentials:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = decode_token(credentials.credentials)
        email = payload["email"]
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    # Only allow image files
    allowed = {"image/jpeg", "image/png", "image/gif", "image/webp"}
    if file.content_type not in allowed:
        raise HTTPException(status_code=400, detail="Only image files are allowed (jpg, png, gif, webp)")

    # Save file with user's email as filename to avoid collisions
    ext = file.filename.split(".")[-1] if "." in file.filename else "jpg"
    safe_email = email.replace("@", "_at_").replace(".", "_")
    filename = f"{safe_email}.{ext}"
    file_path = os.path.join(UPLOAD_DIR, filename)

    with open(file_path, "wb") as f:
        shutil.copyfileobj(file.file, f)

    pic_url = f"/uploads/{filename}"

    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE user SET profile_pic=? WHERE email=?", (pic_url, email))
    conn.commit()
    conn.close()

    return {"profile_pic": pic_url, "message": "Profile picture updated"}


# ─────────────────────────────────────────
# Admin — List all users
# ─────────────────────────────────────────
@app.get("/admin/users")
def admin_list_users(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = decode_token(credentials.credentials)
        if payload.get("role") != "admin":
            raise HTTPException(status_code=403, detail="Admin only")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT id, username, email, role,
               COALESCE(created_at, '') as created_at
        FROM user ORDER BY id ASC
    """)
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]


# ─────────────────────────────────────────
# Admin — Change user role
# ─────────────────────────────────────────
@app.put("/admin/users/{user_id}/role")
def admin_change_role(
    user_id: int,
    body: dict,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    try:
        payload = decode_token(credentials.credentials)
        if payload.get("role") != "admin":
            raise HTTPException(status_code=403, detail="Admin only")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    new_role = body.get("role")
    if new_role not in ("user", "admin"):
        raise HTTPException(status_code=400, detail="Role must be 'user' or 'admin'")
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE user SET role=? WHERE id=?", (new_role, user_id))
    conn.commit()
    conn.close()
    return {"message": f"User {user_id} role updated to {new_role}"}


# ─────────────────────────────────────────
# Admin — List flagged posts
# ─────────────────────────────────────────
@app.get("/admin/flagged")
def admin_flagged(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = decode_token(credentials.credentials)
        if payload.get("role") != "admin":
            raise HTTPException(status_code=403, detail="Admin only")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT p.post_id, p.job_text, p.label, p.confidence_score,
               p.submission_time, p.user_email,
               COALESCE(p.reviewed, 0) as reviewed
        FROM predictionresult p
        WHERE p.label = 'FAKE'
        ORDER BY p.confidence_score DESC
        LIMIT 100
    """)
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]


# ─────────────────────────────────────────
# Admin — Mark flagged post as reviewed
# ─────────────────────────────────────────
@app.put("/admin/flagged/{post_id}/review")
def admin_review_flag(
    post_id: int,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    try:
        payload = decode_token(credentials.credentials)
        if payload.get("role") != "admin":
            raise HTTPException(status_code=403, detail="Admin only")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    conn = get_connection()
    cursor = conn.cursor()
    # Add reviewed column if it doesn't exist
    try:
        cursor.execute("ALTER TABLE predictionresult ADD COLUMN reviewed INTEGER DEFAULT 0")
        conn.commit()
    except Exception:
        pass
    cursor.execute("UPDATE predictionresult SET reviewed=1 WHERE post_id=?", (post_id,))
    conn.commit()
    conn.close()
    return {"message": f"Post {post_id} marked as reviewed"}


# ─────────────────────────────────────────
# Admin — Delete a flagged post
# ─────────────────────────────────────────
@app.delete("/admin/flagged/{post_id}")
def admin_delete_flag(
    post_id: int,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    try:
        payload = decode_token(credentials.credentials)
        if payload.get("role") != "admin":
            raise HTTPException(status_code=403, detail="Admin only")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM predictionresult WHERE post_id=?", (post_id,))
    conn.commit()
    conn.close()
    return {"message": f"Post {post_id} deleted"}


# ─────────────────────────────────────────
# Admin — Recent activity (last 15 scans)
# ─────────────────────────────────────────
@app.get("/admin/recent-activity")
def admin_recent_activity(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = decode_token(credentials.credentials)
        if payload.get("role") != "admin":
            raise HTTPException(status_code=403, detail="Admin only")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT post_id, user_email, label, confidence_score,
               submission_time,
               SUBSTR(job_text, 1, 80) as preview
        FROM predictionresult
        ORDER BY submission_time DESC
        LIMIT 15
    """)
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]


# ─────────────────────────────────────────
# Admin — Top scam keyword stats
# ─────────────────────────────────────────
SCAM_KEYWORDS = [
    "registration fee", "easy money", "work from home", "no experience",
    "telegram", "whatsapp", "wire transfer", "guaranteed income",
    "weekly pay", "training fee", "recruitment agency", "urgently hiring",
    "part time", "clickbank", "refer a friend"
]

@app.get("/admin/keyword-stats")
def admin_keyword_stats(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = decode_token(credentials.credentials)
        if payload.get("role") != "admin":
            raise HTTPException(status_code=403, detail="Admin only")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT job_text FROM predictionresult WHERE label='FAKE'")
    rows = cursor.fetchall()
    conn.close()

    all_text = " ".join((r["job_text"] or "").lower() for r in rows)
    result = []
    for kw in SCAM_KEYWORDS:
        count = all_text.count(kw)
        result.append({"keyword": kw, "count": count})
    result.sort(key=lambda x: x["count"], reverse=True)
    return result


# ─────────────────────────────────────────
# Admin — Retrain model (fixed)
# ─────────────────────────────────────────
@app.post("/admin/retrain")
def retrain_endpoint(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = decode_token(credentials.credentials)
        if payload.get("role") != "admin":
            raise HTTPException(status_code=403, detail="Admin only")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    import sys
    import importlib
    BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    if BASE not in sys.path:
        sys.path.insert(0, BASE)
    try:
        import retrain_model
        importlib.reload(retrain_model)
        result = retrain_model.retrain()
        # Reload the model in memory so predictions immediately use the new one
        global model, vectorizer
        model = joblib.load(os.path.join(BASE, "app", "fake_job_model.pkl"))
        vectorizer = joblib.load(os.path.join(BASE, "app", "vectorizer.pkl"))
        return {"message": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Retrain failed: {str(e)}")