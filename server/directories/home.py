"""
    Home page directories
    Made by Monnapse

    11/6/2024
"""

from flask import Flask, render_template, session

# SETTINGS

def run(app: Flask):
    print("Home >>> Home directories loaded")

    @app.flask.route("/")
    def home():
        return render_template(
            app.base,
            template = "index.html",
            javascript = "index",
            logged_in = app.is_logged_in()
        )