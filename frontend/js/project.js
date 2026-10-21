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
      themeToggle: utils.$('#themeToggle')
    };
  }

  async initializeApp() {
    if (!this.projectId) {
      this.showError('No project ID specified.');
      return;
    }
    
    // Theme setup
    if (this.elements.themeToggle) {
      const isDark = localStorage.getItem('theme') === 'dark';
      if (isDark) { 
        document.documentElement.setAttribute('data-theme', 'dark'); 
        this.elements.themeToggle.checked = true;
      } else {
        this.elements.themeToggle.checked = false;
      }
      this.elements.themeToggle.addEventListener('change', (e) => {
        if (e.target.checked) {
          document.documentElement.setAttribute('data-theme', 'dark');
          localStorage.setItem('theme', 'dark');
        } else {
          document.documentElement.removeAttribute('data-theme');
          localStorage.setItem('theme', 'light');
        }
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
      if (this.isLocal) {
        this.elements.downloadBtn.href = `http://localhost:5000/api/v1/projects/${p.id}/download`;
        this.elements.downloadBtn.classList.remove('d-none');
      } else if (p.github_url) {
        const match = p.github_url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
        if (match) {
          const repo = match[2].replace('.git', '');
          this.elements.downloadBtn.href = `https://github.com/${match[1]}/${repo}/archive/refs/heads/main.zip`;
          this.elements.downloadBtn.classList.remove('d-none');
        }
      }
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

    // Markdown content parsing
    const rawReadme = p.description || '# ' + p.name + '\nNo documentation found.';
    const parsedMd = this.parseMarkdown(rawReadme);
    if (this.elements.readmeContent) this.elements.readmeContent.innerHTML = parsedMd;

    // Setup / How to Run extraction
    const runContentMatch = rawReadme.match(/##\s*(?:How to Run|Setup Instructions|Installation|Build Instructions|Getting Started)[^#]*(?:(?=##)|$)/i);
    if (this.elements.howToRunContent) {
      this.elements.howToRunContent.innerHTML = runContentMatch ? 
        this.parseMarkdown(runContentMatch[0]) : 
        '<p style="color:var(--text-secondary);">Clone or download the source repository, then run the build commands specified in the README.</p>';
    }

    // Features extraction
    const featuresMatch = rawReadme.match(/##\s*Features[^#]*(?:(?=##)|$)/i);
    if (this.elements.featuresContent) {
      this.elements.featuresContent.innerHTML = featuresMatch ? 
        this.parseMarkdown(featuresMatch[0]) : 
        '<p style="color:var(--text-secondary);">Interactive code indexing, AST parsing, and verification.</p>';
    }
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
      const itemDesc = isDir ? 'Folder' : (item.extension ? `${item.extension.toUpperCase()} Source File` : 'File');

      tableHtml += `
        <tr class="github-file-row" data-type="${item.type}" data-path="${item.path || item.name}">
          <td>
            <div class="github-file-name-cell">
              <span class="github-file-icon">${icon}</span>
              <span>${utils.sanitizeHtml(item.name)}</span>
            </div>
          </td>
          <td>
            <span class="github-file-desc-cell">${itemDesc}</span>
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
