// ========================================
// Space Weather Service (NASA DONKI)
// ========================================

let cachedWeather = null;
let lastFetchTime = 0;
const CACHE_DURATION = 600000; // 10 minutes

/**
 * Fetch recent space weather events from NASA DONKI API.
 */
export async function getSpaceWeather() {
    const now = Date.now();
    if (cachedWeather && (now - lastFetchTime) < CACHE_DURATION) {
        return cachedWeather;
    }

    try {
        const endDate = new Date().toISOString().split('T')[0];
        const startDate = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];

        // Fetch solar flares and CMEs in parallel
        const [flareRes, cmeRes] = await Promise.allSettled([
            fetch(`https://kauai.ccmc.gsfc.nasa.gov/DONKI/WS/get/FLR?startDate=${startDate}&endDate=${endDate}`, { signal: AbortSignal.timeout(8000) }),
            fetch(`https://kauai.ccmc.gsfc.nasa.gov/DONKI/WS/get/CME?startDate=${startDate}&endDate=${endDate}`, { signal: AbortSignal.timeout(8000) }),
        ]);

        const flares = flareRes.status === 'fulfilled' && flareRes.value.ok
            ? await flareRes.value.json() : [];
        const cmes = cmeRes.status === 'fulfilled' && cmeRes.value.ok
            ? await cmeRes.value.json() : [];

        const result = processWeatherData(flares, cmes);
        cachedWeather = result;
        lastFetchTime = now;
        return result;
    } catch (e) {
        console.warn('Space weather fetch failed:', e.message);
        return cachedWeather || getDefaultWeather();
    }
}

function processWeatherData(flares, cmes) {
    // Determine overall risk level
    const recentFlares = Array.isArray(flares) ? flares.slice(-10) : [];
    const recentCMEs = Array.isArray(cmes) ? cmes.slice(-5) : [];

    const hasXFlare = recentFlares.some(f => f.classType && f.classType.startsWith('X'));
    const hasMFlare = recentFlares.some(f => f.classType && f.classType.startsWith('M'));
    const hasEarthDirectedCME = recentCMEs.some(c =>
        c.cmeAnalyses && c.cmeAnalyses.some(a => a.isMostAccurate && a.halfAngle > 30)
    );

    let riskLevel = 'low';
    let riskColor = '#10b981';
    let riskLabel = 'Nominal';

    if (hasXFlare || hasEarthDirectedCME) {
        riskLevel = 'high';
        riskColor = '#ef4444';
        riskLabel = 'Elevated';
    } else if (hasMFlare) {
        riskLevel = 'moderate';
        riskColor = '#f59e0b';
        riskLabel = 'Moderate';
    }

    return {
        riskLevel,
        riskColor,
        riskLabel,
        flares: recentFlares.map(f => ({
            time: f.peakTime || f.beginTime,
            classType: f.classType || 'Unknown',
            sourceLocation: f.sourceLocation || '',
        })),
        cmes: recentCMEs.map(c => ({
            time: c.startTime,
            type: c.activityID || 'CME',
            note: c.note || '',
        })),
        lastUpdated: new Date(),
        isLive: true,
    };
}

function getDefaultWeather() {
    return {
        riskLevel: 'unknown',
        riskColor: '#6b7280',
        riskLabel: 'Unavailable',
        flares: [],
        cmes: [],
        lastUpdated: null,
        isLive: false,
    };
}
