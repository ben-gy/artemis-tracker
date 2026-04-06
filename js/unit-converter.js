// ========================================
// Unit Converter
// ========================================

const KM_TO_MI = 0.621371;
const KMS_TO_MPH = 2236.936;

export function formatDistance(km, metric = true) {
    if (km == null) return '--';
    if (metric) {
        return formatNumber(km) + ' km';
    }
    return formatNumber(km * KM_TO_MI) + ' mi';
}

export function formatDistanceValue(km, metric = true) {
    if (km == null) return '--';
    if (metric) return formatNumber(km);
    return formatNumber(km * KM_TO_MI);
}

export function distanceUnit(metric = true) {
    return metric ? 'km' : 'mi';
}

export function formatVelocity(kmS, metric = true) {
    if (kmS == null) return '--';
    if (metric) {
        return formatNumber(kmS, 1) + ' km/s';
    }
    return formatNumber(kmS * KMS_TO_MPH, 0) + ' mph';
}

export function formatVelocityValue(kmS, metric = true) {
    if (kmS == null) return '--';
    if (metric) return formatNumber(kmS, 1);
    return formatNumber(kmS * KMS_TO_MPH, 0);
}

export function velocityUnit(metric = true) {
    return metric ? 'km/s' : 'mph';
}

export function formatNumber(n, decimals = 0) {
    if (n == null || isNaN(n)) return '--';
    return Number(n).toLocaleString('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    });
}

export function formatMET(launchDate) {
    if (!launchDate) return '--';
    const now = Date.now();
    const launch = launchDate.getTime();
    const diff = now - launch;
    const prefix = diff >= 0 ? 'T+' : 'T-';
    const abs = Math.abs(diff);

    const days = Math.floor(abs / 86400000);
    const hours = Math.floor((abs % 86400000) / 3600000);
    const minutes = Math.floor((abs % 3600000) / 60000);
    const seconds = Math.floor((abs % 60000) / 1000);

    const parts = [];
    if (days > 0) parts.push(`${days}d`);
    parts.push(`${String(hours).padStart(2, '0')}h`);
    parts.push(`${String(minutes).padStart(2, '0')}m`);
    parts.push(`${String(seconds).padStart(2, '0')}s`);

    return prefix + parts.join(' ');
}

// Global timezone state (set by app.js)
let _timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

export function setTimezone(tz) { _timezone = tz; }
export function getTimezone() { return _timezone; }

export function formatDate(date) {
    if (!date) return 'TBD';
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        timeZone: _timezone,
    });
}

export function formatDateTime(date) {
    if (!date) return 'TBD';
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        timeZoneName: 'short',
        timeZone: _timezone,
    });
}
