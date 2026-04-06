// ========================================
// Artemis Mission Catalog
// ========================================

export const MISSION_STATUS = {
    COMPLETED: 'completed',
    IN_PROGRESS: 'inProgress',
    UPCOMING: 'upcoming',
};

function d(dateStr) {
    return new Date(dateStr);
}

export const missions = [
    {
        id: 'artemis-1',
        name: 'Artemis I',
        subtitle: 'Uncrewed Lunar Test Flight',
        status: MISSION_STATUS.COMPLETED,
        launchDate: d('2022-11-16T06:47:44Z'),
        splashdownDate: d('2022-12-11T17:40:00Z'),
        durationDays: 25.5,
        launchVehicle: 'SLS Block 1',
        orionVariant: 'Uncrewed',
        isCrewed: false,
        crew: [],
        hasTrajectory: true,
        hasLiveTelemetry: false,
        maxDistanceFromEarthKm: 432210,
        closestMoonApproachKm: 130,
        description: 'The first integrated flight test of NASA\'s Space Launch System and the Orion spacecraft. This uncrewed mission sent Orion around the Moon in a distant retrograde orbit, traveling further than any spacecraft built for humans has ever flown. It validated the heat shield, propulsion, and life support systems ahead of crewed missions.',
        objectives: [
            'Test Orion spacecraft systems in deep space',
            'Validate heat shield performance at lunar return speeds (40,000 km/h)',
            'Demonstrate SLS rocket performance',
            'Test Orion\'s service module propulsion in deep space',
            'Enter and depart distant retrograde orbit around the Moon',
            'Recover Orion after ocean splashdown',
        ],
        milestones: [
            { id: 'a1-launch', title: 'Launch', description: 'SLS lifts off from Pad 39B at Kennedy Space Center.', date: d('2022-11-16T06:47:44Z'), metHours: 0 },
            { id: 'a1-tli', title: 'Trans-Lunar Injection', description: 'ICPS upper stage burn sends Orion toward the Moon.', date: d('2022-11-16T08:17:00Z'), metHours: 1.5, glossaryTerms: ['TLI', 'ICPS'] },
            { id: 'a1-outbound-flyby', title: 'Outbound Powered Flyby', description: 'Orion performs engine burn during close lunar flyby.', date: d('2022-11-21T12:44:00Z'), metHours: 126 },
            { id: 'a1-dro-insertion', title: 'DRO Insertion Burn', description: 'Orion enters distant retrograde orbit around the Moon.', date: d('2022-11-25T17:52:00Z'), metHours: 227, glossaryTerms: ['DRO'] },
            { id: 'a1-max-distance', title: 'Maximum Distance', description: 'Orion reaches 432,210 km from Earth, the farthest any human-rated spacecraft has traveled.', date: d('2022-11-28T00:00:00Z'), metHours: 281 },
            { id: 'a1-dro-departure', title: 'DRO Departure Burn', description: 'Orion exits distant retrograde orbit and begins return trajectory.', date: d('2022-12-01T21:53:00Z'), metHours: 375 },
            { id: 'a1-return-flyby', title: 'Return Powered Flyby', description: 'Close lunar flyby on the return leg, passing 128 km above the lunar surface.', date: d('2022-12-05T16:43:00Z'), metHours: 466 },
            { id: 'a1-entry', title: 'Entry Interface', description: 'Orion hits Earth\'s atmosphere at 40,000 km/h, testing the heat shield.', date: d('2022-12-11T17:20:00Z'), metHours: 610, glossaryTerms: ['Entry Interface'] },
            { id: 'a1-splashdown', title: 'Splashdown', description: 'Orion lands safely in the Pacific Ocean off the coast of Baja California.', date: d('2022-12-11T17:40:00Z'), metHours: 611 },
        ],
        stats: {
            totalDistance: '2.25 million km',
            orbitsOfMoon: 1.5,
            heatShieldTemp: '2,760\u00B0C',
        },
    },
    {
        id: 'artemis-2',
        name: 'Artemis II',
        subtitle: 'First Crewed Lunar Flyby',
        status: MISSION_STATUS.IN_PROGRESS,
        launchDate: d('2026-04-01T22:35:00Z'),
        splashdownDate: d('2026-04-11T00:07:00Z'),
        durationDays: 10,
        launchVehicle: 'SLS Block 1',
        orionVariant: 'Crewed',
        isCrewed: true,
        crew: [
            { id: 'wiseman', name: 'Reid Wiseman', role: 'Commander', agency: 'NASA', nationality: 'United States', bio: 'U.S. Navy captain and former test pilot. Previously flew on ISS Expedition 41 in 2014, spending 165 days in space. Selected as chief astronaut in 2020.', initials: 'RW', profileUrl: 'https://www.nasa.gov/people/reid-wiseman/', imageUrl: 'https://www.nasa.gov/wp-content/uploads/2023/02/jsc2023e007618.jpg' },
            { id: 'glover', name: 'Victor Glover', role: 'Pilot', agency: 'NASA', nationality: 'United States', bio: 'U.S. Navy Captain and fighter pilot. Flew on SpaceX Crew-1 to the ISS in 2020-2021, spending 168 days in space. Will be the first person of color to fly beyond low Earth orbit.', initials: 'VG', profileUrl: 'https://www.nasa.gov/people/victor-j-glover-jr/', imageUrl: 'https://www.nasa.gov/wp-content/uploads/2023/02/jsc2023e007553.jpg' },
            { id: 'koch', name: 'Christina Koch', role: 'Mission Specialist 1', agency: 'NASA', nationality: 'United States', bio: 'Electrical engineer and former station chief at NOAA. Spent 328 consecutive days on the ISS in 2019-2020, a record for women at the time. Participated in the first all-female spacewalk.', initials: 'CK', profileUrl: 'https://www.nasa.gov/people/christina-koch/', imageUrl: 'https://www.nasa.gov/wp-content/uploads/2023/02/jsc2023e007582.jpg' },
            { id: 'hansen', name: 'Jeremy Hansen', role: 'Mission Specialist 2', agency: 'CSA', nationality: 'Canada', bio: 'Colonel in the Royal Canadian Air Force and former CF-18 fighter pilot. Selected as a CSA astronaut in 2009. Will be the first Canadian to fly beyond low Earth orbit.', initials: 'JH', profileUrl: 'https://www.asc-csa.gc.ca/eng/astronauts/canadian/active/bio-jeremy-hansen.asp', imageUrl: 'https://www.asc-csa.gc.ca/images/recherche/tiles/b98bcbbb-5898-4e5a-abd3-5e4ad1d177a4.jpg' },
        ],
        hasTrajectory: true,
        hasLiveTelemetry: true,
        maxDistanceFromEarthKm: 406831,
        closestMoonApproachKm: 6543,
        description: 'The first crewed mission of the Artemis program and the first crewed flight beyond low Earth orbit since Apollo 17 in December 1972. Four astronauts will fly a free-return trajectory around the Moon, testing Orion\'s life support systems and crew operations in deep space. The mission will set a new record for the farthest distance any human has traveled from Earth.',
        objectives: [
            'First crewed test of SLS and Orion spacecraft',
            'Validate life support systems with crew aboard',
            'Test manual spacecraft control capabilities',
            'Demonstrate crew operations in deep space',
            'Perform lunar flyby at approximately 6,500 km altitude',
            'Set new human distance record from Earth (surpassing Apollo 13)',
        ],
        milestones: [
            { id: 'a2-launch', title: 'Launch', description: 'SLS lifts off from Pad 39B with four crew aboard.', date: d('2026-04-01T22:35:00Z'), metHours: 0 },
            { id: 'a2-orbit-ops', title: 'Earth Orbit Operations', description: 'Crew performs spacecraft checkout and systems tests in Earth orbit.', date: d('2026-04-02T02:00:00Z'), metHours: 3.4, glossaryTerms: ['LEO'] },
            { id: 'a2-tli', title: 'Trans-Lunar Injection', description: 'ICPS upper stage fires for approximately 6 minutes to send Orion toward the Moon.', date: d('2026-04-02T04:30:00Z'), metHours: 6, glossaryTerms: ['TLI', 'ICPS'] },
            { id: 'a2-outbound-coast', title: 'Outbound Coast', description: 'Three-day cruise to the Moon. Crew conducts tests of Orion systems and communication links.', date: d('2026-04-03T00:00:00Z'), metHours: 25 },
            { id: 'a2-comms-blackout', title: 'Communications Blackout', description: 'The Moon blocks signals between Orion and Earth for approximately 40 minutes.', date: d('2026-04-06T21:47:00Z'), metHours: 119.2 },
            { id: 'a2-lunar-flyby', title: 'Lunar Flyby', description: 'Closest approach to the Moon at approximately 6,543 km. Crew views the far side and lunar poles.', date: d('2026-04-06T23:02:00Z'), metHours: 120.5, glossaryTerms: ['Free-Return Trajectory'] },
            { id: 'a2-max-distance', title: 'Maximum Distance from Earth', description: 'Orion reaches 406,831 km from Earth, surpassing the Apollo 13 record by approximately 6,600 km.', date: d('2026-04-06T23:05:00Z'), metHours: 120.5 },
            { id: 'a2-return-coast', title: 'Return Coast', description: 'Multi-day return journey. Crew continues system tests and prepares for re-entry.', date: d('2026-04-07T12:00:00Z'), metHours: 133 },
            { id: 'a2-entry', title: 'Entry Interface', description: 'Orion enters Earth\'s atmosphere at approximately 40,000 km/h.', date: d('2026-04-10T23:40:00Z'), metHours: 217, glossaryTerms: ['Entry Interface'] },
            { id: 'a2-splashdown', title: 'Splashdown', description: 'Orion splashes down in the Pacific Ocean off the coast of San Diego.', date: d('2026-04-11T00:07:00Z'), metHours: 217.5 },
        ],
        stats: {
            distanceRecord: '406,831 km from Earth',
            lunarApproach: '6,543 km from Moon surface',
            crewSize: 4,
        },
    },
    {
        id: 'artemis-3',
        name: 'Artemis III',
        subtitle: 'Earth Orbit Rendezvous Test',
        status: MISSION_STATUS.UPCOMING,
        launchDate: d('2027-06-15T00:00:00Z'),
        splashdownDate: null,
        durationDays: null,
        launchVehicle: 'SLS Block 1B',
        orionVariant: 'Crewed',
        isCrewed: true,
        crew: [],
        hasTrajectory: false,
        hasLiveTelemetry: false,
        maxDistanceFromEarthKm: null,
        closestMoonApproachKm: null,
        description: 'A crewed mission to test low Earth orbit rendezvous and docking operations with commercial lunar landers. This critical mission will demonstrate the docking systems and EVA equipment needed for subsequent lunar surface missions.',
        objectives: [
            'Test rendezvous and docking with commercial lunar lander in Earth orbit',
            'Demonstrate extravehicular activity (EVA) equipment',
            'Evaluate lunar lander systems from Blue Origin or SpaceX',
            'Validate crew transfer procedures between Orion and lander',
        ],
        milestones: [
            { id: 'a3-launch', title: 'Launch (Planned)', description: 'First flight of SLS Block 1B with upgraded Exploration Upper Stage.', date: d('2027-06-15T00:00:00Z'), metHours: 0, glossaryTerms: ['EUS'] },
            { id: 'a3-docking', title: 'Rendezvous & Docking (Planned)', description: 'Orion docks with commercial lunar lander in Earth orbit.', date: null, metHours: null },
            { id: 'a3-eva', title: 'EVA Test (Planned)', description: 'Crew tests next-generation spacesuit systems.', date: null, metHours: null, glossaryTerms: ['EVA'] },
        ],
        stats: {},
    },
    {
        id: 'artemis-4',
        name: 'Artemis IV',
        subtitle: 'First Lunar Landing',
        status: MISSION_STATUS.UPCOMING,
        launchDate: d('2028-03-01T00:00:00Z'),
        splashdownDate: null,
        durationDays: null,
        launchVehicle: 'SLS Block 1B',
        orionVariant: 'Crewed',
        isCrewed: true,
        crew: [],
        hasTrajectory: false,
        hasLiveTelemetry: false,
        maxDistanceFromEarthKm: null,
        closestMoonApproachKm: null,
        description: 'The first crewed lunar landing since Apollo 17 in 1972. Two astronauts will descend to the Moon\'s south polar region for approximately one week of surface operations while two crew remain in lunar orbit aboard Orion.',
        objectives: [
            'First crewed lunar landing since 1972',
            'Land two astronauts near the Moon\'s south pole',
            'Conduct approximately one week of surface operations',
            'Perform scientific research and sample collection',
            'Test sustainable surface operation procedures',
        ],
        milestones: [
            { id: 'a4-launch', title: 'Launch (Planned)', description: 'SLS Block 1B launches crew toward the Moon.', date: d('2028-03-01T00:00:00Z'), metHours: 0 },
            { id: 'a4-loi', title: 'Lunar Orbit Insertion (Planned)', description: 'Orion enters orbit around the Moon.', date: null, metHours: null, glossaryTerms: ['LOI'] },
            { id: 'a4-landing', title: 'Lunar Landing (Planned)', description: 'Two crew descend to the south polar region in the commercial lander.', date: null, metHours: null },
            { id: 'a4-surface-ops', title: 'Surface Operations (Planned)', description: 'Approximately one week of EVAs, science, and exploration.', date: null, metHours: null, glossaryTerms: ['EVA'] },
            { id: 'a4-ascent', title: 'Lunar Ascent (Planned)', description: 'Surface crew ascends and redocks with Orion in lunar orbit.', date: null, metHours: null },
        ],
        stats: {},
    },
    {
        id: 'artemis-5',
        name: 'Artemis V',
        subtitle: 'Second Landing & Base Construction',
        status: MISSION_STATUS.UPCOMING,
        launchDate: d('2028-10-01T00:00:00Z'),
        splashdownDate: null,
        durationDays: null,
        launchVehicle: 'SLS Block 1B',
        orionVariant: 'Crewed',
        isCrewed: true,
        crew: [],
        hasTrajectory: false,
        hasLiveTelemetry: false,
        maxDistanceFromEarthKm: null,
        closestMoonApproachKm: null,
        description: 'The second crewed lunar landing mission, focused on beginning construction of permanent surface infrastructure. This mission marks the transition from exploration to sustained lunar presence.',
        objectives: [
            'Second crewed lunar landing at the south pole',
            'Begin permanent habitat construction',
            'Deploy surface infrastructure and power systems',
            'Extended surface operations and scientific research',
            'Demonstrate sustainable lunar presence capabilities',
        ],
        milestones: [
            { id: 'a5-launch', title: 'Launch (Planned)', description: 'Fifth SLS launch carrying crew and cargo for base construction.', date: d('2028-10-01T00:00:00Z'), metHours: 0 },
            { id: 'a5-landing', title: 'Lunar Landing (Planned)', description: 'Crew lands near south pole base site.', date: null, metHours: null },
            { id: 'a5-construction', title: 'Base Construction (Planned)', description: 'Crew begins deploying habitat and infrastructure elements.', date: null, metHours: null },
        ],
        stats: {},
    },
];

export function getMission(id) {
    return missions.find(m => m.id === id);
}

export function getActiveMission() {
    return missions.find(m => m.status === MISSION_STATUS.IN_PROGRESS);
}

export function getMissionsByStatus() {
    const order = [MISSION_STATUS.IN_PROGRESS, MISSION_STATUS.COMPLETED, MISSION_STATUS.UPCOMING];
    const groups = [];
    for (const status of order) {
        const group = missions.filter(m => m.status === status);
        if (group.length > 0) {
            groups.push({ status, missions: group });
        }
    }
    return groups;
}
