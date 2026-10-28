/**
 * Utility Functions - Modern ES6+ helpers
 */

// ========== DOM UTILITIES ==========

/**
 * Query selector with error handling
 */
const $ = (selector, context = document) => {
  return context.querySelector(selector);
};

/**
 * Query selector all with array conversion
 */
const $$ = (selector, context = document) => {
  return Array.from(context.querySelectorAll(selector));
};

/**
 * Create element with attributes and children
 */
const createElement = (tag, attributes = {}, children = []) => {
  const element = document.createElement(tag);
  
  // Set attributes
  Object.entries(attributes).forEach(([key, value]) => {
    if (key === 'className') {
      element.className = value;
    } else if (key === 'textContent') {
      element.textContent = value;
    } else if (key === 'innerHTML') {
      element.innerHTML = value;
    } else {
      element.setAttribute(key, value);
    }
  });
  
  // Append children
  children.forEach(child => {
    if (typeof child === 'string') {
      element.appendChild(document.createTextNode(child));
    } else if (child instanceof HTMLElement) {
      element.appendChild(child);
    }
  });
  
  return element;
};

// ========== FORMATTING UTILITIES ==========

/**
 * Format number with commas
 */
const formatNumber = (num) => {
  if (num === null || num === undefined) return '0';
  return num.toLocaleString();
};

/**
 * Format date to readable string
 */
const formatDate = (dateString) => {
  if (!dateString) return 'Unknown';
  
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = (now - date) / (1000 * 60 * 60);
  
  if (diffInHours < 24) {
    return `${Math.floor(diffInHours)} hours ago`;
  } else if (diffInHours < 24 * 30) {
    return `${Math.floor(diffInHours / 24)} days ago`;
  } else {
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  }
};

/**
 * Truncate text with ellipsis
 */
const truncateText = (text, maxLength = 100) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substr(0, maxLength) + '...';
};

/**
 * Generate health grade from score
 */
const getHealthGrade = (score) => {
  if (score >= 95) return 'A+';
  if (score >= 90) return 'A';
  if (score >= 85) return 'B+';
  if (score >= 80) return 'B';
  if (score >= 75) return 'C+';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
};

/**
 * Get color class for health grade
 */
const getGradeColorClass = (grade) => {
  const gradeMap = {
    'A+': 'grade-a',
    'A': 'grade-a',
    'B+': 'grade-b',
    'B': 'grade-b',
    'C+': 'grade-c',
    'C': 'grade-c',
    'D': 'grade-d',
    'F': 'grade-f'
  };
  return gradeMap[grade] || 'grade-f';
};

// ========== ANIMATION UTILITIES ==========

/**
 * Debounce function calls
 */
const debounce = (func, wait, immediate) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      timeout = null;
      if (!immediate) func(...args);
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func(...args);
  };
};

/**
 * Throttle function calls
 */
const throttle = (func, limit) => {
  let lastFunc;
  let lastRan;
  return function(...args) {
    if (!lastRan) {
      func.apply(this, args);
      lastRan = Date.now();
    } else {
      clearTimeout(lastFunc);
      lastFunc = setTimeout(() => {
        if ((Date.now() - lastRan) >= limit) {
          func.apply(this, args);
          lastRan = Date.now();
        }
      }, limit - (Date.now() - lastRan));
    }
  };
};

/**
 * Animate element with CSS classes
 */
const animateElement = (element, animationClass, duration = 300) => {
  return new Promise((resolve) => {
    element.classList.add(animationClass);
    setTimeout(() => {
      element.classList.remove(animationClass);
      resolve();
    }, duration);
  });
};

// ========== TOAST NOTIFICATIONS ==========

class ToastManager {
  constructor() {
    this.container = document.querySelector('#toastContainer');
    if (!this.container) {
      this.container = createElement('div', {
        id: 'toastContainer',
        className: 'toast-container',
        'aria-live': 'polite',
        'aria-atomic': 'true'
      });
      document.body.appendChild(this.container);
    }
  }

