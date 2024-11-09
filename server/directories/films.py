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
from datetime import timedelta, datetime

def run(app: web_class):
    print("Films >>> Films directories loaded")

    # Function Routes
    def category_base(media_type = None, list_type = None, time_window = None):
        authorization = app.get_authorization_data()

        return render_template(
            app.base,
            template = "selected.html",
            javascript = "selectedFilms",
            authorization = authorization,
            title = app.film_controller.get_category_name(media_type, list_type, time_window)
        )

    # Routes
    @app.flask.route("/category")
    def category():
        # /<media_type>/<list_type>/<time_window>
        media_type = request.args.get("media_type")
        list_type = request.args.get("list_type")
        time_window = request.args.get("time_window")
        return category_base(media_type, list_type, time_window)
    
    @app.flask.route("/search")
    def category_time():
        query = request.args.get("query")

        authorization = app.get_authorization_data()

        return render_template(
            app.base,
            template = "search.html",
            javascript = "search",
            authorization = authorization,
            query=query
        )
    
    @app.flask.route("/film/tv/<id>/<season>/<episode>")
    def tv(id, season, episode):
        authorization = app.get_authorization_data()
        current_service = request.args.get("service")

        service = app.service_controller.get_service_data(current_service)

        film_details = app.film_controller.tmdb.get_details(FilmType.TV, id)

        if film_details != None:
            return render_template(
                app.base,
                template = "film.html",
                javascript = "film",
                authorization = authorization,

                service_url=service.get_tv_url(id, season, episode),

                # SERVICES
                selected_service=service.name,
                service_providers=app.service_controller.get_services(),

                # Film Details
                title = film_details.name,
                year = datetime.strptime(film_details.first_air_date, "%Y-%m-%d").year,
                media_type = film_details.media_type,
                overview = film_details.overview,
                rating = round(film_details.vote_average, 1),
                tmdb_url = f"https://www.themoviedb.org/tv/{id}"
            )
        else:
            return render_template(
                app.base,
                template = "film.html",
                javascript = "film",
                authorization = authorization,
                title = "Could not find movie",
            )
    
    @app.flask.route("/film/movie/<id>")
    def movie(id):
        authorization = app.get_authorization_data()
        current_service = request.args.get("service")

        service = app.service_controller.get_service_data(current_service)

        film_details = app.film_controller.tmdb.get_details(FilmType.Movie, id)

        if film_details != None:
            return render_template(
                app.base,
                template = "film.html",
                javascript = "film",
                authorization = authorization,

                service_url=service.get_movie_url(id),

                # SERVICES
                selected_service=service.name,
                service_providers=app.service_controller.get_services(),

                # Film Details
                title = film_details.title,
                year = datetime.strptime(film_details.release_date, "%Y-%m-%d").year,
                media_type = film_details.media_type,
                overview = film_details.overview,
                rating = round(film_details.vote_average, 1),
                tmdb_url = f"https://www.themoviedb.org/movie/{id}"
            )
        else:
            return render_template(
                app.base,
                template = "film.html",
                javascript = "film",
                authorization = authorization,
                title = "Could not find movie",
            )

    
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
    @app.flask.route("/get_category", methods=['GET'])
    @app.limiter.limit("30 per minute")
    def category_api():
        page = request.args.get("page")
        mediaType = request.args.get("media_type")
        listType = request.args.get("list_type")
        timeWindow = request.args.get("time_window")
#
        try:
            if page != None and mediaType != None and listType != None:
                category_results = []
                if mediaType == FilmType.Movie.value:
                    # Is movie list type
                    category_results = app.film_controller.tmdb.get_film_list(FilmType.Movie, listType, int(page), timeWindow)

                elif mediaType == FilmType.TV.value:
                    # Is tv list type
                    category_results = app.film_controller.tmdb.get_film_list(FilmType.TV, listType, int(page), timeWindow)

                else:
                    category_results = app.film_controller.tmdb.get_trending_films_list(int(page), timeWindow)

                if category_results != None:
                    categories_json = app.film_controller.tmdb.list_result_to_json(category_results)
                    return jsonify(success=True, data=categories_json), 200
                else:
                    return jsonify(success=False, message="Page, media type, list type or time window is invalid."), 404
            else:
                return jsonify(success=False, message="Please specify a page number"), 403
        except: 
            return jsonify(success=False, message="Something went wrong"), 403
        
    #
    @app.flask.route("/search_media", methods=['GET'])
    @app.limiter.limit("30 per minute")
    def search_media():
        page = request.args.get("page") or 1
        mediaType = request.args.get("media_type") or "all"
        query = request.args.get("query")
        includeAdult = request.args.get("include_adult") or "false"
#
        try:
            if query != None:
                search_results = app.film_controller.tmdb.search_films(
                    query,
                    mediaType,
                    page,
                    includeAdult
                )
                #print(f"{query}, {mediaType}, {page}, {includeAdult}")
                if search_results != None:
                    search_json = app.film_controller.tmdb.list_result_to_json(search_results)

                    return jsonify(success=True, data=search_json), 200
                else:
                    return jsonify(success=False, message="Query did not work"), 404
            else:
                return jsonify(success=False, message="Please specify a page number"), 403
        except: 
            return jsonify(success=False, message="Something went wrong"), 403