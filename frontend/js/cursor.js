/**
 * ProjIntelligence - Cyber Prism Interactive Cursor
 * High-performance, GPU-accelerated custom cursor matching the ProjIntelligence
 * geometric prism emblem, featuring physics-based fluid trailing, interactive 
 * hover magnetism, and micro-ripple effects.
 */

(function () {
  'use strict';

  // Only initialize on desktop / devices with fine pointer (mouse/trackpad)
  if (!window.matchMedia || !window.matchMedia('(pointer: fine)').matches) {
    return;
  }

  // Prevent multiple initializations
  if (document.getElementById('proj-cursor-container')) {
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
    }

    #proj-cursor-container {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      pointer-events: none;
      z-index: 9999999;
      overflow: hidden;
      transition: opacity 0.25s ease;
    }

    #proj-cursor-container.cursor-hidden {
      opacity: 0;
    }

    /* Outer Trailing Halo Ring */
    .proj-cursor-ring {
      position: fixed;
      top: 0;
      left: 0;
      width: 42px;
      height: 42px;
      border-radius: 50%;
      border: 1.5px solid rgba(56, 189, 248, 0.45);
      background: radial-gradient(circle, rgba(56, 189, 248, 0.08) 0%, rgba(37, 99, 235, 0.02) 65%, transparent 100%);
      transform: translate3d(-50%, -50%, 0);
      pointer-events: none;
      transition: width 0.22s cubic-bezier(0.25, 1, 0.5, 1),
                  height 0.22s cubic-bezier(0.25, 1, 0.5, 1),
                  border-color 0.2s ease,
                  box-shadow 0.2s ease,
                  background-color 0.2s ease;
      will-change: left, top, width, height, transform;
    }

    /* Core ProjIntelligence Diamond Emblem (Concentric Center) */
    .proj-cursor-emblem {
      position: fixed;
      top: 0;
      left: 0;
      width: 14px;
      height: 14px;
      border-radius: 3px;
      background: linear-gradient(135deg, #38BDF8 0%, #2563EB 100%);
      transform: translate3d(-50%, -50%, 0) rotate(45deg);
      pointer-events: none;
      box-shadow: 0 0 10px rgba(56, 189, 248, 0.8), 0 0 20px rgba(37, 99, 235, 0.45);
      transition: transform 0.2s cubic-bezier(0.2, 0, 0.2, 1), 
                  width 0.2s ease, 
                  height 0.2s ease, 
                  box-shadow 0.2s ease, 
                  background 0.3s ease;
      will-change: left, top, transform;
    }

    /* Inner specular prism facet */
    .proj-cursor-emblem::after {
      content: '';
      position: absolute;
      top: 2px;
      left: 2px;
      width: 4px;
      height: 4px;
      border-radius: 1px;
      background: rgba(255, 255, 255, 0.85);
      box-shadow: 0 0 4px #ffffff;
    }

    /* Light Theme Adjustments */
    :root[data-theme="light"] .proj-cursor-ring {
      border-color: rgba(2, 132, 199, 0.5);
      background: radial-gradient(circle, rgba(2, 132, 199, 0.08) 0%, transparent 70%);
    }

    :root[data-theme="light"] .proj-cursor-emblem {
      background: linear-gradient(135deg, #0284C7 0%, #1D4ED8 100%);
      box-shadow: 0 0 10px rgba(2, 132, 199, 0.7);
    }

    /* Interactive Hover State (on buttons, cards, links, inputs) */
    #proj-cursor-container.is-hovering .proj-cursor-ring {
      width: 58px;
      height: 58px;
      border-color: #38BDF8;
      background: radial-gradient(circle, rgba(56, 189, 248, 0.16) 0%, rgba(37, 99, 235, 0.04) 70%, transparent 100%);
      box-shadow: 0 0 22px rgba(56, 189, 248, 0.45), inset 0 0 12px rgba(56, 189, 248, 0.15);
    }

    #proj-cursor-container.is-hovering .proj-cursor-emblem {
      transform: translate3d(-50%, -50%, 0) rotate(135deg) scale(1.2);
      box-shadow: 0 0 16px rgba(56, 189, 248, 1), 0 0 28px rgba(37, 99, 235, 0.6);
    }

    /* Click Active State */
    #proj-cursor-container.is-clicked .proj-cursor-emblem {
      transform: translate3d(-50%, -50%, 0) rotate(45deg) scale(0.85);
    }

    #proj-cursor-container.is-clicked .proj-cursor-ring {
      width: 34px;
      height: 34px;
      border-color: #60A5FA;
      box-shadow: 0 0 15px rgba(96, 165, 250, 0.6);
    }

    /* Click Ripple Shockwave */
    .proj-cursor-shockwave {
      position: fixed;
      top: 0;
      left: 0;
      width: 14px;
      height: 14px;
      border-radius: 4px;
      border: 1.5px solid #38BDF8;
      pointer-events: none;
      transform: translate3d(-50%, -50%, 0) rotate(45deg);
      animation: cursorShockwave 0.5s cubic-bezier(0.1, 0.8, 0.3, 1) forwards;
      will-change: transform, opacity;
      z-index: 9999998;
    }

    @keyframes cursorShockwave {
      0% {
        width: 14px;
        height: 14px;
        opacity: 1;
        transform: translate3d(-50%, -50%, 0) rotate(45deg) scale(1);
      }
      100% {
        width: 70px;
        height: 70px;
        opacity: 0;
        transform: translate3d(-50%, -50%, 0) rotate(135deg) scale(1);
      }
    }
  `;
  document.head.appendChild(style);

  // Create Cursor Elements
  const container = document.createElement('div');
  container.id = 'proj-cursor-container';
  container.className = 'cursor-hidden';

  const ring = document.createElement('div');
  ring.className = 'proj-cursor-ring';

  const emblem = document.createElement('div');
  emblem.className = 'proj-cursor-emblem';

  container.appendChild(ring);
  container.appendChild(emblem);
  document.body.appendChild(container);

  // Position Coordinates
  let mouseX = -100;
  let mouseY = -100;
  let ringX = -100;
  let ringY = -100;
  let isVisible = false;

  // Track Mouse Movement
  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    if (!isVisible) {
      ringX = mouseX;
      ringY = mouseY;
      ring.style.left = `${ringX}px`;
      ring.style.top = `${ringY}px`;
      isVisible = true;
      container.classList.remove('cursor-hidden');
    }

    // Direct instantaneous placement for center diamond emblem
    emblem.style.left = `${mouseX}px`;
    emblem.style.top = `${mouseY}px`;
  }, { passive: true });

  // Physics-based Fluid Follower Loop (Lerp at 60/120fps)
  function renderFollower() {
    if (isVisible) {
      // Smooth linear interpolation damping
      ringX += (mouseX - ringX) * 0.2;
      ringY += (mouseY - ringY) * 0.2;

      ring.style.left = `${ringX}px`;
      ring.style.top = `${ringY}px`;
    }
    requestAnimationFrame(renderFollower);
  }
  requestAnimationFrame(renderFollower);

  // Window Entry / Exit Handlers
  document.addEventListener('mouseleave', () => {
    container.classList.add('cursor-hidden');
    isVisible = false;
  });

  document.addEventListener('mouseenter', () => {
    container.classList.remove('cursor-hidden');
    isVisible = true;
  });

  // Interactive Hover Targets Delegation
  const interactiveSelector = [
    'a',
    'button',
    '.btn',
    '.project-card',
    '.filter-panel',
    '.filter-select',
    '.search-input',
    'input',
    'select',
    'textarea',
    '[role="button"]',
    '.nav-link',
    '.repo-tab',
    '.file-item',
    '.badge',
    '.toolbar-btn'
  ].join(',');

  document.addEventListener('mouseover', (e) => {
    const target = e.target.closest(interactiveSelector);
    if (target) {
      container.classList.add('is-hovering');
    }
  }, { passive: true });

  document.addEventListener('mouseout', (e) => {
    const target = e.target.closest(interactiveSelector);
    if (target) {
      container.classList.remove('is-hovering');
    }
  }, { passive: true });

  // Click Animation & Shockwave
  window.addEventListener('mousedown', (e) => {
    container.classList.add('is-clicked');

    // Spawn Shockwave from exact click position
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
    container.classList.remove('is-clicked');
  });

})();
