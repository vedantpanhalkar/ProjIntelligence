"""
Project Model - Simplified for college-level demo
"""

from extensions import db
from datetime import datetime
import os

# Association tables
project_technologies = db.Table('project_technologies',
    db.Column('project_id', db.Integer, db.ForeignKey('projects.id'), primary_key=True),
    db.Column('technology_id', db.Integer, db.ForeignKey('technologies.id'), primary_key=True)
)

project_categories = db.Table('project_categories',
    db.Column('project_id', db.Integer, db.ForeignKey('projects.id'), primary_key=True),
    db.Column('category_id', db.Integer, db.ForeignKey('categories.id'), primary_key=True)
)

class Project(db.Model):
    """Project model"""
    __tablename__ = 'projects'
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    slug = db.Column(db.String(200), unique=True, nullable=False)
    short_description = db.Column(db.String(500))
    description = db.Column(db.Text)
    
    # GitHub integration
    github_url = db.Column(db.String(500))
    repo_path = db.Column(db.String(500))  # Local path to cloned repo
    stars = db.Column(db.Integer, default=0)
    forks = db.Column(db.Integer, default=0)
    
    # Scoring
    health_score = db.Column(db.Float, default=0.0)
    code_quality_score = db.Column(db.Float, default=0.0)
    documentation_score = db.Column(db.Float, default=0.0)
    analysis_data = db.Column(db.Text, nullable=True)  # JSON-encoded analysis report
    
    # Status
    status = db.Column(db.String(50), default='active')  # active, coming_soon, archived
    is_featured = db.Column(db.Boolean, default=False)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    technologies = db.relationship('Technology', secondary=project_technologies, backref='projects')
    categories = db.relationship('Category', secondary=project_categories, backref='projects')
    
    def get_analysis(self):
        """Parse stored JSON analysis or return None"""
        if self.analysis_data:
            try:
                import json
                return json.loads(self.analysis_data)
            except Exception:
                return None
        return None

    def to_dict(self, include_files=False):
        """Convert to dictionary"""
        data = {
            'id': self.id,
            'name': self.name,
            'slug': self.slug,
            'short_description': self.short_description,
            'description': self.description,
            'github_url': self.github_url,
            'stars': self.stars,
            'forks': self.forks,
            'health_score': self.health_score,
            'code_quality_score': self.code_quality_score,
            'documentation_score': self.documentation_score,
            'analysis': self.get_analysis(),
            'status': self.status,
            'is_featured': self.is_featured,
            'has_local_files': bool(self.repo_path and os.path.exists(self.repo_path)),
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'technologies': [tech.to_dict() for tech in self.technologies],
            'categories': [cat.to_dict() for cat in self.categories]
        }
        
        return data

class Technology(db.Model):
    """Technology/Language model"""
    __tablename__ = 'technologies'
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False)
    slug = db.Column(db.String(100), unique=True, nullable=False)
    icon = db.Column(db.String(200))  # Icon class or URL
    color = db.Column(db.String(50))  # Hex color for badges
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'slug': self.slug,
            'icon': self.icon,
            'color': self.color
        }

class Category(db.Model):
    """Category model"""
    __tablename__ = 'categories'
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False)
    slug = db.Column(db.String(100), unique=True, nullable=False)
    description = db.Column(db.Text)
    icon = db.Column(db.String(200))
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'slug': self.slug,
            'description': self.description,
            'icon': self.icon
        }
