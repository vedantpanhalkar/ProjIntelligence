"""
Admin Blueprint - Admin Authentication and Management
"""

import os
import re
import json
import zipfile
import shutil
from datetime import datetime
from flask import Blueprint, jsonify, request, session, current_app
from services.admin_service import AdminService
from services.project_service import ProjectService
from models.project import Project, Technology, Category
from extensions import db

admin_bp = Blueprint('admin', __name__)
admin_service = AdminService()
project_service = ProjectService()

def get_current_admin_user():
    """Extract authenticated admin from Authorization Bearer token, custom header, or session"""
    auth_header = request.headers.get('Authorization', '')
    token = None
    if auth_header.startswith('Bearer '):
        token = auth_header.split(' ', 1)[1].strip()
    elif request.headers.get('X-Admin-Token'):
        token = request.headers.get('X-Admin-Token').strip()
    elif request.form.get('admin_token'):
        token = request.form.get('admin_token').strip()

    if token:
        admin = admin_service.verify_token(token)
        if admin:
            return admin
    
    admin_id = session.get('admin_id')
    if admin_id:
        return admin_service.get_admin_by_id(admin_id)
        
    return None

# ============ Admin Authentication ============

@admin_bp.route('/login', methods=['POST'])
def admin_login():
    """Admin login endpoint"""
    data = request.get_json()
    
    if not data or not data.get('username') or not data.get('password'):
        return jsonify({
            'success': False,
            'error': {
                'code': 'VALIDATION_ERROR',
                'message': 'Username and password required'
            }
        }), 400
    
    result = admin_service.login(data['username'], data['password'])
    
    if not result['success']:
        return jsonify({
            'success': False,
            'error': {
                'code': 'UNAUTHORIZED',
                'message': result['error']
            }
        }), 401
    
    # Store token in session (for session-based clients)
    session['admin_token'] = result['token']
    session['admin_id'] = result['admin']['id']
    
    return jsonify({
        'success': True,
        'data': {
            'admin': result['admin'],
            'token': result['token']
        }
    })

@admin_bp.route('/logout', methods=['POST'])
def admin_logout():
    """Admin logout endpoint"""
    auth_header = request.headers.get('Authorization', '')
    if auth_header.startswith('Bearer '):
        token = auth_header.split(' ', 1)[1].strip()
        admin_service.logout_token(token)
    session.clear()
    return jsonify({
        'success': True,
        'data': {'message': 'Logged out successfully'}
    })

@admin_bp.route('/me', methods=['GET'])
def get_current_admin():
    """Get current logged-in admin"""
    admin = get_current_admin_user()
    
    if not admin:
        return jsonify({
            'success': False,
            'error': {
                'code': 'UNAUTHORIZED',
                'message': 'Not authenticated'
            }
        }), 401
    
    return jsonify({
        'success': True,
        'data': {'admin': admin}
    })

# ============ Admin Dashboard ============

@admin_bp.route('/dashboard/stats', methods=['GET'])
def get_admin_stats():
    """Get admin dashboard statistics"""
    admin = get_current_admin_user()
    if not admin:
        return jsonify({'success': False, 'error': {'code': 'UNAUTHORIZED', 'message': 'Not authenticated'}}), 401
    
    # Get comprehensive stats
    total_projects = Project.query.count()
    active_projects = Project.query.filter_by(status='active').count()
    coming_soon = Project.query.filter_by(status='coming_soon').count()
    featured_projects = Project.query.filter_by(is_featured=True).count()
    
    # Average scores
    avg_health = db.session.query(db.func.avg(Project.health_score)).filter(Project.health_score > 0).scalar() or 0.0
    avg_quality = db.session.query(db.func.avg(Project.code_quality_score)).filter(Project.code_quality_score > 0).scalar() or 0.0
    avg_documentation = db.session.query(db.func.avg(Project.documentation_score)).filter(Project.documentation_score > 0).scalar() or 0.0
    
    # Total GitHub stats
    total_stars = db.session.query(db.func.sum(Project.stars)).scalar() or 0
    total_forks = db.session.query(db.func.sum(Project.forks)).scalar() or 0
    
    return jsonify({
        'success': True,
        'data': {
            'projects': {
                'total': total_projects,
                'active': active_projects,
                'coming_soon': coming_soon,
                'featured': featured_projects
            },
            'scores': {
                'average_health': round(avg_health, 2),
                'average_quality': round(avg_quality, 2),
                'average_documentation': round(avg_documentation, 2)
            },
            'github': {
                'total_stars': total_stars,
                'total_forks': total_forks
            }
        }
    })

