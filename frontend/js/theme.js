/**
 * ProjIntelligence — Unified Theme Management System
 * Engineered for zero-FOUC, instant state sync, and smooth aesthetic transitions.
 * Author: Vedant Panhalkar
 */

(function () {
  'use strict';

  const STORAGE_KEY = 'theme';

  function cleanThemeValue(val) {
    if (!val) return null;
    if (typeof val === 'string') {
      const trimmed = val.trim();
      if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
        return trimmed.slice(1, -1);
      }
      return trimmed;
    }
    return null;
  }

  function getSystemTheme() {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  }

  function getSavedTheme() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const cleaned = cleanThemeValue(raw);
      if (cleaned === 'dark' || cleaned === 'light') {
        return cleaned;
      }
    } catch (_) {}
    return getSystemTheme();
  }

  function applyTheme(theme, persist = true) {
    const validTheme = theme === 'dark' ? 'dark' : 'light';
    
    // Apply theme attribute to root
    document.documentElement.setAttribute('data-theme', validTheme);

    if (persist) {
      try {
        localStorage.setItem(STORAGE_KEY, validTheme);
      } catch (_) {}
    }

    // Sync all theme toggle inputs on the page
    const toggles = document.querySelectorAll('#themeToggle, .theme-checkbox');
    toggles.forEach((el) => {
      if (el.type === 'checkbox') {
        el.checked = (validTheme === 'dark');
      }
    });

    // Dispatch custom event for charts / canvases / components
    window.dispatchEvent(new CustomEvent('themechange', { detail: { theme: validTheme } }));
  }

  function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') || getSavedTheme();
    const next = current === 'dark' ? 'light' : 'dark';
    applyTheme(next, true);
    return next;
  }

  function attachListeners() {
    const toggles = document.querySelectorAll('#themeToggle, .theme-checkbox');
    toggles.forEach((el) => {
      // Remove any inline or previous handlers by assignment
      el.onchange = function (e) {
        const isDark = e.target.checked;
        applyTheme(isDark ? 'dark' : 'light', true);
      };
    });

    // Listen to OS theme changes if user has no explicit override in localStorage
    if (window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      mediaQuery.addEventListener('change', (e) => {
        try {
          if (!localStorage.getItem(STORAGE_KEY)) {
            applyTheme(e.matches ? 'dark' : 'light', false);
          }
        } catch (_) {}
      });
    }
  }

  // Public API
  window.ProjTheme = {
    get: getSavedTheme,
    set: applyTheme,
    toggle: toggleTheme,
    init: function () {
      const theme = getSavedTheme();
      applyTheme(theme, false);
      attachListeners();
    }
  };

  // Immediate init on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.ProjTheme.init();
    });
  } else {
    window.ProjTheme.init();
  }
})();
