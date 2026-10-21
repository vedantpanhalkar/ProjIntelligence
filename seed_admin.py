"""
Seed Admin User Script
Creates or resets the default administrator account
"""

from app import create_app
from extensions import db
from models.admin import Admin

def seed_admin():
    app = create_app()
    with app.app_context():
        admin = Admin.query.filter_by(username='admin').first()
        if not admin:
            admin = Admin(
                username='admin',
                email='admin@projectintelligence.edu',
                password='admin123',
                full_name='System Administrator',
                is_active=True,
                is_super_admin=True
            )
            db.session.add(admin)
            db.session.commit()
            print("[OK] Admin user created successfully (username: admin, password: admin123)")
        else:
            admin.set_password('admin123')
            admin.is_active = True
            db.session.commit()
            print("[OK] Admin user verified/updated (username: admin, password: admin123)")

if __name__ == '__main__':
    seed_admin()
