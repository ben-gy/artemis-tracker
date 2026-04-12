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
        status: MISSION_STATUS.COMPLETED,
        launchDate: d('2026-04-01T22:35:00Z'),
        splashdownDate: d('2026-04-11T00:07:00Z'),
        durationDays: 10,
        launchVehicle: 'SLS Block 1',
        orionVariant: 'Crewed',
        isCrewed: true,
        crew: [
            { id: 'wiseman', name: 'Reid Wiseman', role: 'Commander', agency: 'NASA', nationality: 'United States', bio: 'U.S. Navy captain and former test pilot. Previously flew on ISS Expedition 41 in 2014, spending 165 days in space. Selected as chief astronaut in 2020.', initials: 'RW', profileUrl: 'https://www.nasa.gov/people/reid-wiseman/', imageUrl: 'https://www.nasa.gov/wp-content/uploads/2023/04/52790585976-d4f4e2e2f3-k.jpg' },
            { id: 'glover', name: 'Victor Glover', role: 'Pilot', agency: 'NASA', nationality: 'United States', bio: 'U.S. Navy Captain and fighter pilot. Flew on SpaceX Crew-1 to the ISS in 2020-2021, spending 168 days in space. Will be the first person of color to fly beyond low Earth orbit.', initials: 'VG', profileUrl: 'https://www.nasa.gov/people/victor-j-glover-jr/', imageUrl: 'https://www.nasa.gov/wp-content/uploads/2016/02/nasa-astronaut-victor-j.-glover-.jpeg' },
            { id: 'koch', name: 'Christina Koch', role: 'Mission Specialist 1', agency: 'NASA', nationality: 'United States', bio: 'Electrical engineer and former station chief at NOAA. Spent 328 consecutive days on the ISS in 2019-2020, a record for women at the time. Participated in the first all-female spacewalk.', initials: 'CK', profileUrl: 'https://www.nasa.gov/people/christina-koch/', imageUrl: 'https://www.nasa.gov/wp-content/uploads/2023/04/52790818034-bbe4a4c0fa-k.jpg' },
            { id: 'hansen', name: 'Jeremy Hansen', role: 'Mission Specialist 2', agency: 'CSA', nationality: 'Canada', bio: 'Colonel in the Royal Canadian Air Force and former CF-18 fighter pilot. Selected as a CSA astronaut in 2009. Will be the first Canadian to fly beyond low Earth orbit.', initials: 'JH', profileUrl: 'https://www.asc-csa.gc.ca/eng/astronauts/canadian/active/bio-jeremy-hansen.asp', imageUrl: 'https://www.asc-csa.gc.ca/images/recherche/tiles/6889fd80-6795-420c-8a4a-b9f239d55142.jpg' },
        ],
        hasTrajectory: true,
        hasLiveTelemetry: false,
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
            // Launch & Ascent
            { id: 'a2-launch', title: 'SLS Launch', description: 'Space Launch System lifts off from Launch Complex 39B at Kennedy Space Center with four astronauts aboard Orion. Twin solid rocket boosters and four RS-25 engines produce 8.8 million pounds of thrust.', date: d('2026-04-01T22:35:00Z'), metHours: 0, category: 'milestone', glossaryTerms: ['SLS', 'Pad 39B'] },
            { id: 'a2-srb-sep', title: 'SRB Separation', description: 'Twin solid rocket boosters separate from the core stage approximately 2 minutes after liftoff at an altitude of roughly 48 km (30 miles).', date: d('2026-04-01T22:37:00Z'), metHours: 0.03, category: 'maneuver', glossaryTerms: ['SRB'] },
            { id: 'a2-core-sep', title: 'Core Stage Separation & ICPS Ignition', description: 'SLS core stage separates and the Interim Cryogenic Propulsion Stage fires, placing Orion into an initial parking orbit at approximately 185 km altitude.', date: d('2026-04-01T22:43:00Z'), metHours: 0.13, category: 'maneuver', glossaryTerms: ['ICPS'] },
            { id: 'a2-las-jettison', title: 'Launch Escape System Jettison', description: 'The Launch Abort System tower is jettisoned, no longer needed once Orion reaches orbit. Fairing panels protecting the service module are also released.', date: d('2026-04-01T22:49:00Z'), metHours: 0.23, category: 'maneuver' },
            { id: 'a2-solar-deploy', title: 'Solar Array Deployment', description: 'Orion\'s four solar array wings unfold and begin generating approximately 11 kilowatts of power. Crew confirms nominal deployment.', date: d('2026-04-01T22:56:00Z'), metHours: 0.35, category: 'milestone' },
            { id: 'a2-post-insert', title: 'Post-Insertion Spacecraft Checkout', description: 'Crew begins initial checkout of Orion systems in orbit, verifying life support, power generation, navigation, and communications before committing to TLI burn.', date: d('2026-04-01T23:04:00Z'), metHours: 0.48, category: 'crew' },
            // Earth Orbit & Checkout
            { id: 'a2-orbit-phase', title: 'Earth Orbit & Checkout Phase Begins', description: 'Orion enters the planned Earth orbit checkout period. Crew and ground controllers methodically verify all spacecraft systems before committing to trans-lunar injection.', date: d('2026-04-01T23:25:00Z'), metHours: 0.83, category: 'milestone' },
            { id: 'a2-eclss', title: 'Life Support System Verification', description: 'Crew performs thorough checkout of the Environmental Control and Life Support System (ECLSS), verifying atmosphere composition, temperature regulation, and CO2 scrubbing.', date: d('2026-04-02T00:59:00Z'), metHours: 2.4, category: 'crew' },
            { id: 'a2-nav-check', title: 'Navigation & Communication Checks', description: 'Commander Wiseman and Pilot Glover verify navigation system accuracy against ground tracking and test all communication links, including S-band voice and high-rate data.', date: d('2026-04-02T03:23:00Z'), metHours: 4.8, category: 'comms', glossaryTerms: ['DSN'] },
            { id: 'a2-meal1', title: 'Crew Meal & Rest Period', description: 'First scheduled meal aboard Orion. The crew takes a brief break after the intense launch and checkout sequence.', date: d('2026-04-02T06:59:00Z'), metHours: 8.4, category: 'rest' },
            { id: 'a2-prop-check', title: 'Propulsion System Checkout', description: 'Final verification of ICPS upper stage and Orion main engine systems in preparation for Trans-Lunar Injection. Propellant levels and engine temperatures confirmed nominal.', date: d('2026-04-02T10:35:00Z'), metHours: 12, category: 'maneuver' },
            { id: 'a2-tli-review', title: 'TLI Readiness Review', description: 'Mission Control and crew complete the final go/no-go poll for Trans-Lunar Injection. All systems confirmed go, committing Orion to leave Earth orbit and head for the Moon.', date: d('2026-04-02T17:47:00Z'), metHours: 19.2, category: 'milestone' },
            { id: 'a2-strap-in', title: 'Crew Straps In for TLI', description: 'All four crew members secure themselves in their seats and close their visors in preparation for the high-thrust Trans-Lunar Injection burn.', date: d('2026-04-02T22:35:00Z'), metHours: 24, category: 'crew' },
            // Trans-Lunar Injection
            { id: 'a2-tli', title: 'Trans-Lunar Injection Burn', description: 'ICPS upper stage fires for approximately 18 minutes, accelerating Orion from 7.8 km/s to roughly 10.8 km/s (24,200 mph). This critical burn sends the crew on their way to the Moon.', date: d('2026-04-02T23:48:00Z'), metHours: 25.2, category: 'maneuver', glossaryTerms: ['TLI', 'ICPS'] },
            // Outbound Coast
            { id: 'a2-icps-sep', title: 'ICPS Separation & Outbound Coast Begins', description: 'Orion separates from the spent ICPS upper stage and begins the multi-day coast to the Moon. Crew can now remove their suits and move within the cabin.', date: d('2026-04-02T23:54:00Z'), metHours: 25.3, category: 'milestone', glossaryTerms: ['ICPS'] },
            { id: 'a2-post-tli', title: 'Post-TLI Systems Check', description: 'Crew verifies all spacecraft systems are nominal after the intense TLI burn. Solar array pointing, thermal control, and power generation confirmed operational.', date: d('2026-04-03T00:59:00Z'), metHours: 26.4, category: 'crew' },
            { id: 'a2-suit-doff', title: 'Crew Suit Doff & Cabin Configuration', description: 'Crew removes their Orion Crew Survival System (OCSS) pressure suits and stows them. Cabin reconfigured for coast phase with sleeping accommodations and work areas.', date: d('2026-04-03T03:23:00Z'), metHours: 28.8, category: 'crew' },
            { id: 'a2-sleep1', title: 'Crew Sleep Period 1', description: 'First scheduled sleep period in deep space. Crew takes shifts, with two sleeping while two monitor spacecraft systems.', date: d('2026-04-03T07:35:00Z'), metHours: 33, category: 'rest' },
            { id: 'a2-tcm1', title: 'Trajectory Correction 1 (TCM-1)', description: 'First planned trajectory correction burn using the service module engine. Fine-tunes Orion\'s path toward the Moon based on actual TLI performance.', date: d('2026-04-03T16:35:00Z'), metHours: 42, category: 'maneuver' },
            { id: 'a2-earth-obs', title: 'Earth Observation Session', description: 'Crew photographs Earth from increasing distance using onboard cameras for public outreach and to calibrate the optical navigation system.', date: d('2026-04-03T22:35:00Z'), metHours: 48, category: 'science' },
            { id: 'a2-sleep2', title: 'Crew Sleep Period 2', description: 'Second rest period. Sleep stations in Orion accommodate two crew at a time in the lower equipment bay, using sleeping bags attached to the walls.', date: d('2026-04-04T07:35:00Z'), metHours: 57, category: 'rest' },
            { id: 'a2-radiation', title: 'Radiation Environment Monitoring', description: 'Crew reads out onboard radiation dosimeters and reports personal radiation exposure levels. Data validates spacecraft radiation shielding for future deep-space missions.', date: d('2026-04-04T16:35:00Z'), metHours: 66, category: 'science' },
            { id: 'a2-tcm2', title: 'Trajectory Correction 2 (TCM-2)', description: 'Second trajectory correction burn to refine lunar approach geometry. Service module OMS engine fires briefly to adjust velocity and ensure correct flyby altitude.', date: d('2026-04-04T22:35:00Z'), metHours: 72, category: 'maneuver' },
            { id: 'a2-health', title: 'Crew Midcourse Health Check', description: 'All crew members perform a medical self-assessment using onboard instruments. Ground flight surgeons review data to confirm no health concerns from deep-space environment.', date: d('2026-04-05T00:59:00Z'), metHours: 74.4, category: 'crew' },
            { id: 'a2-sleep3', title: 'Crew Sleep Period 3', description: 'Third rest period during coast to the Moon. Crew settles into routine of 16 hours awake and 8 hours sleep.', date: d('2026-04-05T07:35:00Z'), metHours: 81, category: 'rest' },
            { id: 'a2-dsn-test', title: 'Deep Space Network Communications Test', description: 'Full checkout of all DSN communications links at extended distance. Tests high-data-rate video downlink and command uplink latency, now approximately 1.5 seconds each way.', date: d('2026-04-05T16:35:00Z'), metHours: 90, category: 'comms', glossaryTerms: ['DSN'] },
            { id: 'a2-gnc', title: 'Guidance, Navigation & Control Checkout', description: 'Crew and ground controllers verify accuracy of star trackers and inertial measurement units as Orion approaches the halfway point to the Moon.', date: d('2026-04-05T22:35:00Z'), metHours: 96, category: 'science' },
            { id: 'a2-sleep4', title: 'Crew Sleep Period 4', description: 'Final full sleep period before the lunar flyby. Crew rests up for the busy flyby activities ahead, the most dynamic portion of the mission.', date: d('2026-04-06T08:11:00Z'), metHours: 105.6, category: 'rest' },
            { id: 'a2-tcm3', title: 'Trajectory Correction 3 (TCM-3)', description: 'Final trajectory correction before lunar flyby. Locks in the precise approach altitude and angle for the free-return flyby.', date: d('2026-04-06T17:47:00Z'), metHours: 115.2, category: 'maneuver' },
            { id: 'a2-flyby-prep', title: 'Lunar Flyby Preparations', description: 'All four crew members don their pressure suits and strap in. Systems configured for close approach. Final checklists with Mission Control.', date: d('2026-04-06T20:11:00Z'), metHours: 117.6, category: 'crew' },
            { id: 'a2-moon-visible', title: 'Moon Visible from Windows', description: 'The Moon fills the windows of the Orion crew module as the spacecraft rapidly approaches. Crew captures photographs and video of the growing lunar disc for the first time in over 50 years with human eyes.', date: d('2026-04-06T22:35:00Z'), metHours: 120, category: 'milestone' },
            // Lunar Flyby
            { id: 'a2-closest', title: 'Closest Lunar Approach', description: 'Orion swings around the far side of the Moon at approximately 8,900 km (5,500 miles). Crew becomes the first humans to see the lunar far side with their own eyes since Apollo 17 in 1972.', date: d('2026-04-06T23:58:00Z'), metHours: 121.4, category: 'milestone', glossaryTerms: ['Perilune', 'Free-Return Trajectory'] },
            { id: 'a2-los', title: 'Loss of Signal (Behind the Moon)', description: 'Orion passes behind the Moon and loses line-of-sight communication with Earth. Crew relies on onboard systems during this ~20-minute blackout, the most isolated point of the mission.', date: d('2026-04-07T00:01:00Z'), metHours: 121.4, category: 'comms' },
            { id: 'a2-aos', title: 'Acquisition of Signal (Moon Exit)', description: 'Communication re-established as Orion emerges from behind the Moon. Crew reports on their experience seeing the lunar far side and confirms all systems nominal.', date: d('2026-04-07T00:30:00Z'), metHours: 121.9, category: 'comms' },
            { id: 'a2-lunar-photo', title: 'Lunar Surface Observation & Photography', description: 'Crew photographs the lunar surface, craters, and the receding Moon from windows and cameras. Images document the trajectory and provide context for future Artemis landing site surveys.', date: d('2026-04-07T02:11:00Z'), metHours: 123.6, category: 'science' },
            { id: 'a2-post-flyby-traj', title: 'Post-Flyby Trajectory Assessment', description: 'Ground controllers confirm the free-return trajectory is nominal following the gravity-assist flyby. No corrective burns needed; the Moon\'s gravity has successfully redirected Orion toward Earth.', date: d('2026-04-07T05:47:00Z'), metHours: 127.2, category: 'comms' },
            { id: 'a2-flyby-debrief', title: 'Post-Flyby Crew Debrief', description: 'Crew removes pressure suits and debriefs with Mission Control about the flyby experience. They share observations of the lunar surface and far side.', date: d('2026-04-07T10:35:00Z'), metHours: 132, category: 'crew' },
            // Return Coast
            { id: 'a2-return-begin', title: 'Return Coast Phase Begins', description: 'Orion is firmly on its return trajectory. The Moon\'s gravitational slingshot has redirected the spacecraft homeward. Earth\'s gravity will steadily accelerate Orion over the coming days.', date: d('2026-04-07T18:21:00Z'), metHours: 139.8, category: 'milestone' },
            { id: 'a2-sleep5', title: 'Crew Sleep Period 5', description: 'First rest period on the return leg. Crew has completed the most demanding part of the mission and settles back into routine for the multi-day coast home.', date: d('2026-04-07T22:35:00Z'), metHours: 144, category: 'rest' },
            { id: 'a2-tcm4', title: 'Return Trajectory Correction 1 (TCM-4)', description: 'Post-flyby trajectory correction burn to fine-tune the return approach to Earth. Ensures re-entry corridor targeting is within acceptable limits.', date: d('2026-04-08T10:35:00Z'), metHours: 156, category: 'maneuver' },
            { id: 'a2-sleep6', title: 'Crew Sleep Period 6', description: 'Scheduled rest period during return coast. Earth grows larger in the windows each day as the spacecraft accelerates homeward.', date: d('2026-04-08T22:35:00Z'), metHours: 168, category: 'rest' },
            { id: 'a2-maintenance', title: 'Waste Management & Cabin Maintenance', description: 'Routine cabin maintenance including waste system servicing, water system checks, and general housekeeping. Crew manages consumables for the remaining days.', date: d('2026-04-09T04:35:00Z'), metHours: 174, category: 'crew' },
            { id: 'a2-tcm5', title: 'Return Trajectory Correction 2 (TCM-5)', description: 'Second return correction. Small burns ensure Orion enters the atmosphere at precisely the right angle \u2014 too steep risks excessive G-forces, too shallow risks skipping off into space.', date: d('2026-04-09T10:35:00Z'), metHours: 180, category: 'maneuver' },
            { id: 'a2-tv-broadcast', title: 'Live Television Broadcast from Deep Space', description: 'Crew conducts a live television broadcast from Orion, sharing experiences and showing Earth from deep space. They discuss what the view of Earth from beyond the Moon means to them.', date: d('2026-04-09T16:35:00Z'), metHours: 186, category: 'comms' },
            { id: 'a2-sleep7', title: 'Crew Sleep Period 7', description: 'Scheduled rest period as Earth continues to grow larger through the windows. Crew is two days from splashdown.', date: d('2026-04-09T22:35:00Z'), metHours: 192, category: 'rest' },
            { id: 'a2-tcm6', title: 'Return Trajectory Correction 3 (TCM-6)', description: 'Final trajectory correction to lock in the re-entry corridor. After this burn, Orion\'s path to the splashdown zone is set. Target flight path angle of approximately -1.4 degrees at atmospheric interface.', date: d('2026-04-10T10:35:00Z'), metHours: 204, category: 'maneuver' },
            { id: 'a2-reentry-review', title: 'Re-entry Procedure Review', description: 'Crew reviews re-entry procedures, emergency contingencies, and splashdown protocols with Mission Control. Includes skip re-entry technique, parachute deployment timeline, and post-splashdown procedures.', date: d('2026-04-10T16:35:00Z'), metHours: 210, category: 'crew', glossaryTerms: ['Skip Entry'] },
            { id: 'a2-stow', title: 'Crew Stow & Cabin Preparation for Re-entry', description: 'Crew stows all loose items, secures equipment, and reconfigures the cabin for re-entry. Sleeping gear and personal items packed. Cabin prepared for high G-force environment.', date: d('2026-04-10T20:11:00Z'), metHours: 213.6, category: 'crew' },
            { id: 'a2-suit-up', title: 'Crew Suit-Up for Re-entry', description: 'All four crew members don their Orion Crew Survival System (OCSS) pressure suits for the final time. Suits pressure-checked, communication links verified, crew straps into seats.', date: d('2026-04-10T22:35:00Z'), metHours: 216, category: 'crew' },
            // Re-entry & Splashdown
            { id: 'a2-sm-sep', title: 'Service Module Separation', description: 'The European Service Module separates from the crew module approximately 30 minutes before atmospheric interface. The service module will burn up on re-entry.', date: d('2026-04-10T23:32:00Z'), metHours: 216.9, category: 'maneuver', glossaryTerms: ['ESM'] },
            { id: 'a2-cm-reorient', title: 'Crew Module Reorientation', description: 'Crew module rotates 180 degrees to position heat shield facing forward into the direction of travel. Crew confirms heat shield orientation.', date: d('2026-04-10T23:40:00Z'), metHours: 217.1, category: 'maneuver' },
            { id: 'a2-entry', title: 'Atmospheric Interface (Entry)', description: 'Orion reaches 120 km (75 miles) altitude at approximately 11 km/s (25,000 mph). Heat shield experiences temperatures up to 2,760\u00B0C (5,000\u00B0F). Crew experiences increasing G-forces.', date: d('2026-04-11T00:21:00Z'), metHours: 217.8, category: 'milestone', glossaryTerms: ['Entry Interface', 'Heat Shield'] },
            { id: 'a2-skip', title: 'Skip Re-entry Maneuver', description: 'Orion performs skip re-entry: dipping into the atmosphere to decelerate, then briefly skipping back up to 60+ km altitude before final descent. Spreads heat loads and allows precision landing within 1.8 km of recovery ship.', date: d('2026-04-11T00:26:00Z'), metHours: 217.9, category: 'maneuver', glossaryTerms: ['Skip Entry'] },
            { id: 'a2-blackout', title: 'Communications Blackout (Plasma)', description: 'Superheated plasma surrounds the crew module during peak heating, creating a communications blackout lasting several minutes. Crew is on their own during this intense period.', date: d('2026-04-11T00:33:00Z'), metHours: 218, category: 'comms' },
            { id: 'a2-drogue', title: 'Drogue Parachute Deployment', description: 'Two drogue parachutes deploy at approximately 7.6 km (25,000 feet) altitude, stabilising the crew module and slowing it from roughly 480 km/h (300 mph).', date: d('2026-04-11T00:37:00Z'), metHours: 218, category: 'maneuver' },
            { id: 'a2-main-chute', title: 'Main Parachute Deployment', description: 'Three 35-metre (116-foot) main parachutes deploy at approximately 3 km (10,000 feet), slowing the crew module to roughly 32 km/h (20 mph) for splashdown.', date: d('2026-04-11T00:40:00Z'), metHours: 218.1, category: 'maneuver' },
            { id: 'a2-splashdown', title: 'Splashdown', description: 'Orion splashes down in the Pacific Ocean near San Diego. The approximately 10-day mission concludes with the first crewed return from lunar distance in over 50 years.', date: d('2026-04-11T00:47:00Z'), metHours: 218.2, category: 'milestone' },
            { id: 'a2-stable', title: 'Post-Splashdown Stabilisation', description: 'Crew module stable in the water with uprighting bags deployed. Crew monitors cabin atmosphere and temperature while awaiting recovery forces.', date: d('2026-04-11T00:59:00Z'), metHours: 218.4, category: 'crew' },
            { id: 'a2-recovery', title: 'Recovery Operations Begin', description: 'USS Portland recovery team and Navy divers secure the Orion capsule. Well deck flooding procedure begins to bring Orion aboard the ship. Crew egresses on the ship\'s deck.', date: d('2026-04-11T02:11:00Z'), metHours: 219.6, category: 'milestone' },
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