  show(message, type = 'info', duration = 5000) {
    const toast = createElement('div', {
      className: `toast toast--${type}`,
      innerHTML: `
        <div class="toast__content">
          <span class="toast__message">${message}</span>
          <button class="toast__close" aria-label="Close notification">×</button>
        </div>
      `
    });

    // Add close button handler
    const closeBtn = toast.querySelector('.toast__close');
    closeBtn.addEventListener('click', () => this.remove(toast));

    // Add to container
    this.container.appendChild(toast);

    // Auto-remove after duration
    if (duration > 0) {
      setTimeout(() => this.remove(toast), duration);
    }

    return toast;
  }

  remove(toast) {
    if (toast && toast.parentNode) {
      toast.style.animation = 'toast-slide-out 300ms ease-out';
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 300);
    }
  }

  success(message, duration) {
    return this.show(message, 'success', duration);
  }

  error(message, duration) {
    return this.show(message, 'error', duration);
  }

  warning(message, duration) {
    return this.show(message, 'warning', duration);
  }

  info(message, duration) {
    return this.show(message, 'info', duration);
  }
}

// Create global toast instance
const toast = new ToastManager();

// ========== LOADING STATES ==========

/**
 * Show loading skeleton
 */
const showSkeleton = (container, count = 3) => {
  container.innerHTML = '';
  for (let i = 0; i < count; i++) {
    const skeleton = createElement('div', {
      className: 'project-card skeleton',
      innerHTML: `
        <div class="skeleton-header"></div>
        <div class="skeleton-text"></div>
        <div class="skeleton-text"></div>
        <div class="skeleton-footer"></div>
      `
    });
    container.appendChild(skeleton);
  }
};

/**
 * Show loading spinner
 */
const showSpinner = (container, message = 'Loading...') => {
  container.innerHTML = `
    <div class="loading-spinner">
      <div class="spinner"></div>
      <p class="loading-message">${message}</p>
    </div>
  `;
};

// ========== URL UTILITIES ==========

/**
 * Get URL parameter by name
 */
const getUrlParam = (name) => {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(name);
};

/**
 * Update URL parameter without refresh
 */
const updateUrlParam = (key, value) => {
  const url = new URL(window.location);
  if (value) {
    url.searchParams.set(key, value);
  } else {
    url.searchParams.delete(key);
  }
  window.history.replaceState({}, '', url);
};

// ========== LOCAL STORAGE UTILITIES ==========

/**
 * Safe localStorage operations
 */
const storage = {
  get(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key);
      if (item === null) return defaultValue;
      try {
        return JSON.parse(item);
      } catch {
        return item;
      }
    } catch (error) {
      return defaultValue;
    }
  },

  set(key, value) {
    try {
      const valToStore = typeof value === 'string' ? value : JSON.stringify(value);
      localStorage.setItem(key, valToStore);
      return true;
    } catch (error) {
      console.warn('Error writing to localStorage:', error);
      return false;
    }
  },

  remove(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.warn('Error removing from localStorage:', error);
      return false;
    }
  },

  clear() {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.warn('Error clearing localStorage:', error);
      return false;
    }
  }
};

// ========== VALIDATION UTILITIES ==========

/**
 * Validate email format
 */
const isValidEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

/**
 * Validate URL format
 */
const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Sanitize HTML to prevent XSS
 */
const sanitizeHtml = (str) => {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
};

// ========== EXPORT UTILITIES ==========
window.utils = {
  $, $$, createElement,
  formatNumber, formatDate, truncateText,
  getHealthGrade, getGradeColorClass,
  debounce, throttle, animateElement,
  toast,
  showSkeleton, showSpinner,
  getUrlParam, updateUrlParam,
  storage,
  isValidEmail, isValidUrl, sanitizeHtml
};