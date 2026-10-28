"""
ProjIntelligence - Batch Project Audit & Synchronization Script
Runs deterministic health analysis and static security auditing across
all indexed local repositories and synchronizes the database.
"""

import os
os.environ["DISABLE_SQLALCHEMY_CEXT"] = "1"

from app import create_app
from models.project import Project
from services.project_service import ProjectService

def sync_all_audits():
    app = create_app()
    with app.app_context():
        print("=" * 60)
        print("  [*] ProjIntelligence - Repository Audit Synchronizer")
        print("  Architect & Lead Developer: Vedant Panhalkar")
        print("=" * 60)

        projects = Project.query.all()
        print(f"[*] Found {len(projects)} registered projects.")

        service = ProjectService()
        synced_count = 0

        for p in projects:
            print(f"\n[+] Inspecting: {p.name} (ID: {p.id})")
            if p.repo_path and os.path.exists(p.repo_path):
                try:
                    report = service.analyze_and_update_project(p.id)
                    if report:
                        score = report['overall_score']
                        grade = report['grade']
                        sec_status = report['security']['status']
                        loc = report['statistics']['total_lines_of_code']
                        print(f"    -> Score: {score}/100 (Grade {grade})")
                        print(f"    -> Lines of Code: {loc:,}")
                        print(f"    -> Security Status: {sec_status.upper()}")
                        synced_count += 1
                except Exception as e:
                    print(f"    -> Error analyzing project: {e}")
            else:
                print(f"    -> Skipping: No local directory found at {p.repo_path}")

        print("\n" + "=" * 60)
        print(f"  [SUCCESS] Audit Synchronization Completed! ({synced_count} projects updated)")
        print("=" * 60)

if __name__ == '__main__':
    sync_all_audits()
