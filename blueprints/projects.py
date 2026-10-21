"""
Projects Blueprint - Serves the modern Frontend Application
"""

import os
from flask import Blueprint, send_from_directory, abort

projects_bp = Blueprint('projects', __name__)

FRONTEND_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'frontend'))

@projects_bp.route('/')
@projects_bp.route('/index.html')
def home():
    """Serve the modern Hero landing page"""
    return send_from_directory(FRONTEND_DIR, 'index.html')

@projects_bp.route('/<path:path>')
def serve_frontend_assets(path):
    """Serve static assets and pages from frontend directory"""
    if path.startswith('api/'):
        abort(404)

    target_path = os.path.join(FRONTEND_DIR, path)
    if os.path.isfile(target_path):
        return send_from_directory(FRONTEND_DIR, path)

    if os.path.isfile(target_path + '.html'):
        return send_from_directory(FRONTEND_DIR, path + '.html')

    # Route aliases
    if path in ('projects', 'discovery'):
        return send_from_directory(FRONTEND_DIR, 'projects.html')
    if path == 'about':
        return send_from_directory(FRONTEND_DIR, 'about.html')
    if path in ('admin', 'admin-login'):
        return send_from_directory(FRONTEND_DIR, 'admin.html')
    if path.startswith('project/') or path == 'project-detail':
        return send_from_directory(FRONTEND_DIR, 'project-detail.html')

    return send_from_directory(FRONTEND_DIR, 'index.html')


