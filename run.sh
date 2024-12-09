#!/bin/bash  

# Activate the virtual environment  
echo "Activating virtual environment..."  
source venv/bin/activate  

# Run the application  
echo "Running the application..."  
flask --app src run --debug