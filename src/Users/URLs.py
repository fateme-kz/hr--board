from flask import request , render_template, url_for, jsonify, send_file, Blueprint
import io
import mimetypes
from src.Models import Employee, db

bp = Blueprint('users', __name__, template_folder='template', static_folder='static')

# return the first input page
@bp.route('/')
def index():
    return render_template('input.html')



# get and send image to server with file
@bp.route('/image/<int:employee_id>')  
def get_image(employee_id):  
    employee = Employee.query.get(employee_id)
    if employee is None:
        return "error", 400
    mime_type, _ = mimetypes.guess_type(employee.image_filename)
    if mime_type is None:
        return "mime_type not found"
    return send_file(io.BytesIO(employee.image_data), mimetype=mime_type)


def save_img(name, combined_image_data, image_filename):
    employee = Employee(name=name, image_data=combined_image_data, image_filename=image_filename)
    db.session.add(employee)
    db.session.commit()


# add user
@bp.route('/user', methods=['POST', 'GET'])
def user():

    if request.method == 'POST':
        # get name of employee from the form
        name_value = request.form.get('name')

        exist_employee = Employee.query.filter_by(name=name_value).first()

        if exist_employee:
            print (f"the employee {exist_employee} is already saved in db.")

        else:
            # get files of imgs
            files = request.files.getlist('file')

            # initialize an empty byte string
            combined_image_data = b''
            image_filename = []

            for file in files:
                if file:
                    binary_data = file.read()
                    combined_image_data += binary_data
                    image_filename.append(file.filename)

            all_filename = ', '.join(image_filename)

            save_img(name_value, combined_image_data, all_filename)

        all_employee = db.session.query(Employee.name, Employee.id).order_by(Employee.id.asc()).group_by(Employee.name).all()

        return render_template('list.html', employees=all_employee)


    # get json response (use for other module and the User have not the access)
    else:
        name_value = request.args.get('name')
        employee = Employee.query.filter_by(name=name_value).first()
        if employee:
            json_response = {
                'name': employee.name,
                'images': []
            }
            images = Employee.query.filter_by(name=name_value).all()
            for image in images:
                image_urls = url_for('users.get_image', employee_id=image.id, _external=True)
                json_response['images'].append(image_urls)

            return jsonify(json_response)


# edit user
@bp.route('/edit/<int:employee_id>')
def edit_employee(employee_id):
    employee = Employee.query.get(employee_id)
    if employee is None:
        return "error, employee not found", 404
    return render_template('employee.html', employee_id=employee_id , employee=employee)


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