# ============ Admin Project Management ============

@admin_bp.route('/projects', methods=['POST'])
def create_project():
    """Create new project (admin only)"""
    admin = get_current_admin_user()
    if not admin:
        return jsonify({'success': False, 'error': {'code': 'UNAUTHORIZED', 'message': 'Not authenticated'}}), 401
    
    data = request.get_json()
    
    if not data or not data.get('name'):
        return jsonify({
            'success': False,
            'error': {
                'code': 'VALIDATION_ERROR',
                'message': 'Project name is required'
            }
        }), 400
    
    try:
        # Create project
        project = Project(
            name=data['name'],
            slug=data.get('slug', data['name'].lower().replace(' ', '-')),
            short_description=data.get('short_description', ''),
            description=data.get('description', ''),
            github_url=data.get('github_url'),
            repo_path=data.get('repo_path'),
            status=data.get('status', 'active'),
            is_featured=data.get('is_featured', False),
            health_score=data.get('health_score', 0.0),
            code_quality_score=data.get('code_quality_score', 0.0),
            documentation_score=data.get('documentation_score', 0.0),
            stars=data.get('stars', 0),
            forks=data.get('forks', 0)
        )
        
        db.session.add(project)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'data': {'project': project.to_dict()}
        }), 201
    
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': {
                'code': 'DATABASE_ERROR',
                'message': str(e)
            }
        }), 500

