"""
    TMDB API Wrapper
    Made by Monnapse

    11/7/2024
"""

import requests
from requests import Response
from enum import Enum
from typing import Optional, Union

# Enums
class FilmType(Enum):
    Movie = "movie"
    TV = "tv"

class TimeWindow(Enum):
    Day = "day"
    Week = "week"

class MovieListType(Enum):
    NowPlaying = "now_playing"
    Popular = "popular"
    TopRated = "top_rated"
    UpComing = "upcoming"
    Trending = "trending"

class TVListType(Enum):
    AiringToday = "airing_today"
    OnTheAir = "on_the_air"
    Popular = "popular"
    TopRated = "top_rated"
    Trending = "trending"

# Classes
class Movie:
    def __init__(
            self,
            adult: bool = None,
            backdrop_path: str = None,
            genre_ids: list[int] = None,
            id: int = None,
            original_language: str = None,
            original_title: str = None,
            overview: str = None,
            popularity: float = None,
            poster_path: str = None,
            release_date: str = None,
            title: str = None,
            video: bool = None,
            vote_average: int = None,
            vote_count: int = None
        ):
        self.media_type = "movie"

        self.adult = adult
        self.backdrop_path = backdrop_path
        self.genre_ids = genre_ids
        self.id = id
        self.original_language = original_language
        self.original_title = original_title
        self.overview = overview
        self.popularity = popularity
        self.poster_path = poster_path
        self.release_date = release_date
        self.title = title
        self.video = video
        self.vote_average = vote_average
        self.vote_count = vote_count

class TV:
    def __init__(
            self,
            adult: bool = None,
            backdrop_path: str = None,
            genre_ids: list[int] = None,
            id: int = None,
            origin_country: list[str] = None,
            original_language: str = None,
            original_name: str = None,
            overview: str = None,
            popularity: float = None,
            poster_path: str = None,
            first_air_date: str = None,
            name: str = None,
            vote_average: float = None,
            vote_count: int = None
        ):
        self.media_type = "tv"

        self.adult = adult
        self.backdrop_path = backdrop_path
        self.genre_ids = genre_ids
        self.id = id
        self.origin_country = origin_country
        self.original_language = original_language
        self.original_name = original_name
        self.overview = overview
        self.popularity = popularity
        self.poster_path = poster_path
        self.first_air_date = first_air_date
        self.name = name
        self.vote_average = vote_average
        self.vote_count = vote_count

class ListResult:
    def __init__(self,
            date_minimum: str = None,
            date_maximum: str = None,
            page: int = None,
            results: Optional[list[Union[Movie, TV]]] = [],
            total_pages: int = None,
            total_results: int = None
        ) -> None:
        self.date_minimum = date_minimum
        self.date_maximum = date_maximum
        self.page = page
        self.results = results
        self.total_pages = total_pages
        self.total_results = total_results

