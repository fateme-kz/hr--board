#!/bin/bash  

# Check if the virtual environment directory exists  
if [ ! -d "venv" ]; then  
    echo "Creating virtual environment..."  
    python3 -m venv venv  
fi  

# Activate the virtual environment  
echo "Activating virtual environment..."  
source venv/bin/activate  

# Check if requirements.txt exists and install dependencies  
if [ -f "requirements.txt" ]; then  
    echo "Installing dependencies..."  
    pip install -r src/requirements.txt  
else  
    echo "No requirements.txt file found. Skipping dependency installation."  
fi  

echo "Build complete."  