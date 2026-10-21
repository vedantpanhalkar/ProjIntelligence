import pytest
from app import create_app
from extensions import db
from models.project import Project

from config import Config

class TestConfig(Config):
    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'

@pytest.fixture
def app():
    app = create_app(TestConfig)
    
    with app.app_context():
        db.create_all()
        # Seed a test project
        project = Project(
            name='Test Project',
            slug='test-project',
            description='Test Description',
            status='active'
        )
        db.session.add(project)
        db.session.commit()
        
        # Seed a test admin
        from models.admin import Admin
        admin = Admin(
            username='admin',
            email='admin@test.edu',
            password='admin123',
            full_name='Test Admin',
            is_active=True
        )
        db.session.add(admin)
        db.session.commit()
        
        yield app
        
        db.session.remove()
        db.drop_all()

@pytest.fixture
def client(app):
    return app.test_client()

def test_health_check(client):
    response = client.get('/api/v1/health')
    assert response.status_code == 200
    assert response.json['status'] == 'healthy'

def test_get_projects(client):
    response = client.get('/api/v1/projects')
    assert response.status_code == 200
    assert 'data' in response.json
    assert len(response.json['data']['projects']) == 1
    assert response.json['data']['projects'][0]['name'] == 'Test Project'

def test_get_project_by_id(client):
    response = client.get('/api/v1/projects/1')
    assert response.status_code == 200
    assert response.json['data']['name'] == 'Test Project'

def test_admin_auth_flow(client):
    # Failed login
    res_fail = client.post('/api/v1/admin/login', json={'username': 'admin', 'password': 'wrong'})
    assert res_fail.status_code == 401
    
    # Successful login
    res_login = client.post('/api/v1/admin/login', json={'username': 'admin', 'password': 'admin123'})
    assert res_login.status_code == 200
    token = res_login.json['data']['token']
    assert token is not None
    
    # Protected endpoint with token
    res_me = client.get('/api/v1/admin/me', headers={'Authorization': f'Bearer {token}'})
    assert res_me.status_code == 200
    assert res_me.json['data']['admin']['username'] == 'admin'
    
    # Logout
    res_logout = client.post('/api/v1/admin/logout', headers={'Authorization': f'Bearer {token}'})
    assert res_logout.status_code == 200
    
    # Protected endpoint is now unauthorized
    res_unauth = client.get('/api/v1/admin/me')
    assert res_unauth.status_code == 401

def test_sensitive_file_blocking(client):
    # Attempt path traversal
    res = client.get('/api/v1/projects/1/file-content?path=../../.env')
    # Should not return secret content
    assert res.status_code == 200
    assert res.json['data'].get('error') is not None or res.json['data'].get('content') == ''

def test_admin_create_project(client):
    # Log in
    res_login = client.post('/api/v1/admin/login', json={'username': 'admin', 'password': 'admin123'})
    token = res_login.json['data']['token']
    
    # Create project
    res_create = client.post(
        '/api/v1/admin/projects',
        json={'name': 'New Automated Project', 'description': 'Automated test'},
        headers={'Authorization': f'Bearer {token}'}
    )
    assert res_create.status_code == 201
    assert res_create.json['data']['project']['name'] == 'New Automated Project'

def test_get_project_analysis_summary(client):
    res = client.get('/api/v1/projects/1/analysis-summary')
    assert res.status_code == 200
    assert 'health_score' in res.json['data']
    assert res.json['data']['name'] == 'Test Project'

def test_search_projects(client):
    res = client.get('/api/v1/projects/search?q=Test')
    assert res.status_code == 200
    assert len(res.json['data']['projects']) == 1
    assert 'pagination' in res.json['data']

def test_admin_upload_project(client):
    import io
    import zipfile
    
    # Login
    res_login = client.post('/api/v1/admin/login', json={'username': 'admin', 'password': 'admin123'})
    token = res_login.json['data']['token']
    
    # Create an in-memory zip file with README and sample code
    zip_buffer = io.BytesIO()
    with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zf:
        zf.writestr('README.md', '# Sample Uploaded App\nThis is a test project uploaded as a folder/zip.')
        zf.writestr('main.py', 'print("hello world")\n')
        zf.writestr('package.json', '{"name": "sample", "dependencies": {"react": "^18.0.0"}}\n')
    zip_buffer.seek(0)
    
    data = {
        'name': 'Sample Uploaded App',
        'zip_file': (zip_buffer, 'sample_app.zip')
    }
    
    res = client.post(
        '/api/v1/admin/projects/upload',
        data=data,
        content_type='multipart/form-data',
        headers={'Authorization': f'Bearer {token}'}
    )
    assert res.status_code in [200, 201]
    res_data = res.json
    assert res_data['success'] is True
    project_obj = res_data['data']['project']
    assert project_obj['name'] == 'Sample Uploaded App'
    assert 'health_score' in project_obj
    assert project_obj['status'] == 'active'


