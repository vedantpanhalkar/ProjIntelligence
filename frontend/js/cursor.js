/**
 * ProjIntelligence - Premium Interactive Cursor
 * High-performance, GPU-accelerated cursor featuring a frosted glass halo follower,
 * the ProjIntelligence vector cyber-prism emblem in the exact geometric center,
 * interactive context-aware hover morphing (explore arrow on cards/buttons),
 * and micro-shockwaves on click.
 */

(function () {
  'use strict';

  // Only initialize on desktop / devices with fine pointer (mouse/trackpad)
  if (!window.matchMedia || !window.matchMedia('(pointer: fine)').matches) {
    return;
  }

  // Prevent multiple initializations
  if (document.getElementById('proj-cursor')) {
    return;
  }

  // Inject Cursor Styles
  const style = document.createElement('style');
  style.id = 'proj-cursor-styles';
  style.textContent = `
    /* Completely hide the default OS system cursor on fine pointer devices */
    @media (pointer: fine) {
      *, *::before, *::after {
        cursor: none !important;
      }
      /* Preserve native text cursor on inputs and textareas for natural usability */
      input, textarea, [contenteditable="true"], pre code {
        cursor: text !important;
      }
    }

    /* Main Floating Cursor Follower */
    .proj-cursor {
      position: fixed;
      top: 0;
      left: 0;
      width: 42px;
      height: 42px;
      border-radius: 50%;
      pointer-events: none;
      z-index: 9999999;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(15, 23, 42, 0.72);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      border: 1.5px solid rgba(56, 189, 248, 0.5);
      box-shadow: 0 0 16px rgba(56, 189, 248, 0.28), 0 4px 16px rgba(0, 0, 0, 0.5);
      transition: width 0.25s cubic-bezier(0.25, 1, 0.5, 1),
                  height 0.25s cubic-bezier(0.25, 1, 0.5, 1),
                  background-color 0.25s ease,
                  border-color 0.25s ease,
                  box-shadow 0.25s ease,
                  opacity 0.25s ease;
      will-change: transform, width, height;
      opacity: 1;
    }

    .proj-cursor.cursor-hidden {
      opacity: 0;
      transform: translate3d(-100px, -100px, 0) !important;
    }

    /* Icon Container - Always perfectly centered inside the circle */
    .proj-cursor-inner {
      position: relative;
      width: 22px;
      height: 22px;
      display: flex;
      align-items: center;
      justify-content: center;
      pointer-events: none;
    }

    /* Vector SVG Icons */
    .proj-cursor-icon {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      transition: transform 0.3s cubic-bezier(0.25, 1, 0.5, 1),
                  opacity 0.25s ease;
      pointer-events: none;
    }

    .proj-cursor-icon.icon-brand {
      opacity: 1;
      transform: translate(-50%, -50%) scale(1) rotate(0deg);
      filter: drop-shadow(0 0 6px rgba(56, 189, 248, 0.7));
    }

    .proj-cursor-icon.icon-arrow {
      opacity: 0;
      transform: translate(-50%, -50%) scale(0.5) rotate(-45deg);
      color: #38BDF8;
      filter: drop-shadow(0 0 6px rgba(56, 189, 248, 0.8));
    }

    /* Interactive Hover State (Cards, Buttons, Links, Inputs) */
    .proj-cursor.is-hovering {
      width: 54px;
      height: 54px;
      background: rgba(15, 23, 42, 0.85);
      border-color: #38BDF8;
      box-shadow: 0 0 24px rgba(56, 189, 248, 0.55), inset 0 0 14px rgba(56, 189, 248, 0.2);
    }

    .proj-cursor.is-hovering .proj-cursor-icon.icon-brand {
      opacity: 0;
      transform: translate(-50%, -50%) scale(0.4) rotate(90deg);
    }

    .proj-cursor.is-hovering .proj-cursor-icon.icon-arrow {
      opacity: 1;
      transform: translate(-50%, -50%) scale(1) rotate(0deg);
    }

    /* Click Active Compression */
    .proj-cursor.is-clicked {
      width: 36px;
      height: 36px;
      border-color: #60A5FA;
      box-shadow: 0 0 18px rgba(96, 165, 250, 0.7);
    }

    .proj-cursor.is-clicked .proj-cursor-inner {
      transform: scale(0.85);
    }

    /* Light Theme Styling */
    :root[data-theme="light"] .proj-cursor {
      background: rgba(255, 255, 255, 0.82);
      border-color: rgba(37, 99, 235, 0.45);
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1), 0 0 14px rgba(37, 99, 235, 0.2);
    }

    :root[data-theme="light"] .proj-cursor.is-hovering {
      background: rgba(255, 255, 255, 0.95);
      border-color: #2563EB;
      box-shadow: 0 0 22px rgba(37, 99, 235, 0.4);
    }

    :root[data-theme="light"] .proj-cursor-icon.icon-arrow {
      color: #1D4ED8;
      filter: drop-shadow(0 0 4px rgba(29, 78, 216, 0.5));
    }

    /* Click Ripple Shockwave */
    .proj-cursor-shockwave {
      position: fixed;
      top: 0;
      left: 0;
      width: 16px;
      height: 16px;
      border-radius: 50%;
      border: 1.5px solid #38BDF8;
      pointer-events: none;
      transform: translate3d(-50%, -50%, 0);
      animation: cursorShockwave 0.5s cubic-bezier(0.1, 0.8, 0.3, 1) forwards;
      will-change: transform, opacity;
      z-index: 9999998;
    }

    @keyframes cursorShockwave {
      0% {
        width: 16px;
        height: 16px;
        opacity: 1;
        transform: translate3d(-50%, -50%, 0) scale(1);
      }
      100% {
        width: 72px;
        height: 72px;
        opacity: 0;
        transform: translate3d(-50%, -50%, 0) scale(1);
      }
    }
  `;
  document.head.appendChild(style);

  // Create Cursor Follower Element
  const cursor = document.createElement('div');
  cursor.id = 'proj-cursor';
  cursor.className = 'proj-cursor cursor-hidden';

  cursor.innerHTML = `
    <div class="proj-cursor-inner">
      <!-- Default state: ProjIntelligence Vector Diamond Prism Logo -->
      <svg class="proj-cursor-icon icon-brand" viewBox="0 0 24 24" width="20" height="20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="cursorBrandGrad" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stop-color="#38BDF8"/>
            <stop offset="50%" stop-color="#60A5FA"/>
            <stop offset="100%" stop-color="#2563EB"/>
          </linearGradient>
        </defs>
        <!-- Tilted Rounded Diamond Body -->
        <rect x="12" y="2.2" width="13.8" height="13.8" rx="3.5" transform="rotate(45 12 2.2)" fill="url(#cursorBrandGrad)" stroke="#38BDF8" stroke-width="1.2"/>
        <!-- Specular Facet Highlights -->
        <path d="M12 4.5L17.5 12L12 19.5" stroke="rgba(255,255,255,0.75)" stroke-width="1" stroke-linecap="round"/>
        <path d="M6.5 12L12 17" stroke="rgba(255,255,255,0.35)" stroke-width="0.9" stroke-linecap="round"/>
        <!-- Center Core Prism Reflection -->
        <circle cx="12" cy="12" r="1.8" fill="#FFFFFF"/>
      </svg>

      <!-- Hover state: Explore Arrow ↗ -->
      <svg class="proj-cursor-icon icon-arrow" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
        <line x1="7" y1="17" x2="17" y2="7"></line>
        <polyline points="7 7 17 7 17 17"></polyline>
      </svg>
    </div>
  `;

  // Safely mount to body
  function mountCursor() {
    if (document.body && !document.getElementById('proj-cursor')) {
      document.body.appendChild(cursor);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mountCursor);
  } else {
    mountCursor();
  }

  // Coordinate Variables
  let mouseX = -100;
  let mouseY = -100;
  let curX = -100;
  let curY = -100;
  let isVisible = false;

  // Track Mouse Movement
  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    if (!isVisible) {
      curX = mouseX;
      curY = mouseY;
      cursor.style.transform = `translate3d(${curX}px, ${curY}px, 0) translate(-50%, -50%)`;
      cursor.classList.remove('cursor-hidden');
      isVisible = true;
    }
  }, { passive: true });

  // Physics-based Fluid Follower Loop (Smooth Lerp at 60/120fps)
  function renderLoop() {
    if (isVisible) {
      curX += (mouseX - curX) * 0.22;
      curY += (mouseY - curY) * 0.22;

      cursor.style.transform = `translate3d(${curX}px, ${curY}px, 0) translate(-50%, -50%)`;
    }
    requestAnimationFrame(renderLoop);
  }
  requestAnimationFrame(renderLoop);

  // Window Entry / Exit Handlers
  document.addEventListener('mouseleave', () => {
    cursor.classList.add('cursor-hidden');
    isVisible = false;
  });

  document.addEventListener('mouseenter', () => {
    cursor.classList.remove('cursor-hidden');
    isVisible = true;
  });

  // Interactive Hover Targets Delegation (Cards, Buttons, Links, Inputs)
  const interactiveSelector = [
    'a',
    'button',
    '.btn',
    '.project-card',
    '.filter-panel',
    '.filter-select',
    '.search-input',
    'select',
    '[role="button"]',
    '.nav-link',
    '.repo-tab',
    '.file-item',
    '.badge',
    '.toolbar-btn',
    '.category-card',
    '.stat-card',
    '.header__hamburger',
    '.mobile-nav__link'
  ].join(',');

  document.addEventListener('mouseover', (e) => {
    const target = e.target.closest(interactiveSelector);
    if (target) {
      cursor.classList.add('is-hovering');
    }
  }, { passive: true });

  document.addEventListener('mouseout', (e) => {
    const target = e.target.closest(interactiveSelector);
    if (target) {
      cursor.classList.remove('is-hovering');
    }
  }, { passive: true });

  // Click Animation & Shockwave
  window.addEventListener('mousedown', (e) => {
    cursor.classList.add('is-clicked');

    const shockwave = document.createElement('div');
    shockwave.className = 'proj-cursor-shockwave';
    shockwave.style.left = `${e.clientX}px`;
    shockwave.style.top = `${e.clientY}px`;
    document.body.appendChild(shockwave);

    setTimeout(() => {
      if (shockwave && shockwave.parentNode) {
        shockwave.parentNode.removeChild(shockwave);
      }
    }, 500);
  });

  window.addEventListener('mouseup', () => {
    cursor.classList.remove('is-clicked');
  });

})();