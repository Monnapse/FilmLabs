"""

    Film Box Server
    Made by Monnapse

    Created 11/6/2024
    Last Updated 11/6/2024

    0.1.0

"""

from flask import Flask, request
from flask_session import Session
from datetime import timedelta
from os import environ
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask_jwt_extended import JWTManager
import json

import server.web as web
from server.packages import db, films, tmdb, json_controller
from server.packages.tmdb import FilmType, TVListType, MovieListType, TimeWindow, TMDB, ListResult

# Settings
token_max_days = 7

password_min_length = 8
password_max_length = 20

username_min_length = 3
username_max_length = 20

# Define the flask app
app = Flask(__name__)
limiter = Limiter(app, key_func=get_remote_address)

#app.config["SESSION_PERMANENT"] = False
#app.config["SESSION_TYPE"] = "filesystem"
#app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(minutes=session_days)
app.config['JWT_SECRET_KEY'] = environ.get("FILMLABS_JWT_KEY")
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(days=token_max_days)

Session(app)
jwt = JWTManager(app)

api = tmdb.TMDB(environ.get("TMDB_API_KEY"))
film_controller = films.FilmsController(
    api,
    json_controller.load_json("home_page.json")
)

db_controller = db.film_labs_db(
    password_max_length, 
    password_min_length,
    username_min_length,
    username_max_length
)
web_controller = web.web_class(
    app, 
    limiter,
    db_controller,
    jwt,
    film_controller,
    token_max_days,
    password_max_length, 
    password_min_length,
    username_min_length,
    username_max_length
)

if __name__ == '__main__':
    # Connect to database
    db_controller.connect(
        "localhost",
        environ.get("MYSQL_USER"),
        environ.get("MYSQL_PASSWORD"),
        environ.get("FILMLABS_DB")
    )

    # Now make the web directories
    # and run the flask app
    web_controller.run_directories()

    # Run flask app
    app.run(debug=True, port="2400", host="0.0.0.0")