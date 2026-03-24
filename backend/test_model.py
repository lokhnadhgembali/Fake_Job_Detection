import joblib

# Load model and vectorizer
model = joblib.load("fake_job_model.pkl")
vectorizer = joblib.load("vectorizer.pkl")

# Example job description
text = "Urgent hiring! Pay registration fee to get job."

# Transform text
vec = vectorizer.transform([text])

# Predict
prediction = model.predict(vec)[0]

if prediction == 1:
    print("Fake Job")
else:
    print("Real Job")
