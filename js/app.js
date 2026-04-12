// ========================================
// Artemis Mission Tracker - Main Controller
// ========================================

import { missions, getMission, getActiveMission, MISSION_STATUS } from './missions.js';
import { getAllTerms, searchGlossary, lookupTerm } from './glossary.js';
import { getTelemetry, getTelemetryAt, resetTelemetryCache } from './telemetry-service.js';
import { interpolateAtDate } from './trajectory-service.js';
import { getTrajectory } from './trajectory-data.js';
import { initScene, loadMissionTrajectory, updateSceneAtDate, showNoTrajectory, focusEarth, focusMoon, focusCraft, resetCamera, zoomIn, zoomOut, rotateLeft, rotateRight, tiltUp, tiltDown, panLeft, panRight, panUp, panDown } from './scene-builder.js';
import { renderTelemetry, updateMETDisplay, renderTimeline, renderCrew, renderDetails, renderGlossaryList, renderNoTrajectory, hideNoTrajectory, renderStatsBar, renderVideoPanel, renderSpaceWeather, renderDSN, renderSpacecraft } from './components.js';
import { formatDate, formatDateTime, setTimezone, getTimezone } from './unit-converter.js';
import { getSpaceWeather } from './space-weather.js';

// ========================================
// State
// ========================================

let currentMissionId = null;
let useMetric = true;
let panelStates = {};

// Time machine
let viewDate = new Date();       // The date being "viewed" (real-time or scrubbed)
let isLiveMode = true;           // Whether we're tracking real-time
let isPlaying = false;           // Whether playback is running (for historical missions)
let playSpeed = 60;              // Playback speed multiplier (60x = 1 minute per second)

// Intervals
let liveInterval = null;
let metInterval = null;
let playInterval = null;
let weatherInterval = null;

// ========================================
// Initialization
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    loadPreferences();
    initTimezoneDropdown();
    renderMissionTabs();
    setupEventListeners();

    const active = getActiveMission();
    selectMission(active ? active.id : missions[0].id);
});

// ========================================
// Preferences
// ========================================

function loadPreferences() {
    const saved = localStorage.getItem('artemis-prefs');
    if (saved) {
        try {
            const prefs = JSON.parse(saved);
            useMetric = prefs.metric !== false;
            panelStates = prefs.panels || {};
            if (prefs.timezone) setTimezone(prefs.timezone);
        } catch (e) { /* ignore */ }
    }
    updateUnitButton();
}

function initTimezoneDropdown() {
    const select = document.getElementById('tz-select');
    const zones = [
        { label: 'Local', value: Intl.DateTimeFormat().resolvedOptions().timeZone },
        { label: 'UTC', value: 'UTC' },
        { label: 'US Eastern', value: 'America/New_York' },
        { label: 'US Central', value: 'America/Chicago' },
        { label: 'US Pacific', value: 'America/Los_Angeles' },
        { label: 'UK (GMT/BST)', value: 'Europe/London' },
        { label: 'EU Central', value: 'Europe/Berlin' },
        { label: 'Japan', value: 'Asia/Tokyo' },
        { label: 'Australia EST', value: 'Australia/Sydney' },
        { label: 'India', value: 'Asia/Kolkata' },
    ];

    select.innerHTML = zones.map(z =>
        `<option value="${z.value}" ${z.value === getTimezone() ? 'selected' : ''}>${z.label}</option>`
    ).join('');

    select.addEventListener('change', () => {
        setTimezone(select.value);
        savePreferences();
        // Re-render everything with new timezone
        const mission = getMission(currentMissionId);
        if (mission) {
            renderAllPanels(mission);
            updateAllForDate(mission);
            updateTimeSliderLabel();
        }
    });
}

function savePreferences() {
    localStorage.setItem('artemis-prefs', JSON.stringify({ metric: useMetric, panels: panelStates, timezone: getTimezone() }));
}

function updateUnitButton() {
    const label = document.getElementById('unit-label');
    if (label) label.textContent = useMetric ? 'KM' : 'MI';
}

