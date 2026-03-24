import requests
import json
import time

BASE_URL = "http://localhost:8000"

print("🔥 Generating sample data...")

# 0. Register user first (fails silently if already exists)
register_data = {
    "username": "admin",
    "email": "admin@jobcheck.com",
    "password": "adminpassword",
    "role": "admin"
}
try:
    requests.post(f"{BASE_URL}/signup", json=register_data)
except:
    pass

# 1. Login to get a token
login_data = {
    "email": "admin@jobcheck.com",
    "password": "adminpassword"
}
try:
    print("1. Logging in...")
    resp = requests.post(f"{BASE_URL}/login", json=login_data)
    token = resp.json().get("access_token")
    headers = {"Authorization": f"Bearer {token}"}
except Exception as e:
    print("Failed to login. Please ensure admin@jobcheck.com exists:", e)
    token = None
    headers = {}

if token:
    print("✅ Logged in successfully!")

    # 2. Make some real predictions
    print("\n2. Simulating User Predictions...")
    
    real_job = "We are looking for a highly skilled Software Engineer with 5 years experience in Python and React. Great benefits and remote work options available."
    fake_job = "Earn $5000 a week working from home! No experience required! Just pay a $50 registration fee and start immediately. Guaranteed income!"
    another_real = "Data Scientist needed. Must know SQL, Python, and Machine Learning. Master's degree preferred. Apply via our corporate portal."
    another_fake = "URGENT hiring! Cash paid daily. Need bank account details up front for direct deposit. No interview needed."

    jobs = [real_job, fake_job, another_real, another_fake]
    
    for i, job in enumerate(jobs):
        print(f"   Predicting job {i+1}...")
        resp = requests.post(f"{BASE_URL}/predict", json={"job_text": job}, headers=headers)
        time.sleep(1) # stagger times slightly
        
    # 3. Flag a post
    print("\n3. Flagging a suspicious post...")
    # Get the history to find a post_id
    history_resp = requests.get(f"{BASE_URL}/history", headers=headers)
    history = history_resp.json()
    
    if history and isinstance(history, list) and len(history) > 0:
        post_id = history[0].get("post_id")
        if post_id:
            flag_req = {
                "post_id": post_id,
                "reason": "Asked for money upfront"
            }
            requests.post(f"{BASE_URL}/flag", json=flag_req, headers=headers)
            print("   ✅ Post flagged successfully!")

    # 4. Trigger Retrain (Populates modelversion table)
    print("\n4. Triggering Model Retrain...")
    try:
        retrain_resp = requests.post(f"{BASE_URL}/admin/retrain", headers=headers)
        print("   ✅ Retrain triggered successfully!")
    except Exception as e:
        print("   Retrain error:", e)

    print("\n🎉 Sample data generation complete! Check the Admin Dashboard.")
else:
    print("Data generation aborted due to missing token.")
