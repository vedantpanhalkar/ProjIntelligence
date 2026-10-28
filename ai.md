# MASTER PROMPT — PROJINTELLIGENCE V1

## Senior Full-Stack Engineer | Repository Intelligence Platform

Act as a senior full-stack software engineer, software architect, UI/UX engineer, database engineer, and QA engineer.

Your task is to inspect, complete, improve, and thoroughly test my existing project:

**Project Name:** ProjIntelligence
**Project Type:** Student Project Intelligence & Verification Platform
**Primary Goal:** Build a fully functional, modern, reliable platform for uploading, browsing, analyzing, comparing, and evaluating student software repositories.

IMPORTANT: This is an existing application. Do not rebuild it from scratch, replace its architecture unnecessarily, or delete working functionality.

Your first responsibility is to understand the existing codebase. Your second responsibility is to identify incomplete features and implement them. Your third responsibility is to test the entire application.

Do not stop after inspecting the project or generating a plan. Continue with implementation, integration, and testing until the achievable V1 requirements are complete.

---

# 1. PROJECT CONTEXT

The platform allows universities, students, coding bootcamps, and developer communities to inspect and evaluate software projects.

It should provide:

* Project ingestion through ZIP archives and folder uploads.
* Automatic technology detection.
* Repository browsing similar to GitHub.
* Syntax-highlighted code inspection.
* README rendering.
* Project search and filtering.
* Rule-based code health analysis.
* Project comparison.
* Project activity history.
* Downloadable analysis reports.
* Administrative project management.
* Secure file handling.
* Responsive and professional user interfaces.

The application must work with real repository data rather than hardcoded demonstration content.

Use existing database records and uploaded project files wherever possible.

If demonstration projects are necessary, create clearly identified sample data that does not interfere with actual uploaded projects.

# 2. EXISTING TECHNOLOGY STACK

Preserve the current stack unless a specific change is necessary.

Backend:

* Python.
* Flask.
* Flask Blueprints.
* Flask-SQLAlchemy.
* SQLite.
* REST API under /api/v1.
* itsdangerous for signed tokens where appropriate.

Frontend:

* HTML5.
* Modern CSS.
* Vanilla JavaScript.
* ES6 modules.
* Existing modular JavaScript files such as api.js, components.js, dashboard.js, project.js, admin.js, and utils.js.

Existing frontend libraries:

* Three.js.
* TagCanvas.
* Highlight.js.
* Marked.js.

Existing application pages:

* index.html
* projects.html
* project-detail.html
* admin.html

Reuse installed libraries and existing components whenever possible.

Do not introduce React, Next.js, Vue, or another frontend framework.

Do not migrate SQLite to another database without a compelling technical reason.

Do not add unnecessary dependencies.

Before installing packages, inspect the existing requirements and environment.

# 3. PHASE ZERO — INSPECT BEFORE MODIFYING

Before changing any code, inspect the complete existing project structure.

Read:

* Backend entry points.
* Flask application factory.
* Blueprints and API routes.
* SQLAlchemy models.
* Database initialization and migrations.
* Authentication and authorization logic.
* Upload and ZIP extraction code.
* Repository file-reading logic.
* Frontend HTML files.
* CSS files.
* JavaScript modules.
* Configuration files.
* Requirements.
* Existing tests.
* README and setup instructions.

Create an internal feature inventory with these statuses:

1. COMPLETE — implemented and verified.
2. PARTIAL — implemented but incomplete or unreliable.
3. MISSING — not implemented.
4. BROKEN — implemented but failing.
5. NEEDS SECURITY REVIEW — functionality exists but requires additional verification.

Inspect the actual code before deciding which category applies.

Do not duplicate an existing feature simply because its implementation differs from your preferred approach.

Do not overwrite functioning implementations without a clear reason.

Identify existing bugs, broken API connections, inconsistent database models, missing event handlers, incorrect API paths, and frontend/backend integration problems.

Then proceed directly to implementation.

# 4. CORE FEATURE A — PROJECT INGESTION ENGINE

Complete the existing project ingestion workflow.

Support:

1. ZIP archive uploads.
2. Multiple-file folder uploads.
3. Project metadata.
4. Automatic project technology detection.
5. Project category assignment.
6. Optional homepage featuring.
7. Project indexing and analysis.

Required workflow:

Upload project
↓
Validate input
↓
Extract or receive files safely
↓
Filter irrelevant files
↓
Detect project structure
↓
Identify technologies
↓
Calculate basic repository metrics
↓
Generate health report
↓
Save metadata and analysis to database
↓
Display project in discovery portal

