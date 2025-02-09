from flask import request, render_template, url_for, jsonify, send_file, Blueprint, flash, redirect
import io
from sqlalchemy.orm import joinedload
import mimetypes
from src.Users.Models import Employee, Image, Attendance, User, db
import base64
import requests
from datetime import datetime
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity 
from sqlalchemy.exc import SQLAlchemyError
from flask import jsonify, request
import pytz
from flask_jwt_extended import create_access_token, create_refresh_token, set_access_cookies, set_refresh_cookies, get_jwt_identity
from datetime import timedelta
from flask import jsonify , make_response
import logging  
from blinker import signal


# Configure logging  
logging.basicConfig(level=logging.INFO,  
                    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',  
                    handlers=[  
                        logging.StreamHandler(),  
                        logging.FileHandler("app.log")  
                    ], force=True)  

logger = logging.getLogger(__name__)  




bp = Blueprint('hr', __name__, template_folder='template', static_folder='static')



# get and show image in list page
@bp.route('/image/<int:employee_id>')
def get_image(employee_id):

    # get images from Image table
    images = Image.query.filter_by(employee_id=employee_id)

    # retrieve the image_filename from the URL
    image_filename = request.args.get("image_filename")

    # check existing of filename
    if (image_filename != None):
        
        # for image in images:
            # print(f'image file name: {image.image_filename}')
        # print (f"image filename: {image_filename}")
        # filter image with that name from Image table (it's unique)
        # image = images.filter(Image.image_filename==image_filename).first()

        '''
        next() => this function retrieves the first matching item from an iterable
        '''
        # Assuming `images` is a list of objects with an attribute `image_filename`
        image = next((img for img in images if img.image_filename == image_filename), None)

        # print(f'image: {image}')

    else:
        # if file_name does not exist, it will get first image with that ID
        image = images.first()
    
    # DEBUG
    if image is None:
        return "error, image NOT found", 404

    # get the type of image
    mime_type, _ = mimetypes.guess_type(image.image_filename)

    # DEBUG
    if mime_type is None:
        return "mime_type not found"

    # return image_data    
    return send_file(io.BytesIO(image.image_data), mimetype=mime_type)



# saving images and details of employee in DB
def save_img(name, last_name, description, company_name, images):

    # create the Employee object
    employee = Employee(name=name, description=description, last_name=last_name, company_name=company_name)
    db.session.add(employee)

    """
    .flush() => it will send all pending changes (such as inserts, updates and deletes) made to objects in the session to the DB.
    However these changes are not committed; they are simply communication to the DB and held as pending operations within a transaction.
    """
    db.session.flush()

    for image_filename, image_data in images:
        new_image = Image(image_filename=image_filename, image_data=image_data, employee=employee)


        db.session.add(new_image)

    db.session.commit()



# add employee
@bp.route('/', methods=['GET'])
@jwt_required()
def employee():
    # Get logged-in user ID
    current_user = get_jwt_identity()  
    if not current_user:
        return redirect(url_for('hr.login'))

    all_employee = db.session.query(Employee).options(joinedload(Employee.images)).all()
    return render_template('list.html', employees=all_employee, user=current_user)


    
    

@bp.route('/', methods=['POST'])
def post_employee():
    # get name, last_name, description and company_name of employee from the form
    name_value = request.form.get('Fname')
    last_name = request.form.get('Lname')
    description = request.form.get('description')
    company_name = request.form.get('Cname')

    # check existing employee to avoid save again in db
    exist_employee = Employee.query.filter_by(name=name_value, last_name=last_name).first()
    if exist_employee:
        print (f"the employee {exist_employee} is already saved in db.")

    else:
        # get files of imgs
        files = request.files.getlist('file')

        # create an empty list for images
        images = []

        # for each "file" in "files" and if the "file" was not empty, read the binary data and add it to "images" list
        for file in files:
            if file:
                binary_data = file.read()
                images.append((file.filename, binary_data))

        # save_img" func to save name and images
        save_img(name_value, last_name, description, company_name, images)


    # separation of return for postman collection
    if request.args.get('api') == 'true':
        response = (f'Employee {name_value} added.')
        return (jsonify(response))


    # return for UI
    else:
        
        # it will give us a list of employee with just one image
        all_employee = db.session.query(Employee).options(joinedload(Employee.images)).all()
        print(f'ineee?? {all_employee}')
        return render_template('list.html', employees=all_employee)



