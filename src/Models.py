from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class Employee(db.Model):
    __tablename__ = 'employee'
    id = db.Column(db.Integer, primary_key=True, nullable=False ,autoincrement=True)
    name = db.Column(db.String(100), nullable=False)

    images = db.relationship('Image', back_populates='employee', cascade='all, delete-orphan')

    def __repr__(self) -> str:
        return f'<Employee {self.name}>'
    

class Image(db.Model):
    __tablename__ = 'images'
    image_filename = db.Column(db.String(200), primary_key=True, nullable=False)
    id = db.Column(db.Integer, db.ForeignKey('employee.id'), nullable=False)
    image_data = db.Column(db.LargeBinary, nullable=False)

    employee = db.relationship('Employee', back_populates='images')

    def __repr__(self) -> str:
        return f'<Image_id:{self.id} file_name:{self.image_filename}, image_data:{self.image_data}>'