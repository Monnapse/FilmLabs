"""
    Account page directories
    Made by Monnapse

    11/7/2024
"""

from server.web import web_class

from flask import Flask, render_template, session, redirect
from flask_jwt_extended import jwt_required

# SETTINGS

def run(app: web_class):
    print("Account >>> Account directories loaded")

    @app.flask.route("/account")
    def account():
        authorization = app.get_authorization_data()

        if (authorization["logged_in"]):
            # If logged in then continue to account page
            return render_template(
                app.base,
                template = "account.html",
                title = "Account",
                javascript = "account",
                no_footer = True,
                authorization=authorization
            )
        else:
            # If not logged in then redirect to login page
            return redirect("/login")