class TMDB:
    def __init__(self, key):
        self.key = key

        self.api_base_url = "https://api.themoviedb.org/3/"
        self.config = self.get_config()

    def get_config(self):
        response = self.send_api("configuration")
        if (response.status_code == 200):
            # Success
            return response.json()["images"]

    def send_api(self, url: str) -> Response:
        headers = {
            "accept": "application/json",
            #"Authorization": self.key
        }
        paramter_method = "?"
        if ("?" in url):
            paramter_method = "&"
        return requests.get(f"{self.api_base_url}{url}{paramter_method}api_key={self.key}", headers=headers)

    def to_img_url(self, path: str):
        try:
            base_url = self.config["base_url"]
            return f"{base_url}original{path}"
        except:
            return path

    def to_movie(self, data: str) -> Movie:
        movie_class = Movie(
            adult = data.get("adult"),
            backdrop_path = self.to_img_url(data.get("backdrop_path")),
            genre_ids = data.get("genre_ids"),
            id = data.get("id"),
            original_language = data.get("original_language"),
            original_title = data.get("original_title"),
            overview = data.get("overview"),
            popularity = data.get("popularity"),
            poster_path = self.to_img_url(data.get("poster_path")),
            release_date = data.get("release_date"),
            title = data.get("title"),
            video = data.get("video"),
            vote_average = data.get("vote_average"),
            vote_count = data.get("vote_count")
        )
        return movie_class
    
    def to_tv(self, data: str) -> TV:
        tv_class = TV(
            adult = data.get("adult"),
            backdrop_path = self.to_img_url(data.get("backdrop_path")),
            genre_ids = data.get("genre_ids"),
            id = data.get("id"),
            origin_country = data.get("origin_country"),
            original_language = data.get("original_language"),
            original_name = data.get("original_name"),
            overview = data.get("overview"),
            popularity = data.get("popularity"),
            poster_path = self.to_img_url(data.get("poster_path")),
            first_air_date = data.get("first_air_date"),
            name = data.get("name"),
            vote_average = data.get("vote_average"),
            vote_count = data.get("vote_count")
        )
        return tv_class

    def get_film_list(self, film_type: FilmType, list_type: Optional[Union[TVListType, MovieListType]] = None, page: int = 1, time_window: TimeWindow = TimeWindow.Day) -> ListResult:
        """
            Gets a list of films either movie or tv

            Args:
                time_window (TimeWindow): you only need to specify this if the list requires it (known required lists that require this are 'trending')
        """

        time = enum_to_string(time_window)
        media_type = enum_to_string(film_type)
        media_list_type = enum_to_string(list_type)

        api = f"{media_type}/{media_list_type}?language=en-US&page={str(page)}"

        if media_list_type == "trending":
            # If list is trending then add the time_window as required
            api = f"{media_list_type}/{media_type}/{time}?language=en-US&page={str(page)}"

        response = self.send_api(api)

        if (response.status_code == 200):
            response_json = response.json()
            list_result = ListResult(
                page = response_json["page"],
                results = [],
                total_pages = response_json["total_pages"],
                total_results = response_json["total_results"]
            )

            films_results = response_json["results"]

            for film in films_results:
                film_class = None
                if (media_type == FilmType.Movie.value):
                    film_class = self.to_movie(film)
                elif (media_type == FilmType.TV.value):
                    film_class = self.to_tv(film)

                list_result.results.append(film_class)

            return list_result
        return None

    def get_trending_films_list(self, page: int = 1, time_window: TimeWindow = TimeWindow.Day) -> ListResult:
        tv_list = self.get_film_list(FilmType.TV, TVListType.Trending, page, time_window) or []
        movie_list = self.get_film_list(FilmType.Movie, MovieListType.Trending, page, time_window) or []
        
        total_pages = 0
        if movie_list.total_pages > tv_list.total_pages:
            total_pages = movie_list.total_pages
        elif tv_list.total_pages > movie_list.total_pages:
            total_pages = tv_list.total_pages

        results = tv_list.results + movie_list.results

        results.sort(reverse=True, key=sort_by_rating)

        #for i in results:
        #    print(f"media type: {i.media_type}, rating: {i.vote_average}%")

        list_result = ListResult(
            page = movie_list.page,
            results = results,
            total_pages = total_pages,
            total_results = movie_list.total_results + tv_list.total_results
        )
        return list_result

    def list_result_to_json(self, list: ListResult):
        result = list.__dict__

        films_list = []

        for i in list.results:
            films_list.append(i.__dict__)

        result["results"] = films_list

        return result


# Functions
def sort_by_rating(film: Optional[Union[Movie, TV]]):
    #print(f"media type: {film.media_type}, rating: {film.vote_average * 10}%")
    return film.vote_average

def enum_to_string(enum):
    if (type(enum) is not str and enum != None):
        enum = enum.value
    return enum

# TESTING
"""
from os import environ
api = TMDB(environ.get("TMDB_API_KEY"))
#movies_list = api.get_movie_list(MovieListType.UpComing, 5)
#tv_list = api.get_film_list(FilmType.TV, TVListType.AiringToday, 5)
trending_film_list = api.get_trending_films_list(1, TimeWindow.Week)
print(api.list_result_to_json(trending_film_list))
"""
