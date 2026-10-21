"""
Analytics Service - Statistics and Metrics
"""

from models.project import Project, Technology, Category
from extensions import db

class AnalyticsService:
    """Analytics service for statistics"""
    
    def get_platform_statistics(self):
        """Get overall platform statistics"""
        total_projects = Project.query.count()
        active_projects = Project.query.filter_by(status='active').count()
        coming_soon = Project.query.filter_by(status='coming_soon').count()
        total_technologies = Technology.query.count()
        
        # Average scores
        avg_health = db.session.query(db.func.avg(Project.health_score)).scalar() or 0.0
        avg_quality = db.session.query(db.func.avg(Project.code_quality_score)).scalar() or 0.0
        
        return {
            'total_projects': total_projects,
            'active_projects': active_projects,
            'coming_soon_projects': coming_soon,
            'total_technologies': total_technologies,
            'average_health_score': round(avg_health, 2),
            'average_quality_score': round(avg_quality, 2)
        }
