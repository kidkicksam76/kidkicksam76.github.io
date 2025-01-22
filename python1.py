import mysql.connector

db = mysql.connector.connect(
    host="localhost",
    user="yourusername",
    password="yourpassword",
    database="chat_db"
)

cursor = db.cursor()
cursor.execute("SELECT * FROM users")
for user in cursor.fetchall():
    print(user)
