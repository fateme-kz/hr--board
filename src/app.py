from src import create_app
import os

# Access environment variables
flask_debug = os.getenv('FLASK_DEBUG')
flask_run_port = os.getenv('FLASK_RUN_PORT')
flask_run_host = os.getenv('FLASK_RUN_HOST')
flask_db_url = os.getenv('DATABASE_PATH')

app = create_app(flask_db_url)
app.secret_key = 'secret'

from src.Users import *
from src.Users import *

if __name__ == '__main__':
    app.run(debug=flask_debug, host=flask_run_host, port=flask_run_port)