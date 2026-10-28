/**
 * ProjIntelligence - Senior-Level Interactive Circle Cursor
 * Minimalist, high-performance circular ring cursor matching design reference.
 * 
 * Features:
 * - GPU-composited 60/120Hz smooth physics (Lerp damping)
 * - Decoupled RAF translate3d and CSS scale transitions (zero jitter, zero layout reflows)
 * - Context-aware states: Idle, Interactive Hover Expansion, Tactile Click Compression, Text Input Pass-through
 * - Seamless Light / Dark theme support with automatic token synchronization
 * - Full accessibility & touch-device safeguards (pointer: fine, prefers-reduced-motion)
 */

(function () {
  'use strict';

  // Guard: Only initialize on desktop / devices with fine pointer (mouse/trackpad)
  if (!window.matchMedia || !window.matchMedia('(pointer: fine)').matches) {
    return;
  }

  // Prevent duplicate initialization
  if (document.getElementById('proj-cursor')) {
    return;
  }

  // Inject Cursor Styles
  const style = document.createElement('style');
  style.id = 'proj-cursor-styles';
  style.textContent = `
    /* CSS Custom Properties for Cursor Themes */
    :root {
      --proj-cursor-size: 38px;
      --proj-cursor-border-width: 3.2px;
      --proj-cursor-border: #352F3B; /* Deep charcoal/graphite matching design reference */
      --proj-cursor-bg: rgba(255, 255, 255, 0.45);
      --proj-cursor-hover-border: #2563EB;
      --proj-cursor-hover-bg: rgba(37, 99, 235, 0.08);
      --proj-cursor-click-border: #1D4ED8;
      --proj-cursor-click-bg: rgba(29, 78, 216, 0.16);
      --proj-cursor-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
    }

    :root[data-theme="dark"] {
      --proj-cursor-border: rgba(248, 250, 252, 0.92); /* Bright platinum white for dark theme */
      --proj-cursor-bg: rgba(255, 255, 255, 0.08);
      --proj-cursor-hover-border: #38BDF8;
      --proj-cursor-hover-bg: rgba(56, 189, 248, 0.12);
      --proj-cursor-click-border: #60A5FA;
      --proj-cursor-click-bg: rgba(96, 165, 250, 0.22);
      --proj-cursor-shadow: 0 2px 14px rgba(0, 0, 0, 0.35);
    }

    /* Hide OS default cursor ONLY when custom cursor is active on fine-pointer devices */
    @media (pointer: fine) {
      body.proj-cursor-active,
      body.proj-cursor-active *:not(input):not(textarea):not([contenteditable="true"]):not(select) {
        cursor: none !important;
      }

      /* Preserve native text selection cursor in text fields */
      body.proj-cursor-active input,
      body.proj-cursor-active textarea,
      body.proj-cursor-active [contenteditable="true"],
      body.proj-cursor-active pre code {
        cursor: text !important;
      }
    }

    /* Root Cursor Container - Positioned with translate3d in RAF (no CSS transition on transform) */
    .proj-cursor {
      position: fixed;
      top: 0;
      left: 0;
      width: 0;
      height: 0;
      pointer-events: none;
      z-index: 9999999;
      opacity: 0;
      will-change: transform;
      transition: opacity 0.22s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .proj-cursor.is-visible {
      opacity: 1;
    }

    .proj-cursor.is-text-field {
      opacity: 0 !important;
    }

    /* The Circular Ring - Exactly matches the design reference image */
    .proj-cursor-circle {
      position: absolute;
      top: 0;
      left: 0;
      width: var(--proj-cursor-size);
      height: var(--proj-cursor-size);
      box-sizing: border-box;
      border-radius: 50%;
      border: var(--proj-cursor-border-width) solid var(--proj-cursor-border);
      background: var(--proj-cursor-bg);
      backdrop-filter: blur(1.5px);
      -webkit-backdrop-filter: blur(1.5px);
      box-shadow: var(--proj-cursor-shadow);
      transform: translate(-50%, -50%) scale(1);
      will-change: transform, border-color, background-color, border-width;
      transition: transform 0.24s cubic-bezier(0.16, 1, 0.3, 1),
                  border-color 0.22s ease,
                  background-color 0.22s ease,
                  border-width 0.2s ease,
                  box-shadow 0.22s ease;
    }

    /* Interactive Hover Expansion: Smoothly magnifies around interactive elements */
    .proj-cursor.is-hovering .proj-cursor-circle {
      transform: translate(-50%, -50%) scale(1.38);
      border-width: 2.6px;
      border-color: var(--proj-cursor-hover-border);
      background: var(--proj-cursor-hover-bg);
      box-shadow: 0 4px 18px rgba(37, 99, 235, 0.18);
    }

    /* Tactile Click Compression: Snappy mechanical squash on press */
    .proj-cursor.is-clicked .proj-cursor-circle {
      transform: translate(-50%, -50%) scale(0.76);
      border-width: 3.5px;
      border-color: var(--proj-cursor-click-border);
      background: var(--proj-cursor-click-bg);
      transition-duration: 0.08s;
    }

    /* Disabled target feedback */
    .proj-cursor.is-disabled .proj-cursor-circle {
      opacity: 0.35;
      transform: translate(-50%, -50%) scale(0.85);
      border-style: dashed;
    }

    /* Accessibility: Reduced Motion Override */
    @media (prefers-reduced-motion: reduce) {
      .proj-cursor-circle {
        transition: none !important;
      }
    }
  `;
  document.head.appendChild(style);

  // Create DOM Elements
  const cursor = document.createElement('div');
  cursor.id = 'proj-cursor';
  cursor.className = 'proj-cursor';
  cursor.setAttribute('aria-hidden', 'true');

  const circle = document.createElement('div');
  circle.className = 'proj-cursor-circle';
  cursor.appendChild(circle);

  // Function to safely inject cursor into DOM
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

  // Coordinates & Physics State
  let mouseX = -100;
  let mouseY = -100;
  let curX = -100;
  let curY = -100;
  let isVisible = false;
  let isInitialized = false;

  // Reduced motion detection
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const LERP = prefersReducedMotion ? 1.0 : 0.24;

  // Track Mouse Movement
  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    if (!isInitialized) {
      curX = mouseX;
      curY = mouseY;
      cursor.style.transform = `translate3d(${curX}px, ${curY}px, 0)`;
      document.body.classList.add('proj-cursor-active');
      isInitialized = true;
    }

    if (!isVisible) {
      cursor.classList.add('is-visible');
      isVisible = true;
    }
  }, { passive: true });

  // High-performance GPU-composited Physics Loop (60Hz / 120Hz / 144Hz)
  function renderLoop() {
    if (isVisible) {
      // Fluid linear interpolation with damping
      curX += (mouseX - curX) * LERP;
      curY += (mouseY - curY) * LERP;

      // Direct GPU transform update on root container with sub-pixel fidelity
      cursor.style.transform = `translate3d(${curX}px, ${curY}px, 0)`;
    }
    requestAnimationFrame(renderLoop);
  }
  requestAnimationFrame(renderLoop);

  // Window Edge Handlers
  document.addEventListener('mouseleave', () => {
    cursor.classList.remove('is-visible');
    isVisible = false;
  });

  document.addEventListener('mouseenter', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    curX = mouseX;
    curY = mouseY;
    cursor.style.transform = `translate3d(${curX}px, ${curY}px, 0)`;
    cursor.classList.add('is-visible');
    isVisible = true;
  });

  window.addEventListener('blur', () => {
    cursor.classList.remove('is-visible');
    isVisible = false;
  });

  // Tactile Click Feedback
  window.addEventListener('mousedown', (e) => {
    if (e.button === 0) { // Primary click only
      cursor.classList.add('is-clicked');
    }
  }, { passive: true });

  window.addEventListener('mouseup', () => {
    cursor.classList.remove('is-clicked');
  }, { passive: true });

  // Context-Aware Interactive Elements
  const interactiveSelector = [
    'a',
    'button',
    '.btn',
    '.project-card',
    '.category-card',
    '.stat-card',
    '.filter-panel',
    '.filter-select',
    '.filter-chip',
    '.filter-btn',
    '.search-input-wrapper button',
    'select',
    '[role="button"]',
    '.nav-link',
    '.repo-tab',
    '.tab-btn',
    '.file-item',
    '.folder-item',
    '.tree-item',
    '.badge',
    '.tag',
    '.pill',
    '.toolbar-btn',
    '.icon-btn',
    '.action-btn',
    '.copy-btn',
    '.theme-switch',
    '.theme-toggle',
    '#themeToggle',
    '.clickable',
    '[data-clickable]'
  ].join(',');

  const textInputSelector = [
    'input:not([type="button"]):not([type="submit"]):not([type="reset"]):not([type="checkbox"]):not([type="radio"])',
    'textarea',
    '[contenteditable="true"]',
    '.code-content',
    'pre code'
  ].join(',');

  const disabledSelector = '[disabled], .disabled, [aria-disabled="true"]';

  // Event Delegation for Cursor State Management
  document.addEventListener('mouseover', (e) => {
    const target = e.target;
    if (!target) return;

    // Disabled element state
    if (target.closest(disabledSelector)) {
      cursor.classList.add('is-disabled');
      cursor.classList.remove('is-hovering', 'is-text-field');
      return;
    } else {
      cursor.classList.remove('is-disabled');
    }

    // Text field state (allow native text I-beam cursor)
    if (target.closest(textInputSelector)) {
      cursor.classList.add('is-text-field');
      cursor.classList.remove('is-hovering');
      return;
    } else {
      cursor.classList.remove('is-text-field');
    }

    // Interactive element hover
    if (target.closest(interactiveSelector)) {
      cursor.classList.add('is-hovering');
    }
  }, { passive: true });

  document.addEventListener('mouseout', (e) => {
    const target = e.target;
    if (!target) return;

    const related = e.relatedTarget;

    // Handle text input exit
    if (target.closest(textInputSelector)) {
      if (!related || !related.closest(textInputSelector)) {
        cursor.classList.remove('is-text-field');
      }
    }

    // Handle interactive element exit
    if (target.closest(interactiveSelector)) {
      if (!related || !related.closest(interactiveSelector)) {
        cursor.classList.remove('is-hovering');
      }
    }

    // Handle disabled exit
    if (target.closest(disabledSelector)) {
      if (!related || !related.closest(disabledSelector)) {
        cursor.classList.remove('is-disabled');
      }
    }
  }, { passive: true });

})();