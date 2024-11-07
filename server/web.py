"""
    Web Manager
    Made by Monnapse

    11/6/2024
"""

from flask import Flask, render_template, session
from flask_limiter import Limiter
from server.packages.db import film_labs_db
import os, glob
import importlib.util
import json

class web_class:
    # This defines the main attributes of the class
    base = "base.html"
    flask: Flask = None

    # The initializer of the class
    # Defines the class attributes
    def __init__(app, flask_app: Flask, limiter: Limiter, db_controller: film_labs_db, password_max_length: int, password_min_length: int, username_min_length: int, username_max_length: int) -> None:
        # Defaults
        app.flask = flask_app
        app.limiter = limiter
        app.db_controller = db_controller

        # Settings
        app.password_max_length = password_max_length
        app.password_min_length = password_min_length
        app.username_min_length = username_min_length
        app.username_max_length = username_max_length

        print("Web Controller >>> is running")

    # Run Directories goes through the Directories Folder
    # and imports the module and runs it
    # directories folder contains all the directories of the site
    def run_directories(app):
        print("running directories");
        for filename in glob.glob(os.path.join("server/directories", '*.py')):
           spec = importlib.util.spec_from_file_location(filename, filename)
           module = importlib.util.module_from_spec(spec)
           spec.loader.exec_module(module)
           module.run(app)

    def is_logged_in(app) -> bool:
        return bool(session.get("user_id"))