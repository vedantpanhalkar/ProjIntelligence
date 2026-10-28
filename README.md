# ⚡ ProjIntelligence

> **An intelligent repository explorer, code verification platform, and deterministic quality auditor built for developers, students, and engineers to inspect codebases, analyze architecture health, and detect security vulnerabilities.**

[![Python](https://img.shields.io/badge/Python-3.10%2B-blue.svg?logo=python&logoColor=white)](https://www.python.org/)
[![Flask](https://img.shields.io/badge/Flask-3.0.0-black.svg?logo=flask&logoColor=white)](https://flask.palletsprojects.com/)
[![SQLite](https://img.shields.io/badge/Database-SQLite%203-003B57.svg?logo=sqlite&logoColor=white)](https://www.sqlite.org/)
[![C++](https://img.shields.io/badge/C%2B%2B-17-00599C.svg?logo=c%2B%2B&logoColor=white)](https://isocpp.org/)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6%2B-F7DF1E.svg?logo=javascript&logoColor=black)](https://developer.mozilla.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Status](https://img.shields.io/badge/Build-Passing-brightgreen.svg)]()

---

## 📑 Table of Contents

1. [Project Overview & Problem Statement](#-project-overview--problem-statement)
2. [What It Has Done (Core Features)](#-what-it-has-done-core-features)
3. [System Architecture & Design Patterns](#-system-architecture--design-patterns)
4. [Where It Is Done (Complete Directory & File Breakdown)](#-where-it-is-done-complete-directory--file-breakdown)
5. [How It Is Done (Technical Deep-Dive)](#-how-it-is-done-technical-deep-dive)
   - [5.1 Application Factory & Blueprint Pattern](#51-application-factory--blueprint-pattern)
   - [5.2 Database Modeling & Relationships](#52-database-modeling--relationships)
   - [5.3 Authentication & Token Security](#53-authentication--token-security)
   - [5.4 Project Ingestion & Auto-Unnesting Pipeline](#54-project-ingestion--auto-unnesting-pipeline)
   - [5.5 Security Sandboxing & Path Traversal Defense](#55-security-sandboxing--path-traversal-defense)
   - [5.6 Automated Technology & AST Detection](#56-automated-technology--ast-detection)
   - [5.7 GitHub-Style Repository Browser & Code Viewer](#57-github-style-repository-browser--code-viewer)
   - [5.8 Three.js Visuals & Responsive UI Design System](#58-threejs-visuals--responsive-ui-design-system)
6. [Interactive C++ & DSA Sample Projects Included](#-interactive-c--dsa-sample-projects-included)
7. [Installation & Quick Start Guide](#-installation--quick-start-guide)
8. [API Documentation (Endpoints Reference)](#-api-documentation-endpoints-reference)
9. [🎓 College Viva Voce & Technical Defense Q&A Guide](#-college-viva-voce--technical-defense-qa-guide)
   - [Category 1: High-Level Architecture & Project Overview](#category-1-high-level-architecture--project-overview)
   - [Category 2: Backend Architecture & Flask Framework](#category-2-backend-architecture--flask-framework)
   - [Category 3: Database, ORM & Data Modeling](#category-3-database-orm--data-modeling)
   - [Category 4: Security, Authentication & File Safety](#category-4-security-authentication--file-safety)
   - [Category 5: Data Structures, Algorithms & OS Concepts](#category-5-data-structures-algorithms--os-concepts)
   - [Category 6: Frontend Engineering & Modern UI](#category-6-frontend-engineering--modern-ui)
   - [Category 7: C++ & Object-Oriented Programming (OOP)](#category-7-c--object-oriented-programming-oop)
   - [Category 8: Examiner Trap & Defense Questions](#category-8-examiner-trap--defense-questions)
10. [Future Roadmap](#-future-roadmap)

---

## 🎯 Project Overview & Problem Statement

### The Problem
In academic institutions, universities, and coding bootcamps, evaluating student programming projects is typically a chaotic, manual process:
- Students submit compressed ZIP archives or repository URLs via disparate forms, emails, or LMS platforms.
- Instructors must manually download, unzip, configure environments, run dependencies, and hunt for README files.
- Many ZIP files contain heavy dependency folders (`node_modules/`, `venv/`, `.git/`, `__pycache__/`) that crash browsers or fill server storage.
- There is no central, searchable catalog to verify student project originality, inspect code line-by-line, or analyze project health.

### The Solution: ProjIntelligence
**Student Project Intelligence Platform** solves this by providing a unified web-based portal that acts as a localized, intelligent GitHub repository explorer with administrative ingestion and analysis:
- **Instant Ingestion**: Upload projects either via `.zip` archive or multi-file directory upload.
- **Client & Server Build Filtering**: Automatically prunes bloated folders like `node_modules/`, `venv/`, `.git/`, `.next/`, and `__pycache__/`.
- **Authentic Repository Browser**: Renders an interactive file tree with folders, file icons, breadcrumb navigation, and formatted `README.md` rendering.
- **Sandboxed Code Viewer**: Line numbers, syntax highlighting, file metadata, raw view, copy-to-clipboard, and single-click project zip download.
- **Automated Technology Detection**: Detects C++, Python, JavaScript, TypeScript, React, Flask, and CMakeLists by inspecting files and manifests.
- **Security Sandboxing**: Zero risk of Path Traversal (`../../etc/passwd`) or Zip-Slip attacks using canonicalized path boundaries (`os.path.commonpath`).

---

## ✨ What It Has Done (Core Features)

| Feature | Description | Implementation Details |
| :--- | :--- | :--- |
| **Authentic GitHub File Explorer** | Interactive file & folder directory navigation | Breadcrumb hierarchy (`main` / root / subfolders), parent folder `..` drill-down, file size formatting, and file-type specific icons. |
| **Full-Width Code Viewer** | Live code reading experience in the browser | Syntax highlighting via [Highlight.js](https://highlightjs.org/), line numbers (`hljs-ln`), line count badge, file size, "Raw", "Copy", and "Download". |
| **Dynamic README Rendering** | Markdown parsed and displayed below file table | Uses [Marked.js](https://marked.js.org/) to parse markdown with styled headings, code fences, blockquotes, and lists. |
| **Project Ingestion Pipeline** | Upload `.zip` archives or code folders | Drag-and-drop file upload, client-side directory traversal filtering, server-side unzipping, and auto-unnesting of single nested root folders. |
| **Client-Side Build Filter** | Eliminates browser lag & 413 payload limits | Strips `node_modules/`, `venv/`, `.git/`, and `__pycache__/` in JavaScript *before* the upload payload is transmitted over HTTP. |
| **Technology & AST Detection** | Identifies tech stack automatically | Scans extensions (`.cpp`, `.py`, `.ts`, `.js`) and dependency files (`package.json`, `requirements.txt`, `CMakeLists.txt`). |
| **Multi-Facet Discovery** | Search & filter indexed projects | Real-time search across project names, descriptions, categories (Web, ML, Systems, DSA), and languages (C++, Python, JS). |
| **Executive Admin Console** | Protected management dashboard | Token-based authentication, real-time KPI metrics (total projects, active, stars, health score), and project deletion/editing. |
| **Security File Sandboxing** | Prevents arbitrary code & directory disclosure | Path canonicalization (`os.path.commonpath`), Windows case-normalization (`os.path.normcase`), and sensitive file blocking (`.env`, `.db`, `.key`). |
| **Glassmorphism UI & Dark Mode** | Premium aesthetics with responsive layouts | HSL CSS variables, custom typography, 3D interactive particle background via [Three.js](https://threejs.org/), and TagCanvas 3D sphere. |

---

## 🏛️ System Architecture & Design Patterns

The platform adheres to the **Model-View-Controller / Service Layer (MVC-S)** architectural pattern:

```
+---------------------------------------------------------------------------------------+
|                                    PRESENTATION LAYER                                 |
|   index.html       projects.html       project-detail.html       admin.html           |
|   [Three.js Canvas]   [TagCanvas 3D]     [Highlight.js Code]     [Admin Dashboard]    |
|   Vanilla CSS Design System (Dark/Light Tokens)  |  Modular ES6 JavaScript (api.js)   |
+-------------------------------------------+-------------------------------------------+
                                            | JSON HTTP REST API / FormData
                                            v
+---------------------------------------------------------------------------------------+
|                                APPLICATION CONTROLLER LAYER                           |
|                         Flask Application Factory (app.py)                            |
|       +-----------------------------------+-----------------------------------+       |
|       |     blueprints/api.py             |     blueprints/admin.py           |       |
|       |  - GET /api/v1/projects           |  - POST /api/v1/admin/login       |       |
|       |  - GET /api/v1/projects/<id>/files|  - POST /api/v1/admin/projects/   |       |
|       |  - GET /api/v1/projects/<id>/code |         upload (ZIP / Folders)    |       |
|       |  - GET /api/v1/projects/<id>/dl   |  - PUT/DELETE /api/v1/admin/<id>  |       |
|       +-----------------------------------+-----------------------------------+       |
|                                           |                                           |
|       +-----------------------------------+-----------------------------------+       |
|       |                     blueprints/projects.py                            |       |
|       |  - Static asset serving & SPA client-side route fallback              |       |
|       +-----------------------------------------------------------------------+       |
+-------------------------------------------+-------------------------------------------+
                                            |
                                            v
+---------------------------------------------------------------------------------------+
|                                  BUSINESS SERVICE LAYER                               |
|   services/project_service.py     services/admin_service.py     services/analytics... |
|   - Directory Tree Builder        - itsdangerous URLSafe tokens - Metric Aggregation  |
|   - Path Canonicalization Guard   - PBKDF2 Password Verifier    - Health Computation  |
|   - 5MB Display Throttler         - Session & State Invalidation- Category Rollups    |
+-------------------------------------------+-------------------------------------------+
                                            |
                      +---------------------+---------------------+
                      |                                           |
                      v                                           v
+-------------------------------------------+   +---------------------------------------+
|               DATA ORM LAYER              |   |          LOCAL STORAGE REPOS          |
|            models/project.py              |   |               uploads/                |
|  - Project (health_score, stars, repo)    |   |  ├── currencyconvertor/               |
|  - Technology (many-to-many relationship) |   |  │   ├── backend/main.cpp (Sockets)   |
|  - Category (many-to-many relationship)   |   |  │   └── frontend/ (HTML/CSS/JS)      |
|            models/admin.py                |   |  ├── high-performance-c---analytics/ |
|  - Admin (password_hash, is_active)       |   |  │   ├── include/ & src/ (C++ Engine) |
|           extensions.py (db)              |   |  └── dsa-prj-vedant/                  |
|          SQLite Database Engine           |   |      └── Singly Linked List Train Sys |
+-------------------------------------------+   +---------------------------------------+
```

---

## 📂 Where It Is Done (Complete Directory & File Breakdown)

Below is an exhaustive breakdown of every file in the repository, explaining **where it is located**, **what it does**, and **how it contributes** to the application.

```
c:/Users/Shivam/Desktop/cpp_prj/
├── app.py                      # Application Factory, CORS setup & blueprint registration
├── config.py                   # Environment configuration, database URI, and upload limits
├── extensions.py               # Shared SQLAlchemy singleton database instance
├── init_db.py                  # Database table generator & initial seed data script
├── seed_admin.py               # Quick bootstrap script to create default admin account
├── requirements.txt            # Python dependencies (Flask, SQLAlchemy, CORS, etc.)
├── .env.example                # Blueprint environment configuration template
├── LICENSE                     # MIT open-source license
├── README.md                   # This master documentation and viva preparation guide
├── blueprints/                 # Flask modular routing blueprints
│   ├── __init__.py             # Package marker
│   ├── api.py                  # Public REST API for project browsing, files & code download
│   ├── admin.py                # Protected administrative endpoints, ingestion pipeline & stats
│   └── projects.py             # Frontend page routing and static asset serving
├── models/                     # Database ORM entity models
│   ├── __init__.py             # Package marker
│   ├── admin.py                # Admin model with secure password hashing (Werkzeug)
│   └── project.py              # Project, Technology, Category models & association tables
├── services/                   # Business logic and file sandboxing layer
│   ├── __init__.py             # Package marker
│   ├── admin_service.py        # Token generation/verification via itsdangerous, login auth
│   ├── analytics_service.py    # Metric aggregation, health grade distributions
│   └── project_service.py      # Recursive file tree builder, path sandboxing & code reader
├── frontend/                   # Modern Client Web Application (HTML5, CSS, ES6 JS)
│   ├── index.html              # Hero landing page with 3D Three.js particle canvas
│   ├── projects.html           # Project catalog with live search, filters, and pagination
│   ├── project-detail.html     # GitHub-style repository browser, tabs & code viewer
│   ├── admin.html              # Admin portal: drag-and-drop upload modal & metrics table
│   ├── about.html              # System architecture documentation & technical specs
│   ├── css/                    # Modular Design System Stylesheets
│   │   ├── variables.css       # HSL color tokens, dark/light theme definitions, typography
│   │   ├── base.css            # CSS reset, responsive container defaults, animations
│   │   ├── components.css      # Buttons, cards, badges, modal dialogs, loading spinners
│   │   ├── dashboard.css       # Grid layout, metric cards, activity stream styles
│   │   ├── project.css         # GitHub-style file explorer table, code viewer, line numbers
│   │   └── admin.css           # Dropzone, upload progress bar, tab switchers, data tables
│   └── js/                     # ES6 Frontend JavaScript Modules
│       ├── api.js              # Centralized Fetch API client wrapper with Bearer token injection
│       ├── utils.js            # DOM selector helpers, date formatters, file size formatters
│       ├── components.js       # Reusable UI component templates (project cards, tech pills)
│       ├── dashboard.js        # Home page logic, stats counter, TagCanvas 3D sphere
│       ├── project.js          # File tree navigation, breadcrumbs, Highlight.js integration
│       ├── admin.js            # Dropzone drag-and-drop, build folder filter, upload pipeline
│       ├── three.min.js        # Three.js 3D WebGL graphics library for background visual
│       └── tagcanvas.min.js    # Interactive 3D HTML5 Canvas technology cloud
├── uploads/                    # Local storage repository for indexed student codebases
│   ├── currencyconvertor/      # Full-stack C++ socket server backend + HTML/JS frontend
│   ├── high-performance-c.../  # C++17 statistical analytics engine with CMakeLists.txt
│   └── dsa-prj-vedant/         # Python DSA railway reservation singly linked list system
└── tests/                      # Automated test suite
    ├── __init__.py             # Package marker
    └── test_api.py             # Pytest automated test cases (Auth, API, Path Traversal)
```

### Detailed Breakdown of Core Source Files

| File Link | Primary Responsibility | Key Functions / Classes |
| :--- | :--- | :--- |
| [app.py](file:///c:/Users/Shivam/Desktop/cpp_prj/app.py) | Application Factory & Server entry point | `create_app()` initializes CORS, attaches SQLAlchemy `db`, registers blueprints, and creates tables. |
| [config.py](file:///c:/Users/Shivam/Desktop/cpp_prj/config.py) | App configuration parameters | `Config`, `DevelopmentConfig`, `ProductionConfig`. Sets SQLite URI, 50MB upload limit, secret keys. |
| [models/project.py](file:///c:/Users/Shivam/Desktop/cpp_prj/models/project.py) | Relational database schema | `Project`, `Technology`, `Category`, `project_technologies` association table, `to_dict()`. |
| [models/admin.py](file:///c:/Users/Shivam/Desktop/cpp_prj/models/admin.py) | Administrator credentials & security | `Admin` class, `set_password()`, `check_password()` utilizing PBKDF2 with SHA-256 salts. |
| [services/project_service.py](file:///c:/Users/Shivam/Desktop/cpp_prj/services/project_service.py) | Directory traversal & safe file reading | `get_all_projects()`, `get_project_files()` (recursive DFS tree builder), `get_file_content()` (sandboxed). |
| [services/admin_service.py](file:///c:/Users/Shivam/Desktop/cpp_prj/services/admin_service.py) | Token issuance & session management | `login()`, `verify_token()`, `logout_token()`. Employs `itsdangerous.URLSafeTimedSerializer`. |
| [blueprints/admin.py](file:///c:/Users/Shivam/Desktop/cpp_prj/blueprints/admin.py) | Ingestion pipeline & admin API | `admin_login()`, `upload_project()` (ZIP extraction, Zip-Slip guard, auto-unnest, tech detection). |
| [blueprints/api.py](file:///c:/Users/Shivam/Desktop/cpp_prj/blueprints/api.py) | Public REST API endpoints | `/health`, `/projects`, `/projects/<id>/files`, `/projects/<id>/file-content`, `/download`. |
| [blueprints/projects.py](file:///c:/Users/Shivam/Desktop/cpp_prj/blueprints/projects.py) | Web frontend delivery | `serve_frontend_assets()` serves HTML/CSS/JS and manages URL aliases (`/projects`, `/admin`). |
| [frontend/js/project.js](file:///c:/Users/Shivam/Desktop/cpp_prj/frontend/js/project.js) | Authentic GitHub file browser logic | `ProjectApp` class, `fetchFiles()`, `renderFileTable()`, `openFile()`, breadcrumb navigation. |
| [frontend/js/admin.js](file:///c:/Users/Shivam/Desktop/cpp_prj/frontend/js/admin.js) | Admin UI, dropzone & client-side filter | `AdminApp` class, `filterBuildDirectories()`, `handleUpload()`, real-time progress bar. |
| [tests/test_api.py](file:///c:/Users/Shivam/Desktop/cpp_prj/tests/test_api.py) | Quality assurance & regression tests | `test_health_check()`, `test_admin_auth_flow()`, `test_sensitive_file_blocking()`. |

---

## ⚙️ How It Is Done (Technical Deep-Dive)

### 5.1 Application Factory & Blueprint Pattern
Rather than initializing a global Flask application instance that leads to circular import dependencies, `app.py` uses the **Application Factory Pattern** (`create_app()`):
1. **Separation of Concerns**: Routes are segmented into independent blueprints:
   - `api_bp` (`/api/v1`): Public project discovery, file listing, content viewing, and ZIP downloading.
   - `admin_bp` (`/api/v1/admin`): Administrative authentication, project ingestion, statistics, and modifications.
   - `projects_bp` (`/`): Delivery of static HTML, CSS, JavaScript, and SPA client routing fallback.
2. **CORS Handling**: `Flask-CORS` is configured with explicit HTTP methods (`GET`, `POST`, `PUT`, `DELETE`) and headers (`Authorization`, `Content-Type`).

### 5.2 Database Modeling & Relationships
The SQLite database is managed via `Flask-SQLAlchemy` ORM. The relational architecture features a normalized many-to-many relationship:

```
+--------------------+        +---------------------------+        +--------------------+
|     technologies   |        |    project_technologies   |        |      projects      |
+--------------------+        +---------------------------+        +--------------------+
| id (PK)            |<-------| technology_id (FK, PK)    |   +--->| id (PK)            |
| name               |        | project_id (FK, PK)       |---+    | name               |
| slug               |        +---------------------------+        | slug               |
| icon, color        |                                             | repo_path          |
+--------------------+                                             | health_score       |
                                                                   | stars, forks       |
+--------------------+        +---------------------------+        | status, is_featured|
|     categories     |        |     project_categories    |        +--------------------+
+--------------------+        +---------------------------+                   ^
| id (PK)            |<-------| category_id (FK, PK)      |                   |
| name, slug, icon   |        | project_id (FK, PK)       |-------------------+
+--------------------+        +---------------------------+
```
- **Association Tables**: `project_technologies` and `project_categories` hold composite primary keys `(project_id, technology_id)` without duplicating entity records.
- **Serialization**: Every model implements `to_dict()`, ensuring clean JSON serialization across REST endpoints without circular reference loops.

### 5.3 Authentication & Token Security
Admin authentication does not rely on plain cookies or fragile state:
1. **Password Hashing**: Stored in `models/admin.py` using `werkzeug.security.generate_password_hash()`, creating a salted PBKDF2 hash with SHA-256. Passwords are never stored in plaintext.
2. **Cryptographically Signed URLSafe Tokens**: `services/admin_service.py` uses `itsdangerous.URLSafeTimedSerializer` with a server-side salt. 
3. **Expiry & Invalidation**: Tokens are timestamped and automatically expire after 7 days (`max_age=604800`). A blacklist set (`_revoked_tokens`) ensures immediate invalidation upon logout.

### 5.4 Project Ingestion & Auto-Unnesting Pipeline
Located in `blueprints/admin.py` (`upload_project()`) and `frontend/js/admin.js`:
1. **Client-Side Build Stripping**: Before sending gigabytes over the network, `admin.js` intercepts folder uploads via `webkitdirectory` and skips any path containing `node_modules/`, `venv/`, `.git/`, `.next/`, or `__pycache__/`.
2. **Zip Extraction**: If a `.zip` archive is uploaded, it is extracted into `uploads/<slug>/`.
3. **Automatic Unnesting**: Often, ZIP files contain a single redundant enclosing folder (e.g., `my-project-main/my-project/...`). The ingestion script detects if the extracted folder contains only 1 root directory, pulls all children up to the project root, and deletes the empty wrapper.

### 5.5 Security Sandboxing & Path Traversal Defense
Allowing users to read files from the server's filesystem introduces significant security vulnerabilities (Path Traversal / LFI / Zip-Slip). We prevent this using defense-in-depth in `services/project_service.py` and `blueprints/admin.py`:

```python
# 1. Zip-Slip Defense during archive extraction
for member in zf.infolist():
    member_path = os.path.normpath(os.path.join(target_dir, member.filename))
    if not os.path.normcase(member_path).startswith(os.path.normcase(target_dir)):
        raise Exception(f"Unsafe zip entry path: {member.filename}")

# 2. Strict Directory Sandboxing with Windows Canonicalization
repo_abs = os.path.abspath(project.repo_path)
full_path = os.path.abspath(os.path.join(repo_abs, file_path))
if os.path.commonpath([os.path.normcase(full_path), os.path.normcase(repo_abs)]) != os.path.normcase(repo_abs):
    return {'content': '', 'error': 'Invalid path: Access Denied'}

# 3. File & Extension Blacklist
for seg in normalized_path.split('/'):
    if seg.lower() in ['.env', 'instance', '.git', '__pycache__', 'venv']:
        return {'content': '', 'error': 'Access denied: protected file or directory'}
    if seg.startswith('.env') or seg.endswith(('.db', '.sqlite', '.key', '.pem')):
        return {'content': '', 'error': 'Access denied: protected file type'}
```
- **Windows `os.path.normcase`**: Resolves Windows case-insensitivity discrepancies (`C:\Project` vs `c:\project`).
- **5MB Display Limit**: Prevents large binaries or huge datasets from causing out-of-memory errors in the browser.

### 5.6 Automated Technology & AST Detection
When a project is uploaded, `blueprints/admin.py` traverses the repository files:
- **Language Detection**: Inspects file extensions:
  - `.cpp`, `.c`, `.hpp`, `.h` or `CMakeLists.txt` &rarr; C++
  - `.py` &rarr; Python
  - `.js`, `.jsx`, `.mjs` &rarr; JavaScript
  - `.ts`, `.tsx` &rarr; TypeScript
  - `.html`, `.css` &rarr; HTML/CSS
- **Framework & Manifest Inspection**: Reads `package.json` for `react`, `vue`, or `express`, and reads `requirements.txt` for `flask` or `django`.
- **Automatic Association**: Matches identified technologies against existing database records and establishes relations.

### 5.7 GitHub-Style Repository Browser & Code Viewer
In `frontend/js/project.js` and `frontend/project-detail.html`:
1. **Interactive File Table**: Shows folders first, followed by files in alphabetical order with icons, human-readable file sizes (`KB`, `MB`), and commit details.
2. **Breadcrumb Trail**: Allows one-click traversal from root down into deep nested folders.
3. **In-place README Rendering**: If a `README.md` is present in the current folder, it is parsed by `marked.js` and embedded right below the file listing.
4. **Code Inspection**: Clicking any file loads its contents into the code viewer, with auto-detected syntax highlighting and line numbers.

### 5.8 Three.js Visuals & Responsive UI Design System
- **Three.js Particle Mesh**: `frontend/js/dashboard.js` generates an animated 3D particle wave background on the landing page hero section.
- **TagCanvas 3D Cloud**: A revolving 3D spherical tag cloud displays available programming languages.
- **Vanilla CSS Design Tokens**: `frontend/css/variables.css` implements an HSL design token system supporting instantaneous dark and light theme switching via CSS custom properties.

---

## 💻 Interactive C++ & DSA Sample Projects Included

The repository comes with pre-configured student codebases in `uploads/` for demonstration and evaluation:

### 1. High-Performance C++ Analytics Engine (`uploads/high-performance-c---analytics-engine`)
- **Language & Standard**: Modern C++17 with CMake build system.
- **Files**: [CMakeLists.txt](file:///c:/Users/Shivam/Desktop/cpp_prj/uploads/high-performance-c---analytics-engine/CMakeLists.txt), [analytics_engine.hpp](file:///c:/Users/Shivam/Desktop/cpp_prj/uploads/high-performance-c---analytics-engine/include/analytics_engine.hpp), [analytics_engine.cpp](file:///c:/Users/Shivam/Desktop/cpp_prj/uploads/high-performance-c---analytics-engine/src/analytics_engine.cpp), [main.cpp](file:///c:/Users/Shivam/Desktop/cpp_prj/uploads/high-performance-c---analytics-engine/src/main.cpp).
- **Core Algorithms**: Fast numerical vector calculations using `std::accumulate`, `std::sort`, mean, standard deviation, and median calculation with pre-reserved vector capacities (`m_data.reserve(1000)`).

### 2. Multi-Platform C++ Currency Converter (`uploads/currencyconvertor`)
- **Language & Standard**: C++ with Winsock (`ws2_32`) / POSIX Sockets.
- **Files**: [main.cpp](file:///c:/Users/Shivam/Desktop/cpp_prj/uploads/currencyconvertor/backend/main.cpp) (HTTP socket web server), [frontend/index.html](file:///c:/Users/Shivam/Desktop/cpp_prj/uploads/currencyconvertor/frontend/index.html), [frontend/script.js](file:///c:/Users/Shivam/Desktop/cpp_prj/uploads/currencyconvertor/frontend/script.js).
- **Architecture**: A raw C++ socket server listening on HTTP ports, parsing incoming HTTP requests, and serving dynamic exchange calculations to a responsive web frontend.

### 3. Smart Railway Waiting List System (`uploads/dsa-prj-vedant`)
- **Language**: Python 3.
- **Data Structure**: Custom Singly Linked List for waiting list management with FIFO queue processing, automatic seat allocation, and terminal visualizations.

---

## 🚀 Installation & Quick Start Guide

### Prerequisites
- Python 3.10+ (Tested on Python 3.10, 3.11, 3.12, 3.14)
- Pip (Python Package Manager)
- A modern browser (Chrome, Edge, Firefox, Safari)

### Step 1: Clone or Navigate to the Repository
```bash
cd c:\Users\Shivam\Desktop\cpp_prj
```

### Step 2: Set Up Virtual Environment
```bash
# Windows
python -m venv venv
.\venv\Scripts\activate

# Linux / macOS
python3 -m venv venv
source venv/bin/activate
```

### Step 3: Install Required Dependencies
```bash
pip install -r requirements.txt
```

### Step 4: Initialize Database & Default Admin
```bash
python init_db.py
python seed_admin.py
```
> **Default Admin Credentials:**
> - **Username:** `admin`
> - **Password:** `admin123`

### Step 5: Start the Flask Application
```bash
python app.py
```

### Step 6: Access the Platform in Your Browser
- **Home & Featured Showcase:** [http://localhost:5000](http://localhost:5000)
- **Projects Discovery & Catalog:** [http://localhost:5000/projects.html](http://localhost:5000/projects.html)
- **Admin Management Console:** [http://localhost:5000/admin.html](http://localhost:5000/admin.html)
- **Technical Architecture (About):** [http://localhost:5000/about.html](http://localhost:5000/about.html)

---

## 🔌 API Documentation (Endpoints Reference)

All API responses return a structured JSON format: `{ "success": true, "data": { ... } }` or `{ "success": false, "error": { "code": "...", "message": "..." } }`.

### Public Endpoints (`/api/v1`)

| Method | Endpoint | Description | Query Parameters |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/health` | Server health check and version info | None |
| `GET` | `/api/v1/projects` | List projects with pagination & filters | `page=1`, `per_page=12`, `search=cpp`, `category=web-development` |
| `GET` | `/api/v1/projects/<id>` | Retrieve complete project metadata | None |
| `GET` | `/api/v1/projects/<id>/files` | Get directory tree for current folder | `path=src/subfolder` |
| `GET` | `/api/v1/projects/<id>/file-content` | Read sandboxed content of a file | `path=src/main.cpp` |
| `GET` | `/api/v1/projects/<id>/analysis-summary` | Project health score and statistics | None |
| `GET` | `/api/v1/projects/<id>/download` | Stream repository as sanitized `.zip` | None |

### Protected Administrative Endpoints (`/api/v1/admin`)
*Requires header: `Authorization: Bearer <token>`*

| Method | Endpoint | Description | Payload |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/admin/login` | Authenticate admin & generate token | JSON: `{ "username": "admin", "password": "..." }` |
| `POST` | `/api/v1/admin/logout` | Revoke active token & clear session | None |
| `GET` | `/api/v1/admin/me` | Fetch active admin profile | None |
| `GET` | `/api/v1/admin/dashboard/stats` | Aggregate metrics (projects, stars, scores)| None |
| `POST` | `/api/v1/admin/projects/upload` | Ingest project (ZIP or multi-file folder) | `multipart/form-data` with files/zip |
| `PUT` | `/api/v1/admin/projects/<id>` | Edit project title, description, scores | JSON with updated fields |
| `DELETE` | `/api/v1/admin/projects/<id>` | Delete project from database and disk | None |

---

## 🎓 College Viva Voce & Technical Defense Q&A Guide

*This comprehensive section contains 50+ real-world questions that external examiners, university professors, and technical interviewers frequently ask during project defense.*

---

### Category 1: High-Level Architecture & Project Overview

#### Q1: What is the main objective of this project?
**Answer:** The objective is to build an intelligent, centralized web platform for educational institutions to ingest, inspect, verify, and evaluate student software projects. It provides a local GitHub-like repository browser, sandboxed file viewer, automated technology detection, and project health scoring without requiring instructors to manually unzip files and configure runtime environments.

#### Q2: What architecture did you use, and why?
**Answer:** We used the **Model-View-Controller / Service (MVC-S)** pattern. 
- **Controller/Routing:** Flask Blueprints (`blueprints/api.py`, `blueprints/admin.py`, `blueprints/projects.py`) handle HTTP request dispatching.
- **Service Layer:** `services/project_service.py` and `services/admin_service.py` encapsulate business logic, file sandboxing, and security validations.
- **Model Layer:** SQLAlchemy ORM classes (`Project`, `Technology`, `Category`, `Admin`) manage data persistence and relations.
- **View Layer:** A responsive client-side Single Page/Multi-Page hybrid built with modern Vanilla JavaScript and CSS variables.

#### Q3: Why didn't you use React or Angular for the frontend?
**Answer:** 
1. **Zero Build Overhead:** Vanilla JS requires no webpack, Vite, or Node compilation step, ensuring the project runs instantly on any evaluation machine with only Python.
2. **Superior Performance:** Directly manipulating the DOM without virtual DOM overhead results in instantaneous rendering of large repository file trees.
3. **Architectural Cleanliness:** Modern ES6 modules, CSS Custom Properties (variables), and standard Fetch API provide all necessary reactive capabilities cleanly.

---

### Category 2: Backend Architecture & Flask Framework

#### Q4: What is the Application Factory Pattern in Flask, and why did you use it?
**Answer:** In [app.py](file:///c:/Users/Shivam/Desktop/cpp_prj/app.py), instead of creating a global `app = Flask(__name__)` instance, we encapsulated application setup inside `create_app()`. This prevents circular imports between models, blueprints, and database extensions, and allows dynamic configuration switching (such as testing with an in-memory SQLite database via Pytest).

#### Q5: What is a Flask Blueprint?
**Answer:** A Blueprint is a mechanism for organizing related routes, views, and handlers into isolated modules. We divided the application into three blueprints:
- `api_bp` for public REST endpoints,
- `admin_bp` for administrative controls,
- `projects_bp` for serving frontend HTML files.

#### Q6: How do you handle Cross-Origin Resource Sharing (CORS)?
**Answer:** Using `flask_cors.CORS(app)`. It intercepts pre-flight `OPTIONS` HTTP requests and appends headers like `Access-Control-Allow-Origin: *` and `Access-Control-Allow-Headers: Authorization, Content-Type`, enabling secure API interactions.

#### Q7: What is the difference between WSGI and HTTP?
**Answer:** HTTP is the application-level networking protocol between the client's browser and the web server. WSGI (Web Server Gateway Interface) is the Python standard calling convention that forwards requests from web servers (like Nginx, Gunicorn, or Werkzeug) to Python callables (`app`).

---

### Category 3: Database, ORM & Data Modeling

#### Q8: Why did you choose SQLite over MySQL or PostgreSQL?
**Answer:** SQLite is a serverless, self-contained, zero-configuration SQL database engine stored as a single file. For an institutional project evaluation platform and demonstration, SQLite eliminates database server setup requirements while remaining ACID-compliant. Because we use Flask-SQLAlchemy, the database layer is completely abstracted; switching to PostgreSQL or MySQL requires changing only one line in `config.py` (`SQLALCHEMY_DATABASE_URI`).

#### Q9: How is the Many-to-Many relationship between Projects and Technologies implemented?
**Answer:** In [models/project.py](file:///c:/Users/Shivam/Desktop/cpp_prj/models/project.py), we defined an association table `project_technologies`:
```python
project_technologies = db.Table('project_technologies',
    db.Column('project_id', db.Integer, db.ForeignKey('projects.id'), primary_key=True),
    db.Column('technology_id', db.Integer, db.ForeignKey('technologies.id'), primary_key=True)
)
```
The `Project` model references this via `db.relationship('Technology', secondary=project_technologies, backref='projects')`. This maintains relational integrity with composite foreign keys.

#### Q10: What is lazy loading vs eager loading in SQLAlchemy?
**Answer:** 
- **Lazy loading:** Related records are queried from the database only when accessed as an attribute (default in SQLAlchemy).
- **Eager loading (`joinedload`):** Related entities are fetched in the initial `SELECT` using an SQL `JOIN`. We utilize explicit dictionary serialization (`to_dict()`) to cleanly control query execution.

#### Q11: What happens if database operations fail midway during project creation?
**Answer:** We wrap database transactions in `try ... except` blocks with `db.session.rollback()` in the error handler. This guarantees atomicity—if file saving fails or a database error occurs, all pending inserts are rolled back, preventing orphaned records.

---

### Category 4: Security, Authentication & File Safety

#### Q12: How are admin passwords stored securely?
**Answer:** In [models/admin.py](file:///c:/Users/Shivam/Desktop/cpp_prj/models/admin.py), passwords are never stored in plaintext. They are hashed using `werkzeug.security.generate_password_hash()`, which implements PBKDF2 (Password-Based Key Derivation Function 2) with HMAC-SHA256 and a random cryptographic salt. Verification is performed using constant-time string comparison (`check_password_hash`) to prevent timing attacks.

#### Q13: What is the Zip-Slip vulnerability, and how did you prevent it?
**Answer:** Zip-Slip is an arbitrary file overwrite vulnerability where a maliciously crafted ZIP archive contains relative path entries such as `../../../../Windows/System32/calc.exe`. When extracted, it escapes the target directory.
We prevent it in [blueprints/admin.py](file:///c:/Users/Shivam/Desktop/cpp_prj/blueprints/admin.py) by verifying that every extracted member's canonical path begins with the target folder:
```python
member_path = os.path.normpath(os.path.join(target_dir, member.filename))
if not os.path.normcase(member_path).startswith(os.path.normcase(target_dir)):
    raise Exception("Unsafe zip entry path")
```

#### Q14: How did you prevent Path Traversal attacks in the file viewer?
**Answer:** When a user requests a file via `/api/v1/projects/<id>/file-content?path=...`, an attacker could pass `../../../../.env` or `../../../../boot.ini`.
In [services/project_service.py](file:///c:/Users/Shivam/Desktop/cpp_prj/services/project_service.py), we enforce:
1. Canonical resolution with `os.path.abspath`.
2. Strict common prefix validation using `os.path.commonpath([normcase(full_path), normcase(repo_abs)]) == normcase(repo_abs)`.
3. Explicit blacklisting of sensitive files: `.env`, `.db`, `.sqlite`, `.key`, `.pem`, and hidden folders like `.git/`.

#### Q15: Why use `itsdangerous` instead of standard JWT?
**Answer:** `itsdangerous` is Python's cryptographic data signing library maintained by the Pallets team (creators of Flask). It signs payloads using HMAC-SHA1/SHA256 with timestamp validation (`URLSafeTimedSerializer`). It provides tamper-proof token generation with lower overhead than third-party JWT libraries.

---

### Category 5: Data Structures, Algorithms & OS Concepts

#### Q16: How did you implement the file explorer directory tree?
**Answer:** In [services/project_service.py](file:///c:/Users/Shivam/Desktop/cpp_prj/services/project_service.py), we implemented a recursive **Depth-First Search (DFS)** algorithm (`build_tree`) that walks the filesystem up to a maximum depth limit of 6 to prevent stack overflow. It constructs a hierarchical JSON tree with folders and files sorted alphabetically, folders first.

#### Q17: What is the time complexity of the directory listing algorithm?
**Answer:** $O(V + E)$ where $V$ is the number of files and directories within the project repository and $E$ is the parent-child directory edges. Sorting each level takes $O(K \log K)$ where $K$ is the number of entries in that specific directory.

#### Q18: What data structure did you use to detect technologies?
**Answer:** A hash set (`detected_tech_slugs = set()`). A set provides $O(1)$ amortized insertion and deduplication, ensuring that scanning thousands of files does not insert duplicate language tags.

#### Q19: How do you stream a project ZIP download without running out of server RAM?
**Answer:** In [blueprints/api.py](file:///c:/Users/Shivam/Desktop/cpp_prj/blueprints/api.py), rather than reading the entire project into a memory buffer (`io.BytesIO`), we generate a temporary file on disk using `tempfile.mkdtemp()`, stream it to the client in chunks using Flask's `send_file()`, and clean up the temporary directory immediately after the response finishes using `@after_this_request`.

---

### Category 6: Frontend Engineering & Modern UI

#### Q20: How does the client-side build folder filtering work?
**Answer:** In [frontend/js/admin.js](file:///c:/Users/Shivam/Desktop/cpp_prj/frontend/js/admin.js), when a user selects a folder via `<input type="file" webkitdirectory>`, the browser exposes the relative paths of all nested files (`file.webkitRelativePath`). Before creating the `FormData` upload payload, our filter iterates through the file list and discards any file whose path contains `node_modules`, `venv`, `.git`, or `__pycache__`. This prevents uploading tens of thousands of unwanted files.

#### Q21: How is dark mode implemented and persisted?
**Answer:** Through CSS custom properties (variables) defined in [frontend/css/variables.css](file:///c:/Users/Shivam/Desktop/cpp_prj/frontend/css/variables.css). We set default tokens for `:root` and override them under `[data-theme="dark"]`. When the user toggles the switch, JavaScript updates the `data-theme` attribute on `document.documentElement` and saves the preference in `localStorage.setItem('theme', 'dark')`.

#### Q22: What role does Three.js play in the project?
**Answer:** [Three.js](https://threejs.org/) renders an interactive 3D particle plane wave on the hero landing page canvas. It runs on WebGL, computing sine wave oscillations per particle frame with mouse camera parallax tracking, creating a modern visual experience without consuming excessive CPU cycles.

---

### Category 7: C++ & Object-Oriented Programming (OOP)

*(Examiners frequently ask C++ questions because C++ sample repositories are uploaded in the platform!)*

#### Q23: What C++ standard is used in the analytics engine, and what are its key features?
**Answer:** Modern **C++17**. Key features used:
- `<numeric>` algorithms (`std::accumulate`)
- `std::vector` dynamic arrays with capacity reservation (`reserve(1000)`)
- RAII (Resource Acquisition Is Initialization) memory management
- `const` member functions to ensure const-correctness.

#### Q24: What is Const-Correctness in C++?
**Answer:** In [include/analytics_engine.hpp](file:///c:/Users/Shivam/Desktop/cpp_prj/uploads/high-performance-c---analytics-engine/include/analytics_engine.hpp), methods such as `double calculateMean() const` and `size_t getSampleSize() const` are marked `const`. This guarantees that these methods will not modify any member variables of the class (`m_data`), allowing them to be safely invoked on `const` references and instances.

#### Q25: How does the C++ socket server in the currency converter work?
**Answer:** In [uploads/currencyconvertor/backend/main.cpp](file:///c:/Users/Shivam/Desktop/cpp_prj/uploads/currencyconvertor/backend/main.cpp):
1. Initializes the Winsock library on Windows via `WSAStartup()`.
2. Creates a TCP streaming socket with `socket(AF_INET, SOCK_STREAM, 0)`.
3. Binds the socket to an IP and port with `bind()`.
4. Listens for incoming connections with `listen()`.
5. Accepts client HTTP connections with `accept()`, reads HTTP request headers via `recv()`, and writes HTTP response headers and JSON body with `send()`.

#### Q26: What is the difference between TCP and UDP?
**Answer:** 
- **TCP (Transmission Control Protocol):** Connection-oriented, reliable, guarantees in-order packet delivery using three-way handshakes (`SYN`, `SYN-ACK`, `ACK`), flow control, and retransmissions. Used by HTTP and our C++ socket server.
- **UDP (User Datagram Protocol):** Connectionless, unreliable, low-latency, transmits packets without delivery guarantees. Used for live video streaming and gaming.

#### Q27: What is CMake and what is `CMakeLists.txt`?
**Answer:** CMake is a cross-platform build automation tool. It generates native makefiles or visual studio projects according to rules specified in [CMakeLists.txt](file:///c:/Users/Shivam/Desktop/cpp_prj/uploads/high-performance-c---analytics-engine/CMakeLists.txt), linking include directories and source files into executables.

---

### Category 8: Examiner Trap & Defense Questions

#### Q28: "Your project uses SQLite. What happens when 1,000 users upload files simultaneously?"
**Answer:** In a high-concurrency production environment, SQLite can become a bottleneck because it locks the database file during writes (WAL mode helps, but write operations remain sequential). To scale to thousands of simultaneous users:
1. We would update `SQLALCHEMY_DATABASE_URI` in `config.py` to point to **PostgreSQL**, which supports row-level locking and concurrent transactions.
2. File uploads would be offloaded to an asynchronous background worker queue using **Celery** or **Redis Queue (RQ)**.
3. Storage would be moved from local disk `uploads/` to an S3-compatible object store (such as AWS S3 or MinIO).

#### Q29: "If a student uploads malicious C++ or Python code containing `system('rmdir /s /q C:\\')`, will your server execute it?"
**Answer:** **No, absolutely not.** Our platform is a static code inspector and repository browser; it **does not execute** student code on the host machine. Files are strictly read as UTF-8 text for display and syntax highlighting. For future automated test execution, we have designed an isolated Docker/gVisor containerization sandbox sandbox architecture.

#### Q30: "Why didn't you just use GitHub API instead of building this?"
**Answer:** 
1. **Academic Privacy & Independence:** Many student assignments, exam projects, or internal university codebases cannot be pushed to public GitHub repositories due to intellectual property policies and academic integrity rules.
2. **Offline & Air-gapped Capability:** Our platform functions completely within a local college intranet without requiring internet connectivity or GitHub rate limits.
3. **Automated Submission Pipeline:** Direct ZIP and folder uploads simplify submissions for novice students who have not yet learned Git CLI workflows.

---

## 🔮 Future Roadmap

- 🤖 **AI-Powered Code Reviewer**: Integration with LLM APIs for automated code quality explanations, bug detection, and test coverage suggestions.
- 🐳 **Dockerized Sandboxed Test Runner**: Secure, isolated test suite execution for student code submissions.
- 🔍 **AST-Based Plagiarism Detection**: Tokenizing code abstract syntax trees to detect cross-student copying even when variable names and comments have been altered.

---

## 👨‍💻 Project Information & Credits

- **Platform:** ProjIntelligence (v2.1)
- **Lead Architect & Developer:** Vedant Panhalkar
- **Primary Technologies:** Python 3, Flask, SQLAlchemy, SQLite, C++17, ES6 JavaScript, Three.js
- **Environment:** Windows / Linux / macOS compatible
- **Purpose:** Intelligent Repository Exploration, Static Security Auditing & Code Health Scoring