# turn numbers to persian digits
def to_persian_digits(number):

    # String of Persian digits from 0 to 9
    persian_digits = '۰۱۲۳۴۵۶۷۸۹'

    # Create a list of Persian digits by checking each character in the number
    persian_number = []
    
    # Convert the number to a string and loop through each character
    for digit in str(number):

        # Check if the character is a digit
        if digit.isdigit():
        
            # Convert the digit to an integer and get the corresponding Persian digit
            persian_number.append(persian_digits[int(digit)])
        
        else:
            # If it's not a digit, just keep it as it is
            persian_number.append(digit)
    
    # Join the list into a single string and return it
    return ''.join(persian_number)





# get json response (use for other module and the User have not the access)
@bp.route('/get_list', methods=['GET'])
def get_list():

        # get all employee from Employee table
        employees = Employee.query.all()
        employee_list = [employee.to_dict() for employee in employees]
        return jsonify(employee_list)

        # # make an empty list (json file)
        # json_response = []

        # # if employees exist:
        # if employees:

        #     # for each employee in employees
        #     for employee in employees:

        #         # a dict for put employee data init
        #         employee_data = {
        #             'name': employee.name,
        #             'ID': employee.id,
        #             'images': []
        #         }

                # # create an empty to get only unique images
                # seen_image_filename = set()

                # # for each image in images that is in Image table but it has a connection with employee
                # for image in employee.images:
                     
                #     image_filename = request.args.get("image_filename")
                #     if image_filename == image.image_filename:
                #         return 'sorry this image is already exist.'

                #     # get the url of each image
                    # image_url = url_for('hr.get_image', employee_id=employee.id, image_filename=image.image_filename, _external=True)

        #             # check existing of image
        #             if image.image_filename not in seen_image_filename:

        #                 # append url to images list that we create it before in employee_data
        #                 employee_data['images'].append(image_url)

        #         # append employee_data to json_response
        #         json_response.append(employee_data)

        # # return json file        
        # return jsonify(json_response)



# fetch data to left panel of list.html
@bp.route('/get_employee_details/<int:employee_id>', methods=['GET'])
@jwt_required()
def get_employee_details(employee_id):
    
    # Ensure user is logged in
    current_user = get_jwt_identity()  

    # get employee from Employee table
    employee = Employee.query.filter_by(id=employee_id).first()

    # check existing employee
    if not employee:
        return jsonify({'error': 'Employee not found'}), 404
    
    # get first image with employee_id from Image table
    image = Image.query.filter_by(employee_id=employee_id).all()


    # create a dict to save name, description and image of employee
    employee_details = {
        'id': employee.id,
        'name': employee.name,
        'last_name': employee.last_name,
        'description': employee.description,
        'company_name': employee.company_name,
        'image_id': [],
        'image_data': []
    }

    # for postman collection:

    # create an empty to get only unique images
    seen_image_filename = set()

    # for each image in images that is in Image table but it has a connection with employee
    for image in employee.images:

        image_filename = request.args.get("image_filename")
        if image_filename == image.image_filename:
            return 'sorry this image is already exist.'

        # get the url of each image
        image_url = url_for('hr.get_image', employee_id=employee.id, image_filename=image.image_filename, _external=True)

        # check existing of image
        if image.image_filename not in seen_image_filename:

            # append url to images list that we create it before in employee_data
            employee_details['image_data'].append(image_url)

        if 'id' not in employee_details:
            employee_details['image_id'] = []

        employee_details['image_id'].append(image.id)
        print(f'image_id: {employee_details}')
            

    # for UI the base64 should write in front of image_data
    # employee_details['image_data'] = base64.b64encode(image.image_data).decode('utf-8')


    return jsonify(employee_details)




