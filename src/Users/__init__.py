from flask import Blueprint

bp = Blueprint('hr', __name__, template_folder='template', static_folder='static')

from src.Users.URLs import *