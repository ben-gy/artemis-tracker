// ========================================
// UI Component Renderers
// ========================================

import { formatDistanceValue, formatVelocityValue, distanceUnit, velocityUnit, formatMET, formatDate, formatDateTime, formatNumber } from './unit-converter.js';
import { lookupTerm } from './glossary.js';
import { missionProgress } from './trajectory-service.js';
import { getTrajectory } from './trajectory-data.js';
import { MISSION_STATUS } from './missions.js';

// ========================================
// Stats Bar
// ========================================

export function renderStatsBar(container, mission, telemetry, metric, viewDate) {
    if (mission.status === MISSION_STATUS.UPCOMING) {
        container.innerHTML = '';
        return;
    }

    const now = viewDate || new Date();
    const chips = [];

    // Mission Day
    if (mission.launchDate) {
        const elapsed = Math.max(0, (now - mission.launchDate) / 86400000);
        const day = Math.min(Math.ceil(elapsed), mission.durationDays || 999);
        const total = mission.durationDays ? `/${Math.round(mission.durationDays)}` : '';
        chips.push(`<div class="stat-chip"><span class="stat-chip-label">Day</span><span class="stat-chip-value">${day}${total}</span></div>`);
    }

    // MET
    if (mission.launchDate) {
        chips.push(`<div class="stat-chip"><span class="stat-chip-label">MET</span><span class="stat-chip-value" id="stats-met">${formatMETShort(mission.launchDate, now)}</span></div>`);
    }

    // Distance
    if (telemetry && telemetry.distanceFromEarthKm) {
        const d = formatDistanceValue(telemetry.distanceFromEarthKm, metric);
        const u = distanceUnit(metric);
        chips.push(`<div class="stat-chip"><span class="stat-chip-label">Distance</span><span class="stat-chip-value">${d} ${u}</span></div>`);
    }

    // Velocity
    if (telemetry && telemetry.velocityKmS) {
        const v = formatVelocityValue(telemetry.velocityKmS, metric);
        const u = velocityUnit(metric);
        chips.push(`<div class="stat-chip"><span class="stat-chip-label">Speed</span><span class="stat-chip-value">${v} ${u}</span></div>`);
    }

    // Phase
    if (telemetry && telemetry.phase) {
        chips.push(`<div class="stat-chip"><span class="stat-chip-label">Phase</span><span class="stat-chip-value">${telemetry.phase}</span></div>`);
    }

    // Crew status (for Artemis II based on time of day)
    if (mission.isCrewed && mission.crew.length > 0) {
        const hour = now.getUTCHours();
        const awake = hour >= 15 || hour < 8; // Crew typically awake ~11am-3am CDT
        const status = awake ? 'Awake' : 'Sleep Period';
        const color = awake ? '#10b981' : '#6b7280';
        chips.push(`<div class="stat-chip"><span class="stat-chip-dot" style="background:${color}"></span><span class="stat-chip-label">Crew</span><span class="stat-chip-value">${status}</span></div>`);
    }

    // Next milestone
    const nextMilestone = (mission.milestones || []).find(m => m.date && m.date > now);
    if (nextMilestone) {
        const hoursUntil = Math.max(0, (nextMilestone.date - now) / 3600000);
        const timeStr = hoursUntil < 1 ? `${Math.round(hoursUntil * 60)}m` : `${Math.round(hoursUntil)}h`;
        chips.push(`<div class="stat-chip"><span class="stat-chip-label">Next</span><span class="stat-chip-value">${nextMilestone.title} (${timeStr})</span></div>`);
    }

    container.innerHTML = chips.join('');
}

function formatMETShort(launchDate, now) {
    const diff = now - launchDate;
    const prefix = diff >= 0 ? 'T+' : 'T-';
    const abs = Math.abs(diff);
    const d = Math.floor(abs / 86400000);
    const h = Math.floor((abs % 86400000) / 3600000);
    const m = Math.floor((abs % 3600000) / 60000);
    return `${prefix}${d}d ${String(h).padStart(2,'0')}h ${String(m).padStart(2,'0')}m`;
}