# DELETE: delete image using delete button on every img that will get image_filename
@bp.route('/delete_image/<int:image_id>', methods=['DELETE'])
def delete_image(image_id):

    # get image filter by the name of image, because its unique
    image_to_delete = Image.query.get(image_id)
    
    # check existing the image in DB
    if image_to_delete is None:
        return 'this image is not in DB'
    
    # delete image from DB
    db.session.delete(image_to_delete)
    db.session.commit()
    return jsonify({'message': 'Image deleted successfully'}), 200



#PUT: edit name of employee using click on name
'''
when a user wants to edit the name, in fact he's going to PUT data in DB; 
but in form of html we can not use PUT, PATCH and DELETE method. so I use POST method to do it.
'''
@bp.route('/update_employee/<int:employee_id>', methods=['POST', 'GET'])
def update_employee(employee_id):

    # Check the request method is POST request
    if request.method == 'POST':

        # get employee from DB with using employee_id
        employee = Employee.query.filter_by(id=employee_id).first()
        print(f"employee is {employee}")

        # check existing of employee, replace old data with new data in the DB
        if employee:
            employee.name = request.form.get('nameF')
            employee.last_name = request.form.get('nameL')
            employee.description = request.form.get('description')
            employee.company_name = request.form.get('nameC')

            db.session.flush()
            """
            .flush() => it will send all pending changes (such as inserts, updates and deletes) made to objects in the session to the DB.
            However these changes are not committed; they are simply communication to the DB and held as pending operations within a transaction.
            i+I use this command previously in "save_img" function.
            """
                
            # Get the list of uploaded files
            files = request.files.getlist('images')
            # print(f"Images uploaded: {[file.filename for file in images]}")

            images = []

            # Read and save each new_image in list of images
            for file in files:
                if file and file.filename:  # Check if there's an actual file
                    image_data = file.read()
                    images.append((file.filename, image_data))
            


            for image_filename, image_data in images:
                new_image_entry = Image(image_filename=image_filename, image_data=image_data, employee=employee)

                db.session.add(new_image_entry)
                print(f"Saved image for employee {employee.id}")  # Debugging statement

            try:
                print("Preparing to commit. Image data:")
                # for new_image in images:
                #     print(f"Image filename: {new_image.filename}, Employee ID: {employee.id}")

                db.session.commit()

                print('images got committed')
                # return redirect(url_for('hr.user'))  # Redirect to main page after successful update
                return jsonify({'message': 'Employee information and images updated successfully!'}), 200  
                # return redirect(url_for('hr.edit_employee', employee_id=employee.id, employee=employee, do_post=True))


            except Exception as e:

                '''
                ".rollback()" is used to undo any pending database changes in the current session.
                effectively canceling any modifications since the last commit.
                we use it here for error handling.
                '''
                db.session.rollback()
                print(f"Error during commit: {e}")  # This will print out the specific error
                # return f"Error saving images: {str(e)}", 500

            # Check if the `api=true` parameter is in the request
            if request.args.get('api') == 'true':
                # Return JSON response with updated employee details
                return jsonify(employee.to_dict())

            '''
            When we use "redirect", in fact we are using the "GET" method of that URL.
            So if we want to call another method we can do it like what I do in this line.4
            Just use a custom flag and use that flag in the route that we want to redirect.
            '''
            return redirect(url_for('hr.edit_employee', employee_id=employee.id, employee=employee, do_post=True))

        else:
            return "Employee not found", 404  
        
    return redirect(url_for('hr.edit_employee', employee_id=employee.id, employee=employee, do_post=True))

# edit user
@bp.route('/edit/<int:employee_id>', methods=['POST', 'GET'])
def edit_employee(employee_id):

    # get first employee with the specific id
    employee = Employee.query.filter_by(id=employee_id).first()

    # get all images of that employee
    images = Image.query.filter_by(employee_id=employee_id).all()

    # create and empty list for adding images_data
    images_data = []

    # get image_data from images and show each image in front
    for image in images:
        image_data = base64.b64encode(image.image_data).decode('utf-8')
        images_data.append({
            "id": image.id,
            "data": image_data
        })
        print(f"Loaded image for employee {employee.id} as base64.")  # Debugging statement
        return render_template('list.html', employee=employee, employee_id=employee.id, images_data=images_data)



    # Check if the 'do_post' flag is in the URL query parameters
    # if request.args.get('do_post'):

    #     # # response for postman
    #     # employee_detail = [employee.to_dict()]
    #     # return (jsonify(employee_detail))

    #     all_employee = db.session.query(Employee).options(joinedload(Employee.images)).all()
    #     return render_template('list.html', employees=all_employee)


    # if we have a GET request, render another page
    if request.method == 'GET':
        return render_template('list.html', employee=employee, employee_id=employee.id, images_data=images_data)



