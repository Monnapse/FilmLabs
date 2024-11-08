"""
    FilmLabs Page Manager
    Made by Monnapse

    11/7/2024
"""

from typing import Optional, Union
from server.packages.tmdb import FilmType, TVListType, MovieListType, TimeWindow, TMDB, ListResult, Movie, TV

class Category:
    def __init__(self, 
            title: str, 
            media_type: FilmType, 
            list_type: Optional[Union[TVListType, MovieListType]], 
            time_window: TimeWindow = TimeWindow.Day
        ) -> None:

        self.title = title
        self.media_type = media_type
        self.list_type = list_type
        self.time_window = time_window

        self.film_list: ListResult = None

class FilmsController:
    def __init__(self, tmdb: TMDB, default_page_layout: dict) -> None:
        self.tmdb = tmdb
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

    def get_next_categories(self, current_page: int) -> list[Category]:
        if self.default_page_layout != None and self.default_page_layout[current_page]:
            page = self.get_raw_category_by_page(current_page)

            if page == None: return

            categories = []

            for category_data in page["categories"]:
                category = Category(
                    title=category_data["name"],
                    media_type=category_data["media_type"],
                    list_type=category_data["list_type"],
                    time_window=category_data["time_window"]
                )

                if category.media_type == None:
                    # Media type is both
                    category.film_list = self.tmdb.get_trending_films_list(1, category.time_window)
                elif category.media_type == FilmType.Movie.value:
                    # Is movie list type
                    category.film_list = self.tmdb.get_film_list(FilmType.Movie, category.list_type, 1, category.time_window)
                elif category.media_type == FilmType.TV.value:
                    # Is tv list type
                    category.film_list = self.tmdb.get_film_list(FilmType.TV, category.list_type, 1, category.time_window)

                categories.append(category)

            return categories