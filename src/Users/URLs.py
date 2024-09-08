from flask import request , render_template, url_for, jsonify, send_file, Blueprint
import io
import mimetypes
from src.Models import Employee, db

bp = Blueprint('users', __name__, template_folder='template')

@bp.route('/')
def index():
    return render_template('input.html')


@bp.route('/image/<int:employee_id>')  
def get_image(employee_id):  
    employee = Employee.query.get(employee_id)
    if employee is None:
        return "error", 400
    return send_file(io.BytesIO(employee.image_data), mimetype=employee.image_filetype)


@bp.route('/user', methods=['POST', 'GET'])
def user():

    if request.method == 'POST':
        name_value = request.form.get('name')
        files = request.files.getlist('file')
        json_response = []


        for file in files:
            if file:
                binary_data = file.read()
                new = Employee(name=name_value, image_filename=file.filename, image_data=binary_data)
                db.session.add(new)
        db.session.commit()

        for file in files:
            if file:
                result =  {
                    'name': name_value
                }
                json_response.append(result)
            return jsonify(json_response)
        
        return f"file didn't upload", 400
        
    else:
        employees = Employee.query.all()
        json_response = []
        for employee in employees:
            temp = {
                'name': employee.name,
                'image_url': url_for('users.get_image', employee_id=employee.id, _external=True)
            }
            json_response.append(temp)
        
        return jsonify(json_response)


@bp.route('/Images')
def view_images():
    images = Employee.query.all()
    return render_template('images.html', images=images)