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
    All = "all"
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
    Recommendations = "recommendations"

class TVListType(Enum):
    AiringToday = "airing_today"
    OnTheAir = "on_the_air"
    Popular = "popular"
    TopRated = "top_rated"
    Trending = "trending"
    Recommendations = "recommendations"

# Classes
class TVEpisode:
    def __init__(self,
        air_date: str = None,
        episode_number: int = None,
        episode_type: str = None,
        id: int = None,
        name: str = None,
        overview: str = None,
        production_code: str = None,
        runtime: int = None,
        season_number: int = None,
        show_id: int = None,
        still_path: str = None,
        vote_average: float = None,
        vote_count: int = None
    ) -> None:
        self.air_date = air_date
        self.episode_number = episode_number
        self.episode_type = episode_type
        self.id = id
        self.name = name
        self.overview = overview
        self.production_code = production_code
        self.runtime = runtime
        self.season_number = season_number
        self.show_id = show_id
        self.still_path = still_path
        self.vote_average = vote_average
        self.vote_count = vote_count

        self.progress = None

class TVSeason:
    def __init__(self, 
            air_date: str = None,
            episode_count: int = None,
            id: int = None,
            name: str = None,
            overview: str = None,
            poster_path: str = None,
            season_number: int = None,
            vote_average: float = None,
            episodes: list[TVEpisode] = []
        ) -> None:
        self.air_date = air_date
        self.episode_count = episode_count
        self.id = id
        self.name = name
        self.overview = overview
        self.poster_path = poster_path
        self.season_number = season_number
        self.vote_average = vote_average
        self.episodes = episodes

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
        self.original_name = original_title
        self.overview = overview
        self.popularity = popularity
        self.poster_path = poster_path
        self.release_date = release_date
        self.name = title
        self.video = video
        self.vote_average = vote_average
        self.vote_count = vote_count

        self.progress = None

        

    def to_dict(self):
        return self.__dict__

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
            release_date: str = None,
            name: str = None,
            vote_average: float = None,
            vote_count: int = None,

            seasons: list[TVSeason] = [],
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
        self.release_date = release_date
        self.name = name
        self.vote_average = vote_average
        self.vote_count = vote_count

        self.seasons = seasons
        self.current_season = 1
        self.current_episode = 1

    def get_season(self, season_number: int) -> TVSeason:
        for season in self.seasons:
            if season.season_number == int(season_number):
                return season
        return None

class FilmVideo:
    def __init__(self,
            iso_639_1: str = None,
            iso_3166_1: str = None,
            name: str = None,
            key: str = None,
            site: str = None,
            size: int = None,
            type: str = None,
            official: bool = None,
            published_at: str = None,
            id: str = None,
            url: str = None,
            embed_url: str = None
        ) -> None:
        self.name = name
        self.key = key
        self.site = site
        self.size = size
        self.type = type
        self.official = official
        self.published_at = published_at
        self.id = id
        self.url = url
        self.embed_url = embed_url

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
        self.has_more_pages = True

