import mysql.connector

passwords_to_try = ["Lokh@2005", "", "root", "password", "admin", "1234", "123456"]

for pwd in passwords_to_try:
    try:
        conn = mysql.connector.connect(
            host="localhost",
            user="root",
            password=pwd
        )
        print(f"SUCCESS with password: '{pwd}'")
        conn.close()
        break
    except Exception as e:
        print(f"FAILED with password '{pwd}': {e}")
