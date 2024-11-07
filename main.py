"""

    Film Box Server
    Made by Monnapse

    Created 11/6/2024
    Last Updated 11/6/2024

    0.1.0

"""

from flask import Flask
from flask_session import Session
from datetime import timedelta
from os import environ

import server.web as web
import server.packages.db as db

session_hours = 168 # Amount of time to remember

# Define the flask app
app = Flask(__name__)
#app.config["SESSION_PERMANENT"] = False
app.config["SESSION_TYPE"] = "filesystem"
app.config['PERMANENT_SESSION_LIFETIME'] =  timedelta(hours=session_hours)
Session(app)

db_controller = db.film_labs_db()
web_controller = web.web_class(app)

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