@admin_bp.route('/projects/upload', methods=['POST'])
def upload_project():
    """Upload project folder or zip archive (admin only)"""
    admin = get_current_admin_user()
    if not admin:
        return jsonify({'success': False, 'error': {'code': 'UNAUTHORIZED', 'message': 'Not authenticated'}}), 401
    
    name = request.form.get('name', '').strip()
    if not name:
        if 'zip_file' in request.files and request.files['zip_file'].filename:
            name = os.path.splitext(request.files['zip_file'].filename)[0].replace('-', ' ').replace('_', ' ').title()
        elif request.files.getlist('files'):
            first_f = request.files.getlist('files')[0].filename
            folder_part = first_f.split('/')[0] if '/' in first_f else (first_f.split('\\')[0] if '\\' in first_f else 'Uploaded Project')
            name = folder_part.replace('-', ' ').replace('_', ' ').title()
        else:
            return jsonify({'success': False, 'error': {'code': 'VALIDATION_ERROR', 'message': 'Project name is required'}}), 400

    slug = request.form.get('slug', '').strip()
    if not slug:
        slug = re.sub(r'[^a-zA-Z0-9_-]', '-', name.lower()).strip('-')
        if not slug:
            slug = f"proj-{int(datetime.utcnow().timestamp())}"

    # Ensure slug uniqueness
    base_slug = slug
    counter = 1
    while Project.query.filter_by(slug=slug).first():
        slug = f"{base_slug}-{counter}"
        counter += 1

    upload_folder = current_app.config.get('UPLOAD_FOLDER', os.path.join(current_app.root_path, 'uploads'))
    target_dir = os.path.join(upload_folder, slug)
    os.makedirs(target_dir, exist_ok=True)

    description = request.form.get('description', '').strip()
    github_url = request.form.get('github_url', '').strip() or None
    short_description = request.form.get('short_description', '').strip()
    is_featured_val = request.form.get('is_featured', '').lower()
    is_featured = is_featured_val in ['true', '1', 'yes', 'on']

    # 1. Handle Zip File Upload
    if 'zip_file' in request.files and request.files['zip_file'].filename:
        zip_file = request.files['zip_file']
        temp_zip = os.path.join(upload_folder, f"temp_{slug}.zip")
        zip_file.save(temp_zip)
        try:
            with zipfile.ZipFile(temp_zip, 'r') as zf:
                # Zip-Slip security check: verify that all extraction targets stay inside target_dir
                for member in zf.infolist():
                    member_path = os.path.normpath(os.path.join(target_dir, member.filename))
                    if not os.path.normcase(member_path).startswith(os.path.normcase(target_dir)):
                        raise Exception(f"Unsafe zip entry path: {member.filename}")
                zf.extractall(target_dir)
            if os.path.exists(temp_zip):
                os.remove(temp_zip)
            
            # Clean up __MACOSX and .DS_Store
            macosx_dir = os.path.join(target_dir, '__MACOSX')
            if os.path.exists(macosx_dir):
                shutil.rmtree(macosx_dir, ignore_errors=True)
            
            # If extracted into a single root folder, unnest it
            items = [it for it in os.listdir(target_dir) if it not in ['.DS_Store', 'desktop.ini']]
            if len(items) == 1 and os.path.isdir(os.path.join(target_dir, items[0])):
                nested = os.path.join(target_dir, items[0])
                for it in os.listdir(nested):
                    shutil.move(os.path.join(nested, it), os.path.join(target_dir, it))
                try:
                    os.rmdir(nested)
                except Exception:
                    pass
        except Exception as e:
            if os.path.exists(temp_zip):
                os.remove(temp_zip)
            return jsonify({'success': False, 'error': {'code': 'ZIP_ERROR', 'message': f'Failed to extract zip: {str(e)}'}}), 400

    # 2. Handle Folder / Multi-file Upload
    uploaded_files = request.files.getlist('files')
    file_paths = request.form.getlist('paths')

    if uploaded_files:
        normalized_rel_paths = []
        for idx, file in enumerate(uploaded_files):
            if not file or not file.filename:
                continue
            rel_p = file_paths[idx] if idx < len(file_paths) and file_paths[idx] else file.filename
            parts = [p for p in rel_p.replace('\\', '/').split('/') if p and p not in ['.', '..']]
            if parts:
                normalized_rel_paths.append((file, parts))

        # Check if all files share the same root folder name (e.g. "my-project/...")
        common_prefix = None
        if normalized_rel_paths and all(len(p[1]) > 1 for p in normalized_rel_paths):
            candidate_prefix = normalized_rel_paths[0][1][0]
            if all(p[1][0] == candidate_prefix for p in normalized_rel_paths):
                common_prefix = candidate_prefix

        for file, parts in normalized_rel_paths:
            # Strip redundant single top-level folder so files sit directly at project root
            effective_parts = parts[1:] if (common_prefix and len(parts) > 1 and parts[0] == common_prefix) else parts
            dest_path = os.path.join(target_dir, *effective_parts)
            os.makedirs(os.path.dirname(dest_path), exist_ok=True)
            file.save(dest_path)

    # 3. Auto-inspect folder for README
    readme_content = ""
    for root, dirs, files in os.walk(target_dir):
        dirs[:] = [d for d in dirs if d not in ['.git', 'node_modules', '__pycache__', 'venv', '.venv', 'dist', 'build']]
        for f in files:
            if f.lower() in ['readme.md', 'readme.txt', 'readme']:
                try:
                    with open(os.path.join(root, f), 'r', encoding='utf-8', errors='ignore') as rf:
                        readme_content = rf.read()
                        break
                except Exception:
                    pass
        if readme_content:
            break

    if readme_content:
        if not description:
            description = readme_content
        if not short_description:
            lines = [l.strip() for l in readme_content.splitlines() if l.strip() and not l.startswith('#')]
            short_description = lines[0][:150] if lines else f"Project {name}"

    if not description:
        description = f"# {name}\n\nProject uploaded via Admin Panel."
    if not short_description:
        short_description = f"Interactive project repository for {name}."

    # 4. Auto-detect technologies
    detected_tech_slugs = set()
    for root, dirs, files in os.walk(target_dir):
        dirs[:] = [d for d in dirs if d not in ['.git', 'node_modules', '__pycache__', 'venv', '.venv', 'dist', 'build']]
        for f in files:
            f_lower = f.lower()
            ext = os.path.splitext(f_lower)[1]
            if ext == '.py':
                detected_tech_slugs.add('python')
            elif ext in ['.js', '.jsx', '.mjs']:
                detected_tech_slugs.add('javascript')
            elif ext in ['.ts', '.tsx']:
                detected_tech_slugs.add('typescript')
            elif ext in ['.html', '.htm', '.css']:
                detected_tech_slugs.add('html-css')
            elif ext in ['.cpp', '.c', '.cc', '.cxx', '.h', '.hpp', '.tpp'] or f_lower in ['cmakelists.txt', 'makefile']:
                detected_tech_slugs.add('cpp')
            
            if f_lower == 'package.json':
                try:
                    with open(os.path.join(root, f), 'r', encoding='utf-8', errors='ignore') as pf:
                        pcont = pf.read().lower()
                        if 'react' in pcont:
                            detected_tech_slugs.add('react')
                        if 'vue' in pcont:
                            detected_tech_slugs.add('javascript')
                        if 'node' in pcont or 'express' in pcont:
                            detected_tech_slugs.add('nodejs')
                except Exception:
                    pass
            elif f_lower in ['requirements.txt', 'pipfile']:
                try:
                    with open(os.path.join(root, f), 'r', encoding='utf-8', errors='ignore') as rf:
                        rcont = rf.read().lower()
                        if 'flask' in rcont:
                            detected_tech_slugs.add('flask')
                except Exception:
                    pass

    # 5. Run Deterministic Health & Security Analysis
    from services.analyzer_service import ProjectAnalyzerService
    analyzer = ProjectAnalyzerService()
    analysis_report = analyzer.analyze_repository(target_dir)

    health_score = analysis_report['overall_score']
    documentation_score = round(analysis_report['breakdown']['documentation']['score'] * 5.0, 1)
    code_quality_score = round(analysis_report['breakdown']['maintainability']['score'] * 5.0, 1)
    analysis_data_str = json.dumps(analysis_report)

    # 6. Create & Save Project
    project = Project(
        name=name,
        slug=slug,
        short_description=short_description,
        description=description,
        github_url=github_url,
        repo_path=target_dir,
        status='active',
        is_featured=is_featured,
        health_score=health_score,
        code_quality_score=code_quality_score,
        documentation_score=documentation_score,
        analysis_data=analysis_data_str,
        stars=0,
        forks=0
    )
    db.session.add(project)

    for tslug in detected_tech_slugs:
        t = Technology.query.filter((Technology.slug == tslug) | (Technology.slug == tslug.replace('-', ''))).first()
        if t and t not in project.technologies:
            project.technologies.append(t)

    if not project.technologies:
        first_tech = Technology.query.first()
        if first_tech:
            project.technologies.append(first_tech)

    category = Category.query.first()
    if category and category not in project.categories:
        project.categories.append(category)

    try:
        db.session.commit()
        return jsonify({
            'success': True,
            'data': {'project': project.to_dict()}
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': {'code': 'DATABASE_ERROR', 'message': str(e)}
        }), 500

