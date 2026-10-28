/**
 * ProjIntelligence - Responsive Navigation & Mobile Drawer System
 * Senior-level, accessible, touch-friendly mobile navigation.
 * 
 * Features:
 * - Dynamic hamburger button with animated 3-bar to 'X' morphing
 * - Glassmorphism slide-down mobile navigation drawer with backdrop blur
 * - Active route highlighting based on current URL
 * - Full accessibility: ARIA attributes, keyboard Escape key support, focus handling
 * - Body scroll locking when open
 * - Auto-close on link navigation, outside tap, or desktop viewport resize
 * - Resilient fallback: auto-mounts in DOM if not explicitly authored in HTML
 */

(function () {
  'use strict';

  // Navigation Links Definition
  const NAV_ITEMS = [
    {
      title: 'Home',
      href: 'index.html',
      icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`
    },
    {
      title: 'Discovery',
      href: 'projects.html',
      icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`
    },
    {
      title: 'About',
      href: 'about.html',
      icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`
    },
    {
      title: 'Admin Portal',
      href: 'admin.html',
      icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`
    }
  ];

  // Helper to identify active route
  function isCurrentPage(href) {
    const currentPath = window.location.pathname.toLowerCase();
    const currentFile = currentPath.substring(currentPath.lastIndexOf('/') + 1) || 'index.html';
    const targetFile = href.toLowerCase();

    if (currentFile === targetFile) return true;
    if ((currentFile === '' || currentFile === 'index.html') && targetFile === 'index.html') return true;
    if (currentFile.includes('project-detail') && targetFile === 'projects.html') return true;

    return false;
  }

  // Mobile Navigation Controller
  class MobileNavigation {
    constructor() {
      this.isOpen = false;
      this.header = null;
      this.toggleBtn = null;
      this.drawer = null;
      this.backdrop = null;
      this.init();
    }

    init() {
      this.header = document.querySelector('.header');
      if (!this.header) return;

      this.ensureElements();
      this.bindEvents();
    }

    ensureElements() {
      // 1. Ensure Hamburger Button in header__actions
      let actions = this.header.querySelector('.header__actions');
      if (!actions) {
        actions = document.createElement('div');
        actions.className = 'header__actions';
        const container = this.header.querySelector('.header__container') || this.header;
        container.appendChild(actions);
      }

      this.toggleBtn = actions.querySelector('.header__hamburger');
      if (!this.toggleBtn) {
        this.toggleBtn = document.createElement('button');
        this.toggleBtn.className = 'header__hamburger';
        this.toggleBtn.type = 'button';
        this.toggleBtn.setAttribute('aria-label', 'Open navigation menu');
        this.toggleBtn.setAttribute('aria-expanded', 'false');
        this.toggleBtn.setAttribute('aria-controls', 'mobileNav');
        this.toggleBtn.innerHTML = `
          <span class="header__hamburger-bar"></span>
          <span class="header__hamburger-bar"></span>
          <span class="header__hamburger-bar"></span>
        `;
        actions.appendChild(this.toggleBtn);
      }

      // 2. Ensure Backdrop Overlay
      this.backdrop = document.getElementById('mobileNavBackdrop');
      if (!this.backdrop) {
        this.backdrop = document.createElement('div');
        this.backdrop.id = 'mobileNavBackdrop';
        this.backdrop.className = 'mobile-nav-backdrop';
        this.backdrop.setAttribute('aria-hidden', 'true');
        document.body.appendChild(this.backdrop);
      }

      // 3. Ensure Mobile Drawer
      this.drawer = document.getElementById('mobileNav');
      if (!this.drawer) {
        this.drawer = document.createElement('nav');
        this.drawer.id = 'mobileNav';
        this.drawer.className = 'mobile-nav';
        this.drawer.setAttribute('aria-label', 'Mobile Navigation');
        this.drawer.setAttribute('aria-hidden', 'true');

        const linksHtml = NAV_ITEMS.map(item => {
          const active = isCurrentPage(item.href) ? ' is-active' : '';
          return `
            <a href="${item.href}" class="mobile-nav__link${active}">
              <span class="mobile-nav__icon">${item.icon}</span>
              <span class="mobile-nav__title">${item.title}</span>
              ${isCurrentPage(item.href) ? '<span class="mobile-nav__badge">Current</span>' : ''}
            </a>
          `;
        }).join('');

        this.drawer.innerHTML = `
          <div class="mobile-nav__content">
            <div class="mobile-nav__links">
              ${linksHtml}
            </div>
            <div class="mobile-nav__footer">
              <a href="admin.html" class="btn btn--secondary mobile-nav__btn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3"/>
                </svg>
                <span>Admin Login</span>
              </a>
            </div>
          </div>
        `;
        document.body.appendChild(this.drawer);
      }
    }

    bindEvents() {
      if (this.toggleBtn) {
        this.toggleBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.toggle();
        });
      }

      if (this.backdrop) {
        this.backdrop.addEventListener('click', () => {
          this.close();
        });
      }

      // Close on link click
      if (this.drawer) {
        this.drawer.addEventListener('click', (e) => {
          const link = e.target.closest('a');
          if (link) {
            this.close();
          }
        });
      }

      // Keyboard support: Escape key closes menu
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.isOpen) {
          this.close();
          if (this.toggleBtn) this.toggleBtn.focus();
        }
      });

      // Viewport resize safeguard: Automatically close when expanding to desktop
      window.addEventListener('resize', () => {
        if (window.innerWidth > 768 && this.isOpen) {
          this.close();
        }
      }, { passive: true });
    }

    open() {
      if (this.isOpen) return;
      this.isOpen = true;

      if (this.toggleBtn) {
        this.toggleBtn.classList.add('is-active');
        this.toggleBtn.setAttribute('aria-expanded', 'true');
        this.toggleBtn.setAttribute('aria-label', 'Close navigation menu');
      }

      if (this.drawer) {
        this.drawer.classList.add('is-open');
        this.drawer.setAttribute('aria-hidden', 'false');
      }

      if (this.backdrop) {
        this.backdrop.classList.add('is-open');
        this.backdrop.setAttribute('aria-hidden', 'false');
      }

      document.body.classList.add('mobile-nav-locked');
    }

    close() {
      if (!this.isOpen) return;
      this.isOpen = false;

      if (this.toggleBtn) {
        this.toggleBtn.classList.remove('is-active');
        this.toggleBtn.setAttribute('aria-expanded', 'false');
        this.toggleBtn.setAttribute('aria-label', 'Open navigation menu');
      }

      if (this.drawer) {
        this.drawer.classList.remove('is-open');
        this.drawer.setAttribute('aria-hidden', 'true');
      }

      if (this.backdrop) {
        this.backdrop.classList.remove('is-open');
        this.backdrop.setAttribute('aria-hidden', 'true');
      }

      document.body.classList.remove('mobile-nav-locked');
    }

    toggle() {
      if (this.isOpen) {
        this.close();
      } else {
        this.open();
      }
    }
  }

  // Initialize on DOM ready
  let navbarInstance = null;

  function boot() {
    if (!navbarInstance) {
      navbarInstance = new MobileNavigation();
      window.ProjNavbar = navbarInstance;
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

})();
