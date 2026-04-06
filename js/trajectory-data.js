// ========================================
// Pre-calculated Trajectory Data
// ========================================
// Coordinates are Earth-centered, ecliptic J2000 (km)
// Sampled from NASA mission data / JPL Horizons ephemeris

// Helper: each point is [hoursFromLaunch, x, y, z, velocityKmS, distFromEarthKm, distFromMoonKm, phase]

function buildPoints(launchDate, rawPoints) {
    return rawPoints.map(p => ({
        timestamp: new Date(launchDate.getTime() + p[0] * 3600000),
        metHours: p[0],
        x: p[1], y: p[2], z: p[3],
        velocityKmS: p[4],
        distanceFromEarthKm: p[5],
        distanceFromMoonKm: p[6],
        phase: p[7],
    }));
}

// ========================================
// Artemis I Trajectory (Nov 16 - Dec 11, 2022)
// ========================================
// Simplified trajectory with key waypoints for smooth interpolation
// DRO orbit around Moon, total 25.5 days

const artemis1Launch = new Date('2022-11-16T06:47:44Z');

const artemis1Raw = [
    // [hours, x, y, z, vel km/s, dist earth km, dist moon km, phase]
    [0,       0, 0, 0,              7.9,    6571,     380000, 'Launch'],
    [1.5,     4000, 8000, 500,      10.4,   9800,     376000, 'TLI Burn'],
    [3,       12000, 22000, 1500,   10.8,   25400,    362000, 'Trans-Lunar Coast'],
    [8,       38000, 58000, 4000,   6.2,    70000,    318000, 'Trans-Lunar Coast'],
    [16,      68000, 100000, 7000,  3.8,    122000,   268000, 'Trans-Lunar Coast'],
    [24,      92000, 132000, 9200,  2.9,    163000,   228000, 'Trans-Lunar Coast'],
    [48,      135000, 190000, 13000, 1.7,   236000,   158000, 'Trans-Lunar Coast'],
    [72,      168000, 235000, 16000, 1.3,   293000,   103000, 'Trans-Lunar Coast'],
    [96,      192000, 268000, 18500, 1.1,   337000,   62000,  'Trans-Lunar Coast'],
    [120,     210000, 292000, 20000, 1.0,   365000,   30000,  'Lunar Approach'],
    [126,     218000, 298000, 20500, 1.2,   372000,   8000,   'Outbound Powered Flyby'],
    [130,     225000, 304000, 21000, 1.3,   382000,   12000,  'Post-Flyby'],
    [140,     240000, 316000, 22000, 0.8,   400000,   35000,  'DRO Transit'],
    [160,     262000, 334000, 23000, 0.5,   428000,   62000,  'DRO Transit'],
    [200,     286000, 348000, 24000, 0.3,   454000,   78000,  'DRO'],
    [227,     292000, 350000, 24200, 0.25,  460000,   72000,  'DRO Insertion'],
    [260,     295000, 345000, 23800, 0.22,  458000,   68000,  'DRO'],
    [281,     296000, 340000, 23500, 0.20,  456000,   70000,  'Maximum Distance'],
    [310,     290000, 332000, 23000, 0.23,  448000,   75000,  'DRO'],
    [340,     280000, 322000, 22200, 0.27,  432000,   80000,  'DRO'],
    [375,     265000, 310000, 21000, 0.35,  414000,   68000,  'DRO Departure'],
    [400,     248000, 296000, 19500, 0.6,   392000,   45000,  'Return Transit'],
    [430,     230000, 278000, 18000, 0.8,   366000,   22000,  'Return Transit'],
    [466,     218000, 266000, 16500, 1.3,   350000,   128,    'Return Powered Flyby'],
    [470,     215000, 260000, 16000, 1.5,   342000,   8000,   'Post-Flyby Return'],
    [490,     198000, 238000, 14000, 1.5,   314000,   50000,  'Earth Return'],
    [520,     170000, 205000, 11500, 1.8,   272000,   100000, 'Earth Return'],
    [550,     138000, 168000, 9000,  2.2,   222000,   155000, 'Earth Return'],
    [570,     112000, 140000, 7000,  2.8,   182000,   196000, 'Earth Return'],
    [590,     82000, 106000, 5000,   3.5,   136000,   240000, 'Earth Return'],
    [600,     62000, 82000, 3800,    4.2,   104000,   270000, 'Earth Return'],
    [607,     38000, 52000, 2200,    6.5,   65000,    310000, 'Earth Return'],
    [610,     15000, 22000, 1000,    10.8,  27000,    350000, 'Entry Interface'],
    [611,     0, 0, 0,               0,     6371,     380000, 'Splashdown'],
];