@admin_bp.route('/projects/<int:project_id>', methods=['PUT'])
def update_project(project_id):
    """Update project (admin only)"""
    admin = get_current_admin_user()
    if not admin:
        return jsonify({'success': False, 'error': {'code': 'UNAUTHORIZED', 'message': 'Not authenticated'}}), 401
    
    project = Project.query.get(project_id)
    if not project:
        return jsonify({
            'success': False,
            'error': {
                'code': 'NOT_FOUND',
                'message': 'Project not found'
            }
        }), 404
    
    data = request.get_json()
    
    try:
        # Update fields
        if 'name' in data:
            project.name = data['name']
        if 'short_description' in data:
            project.short_description = data['short_description']
        if 'description' in data:
            project.description = data['description']
        if 'github_url' in data:
            project.github_url = data['github_url']
        if 'status' in data:
            project.status = data['status']
        if 'is_featured' in data:
            project.is_featured = data['is_featured']
        if 'health_score' in data:
            project.health_score = data['health_score']
        if 'code_quality_score' in data:
            project.code_quality_score = data['code_quality_score']
        if 'documentation_score' in data:
            project.documentation_score = data['documentation_score']
        if 'stars' in data:
            project.stars = data['stars']
        if 'forks' in data:
            project.forks = data['forks']
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'data': {'project': project.to_dict()}
        })
    
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': {
                'code': 'DATABASE_ERROR',
                'message': str(e)
            }
        }), 500

