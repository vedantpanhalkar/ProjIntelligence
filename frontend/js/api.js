/**
 * API Client - Modern fetch-based HTTP client
 * Handles all communication with backend REST API
 */

class APIClient {
  constructor(baseURL) {
    if (!baseURL) {
      const host = (typeof window !== 'undefined' && window.location && window.location.hostname) ? window.location.hostname : 'localhost';
      baseURL = `http://${host}:5000/api/v1`;
    }
    this.baseURL = baseURL;
    this.token = this.getToken();
  }

  /**
   * Get stored JWT token
   */
  getToken() {
    return localStorage.getItem('jwt_token');
  }

  /**
   * Set JWT token
   */
  setToken(token) {
    if (token) {
      localStorage.setItem('jwt_token', token);
      this.token = token;
    } else {
      localStorage.removeItem('jwt_token');
      this.token = null;
    }
  }

  /**
   * Build headers for requests
   */
  getHeaders(isJSON = true) {
    const headers = {};
    
    if (isJSON) {
      headers['Content-Type'] = 'application/json';
    }
    
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    
    return headers;
  }

  /**
   * Generic request handler
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      ...options,
      headers: this.getHeaders(options.isJSON !== false),
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        const errorMsg = data.error?.message || data.message || `HTTP ${response.status}: ${response.statusText}`;
        throw new Error(errorMsg);
      }

      // Backend already returns { success: boolean, data: any }
      return data.success !== undefined ? data : { success: true, data };
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error);
      return { 
        success: false, 
        error: { message: error.message || 'Network error occurred' }
      };
    }
  }

  /**
   * GET request
   */
  async get(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    
    return this.request(url, { method: 'GET' });
  }

  /**
   * POST request
   */
  async post(endpoint, body = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  /**
   * PUT request
   */
  async put(endpoint, body = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  /**
   * DELETE request
   */
  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }

  // ========== PROJECT ENDPOINTS ==========

  /**
   * Get all projects with filters and pagination
   */
  async getProjects(params = {}) {
    return this.get('/projects', params);
  }

  /**
   * Get single project by ID
   */
  async getProject(id) {
    return this.get(`/projects/${id}`);
  }

  /**
   * Search projects
   */
  async searchProjects(query, filters = {}) {
    return this.get('/projects/search', { q: query, ...filters });
  }

  /**
   * Get project file structure
   */
  async getProjectFiles(id, path = '') {
    return this.get(`/projects/${id}/files`, { path });
  }

  /**
   * Get content of a specific file
   */
  async getFileContent(id, path) {
    return this.get(`/projects/${id}/file-content`, { path });
  }

  /**
   * Get project analysis summary
   */
  async getProjectAnalysis(id) {
    return this.get(`/projects/${id}/analysis-summary`);
  }

  /**
   * Get filter options (categories, languages, technologies)
   */
  async getFilterOptions() {
    return this.get('/projects/filter-options');
  }

  /**
   * Get platform statistics
   */
  async getStatistics() {
    return this.get('/projects/statistics');
  }

  /**
   * Create new project (admin only)
   */
  async createProject(projectData) {
    return this.post('/admin/projects', projectData);
  }

  /**
   * Upload project with folder or zip (admin only)
   */
  async uploadProject(formData) {
    return this.request('/admin/projects/upload', {
      method: 'POST',
      body: formData,
      isJSON: false
    });
  }

  /**
   * Update project (admin only)
   */
  async updateProject(id, projectData) {
    return this.put(`/admin/projects/${id}`, projectData);
  }

  /**
   * Delete project (admin only)
   */
  async deleteProject(id) {
    return this.delete(`/admin/projects/${id}`);
  }

  // ========== ADMIN ENDPOINTS ==========

  /**
   * Admin login
   */
  async adminLogin(username, password) {
    const result = await this.post('/admin/login', { username, password });
    
    if (result.success && result.data.token) {
      this.setToken(result.data.token);
    }
    
    return result;
  }

  /**
   * Admin logout
   */
  async adminLogout() {
    const result = await this.post('/admin/logout');
    this.setToken(null);
    return result;
  }

  /**
   * Get current admin info
   */
  async getAdminMe() {
    return this.get('/admin/me');
  }

  /**
   * Check if user is logged in as admin
   */
  async isAdmin() {
    if (!this.token) return false;
    
    const result = await this.getAdminMe();
    return result.success;
  }

  // ========== DASHBOARD ENDPOINTS ==========

  /**
   * Get dashboard overview
   */
  async getDashboardOverview(filters = {}) {
    return this.get('/admin/dashboard/overview', filters);
  }

  /**
   * Get system statistics
   */
  async getDashboardStats() {
    return this.get('/admin/dashboard/stats');
  }

  /**
   * Get recent activity
   */
  async getRecentActivity(limit = 30) {
    return this.get('/admin/dashboard/activity', { limit });
  }

  /**
   * Create project (admin only)
   */
  async createProject(data) {
    return this.post('/admin/projects', data);
  }

  /**
   * Update project (admin only)
   */
  async updateProject(id, data) {
    return this.put(`/admin/projects/${id}`, data);
  }

  /**
   * Delete project (admin only)
   */
  async deleteProject(id) {
    return this.delete(`/admin/projects/${id}`);
  }


  // ========== GITHUB ENDPOINTS ==========

  /**
   * Fetch repository from GitHub
   */
  async fetchGitHubRepo(repoUrl) {
    return this.post('/github/fetch', { repo_url: repoUrl });
  }

  // ========== ANALYSIS ENDPOINTS ==========

  /**
   * Trigger health score analysis
   */
  async analyzeHealthScore(projectId) {
    return this.post('/analysis/health-score', { project_id: projectId });
  }

  /**
   * Trigger lexical analysis
   */
  async analyzeLexical(projectPath) {
    return this.post('/analysis/lexical', { project_path: projectPath });
  }

  /**
   * Trigger AST analysis
   */
  async analyzeAST(projectPath) {
    return this.post('/analysis/ast', { project_path: projectPath });
  }

  /**
   * Trigger semantic analysis
   */
  async analyzeSemantic(projectPath) {
    return this.post('/analysis/semantic', { project_path: projectPath });
  }

  // ========== HEALTH CHECK ==========

  /**
   * Check API health
   */
  async healthCheck() {
    return this.get('/health');
  }
}

// Create and export global API instance
const api = new APIClient();
