from server.packages import db
from server.packages.db import FilmLabsDB
from os import environ

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

#film = db.check_film(
#    6,
#    "tv",
#    "poster test tv 6",
#    "200",
#    99.99,
#    "poster.com"
#)
#film = db.get_film(5)
#db.add_favorite(6, 1)
#db.remove_favorite(6, 1)
#favorites = db.get_favorites(1)
#history = db.get_watch_history(1)
#movie_history = db.get_episodes_history(1)
#print(db.get_film(history[1].tmdb_id).media_type)
#db.add_episode_history(1, 1, "00:00:00")
#db.add_movie_history(2, "00:00:00")
toggle = db.toggle_favorite(693134,1)
print(toggle)