Requirements:

* Preserve the existing upload interface where practical.
* Display upload progress and meaningful error messages.
* Prevent duplicate or conflicting project identifiers.
* Handle empty repositories.
* Handle malformed ZIP files.
* Handle unsupported file types gracefully.
* Support projects with or without a README.
* Support repositories containing nested directories.
* Unwrap redundant top-level folders when appropriate.
* Preserve the actual project directory structure.
* Prevent file overwrites between unrelated projects.
* Keep uploaded files associated with their correct database records.

Automatically ignore unnecessary build and cache directories, including:

* node_modules
* .git
* **pycache**
* venv
* .venv
* dist
* build
* common IDE cache directories

Do not delete potentially important source or configuration files simply because their names are unfamiliar.

Make exclusion rules configurable where practical.

Implement strict upload limits for:

* Compressed archive size.
* Extracted total size.
* Number of files.
* Individual file size.
* Path length and nesting depth.

Protect against ZIP Slip, path traversal, symlink abuse, archive bombs, and unsafe filesystem paths.

Do not execute uploaded programs on the Flask server.

# 5. CORE FEATURE B — AUTOMATIC TECHNOLOGY DETECTION

Implement reliable rule-based technology detection.

Detect technologies using file extensions and relevant configuration files.

Examples:

Python:

* .py
* requirements.txt
* pyproject.toml

C and C++:

* .c
* .h
* .cpp
* .hpp
* CMakeLists.txt
* Makefile

JavaScript:

* .js
* package.json

TypeScript:

* .ts
* .tsx

Web:

* .html
* .css
* relevant frontend configuration files

Java:

* .java
* pom.xml
* build.gradle

Other possible technologies:

* C#
* PHP
* Go
* Rust
* Ruby
* Kotlin
* Swift
* Jupyter notebooks
* SQL
* Shell scripting.

Detect frameworks and tools only when sufficient evidence exists.

For example, do not label a project as React solely because it contains JavaScript files. Inspect package.json or relevant source imports.

Avoid duplicate language tags.

Display detected technologies consistently on:

* Homepage cards.
* Discovery cards.
* Project detail pages.
* Admin management tables.
* Project reports.

# 6. CORE FEATURE C — PROJECT DISCOVERY PORTAL

Complete projects.html.

Implement:

* Search by project title.
* Search by description.
* Search by technology.
* Search by category.
* Language filters.
* Project category filters.
* Health grade filters.
* Sorting by newest.
* Sorting by health score.
* Sorting by project name.
* Featured-project filtering where appropriate.
* Pagination.
* Clear-all-filters functionality.

The search should work against actual backend data.

Use the existing REST API and add backend filtering parameters if necessary.

Suggested query parameters:

GET /api/v1/projects?q=currency&language=cpp&category=web&grade=A&page=1&per_page=12&sort=score

Adapt parameter names to the existing implementation rather than creating conflicting alternatives.

Requirements:

* Use debouncing for search input.
* Update the URL query parameters when useful.
* Handle loading, error, and empty states.
* Prevent duplicate requests where practical.
* Reset pagination when filters change.
* Preserve valid filters when navigating back.
* Do not implement fake filtering that only works on the currently loaded cards.

Pagination must be consistent with backend totals.

# 7. CORE FEATURE D — GITHUB-STYLE REPOSITORY BROWSER

Complete project-detail.html.

Create a repository browsing experience inspired by GitHub's file navigation.

Required features:

Repository header:

* Project title.
* Description.
* Technology badges.
* Health score.
* Verification status.
* Project category.
* Download project ZIP action.

Navigation:

* Branch label, such as main, only when accurate or explicitly presented as a logical default.
* Clickable breadcrumbs.
* Current directory display.
* Parent-directory navigation.
* Correct navigation into nested directories.

File explorer:

* Folders displayed before files.
* Appropriate file-type icons.
* File names.
* File sizes.
* Directory counts where useful.
* Empty-directory handling if supported.
* Safe path navigation.
* Correct sorting.

Code viewer:

* Syntax highlighting.
* Line numbers.
* Line count.
* File size.
* Raw view.
* Copy source code.
* Download individual file.
* Return to file list.
* Useful loading and error states.

README:

* Render Markdown using the existing Marked.js integration.
* Sanitize rendered HTML with a suitable established sanitizer.
* Block unsafe HTML and dangerous URL schemes.
* Handle missing README files gracefully.

File-reading security:

