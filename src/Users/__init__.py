from flask import Blueprint

bp = Blueprint('users', __name__, template_folder='template')

from src.Users.URLs import *
