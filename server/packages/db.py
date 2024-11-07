"""
    Film Labs Database
    Made by Monnapse

    11/6/2024
"""

from os import environ
import mysql.connector as mysql

class account:
    def __init__(self, user_id: int, username: str,):
        self.user_id = user_id
        self.username = username
        self.favorites = []
        self.watch_history = []

class film_labs_db:
    def __init__(self) -> None:
        self.db_connection = None
        self.db_cursor = None

        print("DB >>> Created database class")

    def connect(self, host: str, user: str, password: str, database:str) -> None:
        self.db_connection = mysql.connect(
            host=host,
            user=user,
            password=password,
            database=database
        )

        self.db_cursor = self.db_connection.cursor()

    def create_account(self, username: str, password: str) -> account:
        # Create queire
        querie = f"insert into account (username, password) values (%s, %s)"
        values = (username, password)

        # Execute querie
        self.db_cursor.execute(querie, values)
        self.db_connection.commit()

        user_id = self.db_cursor.lastrowid

        return account(
            user_id,
            username
        )


# Testing
"""
db = film_labs_db()
db.connect(
    "localhost",
    environ.get("MYSQL_USER"),
    environ.get("MYSQL_PASSWORD"),
    environ.get("FILMLABS_DB")
)
admin_account = db.create_account("sugriva", "fortnite")

print(admin_account.user_id)
"""