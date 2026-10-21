# 🚀 Student Project Intelligence Platform

> **An intelligent student project analysis platform for repository browsing, code health scoring, technology detection, project verification, and automated evaluation. Built with Python, Flask, SQLite, JavaScript, and modern CSS, with future plans for AI-powered code analysis.**

---

## ✨ Features

- **Authentic GitHub Repository File Browser**:
  - Interactive breadcrumbs navigation (`main` branch + path traversal).
  - Directory listing with folders first, file type icons (C++, Python, JS, TS, HTML/CSS, Config, Docs), and file sizes.
  - Drill-down directory browsing with `..` parent folder navigation.
  - Formatted `README.md` automatically rendered underneath the file table at the root.
  - Full-width Code Viewer with syntax highlighting, line numbers (`hljs-ln`), line count, file size, "Raw", "Copy", and "Download".
- **Comprehensive Project Showcase & Discovery**:
  - Search across projects, technologies, and descriptions in real time.
  - Multi-facet filters: Language, Category, Health Grade.
  - Animated cards with health score grade pills and verification status.
- **Executive Administration Console**:
  - Secure token-based authentication.
  - Real-time statistics cards & automated activity stream audit log.
  - **Ingestion Pipeline**: Upload `.zip` archives or code folders.
  - **Client-Side Build Filter**: Automatically strips `node_modules/`, `.git/`, `venv/`, `__pycache__/`, preventing browser lag and payload limit errors.
  - **Auto-Unnesting**: Unwraps single top-level folders automatically so files sit cleanly at the project root.
  - **Technology & AST Detection**: Auto-detects C++, Python, JavaScript, TypeScript, Flask, React, Node.js, and CMake.
  - **Homepage Feature Toggle**: Mark projects to appear on the homepage's featured grid.
- **Glassmorphism Design & Dark/Light Themes**:
  - Polished modern UI with CSS variables, fluid responsive layouts, and Three.js background visuals.

---

## 🛠️ Tech Stack

- **Backend**: Python 3.14 + Flask (Modular Blueprint Architecture)
- **Database**: SQLite with Flask-SQLAlchemy ORM
- **Authentication**: `itsdangerous` cryptographically signed URLSafe tokens
- **Frontend**: Vanilla JavaScript (ES6+), Vanilla CSS (Design tokens, Dark mode), Three.js, TagCanvas, Highlight.js, Marked.js
- **Architecture**: Blueprint pattern with dedicated Services and Models layer

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Initialize Database & Default Admin
```bash
python init_db.py
python seed_admin.py
```

### 3. Run the Application
```bash
python app.py
```

### 4. Open in Browser
- **Homepage:** [http://localhost:5000](http://localhost:5000)
- **Projects Discovery:** [http://localhost:5000/projects.html](http://localhost:5000/projects.html)
- **Admin Panel:** [http://localhost:5000/admin.html](http://localhost:5000/admin.html)

---

## 👤 Admin Access

- **Login URL:** [http://localhost:5000/admin.html](http://localhost:5000/admin.html)
- **Username:** `admin`
- **Password:** `admin123`

---

## 📁 Project Structure

```
cpp_prj/
├── app.py                      # Main Flask application entry point
├── config.py                   # Configuration & upload limits
├── extensions.py               # Shared SQLAlchemy db instance
├── init_db.py                  # Seed script for initial technologies & categories
├── seed_admin.py               # Default admin seeding script
├── requirements.txt            # Python dependencies
├── blueprints/                 # Modular Flask blueprints
│   ├── api.py                  # REST API routes
│   ├── admin.py                # Admin management & upload pipeline
│   └── projects.py             # Frontend page routing
├── models/                     # SQLAlchemy database models
│   ├── project.py              # Project, Technology, Category models
│   └── admin.py                # Admin user & password hashing
├── services/                   # Business logic layer
│   ├── project_service.py      # Directory tree builder & file sandboxing
│   ├── admin_service.py        # Token management & authentication
│   └── analytics_service.py    # Metric & statistics calculation
├── frontend/                   # Modern Vanilla Web App
│   ├── index.html              # Hero landing page & featured grid
│   ├── projects.html           # Discovery portal with search & filters
│   ├── project-detail.html     # Authentic GitHub repository file browser
│   ├── admin.html              # Executive admin management console
│   ├── about.html              # Platform architecture & about page
│   ├── css/                    # Design tokens, theme, components, dashboard, project, admin
│   └── js/                     # Client application modules (api, components, dashboard, project, admin)
└── uploads/                    # Local storage for indexed project repositories
```

---

## 🔌 API Endpoints Reference

```http
GET    /api/v1/health                          # Health check
GET    /api/v1/projects                        # List projects (supports search, category, pagination)
GET    /api/v1/projects/<id>                   # Get single project details
GET    /api/v1/projects/<id>/files?path=       # Get directory files / folder tree
GET    /api/v1/projects/<id>/file-content?path= # Get file content safely sandboxed
GET    /api/v1/projects/<id>/download          # Stream project as .zip file
POST   /api/v1/admin/login                     # Admin authentication
POST   /api/v1/admin/projects/upload           # Ingest project folder or .zip archive
PUT    /api/v1/admin/projects/<id>             # Update project details
DELETE /api/v1/admin/projects/<id>             # Delete project
```

---

## 🔮 Future Roadmap

- 🤖 **AI-Powered Code Analysis**: Automated vulnerability scanning, cyclomatic complexity scoring, and LLM-driven code review summaries.
- 🧪 **Automated Test Runners**: Sandboxed test execution and grading pipelines for student assignments.
- 📊 **Plagiarism & Similarity Indexing**: Cross-repository AST fingerprinting to detect duplicate code submissions.
