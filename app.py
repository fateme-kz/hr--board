from src import create_app

app = create_app()

from src import *
from src.Users import *

if __name__ == '__main__':
    app.run(debug=True, host='192.168.10.132', port=5000)