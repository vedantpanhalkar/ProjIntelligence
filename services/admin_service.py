"""
Admin Service - Authentication and Management
"""

from models.admin import Admin
from extensions import db
from datetime import datetime
import secrets

from itsdangerous import URLSafeTimedSerializer, BadSignature, SignatureExpired
from config import Config

class AdminService:
    """Admin service for authentication"""
    _revoked_tokens = set()
    
    def _get_serializer(self):
        secret = Config.SECRET_KEY
        return URLSafeTimedSerializer(secret, salt='admin-auth-token')
    
    def login(self, username, password):
        """Authenticate admin user"""
        admin = Admin.query.filter_by(username=username).first()
        
        if not admin:
            return {'success': False, 'error': 'Invalid username or password'}
        
        if not admin.is_active:
            return {'success': False, 'error': 'Account is inactive'}
        
        if not admin.check_password(password):
            return {'success': False, 'error': 'Invalid username or password'}
        
        # Update last login
        admin.last_login = datetime.utcnow()
        db.session.commit()
        
        # Generate cryptographically signed token (valid for 7 days)
        token = self._get_serializer().dumps({'admin_id': admin.id})
        
        return {
            'success': True,
            'admin': admin.to_dict(),
            'token': token
        }
    
    def verify_token(self, token):
        """Verify an authentication token and return admin dict"""
        if not token or token in AdminService._revoked_tokens:
            return None
        try:
            serializer = self._get_serializer()
            # Token valid for 7 days (604800 seconds)
            data = serializer.loads(token, max_age=604800)
            admin_id = data.get('admin_id')
            if admin_id:
                admin = self.get_admin_by_id(admin_id)
                if admin and admin.get('is_active', True):
                    return admin
        except (BadSignature, SignatureExpired, Exception):
            return None
        return None
    
    def logout_token(self, token):
        """Invalidate an authentication token"""
        if token:
            AdminService._revoked_tokens.add(token)
    
    def create_admin(self, username, email, password, full_name='', is_super_admin=False):
        """Create new admin user"""
        # Check if username exists
        if Admin.query.filter_by(username=username).first():
            return {'success': False, 'error': 'Username already exists'}
        
        # Check if email exists
        if Admin.query.filter_by(email=email).first():
            return {'success': False, 'error': 'Email already exists'}
        
        admin = Admin(
            username=username,
            email=email,
            full_name=full_name,
            is_super_admin=is_super_admin
        )
        admin.set_password(password)
        
        db.session.add(admin)
        db.session.commit()
        
        return {'success': True, 'admin': admin.to_dict()}
    
    def get_all_admins(self):
        """Get all admin users"""
        admins = Admin.query.all()
        return [admin.to_dict() for admin in admins]
    
    def get_admin_by_id(self, admin_id):
        """Get admin by ID"""
        admin = Admin.query.get(admin_id)
        if admin:
            return admin.to_dict()
        return None
