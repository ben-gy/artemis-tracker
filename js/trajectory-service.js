// ========================================
// Trajectory Service
// ========================================
// Interpolation, smoothing, Moon position

/**
 * Interpolate position at a given date from trajectory waypoints.
 * Uses cubic Hermite interpolation for smooth results.
 */
export function interpolateAtDate(trajectory, date) {
    if (!trajectory || trajectory.length < 2) return null;

    const t = date.getTime();

    // Clamp to trajectory bounds
    if (t <= trajectory[0].timestamp.getTime()) return { ...trajectory[0] };
    if (t >= trajectory[trajectory.length - 1].timestamp.getTime()) return { ...trajectory[trajectory.length - 1] };

    // Find bounding points
    let i = 0;
    for (; i < trajectory.length - 1; i++) {
        if (t >= trajectory[i].timestamp.getTime() && t <= trajectory[i + 1].timestamp.getTime()) break;
    }

    const p0 = trajectory[i];
    const p1 = trajectory[i + 1];
    const t0 = p0.timestamp.getTime();
    const t1 = p1.timestamp.getTime();
    const frac = (t - t0) / (t1 - t0);

    // Smooth interpolation using smoothstep
    const s = frac * frac * (3 - 2 * frac);

    return {
        timestamp: date,
        metHours: lerp(p0.metHours, p1.metHours, s),
        x: lerp(p0.x, p1.x, s),
        y: lerp(p0.y, p1.y, s),
        z: lerp(p0.z, p1.z, s),
        velocityKmS: lerp(p0.velocityKmS, p1.velocityKmS, s),
        distanceFromEarthKm: lerp(p0.distanceFromEarthKm, p1.distanceFromEarthKm, s),
        distanceFromMoonKm: lerp(p0.distanceFromMoonKm, p1.distanceFromMoonKm, s),
        phase: frac < 0.5 ? p0.phase : p1.phase,
    };
}

function lerp(a, b, t) {
    return a + (b - a) * t;
}

/**
 * Generate smooth 3D path from trajectory waypoints using Catmull-Rom spline.
 * Returns array of {x, y, z} in scene units (km / SCALE_FACTOR).
 */
export function smoothPath(trajectory, segmentsPerSpan = 8) {
    if (!trajectory || trajectory.length < 2) return [];

    const points = trajectory.map(p => ({ x: p.x, y: p.y, z: p.z }));
    const result = [];

    for (let i = 0; i < points.length - 1; i++) {
        const p0 = points[Math.max(0, i - 1)];
        const p1 = points[i];
        const p2 = points[i + 1];
        const p3 = points[Math.min(points.length - 1, i + 2)];

        for (let j = 0; j < segmentsPerSpan; j++) {
            const t = j / segmentsPerSpan;
            result.push({
                x: catmullRom(p0.x, p1.x, p2.x, p3.x, t),
                y: catmullRom(p0.y, p1.y, p2.y, p3.y, t),
                z: catmullRom(p0.z, p1.z, p2.z, p3.z, t),
            });
        }
    }

    // Add final point
    const last = points[points.length - 1];
    result.push({ x: last.x, y: last.y, z: last.z });

    return result;
}

function catmullRom(p0, p1, p2, p3, t) {
    const t2 = t * t;
    const t3 = t2 * t;
    return 0.5 * (
        (2 * p1) +
        (-p0 + p2) * t +
        (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 +
        (-p0 + 3 * p1 - 3 * p2 + p3) * t3
    );
}

/**
 * Compute Moon position in Earth-centered ecliptic coordinates.
 * Simplified Keplerian model - sufficient for visualization.
 */
export function moonPosition(date) {
    const MOON_SEMI_MAJOR = 384400; // km
    const MOON_PERIOD_DAYS = 27.321661;
    const MOON_INCLINATION = 5.145 * Math.PI / 180; // radians

    // Reference epoch: J2000 (Jan 1, 2000 12:00 TT)
    const j2000 = new Date('2000-01-01T12:00:00Z').getTime();
    const daysSinceJ2000 = (date.getTime() - j2000) / 86400000;

    // Mean anomaly (simplified)
    const meanAnomaly = (2 * Math.PI * daysSinceJ2000 / MOON_PERIOD_DAYS) % (2 * Math.PI);

    // Simplified position (circular orbit approximation)
    const x = MOON_SEMI_MAJOR * Math.cos(meanAnomaly);
    const y = MOON_SEMI_MAJOR * Math.sin(meanAnomaly) * Math.cos(MOON_INCLINATION);
    const z = MOON_SEMI_MAJOR * Math.sin(meanAnomaly) * Math.sin(MOON_INCLINATION);

    return { x, y, z };
}

/**
 * Find which trajectory segment is "current" based on date.
 * Returns fraction (0-1) of mission completion.
 */
export function missionProgress(trajectory, date) {
    if (!trajectory || trajectory.length < 2) return 0;

    const t = date.getTime();
    const start = trajectory[0].timestamp.getTime();
    const end = trajectory[trajectory.length - 1].timestamp.getTime();

    if (t <= start) return 0;
    if (t >= end) return 1;
    return (t - start) / (end - start);
}

/**
 * Find the index in the smooth path corresponding to a trajectory fraction.
 */
export function pathIndexAtProgress(pathLength, progress) {
    return Math.min(Math.floor(progress * (pathLength - 1)), pathLength - 1);
}
