from database import get_connection

conn = get_connection()
cursor = conn.cursor()

cursor.execute("SHOW TABLES")

for table in cursor:
    print(table)

conn.close()