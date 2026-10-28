/**
 * Reusable UI Components
 */

// ========== PROJECT CARD COMPONENT ==========

/**
 * Create a project card element
 */
const createProjectCard = (project) => {
  if (!project) return document.createElement('div');

  const { 
    id, name = 'Untitled Project', description = '', health_score = 0, 
    stars, forks, github_stars, github_forks, languages = [], 
    technologies = [], categories = [], created_at, verified, status = 'active' 
  } = project;

  const totalStars = stars ?? github_stars ?? 0;
  const totalForks = forks ?? github_forks ?? 0;

  const grade = utils?.getHealthGrade ? utils.getHealthGrade(health_score || 0) : 'A';
  const gradeClass = utils?.getGradeColorClass ? utils.getGradeColorClass(grade) : 'grade-a';

  // Consolidate & deduplicate tags from technologies and languages
  const safeLangs = Array.isArray(languages) ? languages : [];
  const safeTechs = Array.isArray(technologies) ? technologies : [];
  const allTags = [];

  safeLangs.forEach(lang => {
    const tagName = typeof lang === 'string' ? lang : (lang?.name || '');
    if (tagName && !allTags.some(t => t.name.toLowerCase() === tagName.toLowerCase())) {
      allTags.push({ name: tagName, color: lang?.color, icon: lang?.icon });
    }
  });

  safeTechs.forEach(tech => {
    const tagName = typeof tech === 'string' ? tech : (tech?.name || '');
    if (tagName && !allTags.some(t => t.name.toLowerCase() === tagName.toLowerCase())) {
      allTags.push({ name: tagName, color: tech?.color, icon: tech?.icon });
    }
  });

  const maxDisplayTags = 3;
  const displayTags = allTags.slice(0, maxDisplayTags);
  const remainingCount = allTags.length - displayTags.length;

  const tagsHtml = displayTags.map(tag => 
    `<span class="badge">${utils?.sanitizeHtml ? utils.sanitizeHtml(tag.name) : tag.name}</span>`
  ).join('') + (remainingCount > 0 ? `<span class="badge badge--more">+${remainingCount} more</span>` : '');
  
  const card = utils?.createElement ? utils.createElement('article', {
    className: 'project-card',
    'data-project-id': id || '',
    role: 'button',
    tabindex: '0',
    'aria-label': `View details for ${name}`
  }) : document.createElement('article');

  if (!card.className) card.className = 'project-card';
  card.setAttribute('data-project-id', id || '');
  card.setAttribute('role', 'button');
  card.setAttribute('tabindex', '0');
  card.setAttribute('aria-label', `View details for ${name}`);

  const isAvailable = (status === 'active' || status === 'completed');
  const projectDetailUrl = id ? `project-detail.html?id=${id}` : '#';

  const cleanTitle = utils?.sanitizeHtml ? utils.sanitizeHtml(name) : name;
  const cleanDesc = utils?.truncateText ? 
    utils.truncateText(utils.sanitizeHtml(description || 'No description available'), 120) : 
    (description || 'No description available').slice(0, 120);

  const formattedStars = utils?.formatNumber ? utils.formatNumber(totalStars) : totalStars;
  const formattedForks = utils?.formatNumber ? utils.formatNumber(totalForks) : totalForks;

  card.innerHTML = `
    <div class="project-card__header">
      <div class="project-card__title-section">
        <h3 class="project-card__title">${cleanTitle}</h3>
        ${verified ? '<span class="badge badge--success">Verified</span>' : ''}
      </div>
      <div class="project-card__health">
        <div class="badge badge--grade badge--${gradeClass}">${grade}</div>
      </div>
    </div>

    <p class="project-card__description">${cleanDesc}</p>

    <div class="project-card__tags">
      ${tagsHtml}
    </div>

    <div class="project-card__meta">
      <div class="project-card__stat">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <path d="M8 .25a.75.75 0 01.673.418l1.882 3.815 4.21.612a.75.75 0 01.416 1.279l-3.046 2.97.719 4.192a.75.75 0 01-1.088.791L8 12.347l-3.766 1.98a.75.75 0 01-1.088-.79l.72-4.194L.818 6.374a.75.75 0 01.416-1.28l4.21-.611L7.327.668A.75.75 0 018 .25z"/>
        </svg>
        ${formattedStars}
      </div>
      <div class="project-card__stat">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <path d="M5 3.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm0 2.122a2.25 2.25 0 10-1.5 0v.878A2.25 2.25 0 005.75 8.5h1.5v2.128a2.25 2.25 0 101.5 0V8.5h1.5a2.25 2.25 0 002.25-2.25v-.878a2.25 2.25 0 10-1.5 0v.878a.75.75 0 01-.75.75h-4.5A.75.75 0 015 6.25v-.878z"/>
        </svg>
        ${formattedForks}
      </div>
      <div class="project-card__status">
        ${isAvailable 
          ? `<span class="badge badge--success">Available</span>` 
          : `<span class="badge" style="background: var(--warning-bg); color: var(--warning);">Coming Soon</span>`}
      </div>
      <a href="${isAvailable ? projectDetailUrl : '#'}" class="btn btn--primary project-card__action${!isAvailable ? ' btn--disabled' : ''}">
        View Project
      </a>
    </div>
  `;

  // Click & keyboard handlers
  const handleCardNavigate = () => {
    if (isAvailable && id) {
      if (typeof navigateToProject === 'function') {
        navigateToProject(id);
      } else if (window.components?.navigateToProject) {
        window.components.navigateToProject(id);
      } else {
        window.location.href = projectDetailUrl;
      }
    }
  };

  card.addEventListener('click', (e) => {
    // If user clicked the button link or inside it, let link handle it natively without double navigation
    if (e.target.closest('a')) return;
    handleCardNavigate();
  });

  card.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      if (e.target.closest('a')) return;
      e.preventDefault();
      handleCardNavigate();
    }
  });

  return card;
};

