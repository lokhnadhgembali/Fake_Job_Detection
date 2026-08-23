# 🕵️ Fake Job Detection Platform

An AI-powered full-stack application for identifying potentially fraudulent job postings using **Natural Language Processing (NLP), Machine Learning, and rule-based suspicious-pattern detection**.

The project is designed to help job seekers and organizations identify risky listings faster and make safer hiring decisions.

## 🚀 Project Highlights

| Area | Details |
|---|---|
| 🤖 Machine Learning | Logistic Regression with TF-IDF features |
| 📚 Dataset | 18,000+ job postings |
| 🎯 Model Performance | 97.2% classification accuracy |
| 🧠 Detection | ML classification + rule-based risk scoring |
| ⚡ Goal | Faster identification of suspicious job postings |
| 🔐 Security | JWT authentication + Bcrypt password hashing |
| 🌐 Frontend | Next.js, React, TypeScript, Tailwind CSS |
| ⚙️ Backend | FastAPI, SQLAlchemy, REST APIs |
| 🗄️ Database | SQLite / MySQL-compatible architecture |

## 🎯 What This Project Does

The platform analyzes job-posting information and looks for signals associated with fraudulent listings. It combines machine-learning predictions with additional suspicious-pattern checks to provide a practical risk assessment.

### Detection Flow

```text
Job Posting
     ↓
Text Preprocessing
     ↓
TF-IDF Feature Extraction
     ↓
Logistic Regression Model
     ↓
Rule-Based Suspicious Pattern Checks
     ↓
Risk / Fraud Assessment
     ↓
User-Friendly Result
```

## 🧩 Main Features

- 🔎 Fake job-post detection using NLP and machine learning
- 📝 Text classification using TF-IDF
- 🤖 Logistic Regression prediction engine
- 🚨 Rule-based suspicious-pattern detection
- 🔐 JWT-based authentication
- 🔑 Secure password hashing with Bcrypt
- 📊 Administrative monitoring and activity tracking
- 📱 Responsive web interface
- ⚡ RESTful backend APIs
- 🗃️ Database-backed application architecture

## 🛠️ Tech Stack

### Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS
- Framer Motion

### Backend

- Python
- FastAPI
- SQLAlchemy
- REST APIs
- JWT Authentication
- Bcrypt

### Machine Learning

- Scikit-learn
- TF-IDF
- Logistic Regression
- Text preprocessing
- Rule-based scoring

### Database & Deployment

- SQLite
- MySQL-compatible database design
- Render deployment configuration

## 📂 Project Structure

```text
Fake_Job_Detection/
├── backend/          # API, authentication, ML and database logic
├── frontend/         # Next.js application and user interface
├── render.yaml       # Deployment configuration
└── README.md
```

## 📈 Why I Built This

Fake job postings can waste applicants' time and expose them to scams, phishing attempts, and financial risks. This project explores how **machine learning and secure full-stack development can be combined to address a real-world problem**.

The project also gave me hands-on experience in:

- Building an end-to-end ML application
- Working with NLP and text classification
- Designing backend APIs
- Connecting ML workflows with application logic
- Implementing authentication and security
- Managing databases
- Developing a responsive frontend
- Preparing a project for deployment

## 🔬 Future Improvements

- 🌍 Add multilingual job-post analysis
- 🧠 Experiment with transformer-based NLP models
- 📊 Add explainable AI for prediction reasoning
- 🛡️ Improve scam-pattern detection with continuously updated rules
- 📡 Add external job-source monitoring
- 📈 Build richer analytics for fraud trends

## 👨‍💻 Author

**Gembali Lokhnadh**  
Computer Science Engineering | Data Analytics | AI/ML | Software Development

[![GitHub](https://img.shields.io/badge/GitHub-lokhnadhgembali-181717?style=for-the-badge&logo=github)](https://github.com/lokhnadhgembali)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Lokhnadh-0A66C2?style=for-the-badge&logo=linkedin)](https://www.linkedin.com/in/lokhnadh/)

⭐ **If you find this project interesting, consider starring the repository!**
