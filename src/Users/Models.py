from flask_sqlalchemy import SQLAlchemy
from flask import url_for
from sqlalchemy import func
from flask_bcrypt import Bcrypt

db = SQLAlchemy()
bcrypt = Bcrypt()

class Employee(db.Model):
    __tablename__ = 'employee'
    id = db.Column(db.Integer, primary_key=True, nullable=False ,autoincrement=True)
    name = db.Column(db.String(100), nullable=False)
    last_name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    company_name = db.Column(db.String(500))

    images = db.relationship('Image', back_populates='employee', cascade='all, delete-orphan')
    attendances = db.relationship('Attendance', back_populates='employee', cascade='all, delete-orphan') 


    def __repr__(self) -> str:
        return f'<Employee {self.name}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'last_name': self.last_name,
            'description': self.description,
            'company_name': self.company_name,
            'images': [image.to_dict() for image in self.images]  # Include related images
        }


class Image(db.Model):
    __tablename__ = 'images'
    id = db.Column(db.Integer, primary_key=True, nullable=False)
    image_filename = db.Column(db.String(200), nullable=False)
    image_data = db.Column(db.LargeBinary, nullable=False)
    employee_id = db.Column(db.Integer, db.ForeignKey('employee.id'), nullable=False)

    employee = db.relationship('Employee', back_populates='images')

    def __repr__(self) -> str:
        return f'<Image_id:{self.id} file_name:{self.image_filename}, image_data:{self.image_data}>'
    
    def to_dict(self):
        return {
            'image_filename': self.image_filename,
            'id': self.id,
            'image_URL': url_for('hr.get_image', employee_id=self.employee.id, image_filename=self.image_filename, _external=True)
        }


class Attendance(db.Model):
    __tablename__ = 'Attendances'
    id = db.Column(db.Integer, primary_key=True, nullable=False)
    employee_id = db.Column(db.Integer, db.ForeignKey('employee.id'), nullable=False)
    log_type = db.Column(db.String, nullable=False)
    log_time = db.Column(db.DateTime, nullable=False, default=func.now())
    
    employee = db.relationship('Employee', back_populates='attendances')

    def __repr__(self) -> str:  
        return f'<Attendance {self.id} for Employee {self.employee_id}>'  
    
    def to_dict(self):  
        return {  
            'id': self.id,  
            'employee_id': self.employee_id,  
            'log_type': self.log_type,  
            'log_time': self.log_time.isoformat()  # Return log_time in ISO format  
        }  
        
        
class User(db.Model):
    __tablename__ = 'user'
    id = db.Column(db.Integer, primary_key=True, nullable=False)
    user_name = db.Column(db.String(100), unique=True, nullable=False)
    password_hash = db.Column(db.String(300), nullable=False)
    
    def set_password(self, password):
        """Hash and Set the Password"""
        self.password_hash = bcrypt.generate_password_hash(password).decode('utf-8')
        
    def check_password(self, password):
        """verify if the password is correct"""
        return bcrypt.check_password_hash(self.password_hash, password)