@admin_bp.route('/projects/<int:project_id>', methods=['DELETE'])
def delete_project(project_id):
    """Delete project and remove uploaded files from disk (admin only)"""
    admin = get_current_admin_user()
    if not admin:
        return jsonify({'success': False, 'error': {'code': 'UNAUTHORIZED', 'message': 'Not authenticated'}}), 401
    
    project = Project.query.get(project_id)
    if not project:
        return jsonify({
            'success': False,
            'error': {
                'code': 'NOT_FOUND',
                'message': 'Project not found'
            }
        }), 404
    
    try:
        repo_path = project.repo_path
        db.session.delete(project)
        db.session.commit()
        
        # Safely remove project files from disk if located inside upload folder
        if repo_path and os.path.exists(repo_path):
            upload_folder = current_app.config.get('UPLOAD_FOLDER', os.path.join(current_app.root_path, 'uploads'))
            try:
                if os.path.commonpath([os.path.normcase(os.path.abspath(repo_path)), os.path.normcase(os.path.abspath(upload_folder))]) == os.path.normcase(os.path.abspath(upload_folder)):
                    shutil.rmtree(repo_path, ignore_errors=True)
            except Exception:
                pass
        
        return jsonify({
            'success': True,
            'data': {'message': 'Project and repository files deleted successfully'}
        })
    
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': {
                'code': 'DATABASE_ERROR',
                'message': str(e)
            }
        }), 500

@admin_bp.route('/projects/<int:project_id>/reanalyze', methods=['POST'])
def reanalyze_project(project_id):
    """Re-run deterministic health & security analysis on an existing project (admin only)"""
    admin = get_current_admin_user()
    if not admin:
        return jsonify({'success': False, 'error': {'code': 'UNAUTHORIZED', 'message': 'Not authenticated'}}), 401
    
    report = project_service.analyze_and_update_project(project_id)
    if not report:
        return jsonify({
            'success': False,
            'error': {'code': 'NOT_FOUND', 'message': 'Project files not found for analysis'}
        }), 404
    
    project = Project.query.get(project_id)
    return jsonify({
        'success': True,
        'data': {
            'project': project.to_dict(),
            'analysis': report
        }
    })

@admin_bp.route('/projects/reanalyze-all', methods=['POST'])
def reanalyze_all_projects():
    """Batch re-analyze all indexed projects on disk (admin only)"""
    admin = get_current_admin_user()
    if not admin:
        return jsonify({'success': False, 'error': {'code': 'UNAUTHORIZED', 'message': 'Not authenticated'}}), 401
    
    results = project_service.reanalyze_all_projects()
    return jsonify({
        'success': True,
        'data': {
            'total_analyzed': len(results),
            'projects': results
        }
    })

