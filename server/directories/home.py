"""
    Home page directories
    Made by Monnapse

    11/6/2024
"""

from flask import Flask, render_template

# SETTINGS

def run(app: Flask):
    print("home directories loaded")

    @app.flask.route("/")
    def home():
        return render_template("index.html")