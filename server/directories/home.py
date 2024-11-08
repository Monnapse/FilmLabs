"""
    Home page directories
    Made by Monnapse

    11/6/2024
"""

from server.web import web_class

from flask import Flask, render_template, session
from flask_jwt_extended import jwt_required

# SETTINGS

def run(app: web_class):
    print("Home >>> Home directories loaded")

    @app.flask.route("/")
    def home():
        authenticated_account = app.check_authentication()

        if (authenticated_account.account_exists):
            return render_template(
                app.base,
                template = "index.html",
                javascript = "index",
                logged_in = True,
                username = authenticated_account.username
            )
        else:
            return render_template(
                app.base,
                template = "index.html",
                javascript = "index",
                logged_in = False
            )