"""
    Authentication
    Made by Monnapse

    11/6/2024
"""

from server.packages import authentication
from server.packages.tmdb import FilmType
from server.web import web_class

from flask import Flask, render_template, session, request, jsonify, redirect, make_response
import json
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from datetime import timedelta

def run(app: web_class):
    print("Films >>> Films directories loaded")

    # Function Routes
    def category_base(media_type = None, list_type = None, time_window = None):
        authorization = app.get_authorization_data()

        return render_template(
            app.base,
            template = "selected.html",
            javascript = "selectedFilms",
            authorization = authorization
        )

    # Routes
    @app.flask.route("/category/<media_type>/<list_type>")
    def category(media_type, list_type):
        return category_base(media_type, list_type)
    @app.flask.route("/category/<media_type>/<list_type>/<time_window>")
    def category_time(media_type, list_type, time_window):
        return category_base(media_type, list_type, time_window)
    
    # API
    @app.flask.route("/get_home_page_categories", methods=['GET'])
    @app.limiter.limit("30 per minute")
    def get_home_page_categories():
        #print(request.args.get("page"))
        page = request.args.get("page")
#
        try:
            if page != None:
                categories = app.film_controller.get_next_categories(int(page))

                if categories != None:
                    categories_json = app.film_controller.categories_to_json(categories)
                    return jsonify(success=True, data=categories_json), 200
                else:
                    return jsonify(success=False, message="Could not find page"), 404
            else:
                return jsonify(success=False, message="Please specify a page number"), 403
        except: 
            return jsonify(success=False, message="Something went wrong"), 403

    # /get_category?page=5&media_type=tv&list_type=top_rated&time_window=null
    @app.flask.route("/get_category")
    @app.limiter.limit("30 per minute")
    def category_api():
        page = request.args.get("page")
        media_type = request.args.get("media_type")
        list_type = request.args.get("list_type")
        time_window = request.args.get("time_window")
#
        try:
            if page != None and media_type != None and list_type != None:
                category_results = []
                if media_type == FilmType.Movie.value:
                    # Is movie list type
                    category_results = app.film_controller.tmdb.get_film_list(FilmType.Movie, list_type, int(page), time_window)

                elif media_type == FilmType.TV.value:
                    # Is tv list type
                    category_results = app.film_controller.tmdb.get_film_list(FilmType.TV, list_type, int(page), time_window)

                if category_results != None:
                    categories_json = app.film_controller.tmdb.list_result_to_json(category_results)
                    return jsonify(success=True, data=categories_json), 200
                else:
                    return jsonify(success=False, message="Page, media type, list type or time window is invalid."), 404
            else:
                return jsonify(success=False, message="Please specify a page number"), 403
        except: 
            return jsonify(success=False, message="Something went wrong"), 403