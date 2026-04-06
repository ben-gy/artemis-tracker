// ========================================
// Artemis Mission Tracker - Main Controller
// ========================================

import { missions, getMission, getActiveMission, MISSION_STATUS } from './missions.js';
import { getAllTerms, searchGlossary, lookupTerm } from './glossary.js';
import { getTelemetry, resetTelemetryCache } from './telemetry-service.js';
import { initScene, loadMissionTrajectory, updateTrajectoryProgress, updateCraftPosition, showNoTrajectory, focusEarth, focusMoon, focusCraft, resetCamera } from './scene-builder.js';
import { renderTelemetry, updateMETDisplay, renderTimeline, renderCrew, renderDetails, renderGlossaryList, renderNoTrajectory, hideNoTrajectory } from './components.js';
import { formatDate } from './unit-converter.js';

// ========================================
// State
// ========================================

let currentMissionId = null;
let useMetric = true;
let telemetryInterval = null;
let metInterval = null;
let panelStates = {};

// ========================================
// Initialization
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    loadPreferences();
    renderMissionTabs();
    setupEventListeners();

    // Default to active mission, or first mission
    const active = getActiveMission();
    selectMission(active ? active.id : missions[0].id);
});

// ========================================
// Preferences (localStorage)
// ========================================

function loadPreferences() {
    const saved = localStorage.getItem('artemis-prefs');
    if (saved) {
        try {
            const prefs = JSON.parse(saved);
            useMetric = prefs.metric !== false;
            panelStates = prefs.panels || {};
        } catch (e) { /* ignore */ }
    }
    updateUnitButton();
}

function savePreferences() {
    localStorage.setItem('artemis-prefs', JSON.stringify({
        metric: useMetric,
        panels: panelStates,
    }));
}

function updateUnitButton() {
    const label = document.getElementById('unit-label');
    if (label) label.textContent = useMetric ? 'km' : 'mi';
}

// ========================================
// Mission Tabs
// ========================================

function renderMissionTabs() {
    const nav = document.getElementById('mission-tabs');
    nav.innerHTML = missions.map(m => {
        const isLive = m.status === MISSION_STATUS.IN_PROGRESS;
        return `
            <button class="mission-tab" data-mission="${m.id}" role="tab" aria-selected="false">
                <span class="tab-status ${m.status}"></span>
                ${m.name}
                ${isLive ? '<span class="tab-live-badge">LIVE</span>' : ''}
            </button>
        `;
    }).join('');
}

function updateTabSelection() {
    document.querySelectorAll('.mission-tab').forEach(tab => {
        const isActive = tab.dataset.mission === currentMissionId;
        tab.classList.toggle('active', isActive);
        tab.setAttribute('aria-selected', isActive);
    });
}

// ========================================
// Mission Selection
// ========================================

function selectMission(missionId) {
    if (currentMissionId === missionId) return;

    // Cleanup
    stopLiveTelemetry();
    resetTelemetryCache();

    currentMissionId = missionId;
    const mission = getMission(missionId);
    if (!mission) return;

    updateTabSelection();
    updateSceneOverlay(mission);
    initializeScene(mission);
    renderPanels(mission);
    updateFooter(mission);
    restorePanelStates();

    // Start live updates for active missions
    if (mission.status === MISSION_STATUS.IN_PROGRESS) {
        startLiveTelemetry(mission);
    } else if (mission.hasTrajectory && mission.status === MISSION_STATUS.COMPLETED) {
        // Show final telemetry state for completed missions
        showCompletedTelemetry(mission);
    }
}

// ========================================
// 3D Scene
// ========================================

