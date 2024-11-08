"""
    Film Labs Database
    Made by Monnapse

    11/6/2024
"""

# Server
from server.packages import authentication
#from server.web import web_class

# Testing
#import authentication

from os import environ
import mysql.connector as mysql


class account:
    def __init__(self, 
            user_id: int = None, 
            username: str = None, 
            password: str = None, 
            account_exists: bool = True, 
            account_message: str = "Account exists"
        ):
        self.user_id = user_id
        self.username = username
        self.password = password
        self.favorites = []
        self.watch_history = []
        self.account_exists = account_exists
        self.account_message = account_message

class film_labs_db:
    def __init__(
            self, 
            password_max_length, 
            password_min_length,
            username_min_length,
            username_max_length
        ) -> None:
        self.db_connection = None
        self.db_cursor = None

        self.password_max_length = password_max_length
        self.password_min_length = password_min_length
        self.username_min_length = username_min_length
        self.username_max_length = username_max_length

        print("DB >>> Created database class")

    def connect(self, host: str, user: str, password: str, database:str) -> None:
        self.db_connection = mysql.connect(
            host=host,
            user=user,
            password=password,
            database=database
        )

        self.db_cursor = self.db_connection.cursor()

    def create_account(self, username: str, password: str, reenter_password) -> account:
        # Check if password validates
        if len(password) <= self.password_max_length and len(password) >= self.password_min_length and password == reenter_password:
            if len(username) >= self.username_min_length and len(username) <= self.username_max_length:
                if (not self.does_username_exist(username)):
                    # Now create the account
                    hashed_password = authentication.hash_password(password)

                    # Create queire
                    query = "insert into account (username, password) values (%s, %s)"
                    values = (username, hashed_password)

                    # Execute querie
                    self.db_cursor.execute(query, values)
                    self.db_connection.commit()

                    user_id = self.db_cursor.lastrowid

                    return account(
                        user_id,
                        username,
                        password
                    )

                else:
                    return account(
                        account_exists=False,
                        account_message="Username is already taken"
                    )
            else:
                return account(
                    account_exists=False,
                    account_message=f"Username must be atleast {self.username_min_length} characters long and less than {self.username_max_length} characters"
                )
        else:
            return account(
                account_exists=False,
                account_message=f"Password & Reenter Password inputs must match.\nPassword must be atleast {self.password_min_length} characters long and less than {self.password_max_length} characters"
            )
    
    def does_username_exist(self, username: str) -> bool:
        query = "select user_id from account where username = %s"
        username = (username, )

        self.db_cursor.execute(query, username)
        results = self.db_cursor.fetchall()

        if (len(results) > 0):
            return True
        return False
    
    def get_account(self, user_id: str) -> account:
        query = "select user_id, username from account where user_id = %s"
        user_id = (str(user_id), )

        self.db_cursor.execute(query, user_id)
        results = self.db_cursor.fetchall()

        # Check if there are any results if not then that means
        # no account with that user_id exists
        if results and len(results) > 0:
            selected_account = account(
                results[0][0],
                results[0][1],
            )
            return selected_account
        
        return account(
            account_exists=False,
            account_message="Account doesnt exist"
        )

    def login(self, username: str, password: str) -> account:
        query = "select user_id, username, password from account where username = %s"
        username = (username, )

        self.db_cursor.execute(query, username)
        results = self.db_cursor.fetchall()

        # Check if there are any results if not then that means
        # no account with that username exists
        if results and len(results) > 0:
            hashes_password = results[0][2].encode()
            current_account = account(
                results[0][0],
                results[0][1],
                password
            )

            # Check if password is correct
            is_password_correct = authentication.check_password(hashes_password, password)
            #print("Password Correct: " + str(is_password_correct))

            if is_password_correct:
                return current_account
            else:
                return account(
                    account_exists=False,
                    account_message="Incorrect password"
                )
        return account(
            account_exists=False,
            account_message="Account doesnt exist"
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
#admin_account = db.create_account("sugriva", "fortnite")
login = db.login("Monnapse", "Password")

print(login.account_message)
"""