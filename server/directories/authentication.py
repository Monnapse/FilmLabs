"""
    Home page directories
    Made by Monnapse

    11/6/2024
"""

from flask import Flask, render_template, session

# SETTINGS

def run(app: Flask):
    print("Authentication >>> Authentication directories loaded")

    @app.flask.route("/login")
    def login():
        return render_template(
            app.base,
            template = "login.html",
            title = "Login",
            javascript = "customForm",
            no_header_additional = True,
            no_footer = True
        )
    
    @app.flask.route("/register")
    def register():
        return render_template(
            app.base,
            template = "register.html",
            title = "Register",
            javascript = "customForm",
            no_header_additional = True,
            no_footer = True
        )