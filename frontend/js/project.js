class ProjectApp {
  constructor() {
    this.projectId = new URLSearchParams(window.location.search).get('id');
    this.state = {
      project: null,
      isLoading: true,
      error: null,
      files: [],
      currentPath: '',
      currentFile: null,
      activeFileRawText: ''
    };
    this.elements = this.initializeElements();
    this.initializeApp();
  }

  initializeElements() {
    return {
      loadingState: utils.$('#loadingState'),
      errorState: utils.$('#errorState'),
      errorMessage: utils.$('#errorMessage'),
      content: utils.$('#projectContent'),
      name: utils.$('#projectName'),
      breadcrumbName: utils.$('#breadcrumbName'),
      description: utils.$('#projectDescription'),
      badges: utils.$('#projectBadges'),
      githubBtn: utils.$('#githubBtn'),
      copyUrlBtn: utils.$('#copyUrlBtn'),
      downloadBtn: utils.$('#downloadBtn'),
      exportReportBtn: utils.$('#exportReportBtn'),
      
      // Tabs
      tabs: document.querySelectorAll('.repo-tab'),
      tabPanes: document.querySelectorAll('.tab-pane'),
      
      // Authentic GitHub File Explorer Elements
      githubBreadcrumbs: utils.$('#githubBreadcrumbs'),
      githubBackToFilesBtn: utils.$('#githubBackToFilesBtn'),
      githubDirectoryView: utils.$('#githubDirectoryView'),
      githubFileTableBody: utils.$('#githubFileTableBody'),
      repoFilesCount: utils.$('#repoFilesCount'),
      repoCommitMsg: utils.$('#repoCommitMsg'),
      embeddedReadmeCard: utils.$('#embeddedReadmeCard'),
      embeddedReadmeBody: utils.$('#embeddedReadmeBody'),
      
      // GitHub Code Viewer Elements
      githubCodeView: utils.$('#githubCodeView'),
      githubActiveFileName: utils.$('#githubActiveFileName'),
      githubActiveFileMeta: utils.$('#githubActiveFileMeta'),
      githubRawBtn: utils.$('#githubRawBtn'),
      githubCopyBtn: utils.$('#githubCopyBtn'),
      githubDownloadFileBtn: utils.$('#githubDownloadFileBtn'),
      codeContent: utils.$('#codeContent'),
      
      // Other Content Tabs
      readmeContent: utils.$('#readmeContent'),
      howToRunContent: utils.$('#howToRunContent'),
      featuresContent: utils.$('#featuresContent'),
      auditContent: utils.$('#auditContent'),
      themeToggle: utils.$('#themeToggle')
    };
  }

  async initializeApp() {
    if (!this.projectId) {
      this.showError('No project ID specified.');
      return;
    }
    
    // Theme setup
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

    // Tab Navigation setup
    this.elements.tabs.forEach(tab => {
      tab.addEventListener('click', () => this.switchTab(tab.getAttribute('data-tab')));
    });

    // Share button
    if (this.elements.copyUrlBtn) {
      this.elements.copyUrlBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(window.location.href);
        const originalText = this.elements.copyUrlBtn.textContent;
        this.elements.copyUrlBtn.textContent = 'Copied!';
        setTimeout(() => this.elements.copyUrlBtn.textContent = originalText, 2000);
      });
    }

    // Export PDF / Audit Report Print Handler
    if (this.elements.exportReportBtn) {
      this.elements.exportReportBtn.addEventListener('click', async () => {
        this.switchTab('audit');
        // Ensure audit report content is loaded and populated before print dialog
        if (!this.elements.auditContent || !this.elements.auditContent.innerHTML || this.elements.auditContent.innerHTML.includes('No audit analysis')) {
          await this.loadAuditData();
        }
        setTimeout(() => {
          window.print();
        }, 300);
      });
    }

    // Go Back button setup
    const backBtn = document.getElementById('projectBackBtn');
    const backLabel = document.getElementById('backBtnLabel');
    if (backBtn) {
      const urlParams = new URLSearchParams(window.location.search);
      const fromParam = urlParams.get('from');
      const isAdminReferrer = fromParam === 'admin' || (document.referrer && document.referrer.includes('admin.html'));
      const isDiscoveryReferrer = fromParam === 'projects' || (document.referrer && document.referrer.includes('projects.html'));

      if (isAdminReferrer) {
        if (backLabel) backLabel.textContent = 'Back to Admin Panel';
      } else if (isDiscoveryReferrer) {
        if (backLabel) backLabel.textContent = 'Back to Discovery';
      }

      backBtn.addEventListener('click', () => {
        if (isAdminReferrer) {
          window.location.href = 'admin.html';
        } else if (isDiscoveryReferrer) {
          window.location.href = 'projects.html';
        } else if (document.referrer && (document.referrer.includes('index.html') || document.referrer.includes('projects.html'))) {
          window.location.href = document.referrer;
        } else if (window.history.length > 1) {
          window.history.back();
        } else {
          window.location.href = 'projects.html';
        }
      });
    }

    // GitHub Code Viewer toolbar buttons
    this.bindGitHubViewerEvents();

    await this.loadProjectData();
  }

  bindGitHubViewerEvents() {
    if (this.elements.githubBackToFilesBtn) {
      this.elements.githubBackToFilesBtn.addEventListener('click', () => {
        const parentPath = this.state.currentFile?.path ? 
          this.state.currentFile.path.split('/').slice(0, -1).join('/') : '';
        this.renderDirectory(parentPath);
        setTimeout(() => {
          const topBar = document.querySelector('.github-topbar');
          if (topBar) {
            topBar.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 40);
      });
    }

    if (this.elements.githubCopyBtn) {
      this.elements.githubCopyBtn.addEventListener('click', () => {
        if (this.state.activeFileRawText) {
          navigator.clipboard.writeText(this.state.activeFileRawText);
          const originalHTML = this.elements.githubCopyBtn.innerHTML;
          this.elements.githubCopyBtn.innerHTML = '✓ Copied!';
          setTimeout(() => {
            this.elements.githubCopyBtn.innerHTML = originalHTML;
          }, 2000);
        }
      });
    }

    if (this.elements.githubRawBtn) {
      this.elements.githubRawBtn.addEventListener('click', () => {
        if (this.state.activeFileRawText) {
          const blob = new Blob([this.state.activeFileRawText], { type: 'text/plain;charset=utf-8' });
          const url = URL.createObjectURL(blob);
          window.open(url, '_blank');
        }
      });
    }

    if (this.elements.githubDownloadFileBtn) {
      this.elements.githubDownloadFileBtn.addEventListener('click', () => {
        if (this.state.activeFileRawText && this.state.currentFile) {
          const blob = new Blob([this.state.activeFileRawText], { type: 'application/octet-stream' });
          const a = document.createElement('a');
          a.href = URL.createObjectURL(blob);
          a.download = this.state.currentFile.name;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        }
      });
    }
  }

  switchTab(tabId) {
    this.elements.tabs.forEach(t => t.classList.remove('active'));
    this.elements.tabPanes.forEach(p => p.classList.add('d-none'));
    
    const activeTab = document.querySelector(`.repo-tab[data-tab="${tabId}"]`);
    if (activeTab) activeTab.classList.add('active');
    const activePane = document.getElementById(`tab-${tabId}`);
    if (activePane) activePane.classList.remove('d-none');
  }

  async loadProjectData() {
    try {
      this.showLoading();
      const projectResult = await api.getProject(this.projectId);
      if (!projectResult.success) throw new Error(projectResult.error?.message || projectResult.error || 'Failed to load project details.');
      
      this.state.project = projectResult.data;
      let isLocal = false;
      let rootFiles = [];
      
      // PRIORITY 1: Check if local project files exist on server
      const localFilesRes = await api.getProjectFiles(this.projectId);
      if (localFilesRes.success && localFilesRes.data && localFilesRes.data.files && localFilesRes.data.files.length > 0) {
        rootFiles = localFilesRes.data.files;
        isLocal = true;
      } else if (this.state.project.github_url) {
        // PRIORITY 2: Fallback to GitHub public API if no local files and github_url provided
        const match = this.state.project.github_url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
        if (match) {
          const owner = match[1];
          const repo = match[2].replace('.git', '');
          try {
            const repoInfoRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`);
            if (repoInfoRes.ok) {
              const repoInfo = await repoInfoRes.json();
              const branch = repoInfo.default_branch || 'main';
              
              const treeRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`);
              if (treeRes.ok) {
                const treeData = await treeRes.json();
                if (treeData && treeData.tree) {
                  const root = [];
                  const map = {};
                  
                  treeData.tree.forEach(item => {
                    const parts = item.path.split('/');
                    const name = parts.pop();
                    const parentPath = parts.join('/');
                    
                    const node = {
                      name: name,
                      type: item.type === 'tree' ? 'folder' : 'file',
                      path: item.path,
                      extension: item.type === 'blob' ? item.path.split('.').pop().toLowerCase() : '',
                      download_url: item.type === 'blob' ? `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${item.path}` : null,
                      children: item.type === 'tree' ? [] : undefined
                    };
                    
                    map[item.path] = node;
                    
                    if (parentPath === '') {
                      root.push(node);
                    } else if (map[parentPath] && map[parentPath].children) {
                      map[parentPath].children.push(node);
                    }
                  });
                  
                  rootFiles = root;
                }
              }
            }
          } catch (e) {
            console.warn('GitHub API fetch failed or rate limited:', e);
          }
        }
      }
      
      this.state.files = rootFiles;
      this.isLocal = isLocal;
      
      this.render();
    } catch (error) {
      console.error(error);
      this.showError(error.message);
    }
  }

  render() {
    this.hideStates();
    this.elements.content.classList.remove('d-none');

    const p = this.state.project;
    this.elements.name.textContent = p.name || 'Unknown Project';
    this.elements.breadcrumbName.textContent = p.name;
    this.elements.description.textContent = p.short_description || 'Interactive project repository.';
    
    // External GitHub link button
    if (p.github_url) {
      this.elements.githubBtn.href = p.github_url;
      this.elements.githubBtn.classList.remove('d-none');
    }
    
    // Download ZIP button
    if (this.elements.downloadBtn && p.id) {
      const downloadEndpoint = (typeof api !== 'undefined' && api && api.baseURL)
        ? `${api.baseURL}/projects/${p.id}/download`
        : `/api/v1/projects/${p.id}/download`;
      this.elements.downloadBtn.href = downloadEndpoint;
      this.elements.downloadBtn.classList.remove('d-none');
    }
    
    // Badges & Health Score
    let allTechs = [];
    if (p.languages) allTechs = allTechs.concat(p.languages.map(l => l.name || l));
    if (p.technologies) allTechs = allTechs.concat(p.technologies.map(t => t.name || t));
    
    let badgesHTML = '';
    if (p.status === 'active' || p.status === 'completed') {
      badgesHTML += `<span class="badge badge--success" style="padding: 0.25rem 0.75rem; border-radius: 99px;">Verified Source</span>`;
    } else {
      badgesHTML += `<span class="badge" style="background: var(--warning-bg); color: var(--warning); padding: 0.25rem 0.75rem; border-radius: 99px;">Pending Verification</span>`;
    }

    [...new Set(allTechs)].forEach(tech => {
      badgesHTML += `<span class="badge" style="padding: 0.25rem 0.75rem; border-radius: 99px;">${tech}</span>`;
    });
    
    const score = Math.round(p.health_score || 95);
    const color = score >= 90 ? 'var(--primary-500)' : (score >= 70 ? 'var(--warning)' : 'var(--danger)');
    badgesHTML += `<div style="display:inline-flex; align-items:center; gap:0.5rem; margin-left: 0.75rem; border-left: 1px solid var(--border-light); padding-left: 0.75rem;">
      <span style="font-weight:600; color:var(--text-primary); font-size:0.875rem;">Health Grade: ${score}/100</span>
      <div style="width:90px; height:6px; background:var(--gray-200); border-radius:3px; overflow:hidden;">
        <div style="width:${score}%; height:100%; background:${color};"></div>
      </div>
    </div>`;
    
    this.elements.badges.innerHTML = badgesHTML;

    // Render Authentic GitHub Directory View
    this.renderDirectory('');

    // Render tabs with rich synthesized content & analysis profile
    const analysis = p.analysis || {};
    this.renderReadmeContent(p, analysis);
    this.renderHowToRunContent(p, analysis);
    this.renderFeaturesContent(p, analysis);

    // Load Health & Security Audit Report
    this.loadAuditData();
  }

  renderReadmeContent(p, analysis) {
    if (!this.elements.readmeContent) return;

    const rawReadme = p.description;
    if (rawReadme && rawReadme.trim().length > 30) {
      this.elements.readmeContent.innerHTML = this.parseMarkdown(rawReadme);
      return;
    }

    // Synthesized Readme when repository lacks documentation
    const stats = analysis?.statistics || {};
    const techs = (p.technologies || []).map(t => `<span class="badge">${t.name}</span>`).join(' ') || '<span class="badge">General</span>';

    this.elements.readmeContent.innerHTML = `
      <div style="background:var(--bg-secondary); border:1px solid var(--border-medium); border-radius:var(--radius-xl); padding:2rem; margin-bottom:1.5rem;">
        <div style="display:inline-flex; align-items:center; gap:0.5rem; background:rgba(59, 130, 246, 0.1); border:1px solid rgba(59, 130, 246, 0.25); padding:0.35rem 0.85rem; border-radius:99px; margin-bottom:1rem; font-size:0.8rem; font-weight:600; color:var(--primary-500);">
          ⚡ Synthesized Architecture Overview
        </div>
        <h1 style="font-size:2rem; font-weight:800; color:var(--text-primary); margin-bottom:0.75rem;">
          ${utils.sanitizeHtml(p.name)}
        </h1>
        <p style="font-size:1.05rem; color:var(--text-secondary); margin-bottom:1.25rem; line-height:1.6;">
          ${utils.sanitizeHtml(p.short_description || 'Repository verified and indexed by ProjIntelligence.')}
        </p>
        <div style="margin-bottom:1.5rem;">${techs}</div>
        
        <div style="padding:1rem 1.25rem; background:var(--bg-primary); border:1px solid var(--border-medium); border-radius:var(--radius-lg); margin-bottom:1.5rem;">
          <h3 style="font-size:1rem; color:var(--text-primary); margin:0 0 0.5rem 0;">Repository Profile</h3>
          <p style="margin:0; font-size:0.875rem; color:var(--text-secondary); line-height:1.6;">
            This codebase contains <strong>${(stats.total_lines_of_code || 0).toLocaleString()} lines of code</strong> across <strong>${stats.total_files || 0} source and resource files</strong>. Evaluated by ProjIntelligence with a deterministic health score of <strong>${Math.round(p.health_score || analysis?.overall_score || 0)}/100 (Grade ${analysis?.grade || 'C'})</strong>.
          </p>
        </div>

        <div style="display:flex; gap:0.75rem; flex-wrap:wrap;">
          <button class="btn btn--primary" id="readmeToRunBtn" style="cursor:pointer;">
            View Execution Instructions
          </button>
          <button class="btn btn--secondary" id="readmeToFeatBtn" style="cursor:pointer;">
            Explore Key Features
          </button>
          <button class="btn btn--secondary" id="readmeToAuditBtn" style="cursor:pointer;">
            Inspect Health Audit
          </button>
        </div>
      </div>
    `;

    setTimeout(() => {
      const toRun = document.getElementById('readmeToRunBtn');
      const toFeat = document.getElementById('readmeToFeatBtn');
      const toAudit = document.getElementById('readmeToAuditBtn');
      if (toRun) toRun.addEventListener('click', () => this.switchTab('run'));
      if (toFeat) toFeat.addEventListener('click', () => this.switchTab('features'));
      if (toAudit) toAudit.addEventListener('click', () => this.switchTab('audit'));
    }, 50);
  }

  renderHowToRunContent(p, analysis) {
    if (!this.elements.howToRunContent) return;

    const guide = analysis?.execution_guide;
    const deps = analysis?.dependencies;
    const rawReadme = p.description || '';
    const runContentMatch = rawReadme.match(/##\s*(?:How to Run|Setup Instructions|Installation|Build Instructions|Getting Started)[^#]*(?:(?=##)|$)/i);

    let html = '';

    // Quick Command Snippet (one-click copy)
    const snippet = guide?.snippet || (runContentMatch ? 'See instructions below' : 'python app.py');
    html += `
      <div style="background: var(--bg-secondary); border: 1px solid var(--border-medium); border-radius: var(--radius-xl); padding: 1.5rem; margin-bottom: 2rem; box-shadow: var(--shadow-sm);">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.75rem; flex-wrap:wrap; gap:0.5rem;">
          <div style="display:flex; align-items:center; gap:0.5rem;">
            <span style="font-size:1.25rem;">⚡</span>
            <strong style="font-size:1rem; color:var(--text-primary);">Quick Run Command</strong>
            <span class="badge" style="background:var(--primary-500); color:#fff; font-size:0.75rem;">${guide?.ecosystem || 'Terminal'}</span>
          </div>
          <button id="copySnippetBtn" class="btn btn--secondary" style="font-size:0.8rem; padding:0.35rem 0.75rem; display:inline-flex; align-items:center; gap:0.35rem;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
            <span id="copySnippetLabel">Copy Command</span>
          </button>
        </div>
        <pre style="margin:0; padding:1rem 1.25rem; background:#0f172a; color:#f8fafc; border-radius:var(--radius-lg); font-family:var(--font-mono); font-size:0.9rem; overflow-x:auto; border:1px solid #1e293b;"><code><span style="color:#10b981;">$</span> ${utils.sanitizeHtml(snippet)}</code></pre>
      </div>
    `;

    // Prerequisites Section
    if (guide?.prerequisites && guide.prerequisites.length > 0) {
      const prereqBadges = guide.prerequisites.map(pr => `
        <span style="display:inline-flex; align-items:center; gap:0.4rem; padding:0.4rem 0.85rem; background:rgba(59, 130, 246, 0.08); border:1px solid rgba(59, 130, 246, 0.25); border-radius:var(--radius-full); font-size:0.85rem; font-weight:600; color:var(--text-primary);">
          <span>🔧</span> ${utils.sanitizeHtml(pr)}
        </span>
      `).join('');

      html += `
        <div style="margin-bottom: 2rem;">
          <h3 style="font-size:1.1rem; color:var(--text-primary); margin-bottom:0.75rem; display:flex; align-items:center; gap:0.5rem;">
            <span>📋</span> Environment & Build Prerequisites
          </h3>
          <div style="display:flex; flex-wrap:wrap; gap:0.6rem;">
            ${prereqBadges}
          </div>
        </div>
      `;
    }

    // Step-by-Step Execution Plan
    if (guide?.steps && guide.steps.length > 0) {
      const stepCards = guide.steps.map((st, idx) => `
        <div style="display:flex; gap:1rem; align-items:flex-start; background:var(--bg-secondary); border:1px solid var(--border-medium); border-radius:var(--radius-lg); padding:1rem 1.25rem; margin-bottom:0.75rem;">
          <div style="min-width:28px; height:28px; border-radius:50%; background:var(--primary-500); color:#fff; display:flex; align-items:center; justify-content:center; font-weight:700; font-size:0.85rem;">
            ${idx + 1}
          </div>
          <div style="flex:1; color:var(--text-primary); font-size:0.95rem; line-height:1.6;">
            ${this.parseMarkdown(st).replace(/^<p>|<\/p>$/g, '')}
          </div>
        </div>
      `).join('');

      html += `
        <div style="margin-bottom: 2rem;">
          <h3 style="font-size:1.1rem; color:var(--text-primary); margin-bottom:0.75rem; display:flex; align-items:center; gap:0.5rem;">
            <span>🚀</span> Step-by-Step Execution Guide
          </h3>
          <div>${stepCards}</div>
        </div>
      `;
    }

    // Dependencies & Requirements Table
    if (deps?.packages && deps.packages.length > 0) {
      const pkgChips = deps.packages.map(p => `
        <div style="display:flex; justify-content:space-between; align-items:center; padding:0.5rem 0.85rem; background:var(--bg-primary); border:1px solid var(--border-medium); border-radius:var(--radius-md); font-size:0.85rem;">
          <span style="font-family:var(--font-mono); font-weight:600; color:var(--text-primary);">${utils.sanitizeHtml(p.name)}</span>
          <span class="badge" style="font-size:0.75rem;">${utils.sanitizeHtml(p.version)}</span>
        </div>
      `).join('');

      html += `
        <div style="margin-bottom: 2rem;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.75rem; flex-wrap:wrap; gap:0.5rem;">
            <h3 style="font-size:1.1rem; color:var(--text-primary); margin:0; display:flex; align-items:center; gap:0.5rem;">
              <span>📦</span> Verified Project Dependencies & Requirements
            </h3>
            <span style="font-size:0.8rem; color:var(--text-tertiary); font-family:var(--font-mono);">
              Source: ${utils.sanitizeHtml(deps.manifest_file || 'manifest')} (${deps.count} items)
            </span>
          </div>
          <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(220px, 1fr)); gap:0.5rem;">
            ${pkgChips}
          </div>
        </div>
      `;
    }

    // If author README has additional instructions, append below
    if (runContentMatch) {
      html += `
        <div style="margin-top:2rem; padding-top:1.5rem; border-top:1px solid var(--border-medium);">
          <h3 style="font-size:1.1rem; color:var(--text-primary); margin-bottom:0.75rem;">
            Author's Original Setup Documentation
          </h3>
          <div class="markdown-body" style="padding:1rem; background:var(--bg-secondary); border-radius:var(--radius-lg); border:1px solid var(--border-medium);">
            ${this.parseMarkdown(runContentMatch[0])}
          </div>
        </div>
      `;
    }

    this.elements.howToRunContent.innerHTML = html;

    // Bind copy snippet button
    setTimeout(() => {
      const copyBtn = document.getElementById('copySnippetBtn');
      const copyLabel = document.getElementById('copySnippetLabel');
      if (copyBtn && copyLabel) {
        copyBtn.addEventListener('click', () => {
          navigator.clipboard.writeText(snippet);
          const orig = copyLabel.textContent;
          copyLabel.textContent = 'Copied!';
          setTimeout(() => copyLabel.textContent = orig, 2000);
        });
      }
    }, 50);
  }

  renderFeaturesContent(p, analysis) {
    if (!this.elements.featuresContent) return;

    const featuresList = analysis?.features || [];
    const stats = analysis?.statistics || {};

    let html = `
      <div style="margin-bottom: 2rem;">
        <p style="color:var(--text-secondary); font-size:1rem; margin-bottom:1.5rem;">
          Verified architectural capabilities, algorithmic design patterns, and engineering characteristics extracted from repository inspection.
        </p>
    `;

    if (featuresList.length > 0) {
      const cards = featuresList.map(feat => {
        const tag = feat.tag || 'Verified';
        let tagColor = 'var(--primary-500)';
        if (tag === 'Networking') tagColor = '#3b82f6';
        else if (tag === 'Database') tagColor = '#10b981';
        else if (tag === 'Backend') tagColor = '#8b5cf6';
        else if (tag === 'Systems') tagColor = '#f59e0b';
        else if (tag === 'Testing') tagColor = '#06b6d4';

        return `
          <div style="background:var(--bg-secondary); border:1px solid var(--border-medium); border-radius:var(--radius-xl); padding:1.25rem 1.5rem; display:flex; flex-direction:column; justify-content:space-between; box-shadow:var(--shadow-sm);">
            <div>
              <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:0.75rem;">
                <h4 style="font-size:1.05rem; font-weight:700; color:var(--text-primary); margin:0;">
                  ${utils.sanitizeHtml(feat.title)}
                </h4>
                <span class="badge" style="background:${tagColor}; color:#fff; font-size:0.7rem; font-weight:700; text-transform:uppercase;">
                  ${utils.sanitizeHtml(tag)}
                </span>
              </div>
              <p style="font-size:0.9rem; color:var(--text-secondary); line-height:1.6; margin:0;">
                ${utils.sanitizeHtml(feat.description)}
              </p>
            </div>
          </div>
        `;
      }).join('');

      html += `
        <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(320px, 1fr)); gap:1rem; margin-bottom:2rem;">
          ${cards}
        </div>
      `;
    }

    // Technical Architecture Metrics Bar
    html += `
      <div style="background:var(--bg-secondary); border:1px solid var(--border-medium); border-radius:var(--radius-xl); padding:1.5rem;">
        <h4 style="margin:0 0 1rem 0; font-size:1rem; color:var(--text-primary); display:flex; align-items:center; gap:0.5rem;">
          <span>📐</span> Architecture & Engineering Specifications
        </h4>
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(180px, 1fr)); gap:1.25rem;">
          <div>
            <span style="font-size:0.75rem; text-transform:uppercase; color:var(--text-tertiary); font-weight:700; display:block;">Primary Language</span>
            <strong style="font-size:1.05rem; color:var(--text-primary);">${stats.primary_language || 'General'}</strong>
          </div>
          <div>
            <span style="font-size:0.75rem; text-transform:uppercase; color:var(--text-tertiary); font-weight:700; display:block;">Total Volume</span>
            <strong style="font-size:1.05rem; color:var(--text-primary);">${(stats.total_lines_of_code || 0).toLocaleString()} LOC (${stats.total_files || 0} files)</strong>
          </div>
          <div>
            <span style="font-size:0.75rem; text-transform:uppercase; color:var(--text-tertiary); font-weight:700; display:block;">Security Status</span>
            <strong style="font-size:1.05rem; color:${analysis?.security?.status === 'clean' ? 'var(--success)' : 'var(--warning)'}; text-transform:capitalize;">${analysis?.security?.status || 'Clean'}</strong>
          </div>
          <div>
            <span style="font-size:0.75rem; text-transform:uppercase; color:var(--text-tertiary); font-weight:700; display:block;">Health Rating</span>
            <strong style="font-size:1.05rem; color:var(--primary-500);">${Math.round(analysis?.overall_score || p.health_score || 0)} / 100 (Grade ${analysis?.grade || 'C'})</strong>
          </div>
        </div>
      </div>
    </div>`;

    this.elements.featuresContent.innerHTML = html;
  }

  async loadAuditData() {
    if (!this.elements.auditContent) return;

    if (this.state.project && this.state.project.analysis) {
      this.renderAuditReport(this.state.project.analysis);
      return;
    }

    try {
      const res = await api.getProjectAnalysis(this.projectId);
      if (res.success && res.data) {
        this.renderAuditReport(res.data);
      } else {
        this.elements.auditContent.innerHTML = `
          <div style="text-align: center; padding: 3rem; color: var(--text-secondary);">
            <p>No audit analysis available for this project yet.</p>
          </div>
        `;
      }
    } catch (e) {
      console.warn('Failed to fetch audit data:', e);
      this.elements.auditContent.innerHTML = `
        <div style="text-align: center; padding: 3rem; color: var(--danger);">
          <p>Could not load analysis: ${e.message}</p>
        </div>
      `;
    }
  }

  renderAuditReport(audit) {
    if (!this.elements.auditContent || !audit) return;

    const score = Math.round(audit.overall_score || 0);
    const grade = audit.grade || 'C';
    const gradeLabel = audit.grade_label || 'Standard Evaluation';
    
    // Grade colors
    let gradeBadgeBg = 'var(--primary-500)';
    let gradeBadgeText = '#ffffff';
    if (grade === 'A') { gradeBadgeBg = '#10b981'; }
    else if (grade === 'B') { gradeBadgeBg = '#3b82f6'; }
    else if (grade === 'C') { gradeBadgeBg = '#f59e0b'; }
    else if (grade === 'D') { gradeBadgeBg = '#f97316'; }
    else if (grade === 'F') { gradeBadgeBg = '#ef4444'; }

    const bd = audit.breakdown || {};
    const sec = audit.security || { status: 'clean', findings: [], total_issues: 0 };
    const stats = audit.statistics || {};
    const recs = audit.recommendations || [];

    const formatBytes = (bytes) => {
      if (!bytes) return '0 B';
      const k = 1024, dm = 1;
      const sizes = ['B', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    };

    const renderPillar = (title, data, icon) => {
      if (!data) return '';
      const pScore = data.score || 0;
      const maxScore = data.max_score || 20;
      const pct = Math.round((pScore / maxScore) * 100);
      const barColor = pct >= 80 ? '#10b981' : (pct >= 60 ? '#f59e0b' : '#ef4444');
      const findingsList = (data.findings || []).map(f => {
        const text = typeof f === 'string' ? f : (f.text || f.message || JSON.stringify(f));
        return `<li style="margin-bottom:0.35rem; font-size:0.875rem; color:var(--text-secondary);">${text}</li>`;
      }).join('');

      return `
        <div style="background:var(--bg-secondary); border:1px solid var(--border-medium); border-radius:var(--radius-lg); padding:1.25rem; margin-bottom:1rem;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.5rem;">
            <div style="display:flex; align-items:center; gap:0.5rem;">
              <span style="font-size:1.1rem;">${icon}</span>
              <strong style="font-size:0.95rem; color:var(--text-primary);">${title}</strong>
            </div>
            <span style="font-weight:700; color:var(--text-primary); font-size:0.9rem;">${pScore} / ${maxScore} pts</span>
          </div>
          <div style="width:100%; height:7px; background:var(--gray-200); border-radius:4px; overflow:hidden; margin-bottom:0.75rem;">
            <div style="width:${pct}%; height:100%; background:${barColor}; border-radius:4px; transition:width 0.4s ease;"></div>
          </div>
          <ul style="margin:0; padding-left:1.2rem;">
            ${findingsList || '<li style="font-size:0.85rem; color:var(--text-tertiary);">No specific observations.</li>'}
          </ul>
        </div>
      `;
    };

    // Security Section
    let secHTML = '';
    const hasSecIssues = sec.findings && sec.findings.length > 0;
    if (!hasSecIssues) {
      secHTML = `
        <div style="background:rgba(16, 185, 129, 0.08); border:1px solid rgba(16, 185, 129, 0.3); border-radius:var(--radius-lg); padding:1.25rem; display:flex; align-items:center; gap:1rem; margin-bottom:1.5rem;">
          <div style="font-size:2rem;">🛡️</div>
          <div>
            <h4 style="margin:0 0 0.25rem 0; color:#10b981; font-size:1.05rem;">Clean Security Baseline</h4>
            <p style="margin:0; font-size:0.875rem; color:var(--text-secondary);">Zero hardcoded API secrets, exposed credentials, buffer vulnerabilities, or unsafe execution patterns were detected.</p>
          </div>
        </div>
      `;
    } else {
      const findingsRows = sec.findings.map(f => {
        const isCritical = f.severity === 'critical' || f.severity === 'high';
        const sevBg = isCritical ? '#fee2e2' : '#fef3c7';
        const sevText = isCritical ? '#dc2626' : '#d97706';
        return `
          <div style="border-bottom:1px solid var(--border-light); padding:0.75rem 0;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.25rem;">
              <span style="background:${sevBg}; color:${sevText}; padding:0.2rem 0.5rem; border-radius:4px; font-size:0.75rem; font-weight:700; text-transform:uppercase;">${f.severity}</span>
              <span style="font-family:monospace; font-size:0.8rem; color:var(--text-tertiary);">${f.file}:${f.line}</span>
            </div>
            <p style="margin:0.25rem 0; font-weight:600; font-size:0.875rem; color:var(--text-primary);">${f.category}: ${f.description}</p>
            ${f.preview ? `<pre style="margin:0.25rem 0 0 0; padding:0.4rem 0.6rem; background:rgba(0,0,0,0.06); border-radius:4px; font-size:0.75rem; overflow-x:auto;"><code>${f.preview}</code></pre>` : ''}
          </div>
        `;
      }).join('');

      secHTML = `
        <div style="background:rgba(239, 68, 68, 0.08); border:1px solid rgba(239, 68, 68, 0.3); border-radius:var(--radius-lg); padding:1.25rem; margin-bottom:1.5rem;">
          <div style="display:flex; align-items:center; gap:0.75rem; margin-bottom:1rem;">
            <div style="font-size:1.5rem;">⚠️</div>
            <div>
              <h4 style="margin:0; color:#ef4444; font-size:1.05rem;">Security Warnings Detected (${sec.total_issues})</h4>
              <p style="margin:0; font-size:0.85rem; color:var(--text-secondary);">Potential secrets or dangerous execution patterns flagged in repository files.</p>
            </div>
          </div>
          <div>${findingsRows}</div>
        </div>
      `;
    }

    // Recommendations Section
    let recsHTML = '';
    if (recs && recs.length > 0) {
      recsHTML = `
        <div style="background:var(--bg-secondary); border:1px solid var(--border-medium); border-radius:var(--radius-lg); padding:1.25rem; margin-top:1.5rem;">
          <h4 style="margin:0 0 0.75rem 0; font-size:1rem; color:var(--text-primary); display:flex; align-items:center; gap:0.5rem;">
            <span>💡</span> Actionable Engineering Recommendations
          </h4>
          <ul style="margin:0; padding-left:1.2rem;">
            ${recs.map(r => `<li style="margin-bottom:0.4rem; font-size:0.875rem; color:var(--text-secondary);">${r}</li>`).join('')}
          </ul>
        </div>
      `;
    }

    this.elements.auditContent.innerHTML = `
      <div style="max-width:960px; margin:0 auto; padding-top: 1rem;">
        
        <!-- Top Hero Scorecard -->
        <div style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:1.5rem; background:var(--bg-secondary); border:1px solid var(--border-medium); border-radius:var(--radius-xl); padding:1.75rem; margin-bottom:1.5rem; box-shadow:var(--shadow-sm);">
          <div style="display:flex; align-items:center; gap:1.25rem;">
            <div style="width:72px; height:72px; border-radius:16px; background:${gradeBadgeBg}; color:${gradeBadgeText}; display:flex; flex-direction:column; align-items:center; justify-content:center; font-weight:800; font-size:2rem; box-shadow:0 4px 12px rgba(0,0,0,0.15);">
              ${grade}
            </div>
            <div>
              <div style="display:flex; align-items:baseline; gap:0.5rem;">
                <span style="font-size:2.2rem; font-weight:800; color:var(--text-primary); line-height:1;">${score}</span>
                <span style="color:var(--text-tertiary); font-weight:600; font-size:1.1rem;">/ 100</span>
              </div>
              <p style="margin:0.25rem 0 0 0; font-weight:600; font-size:0.95rem; color:var(--text-secondary);">${gradeLabel}</p>
            </div>
          </div>

          <div style="display:flex; gap:1.5rem; flex-wrap:wrap; border-left:1px solid var(--border-medium); padding-left:1.5rem;">
            <div>
              <span style="display:block; font-size:0.75rem; text-transform:uppercase; color:var(--text-tertiary); font-weight:700;">Files</span>
              <strong style="font-size:1.1rem; color:var(--text-primary);">${stats.total_files || 0}</strong>
            </div>
            <div>
              <span style="display:block; font-size:0.75rem; text-transform:uppercase; color:var(--text-tertiary); font-weight:700;">Lines of Code</span>
              <strong style="font-size:1.1rem; color:var(--text-primary);">${(stats.total_lines_of_code || 0).toLocaleString()}</strong>
            </div>
            <div>
              <span style="display:block; font-size:0.75rem; text-transform:uppercase; color:var(--text-tertiary); font-weight:700;">Primary Stack</span>
              <strong style="font-size:1.1rem; color:var(--text-primary);">${stats.primary_language || 'General'}</strong>
            </div>
            <div>
              <span style="display:block; font-size:0.75rem; text-transform:uppercase; color:var(--text-tertiary); font-weight:700;">Repo Size</span>
              <strong style="font-size:1.1rem; color:var(--text-primary);">${formatBytes(stats.total_size_bytes)}</strong>
            </div>
          </div>
        </div>

        <!-- Security Scanner Findings -->
        ${secHTML}

        <!-- 5 Engineering Quality Pillars -->
        <h3 style="margin:1.5rem 0 1rem 0; font-size:1.15rem; color:var(--text-primary); display:flex; align-items:center; gap:0.5rem;">
          <span>📊</span> Quality Breakdown by Pillar (100 pts)
        </h3>
        ${renderPillar('1. Documentation Quality', bd.documentation, '📝')}
        ${renderPillar('2. Testing & Reliability', bd.testing, '🧪')}
        ${renderPillar('3. Architecture & Organization', bd.architecture, '🏛️')}
        ${renderPillar('4. Configuration & Dependency Management', bd.configuration, '⚙️')}
        ${renderPillar('5. Maintainability & Code Cleanliness', bd.maintainability, '✨')}

        <!-- Actionable Recommendations -->
        ${recsHTML}
      </div>
    `;
  }

  // =========================================================
  // AUTHENTIC GITHUB REPOSITORY BROWSER IMPLEMENTATION
  // =========================================================

  renderDirectory(targetPath = '') {
    this.state.currentPath = targetPath;
    this.state.currentFile = null;

    // Toggle views: Show directory table, hide code viewer
    if (this.elements.githubDirectoryView) this.elements.githubDirectoryView.style.display = 'block';
    if (this.elements.githubCodeView) this.elements.githubCodeView.style.display = 'none';
    if (this.elements.githubBackToFilesBtn) this.elements.githubBackToFilesBtn.style.display = 'none';

    // 1. Render GitHub Breadcrumbs
    this.renderBreadcrumbs(targetPath);

    // 2. Resolve items in target path
    const items = this.getItemsAtPath(this.state.files, targetPath);

    // Sort: Folders first, files second, alphabetical
    items.sort((a, b) => {
      if (a.type === 'folder' && b.type !== 'folder') return -1;
      if (a.type !== 'folder' && b.type === 'folder') return 1;
      return a.name.localeCompare(b.name);
    });

    // 3. Render File Table Rows
    let tableHtml = '';

    // If not root directory, add ".." parent link row
    if (targetPath) {
      const parentParts = targetPath.split('/');
      parentParts.pop();
      const parentPath = parentParts.join('/');
      tableHtml += `
        <tr class="github-file-row parent-row" data-path="${parentPath}">
          <td colspan="3">
            <div class="github-file-name-cell">
              <span class="github-file-icon">📁</span>
              <strong style="color:var(--primary-600);">.. (Up to parent directory)</strong>
            </div>
          </td>
        </tr>
      `;
    }

    let foldersCount = 0;
    let filesCount = 0;

    items.forEach(item => {
      const isDir = item.type === 'folder';
      if (isDir) foldersCount++;
      else filesCount++;

      const icon = this.getFileIcon(item);
      const formattedSize = isDir ? '-' : this.formatBytes(item.size);
      const itemDesc = item.description || (isDir ? 'Folder' : (item.extension ? `${item.extension.toUpperCase()} Source File` : 'File'));

      tableHtml += `
        <tr class="github-file-row" data-type="${item.type}" data-path="${item.path || item.name}">
          <td>
            <div class="github-file-name-cell">
              <span class="github-file-icon">${icon}</span>
              <span>${utils.sanitizeHtml(item.name)}</span>
            </div>
          </td>
          <td>
            <span class="github-file-desc-cell">${utils.sanitizeHtml(itemDesc)}</span>
          </td>
          <td class="github-file-size-cell">
            ${formattedSize}
          </td>
        </tr>
      `;
    });

    if (items.length === 0 && !targetPath) {
      tableHtml = `
        <tr>
          <td colspan="3" style="text-align: center; padding: 2.5rem; color: var(--text-tertiary);">
            No source files uploaded for this project yet.
          </td>
        </tr>
      `;
    }

    if (this.elements.githubFileTableBody) {
      this.elements.githubFileTableBody.innerHTML = tableHtml;

      // Bind row clicks
      this.elements.githubFileTableBody.querySelectorAll('.github-file-row').forEach(row => {
        row.addEventListener('click', () => {
          const isParent = row.classList.contains('parent-row');
          const rowPath = row.getAttribute('data-path');
          const rowType = row.getAttribute('data-type');

          if (isParent) {
            this.renderDirectory(rowPath);
          } else if (rowType === 'folder') {
            this.renderDirectory(rowPath);
          } else {
            const fileItem = this.findFileByPath(this.state.files, rowPath);
            if (fileItem) {
              this.viewFile(fileItem);
            }
          }
        });
      });
    }

    // 4. Update file counts badge
    if (this.elements.repoFilesCount) {
      this.elements.repoFilesCount.textContent = `${foldersCount} folders · ${filesCount} files`;
    }

    // 5. Embedded README.md (render below table when at root)
    if (this.elements.embeddedReadmeCard) {
      if (targetPath === '') {
        const readmeItem = items.find(it => it.type !== 'folder' && it.name.toLowerCase().startsWith('readme'));
        const readmeText = this.state.project.description || '# ' + this.state.project.name;
        if (this.elements.embeddedReadmeBody) {
          this.elements.embeddedReadmeBody.innerHTML = this.parseMarkdown(readmeText);
        }
        this.elements.embeddedReadmeCard.style.display = 'block';
      } else {
        this.elements.embeddedReadmeCard.style.display = 'none';
      }
    }
  }

  renderBreadcrumbs(currentPath, activeFileName = null) {
    if (!this.elements.githubBreadcrumbs) return;

    const projName = this.state.project?.name || 'project';
    let html = `<span class="crumb-link" data-path="">${utils.sanitizeHtml(projName)}</span>`;

    if (currentPath) {
      const parts = currentPath.split('/');
      let accumulated = '';
      parts.forEach((part, idx) => {
        accumulated += (accumulated ? '/' : '') + part;
        const isLast = (idx === parts.length - 1) && !activeFileName;
        html += ` <span class="crumb-divider">/</span> `;
        if (isLast) {
          html += `<span style="color:var(--text-primary); font-weight:700;">${utils.sanitizeHtml(part)}</span>`;
        } else {
          html += `<span class="crumb-link" data-path="${accumulated}">${utils.sanitizeHtml(part)}</span>`;
        }
      });
    }

    if (activeFileName) {
      html += ` <span class="crumb-divider">/</span> <span style="color:var(--text-primary); font-weight:700;">${utils.sanitizeHtml(activeFileName)}</span>`;
    }

    this.elements.githubBreadcrumbs.innerHTML = html;

    // Attach breadcrumb click handlers
    this.elements.githubBreadcrumbs.querySelectorAll('.crumb-link').forEach(link => {
      link.addEventListener('click', () => {
        const p = link.getAttribute('data-path');
        this.renderDirectory(p);
      });
    });
  }

  async viewFile(file) {
    this.state.currentFile = file;
    const parentDir = file.path ? file.path.split('/').slice(0, -1).join('/') : '';

    // Switch view
    if (this.elements.githubDirectoryView) this.elements.githubDirectoryView.style.display = 'none';
    if (this.elements.githubCodeView) this.elements.githubCodeView.style.display = 'block';
    if (this.elements.githubBackToFilesBtn) this.elements.githubBackToFilesBtn.style.display = 'inline-flex';

    // Smoothly scroll code viewer into view
    setTimeout(() => {
      const topBar = document.querySelector('.github-topbar');
      if (topBar) {
        topBar.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else if (this.elements.githubCodeView) {
        this.elements.githubCodeView.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 40);

    // Update breadcrumbs
    this.renderBreadcrumbs(parentDir, file.name);

    if (this.elements.githubActiveFileName) {
      this.elements.githubActiveFileName.textContent = file.name;
    }
    if (this.elements.githubActiveFileMeta) {
      this.elements.githubActiveFileMeta.textContent = 'Fetching file contents...';
    }
    if (this.elements.codeContent) {
      this.elements.codeContent.textContent = '// Loading code...';
    }

    let rawText = '';
    try {
      if (file.download_url) {
        const res = await fetch(file.download_url);
        rawText = await res.text();
      } else {
        const res = await api.getFileContent(this.projectId, file.path || file.name);
        if (res.success && res.data) {
          rawText = res.data.content || '';
        } else {
          rawText = file.content || res.error?.message || 'File content unavailable.';
        }
      }
    } catch (e) {
      rawText = '// Failed to load file: ' + e.message;
    }

    this.state.activeFileRawText = rawText;

    if (this.elements.codeContent) {
      this.elements.codeContent.textContent = rawText;
      const ext = file.name.split('.').pop().toLowerCase();
      this.elements.codeContent.className = `hljs language-${ext}`;

      if (window.hljs) {
        hljs.highlightElement(this.elements.codeContent);
        if (window.hljs.lineNumbersBlock) {
          hljs.lineNumbersBlock(this.elements.codeContent);
        }
      }
    }

    const linesCount = rawText ? rawText.split('\n').length : 0;
    const byteSize = new Blob([rawText]).size;
    if (this.elements.githubActiveFileMeta) {
      this.elements.githubActiveFileMeta.textContent = `${linesCount} lines · ${this.formatBytes(byteSize)}`;
    }
  }

  getItemsAtPath(tree, targetPath) {
    if (!targetPath) return tree || [];
    const parts = targetPath.split('/');
    let current = tree;
    for (const part of parts) {
      const found = current.find(item => item.name === part && item.type === 'folder');
      if (found && found.children) {
        current = found.children;
      } else {
        return [];
      }
    }
    return current || [];
  }

  findFileByPath(tree, path) {
    for (const item of tree) {
      if ((item.path && item.path.replace(/\\/g, '/') === path.replace(/\\/g, '/')) || item.name === path) {
        return item;
      }
      if (item.children) {
        const found = this.findFileByPath(item.children, path);
        if (found) return found;
      }
    }
    return null;
  }

  getFileIcon(item) {
    if (item.type === 'folder') return '📁';
    const ext = (item.extension || item.name.split('.').pop() || '').toLowerCase();
    
    switch (ext) {
      case 'cpp':
      case 'c':
      case 'cc':
      case 'cxx':
      case 'h':
      case 'hpp':
      case 'tpp':
        return '⚙️';
      case 'py':
        return '🐍';
      case 'js':
      case 'jsx':
      case 'mjs':
        return '⚡';
      case 'ts':
      case 'tsx':
        return '📘';
      case 'html':
      case 'htm':
      case 'css':
      case 'scss':
        return '🎨';
      case 'json':
      case 'yaml':
      case 'yml':
      case 'toml':
        return '📋';
      case 'md':
      case 'markdown':
      case 'txt':
        return '📄';
      case 'sh':
      case 'bat':
      case 'cmd':
        return '🐚';
      default:
        return '📄';
    }
  }

  formatBytes(bytes) {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  parseMarkdown(md) {
    if (!md) return '';
    try {
      if (window.marked) {
        return window.marked.parse(md);
      }
    } catch (e) {
      console.warn('Marked parsing error:', e);
    }
    return md;
  }

  showLoading() { 
    this.elements.content.classList.add('d-none'); 
    this.elements.errorState.classList.add('d-none'); 
    this.elements.loadingState.classList.remove('d-none'); 
  }
  
  showError(msg) { 
    this.elements.content.classList.add('d-none'); 
    this.elements.loadingState.classList.add('d-none'); 
    this.elements.errorState.classList.remove('d-none'); 
    this.elements.errorMessage.textContent = msg; 
  }
  
  hideStates() { 
    this.elements.loadingState.classList.add('d-none'); 
    this.elements.errorState.classList.add('d-none'); 
  }
}

document.addEventListener('DOMContentLoaded', () => { window.app = new ProjectApp(); });
