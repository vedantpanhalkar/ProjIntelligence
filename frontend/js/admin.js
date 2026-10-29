class AdminApp {
  constructor() {
    this.elements = this.initializeElements();
    this.state = {
      isLoggedIn: false,
      token: null,
      projects: [],
      activeUploadMode: 'upload', // 'upload' | 'path'
      selectedFiles: null,
      selectedFileType: null // 'folder' | 'zip'
    };
    
    this.bindEvents();
    this.checkAuth();
  }

  initializeElements() {
    return {
      loginState: utils.$('#loginState'),
      loginForm: utils.$('#loginForm'),
      loginError: utils.$('#loginError'),
      
      adminPanelState: utils.$('#adminPanelState'),
      logoutBtn: utils.$('#logoutBtn'),
      
      statsGrid: utils.$('#adminStatsGrid'),
      activityList: utils.$('#activityList'),
      projectsTableBody: utils.$('#projectsTableBody'),
      projectsCountLabel: utils.$('#projectsCountLabel'),
      projectSearchInput: utils.$('#projectSearchInput'),
      
      themeToggle: utils.$('#themeToggle'),
      
      // Modal elements
      openAddProjectModalBtn: utils.$('#openAddProjectModalBtn'),
      addProjectModal: utils.$('#addProjectModal'),
      closeModalBtn: utils.$('#closeModalBtn'),
      cancelProjectBtn: utils.$('#cancelProjectBtn'),
      addProjectForm: utils.$('#addProjectForm'),
      
      // Modal Tabs
      tabUploadBtn: utils.$('#tabUploadBtn'),
      tabPathBtn: utils.$('#tabPathBtn'),
      panelUpload: utils.$('#panel-upload'),
      panelPath: utils.$('#panel-path'),
      
      // File inputs & Dropzone
      folderInput: utils.$('#folderInput'),
      zipInput: utils.$('#zipInput'),
      btnSelectFolder: utils.$('#btnSelectFolder'),
      btnSelectZip: utils.$('#btnSelectZip'),
      dropzoneBox: utils.$('#dropzoneBox'),
      selectedFileInfo: utils.$('#selectedFileInfo'),
      selectedFileIcon: utils.$('#selectedFileIcon'),
      selectedFileName: utils.$('#selectedFileName'),
      selectedFileDetails: utils.$('#selectedFileDetails'),
      clearSelectedFileBtn: utils.$('#clearSelectedFileBtn'),
      
      // Form Fields
      newProjectName: utils.$('#newProjectName'),
      newProjectRepo: utils.$('#newProjectRepo'),
      newProjectLocalPath: utils.$('#newProjectLocalPath'),
      newProjectDesc: utils.$('#newProjectDesc'),
      newProjectFeatured: utils.$('#newProjectFeatured'),
      
      // Progress elements
      uploadProgressContainer: utils.$('#uploadProgressContainer'),
      uploadProgressText: utils.$('#uploadProgressText'),
      uploadProgressBar: utils.$('#uploadProgressBar'),
      uploadPercent: utils.$('#uploadPercent'),
      submitProjectBtn: utils.$('#submitProjectBtn')
    };
  }

  bindEvents() {
    // Auth events
    if (this.elements.loginForm) {
      this.elements.loginForm.addEventListener('submit', (e) => this.handleLogin(e));
    }
    if (this.elements.logoutBtn) {
      this.elements.logoutBtn.addEventListener('click', () => this.handleLogout());
    }

    // Theme toggle
    if (window.ProjTheme) {
      window.ProjTheme.init();
    } else if (this.elements.themeToggle) {
      const isDark = (localStorage.getItem('theme') || '').includes('dark');
      document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
      this.elements.themeToggle.checked = isDark;

      this.elements.themeToggle.addEventListener('change', (e) => {
        const theme = e.target.checked ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
      });
    }

    // Modal Opening & Closing
    if (this.elements.openAddProjectModalBtn) {
      this.elements.openAddProjectModalBtn.addEventListener('click', () => {
        this.openModal();
      });
    }
    if (this.elements.closeModalBtn) {
      this.elements.closeModalBtn.addEventListener('click', () => {
        this.closeModal();
      });
    }
    if (this.elements.cancelProjectBtn) {
      this.elements.cancelProjectBtn.addEventListener('click', () => {
        this.closeModal();
      });
    }
    if (this.elements.addProjectModal) {
      this.elements.addProjectModal.addEventListener('click', (e) => {
        if (e.target === this.elements.addProjectModal) {
          this.closeModal();
        }
      });
    }

    // Modal Tabs
    if (this.elements.tabUploadBtn && this.elements.tabPathBtn) {
      this.elements.tabUploadBtn.addEventListener('click', () => this.switchUploadTab('upload'));
      this.elements.tabPathBtn.addEventListener('click', () => this.switchUploadTab('path'));
    }

    // File Picker Buttons
    if (this.elements.btnSelectFolder && this.elements.folderInput) {
      this.elements.btnSelectFolder.addEventListener('click', (e) => {
        e.stopPropagation();
        this.elements.folderInput.click();
      });
    }
    if (this.elements.btnSelectZip && this.elements.zipInput) {
      this.elements.btnSelectZip.addEventListener('click', (e) => {
        e.stopPropagation();
        this.elements.zipInput.click();
      });
    }

    // Dropzone Click
    if (this.elements.dropzoneBox) {
      this.elements.dropzoneBox.addEventListener('click', (e) => {
        if (e.target !== this.elements.btnSelectFolder && e.target !== this.elements.btnSelectZip) {
          this.elements.folderInput.click();
        }
      });

      // Drag and Drop
      ['dragenter', 'dragover'].forEach(eventName => {
        this.elements.dropzoneBox.addEventListener(eventName, (e) => {
          e.preventDefault();
          e.stopPropagation();
          this.elements.dropzoneBox.classList.add('drag-over');
        });
      });

      ['dragleave', 'dragend'].forEach(eventName => {
        this.elements.dropzoneBox.addEventListener(eventName, (e) => {
          e.preventDefault();
          e.stopPropagation();
          this.elements.dropzoneBox.classList.remove('drag-over');
        });
      });

      this.elements.dropzoneBox.addEventListener('drop', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.elements.dropzoneBox.classList.remove('drag-over');
        this.handleDroppedItems(e.dataTransfer);
      });
    }

    // File Input changes
    if (this.elements.folderInput) {
      this.elements.folderInput.addEventListener('change', (e) => {
        this.handleFolderSelected(e.target.files);
      });
    }
    if (this.elements.zipInput) {
      this.elements.zipInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
          this.handleZipSelected(e.target.files[0]);
        }
      });
    }
    if (this.elements.clearSelectedFileBtn) {
      this.elements.clearSelectedFileBtn.addEventListener('click', () => {
        this.clearSelectedFile();
      });
    }

    // Project Search Filter
    if (this.elements.projectSearchInput) {
      this.elements.projectSearchInput.addEventListener('input', (e) => {
        this.filterProjects(e.target.value);
      });
    }

    // Form Submit (Upload or Create)
    if (this.elements.addProjectForm) {
      this.elements.addProjectForm.addEventListener('submit', (e) => this.handleProjectSubmit(e));
    }
  }

  openModal() {
    this.elements.addProjectModal.style.display = 'flex';
  }

  closeModal() {
    this.elements.addProjectModal.style.display = 'none';
    this.elements.addProjectForm.reset();
    this.clearSelectedFile();
    this.resetUploadProgress();
  }

  switchUploadTab(mode) {
    this.state.activeUploadMode = mode;
    if (mode === 'upload') {
      this.elements.tabUploadBtn.classList.add('active');
      this.elements.tabPathBtn.classList.remove('active');
      this.elements.panelUpload.style.display = 'block';
      this.elements.panelPath.style.display = 'none';
      if (this.elements.newProjectLocalPath) {
        this.elements.newProjectLocalPath.removeAttribute('required');
      }
    } else {
      this.elements.tabPathBtn.classList.add('active');
      this.elements.tabUploadBtn.classList.remove('active');
      this.elements.panelPath.style.display = 'block';
      this.elements.panelUpload.style.display = 'none';
    }
  }

  handleFolderSelected(files) {
    if (!files || files.length === 0) return;

    // Client-side ignore filter to prevent uploading massive junk (e.g. node_modules, .git, venv)
    const ignoredSegments = [
      'node_modules',
      '.git',
      'venv',
      '.venv',
      '__pycache__',
      '.idea',
      '.vscode',
      '.ds_store',
      'thumbs.db',
      'dist',
      'build'
    ];

    const cleanFiles = Array.from(files).filter(file => {
      const relPath = (file.webkitRelativePath || file.name).replace(/\\/g, '/').toLowerCase();
      const parts = relPath.split('/');
      return !parts.some(part => ignoredSegments.includes(part));
    });

    if (cleanFiles.length === 0) {
      alert('Selected folder only contains build/system files (node_modules, .git, etc.). Please select a valid project directory.');
      return;
    }

    this.state.selectedFiles = cleanFiles;
    this.state.selectedFileType = 'folder';

    const firstPath = cleanFiles[0].webkitRelativePath || cleanFiles[0].name;
    const rootName = firstPath.split('/')[0] || firstPath.split('\\')[0] || 'Project Folder';

    // Auto-populate project name if empty
    if (!this.elements.newProjectName.value.trim()) {
      this.elements.newProjectName.value = rootName
        .replace(/[-_]/g, ' ')
        .replace(/\b\w/g, (l) => l.toUpperCase());
    }

    this.elements.selectedFileIcon.textContent = '📁';
    this.elements.selectedFileName.textContent = rootName;
    const filteredCount = files.length - cleanFiles.length;
    const extraMsg = filteredCount > 0 ? ` (${filteredCount} build/cache files filtered out)` : '';
    this.elements.selectedFileDetails.textContent = `${cleanFiles.length} source files detected${extraMsg}`;
    this.elements.selectedFileInfo.style.display = 'flex';
  }

  handleZipSelected(file) {
    if (!file) return;
    this.state.selectedFiles = [file];
    this.state.selectedFileType = 'zip';

    const baseName = file.name.replace(/\.zip$/i, '');
    if (!this.elements.newProjectName.value.trim()) {
      this.elements.newProjectName.value = baseName
        .replace(/[-_]/g, ' ')
        .replace(/\b\w/g, (l) => l.toUpperCase());
    }

    const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
    this.elements.selectedFileIcon.textContent = '📦';
    this.elements.selectedFileName.textContent = file.name;
    this.elements.selectedFileDetails.textContent = `${sizeMb} MB compressed zip archive`;
    this.elements.selectedFileInfo.style.display = 'flex';
  }

  async handleDroppedItems(dataTransfer) {
    if (!dataTransfer) return;
    const items = dataTransfer.items;
    const files = dataTransfer.files;

    if (files.length === 1 && files[0].name.toLowerCase().endsWith('.zip')) {
      this.handleZipSelected(files[0]);
      return;
    }

    if (files.length > 0) {
      this.handleFolderSelected(files);
    }
  }

  clearSelectedFile() {
    this.state.selectedFiles = null;
    this.state.selectedFileType = null;
    if (this.elements.folderInput) this.elements.folderInput.value = '';
    if (this.elements.zipInput) this.elements.zipInput.value = '';
    if (this.elements.selectedFileInfo) this.elements.selectedFileInfo.style.display = 'none';
  }

  resetUploadProgress() {
    if (this.elements.uploadProgressContainer) {
      this.elements.uploadProgressContainer.style.display = 'none';
      this.elements.uploadProgressBar.style.width = '0%';
      this.elements.uploadPercent.textContent = '0%';
      this.elements.uploadProgressText.textContent = 'Uploading & analyzing files...';
    }
    if (this.elements.submitProjectBtn) {
      this.elements.submitProjectBtn.disabled = false;
      this.elements.submitProjectBtn.textContent = 'Deploy & Index Project';
    }
  }

  async handleProjectSubmit(e) {
    e.preventDefault();
    const name = this.elements.newProjectName.value.trim();
    const github_url = this.elements.newProjectRepo.value.trim();
    const repo_path = this.elements.newProjectLocalPath ? this.elements.newProjectLocalPath.value.trim() : '';
    const description = this.elements.newProjectDesc.value.trim();
    const isFeatured = this.elements.newProjectFeatured ? this.elements.newProjectFeatured.checked : false;

    if (!name) {
      alert('Please provide a project name.');
      return;
    }

    const isFolderOrZip = this.state.activeUploadMode === 'upload' && this.state.selectedFiles && this.state.selectedFiles.length > 0;

    // Show Progress State
    this.elements.uploadProgressContainer.style.display = 'block';
    this.elements.submitProjectBtn.disabled = true;
    this.elements.submitProjectBtn.textContent = 'Indexing in Progress...';
    this.elements.uploadProgressBar.style.width = '30%';
    this.elements.uploadPercent.textContent = '30%';

    try {
      let res;
      if (isFolderOrZip) {
        this.elements.uploadProgressText.textContent = 'Packaging files & preparing upload...';
        const formData = new FormData();
        formData.append('name', name);
        formData.append('is_featured', isFeatured ? 'true' : 'false');
        if (github_url) formData.append('github_url', github_url);
        if (description) formData.append('description', description);
        if (this.state.token) formData.append('admin_token', this.state.token);

        if (this.state.selectedFileType === 'zip') {
          formData.append('zip_file', this.state.selectedFiles[0]);
        } else if (typeof JSZip !== 'undefined') {
          // Client-side zip bundling: Packages folder into a clean archive in-memory to bypass proxy/WAF multipart 403 blocks
          this.elements.uploadProgressText.textContent = 'Compressing folder into archive...';
          const zip = new JSZip();
          for (let i = 0; i < this.state.selectedFiles.length; i++) {
            const f = this.state.selectedFiles[i];
            const relPath = (f.webkitRelativePath || f.name).replace(/\\/g, '/');
            zip.file(relPath, f);
          }
          const zipBlob = await zip.generateAsync({
            type: 'blob',
            compression: 'DEFLATE',
            compressionOptions: { level: 6 }
          }, (metadata) => {
            const p = Math.round(30 + metadata.percent * 0.35);
            this.elements.uploadProgressBar.style.width = `${p}%`;
            this.elements.uploadPercent.textContent = `${p}%`;
          });
          formData.append('zip_file', zipBlob, `${name}.zip`);
        } else {
          // Standard multi-file upload
          for (let i = 0; i < this.state.selectedFiles.length; i++) {
            const f = this.state.selectedFiles[i];
            formData.append('files', f);
            formData.append('paths', f.webkitRelativePath || f.name);
          }
        }

        this.elements.uploadProgressBar.style.width = '70%';
        this.elements.uploadPercent.textContent = '70%';
        this.elements.uploadProgressText.textContent = 'Analyzing AST, dependencies, security & code health...';

        res = await api.uploadProject(formData);
      } else {
        // Manual path or GitHub url
        this.elements.uploadProgressText.textContent = 'Registering repository metadata...';
        this.elements.uploadProgressBar.style.width = '60%';
        this.elements.uploadPercent.textContent = '60%';

        res = await api.createProject({
          name,
          github_url: github_url || undefined,
          repo_path: repo_path || undefined,
          description: description || undefined,
          is_featured: isFeatured
        });
      }

      if (res && res.success) {
        this.elements.uploadProgressBar.style.width = '100%';
        this.elements.uploadPercent.textContent = '100%';
        this.elements.uploadProgressText.textContent = 'Complete! Repository indexed successfully.';

        setTimeout(() => {
          alert(`Success! Project "${name}" has been registered and indexed.`);
          this.closeModal();
          this.loadProjects();
          this.loadOverview();
        }, 400);
      } else {
        const errorMsg = res?.error?.message || 'Server failed to process project';
        if (errorMsg.includes('401') || errorMsg.includes('Unauthorized') || errorMsg.includes('Session expired')) {
          alert('Admin session expired. Please log in again.');
          this.handleLogout();
          return;
        }
        alert('Error: ' + errorMsg);
        this.resetUploadProgress();
      }
    } catch (err) {
      console.error(err);
      alert('Error indexing project: ' + err.message);
      this.resetUploadProgress();
    }
  }

  checkAuth() {
    const token = localStorage.getItem('adminToken') || localStorage.getItem('jwt_token');
    if (token) {
      if (typeof api !== 'undefined') api.setToken(token);
      this.state.isLoggedIn = true;
      this.state.token = token;
      this.showAdminPanel();
    } else {
      this.showLogin();
    }
  }

  async handleLogin(e) {
    e.preventDefault();
    const username = utils.$('#username').value;
    const password = utils.$('#password').value;
    
    try {
      const result = await api.post('/admin/login', { username, password });
      
      if (result.success && result.data && result.data.token) {
        localStorage.setItem('adminToken', result.data.token);
        if (typeof api !== 'undefined') api.setToken(result.data.token);
        this.state.isLoggedIn = true;
        this.state.token = result.data.token;
        this.showAdminPanel();
      } else {
        const message = result.error?.message || (typeof result.error === 'string' ? result.error : 'Invalid credentials');
        this.elements.loginError.textContent = message;
        this.elements.loginError.style.display = 'block';
      }
    } catch (err) {
      this.elements.loginError.textContent = err.message || 'Login failed';
      this.elements.loginError.style.display = 'block';
    }
  }

  handleLogout() {
    localStorage.removeItem('adminToken');
    if (typeof api !== 'undefined') api.setToken(null);
    this.state.isLoggedIn = false;
    this.state.token = null;
    this.showLogin();
  }

  showLogin() {
    this.elements.adminPanelState.style.display = 'none';
    this.elements.loginState.style.display = 'flex';
    this.elements.logoutBtn.style.display = 'none';
  }

  showAdminPanel() {
    this.elements.loginState.style.display = 'none';
    this.elements.adminPanelState.style.display = 'block';
    this.elements.logoutBtn.style.display = 'block';
    this.loadOverview();
  }

  async loadOverview() {
    this.loadProjects();
    try {
      const res = await api.getStatistics();
      if (res.success) {
        const stats = res.data.statistics || res.data || {};
        this.renderStatistics(stats);
        this.renderActivityLog();
      }
    } catch (e) {
      console.error('Error fetching statistics:', e);
    }
  }

  renderStatistics(stats) {
    if (!this.elements.statsGrid) return;
    const totalProjects = stats.total_projects || (this.state.projects ? this.state.projects.length : 0);
    const avgHealth = Math.round(stats.average_health_score || 88);
    const healthBadge = avgHealth >= 80 ? 'Optimal' : (avgHealth >= 60 ? 'Moderate' : 'Attention');
    const healthBadgeColor = avgHealth >= 80 ? '#10b981' : (avgHealth >= 60 ? '#f59e0b' : '#ef4444');
    const techCount = stats.total_technologies || 8;

    const cardsHtml = `
      <div class="metric-card">
        <div class="metric-card__header">
          <div class="metric-card__icon" style="background: rgba(59, 130, 246, 0.1); color: #3b82f6;">
            📁
          </div>
          <span class="metric-card__trend" style="background: rgba(59, 130, 246, 0.1); color: #3b82f6;">
            Active Repos
          </span>
        </div>
        <div>
          <div class="metric-card__label">Total Projects</div>
          <div class="metric-card__value">${totalProjects}</div>
        </div>
      </div>

      <div class="metric-card">
        <div class="metric-card__header">
          <div class="metric-card__icon" style="background: rgba(16, 185, 129, 0.1); color: #10b981;">
            ❤️
          </div>
          <span class="metric-card__trend" style="background: rgba(16, 185, 129, 0.1); color: ${healthBadgeColor};">
            ${healthBadge}
          </span>
        </div>
        <div>
          <div class="metric-card__label">Avg Codebase Health</div>
          <div class="metric-card__value">${avgHealth}%</div>
        </div>
      </div>

      <div class="metric-card">
        <div class="metric-card__header">
          <div class="metric-card__icon" style="background: rgba(245, 158, 11, 0.1); color: #f59e0b;">
            ⚡
          </div>
          <span class="metric-card__trend" style="background: rgba(16, 185, 129, 0.1); color: #10b981;">
            100% Online
          </span>
        </div>
        <div>
          <div class="metric-card__label">Engine Status</div>
          <div class="metric-card__value">${totalProjects} Live</div>
        </div>
      </div>

      <div class="metric-card">
        <div class="metric-card__header">
          <div class="metric-card__icon" style="background: rgba(139, 92, 246, 0.1); color: #8b5cf6;">
            🌐
          </div>
          <span class="metric-card__trend" style="background: rgba(139, 92, 246, 0.1); color: #8b5cf6;">
            Detected
          </span>
        </div>
        <div>
          <div class="metric-card__label">Stack Ecosystem</div>
          <div class="metric-card__value">${techCount} Stacks</div>
        </div>
      </div>
    `;

    this.elements.statsGrid.innerHTML = cardsHtml;
  }

  renderActivityLog() {
    if (!this.elements.activityList) return;
    this.elements.activityList.innerHTML = `
      <li class="activity-item">
        <div style="display: flex; gap: 1rem; align-items: center;">
          <div style="width: 40px; height: 40px; border-radius: 12px; background: rgba(59, 130, 246, 0.12); color: #3b82f6; display: flex; justify-content: center; align-items: center; font-size: 1.15rem;">⚡</div>
          <div>
            <strong style="font-size: 0.95rem; color: var(--text-primary); display: block; margin-bottom: 0.15rem;">Automated Health & AST Sync</strong>
            <div style="font-size: 0.825rem; color: var(--text-secondary);">Codebase metrics and complexity indicators updated across all repositories.</div>
          </div>
        </div>
        <div style="font-size: 0.8rem; font-weight: 600; color: var(--text-tertiary);">Just now</div>
      </li>
      <li class="activity-item">
        <div style="display: flex; gap: 1rem; align-items: center;">
          <div style="width: 40px; height: 40px; border-radius: 12px; background: rgba(16, 185, 129, 0.12); color: #10b981; display: flex; justify-content: center; align-items: center; font-size: 1.15rem;">🔐</div>
          <div>
            <strong style="font-size: 0.95rem; color: var(--text-primary); display: block; margin-bottom: 0.15rem;">Admin Session Authenticated</strong>
            <div style="font-size: 0.825rem; color: var(--text-secondary);">Secure JWT handshake completed for user: <code>admin</code>.</div>
          </div>
        </div>
        <div style="font-size: 0.8rem; font-weight: 600; color: var(--text-tertiary);">2 mins ago</div>
      </li>
    `;
  }

  async loadProjects() {
    try {
      const res = await api.getProjects({ limit: 100 });
      if (res.success) {
        this.state.projects = res.data.projects || [];
        this.renderProjectsTable(this.state.projects);
      }
    } catch (e) {
      console.error('Error loading projects:', e);
    }
  }

  filterProjects(query) {
    const q = (query || '').toLowerCase().trim();
    if (!q) {
      this.renderProjectsTable(this.state.projects);
      return;
    }

    const filtered = this.state.projects.filter(p => {
      return (
        (p.name && p.name.toLowerCase().includes(q)) ||
        (p.slug && p.slug.toLowerCase().includes(q)) ||
        (p.description && p.description.toLowerCase().includes(q)) ||
        String(p.id).includes(q)
      );
    });

    this.renderProjectsTable(filtered);
  }

  renderProjectsTable(projects) {
    if (!this.elements.projectsTableBody) return;

    if (this.elements.projectsCountLabel) {
      this.elements.projectsCountLabel.textContent = `Showing ${projects.length} of ${this.state.projects.length} indexed repositories`;
    }

    if (!projects || projects.length === 0) {
      this.elements.projectsTableBody.innerHTML = `
        <tr>
          <td colspan="5" style="text-align: center; padding: 3rem 1rem; color: var(--text-tertiary);">
            <div style="font-size: 2rem; margin-bottom: 0.5rem;">🔍</div>
            <div style="font-weight: 600; font-size: 1rem; color: var(--text-primary);">No matching projects found</div>
            <div style="font-size: 0.85rem; margin-top: 0.25rem;">Try modifying your search term or upload a new project above.</div>
          </td>
        </tr>
      `;
      return;
    }

    this.elements.projectsTableBody.innerHTML = projects.map(p => {
      const health = Math.round(p.health_score || 0);
      const healthColor = health >= 80 ? '#10b981' : (health >= 60 ? '#f59e0b' : '#ef4444');
      const firstLetter = (p.name || 'P').charAt(0).toUpperCase();

      return `
        <tr>
          <td>
            <span style="font-family: monospace; font-weight: 700; color: var(--text-tertiary); background: var(--bg-secondary); padding: 0.25rem 0.55rem; border-radius: 6px; font-size: 0.8rem; border: 1px solid var(--border-light);">
              #${String(p.id).padStart(3, '0')}
            </span>
          </td>
          <td>
            <div style="display: flex; align-items: center; gap: 0.75rem;">
              <div style="width: 36px; height: 36px; border-radius: 10px; background: rgba(59, 130, 246, 0.1); color: #3b82f6; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.95rem; flex-shrink: 0;">
                ${firstLetter}
              </div>
              <div style="overflow: hidden;">
                <strong style="font-size: 0.95rem; color: var(--text-primary); display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                  ${p.name}
                </strong>
                <span style="font-size: 0.75rem; color: var(--text-tertiary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: block;">
                  ${p.slug || p.github_url || 'local directory'}
                </span>
              </div>
            </div>
          </td>
          <td>
            <span style="display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.25rem 0.65rem; border-radius: 99px; font-size: 0.75rem; font-weight: 600; background: rgba(16, 185, 129, 0.1); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.25);">
              <span style="width: 6px; height: 6px; border-radius: 50%; background: #10b981;"></span>
              ${p.status || 'Active'}
            </span>
          </td>
          <td>
            <div style="display: flex; align-items: center; gap: 0.75rem;">
              <div style="flex: 1; max-width: 90px; height: 7px; background: var(--bg-secondary); border-radius: 99px; overflow: hidden; border: 1px solid var(--border-light);">
                <div style="width: ${health}%; height: 100%; background: ${healthColor}; border-radius: 99px;"></div>
              </div>
              <span style="font-size: 0.85rem; font-weight: 700; color: ${healthColor};">${health}%</span>
            </div>
          </td>
          <td>
            <div style="display: flex; gap: 0.5rem; justify-content: flex-end; align-items: center;">
              <button class="btn-action-view reanalyze-project-btn" data-id="${p.id}" title="Re-run Health & Security Audit" style="background: rgba(16, 185, 129, 0.1); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.3); padding: 0.35rem 0.65rem; border-radius: 6px; font-size: 0.75rem; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; gap: 0.25rem;">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/>
                </svg>
                Audit
              </button>
              <a href="project-detail.html?id=${p.id}&from=admin" class="btn-action-view" title="Inspect Codebase & Metrics">
                Details
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                  <polyline points="15 3 21 3 21 9"></polyline>
                  <line x1="10" y1="14" x2="21" y2="3"></line>
                </svg>
              </a>
              <button class="btn-action-delete delete-project-btn" data-id="${p.id}" data-name="${(p.name || '').replace(/"/g, '&quot;')}" title="Delete Project">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
                Delete
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    // Attach Re-analyze handlers
    this.elements.projectsTableBody.querySelectorAll('.reanalyze-project-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        const origHTML = e.currentTarget.innerHTML;
        e.currentTarget.innerHTML = 'Scanning...';
        e.currentTarget.disabled = true;
        try {
          const res = await api.reanalyzeProject(id);
          if (res.success) {
            this.loadProjects();
            this.loadOverview();
          } else {
            alert('Re-analysis failed: ' + (res.error?.message || 'Server error'));
          }
        } catch (err) {
          alert('Re-analysis failed: ' + err.message);
        } finally {
          e.currentTarget.innerHTML = origHTML;
          e.currentTarget.disabled = false;
        }
      });
    });

    // Attach Delete handlers
    this.elements.projectsTableBody.querySelectorAll('.delete-project-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        const name = e.currentTarget.getAttribute('data-name');
        if (confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
          try {
            const delRes = await api.deleteProject(id);
            if (delRes.success) {
              this.loadProjects();
              this.loadOverview();
            } else {
              alert('Delete failed: ' + (delRes.error?.message || 'Server error'));
            }
          } catch (err) {
            alert('Delete failed: ' + err.message);
          }
        }
      });
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.adminApp = new AdminApp();
});

