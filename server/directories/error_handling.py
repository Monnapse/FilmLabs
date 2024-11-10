"""
    Error handling
    Made by Monnapse

    11/7/2024
"""

from server.web import web_class

from flask import Flask, render_template, session, redirect, make_response
from flask_jwt_extended import jwt_required

# SETTINGS
def run(app: web_class):
    print("Error Handler >>> Error directories loaded")

    @app.jwt.expired_token_loader
    @app.limiter.limit("30 per minute")
    def expired_token_callback(jwt_header, jwt_payload):
        # Remove cookie so it doesnt go into infinite loops and self ddos
        response = make_response(redirect("/"))
        response.delete_cookie("access_token")
        return response
    