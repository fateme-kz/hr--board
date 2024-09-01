# HR--Board

## What "HR Board" does?

This project is a part of a module in big project.

It's ganna save the name and the picture of employees that user will upload.

## Features:

Get and save the name, Get and save the images in DB

## Tech Stack:
- Python
- HTML & CSS
- JavaScript

## DB and Dependencies:
- SQLite
- SQLAlchemy
- Flask

of course that i put them in requirements file.

## Installation:
Clone the repository:
```
https://github.com/fateme-kz/hr--board
```
After cloning step and pull the project, you have to use some batch file to use the dependencies and running the project locally.

Use this command in powershell to create the virtual environment and install dependencies.
```
.\build.bat
```

After that you have to use next command to active the venv and run the project.
```
.\run.bat
```

## Usage Instructions:
After running step you can see a web page that have two inputs. At first, choose the picture you want and use the **choose photo** button to upload it.

After that you can write the name of employee in the next input.

Finally you can use the submit button. You will see a message like **upload was successful**; If you get another message like **No selected file** or something like that, it means your image doesn't upload. Try another type of picture.