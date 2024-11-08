import json

def load_json(directory: str):
    with open(directory) as j:
        return json.load(j)