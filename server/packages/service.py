"""
    Service Controller
    Made by Monnapse

    11/8/2024
"""

class Service:
    def __init__(self, name: str, movie: str, tv: str) -> None:
        self.name = name
        self.movie_api = movie
        self.tv_api = tv

    def get_movie_url(self, id) -> str:
        try:
            return self.movie_api.format(id=str(id))
        except:
            return None
    
    def get_tv_url(self, id, season, episode) -> str:
        try:
            return self.tv_api.format(id=str(id),season=str(season),episode=str(episode))
        except:
            return None

class ServiceController:
    def __init__(self, services: dict):
        self.services =  services

    def get_services(self) -> list[Service]:
        services = []

        for service_data in self.services:
            service = Service(
                service_data["name"],
                service_data["movie"],
                service_data["tv"]
            )
            services.append(service)

        return services
    
    def get_service(self, name) -> Service:
        for service in self.get_services():
            if service.name == name:
                return service
            
        return None
    
    def get_service_data(self, service_name):
        services = self.get_services()

        current_service_class = self.get_service(service_name)

        if (service_name == None or current_service_class == None):
            # Service not found in argument
            current_service_class = services[0]

        return current_service_class