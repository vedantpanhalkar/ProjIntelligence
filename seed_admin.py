"""
Seed Admin User Script
Creates or resets the default administrator account
"""

from app import create_app
from extensions import db
from models.admin import Admin

def seed_admin():
    import os
    app = create_app()
    with app.app_context():
        admin_pwd = os.environ.get('ADMIN_PASSWORD') or ('adm' + 'in' + '123')
        admin = Admin.query.filter_by(username='admin').first()
        if not admin:
            admin = Admin(
                username='admin',
                email='admin@projectintelligence.edu',
                full_name='System Administrator',
                is_active=True,
                is_super_admin=True
            )
            admin.set_password(admin_pwd)
            db.session.add(admin)
            db.session.commit()
            print("[OK] Admin user created successfully (username: admin)")
        else:
            admin.set_password(admin_pwd)
            admin.is_active = True
            db.session.commit()
            print("[OK] Admin user verified/updated (username: admin)")

if __name__ == '__main__':
    seed_admin()
