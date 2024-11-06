"""
    Web Manager
    Made by Monnapse

    11/6/2024
"""

from flask import Flask, render_template
import os, glob
import imp
import json

class web_class:
    # This defines the main attributes of the class
    flask: Flask = None

    # The initializer of the class
    # Defines the class attributes
    def __init__(app, flask_app: Flask) -> None:
        app.flask = flask_app
        print("Web Controller >>> is running")

    # Run Directories goes through the Directories Folder
    # and imports the module and runs it
    # directories folder contains all the directories of the site
    def run_directories(app):
        print("running directories");
        for filename in glob.glob(os.path.join("server/directories", '*.py')):
           module = imp.load_source(filename, filename)
           module.run(app)
           print(filename)