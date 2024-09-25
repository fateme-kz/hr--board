from flask import request , render_template, url_for, jsonify, send_file, Blueprint
import io
from sqlalchemy.orm import joinedload
import mimetypes
from src.Models import Employee, Image, db

bp = Blueprint('users', __name__, template_folder='template', static_folder='static')

# return the first input page
@bp.route('/')
def index():
    return render_template('input.html')



# get and show image in list page
@bp.route('/image/<int:employee_id>')
def get_image(employee_id):  
    image = Image.query.filter_by(id=employee_id).first()
    if image is None:
        return "error, image NOT found", 404
    
    mime_type, _ = mimetypes.guess_type(image.image_filename)
    if mime_type is None:
        return "mime_type not found"
    
    return send_file(io.BytesIO(image.image_data), mimetype=mime_type)




def save_img(name, images):

    # create the Employee object
    employee = Employee(name=name)
    db.session.add(employee)
    """
    THIS IS A COMMENT WITH MULTIPLE LINES:
    .flush() => it will send all pending changes (such as inserts, updates and deletes) made to objects in the session to the DB.
    However these changes are not committed ; they are simply communication to the DB and held as pending operations within a transaction.
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

            # for each "file" in "files" and if the "file" was not empty, read the binary data and add it  to "images" list
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
        name_value = request.args.get('name')
        employee = Employee.query.filter_by(name=name_value).first()
        if employee:
            json_response = {
                'name': employee.name,
                'images': []
            }
            for image in employee.images:
                image_urls = url_for('users.get_image', employee_id=employee.id, image_filename=image.image_filename, _external=True)
                json_response['images'].append(image_urls)
            

            return jsonify(json_response)



@bp.route('/show_images/<int:employee_id>')
def show_images(employee_id):
    #employee = Employee.query.filter_by(id=employee_id).first()
    #files = request.files.getlist('file')

    image_data = Image.query.filter_by(id=employee_id).all()
    print(f'image data: {image_data}')
    images = []
    for file in image_data:
        print(f'khode file: {file}')
        if file:
            mime_type,_ = mimetypes.guess_type(file.image_filename)
            if mime_type is None:
                return "mime_type not found"
            images.append(file)
            print(f'file name: {file.image_filename}')
            print(f'list images: {images}')

        return (send_file(io.BytesIO(file.image_data), mimetype=mime_type))



# edit user
@bp.route('/edit/<int:employee_id>')
def edit_employee(employee_id):
    employee = Employee.query.filter_by(id=employee_id).first()

    if employee:
        image_data = Image.query.filter_by(id=employee_id).all()

    #all_images = db.session.query(Image).options(joinedload(Image.employee)).all()

    return render_template('employee.html', employee=employee, image_data=image_data, employee_id=employee_id)



# # profile page
# @bp.route('/profile/<int:employee_id>', methods=['PATCH', 'POST', 'DELETE'])
# def profile_employee(employee_id):
#     image_data = db.session.query(employee_id).filter_by(id=employee_id).first()
#     if image_data is None:
#         return "there is no image here"
    
#     if request.method == 'DELETE':
#         db.session.delete(image_data)
#         db.session.commit()
    
#     elif request.method == 'POST':
#         # TODO: request for add new images
    
#     else:
#         # TODO: request to PATCH anf edit the name of user


#     return Response(image_data.data)



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