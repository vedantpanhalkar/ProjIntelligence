"""
Project Service - Business Logic Layer
"""

from models.project import Project, Technology, Category
from extensions import db
import os
import json

class ProjectService:
    """Project service for business logic"""
    
    def get_all_projects(self, page=1, per_page=12, search='', category=''):
        """Get all projects with pagination and filters"""
        query = Project.query
        
        # Apply filters
        if search:
            query = query.filter(
                db.or_(
                    Project.name.ilike(f'%{search}%'),
                    Project.short_description.ilike(f'%{search}%')
                )
            )
        
        if category:
            query = query.join(Project.categories).filter(Category.slug == category)
        
        # Order by featured first, then by date
        query = query.order_by(Project.is_featured.desc(), Project.created_at.desc())
        
        # Paginate
        pagination = query.paginate(page=page, per_page=per_page, error_out=False)
        
        return {
            'projects': [p.to_dict() for p in pagination.items],
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': pagination.total,
                'pages': pagination.pages,
                'total_pages': pagination.pages,
                'has_next': pagination.has_next,
                'has_prev': pagination.has_prev
            }
        }
    
    def get_project_by_id(self, project_id):
        """Get single project by ID"""
        project = Project.query.get(project_id)
        if project:
            return project.to_dict(include_files=True)
        return None
    
    def get_project_files(self, project_id, path=''):
        """Get file structure for a project (recursive)"""
        project = Project.query.get(project_id)
        if not project or not project.repo_path:
            return {'files': [], 'path': path}
        repo_abs = os.path.abspath(project.repo_path)
        full_path = os.path.abspath(os.path.join(repo_abs, path))
        
        if not os.path.normcase(full_path).startswith(os.path.normcase(repo_abs)):
            return {'files': [], 'path': path}
        
        if not os.path.exists(full_path):
            return {'files': [], 'path': path}

        ignored_names = {
            '.git', 'node_modules', '__pycache__', 'venv', '.venv', 'env',
            'instance', '.pytest_cache', '.idea', '.vscode', '_legacy_ui_archive',
            'dist', 'build', '.next', '.cache', '__macosx', '.ds_store'
        }
            
        def build_tree(current_path, relative_root, depth=0):
            if depth > 6:
                return []
            files = []
            try:
                for item in os.listdir(current_path):
                    item_lower = item.lower()
                    # Skip common hidden/build/sensitive folders & files
                    if item.startswith('.env') or item_lower in ignored_names:
                        continue
                    if item.endswith(('.db', '.key', '.pem', '.pyc')):
                        continue
                    
                    item_full_path = os.path.join(current_path, item)
                    item_rel_path = os.path.join(relative_root, item) if relative_root else item
                    
                    is_dir = os.path.isdir(item_full_path)
                    ext = os.path.splitext(item)[1].lstrip('.').lower() if not is_dir else ''
                    file_node = {
                        'name': item,
                        'path': item_rel_path.replace('\\', '/'),
                        'type': 'folder' if is_dir else 'file',
                        'extension': ext,
                        'size': os.path.getsize(item_full_path) if not is_dir else 0
                    }
                    if is_dir:
                        file_node['children'] = build_tree(item_full_path, item_rel_path, depth + 1)
                    files.append(file_node)
            except Exception as e:
                print(f"Error reading directory {current_path}: {e}")
                
            files.sort(key=lambda x: (x['type'] == 'file', x['name'].lower()))
            return files

        files = build_tree(full_path, path)
        return {
            'files': files,
            'path': path
        }
    
    def get_file_content(self, project_id, file_path):
        """Get content of a specific file safely"""
        project = Project.query.get(project_id)
        if not project or not project.repo_path:
            return {'content': '', 'error': 'Project not found'}
        repo_abs = os.path.abspath(project.repo_path)
        full_path = os.path.abspath(os.path.join(repo_abs, file_path))
        
        # Enforce strict directory sandboxing with Windows normcase
        try:
            if os.path.commonpath([os.path.normcase(full_path), os.path.normcase(repo_abs)]) != os.path.normcase(repo_abs):
                return {'content': '', 'error': 'Invalid path'}
        except ValueError:
            return {'content': '', 'error': 'Invalid path'}
        
        # Blacklist sensitive files and folders
        normalized_path = os.path.normpath(file_path).replace('\\', '/')
        path_segments = normalized_path.split('/')
        for seg in path_segments:
            seg_lower = seg.lower()
            if seg_lower in ['.env', 'instance', '.git', '__pycache__', 'venv', '.venv']:
                return {'content': '', 'error': 'Access denied: protected file or directory'}
            if seg.startswith('.env') or seg.endswith(('.db', '.sqlite', '.key', '.pem')):
                return {'content': '', 'error': 'Access denied: protected file type'}
        
        if not os.path.exists(full_path) or not os.path.isfile(full_path):
            return {'content': '', 'error': 'File not found'}
        
        file_size = os.path.getsize(full_path)
        if file_size > 5 * 1024 * 1024:
            return {'content': '[File exceeds 5MB display limit]', 'path': file_path, 'size': file_size, 'is_large': True}
        
        try:
            with open(full_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            return {
                'content': content,
                'path': file_path,
                'size': file_size
            }
        except UnicodeDecodeError:
            return {
                'content': '[Binary file - preview not available]',
                'path': file_path,
                'size': file_size,
                'is_binary': True
            }
        except Exception as e:
            return {'content': '', 'error': str(e)}
    
    def search_projects(self, query='', category='', language=''):
        """Search projects"""
        results = Project.query
        
        if query:
            results = results.filter(
                db.or_(
                    Project.name.ilike(f'%{query}%'),
                    Project.description.ilike(f'%{query}%')
                )
            )
        
        if category:
            results = results.join(Project.categories).filter(Category.slug == category)
        
        if language:
            results = results.join(Project.technologies).filter(Technology.slug == language)
        
        count = results.count()
        return {
            'projects': [p.to_dict() for p in results.all()],
            'count': count,
            'pagination': {
                'total': count,
                'pages': 1,
                'total_pages': 1,
                'page': 1,
                'has_next': False,
                'has_prev': False
            }
        }
    
    def get_filter_options(self):
        """Get available filter options"""
        categories = Category.query.all()
        technologies = Technology.query.all()
        
        return {
            'categories': [c.to_dict() for c in categories],
            'technologies': [t.to_dict() for t in technologies]
        }
