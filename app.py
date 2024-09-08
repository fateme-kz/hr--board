from src import create_app

app = create_app()

from src.Users import *

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)