class TMDB:
    def __init__(self, key, poster_sizing:  str = "original"):
        self.key = key

        self.poster_sizing = poster_sizing

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
        if path == None:
            return None
        try:
            base_url = self.config["base_url"]
            return f"{base_url}{self.poster_sizing}{path}"
        except:
            return path

    def video_to_watch_url(self, site: str = "", key: str = ""):
        # https://www.youtube.com/watch?v={key}
        site = str(site).lower()
        if site == "youtube":
            return f"https://www.youtube.com/watch?v={key}"
        
    def video_to_embed_url(self, site: str = "", key: str = ""):
        # https://www.youtube.com/embed/XZ8daibM3AE
        site = str(site).lower()
        if site == "youtube":
            return f"https://www.youtube.com/embed/{key}"    

    def to_film_video(self, data: dict) -> FilmVideo:
        site = data.get("site")
        key = data.get("key")
        url = self.video_to_watch_url(site, key)
        embed_url = self.video_to_embed_url(site, key)

        video_class = FilmVideo(
            iso_639_1 = data.get("iso_639_1"),
            iso_3166_1 = data.get("iso_3166_1"),
            name = data.get("name"),
            key = key,
            site = site,
            size = data.get("size"),
            type = data.get("type"),
            official = data.get("official"),
            published_at = data.get("published_at"),
            id = data.get("id"),
            url = url,
            embed_url = embed_url
        )

        return video_class

    def to_tv_episode(self, data: dict) -> TVEpisode:
        episode_class = TVEpisode(
            air_date = data.get("air_date"),
            episode_number = data.get("episode_number"),
            episode_type = data.get("episode_type"),
            id = data.get("id"),
            name = data.get("name"),
            overview = data.get("overview"),
            production_code = data.get("production_code"),
            runtime = data.get("runtime"),
            season_number = data.get("season_number"),
            show_id = data.get("show_id"),
            still_path = data.get("still_path"),
            vote_average = data.get("vote_average"),
            vote_count = data.get("vote_count"),
        )
        return episode_class

    def get_tv_season_episodes(self, tv_id: int, season: int) -> list[TVEpisode]:
        # tv/1396/season/0?language=en-US"
        api = f"tv/{str(tv_id)}/season/{str(season)}?language=en-US"

        response = self.send_api(api)

        if (response.status_code == 200):
            response_json = response.json()

            episodes = []

            if (response_json["episodes"] != None):
                
                for episode in response_json["episodes"]:
                    new_episode_class = self.to_tv_episode(episode)
                    #print(new_episode_class.progress)
                    episodes.append(new_episode_class)
            return episodes
            
        return []

    def to_tv_season(self, data: dict, get_episodes: bool = False, tv_id: int = None) -> TVSeason:
        episodes = []
        season_number = data.get("season_number")

        if get_episodes:
            episodes = self.get_tv_season_episodes(tv_id, season_number)
        
        season_class = TVSeason(
            air_date = data.get("air_date"),
            episode_count = data.get("episode_count"),
            id = data.get("id"),
            name = data.get("name"),
            overview = data.get("overview"),
            poster_path = data.get("poster_path"),
            season_number = season_number,
            vote_average = data.get("vote_average"),
            episodes = episodes
        )
        return season_class

    def to_movie(self, data: dict) -> Movie:
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
    
    def to_tv(self, data: dict, get_episodes: bool = False) -> TV:
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
            release_date = data.get("first_air_date"),
            name = data.get("name"),
            vote_average = data.get("vote_average"),
            vote_count = data.get("vote_count")
        )

        try:
            if data["seasons"] != None:
                seasons = []
                for season in data["seasons"]:
                    tv_season = self.to_tv_season(season, get_episodes, str(tv_class.id))
                    #for i in tv_season.episodes:
                    #    print(i.progress)
                    seasons.append(tv_season)
                tv_class.seasons = seasons
                #print(seasons[1].episodes)
        except:
            return tv_class

        return tv_class

    def to_film_class(self, film: dict, film_type: FilmType):
        if (enum_to_string(film_type) == FilmType.Movie.value):
            return self.to_movie(film)
        elif (enum_to_string(film_type) == FilmType.TV.value):
            return self.to_tv(film)
        elif (enum_to_string(film_type) == FilmType.All.value):
            #print(self.to_film_class(film, film["media_type"]))
            return self.to_film_class(film, film["media_type"])
        else:
            return None

    def json_to_list_result(self, json_dict: dict, film_type: FilmType) -> ListResult:
        list_result = ListResult(
            page = json_dict["page"],
            results = [],
            total_pages = json_dict["total_pages"],
            total_results = json_dict["total_results"]
        )

        films_results = json_dict["results"]

        for film in films_results:
            film_class = self.to_film_class(film, film_type)
            list_result.results.append(film_class)

        return list_result


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

        if media_type == FilmType.All.value and media_list_type == "trending":
            api = f"{media_list_type}/all/{time}?language=en-US&page={str(page)}"

        #if media_list_type == "trending" and media_type != FilmType.All.value:
        #    # If list is trending then add the time_window as required
        #    api = f"{media_list_type}/{media_type}/{time}?language=en-US&page={str(page)}"

        response = self.send_api(api)

        if (response.status_code == 200):
            response_json = response.json()
            return self.json_to_list_result(response_json, film_type)
            
        return None

    def get_trending_films_list(self, page: int = 1, time_window: TimeWindow = TimeWindow.Day) -> ListResult:
        list = self.get_film_list(FilmType.All, MovieListType.Trending, page, time_window) or ListResult()
        
        return list

    def list_result_to_json(self, list: ListResult):
        result = list.__dict__

        films_list = []

        for i in list.results:
            if (i != None):
                films_list.append(i.__dict__)
                #if i.media_type == "tv" and len(i.seasons) > 0:
                #    print(i.seasons)

        result["results"] = films_list
        #print(result)
        return result
    
    def search_films(self, query: str, film_type: FilmType = FilmType.All, page: int = 1, includeAdult: str = "false"):
        media_type = enum_to_string(film_type)

        if media_type == FilmType.All.value:
            media_type = "multi"

        api = f"search/{media_type}?query={str(query)}&include_adult={str(includeAdult)}&language=en-US&page={str(page)}"
        response = self.send_api(api)

        if (response.status_code == 200):
            response_json = response.json()
            #print(response_json)
            return self.json_to_list_result(response_json, film_type)
        return None
    
    def get_details(self, film_type: FilmType = FilmType.All, id: str = None, get_episodes: bool = False) -> Optional[Union[Movie, TV]]:
        # Movies "movie/693134?language=en-US"
        # TV "tv/series_id?language=en-US"

        media_type = enum_to_string(film_type)

        api = f"{media_type}/{str(id)}?language=en-US"

        response = self.send_api(api)

        if (response.status_code == 200):
            response_json = response.json()

            if media_type == FilmType.Movie.value:
                return self.to_movie(response_json)
            elif media_type == FilmType.TV.value:
                return self.to_tv(response_json, get_episodes)
            
        return None
    
    def get_videos(self, film_type: FilmType = FilmType.All, id: str = None) -> list[FilmVideo]:
        # movie/693134/videos?language=en-US
        # tv/1396/videos?language=en-US"

        media_type = enum_to_string(film_type)

        api = f"{media_type}/{str(id)}/videos?language=en-US"

        response = self.send_api(api)

        if (response.status_code == 200):
            response_json = response.json()

            video_list = []

            for video in response_json["results"]:
                video_list.append(self.to_film_video(video))
                
            return video_list
        return None
    
    def get_trailer(self, film_type: FilmType = FilmType.All, id: str = None) -> FilmVideo:
        videos = self.get_videos(film_type, id)

        trailers = []

        for video in videos:
            try:
                if video.type.lower() == "trailer":
                    trailers.append(video)
            except:
                pass
            #print(f"{video.type}, {video.name}")

        if len(trailers) > 0:
            return trailers[len(trailers)-1]
        else:
            return None
        
    def get_recommendations_for_item(self, item_id: int, film_type: FilmType) -> ListResult:
        """
            Get TMDb recommendations for a single movie or TV show.
            Returns a list of Movie or TV objects.
        """

        media_type = enum_to_string(film_type)
        api_endpoint = f"{media_type}/{item_id}/recommendations?language=en-US&page=1"

        response = self.send_api(api_endpoint)

        if response.status_code == 200:
            data = response.json()
            return self.json_to_list_result(data, film_type)

        else:
            print(f"Error fetching recommendations for {media_type} {item_id}: {response.status_code}")
            return None
        
    def get_recommendations(self, items: list[Union[Movie, TV]]) -> ListResult:
        """
            Get TMDb recommendations for a list of movies or TV shows.
            Returns a list of Movie or TV objects.
        """

        all_recommendations: ListResult = ListResult(
            results=[],
            total_pages=0,
            total_results=0
        )

        for item in items:
            media_type = FilmType.Movie if item.media_type == "movie" else FilmType.TV
            recommendations = self.get_recommendations_for_item(item.id, media_type)
            all_recommendations.results.extend(recommendations.results)
            all_recommendations.total_pages += recommendations.total_pages
            all_recommendations.total_results += recommendations.total_results

        # Remove duplicates based on the 'id' attribute
        all_recommendations.results = {rec.id: rec for rec in all_recommendations.results}.values()
        #print(unique_recommendations)

        return all_recommendations

# Functions
def sort_by_rating(film: Optional[Union[Movie, TV]]):
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
#trending_film_list = api.get_trending_films_list(1, TimeWindow.Week)
#search_query = api.search_films("bojack", FilmType.All, 1, "false")
#dict = api.list_result_to_json(search_query)
#details = api.get_details(FilmType.TV, 1396, True)
#print(details.seasons[3].episodes[3].name)
films_video = api.get_trailer(FilmType.TV, 1396)
print(f"Trailer Url: {films_video.url}, Trailer Name: {films_video.name}")
#

from os import environ

api = TMDB(environ.get("TMDB_API_KEY"))

# Example: Get recommendations for "Fight Club" (TMDb ID 550, movie)
recs = api.get_recommendations_for_item(550, FilmType.Movie)

for r in recs:
    print(f"{r.name} ({r.media_type}) - TMDb ID: {r.id}, Rating: {r.vote_average}")
"""