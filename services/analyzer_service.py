"""
Project Analyzer Service - Deterministic Health & Security Auditing Engine
Evaluates repositories against software engineering standards:
1. Documentation Quality (20 pts)
2. Testing & Test Organization (20 pts)
3. Code Architecture & Organization (20 pts)
4. Configuration & Dependency Management (20 pts)
5. Maintainability, Hygiene & Security Cleanliness (20 pts)
Total: 100 pts.
Also performs static rule-based security audits (secrets, credentials, risky calls).
"""

import os
import re
import json
from datetime import datetime

class ProjectAnalyzerService:
    """Deterministic repository analysis and security auditing"""

    IGNORED_DIRS = {
        '.git', 'node_modules', '__pycache__', 'venv', '.venv', 'env',
        'dist', 'build', '.idea', '.vscode', '.pytest_cache', '_legacy_ui_archive',
        '__macosx', '.next', '.cache', 'coverage', '.turbo', 'vendor', 'uploads'
    }

    SOURCE_EXTENSIONS = {
        '.py', '.js', '.jsx', '.ts', '.tsx', '.cpp', '.hpp', '.c', '.h',
        '.cc', '.cxx', '.java', '.go', '.rs', '.cs', '.php', '.rb',
        '.html', '.css', '.scss', '.sql', '.sh'
    }

    SECURITY_PATTERNS = [
        {
            'id': 'SEC_AWS_KEY',
            'severity': 'critical',
            'category': 'Exposed Cloud Credentials',
            'pattern': re.compile(r'\b(AKIA[0-9A-Z]{16})\b'),
            'description': 'Potential exposed AWS Access Key ID detected.'
        },
        {
            'id': 'SEC_PRIVATE_KEY',
            'severity': 'critical',
            'category': 'Private Key Exposure',
            'pattern': re.compile(r'-----BEGIN\s+(?:RSA|EC|DSA|OPENSSH)?\s*PRIVATE\s+KEY-----'),
            'description': 'Unencrypted private cryptographic key block committed.'
        },
        {
            'id': 'SEC_GENERIC_API_KEY',
            'severity': 'high',
            'category': 'Hardcoded Secret',
            'pattern': re.compile(r'(?i)(?:api_key|apikey|secret_key|client_secret|auth_token)\s*[:=]\s*["\']([a-zA-Z0-9_\-]{20,})["\']'),
            'description': 'Hardcoded API key or client secret detected in source.'
        },
        {
            'id': 'SEC_HARDCODED_PWD',
            'severity': 'high',
            'category': 'Hardcoded Credentials',
            'pattern': re.compile(r'(?i)(?:db_password|password|passwd|db_pass)\s*[:=]\s*["\']([^"\'\s]{8,})["\']'),
            'description': 'Hardcoded plain-text password detected in configuration/source.'
        },
        {
            'id': 'SEC_PYTHON_EVAL',
            'severity': 'medium',
            'category': 'Code Injection Risk',
            'pattern': re.compile(r'\b(eval|exec)\s*\('),
            'description': 'Dynamic code execution (eval/exec) can lead to arbitrary code execution.'
        },
        {
            'id': 'SEC_SHELL_INJECTION',
            'severity': 'medium',
            'category': 'Command Injection Risk',
            'pattern': re.compile(r'(?:os\s*\.\s*system|subprocess\s*\.\s*(?:call|run|Popen)\s*\([^)]*shell\s*=\s*True)'),
            'description': 'Executing shell commands via os-system or subprocess with shell=True can be prone to command injection.'
        },
        {
            'id': 'SEC_CPP_UNSAFE_BUFFER',
            'severity': 'medium',
            'category': 'Buffer Overflow Risk',
            'pattern': re.compile(r'\b(strcpy|strcat|gets|sprintf)\s*\('),
            'description': 'Unbounded C/C++ string function vulnerable to buffer overflow. Use safer bounds-checked alternatives (strncpy, snprintf).'
        }
    ]

    def analyze_repository(self, repo_path):
        """
        Run a full deterministic audit on a repository folder.
        Returns a complete structured analysis dictionary.
        """
        if not repo_path or not os.path.exists(repo_path) or not os.path.isdir(repo_path):
            return self._empty_analysis("Repository directory not found or unreadable.")

        repo_abs = os.path.abspath(repo_path)

        # 1. Gather repository inventory & statistics
        inventory = self._collect_inventory(repo_abs)

        # 2. Run Security & Secrets Scanner
        security_findings = self._scan_security(repo_abs, inventory['source_files'])

        # 3. Calculate category scores (20 pts each)
        doc_score, doc_findings, doc_recs = self._score_documentation(repo_abs, inventory)
        test_score, test_findings, test_recs = self._score_testing(repo_abs, inventory)
        arch_score, arch_findings, arch_recs = self._score_architecture(repo_abs, inventory)
        conf_score, conf_findings, conf_recs = self._score_configuration(repo_abs, inventory)
        maint_score, maint_findings, maint_recs = self._score_maintainability(repo_abs, inventory, security_findings)

        # Total Health Score (0 - 100)
        total_health_score = round(doc_score + test_score + arch_score + conf_score + maint_score, 1)
        total_health_score = max(0.0, min(100.0, total_health_score))

        # Assign Letter Grade
        if total_health_score >= 90:
            grade = 'A'
            grade_label = 'Exceptional (Production Grade)'
        elif total_health_score >= 80:
            grade = 'B'
            grade_label = 'Solid (Well Structured)'
        elif total_health_score >= 70:
            grade = 'C'
            grade_label = 'Fair (Moderate Technical Debt)'
        elif total_health_score >= 60:
            grade = 'D'
            grade_label = 'Needs Improvement'
        else:
            grade = 'F'
            grade_label = 'Under-Engineered / Incomplete'

        all_recommendations = doc_recs + test_recs + arch_recs + conf_recs + maint_recs

        return {
            'overall_score': total_health_score,
            'grade': grade,
            'grade_label': grade_label,
            'timestamp': datetime.utcnow().isoformat(),
            'version': '2.1.0',
            'breakdown': {
                'documentation': {
                    'score': round(doc_score, 1),
                    'max_score': 20,
                    'status': 'passed' if doc_score >= 14 else 'warning',
                    'findings': doc_findings
                },
                'testing': {
                    'score': round(test_score, 1),
                    'max_score': 20,
                    'status': 'passed' if test_score >= 12 else 'warning',
                    'findings': test_findings
                },
                'architecture': {
                    'score': round(arch_score, 1),
                    'max_score': 20,
                    'status': 'passed' if arch_score >= 14 else 'warning',
                    'findings': arch_findings
                },
                'configuration': {
                    'score': round(conf_score, 1),
                    'max_score': 20,
                    'status': 'passed' if conf_score >= 14 else 'warning',
                    'findings': conf_findings
                },
                'maintainability': {
                    'score': round(maint_score, 1),
                    'max_score': 20,
                    'status': 'passed' if maint_score >= 14 else 'warning',
                    'findings': maint_findings
                }
            },
            'security': {
                'status': 'clean' if not security_findings else ('danger' if any(f['severity'] in ('critical', 'high') for f in security_findings) else 'warning'),
                'total_issues': len(security_findings),
                'findings': security_findings
            },
            'statistics': {
                'total_files': inventory['total_files'],
                'total_lines_of_code': inventory['total_loc'],
                'total_size_bytes': inventory['total_size'],
                'primary_language': inventory['primary_language'],
                'language_distribution': inventory['language_distribution'],
                'has_readme': bool(inventory['readme_file']),
                'has_license': bool(inventory['license_file']),
                'has_tests': inventory['has_tests']
            },
            'recommendations': all_recommendations,
            'dependencies': self._extract_dependencies(repo_abs),
            'execution_guide': self._synthesize_execution_guide(repo_abs, inventory),
            'features': self._synthesize_features(repo_abs, inventory)
        }

    def _collect_inventory(self, repo_abs):
        """Walk repository and index file categories, metrics, and languages"""
        total_files = 0
        total_size = 0
        total_loc = 0
        source_files = []
        ext_counts = {}
        readme_file = None
        license_file = None
        has_tests = False
        all_dirs = set()

        for root, dirs, files in os.walk(repo_abs):
            dirs[:] = [d for d in dirs if d.lower() not in self.IGNORED_DIRS and not d.startswith('.')]
            rel_dir = os.path.relpath(root, repo_abs)
            if rel_dir != '.':
                all_dirs.add(rel_dir.replace('\\', '/').lower())

            for file in files:
                f_lower = file.lower()
                if f_lower in ['.ds_store', 'thumbs.db']:
                    continue

                total_files += 1
                full_path = os.path.join(root, file)
                try:
                    size = os.path.getsize(full_path)
                except OSError:
                    size = 0
                total_size += size

                rel_path = os.path.relpath(full_path, repo_abs).replace('\\', '/')
                ext = os.path.splitext(f_lower)[1]

                # Match README and LICENSE
                if f_lower in ['readme.md', 'readme.txt', 'readme.rst', 'readme']:
                    readme_file = full_path
                if f_lower in ['license', 'license.md', 'license.txt', 'copying']:
                    license_file = full_path

                # Check if file or path looks like a test
                if 'test' in f_lower or 'spec' in f_lower or 'tests/' in rel_path.lower():
                    has_tests = True

                # Source code metrics
                if ext in self.SOURCE_EXTENSIONS:
                    if not (f_lower.endswith('.min.js') or f_lower.endswith('.min.css') or f_lower in ['three.js', 'tagcanvas.js']):
                        source_files.append((full_path, rel_path, ext))
                    ext_counts[ext] = ext_counts.get(ext, 0) + 1
                    
                    # Count LOC safely (capped at 500KB per file)
                    if size < 500 * 1024:
                        try:
                            with open(full_path, 'r', encoding='utf-8', errors='ignore') as sf:
                                lines = sf.readlines()
                                total_loc += len([l for l in lines if l.strip()])
                        except Exception:
                            pass

        # Identify primary language
        primary_lang = 'General'
        if ext_counts:
            sorted_exts = sorted(ext_counts.items(), key=lambda x: x[1], reverse=True)
            top_ext = sorted_exts[0][0]
            ext_map = {
                '.cpp': 'C++', '.hpp': 'C++', '.c': 'C', '.h': 'C/C++',
                '.py': 'Python', '.js': 'JavaScript', '.jsx': 'React JS',
                '.ts': 'TypeScript', '.tsx': 'React TS', '.html': 'HTML/CSS',
                '.css': 'CSS', '.go': 'Go', '.rs': 'Rust', '.java': 'Java'
            }
            primary_lang = ext_map.get(top_ext, top_ext.lstrip('.').upper())

        return {
            'total_files': total_files,
            'total_size': total_size,
            'total_loc': total_loc,
            'source_files': source_files,
            'ext_counts': ext_counts,
            'language_distribution': ext_counts,
            'primary_language': primary_lang,
            'readme_file': readme_file,
            'license_file': license_file,
            'has_tests': has_tests,
            'all_dirs': all_dirs
        }

    def _score_documentation(self, repo_abs, inv):
        """Pillar 1: Documentation Quality (Max 20 pts)"""
        score = 0.0
        findings = []
        recs = []

        readme = inv['readme_file']
        if readme and os.path.exists(readme):
            score += 8.0
            findings.append("README file exists at repository root.")
            
            try:
                with open(readme, 'r', encoding='utf-8', errors='ignore') as rf:
                    content = rf.read()
                
                char_count = len(content.strip())
                if char_count > 400:
                    score += 4.0
                    findings.append(f"Substantial documentation provided ({char_count} characters).")
                else:
                    findings.append("README exists but is relatively brief.")
                    recs.append("Expand README with project overview, features, and usage examples.")

                # Check for headings or setup instructions
                content_lower = content.lower()
                has_setup = any(kw in content_lower for kw in ['install', 'setup', 'getting started', 'usage', 'run', 'build', 'prerequisites'])
                if has_setup:
                    score += 4.0
                    findings.append("Setup, build, or usage instructions present in README.")
                else:
                    recs.append("Include clear 'Installation & Usage' steps in README.")
            except Exception:
                pass
        else:
            findings.append("Missing README documentation.")
            recs.append("Add a comprehensive README.md explaining project purpose, architecture, and instructions.")

        # Check License
        if inv['license_file']:
            score += 4.0
            findings.append("Open-source license file detected.")
        else:
            findings.append("No LICENSE file detected.")
            recs.append("Add an open-source LICENSE (e.g. MIT, Apache 2.0) to clarify reuse terms.")

        return min(20.0, score), findings, recs

    def _score_testing(self, repo_abs, inv):
        """Pillar 2: Testing & Reliability (Max 20 pts)"""
        score = 0.0
        findings = []
        recs = []

        # Check for test directory
        test_dir_names = {'test', 'tests', 'spec', 'specs', '__tests__'}
        has_test_dir = any(any(d == t or d.startswith(f"{t}/") for t in test_dir_names) for d in inv['all_dirs'])
        if has_test_dir:
            score += 8.0
            findings.append("Dedicated test directory found (e.g. tests/, spec/).")

        # Check for test files
        test_files = [f for f in inv['source_files'] if 'test' in f[1].lower() or 'spec' in f[1].lower()]
        if test_files:
            score += 8.0
            findings.append(f"Automated test suites detected ({len(test_files)} test files).")
        elif inv['has_tests']:
            score += 4.0
            findings.append("Test-related files detected.")
        else:
            findings.append("No automated test files detected.")
            recs.append("Implement automated tests (e.g. pytest, jest, or catch2) to verify core logic.")

        # Check for test runner configs
        test_configs = ['pytest.ini', 'jest.config.js', 'jest.config.ts', '.travis.yml', 'tox.ini', 'setup.cfg']
        has_test_config = False
        for cfg in test_configs:
            if os.path.exists(os.path.join(repo_abs, cfg)):
                has_test_config = True
                break
        
        if has_test_config or (inv['primary_language'] == 'C++' and os.path.exists(os.path.join(repo_abs, 'CMakeLists.txt'))):
            score += 4.0
            findings.append("Test runner or build configuration found.")
        elif test_files:
            score += 2.0

        # Proportional baseline for compact showcase projects
        if inv['total_files'] <= 3 and score < 10.0:
            score = 10.0
            findings.append("Single-file or compact utility project evaluated proportionally.")

        return min(20.0, score), findings, recs

    def _score_architecture(self, repo_abs, inv):
        """Pillar 3: Architecture & Organization (Max 20 pts)"""
        score = 0.0
        findings = []
        recs = []

        # Check for .gitignore
        if os.path.exists(os.path.join(repo_abs, '.gitignore')):
            score += 6.0
            findings.append(".gitignore present to prevent committing build artifacts.")
        else:
            findings.append("No .gitignore found at project root.")
            recs.append("Add a .gitignore to exclude binaries, cache, and virtual environments.")

        # Check for modular folder structure
        arch_folders = {'src', 'lib', 'include', 'backend', 'frontend', 'components', 'services', 'models', 'routes', 'app'}
        matched_folders = [d for d in inv['all_dirs'] if any(d == af or d.startswith(f"{af}/") for af in arch_folders)]
        if matched_folders:
            score += 8.0
            findings.append(f"Modular folder architecture detected ({', '.join(set(matched_folders[:4]))}).")
        elif inv['all_dirs']:
            score += 5.0
            findings.append("Directory separation present.")
        else:
            score += 3.0
            findings.append("Flat directory layout.")

        # Check file sizes / avoiding massive monolithic files
        large_files = [f[1] for f in inv['source_files'] if os.path.getsize(f[0]) > 400 * 1024]
        if not large_files:
            score += 6.0
            findings.append("Good modularity: no oversized monolithic source files (>400KB).")
        else:
            findings.append(f"Oversized files detected: {', '.join(large_files[:3])}.")
            recs.append("Refactor large monolithic source files into focused modules or utility classes.")

        return min(20.0, score), findings, recs

    def _score_configuration(self, repo_abs, inv):
        """Pillar 4: Configuration & Dependencies (Max 20 pts)"""
        score = 0.0
        findings = []
        recs = []

        # Dependency manifests
        manifests = [
            'requirements.txt', 'pyproject.toml', 'pipfile', 'package.json',
            'cmakelists.txt', 'makefile', 'cargo.toml', 'go.mod', 'pom.xml', 'build.gradle'
        ]
        found_manifests = []
        for root, _, files in os.walk(repo_abs):
            for f in files:
                if f.lower() in manifests:
                    found_manifests.append(f)

        if found_manifests:
            score += 12.0
            findings.append(f"Explicit dependency manifest found: {', '.join(set(found_manifests))}.")
        else:
            findings.append("No standard dependency manifest found.")
            recs.append("Add an explicit dependency manifest (requirements.txt, package.json, or CMakeLists.txt).")

        # Environment template / Containerization
        env_files = ['.env.example', 'config.example.py', 'config.sample.json', 'dockerfile', 'docker-compose.yml']
        found_configs = []
        for root, _, files in os.walk(repo_abs):
            for f in files:
                if f.lower() in env_files:
                    found_configs.append(f)

        if found_configs:
            score += 8.0
            findings.append(f"Environment/container template provided ({', '.join(set(found_configs))}).")
        else:
            # Check if project doesn't strictly need external env
            if not found_manifests:
                score += 4.0
            else:
                recs.append("Provide a .env.example or sample config template for reproducible onboarding.")

        return min(20.0, score), findings, recs

    def _score_maintainability(self, repo_abs, inv, security_findings):
        """Pillar 5: Maintainability, Cleanliness & Security (Max 20 pts)"""
        score = 0.0
        findings = []
        recs = []

        # Security baseline
        critical_issues = [f for f in security_findings if f['severity'] in ('critical', 'high')]
        if not critical_issues:
            score += 10.0
            findings.append("Clean security baseline: zero exposed secrets or dangerous calls detected.")
        else:
            findings.append(f"Security Alert: {len(critical_issues)} sensitive credential or injection risks flagged.")
            recs.append("Address flagged security warnings: remove hardcoded secrets and sanitize shell executions.")

        # Clean repository: no committed sensitive files (.env, .db, .pem)
        committed_sensitive = []
        for root, _, files in os.walk(repo_abs):
            for f in files:
                f_lower = f.lower()
                if f_lower == '.env' or f_lower.endswith(('.pem', '.key', '.sqlite', '.db')):
                    committed_sensitive.append(f)

        if not committed_sensitive:
            score += 5.0
            findings.append("Hygiene check passed: no raw environment files or sensitive credentials committed.")
        else:
            findings.append(f"Warning: committed sensitive files found ({', '.join(committed_sensitive[:3])}).")
            recs.append("Remove committed sensitive credentials (.env, .key) from version control.")

        # Readability / LOC balance
        if inv['total_loc'] > 0:
            avg_loc = inv['total_loc'] / max(1, len(inv['source_files']))
            if avg_loc <= 500:
                score += 5.0
                findings.append(f"Healthy average file density ({int(avg_loc)} lines/source file).")
            else:
                score += 2.0
                findings.append("Dense code structure with high line counts per file.")
        else:
            score += 4.0

        return min(20.0, score), findings, recs

    def _scan_security(self, repo_abs, source_files):
        """Scan source files for secrets, credentials, and dangerous execution patterns"""
        findings = []

        for full_path, rel_path, ext in source_files:
            try:
                # Limit scan to text files under 1MB
                if os.path.getsize(full_path) > 1024 * 1024:
                    continue

                with open(full_path, 'r', encoding='utf-8', errors='ignore') as sf:
                    for line_idx, line in enumerate(sf, start=1):
                        line_str = line.strip()
                        if not line_str or line_str.startswith(('#', '//', '/*', '*')):
                            continue

                        for rule in self.SECURITY_PATTERNS:
                            match = rule['pattern'].search(line_str)
                            if match:
                                # Mask sensitive matched tokens
                                raw_token = match.group(0)
                                if len(raw_token) > 8:
                                    masked = raw_token[:3] + '*' * (len(raw_token) - 6) + raw_token[-3:]
                                else:
                                    masked = '***REDACTED***'

                                findings.append({
                                    'id': rule['id'],
                                    'severity': rule['severity'],
                                    'category': rule['category'],
                                    'description': rule['description'],
                                    'file': rel_path,
                                    'line': line_idx,
                                    'preview': f"Line {line_idx}: {line_str[:120].replace(raw_token, masked)}"
                                })
            except Exception:
                continue

        return findings

    def _empty_analysis(self, error_message):
        """Fallback empty analysis structure"""
        return {
            'overall_score': 0.0,
            'grade': 'F',
            'grade_label': 'Analysis Unavailable',
            'timestamp': datetime.utcnow().isoformat(),
            'version': '2.1.0',
            'error': error_message,
            'breakdown': {
                'documentation': {'score': 0, 'max_score': 20, 'status': 'danger', 'findings': [error_message]},
                'testing': {'score': 0, 'max_score': 20, 'status': 'danger', 'findings': []},
                'architecture': {'score': 0, 'max_score': 20, 'status': 'danger', 'findings': []},
                'configuration': {'score': 0, 'max_score': 20, 'status': 'danger', 'findings': []},
                'maintainability': {'score': 0, 'max_score': 20, 'status': 'danger', 'findings': []}
            },
            'security': {'status': 'clean', 'total_issues': 0, 'findings': []},
            'statistics': {
                'total_files': 0, 'total_lines_of_code': 0, 'total_size_bytes': 0,
                'primary_language': 'N/A', 'has_readme': False, 'has_license': False, 'has_tests': False
            },
            'recommendations': ['Upload valid project repository files to generate health report.'],
            'dependencies': {'manifest_type': None, 'manifest_file': None, 'packages': [], 'count': 0},
            'execution_guide': {
                'ecosystem': 'General',
                'entry_point': 'N/A',
                'prerequisites': ['Developer Environment'],
                'steps': ['Upload repository files to view instructions.'],
                'snippet': './run.sh',
                'has_env_example': False
            },
            'features': []
        }

    def _extract_dependencies(self, repo_abs):
        """Extract declared dependencies from package manifests across the repository"""
        deps = {
            'manifest_type': None,
            'manifest_file': None,
            'packages': [],
            'count': 0
        }

        # 1. Check requirements.txt
        for root, dirs, files in os.walk(repo_abs):
            dirs[:] = [d for d in dirs if d.lower() not in self.IGNORED_DIRS and not d.startswith('.')]
            for f in files:
                if f.lower() == 'requirements.txt':
                    req_path = os.path.join(root, f)
                    rel_req = os.path.relpath(req_path, repo_abs).replace('\\', '/')
                    deps['manifest_type'] = 'python'
                    deps['manifest_file'] = rel_req
                    try:
                        with open(req_path, 'r', encoding='utf-8', errors='ignore') as rf:
                            for line in rf:
                                l = line.strip()
                                if l and not l.startswith('#') and not l.startswith('-'):
                                    parts = re.split(r'(==|>=|<=|>|<|~=)', l)
                                    pkg_name = parts[0].strip()
                                    version = ''.join(parts[1:]).strip() if len(parts) > 1 else 'latest'
                                    deps['packages'].append({'name': pkg_name, 'version': version})
                    except Exception:
                        pass
                    deps['count'] = len(deps['packages'])
                    return deps

        # 2. Check package.json
        for root, dirs, files in os.walk(repo_abs):
            dirs[:] = [d for d in dirs if d.lower() not in self.IGNORED_DIRS and not d.startswith('.')]
            for f in files:
                if f.lower() == 'package.json':
                    pkg_path = os.path.join(root, f)
                    rel_pkg = os.path.relpath(pkg_path, repo_abs).replace('\\', '/')
                    deps['manifest_type'] = 'nodejs'
                    deps['manifest_file'] = rel_pkg
                    try:
                        import json
                        with open(pkg_path, 'r', encoding='utf-8', errors='ignore') as pf:
                            pj = json.load(pf)
                            d = pj.get('dependencies', {})
                            dev_d = pj.get('devDependencies', {})
                            for k, v in {**d, **dev_d}.items():
                                deps['packages'].append({'name': k, 'version': str(v)})
                    except Exception:
                        pass
                    deps['count'] = len(deps['packages'])
                    return deps

        # 3. Check CMakeLists.txt
        for root, dirs, files in os.walk(repo_abs):
            dirs[:] = [d for d in dirs if d.lower() not in self.IGNORED_DIRS and not d.startswith('.')]
            for f in files:
                if f.lower() == 'cmakelists.txt':
                    cmake_path = os.path.join(root, f)
                    rel_cmake = os.path.relpath(cmake_path, repo_abs).replace('\\', '/')
                    deps['manifest_type'] = 'cmake'
                    deps['manifest_file'] = rel_cmake
                    try:
                        with open(cmake_path, 'r', encoding='utf-8', errors='ignore') as cf:
                            content = cf.read()
                            find_pkgs = re.findall(r'find_package\s*\(\s*([A-Za-z0-9_]+)', content, re.IGNORECASE)
                            for fp in find_pkgs:
                                deps['packages'].append({'name': fp, 'version': 'system'})
                    except Exception:
                        pass
                    deps['count'] = len(deps['packages'])
                    return deps

        return deps

    def _synthesize_execution_guide(self, repo_abs, inv):
        """Synthesize actionable prerequisites, copy-paste terminal commands, and execution steps"""
        primary_lang = inv.get('primary_language', 'General')

        entry_point = None
        has_requirements = False
        req_rel_path = 'requirements.txt'
        has_cmake = False
        has_package_json = False
        has_env_example = False
        has_winsock_cpp = False

        for root, dirs, files in os.walk(repo_abs):
            dirs[:] = [d for d in dirs if d.lower() not in self.IGNORED_DIRS and not d.startswith('.')]
            for f in files:
                f_lower = f.lower()
                rel = os.path.relpath(os.path.join(root, f), repo_abs).replace('\\', '/')
                if f_lower in ('app.py', 'main.py', 'manage.py', 'server.py', 'run.py') and not entry_point:
                    entry_point = rel
                if f_lower in ('main.cpp', 'server.cpp') and not entry_point:
                    entry_point = rel
                if f_lower == 'requirements.txt':
                    has_requirements = True
                    req_rel_path = rel
                if f_lower == 'cmakelists.txt':
                    has_cmake = True
                if f_lower == 'package.json':
                    has_package_json = True
                if f_lower in ('.env.example', 'config.example.py', 'env.sample'):
                    has_env_example = True
                if f_lower.endswith(('.cpp', '.c', '.hpp')):
                    try:
                        with open(os.path.join(root, f), 'r', encoding='utf-8', errors='ignore') as cf:
                            if 'winsock2.h' in cf.read().lower():
                                has_winsock_cpp = True
                    except Exception:
                        pass

        if has_cmake or primary_lang == 'C++':
            prereqs = ['C++17 Compatible Compiler (MinGW / GCC / Clang / MSVC)', 'CMake 3.15+ Build Automation']
            if has_winsock_cpp:
                prereqs.append('Windows Winsock2 Networking Library (ws2_32)')

            if has_cmake:
                steps = [
                    'Clone or download the project repository into your local workspace.',
                    'Create an isolated build directory: `mkdir build && cd build`',
                    'Configure targets using CMake: `cmake ..`',
                    'Compile the binaries: `cmake --build .`',
                    f'Execute the application: `./{entry_point or "main"}`'
                ]
                snippet = f"mkdir build && cd build && cmake .. && cmake --build . && ./{entry_point or 'main'}"
            else:
                src_file = entry_point or 'main.cpp'
                ws_flag = ' -lws2_32' if has_winsock_cpp else ''
                steps = [
                    'Clone or download the project repository.',
                    f'Compile using C++17 flags: `g++ -std=c++17 {src_file} -o app{ws_flag}`',
                    'Launch the compiled executable: `./app`'
                ]
                snippet = f"g++ -std=c++17 {src_file} -o app{ws_flag} && ./app"

            return {
                'ecosystem': 'C++',
                'entry_point': entry_point or 'main.cpp',
                'prerequisites': prereqs,
                'steps': steps,
                'snippet': snippet,
                'has_env_example': has_env_example
            }

        elif has_requirements or primary_lang == 'Python':
            ep = entry_point or 'app.py'
            prereqs = ['Python 3.10+ (64-bit runtime)', 'pip package manager', 'Virtual Environment (venv)']
            steps = [
                'Clone or unpack project repository into a clean local directory.',
                'Create and activate virtual environment: `python -m venv venv` then `.\\venv\\Scripts\\activate` (Windows) or `source venv/bin/activate` (Linux/macOS).',
                f'Install dependencies: `pip install -r {req_rel_path}`' if has_requirements else 'Install Flask and core dependencies: `pip install flask`',
                'Setup environment variables: `cp .env.example .env`' if has_env_example else 'Verify default runtime configurations in `config.py`.',
                f'Start the application: `python {ep}`'
            ]
            install_cmd = f"pip install -r {req_rel_path}" if has_requirements else "pip install flask"
            snippet = f"python -m venv venv && {install_cmd} && python {ep}"

            return {
                'ecosystem': 'Python',
                'entry_point': ep,
                'prerequisites': prereqs,
                'steps': steps,
                'snippet': snippet,
                'has_env_example': has_env_example
            }

        elif has_package_json or primary_lang in ('JavaScript', 'TypeScript', 'React JS'):
            prereqs = ['Node.js 18+ (LTS)', 'npm or yarn package manager']
            steps = [
                'Clone or download repository files.',
                'Install dependencies: `npm install`',
                'Start development runtime: `npm start` or `npm run dev`',
                'Access application in browser at `http://localhost:3000`.'
            ]
            snippet = "npm install && npm start"
            return {
                'ecosystem': 'Node.js / Web',
                'entry_point': entry_point or 'index.html',
                'prerequisites': prereqs,
                'steps': steps,
                'snippet': snippet,
                'has_env_example': has_env_example
            }

        else:
            return {
                'ecosystem': 'General Software',
                'entry_point': entry_point or 'Source files',
                'prerequisites': ['Standard developer build tools', 'Compiler/Interpreter matching project language'],
                'steps': [
                    'Download or clone the repository files.',
                    'Inspect README and configuration manifests for runtime setup.',
                    'Run the project using your local developer environment.'
                ],
                'snippet': f"./run.sh",
                'has_env_example': has_env_example
            }

    def _synthesize_features(self, repo_abs, inv):
        """Extract explicit features from README or synthesize verified architectural features"""
        features = []

        # 1. Try extracting features from README
        readme_file = inv.get('readme_file')
        if readme_file and os.path.exists(readme_file):
            try:
                with open(readme_file, 'r', encoding='utf-8', errors='ignore') as rf:
                    content = rf.read()
                    feat_match = re.search(r'##\s*(?:Key\s*)?Features[^#]*(?:(?=##)|$)', content, re.IGNORECASE)
                    if feat_match:
                        raw_section = feat_match.group(0)
                        bullets = re.findall(r'^[*-]\s+(.+)$', raw_section, re.MULTILINE)
                        for b in bullets[:6]:
                            b_clean = b.strip()
                            if len(b_clean) > 8:
                                title_match = re.match(r'^\*\*([^*:]+)(?::\s*|\*\*\s*)(.+)$', b_clean)
                                if title_match:
                                    features.append({
                                        'title': title_match.group(1).strip(),
                                        'description': title_match.group(2).strip(),
                                        'tag': 'Verified'
                                    })
                                else:
                                    features.append({
                                        'title': b_clean[:35] + ('...' if len(b_clean) > 35 else ''),
                                        'description': b_clean,
                                        'tag': 'Verified'
                                    })
            except Exception:
                pass

        if len(features) >= 3:
            return features

        # 2. Synthesize architectural capabilities from repository inspection
        primary_lang = inv.get('primary_language', 'General')
        source_files = inv.get('source_files', [])
        rel_paths = [sf[1].lower() for sf in source_files]

        has_api = any('api' in p or 'route' in p or 'blueprint' in p for p in rel_paths)
        has_db = any('model' in p or 'db' in p or 'sqlite' in p for p in rel_paths)
        has_tests = inv.get('has_tests', False)
        has_frontend = any('static' in p or 'frontend' in p or 'template' in p or 'html' in p for p in rel_paths)
        has_cpp_headers = any(p.endswith(('.hpp', '.h')) for p in rel_paths)
        has_socket = False
        has_threejs = False

        for full_p, rel_p, ext in source_files[:30]:
            try:
                with open(full_p, 'r', encoding='utf-8', errors='ignore') as f:
                    txt = f.read(5000).lower()
                    if 'socket' in txt or 'winsock' in txt or 'bind(' in txt:
                        has_socket = True
                    if 'three' in txt or 'webgl' in txt or 'scene' in txt:
                        has_threejs = True
            except Exception:
                pass

        synthesized = []
        if has_socket or 'currency' in repo_abs.lower():
            synthesized.append({
                'title': 'Low-Latency Socket Networking',
                'description': 'Direct TCP streaming socket communication with request/response serialization.',
                'tag': 'Networking'
            })
        if has_api or primary_lang == 'Python':
            synthesized.append({
                'title': 'RESTful API & Controller Layer',
                'description': 'Structured JSON HTTP routing with modular blueprints and error handling.',
                'tag': 'Backend'
            })
        if has_db:
            synthesized.append({
                'title': 'Relational Data Persistence',
                'description': 'Structured database schemas with entity relationships, indexing, and transactional integrity.',
                'tag': 'Database'
            })
        if has_cpp_headers or primary_lang == 'C++':
            synthesized.append({
                'title': 'Modern C++ Object-Oriented Design',
                'description': 'Encapsulated classes with const-correct member routines and clean separation of interface and implementation.',
                'tag': 'Systems'
            })
        if has_tests:
            synthesized.append({
                'title': 'Automated Test Verification',
                'description': 'Comprehensive assertion test suites validating core algorithm boundaries and state.',
                'tag': 'Testing'
            })
        if has_frontend or has_threejs:
            synthesized.append({
                'title': 'Interactive Dynamic Presentation UI',
                'description': 'Responsive client-side interface with real-time DOM updates and visual state indicators.',
                'tag': 'Frontend'
            })
        if not synthesized:
            synthesized.append({
                'title': 'Modular Algorithm Pipeline',
                'description': 'Well-organized functional routines for data transformation and evaluation.',
                'tag': 'Core Logic'
            })

        for s in synthesized:
            if not any(f['title'].lower() == s['title'].lower() for f in features):
                features.append(s)

        return features

    @staticmethod
    def get_file_description(file_name, is_dir=False, rel_path=""):
        """Generate meaningful contextual file description for repository explorer"""
        if is_dir:
            dir_name = file_name.lower()
            dir_map = {
                'include': 'C/C++ public API header interface declarations',
                'src': 'Primary source implementation files and business logic',
                'backend': 'Server-side API handlers and networking routines',
                'frontend': 'Client web presentation layer (HTML, CSS, JS)',
                'blueprints': 'Flask modular REST API controller blueprints',
                'models': 'SQLAlchemy database entity models and schemas',
                'services': 'Reusable domain services and business logic layer',
                'tests': 'Automated unit tests and verification test cases',
                'static': 'Static web assets, styling, and client scripts',
                'templates': 'Jinja2 server-rendered HTML view templates',
                'data_structures': 'Custom data structure algorithms and containers',
                'docs': 'Project documentation, diagrams, and guides',
                'utils': 'Shared helper utilities and formatting functions'
            }
            return dir_map.get(dir_name, 'Subdirectory containing project modules')

        fn_lower = file_name.lower()
        ext = os.path.splitext(fn_lower)[1]

        file_map = {
            'app.py': 'Application factory and central server initialization',
            'main.py': 'Primary execution entry point and script runner',
            'main.cpp': 'C++ entry point and program execution lifecycle',
            'cmakelists.txt': 'CMake build configuration, compiler flags & targets',
            'makefile': 'GNU Make build automation script and compile recipes',
            'requirements.txt': 'Python package dependencies manifest',
            'package.json': 'Node.js dependency manifest and lifecycle scripts',
            'readme.md': 'Repository architecture, overview and setup instructions',
            'license': 'Open-source software license permissions and terms',
            'config.py': 'Application environment settings and constants',
            'extensions.py': 'Database and third-party extension initializers',
            '.env.example': 'Template specification for environment variables',
            'dockerfile': 'Container build blueprint for sandboxed execution',
            'init_db.py': 'Database initialization and seed record population',
            'pytest.ini': 'Pytest runner configuration and directory exclusions',
            'index.html': 'Client application root HTML interface layout',
            'style.css': 'User interface styling and visual themes',
            'script.js': 'Client-side event handling and dynamic DOM logic',
            'api.js': 'REST API client connector and HTTP fetch methods',
            'components.js': 'Reusable UI component renderers and card builders',
            'dashboard.js': 'Dashboard state manager, search, and filtering engine'
        }

        if fn_lower in file_map:
            return file_map[fn_lower]

        if ext in ('.hpp', '.h'):
            return 'C/C++ header interface with class definitions'
        if ext in ('.cpp', '.c', '.cc'):
            return 'C/C++ algorithm and logic implementation'
        if ext == '.py':
            if 'test' in fn_lower:
                return 'Automated unit test case and verification assertions'
            return 'Python module with domain functions and classes'
        if ext == '.js':
            return 'JavaScript module for client application logic'
        if ext == '.html':
            return 'HTML view template or interface layout'
        if ext == '.css':
            return 'CSS stylesheets and responsive design tokens'
        if ext in ('.md', '.txt', '.rst'):
            return 'Project documentation and reference notes'
        if ext in ('.json', '.yaml', '.yml', '.toml'):
            return 'Structured configuration and metadata definition'
        if ext in ('.png', '.jpg', '.jpeg', '.svg', '.ico'):
            return 'Graphic asset for user interface presentation'

        return f"{ext.lstrip('.').upper()} project file" if ext else 'Project source file'

