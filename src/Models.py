from flask_sqlalchemy import SQLAlchemy
from flask import url_for

db = SQLAlchemy()

class Employee(db.Model):
    __tablename__ = 'employee'
    id = db.Column(db.Integer, primary_key=True, nullable=False ,autoincrement=True)
    name = db.Column(db.String(100), nullable=False)
    last_name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    company_name = db.Column(db.String(500))

    images = db.relationship('Image', back_populates='employee', cascade='all, delete-orphan')

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
            # 'image_URL': url_for('hr.get_image', employee_id=self.employee.id, image_filename=self.image_filename, _external=True)
        }