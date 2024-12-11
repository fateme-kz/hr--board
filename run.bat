@echo off

echo Activating virtual environment...
call .\venv\Scripts\activate

echo Running the application...
flask --app src.app run --debug