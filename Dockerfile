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

# Install Python dependencies
RUN pip install -r requirements.txt

