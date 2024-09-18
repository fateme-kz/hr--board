from flask import Blueprint

bp = Blueprint('users', __name__, template_folder='template', static_folder='static')

from src.Users.URLs import *