// ========== PAGINATION COMPONENT ==========

/**
 * Create pagination controls
 */
const createPagination = (currentPage, totalPages, onPageChange) => {
  const container = utils.$('#pagination');
  if (!container) return;

  if (totalPages <= 1) {
    container.style.display = 'none';
    return;
  }

  container.style.display = 'flex';

  const prevBtn = utils.$('#prevPage');
  const nextBtn = utils.$('#nextPage');
  const pagesContainer = utils.$('#paginationPages');

  // Update prev button
  prevBtn.disabled = currentPage === 1;
  prevBtn.onclick = () => currentPage > 1 && onPageChange(currentPage - 1);

  // Update next button
  nextBtn.disabled = currentPage === totalPages;
  nextBtn.onclick = () => currentPage < totalPages && onPageChange(currentPage + 1);

  // Create page numbers
  pagesContainer.innerHTML = '';
  
  const createPageButton = (page, isActive = false) => {
    const btn = utils.createElement('button', {
      className: `pagination__page ${isActive ? 'pagination__page--active' : ''}`,
      textContent: page,
      'aria-label': `Go to page ${page}`,
      'aria-current': isActive ? 'page' : 'false'
    });
    
    btn.addEventListener('click', () => onPageChange(page));
    return btn;
  };

  // Show pages with ellipsis logic
  let pages = [];
  
  if (totalPages <= 7) {
    // Show all pages
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
  } else {
    // Show first page, ellipsis, current area, ellipsis, last page
    pages.push(1);
    
    if (currentPage > 4) {
      pages.push('...');
    }
    
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    if (currentPage < totalPages - 3) {
      pages.push('...');
    }
    
    if (totalPages > 1) {
      pages.push(totalPages);
    }
  }

  pages.forEach(page => {
    if (page === '...') {
      const ellipsis = utils.createElement('span', {
        className: 'pagination__ellipsis',
        textContent: '...'
      });
      pagesContainer.appendChild(ellipsis);
    } else {
      const btn = createPageButton(page, page === currentPage);
      pagesContainer.appendChild(btn);
    }
  });
};

// ========== STATISTICS COMPONENT ==========

/**
 * Create statistics card
 */
const createStatCard = ({ icon, label, value, change }) => {
  const card = utils.createElement('div', {
    className: 'stat-card'
  });

  card.innerHTML = `
    <div class="stat-card__icon">
      ${icon}
    </div>
    <div class="stat-card__content">
      <div class="stat-card__label">${label}</div>
      <div class="stat-card__value">${utils.formatNumber(value)}</div>
      ${change ? `<div class="stat-card__change">+${change}% this month</div>` : ''}
    </div>
  `;

  return card;
};

// ========== FILTER COMPONENT ==========

/**
 * Populate filter select options
 */
const populateFilterSelect = (selectElement, options, placeholder = 'All') => {
  selectElement.innerHTML = `<option value="">${placeholder}</option>`;
  
  options.forEach(option => {
    const optionElement = utils.createElement('option', {
      value: option.value || option,
      textContent: option.label || option
    });
    selectElement.appendChild(optionElement);
  });
};

// ========== NAVIGATION ==========

/**
 * Navigate to project detail page
 */
const navigateToProject = (projectId) => {
  // Add smooth transition effect
  document.body.style.opacity = '0.8';
  document.body.style.transition = 'opacity 200ms ease-out';
  
  setTimeout(() => {
    window.location.href = `project-detail.html?id=${projectId}`;
  }, 100);
};

/**
 * Navigate to admin panel
 */
const navigateToAdmin = () => {
  window.location.href = 'admin.html';
};

/**
 * Navigate to login page
 */
const navigateToLogin = () => {
  window.location.href = 'admin.html';
};

// ========== THEME TOGGLE ==========

/**
 * Initialize theme toggle functionality
 */
const initializeThemeToggle = () => {
  if (window.ProjTheme) {
    window.ProjTheme.init();
    return;
  }
  const themeToggle = utils.$('#themeToggle');
  if (!themeToggle) return;

  const savedTheme = utils.storage.get('theme', 'light');
  document.documentElement.setAttribute('data-theme', savedTheme);
  themeToggle.checked = (savedTheme === 'dark');

  themeToggle.addEventListener('change', (e) => {
    const next = e.target.checked ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', next);
    utils.storage.set('theme', next);
  });
};

// ========== SEARCH ENHANCEMENTS ==========

/**
 * Initialize search input with enhancements
 */
const initializeSearch = (onSearch) => {
  const searchInput = utils.$('#searchInput');
  const clearBtn = utils.$('#clearSearch');
  
  if (!searchInput) return;

  // Debounced search function
  const debouncedSearch = utils.debounce(onSearch, 300);

  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.trim();
    
    // Show/hide clear button
    if (clearBtn) {
      clearBtn.style.display = query ? 'flex' : 'none';
    }
    
    debouncedSearch(query);
  });

  // Clear search
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      searchInput.value = '';
      clearBtn.style.display = 'none';
      onSearch('');
      searchInput.focus();
    });
  }

  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      searchInput.focus();
    }
  });
};

// Export components
window.components = {
  createProjectCard,
  createPagination,
  createStatCard,
  populateFilterSelect,
  navigateToProject,
  navigateToAdmin,
  navigateToLogin,
  initializeThemeToggle,
  initializeSearch
};