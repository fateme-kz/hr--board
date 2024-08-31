from flask import Flask ,request , render_template, url_for, jsonify, send_file
from flask_sqlalchemy import SQLAlchemy
import io

app = Flask(__name__, template_folder='template')


app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///image.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False


db = SQLAlchemy(app)


class Employee(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    image_filename = db.Column(db.String(100), nullable=False)
    image_data = db.Column(db.LargeBinary, nullable=False)


with app.app_context():
    db.create_all()

    def __repr__(self) -> str:
        return f'<Employee and Image {self.name}>'
    

@app.route('/')
def index():
    return render_template('input.html')



@app.route('/image/<int:employee_id>')  
def get_image(employee_id):  
    employee = Employee.query.get(employee_id)
    if employee_id is None:
        return "error", 400
    return send_file(io.BytesIO(employee.image_data), mimetype='image/jpeg')


@app.route('/users', methods=['POST', 'GET'])
def add_user():

    if request.method == 'POST':
        name_value = request.form.get('name')
        file = request.files.get('file')

        if file.filename == '':
            return 'no selected file empty', 400 
        if file is None:
            return 'No selected file none', 400

        
        if file:
            data = file.read()
            filetype = file.filename.rsplit('.', 1)[1].lower()
            new = Employee(name=name_value, image_filename=file.filename, image_data=data)
            db.session.add(new)
            db.session.commit()
        
            return f'upload was successful'
        
        return f"file didn't upload", 400
        
    else:
        employees = Employee.query.all()
        json_response = []
        for employee in employees:
            temp = {
                'name': employee.name,
                'image_url': url_for('get_image', employee_id=employee.id, _external=True)
            }
            json_response.append(temp)
        
        return jsonify(json_response)


@app.route('/Images')
def view_images():
    images = Employee.query.all()
    return render_template('images.html', images=images)


if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)