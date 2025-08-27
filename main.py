"""

    Film Box Server

    Made by Monnapse
    Created 11/6/2024
    

    UPDATES
    
    0.2.0 8/27/2025
    - Added show & movie recommendation categories to home page & film pages.
    - Reorganized home page categories json file.
    - Fixed token issue.
    - Fixed some page responsiveness issues.

    0.1.0 11/6/2024
    - Initial release.

"""

from flask import Flask, request
#from flask_session import Session
from datetime import timedelta
from os import environ
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask_jwt_extended import JWTManager
import json

import server.web as web
from server.packages import db, films, tmdb, json_controller, service
from server.packages.tmdb import FilmType, TVListType, MovieListType, TimeWindow, TMDB, ListResult

# Settings
token_max_days = 7

password_min_length = 8
password_max_length = 20

username_min_length = 3
username_max_length = 20

# w9, w154, w185, w342, w500, w780, original
poster_sizing = "w185" # Smaller = more optimized = faster loading

# Define the flask app
app = Flask(__name__)
limiter = Limiter(app, key_func=get_remote_address)

#app.config["SESSION_PERMANENT"] = False
#app.config["SESSION_TYPE"] = "filesystem"
#app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(minutes=session_days)
app.config['JWT_SECRET_KEY'] = environ.get("FILMLABS_JWT_KEY")
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(days=token_max_days)

#Session(app)
jwt = JWTManager(app)

api = tmdb.TMDB(
    environ.get("TMDB_API_KEY"), 
    poster_sizing
)
service_controller = service.ServiceController(
    json_controller.load_json("services.json")
)

#print(service_controller.get_services()[0].get_tv_url("693134", 1, 1))

#print(film_controller.get_next_categories(2))

db_controller = db.FilmLabsDB(
    password_max_length, 
    password_min_length,
    username_min_length,
    username_max_length
)
film_controller = films.FilmsController(
    api,
    db_controller,
    json_controller.load_json("home_page.json"),

)
web_controller = web.WebClass(
    app, 
    limiter,
    db_controller,
    jwt,
    film_controller,
    service_controller,
    token_max_days,
    password_max_length, 
    password_min_length,
    username_min_length,
    username_max_length
)
if __name__ == '__main__':
    # Connect to database
    db_controller.connect(
        "127.0.0.1",
        environ.get("MYSQL_USER"),
        environ.get("MYSQL_PASSWORD"),
        environ.get("FILMLABS_DB")
    )

    # Now make the web directories
    # and run the flask app
    web_controller.run_directories()

    # Run flask app
    app.run(debug=False, port="2400", host="0.0.0.0")