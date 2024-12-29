from flask import Flask
from flask_cors import CORS
from flask_migrate import Migrate
from src.Users import bp as hr_blueprint
from src.Users.Models import db
from src.Users.URLs import to_persian_digits
import os

migrate = Migrate()

def create_app(db_url):

    app = Flask(__name__)
    
    # Enable CORS for all routes
    CORS(app)

    app.config['MAX_CONTENT_LENGTH'] = 100 * 1024 * 1024
    app.config['SQLALCHEMY_DATABASE_URI'] = db_url
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    # Ensure the instance folder exists
    try:
        os.makedirs(app.instance_path, exist_ok=True)
    except OSError:
        pass

    db.init_app(app)    
    migrate.init_app(app, db)
    
    # Register the filter as 'persian_number'
    app.jinja_env.filters['persian_number'] = to_persian_digits


    with app.app_context():
        db.create_all()

    app.register_blueprint(hr_blueprint, url_prefix='/hr')

    return app