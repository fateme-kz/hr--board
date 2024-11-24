from src import create_app

app = create_app()

from src import *
from src.Users import *

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)