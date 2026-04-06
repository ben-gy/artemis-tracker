// ========================================
// Pre-calculated Trajectory Data
// ========================================
// All coordinates are relative to Earth center, in km.
// Moon position is fixed per-mission at the flyby date.
// Trajectory waypoints are designed so the path visibly loops around the Moon.

/**
 * Moon position for each mission (at closest approach date).
 * These are fixed so the trajectory and Moon are always aligned in the 3D view.
 */
export const missionMoonPositions = {
    'artemis-1': { x: 330000, y: 180000, z: 15000 },   // Nov 21, 2022 (outbound flyby)
    'artemis-2': { x: 340000, y: 200000, z: 12000 },   // Apr 6, 2026 (lunar flyby)
};

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
// 25.5-day mission: launch -> outbound flyby -> DRO -> return flyby -> splashdown
// Moon fixed at (330000, 180000, 15000)
// DRO orbit loops ~70,000 km beyond the Moon

const a1Launch = new Date('2022-11-16T06:47:44Z');
const MX1 = 330000, MY1 = 180000, MZ1 = 15000; // Moon position for Artemis I

const artemis1Raw = [
    // [hours, x, y, z, vel, distEarth, distMoon, phase]
    // Launch & TLI
    [0,       0, 0, 0,                              7.9,   6571,   380000, 'Launch'],
    [1.5,     5000, 3000, 500,                       10.4,  6200,   376000, 'TLI Burn'],
    [6,       25000, 14000, 2000,                    7.5,   29000,  356000, 'Trans-Lunar Coast'],
    // Outbound coast toward Moon
    [24,      80000, 45000, 4500,                    2.9,   92000,  290000, 'Trans-Lunar Coast'],
    [48,      150000, 85000, 8000,                   1.7,   173000, 215000, 'Trans-Lunar Coast'],
    [72,      220000, 125000, 10500,                 1.3,   254000, 130000, 'Trans-Lunar Coast'],
    [96,      275000, 155000, 12500,                 1.1,   317000, 70000,  'Trans-Lunar Coast'],
    [110,     310000, 172000, 14000,                 1.05,  356000, 25000,  'Lunar Approach'],
    // Outbound powered flyby - swing around Moon's near side
    [120,     325000, 178000, 14800,                 1.2,   371000, 8000,   'Lunar Approach'],
    [125,     332000, 182000, 15200,                 1.4,   379000, 3000,   'Outbound Powered Flyby'],
    [126,     335000, 185000, 15500,                 1.5,   383000, 130,    'Outbound Powered Flyby'],
    // Pass behind Moon and continue to DRO
    [128,     340000, 190000, 16000,                 1.3,   391000, 12000,  'Post-Flyby'],
    [132,     350000, 200000, 17000,                 0.9,   405000, 30000,  'DRO Transit'],
    [150,     370000, 225000, 20000,                 0.5,   435000, 60000,  'DRO Transit'],
    // DRO - orbit loops ~70,000km beyond Moon
    [180,     395000, 245000, 22000,                 0.35,  468000, 85000,  'DRO'],
    [210,     400000, 250000, 22000,                 0.25,  474000, 90000,  'DRO'],
    [227,     398000, 248000, 21500,                 0.22,  471000, 88000,  'DRO Insertion'],
    [260,     390000, 242000, 20000,                 0.25,  461000, 82000,  'DRO'],
    [281,     385000, 238000, 19000,                 0.22,  455000, 78000,  'Maximum Distance'],
    // DRO departure - loop back toward Moon
    [320,     370000, 225000, 17500,                 0.3,   435000, 60000,  'DRO'],
    [360,     352000, 205000, 16500,                 0.5,   408000, 35000,  'DRO Departure'],
    [375,     345000, 198000, 16000,                 0.6,   398000, 25000,  'DRO Departure'],
    // Return powered flyby - swing around Moon again
    [430,     338000, 188000, 15800,                 0.9,   388000, 12000,  'Return Approach'],
    [460,     334000, 183000, 15400,                 1.2,   381000, 5000,   'Return Approach'],
    [466,     332000, 181000, 15100,                 1.5,   379000, 128,    'Return Powered Flyby'],
    // Post-flyby - heading back to Earth
    [468,     328000, 177000, 14800,                 1.6,   374000, 6000,   'Post-Flyby Return'],
    [472,     320000, 170000, 14000,                 1.7,   363000, 18000,  'Earth Return'],
    [490,     280000, 150000, 12000,                 1.8,   318000, 65000,  'Earth Return'],
    [520,     220000, 118000, 9500,                  2.2,   250000, 140000, 'Earth Return'],
    [550,     155000, 82000, 7000,                   2.8,   176000, 220000, 'Earth Return'],
    [575,     100000, 52000, 4500,                   3.8,   113000, 285000, 'Earth Return'],
    [595,     50000, 26000, 2200,                    6.0,   56000,  340000, 'Earth Return'],
    [607,     20000, 10000, 800,                     9.0,   22000,  370000, 'Earth Return'],
    [610,     5000, 2500, 200,                       10.8,  5600,   378000, 'Entry Interface'],
    [611,     0, 0, 0,                               0,     6371,   380000, 'Splashdown'],
];