* Validate every requested path on the backend.
* Resolve paths against the correct project root.
* Prevent traversal outside the project directory.
* Apply file-size limits.
* Detect binary files.
* Avoid loading extremely large files entirely into browser memory.
* Never allow a user to read files belonging to another project through path manipulation.

Do not hardcode a project's file tree.

All directory and file information must come from the actual repository.

# 8. CORE FEATURE E — RULE-BASED PROJECT HEALTH ANALYZER

Implement a transparent, deterministic project health scoring system.

Do not integrate an LLM yet.

Do not invent scores.

Calculate the score from real, measurable repository properties.

Suggested categories:

1. Documentation quality.
2. Testing and test organization.
3. Code organization.
4. Configuration and dependency management.
5. Maintainability indicators.

Suggested scoring model:

Documentation: 20 points.
Testing: 20 points.
Code organization: 20 points.
Configuration: 20 points.
Maintainability: 20 points.

Total: 100 points.

Each category must have documented rules.

Possible checks:

Documentation:

* README exists.
* README has meaningful content.
* Setup instructions are present.
* Dependencies are documented.
* Usage instructions are present.

Testing:

* Test files exist.
* Recognized testing configuration exists.
* Tests appear organized.
* Actual test execution results are available, if tests have been safely run.

Code organization:

* Source files are organized into reasonable directories.
* Relevant project configuration exists.
* File naming and project structure are reasonably consistent.

Configuration:

* Dependency manifests exist when appropriate.
* Runtime requirements are documented.
* Example configuration is available where relevant.
* Actual secrets are not exposed.

Maintainability:

* Detect unusually large source files.
* Identify empty or obviously redundant files where safe.
* Calculate simple complexity metrics where supported.
* Identify excessive duplication only if a reliable deterministic method is implemented.

Important rules:

* Apply language-specific rules where necessary.
* Do not penalize legitimate single-file projects unfairly.
* Do not assume every project needs Docker.
* Do not assume every project needs a database.
* Do not treat the absence of tests as proof of incorrect functionality.
* Do not claim code correctness merely because files exist.
* Distinguish checks that passed, failed, and could not be evaluated.

Show:

* Overall score.
* Category scores.
* Individual findings.
* Recommendations.
* Analysis timestamp.
* Scoring algorithm version.

Use a documented grading scale, such as:

A: 90–100
B: 75–89
C: 60–74
D: 40–59
F: 0–39

These thresholds may be adjusted if the existing project already defines a grading scale.

Store analysis results in the database.

Historical reports must remain associated with the repository snapshot they describe.

Do not silently rewrite historical scores after changing the scoring algorithm.

# 9. CORE FEATURE F — PROJECT COMPARISON

Add a project comparison page or comparison mode using the existing design system.

Allow users to select two projects.

Compare actual values for:

* Technologies.
* Source file count.
* Total repository size.
* Documentation status.
* Test file count.
* Configuration files.
* Project category.
* Health score.
* Health category scores.
* Security scan status, if available.
* Latest analysis timestamp.

Display the results side by side.

Use clear visual indicators and charts only where they improve understanding.

Do not claim that the project with more files or more technologies is automatically better.

Allow users to navigate from comparison results to the corresponding project pages.

Use real database records.

Handle projects with missing metrics gracefully.

# 10. CORE FEATURE G — PROJECT ACTIVITY HISTORY

Create an activity history system.

Record relevant events such as:

* Project uploaded.
* Project metadata updated.
* Technology detection completed.
* Health analysis completed.
* Security scan completed.
* Project featured or unfeatured.
* Project deleted.
* Analysis failed.

Each event should include appropriate information, such as:

* Project identifier.
* Event type.
* Timestamp.
* Relevant status.
* Associated analysis identifier where appropriate.

Respect authentication and authorization.

Do not expose sensitive internal error messages or secrets through activity feeds.

Show a project-specific timeline on the project detail page.

Show a system activity feed in the admin dashboard.

Historical analysis results must be preserved according to the application's retention policy, even if the current project score changes.

When a project is deleted, handle associated activity and analysis records consistently.

Do not retain unnecessary source-code contents in audit logs.

# 11. CORE FEATURE H — DOWNLOADABLE ANALYSIS REPORTS

Implement downloadable project analysis reports.

Start with HTML or PDF, depending on the existing architecture and available dependencies.

A report should contain:

1. Project information.
2. Analysis timestamp.
3. Repository snapshot identifier or version information when available.
4. Detected technologies.
5. Repository statistics.
6. Documentation checks.
7. Testing indicators.
8. Configuration checks.
9. Maintainability findings.
10. Health score and category scores.
11. Recommendations.
12. Analysis limitations.

