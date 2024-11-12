"""
    Authentication
    Made by Monnapse

    11/6/2024
"""

from server.packages import authentication
from server.packages.tmdb import FilmType
from server.web import WebClass

from flask import Flask, render_template, session, request, jsonify, redirect, make_response
import json
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from datetime import timedelta, datetime

def run(app: WebClass):
    print("Films >>> Films directories loaded")

    # Function Routes
    def category_base(media_type = None, list_type = None, time_window = None):
        try:
            authorization = app.get_authorization_data()

            return render_template(
                app.base,
                template = "selected.html",
                javascript = "selectedFilms",
                authorization = authorization,
                title = app.film_controller.get_category_name(media_type, list_type, time_window)
            )
        except Exception as e:
            print(f"Error in films at {category_base.__name__}: {e}")

    # Routes
    @app.flask.route("/category")
    @app.limiter.limit("30 per minute")
    def category():
        try:
            # /<media_type>/<list_type>/<time_window>
            media_type = request.args.get("media_type")
            list_type = request.args.get("list_type")
            time_window = request.args.get("time_window")
            return category_base(media_type, list_type, time_window)
        except Exception as e:
            print(f"Error in films at {category.__name__}: {e}")

    @app.flask.route("/search")
    @app.limiter.limit("30 per minute")
    def category_time():
        try:
            query = request.args.get("query")

            authorization = app.get_authorization_data()

            return render_template(
                app.base,
                template = "search.html",
                javascript = "search",
                authorization = authorization,
                query=query
            )
        except Exception as e:
            print(f"Error in films at {category_time.__name__}: {e}")
    
    @app.flask.route("/film/tv/<id>/<season>/<episode>")
    @app.limiter.limit("30 per minute")
    def tv(id, season, episode):
        try:
            #current_season = season
            authorization = app.get_authorization_data()
            current_service = request.args.get("service")

            service = app.service_controller.get_service_data(current_service)

            film_details = app.film_controller.tmdb.get_details(FilmType.TV, id, True)

            user_id = None
            if authorization != None and authorization["logged_in"]:
                user_id = authorization["user_id"]

            film_details = app.film_controller.do_db_history_pass(user_id, film_details)

            if film_details != None:
                season_details = film_details.get_season(season)
                episodes = season_details.episodes

                #try:
                #    current_season = int(season)
                #    if film_details.seasons[current_season]:
                #        episodes = film_details.seasons[current_season].episodes
                ##except:
                ##    current_season = int(season)-1
                ##    if film_details.seasons[current_season]:
                ##        episodes = film_details.seasons[current_season].episodes
                #except:
                #    pass
                #print(film_details.seasons[1].episodes[6].progress)
                #for season in film_details.seasons:
                #    for episode in season.episodes:
                #        print(f"Season: {season.season_number}, Episode: {episode.episode_number}, Progress: {episode.progress}")

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
                    year = datetime.strptime(film_details.release_date, "%Y-%m-%d").year,
                    media_type = film_details.media_type,
                    overview = film_details.overview,
                    rating = round(film_details.vote_average, 1),
                    tmdb_url = f"https://www.themoviedb.org/tv/{id}",

                    # TV
                    current_season = season_details.season_number,
                    seasons = film_details.seasons,
                    current_episode = int(episode),
                    episodes = episodes,

                    id=id,

                    is_favorited = app.db_controller.is_favorited(id, authorization.get("user_id"))
                )
            else:
                return render_template(
                    app.base,
                    template = "film.html",
                    javascript = "film",
                    authorization = authorization,
                    title = "Could not find movie",
                )
        except Exception as e:
            print(f"Error in films at {tv.__name__}: {e}")
    
    @app.flask.route("/film/movie/<id>")
    @app.limiter.limit("30 per minute")
    def movie(id):
        try:
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
                    title = film_details.name,
                    year = datetime.strptime(film_details.release_date, "%Y-%m-%d").year,
                    media_type = film_details.media_type,
                    overview = film_details.overview,
                    rating = round(film_details.vote_average, 1),
                    tmdb_url = f"https://www.themoviedb.org/movie/{id}",

                    id=id,
                    is_favorited = app.db_controller.is_favorited(id, authorization.get("user_id"))
                )
            else:
                return render_template(
                    app.base,
                    template = "film.html",
                    javascript = "film",
                    authorization = authorization,
                    title = "Could not find movie",
                )
        except Exception as e:
            print(f"Error in films at {movie.__name__}: {e}")

    # API
    def get_trailer(film_type, id):
        try:
            trailer = app.film_controller.tmdb.get_trailer(film_type, id)
            if trailer != None:
                return jsonify(success=True, embed=trailer.embed_url), 200
            else:
                return jsonify(success=False, message="Please specify a valid id"), 400
        except Exception as e:
            print(f"Error in films at {get_trailer.__name__}: {e}")
            return jsonify(success=False, message="Something went wrong"), 500
    @app.flask.route("/trailer/tv", methods=['GET'])
    @app.limiter.limit("10 per minute")
    def tv_trailer():
        id = request.args.get("id")
        return get_trailer(FilmType.TV, id)
    @app.flask.route("/trailer/movie", methods=['GET'])
    @app.limiter.limit("10 per minute")
    def movie_trailer():
        id = request.args.get("id")
        return get_trailer(FilmType.Movie, id)

    @app.flask.route("/get_home_page_categories", methods=['GET'])
    @app.limiter.limit("30 per minute")
    def get_home_page_categories():
        #print(request.args.get("page"))
        page = request.args.get("page")
        try:
            if page != None:
                authorized_account = app.get_authorized_account()
                user_id = None
                if authorized_account != None and authorized_account.account_exists:
                    user_id = authorized_account.user_id
                #print(f"authorization: {authorized_account}")
                categories = app.film_controller.get_next_categories(int(page), user_id)
                
                if categories != None:
                    categories_json = app.film_controller.categories_to_json(categories)
                    #print("Success True")
                    return jsonify(success=True, data=categories_json), 200
                else:
                    return jsonify(success=False, message="Could not find page"), 404
            else:
                return jsonify(success=False, message="Please specify a page number"), 400
        except Exception as e:
            print(f"Error in films at {get_home_page_categories.__name__}: {e}")
            return jsonify(success=False, message="Something went wrong"), 500

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
            authorized_account = app.get_authorized_account()
            user_id = None
            if authorized_account != None and authorized_account.account_exists:
                user_id = authorized_account.user_id
            if page != None and mediaType != None and listType != None:
                category = app.film_controller.get_category(
                    user_id=user_id,
                    title=None,
                    media_type=mediaType,
                    list_type=listType,
                    time_window=timeWindow,
                    has_more_pages=True,
                    page=page
                )
                
                #category_results = []
                #if mediaType == FilmType.Movie.value:
                #    # Is movie list type
                #    category_results = app.film_controller.tmdb.get_film_list(FilmType.Movie, listType, int(page), timeWindow)