# delete employee
@bp.route('/delete/<int:employee_id>', methods=['DELETE'])
def delete_employee(employee_id):

    try:

        # get the employee with specific ID from Employee table
        employee = Employee.query.get(employee_id)

        # check existing of employee
        if employee is None:

            # return Error foe postman
            if request.args.get('api') == 'true':
                return jsonify({"error": "Employee not found"}), 404
        
            # return Error in UI
            return "error: employee not found"
        
        db.session.delete(employee)
        db.session.commit()

        # separation of return for postman collection
        if request.args.get('api') == 'true':
            employee_detail =(f' employee {[employee.to_dict()]} get deleted')
            return (jsonify(employee_detail))

        # return for UIq
        else:
            return jsonify({"message": "Employee deleted successfully"}), 200
    
    except Exception as e:

        # Log error and return a 500 response
        if request.args.get('api') == 'true':
            return jsonify({"error": "Internal server error"}), 500
        
        else:
            return "Internal server error", 500



# get all attendance logs to show in employees list
@bp.route('/attendance_logs', methods=['GET'])
@jwt_required()
def get_attendance():

    # Sajjad's API
    base_url = 'http://192.168.10.7:5000/attendancelog'

    try:
        
        # send a GET request to get the url
        response = requests.get(base_url)

        # check if the request was successful
        if response.status_code == 200:

            # parse the json file
            attendance_logs = response.json()
            
            employees_logs = {}
            
            for log in attendance_logs:
                 
                employee_id = log['employee_id']
                log_type = log['log']
                log_time = log['time']
                
                if employee_id not in employees_logs:
                    employees_logs[employee_id] = {
                        'Enter': None,
                        'Exit': None
                    }
                    
                if log_type == 'Enter' and employees_logs[employee_id]['Enter'] is None:
                    employees_logs[employee_id]['Enter'] = log_time
                
                elif log_type == 'Exit':
                    employees_logs[employee_id]['Exit'] = log_time
            
            print(f'employees logs: {employees_logs}')

            # return all attendance logs as a json response
            return jsonify({'attendance_logs': employees_logs}), 200
        
        else:
            
            # return an error message if the API request get fails
            return jsonify({'specific error': 'Failed to retrieve attendance logs'}), response.status_code
        
    except requests.exceptions.RequestException as e:

        # handle exceptions raised by request (e.g. connection error)
        return jsonify({'specific error': 'An error occurred', 'details': str(e)}), 500


    
# get specific employee logs to show in per user page
@bp.route('/get_employee_logs/<int:employee_id>', methods=['GET'])
def get_employee_logs(employee_id):
    
    # Fetch employee from the database
    employee = Employee.query.filter_by(id=employee_id).first()

    if not employee:
        return jsonify({'error': 'Employee not found'}), 404

    # sajjad's url
    base_url = f'http://192.168.10.7:5000/attendancelog/{employee_id}'
    
    try:
        # Fetch data from the external API
        response = requests.get(base_url)

        # Raise HTTPERROR for bad response
        response.raise_for_status()

        # Parse the JSON data
        logs = response.json()
        
        print(f"API Response for employee {employee_id}: {logs}")  # Log the response
        
        if not logs:
            print(f"No logs found for employee {employee_id}")
            return jsonify({'employee': employee.id, 'logs': []}), 200  # Empty logs


        employee_logs = []
        for log in logs:
            print(f"Processing log: {log}")  # Log each log for inspection
            
            if log.get('employee_id') == employee_id:
                
                if log.get('log') == 'Enter':
                    employee_logs.append({
                        'employee_id': log.get('employee_id'),
                        'predicted_name': log.get('predicted_name'),
                        'in-time': log.get('time'),
                        'out-time': None
                    })
                    
                elif log.get('log') == 'Exit':
                    print("Adding 'Exit' log")  # Debugging log
                    
                    if employee_logs and employee_logs[-1]['out-time'] is None:
                        employee_logs[-1]['out-time'] = log.get('time')
                        
                    elif not employee_logs:
                        # If no 'Enter' log exists yet, we append 'Exit' with None for 'in-time'
                        employee_logs.append({
                            'employee_id': log.get('employee_id'),
                            'predicted_name': log.get('predicted_name'),
                            'in-time': None,
                            'out-time': log.get('time')
                        })

        print(f'Employee logs: {employee_logs}')
        return jsonify({'employee': employee.id, 'logs': employee_logs})  # Return JSON response

    except requests.exceptions.RequestException as e:
        # Handle exception for API errors
        print(f'Error fetching logs: {e}')
        return jsonify({'error': 'Failed to fetch employee logs'}), 500