Requirements:

* Generate reports from stored analysis results.
* Ensure the report corresponds to the correct project and analysis version.
* Use clear formatting.
* Handle missing data.
* Do not include authentication tokens, credentials, or secret values.
* Escape untrusted project metadata.
* Use predictable file names.
* Return appropriate API error responses when a report cannot be generated.

If PDF support requires additional dependencies, assess the existing environment first.

Do not make PDF generation a reason to delay the entire application.

# 12. CORE FEATURE I — BOOKMARKS AND RECENTLY VIEWED PROJECTS

Implement this feature only after the core project browser and analysis workflows work correctly.

If the application already supports user accounts, use the existing authentication system.

Allow authenticated users to:

* Bookmark projects.
* Remove bookmarks.
* View bookmarked projects.
* See recently viewed projects.
* Remove individual recent items.
* Avoid duplicate entries in recent history.

Store user-specific data in SQLite.

Enforce ownership checks on the backend.

Do not trust a user ID supplied by the browser without validating the authenticated identity.

If the application currently has no student account system, do not invent an insecure authentication mechanism.

Instead, either add a minimal secure account system only if it fits the existing architecture, or postpone this feature while completing the core platform.

# 13. CORE FEATURE J — ADMINISTRATION CONSOLE

Complete admin.html.

The administration console should display real data:

* Total projects.
* Active projects.
* Featured projects.
* Average health score.
* Technology distribution.
* Recent uploads.
* Recent analyses.
* Failed analysis jobs, if applicable.

Provide project management actions:

* Search projects.
* Filter projects.
* View project details.
* Update metadata.
* Change categories.
* Toggle featured status.
* Recalculate analysis.
* Delete projects with confirmation.

Requirements:

* Enforce server-side authorization for every administrative operation.
* Validate all input.
* Prevent unauthorized access by directly calling API endpoints.
* Display clear success and failure messages.
* Prevent accidental double submissions.
* Keep statistics consistent with database records.
* Do not expose administrative secrets to frontend JavaScript.

Remove hardcoded production credentials.

Use environment-based configuration for secrets.

Use appropriate password hashing if passwords are stored by this application.

If signed tokens are used, validate their expiration, purpose, and permissions.

Add login rate limiting and secure session or token handling where appropriate.

# 14. USER INTERFACE AND DESIGN QUALITY

The application should look like a polished developer platform, not a generic college assignment.

Use a cohesive design system.

Typography:

* Choose a readable modern sans-serif typeface.
* Establish consistent heading sizes.
* Use appropriate line heights.
* Keep source code in a monospace font.

Visual style:

* Dark and light themes.
* Clean spacing.
* Subtle borders.
* Consistent card radii.
* Clear visual hierarchy.
* Restrained gradients.
* Subtle glass effects where appropriate.
* Accessible contrast.

Animations:

* Smooth page transitions where practical.
* Subtle hover interactions.
* Loading skeletons.
* Animated progress indicators.
* Respect prefers-reduced-motion.

Homepage:

* Strong hero section.
* Clear explanation of the platform.
* Project discovery search.
* Technology overview.
* Featured projects.
* Platform statistics backed by real data.
* Consistent footer.

Discovery page:

* Search and filters.
* Responsive cards.
* Sorting.
* Pagination.
* Clear empty states.

Project detail:

* Repository navigation.
* File explorer.
* Code viewer.
* README.
* Analysis results.
* Activity history.
* Download actions.

Admin:

* Clean analytics layout.
* Responsive tables.
* Upload modal.
* Progress indicators.
* Confirmation dialogs.
* Accessible forms.

Do not add visual elements that have no working functionality.

Keep Three.js and TagCanvas only if they already work reliably and do not create significant performance problems.

Do not allow animations to interfere with navigation, reading, or mobile usability.

Avoid adding unnecessary external libraries solely for visual effects.

# 15. BACKEND AND DATABASE QUALITY

Review all existing API routes under /api/v1.

Preserve existing working endpoints and response formats whenever possible.

Existing endpoints include:

GET /api/v1/health

GET /api/v1/projects

GET /api/v1/projects/<id>

GET /api/v1/projects/<id>/files

GET /api/v1/projects/<id>/file-content

GET /api/v1/projects/<id>/download

POST /api/v1/admin/login

POST /api/v1/admin/projects/upload

PUT /api/v1/admin/projects/<id>

