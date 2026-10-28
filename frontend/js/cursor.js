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
    #proj-cursor-container {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      pointer-events: none;
      z-index: 999999;
      overflow: hidden;
      transition: opacity 0.3s ease;
    }

    #proj-cursor-container.cursor-hidden {
      opacity: 0;
    }

    /* Core Diamond Prism Dot */
    .proj-cursor-dot {
      position: fixed;
      top: 0;
      left: 0;
      width: 10px;
      height: 10px;
      border-radius: 2px;
      background: linear-gradient(135deg, #38BDF8 0%, #2563EB 100%);
      transform: translate3d(-50%, -50%, 0) rotate(45deg);
      pointer-events: none;
      box-shadow: 0 0 10px rgba(56, 189, 248, 0.8), 0 0 20px rgba(37, 99, 235, 0.4);
      transition: transform 0.15s cubic-bezier(0.2, 0, 0.2, 1), background 0.3s ease;
      will-change: transform;
    }

    /* Trailing Follower Halo */
    .proj-cursor-ring {
      position: fixed;
      top: 0;
      left: 0;
      width: 38px;
      height: 38px;
      border-radius: 50%;
      border: 1.5px solid rgba(56, 189, 248, 0.55);
      background: radial-gradient(circle, rgba(56, 189, 248, 0.08) 0%, rgba(37, 99, 235, 0.02) 70%, transparent 100%);
      transform: translate3d(-50%, -50%, 0);
      pointer-events: none;
      transition: width 0.25s cubic-bezier(0.25, 1, 0.5, 1),
                  height 0.25s cubic-bezier(0.25, 1, 0.5, 1),
                  border-color 0.25s ease,
                  background-color 0.25s ease,
                  box-shadow 0.25s ease;
      will-change: transform;
    }

    /* Subtle geometric diamond facet inside the trailing ring */
    .proj-cursor-ring::after {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      width: 14px;
      height: 14px;
      border: 1px solid rgba(56, 189, 248, 0.25);
      border-radius: 2px;
      transform: translate(-50%, -50%) rotate(45deg);
      transition: transform 0.4s cubic-bezier(0.25, 1, 0.5, 1), border-color 0.3s ease;
    }

    /* Light Theme Tweaks */
    :root[data-theme="light"] .proj-cursor-dot {
      background: linear-gradient(135deg, #0284C7 0%, #1D4ED8 100%);
      box-shadow: 0 0 8px rgba(2, 132, 199, 0.6);
    }
    :root[data-theme="light"] .proj-cursor-ring {
      border-color: rgba(2, 132, 199, 0.45);
      background: radial-gradient(circle, rgba(2, 132, 199, 0.06) 0%, transparent 70%);
    }
    :root[data-theme="light"] .proj-cursor-ring::after {
      border-color: rgba(2, 132, 199, 0.25);
    }

    /* Interactive Hover State (links, cards, buttons) */
    #proj-cursor-container.is-hovering .proj-cursor-ring {
      width: 54px;
      height: 54px;
      border-color: #38BDF8;
      background: radial-gradient(circle, rgba(56, 189, 248, 0.16) 0%, rgba(37, 99, 235, 0.05) 70%, transparent 100%);
      box-shadow: 0 0 20px rgba(56, 189, 248, 0.35);
    }

    #proj-cursor-container.is-hovering .proj-cursor-ring::after {
      transform: translate(-50%, -50%) rotate(135deg) scale(1.3);
      border-color: rgba(56, 189, 248, 0.6);
    }

    #proj-cursor-container.is-hovering .proj-cursor-dot {
      transform: translate3d(-50%, -50%, 0) rotate(135deg) scale(0.75);
      box-shadow: 0 0 14px rgba(56, 189, 248, 1);
    }

    /* Click Active State */
    #proj-cursor-container.is-clicked .proj-cursor-dot {
      transform: translate3d(-50%, -50%, 0) rotate(45deg) scale(1.4);
    }

    #proj-cursor-container.is-clicked .proj-cursor-ring {
      transform: translate3d(-50%, -50%, 0) scale(0.85);
      border-color: #60A5FA;
    }

    /* Click Ripple Shockwave */
    .proj-cursor-shockwave {
      position: fixed;
      top: 0;
      left: 0;
      width: 10px;
      height: 10px;
      border-radius: 4px;
      border: 1.5px solid #38BDF8;
      pointer-events: none;
      transform: translate3d(-50%, -50%, 0) rotate(45deg);
      animation: cursorShockwave 0.5s cubic-bezier(0.1, 0.8, 0.3, 1) forwards;
      will-change: transform, opacity;
    }

    @keyframes cursorShockwave {
      0% {
        width: 10px;
        height: 10px;
        opacity: 1;
        transform: translate3d(-50%, -50%, 0) rotate(45deg) scale(1);
      }
      100% {
        width: 60px;
        height: 60px;
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

  const dot = document.createElement('div');
  dot.className = 'proj-cursor-dot';

  const ring = document.createElement('div');
  ring.className = 'proj-cursor-ring';

  container.appendChild(ring);
  container.appendChild(dot);
  document.body.appendChild(container);

  // Position Coordinates
  let mouseX = -100;
  let mouseY = -100;
  let ringX = -100;
  let ringY = -100;
  let isMoving = false;
  let isVisible = false;

  // Track Mouse Movement
  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    if (!isVisible) {
      ringX = mouseX;
      ringY = mouseY;
      isVisible = true;
      container.classList.remove('cursor-hidden');
    }

    // Direct instantaneous placement for diamond dot
    dot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) rotate(45deg)`;
  }, { passive: true });

  // Physics-based Fluid Follower Loop (Lerp at 60/120fps)
  function renderFollower() {
    if (isVisible) {
      // Smooth linear interpolation damping
      ringX += (mouseX - ringX) * 0.18;
      ringY += (mouseY - ringY) * 0.18;

      ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`;
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

    // Spawn Shockwave
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