function initializeScene(mission) {
    const container = document.getElementById('three-canvas-wrapper');
    const sceneContainer = document.getElementById('scene-container');

    initScene(container);

    // Always clear the "no trajectory" overlay first
    hideNoTrajectory(sceneContainer);

    if (mission.hasTrajectory) {
        const viewDate = mission.status === MISSION_STATUS.IN_PROGRESS ? new Date() : mission.launchDate;
        loadMissionTrajectory(mission.id, viewDate);
    } else {
        showNoTrajectory();
        renderNoTrajectory(sceneContainer, mission);
    }
}

function updateSceneOverlay(mission) {
    const label = document.getElementById('scene-mission-label');
    const badge = document.getElementById('scene-status-badge');

    label.textContent = mission.name;

    const statusLabels = {
        [MISSION_STATUS.COMPLETED]: 'COMPLETED',
        [MISSION_STATUS.IN_PROGRESS]: 'LIVE',
        [MISSION_STATUS.UPCOMING]: 'UPCOMING',
    };

    badge.textContent = statusLabels[mission.status];
    badge.className = `${mission.status}`;
}

// ========================================
// Panel Rendering
// ========================================

function renderPanels(mission) {
    const telemetryPanel = document.getElementById('telemetry-panel');
    const crewPanel = document.getElementById('crew-panel');

    // Show/hide telemetry panel based on mission state
    if (mission.status === MISSION_STATUS.UPCOMING) {
        telemetryPanel.style.display = 'none';
    } else {
        telemetryPanel.style.display = '';
    }

    // Show/hide crew panel
    if (!mission.isCrewed && mission.crew.length === 0) {
        crewPanel.style.display = 'none';
    } else {
        crewPanel.style.display = '';
    }

    // Render each panel
    renderTimeline(document.getElementById('timeline-content'), mission);
    renderCrew(document.getElementById('crew-content'), mission);
    renderDetails(document.getElementById('details-content'), mission, useMetric);

    // Telemetry initially empty for live missions (filled by polling)
    if (mission.status !== MISSION_STATUS.UPCOMING) {
        const container = document.getElementById('telemetry-content');
        container.innerHTML = '<div class="empty-state"><span class="loading-spinner"></span> Loading telemetry...</div>';
    }
}

function restorePanelStates() {
    document.querySelectorAll('.panel').forEach(panel => {
        const key = panel.dataset.panel;
        if (panelStates[key] === 'collapsed') {
            panel.classList.add('collapsed');
        } else {
            panel.classList.remove('collapsed');
        }
    });
}

// ========================================
// Live Telemetry
// ========================================

function startLiveTelemetry(mission) {
    async function fetchAndRender() {
        const telemetry = await getTelemetry(mission.id, true);
        if (telemetry) {
            renderTelemetry(document.getElementById('telemetry-content'), mission, telemetry, useMetric);
            if (telemetry.positionX != null) {
                updateCraftPosition(telemetry.positionX, telemetry.positionY, telemetry.positionZ);
            }
            updateTrajectoryProgress(mission.id);
        }
    }

    // Initial fetch
    fetchAndRender();

    // Poll every 30 seconds
    telemetryInterval = setInterval(fetchAndRender, 30000);

    // Update MET counter every second
    metInterval = setInterval(() => {
        updateMETDisplay(mission.launchDate);
    }, 1000);
}

function stopLiveTelemetry() {
    if (telemetryInterval) { clearInterval(telemetryInterval); telemetryInterval = null; }
    if (metInterval) { clearInterval(metInterval); metInterval = null; }
}

async function showCompletedTelemetry(mission) {
    // Show final mission stats as "telemetry" for completed missions
    const telemetry = {
        distanceFromEarthKm: 6371,
        distanceFromMoonKm: 384400,
        velocityKmS: 0,
        phase: 'Mission Complete',
        dataSource: 'Mission data',
        lastUpdated: mission.splashdownDate,
    };
    renderTelemetry(document.getElementById('telemetry-content'), mission, telemetry, useMetric);
}

// ========================================
// Footer
// ========================================