DELETE /api/v1/admin/projects/<id>

Add endpoints for new features only when needed.

Possible additions include:

GET /api/v1/projects/compare

GET /api/v1/projects/<id>/analysis

POST /api/v1/projects/<id>/analyze

GET /api/v1/projects/<id>/activity

GET /api/v1/projects/<id>/report

Adapt these paths to the existing routing conventions and avoid conflicts.

Implement:

* Consistent JSON response structures.
* Appropriate HTTP status codes.
* Input validation.
* Pagination limits.
* Safe error handling.
* Database transactions where appropriate.
* Appropriate indexes for commonly queried fields.
* Correct relationships between projects, analyses, and users.
* Predictable deletion behavior.
* Database initialization and migration support.

Do not drop or recreate the database just to apply schema changes.

Preserve existing uploaded projects and user records.

Use a migration strategy compatible with the current database.

# 16. BASIC SECURITY SCANNING — NO AI REQUIRED

Add basic security scanning where practical.

Start with simple, deterministic checks.

Examples:

* Detect potential exposed secrets.
* Identify suspicious configuration patterns.
* Detect common Python security issues with an established tool if compatible.
* Check dependency manifests.
* Report known dependency vulnerabilities when a suitable scanner is available.

Do not execute source code to perform these checks.

Do not print discovered secrets in the UI, logs, or reports.

When a secret is detected, display its file location and type without exposing its full value.

Distinguish between:

* Confirmed tool findings.
* Heuristic warnings.
* Checks that were not performed.

Do not claim that a repository is completely secure because a scanner found no issues.

# 17. TESTING REQUIREMENTS

Testing is mandatory.

Do not consider the project complete merely because the pages load.

Use the existing test framework if one is available. Otherwise, establish a minimal suitable testing setup.

Backend tests should cover:

* Application startup.
* Database initialization.
* Health endpoint.
* Project listing.
* Search and filters.
* Pagination.
* Project detail.
* File listing.
* File content access.
* File download.
* ZIP upload.
* Invalid ZIP handling.
* ZIP path traversal protection.
* File size limits.
* Technology detection.
* Health scoring.
* Analysis persistence.
* Comparison.
* Activity history.
* Report generation.
* Authentication.
* Authorization.
* Project updates.
* Project deletion.

Frontend testing should cover:

* Navigation.
* Search and filter interactions.
* Pagination.
* File explorer navigation.
* Code viewer transitions.
* Clipboard actions.
* Upload progress and error handling.
* Theme persistence.
* Empty states.
* Mobile responsiveness.

Use automated browser testing if the necessary tooling is already available or can be added without excessive complexity.

Use temporary test databases and isolated test directories.

Never run destructive tests against real project data.

# 18. END-TO-END ACCEPTANCE TEST

Verify this complete workflow:

1. Start the Flask application.
2. Open the homepage.
3. Navigate to project discovery.
4. Upload a sample project through the admin interface.
5. Confirm the project files are safely stored.
6. Confirm technology detection works.
7. Confirm a health analysis is generated.
8. Confirm analysis results are stored in the database.
9. Confirm the project appears in discovery.
10. Search for the project.
11. Filter it by technology.
12. Open its detail page.
13. Navigate through nested directories.
14. Open a source file.
15. Verify syntax highlighting and line numbers.
16. Open and render the README.
17. Download an individual file.
18. Download the project ZIP.
19. Open the analysis report.
20. Compare the project with another project.
21. Verify that activity history is recorded.
22. Update project metadata from the admin dashboard.
23. Confirm the changes persist after a page reload.
24. Verify that unauthorized users cannot perform administrative actions.
25. Verify that malformed uploads and unsafe file paths are rejected.

Adapt the sequence if the existing authentication model requires additional steps.

Fix failures before declaring the workflow complete.

# 19. STRICT AI SCOPE LIMITATION

Do not implement complex AI functionality in this version.

Explicitly postpone:

* LLM integration.
* Gemini API integration.
* OpenAI API integration.
* Local LLM inference.
* Ollama integration.
* AI code explanation.
* AI-generated code fixes.
* AI project claim verification.
* AI viva question generation.
* RAG pipelines.
* Vector databases.
* Semantic code embeddings.
* AI plagiarism detection.
* Autonomous agents.
* AI-generated code modifications.

Do not install AI packages or request API keys.

Do not create fake AI features using static text.

The existing rule-based analyzer must work independently.

However, keep the analysis service modular so future AI features can consume structured repository metadata and analysis findings.

