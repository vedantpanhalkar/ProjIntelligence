"""
Database Initialization Script
Creates tables and seeds initial data
"""

from app import create_app
from extensions import db
from models.project import Project, Technology, Category
from models.admin import Admin

def init_database(drop_existing=False):
    """Initialize database with tables and seed data safely (idempotent)"""
    import sys
    if '--reset' in sys.argv or '--drop' in sys.argv:
        drop_existing = True

    app = create_app()
    
    with app.app_context():
        if drop_existing:
            print("[*] Dropping existing database tables...")
            db.drop_all()
            
        print("[*] Creating database tables...")
        db.create_all()
        
        # Seed technologies if empty
        if Technology.query.count() == 0:
            print("[*] Seeding technologies...")
            seed_technologies()
        else:
            print("[*] Technologies already exist. Skipping seed.")
            
        # Seed categories if empty
        if Category.query.count() == 0:
            print("[*] Seeding categories...")
            seed_categories()
        else:
            print("[*] Categories already exist. Skipping seed.")
            
        # Seed default admin user
        print("[*] Verifying admin user...")
        seed_admin_user()
            
        # Seed initial projects if empty
        if Project.query.count() == 0:
            print("[*] Seeding projects...")
            seed_projects()
        else:
            print("[*] Projects already exist. Skipping seed.")
            
        print("[OK] Database initialized successfully!")

def seed_admin_user():
    """Seed default administrator"""
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

def seed_technologies():
    """Seed programming languages and technologies"""
    technologies = [
        {'name': 'Python', 'slug': 'python', 'color': '#3776AB', 'icon': '🐍'},
        {'name': 'JavaScript', 'slug': 'javascript', 'color': '#F7DF1E', 'icon': '⚡'},
        {'name': 'TypeScript', 'slug': 'typescript', 'color': '#3178C6', 'icon': '📘'},
        {'name': 'React', 'slug': 'react', 'color': '#61DAFB', 'icon': '⚛️'},
        {'name': 'Flask', 'slug': 'flask', 'color': '#000000', 'icon': '🌶️'},
        {'name': 'Node.js', 'slug': 'nodejs', 'color': '#339933', 'icon': '🟢'},
        {'name': 'PostgreSQL', 'slug': 'postgresql', 'color': '#4169E1', 'icon': '🐘'},
        {'name': 'MongoDB', 'slug': 'mongodb', 'color': '#47A248', 'icon': '🍃'},
        {'name': 'HTML/CSS', 'slug': 'html-css', 'color': '#E34F26', 'icon': '🎨'},
        {'name': 'C++', 'slug': 'cpp', 'color': '#00599C', 'icon': '⚙️'},
    ]
    
    for tech_data in technologies:
        tech = Technology(**tech_data)
        db.session.add(tech)
    
    db.session.commit()

def seed_categories():
    """Seed project categories"""
    categories = [
        {
            'name': 'Web Development',
            'slug': 'web-development',
            'description': 'Full-stack web applications and websites',
            'icon': '🌐'
        },
        {
            'name': 'Mobile Development',
            'slug': 'mobile-development',
            'description': 'iOS and Android mobile applications',
            'icon': '📱'
        },
        {
            'name': 'Machine Learning',
            'slug': 'machine-learning',
            'description': 'AI and machine learning projects',
            'icon': '🤖'
        },
        {
            'name': 'Data Science',
            'slug': 'data-science',
            'description': 'Data analysis and visualization projects',
            'icon': '📊'
        },
        {
            'name': 'Game Development',
            'slug': 'game-development',
            'description': 'Video games and interactive experiences',
            'icon': '🎮'
        },
        {
            'name': 'DevOps',
            'slug': 'devops',
            'description': 'CI/CD, automation, and infrastructure',
            'icon': '⚙️'
        },
    ]
    
    for cat_data in categories:
        cat = Category(**cat_data)
        db.session.add(cat)
    
    db.session.commit()

