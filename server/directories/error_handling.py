"""
    Error handling
    Made by Monnapse

    11/7/2024
"""

from server.web import WebClass

from flask import redirect, make_response

# SETTINGS
def run(app: WebClass):
    print("Error Handler >>> Error directories loaded")

    @app.jwt.expired_token_loader
    @app.limiter.limit("30 per minute")
    def expired_token_callback(jwt_header, jwt_payload):
        try:
            # Remove cookie so it doesnt go into infinite loops and self ddos
            response = make_response(redirect("/"))
            response.delete_cookie("access_token")
            return response
        except Exception as e:
            print(f"Error in films error handling at {expired_token_callback.__name__}: {e}")
    