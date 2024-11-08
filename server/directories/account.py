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
        authenticated_account = app.check_authentication()

        if (authenticated_account.account_exists):
            # If logged in then continue to account page
            return render_template(
                app.base,
                template = "account.html",
                title = "Account",
                javascript = "account",
                no_footer = True,
                logged_in = True,
                username = authenticated_account.username
            )
        else:
            # If not logged in then redirect to login page
            return redirect("/login")