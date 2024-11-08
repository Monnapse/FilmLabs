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
    print("Films >>> Films directories loaded")

    @app.flask.route("/get_home_page_categories", methods=['GET'])
    @app.limiter.limit("30 per minute")
    def get_home_page_categories():
        #print(request.args.get("page"))
        page = request.args.get("page")
#
        try:
            if page != None:
                categories = app.film_controller.get_next_categories(int(page))
                categories_json = app.film_controller.categories_to_json(categories)

                if categories != None:
                    print(categories)
                    return jsonify(success=True, data=categories_json), 200
                else:
                    return jsonify(success=False, message="Could not find page"), 403
            else:
                return jsonify(success=False, message="Please specify a page number"), 403
        except: 
            return jsonify(success=False, message="Something went wrong"), 403

        #return jsonify(":)"), 200