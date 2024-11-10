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
favorites = db.get_favorites(1)
print(favorites[1].name)