"""
    Authentication
    Made by Monnapse

    11/6/2024
"""

from server.packages import authentication
from server.web import web_class

from flask import Flask, render_template, session, request, jsonify, redirect, make_response
import json
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from datetime import timedelta

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
    
    # Middle ground
    @app.flask.route("/logout")
    def logout():
        # Remove cookie so it doesnt go into infinite loops and self ddos
        response = make_response(redirect("/"))
        response.delete_cookie("access_token")
        return response
    # API

    @app.flask.route("/login_submit", methods=['POST'])
    @app.limiter.limit("10 per minute") # Stops any bruteforcers.
    def login_submit():
        data = authentication.bytes_to_json(request.get_data())
        
        try:
            username = data["username"]
            password = data["password"]
            remember = data["remember"]

            # Login into account
            account = app.db_controller.login(username, password)

            if (account.account_exists):
                # Account logged in successfully
                
                remember_time = timedelta(hours=1)

                if (remember):
                    remember_time = timedelta(days=app.token_max_days)

                token = create_access_token(identity=account.user_id)
                response = make_response(jsonify(success=True, message="Successfully logged into account"), 200)
                response.set_cookie(
                        "access_token", 
                        token, 
                        httponly=True, 
                        secure=True, 
                        samesite='Strict',
                        max_age=remember_time
                    ) # add expiration time
                return response
            else:
                return jsonify(success=False, message=account.account_message), 403
        except: 
            return jsonify(success=False, message="Something went wrong"), 403
    
    @app.flask.route("/register_submit", methods=['POST'])
    @app.limiter.limit("10 per minute") # Blocks any account creation bots from making an absurd amount.
    def register_submit():
        data = authentication.bytes_to_json(request.get_data())

        try:
            username = data["username"]
            password = data["password"]
            reenter_password = data["reenter_password"]

            # Create account
            new_account = app.db_controller.create_account(username, password, reenter_password)

            if (new_account.account_exists):
                return jsonify(success=True, message="Successfully created account"), 200
            else:
                return jsonify(success=False, message=new_account.account_message), 403
        except: 
            return jsonify(success=False, message="Something went wrong"), 403