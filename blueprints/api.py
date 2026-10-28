"""
API Blueprint - REST API Routes
"""

from flask import Blueprint, jsonify, request
from services.project_service import ProjectService
from services.analytics_service import AnalyticsService

api_bp = Blueprint('api', __name__)
project_service = ProjectService()
analytics_service = AnalyticsService()

# ============ Health Check ============

@api_bp.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'success': True,
        'status': 'healthy',
        'version': '2.0.0'
    })

# ============ Projects API ============

@api_bp.route('/projects', methods=['GET'])
def get_projects():
    """Get all projects with pagination and multi-facet filters"""
    page = request.args.get('page', 1, type=int)
    per_page_param = request.args.get('per_page') or request.args.get('limit') or 12
    try:
        per_page = int(per_page_param)
    except (ValueError, TypeError):
        per_page = 12
    search = request.args.get('search', '') or request.args.get('q', '')
    category = request.args.get('category', '')
    language = request.args.get('language', '') or request.args.get('tech', '')
    grade = request.args.get('grade', '')
    sort = request.args.get('sort') or request.args.get('sortBy') or 'featured'
    
    result = project_service.get_all_projects(
        page=page,
        per_page=per_page,
        search=search,
        category=category,
        language=language,
        grade=grade,
        sort=sort
    )
    
    return jsonify({
        'success': True,
        'data': result
    })

@api_bp.route('/projects/<int:project_id>', methods=['GET'])
def get_project(project_id):
    """Get single project by ID"""
    project = project_service.get_project_by_id(project_id)
    
    if not project:
        return jsonify({
            'success': False,
            'error': {
                'code': 'PROJECT_NOT_FOUND',
                'message': 'Project not found'
            }
        }), 404
    
    return jsonify({
        'success': True,
        'data': project
    })

@api_bp.route('/projects/<int:project_id>/files', methods=['GET'])
def get_project_files(project_id):
    """Get project file structure"""
    path = request.args.get('path', '')
    files = project_service.get_project_files(project_id, path)
    
    return jsonify({
        'success': True,
        'data': files
    })

@api_bp.route('/projects/<int:project_id>/file-content', methods=['GET'])
def get_file_content(project_id):
    """Get content of a specific file"""
    file_path = request.args.get('path', '')
    content = project_service.get_file_content(project_id, file_path)
    
    return jsonify({
        'success': True,
        'data': content
    })

@api_bp.route('/projects/<int:project_id>/analysis', methods=['GET'])
def get_project_analysis(project_id):
    """Get detailed deterministic health & security analysis report"""
    analysis = project_service.get_project_analysis(project_id)
    if not analysis:
        return jsonify({
            'success': False,
            'error': {
                'code': 'ANALYSIS_NOT_FOUND',
                'message': 'Analysis could not be generated for this project.'
            }
        }), 404
    return jsonify({
        'success': True,
        'data': analysis
    })

@api_bp.route('/projects/<int:project_id>/analysis-summary', methods=['GET'])
def get_project_analysis_summary(project_id):
    """Get project analysis and health metrics breakdown"""
    project = project_service.get_project_by_id(project_id)
    if not project:
        return jsonify({'success': False, 'error': {'code': 'NOT_FOUND', 'message': 'Project not found'}}), 404
        
    summary = {
        'project_id': project['id'],
        'name': project['name'],
        'health_score': project.get('health_score', 0.0),
        'code_quality_score': project.get('code_quality_score', 0.0),
        'documentation_score': project.get('documentation_score', 0.0),
        'stars': project.get('stars', 0),
        'forks': project.get('forks', 0),
        'status': project.get('status', 'active'),
        'technologies': [t['name'] for t in project.get('technologies', [])],
        'categories': [c['name'] for c in project.get('categories', [])],
        'analysis': project.get('analysis')
    }
    return jsonify({
        'success': True,
        'data': summary
    })

