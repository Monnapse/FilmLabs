"""
    FilmLabs Page Manager
    Made by Monnapse

    11/7/2024
"""

from typing import Optional, Union
from server.packages.tmdb import FilmType, TVListType, MovieListType, TimeWindow, TMDB, ListResult, Movie, TV, ListResult, TVSeason, TVEpisode
from server.packages.db import FilmLabsDB, Film, EpisodeHistory

class Category:
    def __init__(self, 
            title: str, 
            media_type: FilmType, 
            list_type: Optional[Union[TVListType, MovieListType]], 
            time_window: TimeWindow = TimeWindow.Day,
            has_more_pages: bool = False
        ) -> None:

        self.title = title
        self.media_type = media_type
        self.list_type = list_type
        self.time_window = time_window
        self.film_list: ListResult = None
        self.has_more_pages = has_more_pages

class FilmsController:
    def __init__(self, tmdb: TMDB, db: FilmLabsDB, default_page_layout: dict) -> None:
        self.tmdb = tmdb
        self.db = db
        self.default_page_layout = default_page_layout["pages"]

    def categories_to_json(self, categories: list[Category]):
        result = []

        for i in categories:
            category = i.__dict__
            category["film_list"] = self.tmdb.list_result_to_json(i.film_list)

            result.append(category)

        return result

    def get_raw_category_by_page(self, page: int):
        try:
            for i in self.default_page_layout:
                if i["current_page"] == page:
                    return i 
        except:
            return None
        
    def null_check(self, string: str) -> any:
        if string == None or string == "null":
            return None
        return string

    def get_category_name(self, media_type: str = None, list_type: str = None, time_window: str = None) -> str:
        try:
            media_type = self.null_check(media_type)
            list_type = self.null_check(list_type)
            time_window = self.null_check(time_window)
            for page in self.default_page_layout:
                for list in page["categories"]:
                    if list["media_type"] == media_type and list["list_type"] == list_type and list["time_window"] == time_window:
                        return list["name"]
        except:
            return "No title"

    def db_film_to_tmdb_film(self, film: Film) -> Optional[Union[TV, Movie]]:
        if film.media_type == "tv":
            return TV(
                #tmdb_id
                #media_type
                #name 
                #year 
                #rating
                #poster
                id = film.tmdb_id,
                name = film.name,
                release_date = film.release_date,
                vote_average = film.rating,
                poster_path = film.poster
                
            )
        elif film.media_type == "movie":
            return Movie(
                    #tmdb_id
                    #media_type
                    #name 
                    #year 
                    #rating
                    #poster
                    id = film.tmdb_id,
                    title = film.name,
                    release_date = film.release_date,
                    vote_average = film.rating,
                    poster_path = film.poster
                )

    def db_films_to_tmdb_films(self, db_films: list[Film]) -> ListResult:
        tmdb_films = []
        for db_film in db_films:
            tmdb_films.append(self.db_film_to_tmdb_film(db_film))
        list_result = ListResult(results=tmdb_films)
        return list_result

    def seen_episode(self, current_episode: TVEpisode, episodes: list[EpisodeHistory]) -> EpisodeHistory:
        for episode in episodes:
            if current_episode.season_number == episode.season_number and current_episode.episode_number == episode.episode_number:
                return episode
        return None

    def do_db_episodes_pass(self, episodes: list[TVEpisode], episodes_history: list[EpisodeHistory]):
        episodes_pass = []

        for episode in episodes:
            print(f"Season: {episode.season_number}, Episode: {episode.episode_number}, Progress: {episode.progress}")
            seen = self.seen_episode(episode, episodes_history)
            if seen != None:
                print(f"Seen: Season: {seen.season_number}, Episode: {seen.episode_number}, Progress: {seen.progress}")
                episode.progress = seen.progress
            episodes_pass.append(episode)
        return episodes_pass

    def do_db_history_pass(self, user_id: int, film: Optional[Union[Movie, TV]]) -> Optional[Union[Movie, TV]]:
        try:
            if user_id == None: return film
            
            seen_film = self.db.has_seen(user_id, film.id, True)
            #for season in film_details.seasons:
            #for episode in seen_film.episode_history:
            #    print(f"Season: {episode.season_number}, Episode: {episode.episode_number}, Progress: {episode.progress}")
            #print(seen_film)
            if seen_film:
                if film.media_type == "movie":
                    film.progress = seen_film.movie_history.progress
                elif film.media_type == "tv":
                    highest_episode = self.db.get_most_recent_history_episode(seen_film.tmdb_id, seen_film.user_id, seen_film.episode_history)

                    season_pass = []

                    for season in film.seasons:
                        new_episodes = self.do_db_episodes_pass(season.episodes, seen_film.episode_history)
                        season.episodes = new_episodes
                        #print(new_episodes)
                        season_pass.append(season)

                    film.seasons = season_pass
                    #for season in film.seasons:
                    #    for episode in season.episodes:
                    #        print(f"Season: {episode.season_number}, Episode: {episode.episode_number}, Progress: {episode.progress}")
                    if highest_episode != None:
                        #print(seen_film.episode_history[0].progress)
                        film.current_season = highest_episode.season_number
                        film.current_episode = highest_episode.episode_number
                        #film.progress = None
                        #print(f"Season: {highest_episode.season_number}, Episode: {highest_episode.episode_number}, Progress: {highest_episode.progress}")
            return film
        except Exception as e:
            print(f"Error in films controller at {self.do_db_history_pass.__name__}")

        return film

    def do_db_history_passes(self, user_id: int, films: ListResult) -> ListResult:
        try:
            if user_id == None: return films
            new_list = []

            if films and films.results and len(films.results) > 0:
                for film in films.results:
                    #film = self.db.has_seen(user_id, film.id)
                    #if film:
                    new_list.append(self.do_db_history_pass(user_id, film))

            return ListResult(results=new_list)
        except Exception as e:
            print(f"Error in films controller at {self.do_db_history_passes.__name__}: {e}")

        return films

    def get_category(self,
        user_id: int,
        title: str, 
        media_type: FilmType, 
        list_type: Optional[Union[TVListType, MovieListType]], 
        time_window: TimeWindow = TimeWindow.Day,
        has_more_pages: bool = False,
        page: int = 1
    ) -> Category:
        try:
            category = Category(
                title=title,
                media_type=media_type,
                list_type=list_type,
                time_window=time_window,
                has_more_pages=has_more_pages
            )

            if category.media_type == None or category.media_type == "null":
                # Media type is both
                #print("category.media_type == None")
                # trending
                #category.film_list = self.tmdb.get_trending_films_list(1, category.time_window)
                if category.list_type == "trending":
                    category.film_list = self.tmdb.get_trending_films_list(page, category.time_window)
                    #print("Trending")
                elif category.list_type == "favorites" and user_id != None:
                    #print("favorites")
                    favorites = self.db.get_favorites(user_id)
                    favorites_result = self.db_films_to_tmdb_films(favorites)
                    category.film_list = favorites_result
                    category.has_more_pages = False
                    category.film_list.has_more_pages = False
                    #print(favorites)
                elif category.list_type == "watch_history" and user_id != None:
                    #print("watch_history")
                    history = self.db.get_history(user_id)

                    history_result = self.db_films_to_tmdb_films(history)
                    category.film_list = history_result
                    category.has_more_pages = False
                    category.film_list.has_more_pages = False
            #elif category.media_type == None and category.list_type == "favorites":
            #    # Get favorited films
            elif category.media_type == FilmType.Movie.value:
                # Is movie list type
                category.film_list = self.tmdb.get_film_list(FilmType.Movie, category.list_type, page, category.time_window)
            elif category.media_type == FilmType.TV.value:
                # Is tv list type
                category.film_list = self.tmdb.get_film_list(FilmType.TV, category.list_type, page, category.time_window)

            if category.film_list != None:
                category.film_list = self.do_db_history_passes(user_id, category.film_list)

            #print(category.film_list.results)
            
            return category
        except Exception as e:
            print(f"Error in films controller at {self.get_category.__name__}: {e}")
        

    def get_next_categories(self, current_page: int, user_id: int) -> list[Category]:
        try:
            if self.default_page_layout != None and self.get_raw_category_by_page(current_page):
                page = self.get_raw_category_by_page(current_page)

                if page == None: return
    
                categories = []
    
                for category_data in page["categories"]:
                    category = self.get_category(
                        user_id=user_id,
                        title=category_data["name"],
                        media_type=category_data["media_type"],
                        list_type=category_data["list_type"],
                        time_window=category_data["time_window"],
                        has_more_pages=True,
                        page=1
                    )
                    
                    if category.film_list and len(category.film_list.results) > 0:
                        categories.append(category)

                return categories
        except Exception as e:
            print(f"Error in films controller at {self.get_next_categories.__name__}: {e}")