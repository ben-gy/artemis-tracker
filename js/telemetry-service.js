// ========================================
// Telemetry Service
// ========================================
// Fetches live telemetry from NASA AROW, falls back to interpolation

import { getTrajectory } from './trajectory-data.js';
import { interpolateAtDate } from './trajectory-service.js';

let lastFetch = null;
let lastData = null;
let fetchInProgress = false;

/**
 * Get current telemetry for a mission.
 * For live missions, attempts NASA AROW fetch with interpolation fallback.
 * For historical missions, always interpolates from embedded data.
 */
export async function getTelemetry(missionId, isLive = false) {
    const trajectory = getTrajectory(missionId);
    if (!trajectory) return null;

    const now = new Date();

    // For live missions, try fetching real data first
    if (isLive && !fetchInProgress) {
        // Only fetch every 30 seconds
        if (!lastFetch || (now.getTime() - lastFetch.getTime()) > 30000) {
            lastFetch = now; // Set immediately to prevent re-entry
            try {
                const liveData = await fetchAROW();
                if (liveData) {
                    lastData = {
                        ...liveData,
                        dataSource: 'NASA AROW',
                        lastUpdated: now,
                    };
                    return lastData;
                }
            } catch (e) {
                // Silently fall through to interpolation
            }
        } else if (lastData && lastData.dataSource === 'NASA AROW') {
            return lastData;
        }
    }

    // Fallback: interpolate from embedded trajectory
    const interpolated = interpolateAtDate(trajectory, now);
    if (!interpolated) return null;

    return {
        timestamp: now,
        missionElapsedTime: now.getTime() - trajectory[0].timestamp.getTime(),
        distanceFromEarthKm: interpolated.distanceFromEarthKm,
        distanceFromMoonKm: interpolated.distanceFromMoonKm,
        velocityKmS: interpolated.velocityKmS,
        phase: interpolated.phase,
        positionX: interpolated.x,
        positionY: interpolated.y,
        positionZ: interpolated.z,
        dataSource: isLive ? 'Interpolated (planned trajectory)' : 'Mission data',
        lastUpdated: now,
    };
}

/**
 * Get telemetry snapshot at a specific date (for historical missions).
 */
export function getTelemetryAt(missionId, date) {
    const trajectory = getTrajectory(missionId);
    if (!trajectory) return null;

    const interpolated = interpolateAtDate(trajectory, date);
    if (!interpolated) return null;

    return {
        timestamp: date,
        missionElapsedTime: date.getTime() - trajectory[0].timestamp.getTime(),
        distanceFromEarthKm: interpolated.distanceFromEarthKm,
        distanceFromMoonKm: interpolated.distanceFromMoonKm,
        velocityKmS: interpolated.velocityKmS,
        phase: interpolated.phase,
        positionX: interpolated.x,
        positionY: interpolated.y,
        positionZ: interpolated.z,
        dataSource: 'Mission data',
        lastUpdated: date,
    };
}

/**
 * Attempt to fetch live telemetry from NASA AROW.
 * Returns null if unavailable.
 */
async function fetchAROW() {
    fetchInProgress = true;
    try {
        // NASA AROW provides telemetry at this endpoint during active missions
        // This will 404 or error when no mission is active - that's expected
        const res = await fetch('https://eyes.nasa.gov/apps/solar-system/api/telemetry?craft=artemis2', {
            signal: AbortSignal.timeout(8000),
        });

        if (!res.ok) return null;

        const data = await res.json();
        if (!data || !data.position) return null;

        return {
            timestamp: new Date(),
            distanceFromEarthKm: data.distanceFromEarth || null,
            distanceFromMoonKm: data.distanceFromMoon || null,
            velocityKmS: data.velocity || null,
            phase: data.phase || 'Unknown',
            positionX: data.position.x || 0,
            positionY: data.position.y || 0,
            positionZ: data.position.z || 0,
        };
    } catch (e) {
        return null;
    } finally {
        fetchInProgress = false;
    }
}

/**
 * Reset the fetch cache (e.g., when switching missions).
 */
export function resetTelemetryCache() {
    lastFetch = null;
    lastData = null;
}
