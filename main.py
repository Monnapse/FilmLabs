"""

    Film Box Server
    Made by Monnapse

    Created 11/6/2024
    Last Updated 11/6/2024

    0.1.0

"""

import server.web as web
from flask import Flask
from flask_session import Session
from datetime import timedelta

session_hours = 168 # Amount of time to remember

# Define the flask app
app = Flask(__name__)
#app.config["SESSION_PERMANENT"] = False
app.config["SESSION_TYPE"] = "filesystem"
app.config['PERMANENT_SESSION_LIFETIME'] =  timedelta(hours=session_hours)
Session(app)

web_controller = web.web_class(app)

if __name__ == '__main__':
    # Now make the web directories
    # and run the flask app
    web_controller.run_directories()
    app.run(debug=True, port="2400", host="0.0.0.0")