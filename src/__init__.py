from flask import Flask
from flask_migrate import Migrate
from src.Users import bp as hr_blueprint
from src.Models import  db
from src.Users.URLs import to_persian_digits


migrate = Migrate()

def create_app():

    app = Flask(__name__)

    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///employee.db'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    db.init_app(app)
    migrate.init_app(app, db)
    
    # Register the filter as 'persian_number'
    app.jinja_env.filters['persian_number'] = to_persian_digits


    with app.app_context():
        db.create_all()

    app.register_blueprint(hr_blueprint, url_prefix='/hr')

    return app