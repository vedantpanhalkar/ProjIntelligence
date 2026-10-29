/**
 * Dashboard Main Application
 * Handles dashboard logic, search, filters, and data loading
 */

class DashboardApp {
  constructor() {
    this.state = {
      projects: [],
      filteredProjects: [],
      currentPage: 1,
      itemsPerPage: 12,
      totalPages: 1,
      searchQuery: '',
      filters: {
        category: '',
        language: '',
        grade: '',
        sortBy: 'health_score'
      },
      isLoading: false,
      error: null
    };

    window.app = this;
    this.elements = this.initializeElements();
    this.initializeApp();
  }

  /**
   * Initialize DOM element references
   */
  initializeElements() {
    return {
      // Search & Filters
      searchInput: utils.$('#searchInput'),
      categoryFilter: utils.$('#categoryFilter'),
      languageFilter: utils.$('#languageFilter'),
      gradeFilter: utils.$('#gradeFilter'),
      sortBy: utils.$('#sortBy'),
      resetFilters: utils.$('#resetFilters'),
      
      // Content areas
      statsGrid: utils.$('#statsGrid'),
      projectsGrid: utils.$('#projectsGrid'),
      resultsTitle: utils.$('#resultsTitle'),
      resultsCount: utils.$('#resultsCount'),
      
      // States
      emptyState: utils.$('#emptyState'),
      errorState: utils.$('#errorState'),
      pagination: utils.$('#pagination'),
      
      // Admin controls
      adminLink: utils.$('#adminLink'),
      loginBtn: utils.$('#loginBtn')
    };
  }

  /**
   * Initialize the application
   */
  async initializeApp() {
    try {
      // Initialize components
      this.initializeEventListeners();
      this.initializeSearch();
      this.initializeTheme();
      
      // Check admin status
      await this.checkAdminStatus();
      
      // Load initial data
      await this.loadInitialData();
      
    } catch (error) {
      console.error('Failed to initialize dashboard:', error);
      this.showError('Failed to initialize dashboard');
    }
  }