// ========================================
// Telemetry Dashboard
// ========================================

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
    const freshness = telemetry.lastUpdated ? Math.round((Date.now() - telemetry.lastUpdated.getTime()) / 1000) : null;
    const sourceStatus = freshness !== null && freshness < 60 ? '' : freshness !== null && freshness < 300 ? 'stale' : 'error';

    container.innerHTML = `
        <div class="telemetry-grid">
            <div class="telemetry-item">
                <div class="telemetry-label">Distance from Earth <span class="glossary-link" data-term="Apogee">?</span></div>
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
                <div class="telemetry-label">Mission Elapsed Time <span class="glossary-link" data-term="MET">?</span></div>
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

export function updateMETDisplay(launchDate) {
    const metEl = document.querySelector('.telemetry-met');
    if (metEl) metEl.textContent = formatMET(launchDate);
}

// ========================================
// Mission Timeline
// ========================================

export function renderTimeline(container, mission, viewDate) {
    const milestones = mission.milestones || [];
    if (milestones.length === 0) {
        container.innerHTML = '<div class="empty-state">Timeline details not yet available for this mission.</div>';
        return;
    }

    const now = viewDate || new Date();
    const trajectory = getTrajectory(mission.id);
    const progress = trajectory ? missionProgress(trajectory, now) : 0;

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

    const milestonesHTML = milestones.map(m => {
        let status = 'upcoming';
        if (m.date && m.date <= now) status = 'completed';
        const nextMilestone = milestones.find(ms => ms.date && ms.date > now);
        if (nextMilestone && m.id === nextMilestone.id) status = 'current';
        if (!m.date) status = 'upcoming';

        const dateStr = m.date ? formatDateTime(m.date) : 'TBD';
        const metStr = m.metHours != null ? `MET ${m.metHours >= 0 ? '+' : ''}${m.metHours}h` : '';

        let desc = m.description || '';
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

        // Add data-met attribute for click-to-jump
        const metAttr = m.metHours != null ? `data-met-hours="${m.metHours}"` : '';

        return `
            <li class="timeline-item ${status}" ${metAttr} style="cursor:pointer" title="Click to jump to this event">
                <div class="timeline-dot"></div>
                <div class="timeline-item-title">${m.title}</div>
                <div class="timeline-item-meta">${dateStr}${metStr ? ' \u00B7 ' + metStr : ''}</div>
                ${desc ? `<div class="timeline-item-description">${desc}</div>` : ''}
            </li>
        `;
    }).join('');

    container.innerHTML = `${progressHTML}<ul class="timeline-list">${milestonesHTML}</ul>`;
}

// ========================================
// Crew
// ========================================

export function renderCrew(container, mission) {
    if (!mission.isCrewed || mission.crew.length === 0) {
        container.innerHTML = mission.isCrewed
            ? '<div class="empty-state">Crew has not been announced yet.</div>'
            : '<div class="empty-state">This was an uncrewed mission.</div>';
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

// ========================================
// Mission Details
// ========================================

export function renderDetails(container, mission, metric) {
    const stats = [];

    if (mission.launchDate) stats.push({ label: 'Launch', value: formatDateTime(mission.launchDate) });
    if (mission.splashdownDate) stats.push({ label: mission.status === MISSION_STATUS.COMPLETED ? 'Splashdown' : 'Expected Splashdown', value: formatDateTime(mission.splashdownDate) });
    if (mission.durationDays) stats.push({ label: 'Duration', value: `${mission.durationDays} days` });
    if (mission.launchVehicle) stats.push({ label: 'Launch Vehicle', value: mission.launchVehicle });
    if (mission.maxDistanceFromEarthKm) {
        const dist = metric ? formatNumber(mission.maxDistanceFromEarthKm, 0) + ' km' : formatNumber(mission.maxDistanceFromEarthKm * 0.621371, 0) + ' mi';
        stats.push({ label: 'Max Distance from Earth', value: dist });
    }
    if (mission.closestMoonApproachKm != null) {
        const dist = metric ? formatNumber(mission.closestMoonApproachKm, 0) + ' km' : formatNumber(mission.closestMoonApproachKm * 0.621371, 0) + ' mi';
        stats.push({ label: 'Closest Moon Approach', value: dist });
    }
    if (mission.crew && mission.crew.length > 0) stats.push({ label: 'Crew Size', value: mission.crew.length.toString() });

    const statsHTML = stats.map(s => `<div class="details-stat"><div class="details-stat-label">${s.label}</div><div class="details-stat-value">${s.value}</div></div>`).join('');
    const objectivesHTML = (mission.objectives || []).map(o => `<li>${o}</li>`).join('');

    container.innerHTML = `
        <div class="details-description">${mission.description || ''}</div>
        <div class="details-stats">${statsHTML}</div>
        ${objectivesHTML ? `<div class="details-objectives"><h3>Mission Objectives</h3><ul>${objectivesHTML}</ul></div>` : ''}
    `;
}

// ========================================
// NASA Live Video
// ========================================

export function renderVideoPanel(container, mission) {
    if (mission.status !== MISSION_STATUS.IN_PROGRESS) {
        container.innerHTML = '<div class="empty-state">Live video is available during active missions.</div>';
        return;
    }

    container.innerHTML = `
        <div class="video-embed-wrapper">
            <iframe src="https://www.youtube.com/embed/live_stream?channel=UCLA_DiR1FfKNvjuUpBHmylQ"
                    allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                    allowfullscreen loading="lazy"
                    title="NASA TV Live Stream"></iframe>
        </div>
        <div class="video-links">
            <a href="https://www.nasa.gov/live/" target="_blank" rel="noopener" class="video-link">NASA Live</a>
            <a href="https://www.nasa.gov/missions/artemis/artemis-2/track-nasas-artemis-ii-mission-in-real-time/" target="_blank" rel="noopener" class="video-link">NASA AROW</a>
            <a href="https://www.nasa.gov/blogs/artemis/" target="_blank" rel="noopener" class="video-link">Mission Blog</a>
            <a href="https://www.nasa.gov/artemisaudio/" target="_blank" rel="noopener" class="video-link">Mission Audio</a>
        </div>
    `;
}

// ========================================
// Space Weather
// ========================================

export function renderSpaceWeather(container, weatherData) {
    if (!weatherData) {
        container.innerHTML = '<div class="empty-state"><span class="loading-spinner"></span> Loading space weather data...</div>';
        return;
    }

    const riskEmoji = weatherData.riskLevel === 'high' ? '\u2622\uFE0F' : weatherData.riskLevel === 'moderate' ? '\u26A0\uFE0F' : '\u2705';
    const riskDesc = {
        low: 'Solar activity is quiet. Low radiation risk for the crew.',
        moderate: 'Moderate solar activity detected. Crew safety procedures on standby.',
        high: 'Elevated solar activity. Crew may need to shelter in radiation-protected areas.',
        unknown: 'Space weather data is currently unavailable.',
    };

    let eventsHTML = '';
    if (weatherData.flares.length > 0) {
        const flareItems = weatherData.flares.slice(-5).reverse().map(f => {
            const cls = f.classType || '?';
            const color = cls.startsWith('X') ? '#ef4444' : cls.startsWith('M') ? '#f59e0b' : '#10b981';
            const time = f.time ? new Date(f.time).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '';
            return `<li class="weather-event">
                <span class="weather-event-badge" style="background:${color}20;color:${color};border:1px solid ${color}40">${cls}</span>
                <span>Solar flare${f.sourceLocation ? ` at ${f.sourceLocation}` : ''}</span>
                <span style="margin-left:auto;color:var(--text-muted)">${time}</span>
            </li>`;
        }).join('');
        eventsHTML = `<ul class="weather-events">${flareItems}</ul>`;
    } else {
        eventsHTML = '<div class="empty-state" style="padding:8px">No significant solar events in the past 7 days.</div>';
    }

    container.innerHTML = `
        <div class="weather-summary">
            <div class="weather-risk-indicator" style="background:${weatherData.riskColor}20;border:2px solid ${weatherData.riskColor}40">${riskEmoji}</div>
            <div class="weather-risk-info">
                <h3 style="color:${weatherData.riskColor}">Radiation Risk: ${weatherData.riskLabel}</h3>
                <p>${riskDesc[weatherData.riskLevel] || riskDesc.unknown}</p>
            </div>
        </div>
        ${eventsHTML}
        ${weatherData.lastUpdated ? `<div class="telemetry-source"><span class="telemetry-source-dot"></span>NASA DONKI \u00B7 Updated ${weatherData.lastUpdated.toLocaleTimeString()}</div>` : ''}
    `;
}

// ========================================
// DSN Status
// ========================================

export function renderDSN(container, mission) {
    const stations = [
        { name: 'Goldstone', location: 'California, USA', code: 'DSS-24' },
        { name: 'Canberra', location: 'Australia', code: 'DSS-34' },
        { name: 'Madrid', location: 'Spain', code: 'DSS-54' },
    ];

    // Simulate DSN status based on time (each station covers ~120 degrees of Earth rotation)
    const hour = new Date().getUTCHours();
    const activeStations = stations.map(s => {
        let active = false;
        if (s.name === 'Goldstone') active = (hour >= 14 || hour < 6);
        if (s.name === 'Canberra') active = (hour >= 22 || hour < 14);
        if (s.name === 'Madrid') active = (hour >= 6 && hour < 22);
        return { ...s, active: mission.status === MISSION_STATUS.IN_PROGRESS ? active : false };
    });

    const stationsHTML = activeStations.map(s => `
        <div class="dsn-station">
            <div class="dsn-station-name">${s.name}</div>
            <div class="dsn-station-location">${s.location}</div>
            <div class="dsn-station-status ${s.active ? 'active' : 'standby'}">${s.active ? 'Tracking Orion' : 'Standby'}</div>
        </div>
    `).join('');

    container.innerHTML = `
        <div class="dsn-stations">${stationsHTML}</div>
        <a href="https://eyes.nasa.gov/dsn/dsn.html" target="_blank" rel="noopener" class="dsn-link">View Live DSN Status \u2192</a>
    `;
}

// ========================================
// No Trajectory Overlay
// ========================================

export function renderNoTrajectory(container, mission) {
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

// ========================================
// Glossary Modal
// ========================================

export function renderGlossaryList(container, terms) {
    container.innerHTML = terms.map(entry => `
        <div class="glossary-entry">
            <div class="glossary-term">${entry.term}${entry.abbr ? `<span class="glossary-abbr">(${entry.abbr})</span>` : ''}</div>
            <div class="glossary-def">${entry.definition}</div>
        </div>
    `).join('');
}

function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
