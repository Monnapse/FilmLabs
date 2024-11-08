"""
    Web Manager
    Made by Monnapse

    11/6/2024
"""

from flask import Flask, render_template, session, request
from flask_limiter import Limiter
from server.packages.db import film_labs_db, account
from server.packages import db
import os, glob
import importlib.util
import json
from flask_jwt_extended import JWTManager, decode_token
import time
from datetime import timedelta

class web_class:
    # This defines the main attributes of the class
    base = "base.html"
    flask: Flask = None

    # The initializer of the class
    # Defines the class attributes
    def __init__(app, flask_app: Flask, limiter: Limiter, db_controller: film_labs_db, jwt:JWTManager, token_max_days: int, password_max_length: int, password_min_length: int, username_min_length: int, username_max_length: int) -> None:
        # Defaults
        app.flask = flask_app
        app.limiter = limiter
        app.db_controller = db_controller
        app.jwt = jwt

        # Settings
        app.token_max_days = token_max_days
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

    def check_authentication(app) -> account:
        #current_user = get_jwt_identity()
        token = request.cookies.get("access_token")
        if (token):
            decoded_token = decode_token(token)
            # Check if expired
            #logged_in_timestamp = decoded_token.get("nbf")
            #print(decoded_token)

            #if (time.time() - logged_in_timestamp):
            #    # Token is expired
            #    return False

            
            # Check if valid token
            # Check if user_id is valid
            user_id = decoded_token.get("sub")

            selected_account = app.db_controller.get_account(user_id)

            if (selected_account.account_exists):
                return selected_account
            else:
                return account(
                    account_exists=False,
                    account_message="Could not find account with that user_id"
                )
            
        return account(
            account_exists=False,
            account_message="Token is invalid"
        )