def seed_projects():
    """Seed example projects"""
    # Get technologies and categories
    python = Technology.query.filter_by(slug='python').first()
    flask = Technology.query.filter_by(slug='flask').first()
    javascript = Technology.query.filter_by(slug='javascript').first()
    react = Technology.query.filter_by(slug='react').first()
    nodejs = Technology.query.filter_by(slug='nodejs').first()
    mongodb = Technology.query.filter_by(slug='mongodb').first()
    postgres = Technology.query.filter_by(slug='postgresql').first()
    html_css = Technology.query.filter_by(slug='html-css').first()
    
    web_dev = Category.query.filter_by(slug='web-development').first()
    ml = Category.query.filter_by(slug='machine-learning').first()
    data_science = Category.query.filter_by(slug='data-science').first()
    
    # Project 1: FEATURED - ProjIntelligence Core Platform
    project1 = Project(
        name='ProjIntelligence Core Platform',
        slug='projintelligence-platform',
        short_description='Intelligent repository explorer, deterministic health auditor & static security scanner',
        description='''# ProjIntelligence Core Platform

An intelligent repository platform engineered by Vedant Panhalkar to explore codebases, analyze architectural health, and verify software security.

## Features
- 🎯 Project showcase dashboard with search and filters
- 📊 Code quality analysis and health scoring
- 🌐 GitHub integration for repository analysis
- 📁 Interactive file browser (GitHub-like interface)
- 🎨 Modern, responsive UI with dark/light themes
- 🔍 Advanced search and filtering capabilities

## Tech Stack
- **Backend:** Python Flask with Blueprint architecture
- **Frontend:** HTML5, CSS3, Vanilla JavaScript
- **Database:** PostgreSQL
- **ORM:** SQLAlchemy

## How to Use
1. Browse projects on the dashboard
2. Click any project card to view details
3. Explore code files with the built-in file browser
4. View project health scores and metrics

## Project Structure
```
├── app.py                 # Main Flask application
├── blueprints/            # Route blueprints
├── models/                # Database models
├── services/              # Business logic
├── templates/             # HTML templates
└── static/                # CSS, JS, images
```

## Setup Instructions
1. Install dependencies: `pip install -r requirements.txt`
2. Set up PostgreSQL database
3. Run initialization: `python init_db.py`
4. Start server: `python app.py`
5. Visit http://localhost:5000

## Future Enhancements
- Advanced code analysis with AST parsing
- GitHub authentication
- Real-time collaboration features
- Project comparison tools
''',
        github_url='https://github.com/yourusername/project-intelligence-platform',
        repo_path=__import__('os').path.abspath(__import__('os').path.dirname(__file__)),
        stars=42,
        forks=12,
        health_score=85.5,
        code_quality_score=88.0,
        documentation_score=92.0,
        status='active',
        is_featured=True
    )
    
    project1.technologies.extend([python, flask, javascript, html_css, postgres])
    project1.categories.append(web_dev)
    db.session.add(project1)
    
    # Project 2: Flask
    project2 = Project(
        name='Flask Web Framework',
        slug='flask',
        short_description='A lightweight WSGI web application framework.',
        description='''# Flask
        
Flask is a lightweight WSGI web application framework. It is designed to make getting started quick and easy, with the ability to scale up to complex applications.

## Features
- Built-in development server and debugger
- Integrated support for unit testing
- RESTful request dispatching
- Uses Jinja templating
- Support for secure cookies
''',
        github_url='https://github.com/pallets/flask',
        status='active',
        is_featured=True,
        stars=65000,
        forks=15000,
        health_score=95,
        code_quality_score=92,
        documentation_score=98
    )
    project2.technologies.extend([python, flask])
    project2.categories.append(web_dev)
    db.session.add(project2)
    
    # Project 3: React
    project3 = Project(
        name='React Library',
        slug='react',
        short_description='A declarative, efficient, and flexible JavaScript library for building user interfaces.',
        description='''# React
        
React is a JavaScript library for building user interfaces.

## Features
- Declarative views make code more predictable and easier to debug
- Component-Based architecture
- Learn Once, Write Anywhere
''',
        github_url='https://github.com/facebook/react',
        status='active',
        is_featured=True,
        stars=210000,
        forks=43000,
        health_score=98,
        code_quality_score=95,
        documentation_score=90
    )
    project3.technologies.extend([javascript, react])
    project3.categories.append(web_dev)
    db.session.add(project3)
    
    # Project 4: FastAPI
    project4 = Project(
        name='FastAPI Framework',
        slug='fastapi',
        short_description='FastAPI framework, high performance, easy to learn, fast to code, ready for production',
        description='''# FastAPI
        
FastAPI is a modern, fast (high-performance), web framework for building APIs with Python 3.8+ based on standard Python type hints.

## Features
- Fast: Very high performance, on par with NodeJS and Go.
- Fast to code: Increase the speed to develop features by about 200% to 300%.
- Intuitive: Great editor support. Completion everywhere. Less time debugging.
''',
        github_url='https://github.com/fastapi/fastapi',
        status='active',
        is_featured=False,
        stars=68000,
        forks=5000,
        health_score=92,
        code_quality_score=90,
        documentation_score=96
    )
    project4.technologies.append(python)
    project4.categories.append(web_dev)
    db.session.add(project4)
    
    # Project 5: Express
    project5 = Project(
        name='Express.js',
        slug='express',
        short_description='Fast, unopinionated, minimalist web framework for Node.js',
        description='''# Express
        
Fast, unopinionated, minimalist web framework for node.

## Features
- Robust routing
- Focus on high performance
- Super-high test coverage
- HTTP helpers (redirection, caching, etc)
''',
        github_url='https://github.com/expressjs/express',
        status='active',
        is_featured=False,
        stars=62000,
        forks=11000,
        health_score=85,
        code_quality_score=88,
        documentation_score=85
    )
    project5.technologies.extend([javascript, nodejs])
    project5.categories.append(web_dev)
    db.session.add(project5)
    
    # Project 6: Vue
    project6 = Project(
        name='Vue.js',
        slug='vue',
        short_description='The Progressive JavaScript Framework',
        description='''# Vue.js
        
Vue (pronounced /vjuː/, like view) is a progressive framework for building user interfaces.

## Features
- Approachable: Builds on top of standard HTML, CSS and JavaScript
- Performant: Truly reactive, compiler-optimized rendering system
- Versatile: A rich, incrementally adoptable ecosystem
''',
        github_url='https://github.com/vuejs/core',
        status='active',
        is_featured=False,
        stars=42000,
        forks=7000,
        health_score=90,
        code_quality_score=92,
        documentation_score=94
    )
    project6.technologies.extend([javascript])
    project6.categories.append(web_dev)
    db.session.add(project6)
    
    db.session.commit()
    
    print(f"[OK] Created 6 projects (6 active)")

if __name__ == '__main__':
    init_database()