# Get and show attendance log from the database
@bp.route('/get_db_log/<int:employee_id>', methods=['GET'])
def get_database_log(employee_id):
    
    # Find the employee by ID
    employee = Employee.query.filter_by(id=employee_id).first()
    
    # Check if the employee exists
    if not employee:
        return jsonify({"error": "This employee doesn't exist!"}), 404  
    
    page = request.args.get('page', type=int)
    per_page = request.args.get('per_page', type=int)
    
    # Query logs for the employee
    logs = Attendance.query.filter_by(employee_id=employee_id).order_by(Attendance.log_time.asc()).paginate(page=page, per_page=per_page, error_out=False)
    print(f'{logs}')
    
    employee_logs = []
    current_entry = {}  

    for log in logs:  
        print(f"Processing log: {log}")  # Debugging log  
        
        if log.log_type == 'enter':  
            # Start a new entry with the in_time  
            current_entry['in_time'] = log.log_time.isoformat()  
            
        elif log.log_type == 'exit':  
            
            # If there's an existing entry, add the out_time  
            if current_entry:  
                current_entry['out_time'] = log.log_time.isoformat()  
                # Append the entry to employee_logs  
                employee_logs.append(current_entry)  
                current_entry = {}  # Reset for the next pair  
                
            else:  
                # If there's no corresponding Enter, create a new entry with in_time as None  
                employee_logs.append({  
                    'in_time': None,  
                    'out_time': log.log_time.isoformat()  
                })   

    # If there's an unpaired entry (only Enter without Exit), handle it  
    if current_entry and 'in_time' in current_entry:  
        current_entry['out_time'] = None  # No exit time  
        employee_logs.append(current_entry)  

    print(f'Employee logs: {employee_logs}')
    return jsonify({'employee': employee.to_dict(), 'logs': employee_logs})  # Return JSON response



# POST part of get_employee_logs
@bp.route('/get_employee_logs/<int:employee_id>', methods=['POST'])
def post_employee_logs(employee_id):
    
    # find the employee using the ID
    employee = Employee.query.filter_by(id=employee_id).first()
    
    # check existing of employee
    if not employee:
        return f"this employee does't exist!"
    
    else:
        # add type of log
        log_type = request.form.get('log_type')
        
        # add time of log
        log_time = request.form.get('log_time')
        
        # Parse log_time to a datetime object if necessary  
        try:  
            # Ensure the format is correct  
            log_time = datetime.fromisoformat(log_time)  
            
        except ValueError:  
            return jsonify({"error": "Invalid log_time format!"}), 400 
        
        logs = Attendance(log_time=log_time, log_type=log_type, employee_id=employee_id)
        
        # add to the session and commit  
        try:  
            db.session.add(logs)  
            db.session.commit() 
            
        except Exception as e:  
            # Rollback the session on error  
            db.session.rollback() 
            # Return an error response  
            return jsonify({"error": str(e)}), 500  
        
        return jsonify({"message": "Mission completed!"})



