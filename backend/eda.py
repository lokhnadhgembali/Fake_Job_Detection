import pandas as pd
import matplotlib.pyplot as plt
from wordcloud import WordCloud
import os
import re

# ==========================
# Setup
# ==========================
os.makedirs("eda_output", exist_ok=True)
print("Loading dataset...")
df = pd.read_csv("fake_job_postings.csv")

# Fill missing values
df['title'] = df['title'].fillna("")
df['description'] = df['description'].fillna("")

# Combine title + description
df['text'] = df['title'] + " " + df['description']

def clean_text(text):
    text = re.sub(r'<[^>]+>', ' ', text)
    text = re.sub(r'[^\w\s]', ' ', text)
    text = re.sub(r'\s+', ' ', text).strip().lower()
    return text

print("Cleaning text...")
df['text'] = df['text'].apply(clean_text)

fake_posts = df[df['fraudulent'] == 1]['text']
real_posts = df[df['fraudulent'] == 0]['text']

# ==========================
# 1. Distribution Plot
# ==========================
print("Generating distribution plot...")
plt.figure(figsize=(8, 5))
counts = df['fraudulent'].value_counts()
counts.index = ['Real (0)', 'Fake (1)']
counts.plot(kind='bar', color=['#4ade80', '#f87171'])
plt.title('Distribution of Real vs Fake Job Postings')
plt.ylabel('Count')
plt.xticks(rotation=0)
plt.tight_layout()
plt.savefig("eda_output/01_distribution.png")
plt.close()

# ==========================
# 2. Word Cloud — Fake Posts
# ==========================
print("Generating Word Cloud for Fake Posts...")
fake_text = " ".join(fake_posts)
wordcloud_fake = WordCloud(width=800, height=400, background_color='black', colormap='Reds').generate(fake_text)

plt.figure(figsize=(10, 5))
plt.imshow(wordcloud_fake, interpolation='bilinear')
plt.axis('off')
plt.title('Most Frequent Words in Fake Job Postings', fontsize=16, color='red')
plt.tight_layout()
plt.savefig("eda_output/02_wordcloud_fake.png")
plt.close()

# ==========================
# 3. Word Cloud — Real Posts
# ==========================
print("Generating Word Cloud for Real Posts...")
real_text = " ".join(real_posts)
wordcloud_real = WordCloud(width=800, height=400, background_color='white', colormap='Greens').generate(real_text)

plt.figure(figsize=(10, 5))
plt.imshow(wordcloud_real, interpolation='bilinear')
plt.axis('off')
plt.title('Most Frequent Words in Real Job Postings', fontsize=16, color='green')
plt.tight_layout()
plt.savefig("eda_output/03_wordcloud_real.png")
plt.close()

print("✅ EDA complete! Images saved to backend/eda_output/")
