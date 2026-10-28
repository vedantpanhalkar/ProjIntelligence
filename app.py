"""
Student Project Intelligence & Verification Platform
Main Flask Application Entry Point
"""

from flask import Flask
from flask_cors import CORS
from config import Config, ProductionConfig, DevelopmentConfig
from extensions import db
import os

def create_app(config_class=None):
    """Application factory pattern"""
    if config_class is None:
        env = os.environ.get('FLASK_ENV', '').lower()
        config_class = ProductionConfig if env == 'production' else Config

    app = Flask(__name__)
    app.config.from_object(config_class)
    app.secret_key = app.config['SECRET_KEY']  # For session management
    
    # Ensure upload directory exists
    upload_folder = app.config.get('UPLOAD_FOLDER')
    if upload_folder:
        os.makedirs(upload_folder, exist_ok=True)
    
    # Initialize extensions
    CORS(app, resources={
        r"/*": {
            "origins": "*",
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization", "X-Requested-With"]
        }
    })
    db.init_app(app)
    
    # Register blueprints
    from blueprints.api import api_bp
    from blueprints.admin import admin_bp
    from blueprints.projects import projects_bp
    
    app.register_blueprint(api_bp, url_prefix='/api/v1')
    app.register_blueprint(admin_bp, url_prefix='/api/v1/admin')
    app.register_blueprint(projects_bp)
    
    # Create database tables & apply lightweight migrations
    with app.app_context():
        from models.admin import Admin
        from models.project import Project
        db.create_all()
        try:
            with db.engine.connect() as conn:
                conn.execute(db.text("ALTER TABLE projects ADD COLUMN analysis_data TEXT"))
                conn.commit()
        except Exception:
            pass
        print("Database tables verified successfully!")
    
    return app

# Expose app instance for WSGI servers expecting app:app
app = create_app()

if __name__ == '__main__':
    print("=" * 60)
    print("  * Student Project Intelligence Platform")
    print("=" * 60)
    print(f"  Frontend: http://localhost:5000")
    print(f"  API:      http://localhost:5000/api/v1")
    print("=" * 60)
    app.run(debug=True, host='0.0.0.0', port=5000)
