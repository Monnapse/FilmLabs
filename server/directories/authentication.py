"""
    Home page directories
    Made by Monnapse

    11/6/2024
"""

from server.packages import authentication
from server.web import web_class

from flask import Flask, render_template, session, request, jsonify, redirect
import json

def run(app: web_class):
    print("Authentication >>> Authentication directories loaded")

    # Directories
    @app.flask.route("/login")
    def login():
        return render_template(
            app.base,
            template = "login.html",
            title = "Login",
            javascript = "customForm",
            no_header_additional = True,
            no_footer = True,

            username_min = app.username_min_length,
            username_max = app.username_max_length,
            password_min = app.password_min_length,
            password_max = app.password_max_length
        )
    
    @app.flask.route("/register")
    def register():
        print(f"app limiter: {app.limiter}")
        return render_template(
            app.base,
            template = "register.html",
            title = "Register",
            javascript = "customForm",
            no_header_additional = True,
            no_footer = True,

            username_min = app.username_min_length,
            username_max = app.username_max_length,
            password_min = app.password_min_length,
            password_max = app.password_max_length
        )
    
    #register

    # API
    @app.flask.route("/login_submit", methods=['POST'])
    def login_submit():
        data = authentication.bytes_to_json(request.get_data())
        print(data)

        return "Yes"
    
    @app.flask.route("/register_submit", methods=['POST'])
    @app.limiter.limit("10 per minute")
    def register_submit():
        data = authentication.bytes_to_json(request.get_data())

        try:
            password = data["password"]
            reenter_password = data["reenter_password"]
            username = data["username"]

            # Check if password validates
            if len(password) <= app.password_max_length and len(password) >= app.password_min_length and password == reenter_password:
                if len(username) >= app.username_min_length and len(username) <= app.username_max_length:
                    hashed_password = authentication.hash_password(password)
                    print(f"username taken {app.db_controller.does_username_exist(username)}")
                    if (not app.db_controller.does_username_exist(username)):
                        # Now create the account
                        app.db_controller.create_account(username, hashed_password)
                    else:
                        return jsonify(success=False, message="Username is already taken"), 403
                else:
                    return jsonify(success=False, message=f"Username must be atleast {app.username_min_length} characters long and less than {app.username_max_length} characters"), 403
            else:
                return jsonify(success=False, message=f"Password & Reenter Password inputs must match.\nPassword must be atleast {app.password_min_length} characters long and less than {app.password_max_length} characters"), 403
        except:
            return jsonify(success=False, message="Something went wrong"), 403

        return jsonify(success=True, message="Successfully created account"), 200