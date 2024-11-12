import bcrypt
import json
from flask import Flask, render_template, session, request, jsonify

def hash_password(plain_password):
    salt = bcrypt.gensalt()
    #if isinstance(plain_password, bytes):
    #    plain_password = plain_password.decode("utf-8")
    #print(type(plain_password))
    #print(plain_password)
    hashed_password = bcrypt.hashpw(plain_password.encode(), salt)
    return hashed_password

def check_password(stored_hash, plain_password):
    #print(stored_hash, plain_password)
    return bcrypt.checkpw(plain_password.encode(), stored_hash)

def bytes_to_json(bytes_string):
    decoded_string = bytes_string.decode('utf-8')
    return json.loads(decoded_string)

# Testing
"""
password = "WhatThatIsCrazy#19294"
hashed_password = hash_password(password)
is_correct_password1 = check_password(hashed_password, password)
is_correct_password2 = check_password(hashed_password, "password")
print(f"Hashed password: {hashed_password}\nPassword 1: {is_correct_password1}\nPassword 2: {is_correct_password2}")
"""