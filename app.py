"""
Student Project Intelligence & Verification Platform
Main Flask Application Entry Point
"""

from flask import Flask
from flask_cors import CORS
from config import Config
from extensions import db
import os

def create_app(config_class=Config):
    """Application factory pattern"""
    app = Flask(__name__)
    app.config.from_object(config_class)
    app.secret_key = app.config['SECRET_KEY']  # For session management
    
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
    
    # Create database tables
    with app.app_context():
        # Import all models to ensure they're registered
        from models.admin import Admin
        db.create_all()
        print("Database tables created successfully!")
    
    return app

if __name__ == '__main__':
    app = create_app()
    print("=" * 60)
    print("  * Student Project Intelligence Platform")
    print("=" * 60)
    print(f"  Frontend: http://localhost:5000")
    print(f"  API:      http://localhost:5000/api/v1")
    print("=" * 60)
    app.run(debug=True, host='0.0.0.0', port=5000)