function updateFooter(mission) {
    const attr = document.getElementById('data-attribution');
    const sources = ['NASA JPL Horizons'];
    if (mission.hasLiveTelemetry) sources.unshift('NASA AROW');
    attr.textContent = `Data: ${sources.join(' \u00B7 ')} | Trajectory data is approximate`;
}

// ========================================
// Event Listeners
// ========================================

function setupEventListeners() {
    // Mission tab clicks
    document.getElementById('mission-tabs').addEventListener('click', e => {
        const tab = e.target.closest('.mission-tab');
        if (tab) selectMission(tab.dataset.mission);
    });

    // Unit toggle
    document.getElementById('unit-toggle').addEventListener('click', () => {
        useMetric = !useMetric;
        updateUnitButton();
        savePreferences();
        // Re-render with new units
        const mission = getMission(currentMissionId);
        if (mission) {
            renderDetails(document.getElementById('details-content'), mission, useMetric);
            // Telemetry will update on next poll, but force re-render now
            getTelemetry(mission.id, mission.status === MISSION_STATUS.IN_PROGRESS).then(t => {
                if (t) renderTelemetry(document.getElementById('telemetry-content'), mission, t, useMetric);
            });
        }
    });

    // Panel collapse/expand
    document.querySelectorAll('.panel-header').forEach(header => {
        header.addEventListener('click', () => {
            const panel = header.closest('.panel');
            panel.classList.toggle('collapsed');
            const key = panel.dataset.panel;
            panelStates[key] = panel.classList.contains('collapsed') ? 'collapsed' : 'expanded';
            savePreferences();
        });

        header.addEventListener('keydown', e => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                header.click();
            }
        });
    });

    // Scene focus buttons
    document.getElementById('focus-earth').addEventListener('click', focusEarth);
    document.getElementById('focus-moon').addEventListener('click', focusMoon);
    document.getElementById('focus-craft').addEventListener('click', focusCraft);
    document.getElementById('focus-reset').addEventListener('click', resetCamera);

    // Glossary modal
    const glossaryBtn = document.getElementById('glossary-btn');
    const glossaryModal = document.getElementById('glossary-modal');
    const glossarySearch = document.getElementById('glossary-search');
    const glossaryList = document.getElementById('glossary-list');
    const glossaryClose = glossaryModal.querySelector('.modal-close');
    const glossaryBackdrop = glossaryModal.querySelector('.modal-backdrop');

    glossaryBtn.addEventListener('click', () => {
        glossaryModal.hidden = false;
        glossarySearch.value = '';
        renderGlossaryList(glossaryList, getAllTerms());
        glossarySearch.focus();
    });

    glossaryClose.addEventListener('click', () => { glossaryModal.hidden = true; });
    glossaryBackdrop.addEventListener('click', () => { glossaryModal.hidden = true; });

    glossarySearch.addEventListener('input', () => {
        const q = glossarySearch.value.trim();
        const terms = q ? searchGlossary(q) : getAllTerms();
        renderGlossaryList(glossaryList, terms);
    });

    document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && !glossaryModal.hidden) {
            glossaryModal.hidden = true;
        }
    });

    // Inline glossary tooltips (event delegation)
    const tooltip = document.getElementById('tooltip');

    document.addEventListener('click', e => {
        const link = e.target.closest('.glossary-link');
        if (link) {
            e.preventDefault();
            const term = link.dataset.term;
            const entry = lookupTerm(term);
            if (!entry) return;

            tooltip.innerHTML = `
                <span class="tooltip-term">${entry.term}${entry.abbr ? ` (${entry.abbr})` : ''}</span>
                ${entry.definition}
            `;

            const rect = link.getBoundingClientRect();
            tooltip.hidden = false;
            tooltip.style.left = Math.min(rect.left, window.innerWidth - 300) + 'px';
            tooltip.style.top = (rect.bottom + 8) + 'px';
        } else if (!e.target.closest('.tooltip')) {
            tooltip.hidden = true;
        }
    });
}