  /**
   * Initialize all event listeners
   */
  initializeEventListeners() {
    // Filter change handlers
    ['categoryFilter', 'languageFilter', 'gradeFilter', 'sortBy'].forEach(filterId => {
      const element = this.elements[filterId];
      if (element) {
        element.addEventListener('change', (e) => {
          this.updateFilter(filterId.replace('Filter', '').replace('sortBy', 'sortBy'), e.target.value);
        });
      }
    });

    // Reset filters
    if (this.elements.resetFilters) {
      this.elements.resetFilters.addEventListener('click', () => {
        this.resetAllFilters();
      });
    }

    // Admin login/logout
    if (this.elements.loginBtn) {
      this.elements.loginBtn.addEventListener('click', () => {
        if (this.elements.loginBtn.textContent === 'Logout') {
          this.handleLogout();
        } else {
          components.navigateToLogin();
        }
      });
    }

    // Admin panel link
    if (this.elements.adminLink) {
      this.elements.adminLink.addEventListener('click', (e) => {
        e.preventDefault();
        components.navigateToAdmin();
      });
    }

    // Retry error state
    const retryBtn = utils.$('#retryLoad');
    if (retryBtn) {
      retryBtn.addEventListener('click', () => {
        this.loadInitialData();
      });
    }

    // Reset from empty state
    const resetFromEmpty = utils.$('#resetFromEmpty');
    if (resetFromEmpty) {
      resetFromEmpty.addEventListener('click', () => {
        this.resetAllFilters();
      });
    }

    // Search suggestion pills (empty state clicks)
    document.addEventListener('click', (e) => {
      const pill = e.target.closest('.search-pill');
      if (pill) {
        const query = pill.getAttribute('data-query');
        if (query) {
          if (this.elements.searchInput) {
            this.elements.searchInput.value = query;
          }
          this.updateSearch(query);
          this.loadProjects();
          this.updateResultsInfo();
        }
      }
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.resetAllFilters();
      }
    });
  }

  /**
   * Initialize search functionality
   */
  initializeSearch() {
    components.initializeSearch((query) => {
      this.updateSearch(query);
    });
  }

  /**
   * Initialize theme toggle
   */
  initializeTheme() {
    components.initializeThemeToggle();
  }

  /**
   * Check if user is admin
   */
  async checkAdminStatus() {
    const isAdmin = await api.isAdmin();
    
    if (this.elements.adminLink) {
      this.elements.adminLink.style.display = isAdmin ? 'block' : 'none';
    }
    
    if (this.elements.loginBtn) {
      this.elements.loginBtn.textContent = isAdmin ? 'Logout' : 'Admin Login';
    }
  }

  /**
   * Load initial dashboard data
   */
  async loadInitialData() {
    this.setState({ isLoading: true, error: null });

    try {
      // Load statistics and filter options in parallel
      const [statsResult, filtersResult] = await Promise.all([
        api.getStatistics(),
        api.getFilterOptions()
      ]);

      if (statsResult.success) {
        this.renderStatistics(statsResult.data.statistics || statsResult.data);
      }

      if (filtersResult.success) {
        this.populateFilters(filtersResult.data.filter_options || filtersResult.data);
      }

      // Load projects
      await this.loadProjects(true);

    } catch (error) {
      console.error('Error loading initial data:', error);
      this.showError('Failed to load dashboard data');
    } finally {
      this.setState({ isLoading: false });
    }
  }

  /**
   * Load projects with current filters
   */
  async loadProjects(force = false) {
    if (this.state.isLoading && !force) return;

    this.setState({ isLoading: true });
    this.showProjectsSkeleton();

    try {
      const params = {
        page: this.state.currentPage,
        limit: this.state.itemsPerPage,
        ...this.state.filters
      };

      // Use search if query exists, otherwise get projects
      const result = this.state.searchQuery 
        ? await api.searchProjects(this.state.searchQuery, params)
        : await api.getProjects(params);

      if (result.success) {
        const { projects, pagination } = result.data;
        
        this.setState({
          projects,
          filteredProjects: projects,
          totalPages: pagination?.total_pages || Math.ceil(projects.length / this.state.itemsPerPage)
        });

        this.renderProjects();
        this.updateResultsInfo();
        
        if (projects.length === 0 && this.hasActiveFilters()) {
          this.showEmptyState();
        }
      } else {
        throw new Error(result.error);
      }

    } catch (error) {
      console.error('Error loading projects:', error);
      this.showError(error.message);
    } finally {
      this.setState({ isLoading: false });
    }
  }

  /**
   * Render statistics cards
   */
  renderStatistics(stats) {
    if (!this.elements.statsGrid) return;

    const statCards = [
      {
        icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
              </svg>`,
        label: 'Total Projects',
        value: stats.total_projects || 0,
        change: stats.projects_growth || 0
      },
      {
        icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>`,
        label: 'Avg Health Score',
        value: Math.round(stats.average_health_score || 0),
        change: null
      },
      {
        icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0L19.2 12l-4.6-4.6L16 6l6 6-6 6-1.4-1.4z"/>
              </svg>`,
        label: 'Languages',
        value: stats.total_languages || 0,
        change: null
      },
      {
        icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>`,
        label: 'Total Stars',
        value: stats.total_stars || 0,
        change: null
      }
    ];

    this.elements.statsGrid.innerHTML = '';
    
    statCards.forEach((stat, index) => {
      const card = components.createStatCard(stat);
      card.style.animationDelay = `${index * 100}ms`;
      this.elements.statsGrid.appendChild(card);
    });
  }

  /**
   * Populate filter dropdowns
   */
  populateFilters(filters) {
    const { categories = [], languages = [], technologies = [] } = filters;
    const availableLangs = (languages && languages.length > 0) ? languages : technologies;
    
    if (this.elements.categoryFilter) {
      components.populateFilterSelect(
        this.elements.categoryFilter, 
        categories, 
        'All Categories'
      );
    }

    if (this.elements.languageFilter) {
      components.populateFilterSelect(
        this.elements.languageFilter, 
        availableLangs, 
        'All Languages'
      );
    }
  }

  /**
   * Render projects grid
   */
  renderProjects() {
    if (!this.elements.projectsGrid) return;

    this.elements.projectsGrid.innerHTML = '';

    if (this.state.projects.length === 0) {
      this.showEmptyState();
      return;
    }

    this.elements.projectsGrid.style.display = 'grid';
    this.hideStates();

    this.state.projects.forEach((project, index) => {
      const card = components.createProjectCard(project);
      card.style.animationDelay = `${index * 50}ms`;
      this.elements.projectsGrid.appendChild(card);
    });

    // Update pagination
    components.createPagination(
      this.state.currentPage,
      this.state.totalPages,
      (page) => this.changePage(page)
    );
  }

  /**
   * Show projects loading skeleton
   */
  showProjectsSkeleton() {
    if (!this.elements.projectsGrid) return;

    utils.showSkeleton(this.elements.projectsGrid, 6);
    this.hideStates();
  }

  /**
   * Show empty state
   */
  showEmptyState() {
    if (!this.elements.emptyState || !this.elements.projectsGrid) return;

    this.elements.projectsGrid.style.display = 'none';
    this.elements.emptyState.style.display = 'flex';
    this.elements.errorState.style.display = 'none';
    this.elements.pagination.style.display = 'none';
  }

  /**
   * Show error state
   */
  showError(message) {
    if (!this.elements.errorState || !this.elements.projectsGrid) return;

    this.elements.projectsGrid.style.display = 'none';
    this.elements.emptyState.style.display = 'none';
    this.elements.errorState.style.display = 'flex';
    this.elements.pagination.style.display = 'none';

    const errorMessage = utils.$('#errorMessage');
    if (errorMessage) {
      errorMessage.textContent = message;
    }

    utils.toast.error(message);
  }

  /**
   * Hide all states
   */
  hideStates() {
    if (this.elements.emptyState) this.elements.emptyState.style.display = 'none';
    if (this.elements.errorState) this.elements.errorState.style.display = 'none';
    if (this.elements.projectsGrid) this.elements.projectsGrid.style.display = '';
  }

  /**
   * Update search query and reload
   */
  updateSearch(query) {
    if (this.state.searchQuery === query) return;

    this.setState({ 
      searchQuery: query,
      currentPage: 1
    });

    this.loadProjects();
    this.updateResultsInfo();
  }

  /**
   * Update filter and reload
   */
  updateFilter(filterName, value) {
    this.setState({
      filters: { ...this.state.filters, [filterName]: value },
      currentPage: 1
    });

    this.loadProjects();
    this.updateResultsInfo();
  }

  /**
   * Reset all filters
   */
  resetAllFilters() {
    // Reset state
    this.setState({
      searchQuery: '',
      currentPage: 1,
      filters: {
        category: '',
        language: '',
        grade: '',
        sortBy: 'health_score'
      }
    });

    // Reset UI elements
    if (this.elements.searchInput) this.elements.searchInput.value = '';
    if (this.elements.categoryFilter) this.elements.categoryFilter.value = '';
    if (this.elements.languageFilter) this.elements.languageFilter.value = '';
    if (this.elements.gradeFilter) this.elements.gradeFilter.value = '';
    if (this.elements.sortBy) this.elements.sortBy.value = 'health_score';

    const clearBtn = utils.$('#clearSearch');
    if (clearBtn) clearBtn.style.display = 'none';

    this.loadProjects();
    this.updateResultsInfo();

    utils.toast.info('Filters cleared');
  }

  /**
   * Change page
   */
  changePage(page) {
    if (page < 1 || page > this.state.totalPages || page === this.state.currentPage) {
      return;
    }

    this.setState({ currentPage: page });
    this.loadProjects();
    
    // Smooth scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /**
   * Update results information
   */
  updateResultsInfo() {
    if (this.elements.resultsTitle) {
      let title = 'All Projects';
      if (this.state.searchQuery) {
        title = `Search: "${this.state.searchQuery}"`;
      } else if (this.hasActiveFilters()) {
        title = 'Filtered Projects';
      }
      this.elements.resultsTitle.textContent = title;
    }

    if (this.elements.resultsCount) {
      const count = this.state.projects.length;
      const total = this.state.totalPages * this.state.itemsPerPage;
      this.elements.resultsCount.textContent = 
        count === 1 ? '1 project' : `${utils.formatNumber(count)} projects`;
    }
  }

  /**
   * Check if any filters are active
   */
  hasActiveFilters() {
    return Object.values(this.state.filters).some(value => value !== '' && value !== 'health_score') ||
           this.state.searchQuery !== '';
  }

  /**
   * Handle logout
   */
  async handleLogout() {
    try {
      await api.adminLogout();
      await this.checkAdminStatus();
      utils.toast.success('Logged out successfully');
    } catch (error) {
      utils.toast.error('Failed to logout');
    }
  }

  /**
   * Update application state
   */
  setState(updates) {
    this.state = { ...this.state, ...updates };
  }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.dashboardApp = new DashboardApp();
});