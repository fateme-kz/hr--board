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
    return send_file(io.BytesIO(employee.image_data), mimetypes=employee.image_filetype)


@bp.route('/user', methods=['POST', 'GET'])
def user():

    if request.method == 'POST':
        name_value = request.form.get('name')
        files = request.files.getlist('file')
        json_response = {
            'name': name_value,
            'images': []
        }


        for file in files:
            if file:
                binary_data = file.read()
                new = Employee(name=name_value, image_filename=file.filename, image_data=binary_data)
                db.session.add(new)
                db.session.commit()
                image_url = url_for('users.get_image', employee_id=new.id, _external=True)
                json_response['images'].append(image_url)

        return jsonify(json_response)
    
        
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


@bp.route('/Images')
def view_images():
    images = Employee.query.all()
    return render_template('images.html', images=images)