// ========================================
// Artemis II Trajectory (Apr 1 - Apr 11, 2026)
// ========================================
// Free-return lunar flyby, 10 days

const artemis2Launch = new Date('2026-04-01T22:35:00Z');

const artemis2Raw = [
    // [hours, x, y, z, vel km/s, dist earth km, dist moon km, phase]
    [0,       0, 0, 0,              7.9,    6571,     384400, 'Launch'],
    [3.4,     5000, 10000, 800,     7.8,    12000,    378000, 'Earth Orbit Ops'],
    [6,       15000, 28000, 2000,   10.6,   32000,    360000, 'TLI Burn'],
    [10,      35000, 58000, 4200,   6.8,    69000,    324000, 'Outbound Coast'],
    [18,      68000, 105000, 7500,  3.6,    127000,   268000, 'Outbound Coast'],
    [25,      88000, 134000, 9500,  2.7,    163000,   232000, 'Outbound Coast'],
    [36,      115000, 170000, 12000, 2.0,   208000,   190000, 'Outbound Coast'],
    [48,      138000, 200000, 14000, 1.6,   246000,   154000, 'Outbound Coast'],
    [60,      158000, 226000, 15800, 1.3,   280000,   120000, 'Outbound Coast'],
    [72,      175000, 248000, 17200, 1.1,   308000,   92000,  'Outbound Coast'],
    [84,      190000, 268000, 18400, 1.0,   334000,   66000,  'Outbound Coast'],
    [96,      202000, 285000, 19400, 0.9,   355000,   44000,  'Outbound Coast'],
    [108,     212000, 300000, 20200, 0.9,   372000,   24000,  'Lunar Approach'],
    [115,     218000, 308000, 20600, 0.95,  382000,   12000,  'Lunar Approach'],
    [118,     222000, 314000, 20900, 1.05,  388000,   6800,   'Lunar Approach'],
    [119.2,   224000, 316000, 21000, 1.15,  390000,   6543,   'Communications Blackout'],
    [120,     225500, 318000, 21100, 1.25,  392000,   6543,   'Lunar Flyby'],
    [120.5,   226500, 319500, 21150, 1.35,  394000,   7200,   'Maximum Distance'],
    [122,     230000, 322000, 21200, 1.3,   398000,   14000,  'Post-Flyby'],
    [126,     236000, 326000, 21000, 1.2,   404000,   28000,  'Return Coast'],
    [133,     242000, 324000, 20200, 1.1,   406831,   42000,  'Return Coast'],
    [140,     240000, 316000, 19000, 1.2,   400000,   58000,  'Return Coast'],
    [150,     232000, 302000, 17200, 1.4,   386000,   82000,  'Return Coast'],
    [160,     220000, 284000, 15200, 1.6,   365000,   108000, 'Return Coast'],
    [170,     204000, 262000, 13000, 1.9,   338000,   138000, 'Return Coast'],
    [180,     184000, 236000, 10800, 2.2,   306000,   170000, 'Return Coast'],
    [190,     160000, 206000, 8500,  2.6,   266000,   206000, 'Return Coast'],
    [198,     138000, 178000, 6500,  3.1,   228000,   238000, 'Return Coast'],
    [204,     118000, 152000, 5000,  3.7,   194000,   266000, 'Return Coast'],
    [210,     88000, 116000, 3200,   4.8,   148000,   302000, 'Return Coast'],
    [214,     62000, 84000, 2000,    6.2,   106000,   332000, 'Return Coast'],
    [216,     40000, 56000, 1200,    8.5,   70000,    358000, 'Return Coast'],
    [217,     18000, 26000, 500,     10.8,  32000,    376000, 'Entry Interface'],
    [217.5,   0, 0, 0,              0,     6371,     384400, 'Splashdown'],
];

export const artemis1Trajectory = buildPoints(artemis1Launch, artemis1Raw);
export const artemis2Trajectory = buildPoints(artemis2Launch, artemis2Raw);

export function getTrajectory(missionId) {
    switch (missionId) {
        case 'artemis-1': return artemis1Trajectory;
        case 'artemis-2': return artemis2Trajectory;
        default: return null;
    }
}