# A delete route that will clear all of logs
@bp.route('/clear_attendance_logs', methods=['DELETE'])
def clear_attendance_logs():
    
    db.session.query(Attendance).delete()
    db.session.commit()
    return f'Attendance table get cleared successfully.'



@bp.route('/update_attendance_logs', methods=['GET'])
def update_attendance_logs():

    # Sajjad's API
    base_url = 'http://192.168.10.7:5000/attendancelog'

    try:
        
        # Send a GET request to fetch the URL
        response = requests.get(base_url)

        # Check if the request was successful
        if response.status_code == 200:
                
            # Parse the JSON response
            attendance_logs = response.json()

            for log in attendance_logs:
                employee_id = log['employee_id']
                log_type = log['log']
                log_time_str = log['time']

                # Convert log_time from string to datetime object
                try:
                    log_time = datetime.strptime(log_time_str, '%H:%M:%S, %Y/%m/%d')
                except ValueError:
                    print(f"Invalid log_time format: {log_time_str}. Skipping log.")
                    continue

                # Check if the employee exists in the database
                employee = Employee.query.filter_by(id=employee_id).first()
                if not employee:
                    print(f"Employee ID {employee_id} does not exist. Skipping log.")
                    continue

                # Check if the log already exists in the database
                existing_log = Attendance.query.filter_by(
                    employee_id=employee_id,
                    log_type=log_type,
                    log_time=log_time
                ).first()

                if existing_log:
                    print(f"Log already exists for Employee ID {employee_id} - Type: {log_type}, Time: {log_time}. Skipping.")
                    continue

                # Create a new attendance log and save it to the database
                new_log = Attendance(
                    employee_id=employee_id,
                    log_type=log_type,
                    log_time=log_time
                )
                db.session.add(new_log)

            # Commit all changes to the database
            db.session.commit()
            print("Attendance logs saved to the database successfully.")

            # Return a success response
            return jsonify({'message': 'Attendance logs saved successfully'}), 200

        else:
            # Return an error message if the API request fails
            return jsonify({'specific error': 'Failed to retrieve attendance logs'}), response.status_code

    except requests.exceptions.RequestException as e:
        # Handle exceptions raised by request (e.g., connection error)
        return jsonify({'specific error': 'An error occurred', 'details': str(e)}), 500



# Define a signal for unregistered login attempts
unregistered_login_attempt = signal('unregistered_login_attempt')

# Function to handle unregistered login attempts
def log_unregistered_attempt(sender, username, ip, **extra):
    logger.warning(f"🚨 Unregistered login attempt! Username: {username}, IP: {ip}")

# Connect the function to the signal
unregistered_login_attempt.connect(log_unregistered_attempt)



@bp.route('/login', methods=['GET', 'POST'])
def login():
    
    if request.method == 'GET':
        return render_template('authentication.html')

    else:
        # Handle POST requests for login
        data = request.get_json()
        user_name = data.get('username')
        password = data.get('password')
        user_ip = request.remote_addr  # Get the user's IP address


        user = User.query.filter_by(user_name=user_name).first()

        if not user:
            # Emit signal when an unregistered user attempts to log in
            unregistered_login_attempt.send(username=user_name, ip=user_ip)
            return jsonify({"error": "User not found!", "type": "unregistered"}), 404

        if not user.check_password(password):
            return jsonify({"error": "Invalid password!", "type": "wrong_password"}), 401

        logger.info(f"*** Login successful for user: {user_name}")

        access_token = create_access_token(identity=str(user.id), expires_delta=timedelta(hours=1))  
        refresh_token = create_refresh_token(identity=str(user.id), expires_delta=timedelta(days=7))

        response = make_response(redirect(url_for('hr.employee')))
        response.set_cookie('access_token_cookie', access_token, httponly=True, samesite='Lax')
        response.set_cookie('refresh_token_cookie', refresh_token, httponly=True, samesite='Lax')
        
        return response





@bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    response = make_response(redirect(url_for('hr.login')))  # Redirect to login page
    response.delete_cookie('access_token_cookie')
    response.delete_cookie('refresh_token_cookie')
    flash("You have been logged out!", "info")
    return response