// ========================================
// Mission Tabs
// ========================================

function renderMissionTabs() {
    const nav = document.getElementById('mission-tabs');
    nav.innerHTML = missions.map(m => {
        const isLive = m.status === MISSION_STATUS.IN_PROGRESS;
        return `<button class="mission-tab" data-mission="${m.id}" role="tab" aria-selected="false">
            <span class="tab-status ${m.status}"></span>${m.name}${isLive ? '<span class="tab-live-badge">LIVE</span>' : ''}
        </button>`;
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

    stopAllIntervals();
    resetTelemetryCache();

    currentMissionId = missionId;
    const mission = getMission(missionId);
    if (!mission) return;

    // Reset time state
    isLiveMode = mission.status === MISSION_STATUS.IN_PROGRESS;
    isPlaying = false;
    if (isLiveMode) {
        viewDate = new Date();
    } else if (mission.status === MISSION_STATUS.COMPLETED) {
        // Use current date so all milestones show as completed; slider clamps to 100%
        viewDate = new Date();
    } else {
        viewDate = mission.launchDate || new Date();
    }

    updateTabSelection();
    updateSceneOverlay(mission);
    initializeScene(mission);
    setupTimeSlider(mission);
    renderAllPanels(mission);
    restorePanelStates();
    updateFooter(mission);

    // Start appropriate update mode
    if (mission.status === MISSION_STATUS.IN_PROGRESS) {
        startLiveMode(mission);
    }

    // Fetch space weather
    loadSpaceWeather();
}

// ========================================
// 3D Scene
// ========================================

function initializeScene(mission) {
    const container = document.getElementById('three-canvas-wrapper');
    const sceneContainer = document.getElementById('scene-container');

    initScene(container);
    hideNoTrajectory(sceneContainer);

    if (mission.hasTrajectory) {
        loadMissionTrajectory(mission.id, viewDate);
    } else {
        showNoTrajectory();
        renderNoTrajectory(sceneContainer, mission);
    }
}

function updateSceneOverlay(mission) {
    document.getElementById('scene-mission-label').textContent = mission.name;
    const badge = document.getElementById('scene-status-badge');
    const labels = { [MISSION_STATUS.COMPLETED]: 'COMPLETED', [MISSION_STATUS.IN_PROGRESS]: 'LIVE', [MISSION_STATUS.UPCOMING]: 'UPCOMING' };
    badge.textContent = labels[mission.status];
    badge.className = mission.status;
}

// ========================================
// Time Machine Slider
// ========================================

function setupTimeSlider(mission) {
    const container = document.getElementById('time-slider-container');
    const slider = document.getElementById('time-slider');
    const startLabel = document.getElementById('time-slider-start');
    const endLabel = document.getElementById('time-slider-end');
    const liveBtn = document.getElementById('time-live-btn');
    const playBtn = document.getElementById('time-play-btn');

    if (!mission.launchDate || !mission.hasTrajectory) {
        container.style.display = 'none';
        return;
    }
    container.style.display = '';

    const start = mission.launchDate.getTime();
    const end = mission.splashdownDate ? mission.splashdownDate.getTime() : start + (mission.durationDays || 10) * 86400000;

    slider.min = 0;
    slider.max = 1000;

    // Set slider position
    const progress = Math.max(0, Math.min(1, (viewDate.getTime() - start) / (end - start)));
    slider.value = Math.round(progress * 1000);

    startLabel.textContent = formatDate(mission.launchDate);
    endLabel.textContent = mission.splashdownDate ? formatDate(mission.splashdownDate) : 'TBD';
    updateTimeSliderLabel();

    // Live button visibility
    liveBtn.style.display = mission.status === MISSION_STATUS.IN_PROGRESS ? '' : 'none';
    liveBtn.classList.toggle('active', isLiveMode);

    // Play button
    playBtn.textContent = isPlaying ? '\u23F8' : '\u25B6';
}

function updateTimeSliderLabel() {
    const label = document.getElementById('time-slider-current');
    const mission = getMission(currentMissionId);
    if (!mission || !mission.launchDate) return;

    const met = viewDate.getTime() - mission.launchDate.getTime();
    const prefix = met >= 0 ? 'T+' : 'T-';
    const abs = Math.abs(met);
    const d = Math.floor(abs / 86400000);
    const h = Math.floor((abs % 86400000) / 3600000);
    const m = Math.floor((abs % 3600000) / 60000);

    label.textContent = `${prefix}${d}d ${String(h).padStart(2, '0')}h ${String(m).padStart(2, '0')}m \u2022 ${viewDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`;
}

function onSliderInput() {
    const mission = getMission(currentMissionId);
    if (!mission || !mission.launchDate) return;

    const slider = document.getElementById('time-slider');
    const start = mission.launchDate.getTime();
    const end = mission.splashdownDate ? mission.splashdownDate.getTime() : start + (mission.durationDays || 10) * 86400000;
    const frac = parseInt(slider.value) / 1000;

    viewDate = new Date(start + frac * (end - start));
    isLiveMode = false;
    document.getElementById('time-live-btn').classList.remove('active');

    updateTimeSliderLabel();
    updateAllForDate(mission);
}

function jumpToLive() {
    isLiveMode = true;
    isPlaying = false;
    viewDate = new Date();
    document.getElementById('time-live-btn').classList.add('active');
    document.getElementById('time-play-btn').textContent = '\u25B6';

    if (playInterval) { clearInterval(playInterval); playInterval = null; }

    const mission = getMission(currentMissionId);
    if (mission) {
        updateSliderPosition(mission);
        updateAllForDate(mission);
    }
}

function togglePlayback() {
    const mission = getMission(currentMissionId);
    if (!mission || !mission.launchDate) return;

    isPlaying = !isPlaying;
    isLiveMode = false;
    document.getElementById('time-live-btn').classList.remove('active');
    document.getElementById('time-play-btn').textContent = isPlaying ? '\u23F8' : '\u25B6';

    if (isPlaying) {
        const start = mission.launchDate.getTime();
        const end = mission.splashdownDate ? mission.splashdownDate.getTime() : start + (mission.durationDays || 10) * 86400000;

        playInterval = setInterval(() => {
            viewDate = new Date(viewDate.getTime() + playSpeed * 1000); // advance by playSpeed seconds per tick
            if (viewDate.getTime() > end) {
                viewDate = new Date(end);
                isPlaying = false;
                document.getElementById('time-play-btn').textContent = '\u25B6';
                clearInterval(playInterval);
                playInterval = null;
            }
            updateSliderPosition(mission);
            updateAllForDate(mission);
        }, 50); // 20fps
    } else {
        if (playInterval) { clearInterval(playInterval); playInterval = null; }
    }
}

function updateSliderPosition(mission) {
    const slider = document.getElementById('time-slider');
    if (!mission.launchDate) return;
    const start = mission.launchDate.getTime();
    const end = mission.splashdownDate ? mission.splashdownDate.getTime() : start + (mission.durationDays || 10) * 86400000;
    const progress = Math.max(0, Math.min(1, (viewDate.getTime() - start) / (end - start)));
    slider.value = Math.round(progress * 1000);
    updateTimeSliderLabel();
}

function jumpToMET(metHours) {
    const mission = getMission(currentMissionId);
    if (!mission || !mission.launchDate) return;

    isLiveMode = false;
    isPlaying = false;
    document.getElementById('time-live-btn').classList.remove('active');
    document.getElementById('time-play-btn').textContent = '\u25B6';
    if (playInterval) { clearInterval(playInterval); playInterval = null; }

    viewDate = new Date(mission.launchDate.getTime() + metHours * 3600000);
    updateSliderPosition(mission);
    updateAllForDate(mission);
}

// ========================================
// Update Everything for Current viewDate
// ========================================

function updateAllForDate(mission) {
    // Update 3D scene
    if (mission.hasTrajectory) {
        updateSceneAtDate(viewDate);
    }

    // Update telemetry
    const trajectory = getTrajectory(mission.id);
    if (trajectory) {
        const interpolated = interpolateAtDate(trajectory, viewDate);
        if (interpolated) {
            const telemetry = {
                distanceFromEarthKm: interpolated.distanceFromEarthKm,
                distanceFromMoonKm: interpolated.distanceFromMoonKm,
                velocityKmS: interpolated.velocityKmS,
                phase: interpolated.phase,
                positionX: interpolated.x,
                positionY: interpolated.y,
                positionZ: interpolated.z,
                dataSource: isLiveMode ? 'Interpolated (planned trajectory)' : 'Mission timeline',
                lastUpdated: new Date(),
            };
            renderTelemetry(document.getElementById('telemetry-content'), mission, telemetry, useMetric);
            renderStatsBar(document.getElementById('stats-bar'), mission, telemetry, useMetric, viewDate);
        }
    }

    // Update timeline
    renderTimeline(document.getElementById('timeline-content'), mission, viewDate);
}

// ========================================
// Live Mode
// ========================================

function startLiveMode(mission) {
    // Poll telemetry every 30 seconds
    async function fetchAndRender() {
        if (!isLiveMode) return;
        viewDate = new Date();
        const telemetry = await getTelemetry(mission.id, true);
        if (telemetry) {
            renderTelemetry(document.getElementById('telemetry-content'), mission, telemetry, useMetric);
            renderStatsBar(document.getElementById('stats-bar'), mission, telemetry, useMetric, viewDate);
            if (mission.hasTrajectory) updateSceneAtDate(viewDate);
        }
        updateSliderPosition(mission);
    }

    fetchAndRender();
    liveInterval = setInterval(fetchAndRender, 30000);

    // MET counter every second
    metInterval = setInterval(() => {
        if (isLiveMode) {
            viewDate = new Date();
            updateMETDisplay(mission.launchDate);
            updateSliderPosition(mission);
        }
    }, 1000);
}

// ========================================
// Panel Rendering
// ========================================

function renderAllPanels(mission) {
    const telemetryPanel = document.getElementById('telemetry-panel');
    const videoPanel = document.getElementById('video-panel');
    const crewPanel = document.getElementById('crew-panel');
    const weatherPanel = document.getElementById('weather-panel');
    const dsnPanel = document.getElementById('dsn-panel');

    // Show/hide panels
    telemetryPanel.style.display = mission.status === MISSION_STATUS.UPCOMING ? 'none' : '';
    videoPanel.style.display = mission.status === MISSION_STATUS.IN_PROGRESS ? '' : 'none';
    crewPanel.style.display = (!mission.isCrewed && mission.crew.length === 0) ? 'none' : '';
    dsnPanel.style.display = (mission.status === MISSION_STATUS.IN_PROGRESS || mission.status === MISSION_STATUS.COMPLETED) ? '' : 'none';

    // Render all
    renderTimeline(document.getElementById('timeline-content'), mission, viewDate);
    renderCrew(document.getElementById('crew-content'), mission);
    renderDetails(document.getElementById('details-content'), mission, useMetric);
    renderVideoPanel(document.getElementById('video-content'), mission);
    renderDSN(document.getElementById('dsn-content'), mission);
    renderSpacecraft(document.getElementById('spacecraft-content'), mission);
    renderStatsBar(document.getElementById('stats-bar'), mission, null, useMetric, viewDate);

    // Telemetry - show loading for live, or interpolated for historical
    if (mission.status === MISSION_STATUS.IN_PROGRESS) {
        document.getElementById('telemetry-content').innerHTML = '<div class="empty-state"><span class="loading-spinner"></span> Loading telemetry...</div>';
    } else if (mission.hasTrajectory) {
        updateAllForDate(mission);
    }

    // Space weather loading state
    document.getElementById('weather-content').innerHTML = '<div class="empty-state"><span class="loading-spinner"></span> Loading space weather...</div>';
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
// Space Weather
// ========================================

async function loadSpaceWeather() {
    const data = await getSpaceWeather();
    renderSpaceWeather(document.getElementById('weather-content'), data);

    // Refresh every 10 minutes
    if (weatherInterval) clearInterval(weatherInterval);
    weatherInterval = setInterval(async () => {
        const d = await getSpaceWeather();
        renderSpaceWeather(document.getElementById('weather-content'), d);
    }, 600000);
}

// ========================================
// Footer
// ========================================

function updateFooter(mission) {
    const sourcesEl = document.getElementById('footer-sources');
    const creditEl = document.getElementById('footer-credit');

    const sources = [
        { name: 'NASA AROW', url: 'https://www.nasa.gov/missions/artemis-ii/arow/' },
        { name: 'JPL Horizons', url: 'https://ssd.jpl.nasa.gov/horizons/' },
        { name: 'NASA DONKI', url: 'https://ccmc.gsfc.nasa.gov/tools/DONKI/' },
        { name: 'DSN Now', url: 'https://eyes.nasa.gov/dsn/dsn.html' },
        { name: 'NASA TV', url: 'https://www.nasa.gov/live/' },
        { name: 'NASA Artemis', url: 'https://www.nasa.gov/mission/artemis-ii/' },
    ];

    sourcesEl.innerHTML = 'Data: ' + sources.map(s =>
        `<a href="${s.url}" target="_blank" rel="noopener">${s.name}</a>`
    ).join(' \u00B7 ') + ' | Trajectory data is approximate';

    creditEl.innerHTML = 'Built by <a href="https://benrichardson.dev/" target="_blank" rel="noopener" class="chicago-font">benrichardson.dev</a>';
}

// ========================================
// Intervals Cleanup
// ========================================

function stopAllIntervals() {
    if (liveInterval) { clearInterval(liveInterval); liveInterval = null; }
    if (metInterval) { clearInterval(metInterval); metInterval = null; }
    if (playInterval) { clearInterval(playInterval); playInterval = null; }
    if (weatherInterval) { clearInterval(weatherInterval); weatherInterval = null; }
}

// ========================================
// Event Listeners
// ========================================

function setupEventListeners() {
    // Mission tabs
    document.getElementById('mission-tabs').addEventListener('click', e => {
        const tab = e.target.closest('.mission-tab');
        if (tab) selectMission(tab.dataset.mission);
    });

    // Unit toggle
    document.getElementById('unit-toggle').addEventListener('click', () => {
        useMetric = !useMetric;
        updateUnitButton();
        savePreferences();
        const mission = getMission(currentMissionId);
        if (mission) {
            renderDetails(document.getElementById('details-content'), mission, useMetric);
            updateAllForDate(mission);
        }
    });

    // Panel collapse/expand
    document.querySelectorAll('.panel-header').forEach(header => {
        header.addEventListener('click', () => {
            const panel = header.closest('.panel');
            panel.classList.toggle('collapsed');
            panelStates[panel.dataset.panel] = panel.classList.contains('collapsed') ? 'collapsed' : 'expanded';
            savePreferences();
        });
        header.addEventListener('keydown', e => {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); header.click(); }
        });
    });

    // Scene focus buttons
    document.getElementById('focus-earth').addEventListener('click', focusEarth);
    document.getElementById('focus-moon').addEventListener('click', focusMoon);
    document.getElementById('focus-craft').addEventListener('click', focusCraft);
    document.getElementById('focus-reset').addEventListener('click', resetCamera);

    // Camera controls
    document.getElementById('cam-zoom-in').addEventListener('click', zoomIn);
    document.getElementById('cam-zoom-out').addEventListener('click', zoomOut);
    document.getElementById('cam-left').addEventListener('click', rotateLeft);
    document.getElementById('cam-right').addEventListener('click', rotateRight);
    document.getElementById('cam-up').addEventListener('click', tiltUp);
    document.getElementById('cam-down').addEventListener('click', tiltDown);
    document.getElementById('pan-left').addEventListener('click', panLeft);
    document.getElementById('pan-right').addEventListener('click', panRight);
    document.getElementById('pan-up').addEventListener('click', panUp);
    document.getElementById('pan-down').addEventListener('click', panDown);

    // Time slider
    document.getElementById('time-slider').addEventListener('input', onSliderInput);
    document.getElementById('time-live-btn').addEventListener('click', jumpToLive);
    document.getElementById('time-play-btn').addEventListener('click', togglePlayback);

    // Keyboard shortcuts
    document.addEventListener('keydown', e => {
        // Escape closes glossary
        if (e.key === 'Escape') {
            document.getElementById('glossary-modal').hidden = true;
            return;
        }

        // Don't handle shortcuts when typing in inputs
        if (e.target.tagName === 'INPUT') return;

        const mission = getMission(currentMissionId);
        if (!mission || !mission.launchDate) return;

        if (e.key === 'ArrowRight') {
            e.preventDefault();
            isLiveMode = false;
            document.getElementById('time-live-btn').classList.remove('active');
            viewDate = new Date(viewDate.getTime() + (e.shiftKey ? 3600000 : 600000)); // 10min or 1hr with shift
            updateSliderPosition(mission);
            updateAllForDate(mission);
        } else if (e.key === 'ArrowLeft') {
            e.preventDefault();
            isLiveMode = false;
            document.getElementById('time-live-btn').classList.remove('active');
            viewDate = new Date(viewDate.getTime() - (e.shiftKey ? 3600000 : 600000));
            updateSliderPosition(mission);
            updateAllForDate(mission);
        } else if (e.key === ' ' || e.key === 'k') {
            e.preventDefault();
            togglePlayback();
        } else if (e.key === 'l') {
            jumpToLive();
        }
    });

    // Timeline click-to-jump (event delegation)
    document.getElementById('timeline-content').addEventListener('click', e => {
        const item = e.target.closest('.timeline-item');
        if (item && item.dataset.metHours != null) {
            jumpToMET(parseFloat(item.dataset.metHours));
        }
    });

    // Glossary modal
    const glossaryBtn = document.getElementById('glossary-btn');
    const glossaryModal = document.getElementById('glossary-modal');
    const glossarySearch = document.getElementById('glossary-search');
    const glossaryList = document.getElementById('glossary-list');

    glossaryBtn.addEventListener('click', () => {
        glossaryModal.hidden = false;
        glossarySearch.value = '';
        renderGlossaryList(glossaryList, getAllTerms());
        glossarySearch.focus();
    });

    glossaryModal.querySelector('.modal-close').addEventListener('click', () => { glossaryModal.hidden = true; });
    glossaryModal.querySelector('.modal-backdrop').addEventListener('click', () => { glossaryModal.hidden = true; });
    glossarySearch.addEventListener('input', () => {
        const q = glossarySearch.value.trim();
        renderGlossaryList(glossaryList, q ? searchGlossary(q) : getAllTerms());
    });

    // Glossary tooltips
    const tooltip = document.getElementById('tooltip');
    document.addEventListener('click', e => {
        const link = e.target.closest('.glossary-link');
        if (link) {
            e.preventDefault();
            const entry = lookupTerm(link.dataset.term);
            if (!entry) return;
            tooltip.innerHTML = `<span class="tooltip-term">${entry.term}${entry.abbr ? ` (${entry.abbr})` : ''}</span>${entry.definition}`;
            const rect = link.getBoundingClientRect();
            tooltip.hidden = false;
            tooltip.style.left = Math.min(rect.left, window.innerWidth - 300) + 'px';
            tooltip.style.top = (rect.bottom + 8) + 'px';
        } else if (!e.target.closest('.tooltip')) {
            tooltip.hidden = true;
        }
    });
}
