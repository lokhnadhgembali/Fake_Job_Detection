import pandas as pd
import joblib
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report, accuracy_score

import re

# ==========================
# Load Dataset
# ==========================
df = pd.read_csv("fake_job_postings.csv")

# Fill missing values
df['title'] = df['title'].fillna("")
df['description'] = df['description'].fillna("")

# Combine title + description
df['text'] = df['title'] + " " + df['description']

def clean_text(text):
    # Remove HTML tags
    text = re.sub(r'<[^>]+>', ' ', text)
    # Remove punctuation and special characters
    text = re.sub(r'[^\w\s]', ' ', text)
    # Convert to lowercase and strip extra whitespace
    text = re.sub(r'\s+', ' ', text).strip().lower()
    return text

print("Cleaning text data...")
df['text'] = df['text'].apply(clean_text)

X = df['text']
y = df['fraudulent']

# ==========================
# TF-IDF Vectorization (Improved)
# ==========================
vectorizer = TfidfVectorizer(
    stop_words='english',
    max_features=30000,
    ngram_range=(1, 2)  # Unigrams + Bigrams
)

X_vec = vectorizer.fit_transform(X)

from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import classification_report, accuracy_score, precision_score, recall_score, f1_score
import json

# ==========================
# Stratified Train-Test Split
# ==========================
X_train, X_test, y_train, y_test = train_test_split(
    X_vec,
    y,
    test_size=0.2,
    random_state=42,
    stratify=y
)

# ==========================
# Train Models & Cross-Validation
# ==========================
models = {
    "Logistic Regression": LogisticRegression(class_weight='balanced', max_iter=1000),
    "Random Forest": RandomForestClassifier(n_estimators=100, class_weight='balanced', random_state=42, n_jobs=-1)
}

results = {}

for name, model in models.items():
    print(f"\nTraining {name}...")
    
    # 5-fold cross-validation for accuracy
    cv_scores = cross_val_score(model, X_train, y_train, cv=5, scoring='accuracy', n_jobs=-1)
    print(f"{name} 5-Fold CV Accuracy: {cv_scores.mean():.4f} (+/- {cv_scores.std() * 2:.4f})")
    
    # Fit on full training set
    model.fit(X_train, y_train)
    y_pred = model.predict(X_test)
    
    # Calculate metrics
    acc = accuracy_score(y_test, y_pred)
    prec = precision_score(y_test, y_pred)
    rec = recall_score(y_test, y_pred)
    f1 = f1_score(y_test, y_pred)
    
    results[name] = {
        "accuracy": round(acc * 100, 2),
        "precision": round(prec * 100, 2),
        "recall": round(rec * 100, 2),
        "f1_score": round(f1 * 100, 2),
        "cv_accuracy_mean": round(cv_scores.mean() * 100, 2)
    }
    
    print(f"🔥 {name} Test Accuracy: {results[name]['accuracy']}%\n")
    print(classification_report(y_test, y_pred))

# ==========================
# Save Comparison Results
# ==========================
with open("model_comparison.json", "w") as f:
    json.dump(results, f, indent=4)
print("✅ Saved model_comparison.json")

# ==========================
# Save Best Model (Choosing Logistic Regression for speed/size)
# ==========================
best_model = models["Logistic Regression"]
joblib.dump(best_model, "fake_job_model.pkl")
joblib.dump(vectorizer, "vectorizer.pkl")

print("✅ Best model and vectorizer saved successfully!")