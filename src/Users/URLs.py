from flask import request, render_template, url_for, jsonify, send_file, Blueprint
import io
from sqlalchemy.orm import joinedload
import mimetypes
from src.Models import Employee, Image, db
import base64

bp = Blueprint('users', __name__, template_folder='template', static_folder='static')

# return the first input page
@bp.route('/')
def index():
    return render_template('input.html')



# get and show image in list page
@bp.route('/image/<int:employee_id>')
def get_image(employee_id):

    # get images from Image table
    image = Image.query.filter_by(id=employee_id)

    # retrieve the image_filename from the URL
    image_filename = request.args.get("image_filename")

    # check existing of filename
    if (image_filename != None):
        # filter image with that name from Image table (it's unique)
        image = image.filter(Image.image_filename==image_filename)

    # if file_name does not exist, it will get first image with that ID
    image = image.first()
    
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



# saving images
def save_img(name, images):

    # create the Employee object
    employee = Employee(name=name)
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



# add user
@bp.route('/user', methods=['POST', 'GET'])
def user():

    if request.method == 'POST':
        # get name of employee from the form
        name_value = request.form.get('name')

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
            save_img(name_value, images)

        # it will give us a list of employee with just one image
        all_employee = db.session.query(Employee).options(joinedload(Employee.images)).all()
        return render_template('list.html', employees=all_employee)


    # get json response (use for other module and the User have not the access)
    else:

        # get all employee from Employee table
        employees = Employee.query.all()

        # if employees exist:
        if employees:

            # make an empty list (json file)
            json_response = []

            # for each employee in employees
            for employee in employees:

                # a dict for put employee data init
                employee_data = {
                    'name': employee.name,
                    'ID': employee.id,
                    'images': []
                }

                # create an empty to get only unique images
                seen_image_filename = set()

                # for each image in images that is in Image table but it has a connection with employee
                for image in employee.images:
                     
                    image_filename = request.args.get("image_filename")
                    if image_filename == image.image_filename:
                        return 'sorry this image is already exist.'

                    # get the url of each image
                    image_url = url_for('users.get_image', employee_id=employee.id, image_filename=image.image_filename, _external=True)

                    # check existing of image
                    if image.image_filename not in seen_image_filename:

                        # append url to images list that we create it before in employee_data
                        employee_data['images'].append(image_url)

                # append employee_data to json_response
                json_response.append(employee_data)

        # return json file        
        return jsonify(json_response)



# fetch data to left panel of list.html
@bp.route('/get_employee_details/<int:employee_id>', methods=['GET'])
def get_employee_details(employee_id):

    # get employee from Employee table
    employee = Employee.query.filter_by(id=employee_id).first()

    # check existing employee
    if not employee:
        return jsonify({'error': 'Employee not found'}), 404
    
    # get first image with employee_id from Image table
    image = Image.query.filter_by(id=employee_id).first()

    # create a dict to save name and image of employee
    employee_details = {
        'name': employee.name,
        'image_data': []
    }

    # add image to dict
    if image:
        image_data = base64.b64encode(image.image_data).decode('utf-8')
        employee_details['image_data'].append(image_data)

    return jsonify(employee_details)




# edit user
@bp.route('/edit/<int:employee_id>', methods=['GET'])
def edit_employee(employee_id):

    # get first employee with the specific id
    employee = Employee.query.filter_by(id=employee_id).first()
        

    images = Image.query.filter_by(id=employee_id).all()

    images_data = []
    # get image_data from images and show each image in front
    for image in images:
        image_data = base64.b64encode(image.image_data).decode('utf-8')
        images_data.append(image_data)

    return render_template('employee.html', employee=employee, employee_id=employee_id, images_data=images_data)




# TODO: DELETE: delete image using delete button on every img that will get image_filename
@bp.route('/edit/<string:image_filename>', methods=['DELETE'])
def delete_image(image_filename):

    # get image filter by the name of image, because its unique
    image = Image.query.filter_by(filename=image_filename)
    
    # check existing the image in DB
    if image is None:
        return 'this image is not in DB'
    
    # delete image from DB
    db.session.delete(image)
    db.session.commit()
    return render_template('employee.html')





# TODO: POST: add new image with using add more image







# TODO: PATCH: edit name of employee using click on name





# delete employee
@bp.route('/delete/<int:employee_id>', methods=['DELETE'])
def delete_user(employee_id):
    employee = Employee.query.get(employee_id)
    if employee is None:
        return "error: employee not found"
    
    db.session.delete(employee)
    db.session.commit()
    return render_template('list.html')



@bp.route('/Images')
def view_images():
    images = Employee.query.all()
    return render_template('images.html', images=images)


def get_attendance():

    # Sajjad's API
    base_url = 'http://192.168.100.113:8000/attendancelog'

    # get the response from base_url
    response = request.get(base_url)
    attendance_logs = response.json()

    # return attendance_logs to jsonify
    for log in attendance_logs:
        return f'attendance logs: {log}'
