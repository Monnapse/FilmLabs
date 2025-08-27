"""
    Home page directories
    Made by Monnapse

    11/6/2024
"""

from server.web import WebClass

from flask import Flask, render_template

# SETTINGS

def run(app: WebClass):
    print("Home >>> Home directories loaded")

    @app.flask.route("/")
    @app.limiter.limit("30 per minute")
    def home():
        try:
            authorization = app.get_authorization_data()
            return render_template(
                app.base,
                template = "index.html",
                javascript = "index",
                authorization=authorization
            )
        except Exception as e:
            print(f"Error in home controller at {home.__name__}: {e}")