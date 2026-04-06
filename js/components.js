// ========================================
// UI Component Renderers
// ========================================

import { formatDistanceValue, formatVelocityValue, distanceUnit, velocityUnit, formatMET, formatDate, formatDateTime, formatNumber } from './unit-converter.js';
import { lookupTerm } from './glossary.js';
import { missionProgress } from './trajectory-service.js';
import { getTrajectory } from './trajectory-data.js';
import { MISSION_STATUS } from './missions.js';

/**
 * Render the telemetry dashboard panel.
 */
export function renderTelemetry(container, mission, telemetry, metric) {
    if (!telemetry) {
        container.innerHTML = '<div class="empty-state">No telemetry available for this mission.</div>';
        return;
    }

    const distEarth = formatDistanceValue(telemetry.distanceFromEarthKm, metric);
    const distMoon = formatDistanceValue(telemetry.distanceFromMoonKm, metric);
    const vel = formatVelocityValue(telemetry.velocityKmS, metric);
    const dUnit = distanceUnit(metric);
    const vUnit = velocityUnit(metric);
    const met = formatMET(mission.launchDate);

    const maxDist = mission.maxDistanceFromEarthKm || 450000;
    const distProgress = telemetry.distanceFromEarthKm ? Math.min((telemetry.distanceFromEarthKm / maxDist) * 100, 100) : 0;

    const freshness = telemetry.lastUpdated
        ? Math.round((Date.now() - telemetry.lastUpdated.getTime()) / 1000)
        : null;

    const sourceStatus = freshness !== null && freshness < 60 ? '' : freshness !== null && freshness < 300 ? 'stale' : 'error';

    container.innerHTML = `
        <div class="telemetry-grid">
            <div class="telemetry-item">
                <div class="telemetry-label">
                    Distance from Earth
                    <span class="glossary-link" data-term="Apogee" title="Click for definition">?</span>
                </div>
                <div class="telemetry-value">${distEarth}<span class="telemetry-unit">${dUnit}</span></div>
                <div class="telemetry-bar"><div class="telemetry-bar-fill" style="width:${distProgress}%"></div></div>
            </div>
            <div class="telemetry-item">
                <div class="telemetry-label">Distance from Moon</div>
                <div class="telemetry-value">${distMoon}<span class="telemetry-unit">${dUnit}</span></div>
            </div>
            <div class="telemetry-item">
                <div class="telemetry-label">Velocity</div>
                <div class="telemetry-value">${vel}<span class="telemetry-unit">${vUnit}</span></div>
            </div>
            <div class="telemetry-item">
                <div class="telemetry-label">
                    Mission Elapsed Time
                    <span class="glossary-link" data-term="MET" title="Click for definition">?</span>
                </div>
                <div class="telemetry-value telemetry-met">${met}</div>
            </div>
            <div class="telemetry-item">
                <div class="telemetry-label">Current Phase</div>
                <div class="telemetry-value" style="font-size:16px">${telemetry.phase || '--'}</div>
            </div>
        </div>
        <div class="telemetry-source">
            <span class="telemetry-source-dot ${sourceStatus}"></span>
            ${telemetry.dataSource || 'Unknown source'}${freshness !== null ? ` \u00B7 ${freshness}s ago` : ''}
        </div>
    `;
}

/**
 * Update just the MET counter without re-rendering everything.
 */
export function updateMETDisplay(launchDate) {
    const metEl = document.querySelector('.telemetry-met');
    if (metEl) {
        metEl.textContent = formatMET(launchDate);
    }
}

/**
 * Render the mission timeline panel.
 */
export function renderTimeline(container, mission) {
    const milestones = mission.milestones || [];
    if (milestones.length === 0) {
        container.innerHTML = '<div class="empty-state">Timeline details not yet available for this mission.</div>';
        return;
    }

    const now = new Date();
    const trajectory = getTrajectory(mission.id);
    const progress = trajectory ? missionProgress(trajectory, now) : 0;

    // Progress bar
    let progressHTML = '';
    if (mission.launchDate && mission.splashdownDate) {
        const totalDays = mission.durationDays || ((mission.splashdownDate - mission.launchDate) / 86400000);
        const elapsed = Math.max(0, (now - mission.launchDate) / 86400000);
        const dayDisplay = Math.min(elapsed, totalDays);
        const pct = Math.min(progress * 100, 100);

        progressHTML = `
            <div class="timeline-progress">
                <div class="timeline-progress-info">
                    <span>Day ${Math.floor(dayDisplay)} of ${Math.round(totalDays)}</span>
                    <span>${Math.round(pct)}% complete</span>
                </div>
                <div class="timeline-progress-bar">
                    <div class="timeline-progress-fill" style="width:${pct}%"></div>
                </div>
            </div>
        `;
    }

    // Milestone list
    const milestonesHTML = milestones.map(m => {
        let status = 'upcoming';
        if (m.date && m.date <= now) status = 'completed';

        // Find if this is the "current" milestone
        const nextMilestone = milestones.find(ms => ms.date && ms.date > now);
        if (nextMilestone && m.id === nextMilestone.id) status = 'current';

        // For milestones without dates (future planned), always upcoming
        if (!m.date) status = 'upcoming';

        const dateStr = m.date ? formatDateTime(m.date) : 'TBD';
        const metStr = m.metHours != null ? `MET ${m.metHours >= 0 ? '+' : ''}${m.metHours}h` : '';

        let desc = m.description || '';
        // Inject glossary links
        if (m.glossaryTerms) {
            for (const term of m.glossaryTerms) {
                const entry = lookupTerm(term);
                if (entry) {
                    desc = desc.replace(
                        new RegExp(`\\b${escapeRegex(entry.abbr || term)}\\b`, 'g'),
                        `<span class="glossary-link" data-term="${term}">${entry.abbr || term}</span>`
                    );
                }
            }
        }

        return `
            <li class="timeline-item ${status}">
                <div class="timeline-dot"></div>
                <div class="timeline-item-title">${m.title}</div>
                <div class="timeline-item-meta">${dateStr}${metStr ? ' \u00B7 ' + metStr : ''}</div>
                ${desc ? `<div class="timeline-item-description">${desc}</div>` : ''}
            </li>
        `;
    }).join('');

    container.innerHTML = `
        ${progressHTML}
        <ul class="timeline-list">${milestonesHTML}</ul>
    `;
}