@api_bp.route('/projects/compare', methods=['GET'])
def compare_projects():
    """Compare two projects side-by-side"""
    id1 = request.args.get('id1', type=int)
    id2 = request.args.get('id2', type=int)
    
    if not id1 or not id2:
        return jsonify({
            'success': False,
            'error': {'code': 'INVALID_PARAMS', 'message': 'Both id1 and id2 query parameters are required.'}
        }), 400
        
    p1 = project_service.get_project_by_id(id1)
    p2 = project_service.get_project_by_id(id2)
    
    if not p1 or not p2:
        return jsonify({
            'success': False,
            'error': {'code': 'PROJECT_NOT_FOUND', 'message': 'One or both projects could not be found.'}
        }), 404
        
    a1 = project_service.get_project_analysis(id1) or {}
    a2 = project_service.get_project_analysis(id2) or {}
    
    return jsonify({
        'success': True,
        'data': {
            'project1': {**p1, 'analysis': a1},
            'project2': {**p2, 'analysis': a2}
        }
    })

@api_bp.route('/projects/<int:project_id>/download', methods=['GET'])
def download_project(project_id):
    """Download project folder as a ZIP file safely"""
    import os
    import shutil
    import tempfile
    import zipfile
    from flask import send_file, after_this_request
    from models.project import Project
    
    project = Project.query.get(project_id)
    if not project or not project.repo_path:
        return jsonify({'success': False, 'error': 'Project folder not found.'}), 404
        
    repo_path = os.path.abspath(project.repo_path)
    if not os.path.exists(repo_path) or not os.path.isdir(repo_path):
        return jsonify({'success': False, 'error': 'Local folder does not exist on server.'}), 404
        
    try:
        temp_dir = tempfile.mkdtemp()
        zip_filename = f"{project.slug}_source.zip"
        zip_file_path = os.path.join(temp_dir, zip_filename)
        
        # Package repository files while strictly excluding sensitive system files
        with zipfile.ZipFile(zip_file_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
            for root, dirs, files in os.walk(repo_path):
                dirs[:] = [d for d in dirs if d not in ['.git', '__pycache__', 'venv', 'instance', 'node_modules', '.idea', '.vscode']]
                for file in files:
                    if file.startswith('.env') or file.endswith(('.db', '.sqlite', '.pyc', '.key', '.pem')):
                        continue
                    file_abs = os.path.join(root, file)
                    rel_path = os.path.relpath(file_abs, repo_path)
                    zipf.write(file_abs, rel_path)
        
        # Automatically clean up temporary folder when request finishes
        @after_this_request
        def remove_temp_folder(response):
            try:
                shutil.rmtree(temp_dir, ignore_errors=True)
            except Exception:
                pass
            return response
            
        return send_file(
            zip_file_path,
            mimetype='application/zip',
            as_attachment=True,
            download_name=zip_filename
        )
    except Exception as e:
        print(f"Error zipping: {e}")
        return jsonify({'success': False, 'error': 'Failed to create zip archive.'}), 500

# ============ Statistics API ============

@api_bp.route('/projects/statistics', methods=['GET'])
def get_statistics():
    """Get platform statistics"""
    stats = analytics_service.get_platform_statistics()
    
    return jsonify({
        'success': True,
        'data': {'statistics': stats}
    })

@api_bp.route('/projects/filter-options', methods=['GET'])
def get_filter_options():
    """Get available filter options"""
    options = project_service.get_filter_options()
    
    return jsonify({
        'success': True,
        'data': options
    })

# ============ Search API ============

@api_bp.route('/projects/search', methods=['GET'])
def search_projects():
    """Search projects"""
    query = request.args.get('q', '')
    category = request.args.get('category', '')
    language = request.args.get('language', '')
    
    results = project_service.search_projects(
        query=query,
        category=category,
        language=language
    )
    
    return jsonify({
        'success': True,
        'data': results
    })