@bp.route('/protected', methods=['GET'])
@jwt_required()
def protected():
    current_user = get_jwt_identity()
    return jsonify({"message": f"Hello, {current_user}! You are accessing a protected route."})



@bp.route('/receive_log', methods=['POST'])
def receive_logs_from_telegram():
    """API to receive logs from telegram, match the name in Employee table, and save log in Attendance table."""
    
    try:
        data = request.json

        # Validate required fields
        required_fields = ["name", "log_type", "log_time"]
        
        if not all(field in data for field in required_fields):
            return jsonify({"error": "Missing required fields"}), 400

        name = data["name"]
        log_type = data["log_type"]
        log_time = data["log_time"]


        # Search for the employee by name
        employee = Employee.query.filter_by(name=name).first()

        if not employee:
            return jsonify({"error": f"Employee with name '{name}' not found."}), 404

        # Save log with found employee_id
        new_log = Attendance(
            # Assign the correct employee ID
            employee_id=employee.id,  
            log_type=log_type,
            log_time=log_time
        )
        
        db.session.add(new_log)
        db.session.commit()

        return jsonify({
            "status": "success",
            "message": f"Log saved for employee '{name}' (ID: {employee.id})."
        }), 200

    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"error": f"Database error: {str(e)}"}), 500
    except Exception as e:
        return jsonify({"error": f"Unexpected error: {str(e)}"}), 500


@bp.route('/get_logs', methods=['GET'])
def get_logs():
    """Retrieve all attendance logs for a given employee."""

    employee_name = request.args.get("name")

    if not employee_name:
        return jsonify({"error": "Missing employee name"}), 400

    # Find employee by name
    employee = Employee.query.filter_by(name=employee_name).first()
    if not employee:
        return jsonify({"error": "Employee not found"}), 404

    # Fetch all logs for the employee, sorted by log_time
    logs = Attendance.query.filter_by(employee_id=employee.id).order_by(Attendance.log_time).all()

    if not logs:
        return jsonify([]), 200  # Return an empty list if no logs exist

    return jsonify([log.to_dict() for log in logs]), 200


@bp.route('/last_log', methods=['GET'])
def get_last_log():
    """Returns the last log entry for a given user (by name)."""
    
    try:
        name = request.args.get("name")

        if not name:
            return jsonify({"error": "Name parameter is required."}), 400

        # Search for the employee by name
        employee = Employee.query.filter_by(name=name).first()

        if not employee:
            return jsonify({"error": f"Employee with name '{name}' not found."}), 404

        # Get the last log entry
        last_log = Attendance.query.filter_by(employee_id=employee.id).order_by(Attendance.log_time.desc()).first()

        if last_log:
            return jsonify({"last_log_type": last_log.log_type, "log_time": last_log.log_time.isoformat()}), 200
        else:
            return jsonify({"last_log_type": None}), 200

    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"error": f"Database error: {str(e)}"}), 500
    except Exception as e:
        return jsonify({"error": f"Unexpected error: {str(e)}"}), 500



@bp.route('/last_enter_exit', methods=['GET'])
def last_enter_exit():
    """Returns the last Enter and Exit log for a given employee (by ID)."""
    try:
        employee_id = request.args.get("id")

        if not employee_id:
            return jsonify({"error": "Employee ID parameter is required."}), 400

        # Search for the employee by ID
        employee = Employee.query.filter_by(id=employee_id).first()

        if not employee:
            return jsonify({"error": f"Employee with ID '{employee_id}' not found."}), 404

        # Get the last Enter and Exit logs
        last_enter = Attendance.query.filter_by(employee_id=employee.id, log_type="enter").order_by(Attendance.log_time.desc()).first()
        last_exit = Attendance.query.filter_by(employee_id=employee.id, log_type="exit").order_by(Attendance.log_time.desc()).first()

        return jsonify({
            "last_enter_time": last_enter.log_time.isoformat() if last_enter else None,
            "last_exit_time": last_exit.log_time.isoformat() if last_exit else None
        }), 200

    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"error": f"Database error: {str(e)}"}), 500
    except Exception as e:
        return jsonify({"error": f"Unexpected error: {str(e)}"}), 500