A future AI service should be able to receive:

* Project metadata.
* Detected technologies.
* Relevant file references.
* Static analysis findings.
* Health metrics.
* Test results.
* Documentation metadata.

Do not send entire repositories to an external service.

Do not couple current health scoring to an LLM.

# 20. DEVELOPMENT RULES

Follow these rules throughout implementation.

1. Inspect before modifying.
2. Preserve working code.
3. Implement actual functionality, not UI placeholders.
4. Do not hardcode dashboard statistics.
5. Do not fake API responses.
6. Do not fabricate test results.
7. Do not fabricate health metrics.
8. Do not remove existing features without justification.
9. Do not overwrite existing project files or database records accidentally.
10. Do not change working API contracts unnecessarily.
11. Keep frontend and backend responsibilities separate.
12. Keep code modular and readable.
13. Reuse existing utilities and components.
14. Validate inputs on the server.
15. Protect uploaded files and user data.
16. Handle errors gracefully.
17. Add tests for important new functionality.
18. Run tests after significant changes.
19. Fix regressions before proceeding.
20. Do not claim a test passed unless you actually ran it.

Do not ask me to approve every small implementation decision.

Use sensible engineering judgment and continue with the task.

If a feature is too risky or cannot be completed within the existing architecture, document the limitation and finish the remaining work.

# 21. IMPLEMENTATION ORDER

Work in this order:

PHASE 1:
Inspect the codebase, identify missing functionality, and fix existing critical bugs.

PHASE 2:
Complete project ingestion, technology detection, repository browsing, and discovery.

PHASE 3:
Implement deterministic health scoring and persistent analysis history.

PHASE 4:
Implement project comparison and activity history.

PHASE 5:
Implement downloadable analysis reports.

PHASE 6:
Complete the admin dashboard and basic security scanning.

PHASE 7:
Add bookmarks and recently viewed projects if compatible with the existing authentication system.

PHASE 8:
Improve the UI, accessibility, responsive behavior, and error handling.

PHASE 9:
Run backend tests, frontend tests where available, and the end-to-end acceptance workflow.

PHASE 10:
Review security, resolve regressions, and update the README with accurate installation and usage instructions.

Prioritize a fully working core over superficial completion of every optional feature.

If time or environment limitations prevent completing everything, finish and test the core functionality first, then report precisely what remains.

# 22. FINAL DELIVERABLES

At the end, provide a concise but detailed implementation report containing:

1. Existing features discovered.
2. Features completed.
3. Bugs fixed.
4. New files created.
5. Existing files modified.
6. Database schema changes.
7. Dependencies added or changed.
8. API endpoints added or modified.
9. Security improvements.
10. Tests executed and their actual results.
11. Any tests that could not be run and why.
12. Remaining incomplete features.
13. Exact commands to install dependencies.
14. Exact commands to start the application.
15. Instructions for verifying the main workflows manually.

Do not report a feature as complete if only its frontend has been implemented.

Do not report the application as fully tested if only a subset of tests was executed.

Do not claim the application is production-ready without appropriate evidence.

# FINAL INSTRUCTION

Begin by inspecting the current ProjIntelligence project directory.

Understand the existing implementation, determine which V1 features are missing or broken, and implement them directly in the existing codebase.

Do not stop at a plan.

Do not rebuild the project from scratch.

Do not add complex AI functionality yet.

Your objective is to deliver a polished, functional, tested **ProjIntelligence V1** that can later support an AI intelligence layer without requiring a major architectural rewrite.


Act as a senior QA engineer. Now audit the completed ProjIntelligence V1 against the original master prompt.

Do not add new features yet.

1. Start the backend and verify that it runs.
2. Test all existing API endpoints.
3. Test project uploads, ZIP extraction, and folder uploads.
4. Test technology detection and health scoring against real sample projects.
5. Test search, filtering, sorting, and pagination.
6. Test nested file navigation, code viewing, README rendering, and downloads.
7. Test project comparison, reports, and activity history.
8. Test the admin interface and server-side authorization.
9. Test malformed uploads, path traversal attempts, and file-size limits.
10. Check the browser console and Flask logs for errors.
11. Run all available automated tests.
12. Fix confirmed bugs and regressions.
13. Repeat the affected tests after each fix.

Do not fabricate test results. Do not remove working functionality to make tests pass. Do not replace real backend functionality with mock data.

At the end, provide a feature-by-feature PASS, FAIL, or NOT TESTED report, along with the actual test results and any remaining problems.

Do not implement AI features.