/**
 * Render the crew panel.
 */
export function renderCrew(container, mission) {
    if (!mission.isCrewed || mission.crew.length === 0) {
        if (!mission.isCrewed) {
            container.innerHTML = '<div class="empty-state">This was an uncrewed mission.</div>';
        } else {
            container.innerHTML = '<div class="empty-state">Crew has not been announced yet.</div>';
        }
        return;
    }

    const crewHTML = mission.crew.map(member => `
        <div class="crew-card">
            <div class="crew-avatar">${member.initials || member.name.split(' ').map(n => n[0]).join('')}</div>
            <div class="crew-name">${member.name}</div>
            <div class="crew-role">${member.role}</div>
            <div class="crew-agency">${member.agency}</div>
        </div>
    `).join('');

    container.innerHTML = `<div class="crew-grid">${crewHTML}</div>`;
}

/**
 * Render the mission details panel.
 */
export function renderDetails(container, mission, metric) {
    const stats = [];

    if (mission.launchDate) {
        stats.push({ label: 'Launch', value: formatDateTime(mission.launchDate) });
    }
    if (mission.splashdownDate) {
        stats.push({ label: mission.status === MISSION_STATUS.COMPLETED ? 'Splashdown' : 'Expected Splashdown', value: formatDateTime(mission.splashdownDate) });
    }
    if (mission.durationDays) {
        stats.push({ label: 'Duration', value: `${mission.durationDays} days` });
    }
    if (mission.launchVehicle) {
        stats.push({ label: 'Launch Vehicle', value: mission.launchVehicle });
    }
    if (mission.maxDistanceFromEarthKm) {
        const dist = metric
            ? formatNumber(mission.maxDistanceFromEarthKm, 0) + ' km'
            : formatNumber(mission.maxDistanceFromEarthKm * 0.621371, 0) + ' mi';
        stats.push({ label: 'Max Distance from Earth', value: dist });
    }
    if (mission.closestMoonApproachKm != null) {
        const dist = metric
            ? formatNumber(mission.closestMoonApproachKm, 0) + ' km'
            : formatNumber(mission.closestMoonApproachKm * 0.621371, 0) + ' mi';
        stats.push({ label: 'Closest Moon Approach', value: dist });
    }
    if (mission.crew && mission.crew.length > 0) {
        stats.push({ label: 'Crew Size', value: mission.crew.length.toString() });
    }

    const statsHTML = stats.map(s => `
        <div class="details-stat">
            <div class="details-stat-label">${s.label}</div>
            <div class="details-stat-value">${s.value}</div>
        </div>
    `).join('');

    const objectivesHTML = (mission.objectives || []).map(o => `<li>${o}</li>`).join('');

    container.innerHTML = `
        <div class="details-description">${mission.description || ''}</div>
        <div class="details-stats">${statsHTML}</div>
        ${objectivesHTML ? `
            <div class="details-objectives">
                <h3>Mission Objectives</h3>
                <ul>${objectivesHTML}</ul>
            </div>
        ` : ''}
    `;
}

/**
 * Render the "no trajectory" overlay in the 3D scene.
 */
export function renderNoTrajectory(container, mission) {
    // We insert an overlay message into the scene container
    let overlay = container.querySelector('.no-trajectory');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'no-trajectory';
        overlay.style.position = 'absolute';
        overlay.style.inset = '0';
        overlay.style.zIndex = '5';
        container.appendChild(overlay);
    }

    if (mission.status === MISSION_STATUS.UPCOMING) {
        overlay.innerHTML = `
            <div class="no-trajectory-icon">\uD83C\uDF11</div>
            <div class="no-trajectory-text">Trajectory data will be available closer to launch.<br>
            Planned launch: ${formatDate(mission.launchDate)}</div>
        `;
        overlay.style.display = 'flex';
    } else {
        overlay.style.display = 'none';
    }
}

export function hideNoTrajectory(container) {
    const overlay = container.querySelector('.no-trajectory');
    if (overlay) overlay.style.display = 'none';
}

/**
 * Render glossary modal content.
 */
export function renderGlossaryList(container, terms) {
    container.innerHTML = terms.map(entry => `
        <div class="glossary-entry">
            <div class="glossary-term">
                ${entry.term}
                ${entry.abbr ? `<span class="glossary-abbr">(${entry.abbr})</span>` : ''}
            </div>
            <div class="glossary-def">${entry.definition}</div>
        </div>
    `).join('');
}

function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
