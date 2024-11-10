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

class Account:
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

class Film:
    def __init__(self,
            tmdb_id: int = None,
            media_type: str = None,
            name: str = None,
            year: str = None,
            rating: float = None,
            poster: str = None
        ) -> None:
        self.tmdb_id = tmdb_id
        self.media_type = media_type
        self.name = name
        self.year = year
        self.rating = rating
        self.poster = poster

class MovieHistory:
    def __init__(self,
        progress: str = None
    ) -> None:
        self.progress = progress

class EpisodeHistory:
    def __init__(self,
        episode_id: int = None,
        progress: str = None
    ) -> None:
        self.episode_id = episode_id
        self.progress = progress

class WatchHistroy:
    def __init__(self,
            watch_history_id: int = None,
            tmdb_id: int = None,
            user_id: int = None,
            movie_history: MovieHistory = None,
            episode_history: list[EpisodeHistory] = None
        ) -> None:
        self.watch_history_id = watch_history_id
        self.tmdb_id = tmdb_id
        self.user_id = user_id
        self.movie_history = movie_history
        self.episode_history = episode_history
        
class FilmLabsDB:
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

    def create_account(self, username: str, password: str, reenter_password) -> Account:
        try:
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

                        return Account(
                            user_id,
                            username,
                            password
                        )

                    else:
                        return Account(
                            account_exists=False,
                            account_message="Username is already taken"
                        )
                else:
                    return Account(
                        account_exists=False,
                        account_message=f"Username must be atleast {self.username_min_length} characters long and less than {self.username_max_length} characters"
                    )
            else:
                return Account(
                    account_exists=False,
                    account_message=f"Password & Reenter Password inputs must match.\nPassword must be atleast {self.password_min_length} characters long and less than {self.password_max_length} characters"
                )
        except Exception as e:
            print(f"DB Error occurred inside create_account: {e}")
    
    def does_username_exist(self, username: str) -> bool:
        try:
            query = "select user_id from account where username = %s"
            username = (username, )

            self.db_cursor.execute(query, username)
            results = self.db_cursor.fetchall()

            if (len(results) > 0):
                return True
            return False
        except Exception as e:
            print(f"DB Error occurred inside does_username_exist: {e}")
    
    def get_account(self, user_id: str) -> Account:
        try:
            query = "select user_id, username from account where user_id = %s"
            user_id = (str(user_id), )

            self.db_cursor.execute(query, user_id)
            results = self.db_cursor.fetchall()

            # Check if there are any results if not then that means
            # no account with that user_id exists
            if results and len(results) > 0:
                selected_account = Account(
                    results[0][0],
                    results[0][1],
                )
                return selected_account

            return Account(
                account_exists=False,
                account_message="Account doesnt exist"
            )
        except Exception as e:
            print(f"DB Error occurred inside get_account: {e}")

    def login(self, username: str, password: str) -> Account:
        try:
            query = "select user_id, username, password from account where username = %s"
            username = (username, )
    
            self.db_cursor.execute(query, username)
            results = self.db_cursor.fetchall()
    
            # Check if there are any results if not then that means
            # no account with that username exists
            if results and len(results) > 0:
                hashes_password = results[0][2].encode()
                current_account = Account(
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
                    return Account(
                        account_exists=False,
                        account_message="Incorrect password"
                    )
            return Account(
                account_exists=False,
                account_message="Account doesnt exist"
            )
        except Exception as e:
            print(f"DB Error occurred inside login: {e}")
    
    def to_film(self,
        tmdb_id: int = None,
        media_type: str = None,
        name: str = None,
        year: str = None,
        rating: float = None,
        poster: str = None
    ) -> Film:
        film = Film(
            tmdb_id,
            media_type,
            name,
            year,
            rating,
            poster
        )
        return film

    def add_film(self, 
        tmdb_id: int = None,
        media_type: str = None,
        name: str = None,
        year: str = None,
        rating: float = None,
        poster: str = None
    ) -> Film:
        # insert into film values (1, "tv", "test", "2024", 10);
        # tmdb_id int PK 
        # media_type varchar(20) 
        # name varchar(85) 
        # year varchar(8) 
        # rating float
        # poster varchar(45)

        try:
            query = "insert into film values (%s, %s, %s, %s, %s, %s)"
            values = (tmdb_id, media_type, name, year, rating, poster)
            self.db_cursor.execute(query, values)
            self.db_connection.commit()

            return self.to_film(
                    tmdb_id,
                    media_type,
                    name,
                    year,
                    rating,
                    poster
                )
        except Exception as e:
            print(f"DB Error occurred inside add_film: {e}")

    def get_film(self, tmdb_id: int) -> Film:
        # select * from film where tmdb_id = 1;
        try:
            query = "select * from film where tmdb_id = %s"
            values = (tmdb_id, )
            self.db_cursor.execute(query, values)

            results = self.db_cursor.fetchall()

            if results and len(results) > 0:
                result = results[0]
                film = self.to_film(
                    result[0],
                    result[1],
                    result[2],
                    result[3],
                    result[4],
                    result[5]
                )
                return film
        except Exception as e:
            print(f"DB Error occurred inside get_film: {e}")

    def check_film(self, 
        tmdb_id: int = None,
        media_type: str = None,
        name: str = None,
        year: str = None,
        rating: float = None,
        poster: str = None
    ) -> Film:
        film = self.get_film(tmdb_id)

        if film == None:
            self.add_film(
                tmdb_id,
                media_type,
                name,
                year,
                rating,
                poster
            )

            return self.to_film(
                tmdb_id,
                media_type,
                name,
                year,
                rating,
                poster
            )

        return film

    def remove_favorite(self, tmdb_id: int, user_id: int):
        # delete from account_favorites where tmdb_id = 2 and user_id = 1
        # tmdb_id int 
        # user_id int
        try:
            query = "delete from account_favorites where tmdb_id = %s and user_id = %s"
            values = (tmdb_id, user_id)
            self.db_cursor.execute(query, values)
            self.db_connection.commit()
        except Exception as e:
            print(f"DB Error occurred inside remove_favorite: {e}")

    def add_favorite(self, tmdb_id: int, user_id: int):
        # insert into account_favorites values(1, 1) 
        # tmdb_id int 
        # user_id int
        try:
            query = "insert into account_favorites values(%s, %s)"
            values = (tmdb_id, user_id)
            self.db_cursor.execute(query, values)
            self.db_connection.commit()
        except Exception as e:
            print(f"DB Error occurred inside add_favorite: {e}")

    def get_favorites(self, user_id: int) -> list[Film]:
        # select distinct f.* from account_favorites af join film f on af.tmdb_id = f.tmdb_id where af.user_id = 1 group by f.tmdb_id
        try:
            query = "select distinct f.* from account_favorites af join film f on af.tmdb_id = f.tmdb_id where af.user_id = %s group by f.tmdb_id"
            values = (user_id, )
            self.db_cursor.execute(query, values)

            results = self.db_cursor.fetchall()

            favorites = []

            if results and len(results) > 0:
                for result in results:
                    film = self.to_film(
                        result[0],
                        result[1],
                        result[2],
                        result[3],
                        result[4],
                        result[5],
                    )
                    favorites.append(film)

            return favorites
        except Exception as e:
            print(f"DB Error occurred inside get_favorites: {e}")

    def add_watch_history(self,
        tmdb_id: int,
        user_id: int,
    ) -> int:
        """
        returns `account_history_id`
        """
        # insert into account_watch_history (tmdb_id, user_id) values (1, 1)
        try:
            # First Query
            query = "insert into account_watch_history (tmdb_id, user_id) values (%s, %s)"
            values = (tmdb_id, user_id)
            self.db_cursor.execute(query, values)
            self.db_connection.commit()

            watch_history_id = self.db_cursor.lastrowid
            return watch_history_id
        except Exception as e:
            print(f"DB Error occurred inside add_watch_history: {e}")

    def get_watch_history(self,
        user_id: int,
    ):
        # select f.tmdb_id, coalesce(group_concat(tv.progress), group_concat(movie.progress)) as progress, coalesce(group_concat(tv.episode_id)) as episode_id from account_watch_history awh join film f on awh.tmdb_id = f.tmdb_id left join episode_history tv on f.media_type = "tv" and awh.account_history_id = tv.account_history_id left join movie_history movie on f.media_type = "movie" and awh.account_history_id = movie.account_history_id where awh.user_id = 1 group by f.tmdb_id



    def set_watch_history_progress_movie(self, 
        tmdb_id: int,
        user_id: int,
        progress: str
    ):
        

# Testing
"""
db = FilmLabsDB(
    5,5,5,5
)
db.connect(
    "localhost",
    environ.get("MYSQL_USER"),
    environ.get("MYSQL_PASSWORD"),
    environ.get("FILMLABS_DB")
)

#admin_account = db.create_account("sugriva", "fortnite")
#login = db.login("Monnapse", "Password")
film = db.get_film(1)
print(film.__dict__)
"""