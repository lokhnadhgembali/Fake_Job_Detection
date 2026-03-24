import sqlite3
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, "..", "app", "fake_job_detection.db")

try:
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    with open(os.path.join(BASE_DIR, 'schema.sql'), 'r') as f:
        sql = f.read()
        
    # SQLite doesn't support AUTO_INCREMENT, so replace with AUTOINCREMENT where appropriate
    sql = sql.replace("auto_increment primary key", "AUTOINCREMENT")
    # In SQLite, AUTOINCREMENT is only allowed on an INTEGER PRIMARY KEY
    sql = sql.replace("INT AUTOINCREMENT", "INTEGER PRIMARY KEY AUTOINCREMENT")
    sql = sql.replace("int AUTOINCREMENT", "INTEGER PRIMARY KEY AUTOINCREMENT")
    # Remove some MySQL specific types or keywords
    sql = sql.replace("USE fake_job_detection_db;", "")
    sql = sql.replace("CREATE DATABASE fake_job_detection_db;", "")

    # SQLite executes scripts differently than MySQL, use executescript
    print("Executing schema...")
    cursor.executescript(sql)
            
    conn.commit()
    conn.close()
    print("Database initialized successfully at " + DB_PATH)
    
except Exception as e:
    print(f"Error initializing database: {e}")
