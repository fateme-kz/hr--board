from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class Employee(db.Model):
    __tablename__ = 'employee'
    id = db.Column(db.Integer, unique=True, primary_key=True, nullable=False ,autoincrement=True)
    name = db.Column(db.String(100), nullable=False)
    image_filename = db.Column(db.String(100), nullable=False)
    image_data = db.Column(db.LargeBinary, nullable=False)

    def __repr__(self) -> str:
        return f'<Employee {self.name}>'
    