#
                #elif mediaType == FilmType.TV.value:
                #    # Is tv list type
                #    category_results = app.film_controller.tmdb.get_film_list(FilmType.TV, listType, int(page), timeWindow)
#
                #else:
                #    #print("not tv or movie")
                #    if listType == "trending":
                #        category_results = app.film_controller.tmdb.get_trending_films_list(int(page), timeWindow)
                #    elif listType == "favorites" and user_id != None:
                #        #print("favorites")
                #        favorites = app.db_controller.get_favorites(user_id)
                #        favorites_result = app.film_controller.db_films_to_tmdb_films(favorites)
                #        category_results = favorites_result
                #        category_results.has_more_pages = False
#
                #        #print(favorites)
                #        #print(favorites_result.results)
                #    #elif listType == "watch_history" and user_id != None:
                #    

                if category != None:
                    category.film_list.has_more_pages = category.has_more_pages
                    #print(category.film_list.has_more_pages)
                    categories_json = app.film_controller.tmdb.list_result_to_json(category.film_list)
                    return jsonify(success=True, data=categories_json), 200
                else:
                    return jsonify(success=False, message="Page, media type, list type or time window is invalid."), 404
            else:
                return jsonify(success=False, message="Please specify a page number"), 400
        except Exception as e:
            print(f"Error in films at {category_api.__name__}: {e}")
            return jsonify(success=False, message="Something went wrong"), 500
        
    #
    @app.flask.route("/search_media", methods=['GET'])
    @app.limiter.limit("30 per minute")
    def search_media():
        page = request.args.get("page") or "1"
        mediaType = request.args.get("media_type") or "all"
        query = request.args.get("query")
        includeAdult = request.args.get("include_adult") or "false"

        try:
            if query != None:
                search_results = app.film_controller.tmdb.search_films(
                    query,
                    mediaType,
                    page,
                    includeAdult
                )

                authorized_account = app.get_authorized_account()
                user_id = None
                if authorized_account != None and authorized_account.account_exists:
                    user_id = authorized_account.user_id

                search_results = app.film_controller.do_db_history_passes(user_id, search_results)
                #print(f"{query}, {mediaType}, {page}, {includeAdult}")
                if search_results != None:
                    search_json = app.film_controller.tmdb.list_result_to_json(search_results)

                    return jsonify(success=True, data=search_json), 200
                else:
                    return jsonify(success=False, message="Query did not work"), 404
            else:
                return jsonify(success=False, message="Please specify a page number"), 400
        except Exception as e:
            print(f"Error in films at {search_media.__name__}: {e}")
            return jsonify(success=False, message="Something went wrong"), 500
        
    # toggle_favorite
    @app.flask.route("/toggle_favorite", methods=['POST'])
    @app.limiter.limit("20 per minute")
    def toggle_favorite():
        data = authentication.bytes_to_json(request.get_data())

        try:
            tmdb_id = data["tmdb_id"]
            media_type = data["media_type"].lower()

            authorized_account = app.get_authorized_account()
            if authorized_account != None and authorized_account.account_exists:
                film_data = app.film_controller.tmdb.get_details(media_type, tmdb_id, False)

                name = film_data.name

                toggled_favorite = app.db_controller.toggle_favorite(tmdb_id, authorized_account.user_id,
                    media_type,
                    name,
                    datetime.strptime(film_data.release_date, "%Y-%m-%d").year,
                    film_data.vote_average,
                    film_data.poster_path
                )

                #print(toggled_favorite)
                if (toggled_favorite != None):
                    return jsonify(success=True, favorited=toggled_favorite), 200
                else:
                    return jsonify(success=False, message="Enter a correct tmdb_id"), 400
            else:
                return jsonify(success=False, message="Please specify a valid token"), 401
        except Exception as e:
            print(f"Error in films at {toggle_favorite.__name__}: {e}")
            return jsonify(success=False, message="Something went wrong"), 500
        
    @app.flask.route("/add_to_watch_history", methods=['POST'])
    @app.limiter.limit("20 per minute")
    def add_to_watch_history():
        data = authentication.bytes_to_json(request.get_data())

        try:
            tmdb_id = data["tmdb_id"]
            media_type = data["media_type"].lower()
            season = None
            episode = None

            if media_type.lower() == "tv":
                season = data["season"].lower()
                episode = data["episode"].lower()

        
            film_data = app.film_controller.tmdb.get_details(
                film_type=media_type,
                id=tmdb_id,
                get_episodes=True
            )

            authorized_account = app.get_authorized_account()

            if authorized_account != None and authorized_account.account_exists:
                history_added = app.db_controller.add_film_history(
                    tmdb_id=tmdb_id,
                    user_id=authorized_account.user_id,
                    season=season,
                    episode=episode,
                    media_type=film_data.media_type,
                    name=film_data.name,
                    release_date=film_data.release_date,
                    rating=film_data.vote_average,
                    poster=film_data.poster_path
                )
                if (history_added):
                    return jsonify(success=True), 200
                else:
                    return jsonify(success=False, message="Maybe incorrect tmdb_id"), 400
            else:
                return jsonify(success=False, message="Please specify a valid token"), 401
        except Exception as e:
            print(f"Error in films at {add_to_watch_history.__name__}: {e}")
            return jsonify(success=False, message="Something went wrong"), 500