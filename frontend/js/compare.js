/**
 * ProjIntelligence - Repository Comparison Logic
 * Allows students and developers to compare two repositories side-by-side.
 */

document.addEventListener('DOMContentLoaded', async () => {
  const selectA = document.getElementById('selectProjectA');
  const selectB = document.getElementById('selectProjectB');
  const compareBtn = document.getElementById('compareBtn');
  const emptyPrompt = document.getElementById('compareEmptyPrompt');
  const resultsContainer = document.getElementById('compareResults');
  const sideA = document.getElementById('sideProjectA');
  const sideB = document.getElementById('sideProjectB');
  const themeToggle = document.getElementById('themeToggle');

  // Theme setup
  if (window.ProjTheme) {
    window.ProjTheme.init();
  } else if (themeToggle) {
    const isDark = (localStorage.getItem('theme') || '').includes('dark');
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    themeToggle.checked = isDark;
    themeToggle.addEventListener('change', (e) => {
      const theme = e.target.checked ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem('theme', theme);
    });
  }

  // Check query params for preselection (e.g. compare.html?id1=7&id2=8)
  const urlParams = new URLSearchParams(window.location.search);
  const initialId1 = urlParams.get('id1');
  const initialId2 = urlParams.get('id2');

  // Populate projects into dropdowns
  try {
    const res = await api.getProjects({ limit: 100 });
    if (res.success && res.data && res.data.projects) {
      const projects = res.data.projects;
      projects.forEach(p => {
        const optA = document.createElement('option');
        optA.value = p.id;
        optA.textContent = `${p.name} (${p.technologies?.map(t => t.name).join(', ') || 'General'})`;
        selectA.appendChild(optA);

        const optB = document.createElement('option');
        optB.value = p.id;
        optB.textContent = `${p.name} (${p.technologies?.map(t => t.name).join(', ') || 'General'})`;
        selectB.appendChild(optB);
      });

      if (initialId1) selectA.value = initialId1;
      if (initialId2) selectB.value = initialId2;

      // Auto-trigger if both IDs are in query params
      if (initialId1 && initialId2 && initialId1 !== initialId2) {
        executeComparison(initialId1, initialId2);
      }
    }
  } catch (err) {
    console.error('Failed to load projects for comparison:', err);
  }

  // Click handler
  compareBtn.addEventListener('click', () => {
    const id1 = selectA.value;
    const id2 = selectB.value;

    if (!id1 || !id2) {
      alert('Please select two projects to compare.');
      return;
    }
    if (id1 === id2) {
      alert('Please select two distinct projects to compare.');
      return;
    }

    // Update URL history cleanly without reloading
    const newUrl = `${window.location.pathname}?id1=${id1}&id2=${id2}`;
    window.history.pushState({ id1, id2 }, '', newUrl);

    executeComparison(id1, id2);
  });

  async function executeComparison(id1, id2) {
    compareBtn.disabled = true;
    compareBtn.textContent = 'Analyzing...';

    try {
      const res = await api.compareProjects(id1, id2);
      if (res.success && res.data) {
        const { project1, project2 } = res.data;
        renderProjectSide(sideA, project1, 'A');
        renderProjectSide(sideB, project2, 'B');

        emptyPrompt.style.display = 'none';
        resultsContainer.style.display = 'block';
      } else {
        alert(res.error?.message || 'Failed to compare projects.');
      }
    } catch (err) {
      console.error('Error during comparison:', err);
      alert('An unexpected error occurred during comparison.');
    } finally {
      compareBtn.disabled = false;
      compareBtn.textContent = 'Compare Projects';
    }
  }

  function renderProjectSide(container, project, sideLabel) {
    const analysis = project.analysis || {};
    const stats = analysis.statistics || {};
    const sec = analysis.security || { status: 'clean', total_issues: 0 };
    const bd = analysis.breakdown || {};
    const score = Math.round(project.health_score || analysis.overall_score || 0);
    const grade = analysis.grade || (score >= 90 ? 'A' : score >= 80 ? 'B' : score >= 70 ? 'C' : score >= 60 ? 'D' : 'F');

    let gradeColor = '#10b981';
    if (grade === 'B') gradeColor = '#3b82f6';
    else if (grade === 'C') gradeColor = '#f59e0b';
    else if (grade === 'D') gradeColor = '#f97316';
    else if (grade === 'F') gradeColor = '#ef4444';

    let secBadge = '<span style="color:#10b981; font-weight:700;">Clean (0 issues)</span>';
    if (sec.status === 'warning') {
      secBadge = `<span style="color:#f59e0b; font-weight:700;">Warning (${sec.total_issues} issues)</span>`;
    } else if (sec.status === 'danger') {
      secBadge = `<span style="color:#ef4444; font-weight:700;">Danger (${sec.total_issues} issues)</span>`;
    }

    const techTags = (project.technologies || []).map(t => 
      `<span class="badge" style="margin-right:0.35rem; margin-bottom:0.25rem;">${t.name}</span>`
    ).join('') || '<span style="color:var(--text-tertiary);">Not specified</span>';

    const renderPillarRow = (name, pData) => {
      const pScore = pData?.score || 0;
      const maxScore = pData?.max_score || 20;
      const pct = Math.round((pScore / maxScore) * 100);
      const fill = pct >= 80 ? '#10b981' : pct >= 60 ? '#f59e0b' : '#ef4444';
      return `
        <div class="pillar-box">
          <div class="pillar-header">
            <span>${name}</span>
            <span>${pScore} / ${maxScore} pts</span>
          </div>
          <div class="pillar-bar">
            <div class="pillar-fill" style="width:${pct}%; background:${fill};"></div>
          </div>
        </div>
      `;
    };

    container.innerHTML = `
      <div class="side-header">
        <div>
          <span style="font-size:0.75rem; font-weight:700; text-transform:uppercase; letter-spacing:0.05em; color:var(--primary-500);">Project ${sideLabel}</span>
          <h3 class="side-title">${project.name}</h3>
          <p style="color:var(--text-secondary); font-size:0.875rem; margin:0;">${project.short_description || project.description || 'No description available'}</p>
        </div>
        <div class="grade-badge-lg" style="background:${gradeColor};" title="Health Grade: ${grade}">
          ${grade}
        </div>
      </div>

      <!-- Quick Actions -->
      <div style="margin-bottom: 1.25rem; display: flex; gap: 0.5rem;">
        <a href="project-detail.html?id=${project.id}" class="btn btn--secondary" style="font-size: 0.85rem; padding: 0.4rem 0.85rem;">
          View Repository & Audit
        </a>
      </div>

      <!-- Core Metrics Table -->
      <div style="margin-bottom: 1.5rem;">
        <div class="metric-row">
          <span class="metric-label">Health Score</span>
          <span class="metric-value" style="font-size:1.1rem; color:${gradeColor};">${score} / 100</span>
        </div>
        <div class="metric-row">
          <span class="metric-label">Lines of Code (LOC)</span>
          <span class="metric-value">${(stats.total_lines_of_code || 0).toLocaleString()} lines</span>
        </div>
        <div class="metric-row">
          <span class="metric-label">Total Files / Source Files</span>
          <span class="metric-value">${stats.total_files || 0} files (${stats.source_files || 0} source)</span>
        </div>
        <div class="metric-row">
          <span class="metric-label">Test Files</span>
          <span class="metric-value">${stats.test_files || 0} test files</span>
        </div>
        <div class="metric-row">
          <span class="metric-label">Static Security Status</span>
          <span class="metric-value">${secBadge}</span>
        </div>
        <div class="metric-row">
          <span class="metric-label">Technologies</span>
          <div style="display:flex; flex-wrap:wrap; justify-content:flex-end;">${techTags}</div>
        </div>
      </div>

      <!-- 5 Pillars Breakdown -->
      <h4 style="font-size:0.95rem; font-weight:700; color:var(--text-primary); margin-bottom:0.5rem;">Deterministic Health Pillars</h4>
      ${renderPillarRow('Documentation Quality', bd.documentation)}
      ${renderPillarRow('Testing Organization', bd.testing)}
      ${renderPillarRow('Architecture & Structure', bd.code_organization)}
      ${renderPillarRow('Configuration & Manifests', bd.configuration)}
      ${renderPillarRow('Maintainability Metrics', bd.maintainability)}
    `;
  }
});
