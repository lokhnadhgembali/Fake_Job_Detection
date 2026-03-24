import pandas as pd
import joblib
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression

def retrain():

    # read logs
    data = []

    try:
        with open("prediction_logs.txt", "r", encoding="utf-8") as f:
            lines = f.readlines()

        for line in lines:
            parts = line.strip().split(" | ")

            if len(parts) >= 6:
                text = parts[5]
                label = parts[1]

                if label == "Fake Job":
                    data.append((text, 1))
                else:
                    data.append((text, 0))

    except:
        return "No training data found"

    if len(data) < 5:
        return "Not enough data to retrain"

    df = pd.DataFrame(data, columns=["text", "label"])

    vectorizer = TfidfVectorizer(stop_words="english")
    X = vectorizer.fit_transform(df["text"])
    y = df["label"]

    model = LogisticRegression()
    model.fit(X, y)

    joblib.dump(model, "fake_job_model.pkl")
    joblib.dump(vectorizer, "vectorizer.pkl")

    return "Model retrained successfully"