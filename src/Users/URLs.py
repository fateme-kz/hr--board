from flask import request, render_template, url_for, jsonify, send_file, Blueprint, flash, redirect
import io
from sqlalchemy.orm import joinedload
import mimetypes
from src.Models import Employee, Image, db
import base64
import requests

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

        print(f'new images:{new_image}')

        db.session.add(new_image)

    db.session.commit()



# add user
@bp.route('/', methods=['POST', 'GET'])
def user():

    if request.method == 'GET':
        all_employee = db.session.query(Employee).options(joinedload(Employee.images)).all()
        return render_template('list.html', employees=all_employee)
    
    else:
        # get name of employee from the form
        name_value = request.form.get('Fname')

        last_name = request.form.get('Lname')

        description = request.form.get('description')

        company_name = request.form.get('Cname')

        # check existing employee to avoid save again in db
        exist_employee = Employee.query.filter_by(name=name_value).first()
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

            print(f'images: {images}')

        # separation of return for postman collection
        if request.args.get('api') == 'true':
            response = (f'Employee {name_value} added.')
            return (jsonify(response))


        # return for UI
        else:
            # it will give us a list of employee with just one image
            all_employee = db.session.query(Employee).options(joinedload(Employee.images)).all()
            print(f'{all_employee}')
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
def get_employee_details(employee_id):

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
@bp.route('/update_user/<int:employee_id>', methods=['POST', 'GET'])
def update_user(employee_id):

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


# # a function that created from the update_user route and edit_employee
# @bp.route('/employee_changes/<int:employee_id>', methods=['POST', 'GET'])
# def employee_changes(employee_id):
#     if request.method == 'POST':



# delete employee
@bp.route('/delete/<int:employee_id>', methods=['DELETE'])
def delete_user(employee_id):

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
            return render_template('list.html')
    
    except Exception as e:

        # Log error and return a 500 response
        if request.args.get('api') == 'true':
            return jsonify({"error": "Internal server error"}), 500
        
        else:
            return "Internal server error", 500


# get all attendance logs to show in employees list
@bp.route('/attendance_logs', methods=['GET'])
def get_attendance():

    # Sajjad's API
    base_url = 'http://192.168.10.104:5000/attendancelog'

    try:
        
        # send a GET request to get the url
        response = requests.get(base_url)

        # check if the request was successful
        if response.status_code == 200:

            # parse the json file
            attendance_logs = response.json()

            log = attendance_logs["log"]  
            predicted_name = attendance_logs["predicted_name"]  
            time = attendance_logs["time"]  

            print("Log:", log)  
            print("Predicted Name:", predicted_name)  
            print("Time:", time)

            # return all attendance logs as a json response
            # return jsonify({'attendance_logs': attendance_logs}), 200
        
        else:
            
            # return an error message if the API request get fails
            return jsonify({'specific error': 'Failed to retrieve attendance logs'}), response.status_code
        
    except requests.exceptions.RequestException as e:

        # handle exceptions raised by request (e.g. connection error)
        return jsonify({'specific error': 'An error occurred', 'details': str(e)}), 500
    

# get specific employee logs to show in per user page
@bp.route('/get_employee_logs/<int:employee_id>', methods=['GET']) 
def get_employee_logs(employee_id):

    employee = Employee.query.filter_by(id=employee_id).first()

    if not employee:
        return jsonify({'error': 'Employee not found'}), 404

    # Sajjad's API
    base_url = f'http://192.168.10.50:5000/attendancelog/{employee_id}'

    try:

        # Fetch data from external API
        response = requests.get(base_url)

        # Raise HTTPERROR for bad response
        response.raise_for_status()

        # Parse the JSON data
        logs = response.json()

        employee_logs = []
        for log in logs:
            if log.get('employee_id') == employee_id:
                if log.get('log') == 'Enter':
                    employee_logs.append;({
                        'employee_id': log.get('employee_id'),
                        'predicted_name': log.get('predicted_name'),
                        'in-time': log.get('time'),
                        'out-time': None
                    })
                elif log.get('log') == 'Exit':
                    if employee_logs and employee_logs[-1]['out-time'] is None:
                        employee_logs[-1]['out-time'] = log.get('time') 
                        
        print(f'employee logs: {employee_logs}')
        return render_template('per-user.html', employee=employee, logs=employee_logs, employee_id=employee.id)

    except requests.exceptions.RequestException as e:

        # Handle exception (network errors, invalid response, ...)
        print(f'Errrrror fetching logs: {e}')
        return jsonify({'error': 'faild to fetch employee logs'}), 500
