# Set a build argument to specify the python version
ARG PYTHON_VERSION=3.9.13

# Use the specified python version as the base image for the Docker container
FROM docker.arvancloud.ir/python:${PYTHON_VERSION} as base

# Set the working directory
WORKDIR /app

# Copy the application files
COPY . .

# Copy the requirements file from the src folder to the working directory
COPY src/requirements.txt /app/requirements.txt

# Install dependencies
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
    libgl1-mesa-glx \
    libglib2.0-0 \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Expose the application port (default browser)
EXPOSE 80

# Set environment variables for Flask
ENV FLASK_APP=app.py
ENV FLASK_RUN_HOST=0.0.0.0
ENV FLASK_RUN_PORT=80
ENV FLASK_DEBUG=True

# Initialize Alembic and run migrations
RUN flask db migrate -m "Initial migration" || echo "No new migrations to create"
RUN flask db upgrade || echo "Database already upgraded"

# Start the Flask application when the container starts
CMD ["flask", "run"]
