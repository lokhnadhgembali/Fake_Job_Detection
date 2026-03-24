import sqlite3
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, "fake_job_detection.db")

def get_connection():
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    # Configure it to return dictionary-like row objects
    conn.row_factory = sqlite3.Row
    return conn