// ========================================
// Artemis II Trajectory (Apr 1 - Apr 11, 2026)
// ========================================
// 10-day free-return lunar flyby
// Moon fixed at (340000, 200000, 12000)
// Trajectory swings behind the Moon and uses gravity to return

const a2Launch = new Date('2026-04-01T22:35:00Z');
const MX2 = 340000, MY2 = 200000, MZ2 = 12000; // Moon position for Artemis II

const artemis2Raw = [
    // [hours, x, y, z, vel, distEarth, distMoon, phase]
    // Launch & Earth orbit ops
    [0,       0, 0, 0,                               7.9,   6571,   394000, 'Launch'],
    [3.4,     6000, 3500, 400,                        7.8,   7000,   390000, 'Earth Orbit Ops'],
    // TLI burn
    [6,       18000, 10000, 1500,                     10.6,  21000,  378000, 'TLI Burn'],
    // Outbound coast - 3 days toward Moon
    [12,      50000, 28000, 3000,                     5.5,   57000,  345000, 'Outbound Coast'],
    [24,      95000, 54000, 5000,                     3.2,   110000, 295000, 'Outbound Coast'],
    [36,      135000, 78000, 6800,                    2.3,   157000, 248000, 'Outbound Coast'],
    [48,      170000, 98000, 8000,                    1.8,   197000, 210000, 'Outbound Coast'],
    [60,      200000, 116000, 9000,                   1.5,   232000, 175000, 'Outbound Coast'],
    [72,      228000, 132000, 9800,                   1.3,   264000, 145000, 'Outbound Coast'],
    [84,      253000, 148000, 10400,                  1.1,   294000, 115000, 'Outbound Coast'],
    [96,      276000, 162000, 10800,                  1.0,   322000, 85000,  'Outbound Coast'],
    [108,     298000, 176000, 11200,                  0.95,  347000, 58000,  'Lunar Approach'],
    [114,     312000, 184000, 11400,                  0.95,  364000, 38000,  'Lunar Approach'],
    [117,     322000, 190000, 11600,                  1.0,   375000, 24000,  'Lunar Approach'],
    // Communications blackout - Moon blocks signals
    [119,     332000, 196000, 11800,                  1.1,   386000, 10000,  'Communications Blackout'],
    // Lunar flyby - swing BEHIND the Moon (far side)
    [119.5,   336000, 198000, 11900,                  1.2,   390000, 7000,   'Lunar Flyby'],
    [120,     340000, 200000, 12500,                  1.35,  394000, 6543,   'Lunar Flyby'],
    // Pass behind Moon - trajectory curves around far side
    [120.3,   343000, 203000, 13500,                  1.4,   398000, 6500,   'Lunar Flyby'],
    [120.6,   346000, 206000, 14500,                  1.4,   402000, 8000,   'Lunar Flyby'],
    [121,     348000, 208000, 15500,                  1.35,  406000, 11000,  'Maximum Distance'],
    // Swing back around - gravity assist redirects toward Earth
    [121.5,   348000, 210000, 15000,                  1.3,   407000, 14000,  'Post-Flyby'],
    [122,     347000, 211000, 14000,                  1.3,   406800, 16000,  'Post-Flyby'],
    [123,     344000, 212000, 13000,                  1.25,  406000, 18000,  'Post-Flyby'],
    [125,     338000, 212000, 12500,                  1.2,   402000, 14000,  'Return Coast'],
    // Return coast - 4 days back to Earth
    [130,     325000, 208000, 12000,                  1.3,   388000, 20000,  'Return Coast'],
    [140,     300000, 198000, 11500,                  1.5,   360000, 45000,  'Return Coast'],
    [150,     272000, 185000, 11000,                  1.7,   330000, 78000,  'Return Coast'],
    [160,     240000, 168000, 10200,                  1.9,   294000, 115000, 'Return Coast'],
    [170,     205000, 148000, 9200,                   2.2,   254000, 155000, 'Return Coast'],
    [180,     168000, 125000, 8000,                   2.5,   210000, 200000, 'Return Coast'],
    [190,     128000, 98000, 6500,                    3.0,   162000, 250000, 'Return Coast'],
    [200,     88000, 68000, 4800,                     3.8,   112000, 302000, 'Return Coast'],
    [208,     55000, 42000, 3200,                     5.5,   70000,  340000, 'Return Coast'],
    [213,     30000, 22000, 1800,                     8.0,   38000,  365000, 'Return Coast'],
    [216,     12000, 8000, 700,                       10.5,  14500,  383000, 'Entry Interface'],
    [217,     3000, 2000, 150,                        11.0,  3600,   392000, 'Entry Interface'],
    [217.5,   0, 0, 0,                               0,     6371,   394000, 'Splashdown'],
];

export const artemis1Trajectory = buildPoints(a1Launch, artemis1Raw);
export const artemis2Trajectory = buildPoints(a2Launch, artemis2Raw);

export function getTrajectory(missionId) {
    switch (missionId) {
        case 'artemis-1': return artemis1Trajectory;
        case 'artemis-2': return artemis2Trajectory;
        default: return null;
    }
}

export function getMoonPosition(missionId) {
    return missionMoonPositions[missionId] || null;
}
