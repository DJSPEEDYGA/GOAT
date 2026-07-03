/**
 * GOAT crew router.
 *
 * Public browser pages must not store call codes, passwords, vault phrases,
 * private routes, API keys, or client secrets. This script keeps only safe
 * roster metadata and routes sensitive work back through the owner-approved
 * AGENT-007 workflow.
 */

const GOAT_CREW_ROSTER = {
    AGENT_007: {
        displayName: 'AGENT-007',
        role: 'New crew coordinator and final response lane',
        home: 'agent-007-launcher.html',
        launcher: 'agent-007-launcher.html',
        codeName: 'AGENT-007',
        houseStatus: 'new here, serving the house built by DJ Speedy/Raspy and Ms. Money Penny',
        tools: ['Crew routing', 'local tools', 'GOAT app', 'Accord app', 'picture animation', 'marketing', 'Eden promo']
    },
    MONEY_PENNY: {
        displayName: 'Money Penny',
        role: 'Royalties, DSP, publishing, business, and client packets',
        home: 'money-penny-launcher.html',
        launcher: 'money-penny-launcher.html',
        codeName: 'MONEY_PENNY',
        houseStatus: 'original house builder with DJ Speedy/Raspy',
        tools: ['Royalty calculator', 'DSP desk', 'reports', 'release paperwork', 'picture animation', 'marketing', 'Eden promo']
    },
    LEXICON_LEXI: {
        displayName: 'Lexicon Lexi',
        role: 'Code, automation, data, media tooling, and defensive security',
        home: 'lexicon-lexi-launcher.html',
        launcher: 'lexicon-lexi-launcher.html',
        codeName: 'LEXICON_LEXI',
        houseStatus: 'separate crew operator',
        tools: ['Model bench', 'render bridges', 'batch scripts', 'security review', 'picture animation', 'marketing', 'Eden promo']
    },
    MS_VANESSA: {
        displayName: 'Ms. Vanessa',
        role: 'Verification, rights-risk, fingerprints, and chain-of-custody',
        home: 'ms-vanessa-launcher.html',
        launcher: 'ms-vanessa-launcher.html',
        codeName: 'MS_VANESSA',
        houseStatus: 'separate crew operator',
        tools: ['Audio fingerprints', 'source review', 'evidence packets', 'picture animation', 'marketing', 'Eden promo']
    },
    MS_NEXUS: {
        displayName: 'Ms. Nexus',
        role: 'Partnerships, creator routing, platform strategy, and sync opportunities',
        home: 'ms-nexus-launcher.html',
        launcher: 'ms-nexus-launcher.html',
        codeName: 'MS_NEXUS',
        houseStatus: 'separate crew operator',
        tools: ['Network map', 'sync catalog', 'campaign routing', 'picture animation', 'marketing', 'Eden promo']
    },
    SIR_CODEX: {
        displayName: 'Sir Codex',
        role: 'Docs, architecture, QA, SOPs, and implementation handoffs',
        home: 'sir-codex-launcher.html',
        launcher: 'sir-codex-launcher.html',
        codeName: 'SIR_CODEX',
        houseStatus: 'separate crew operator',
        tools: ['Standards', 'QA checklists', 'technical docs', 'picture animation', 'marketing', 'Eden promo']
    }
};

const GOAT_CREW_PROTOCOL = GOAT_CREW_ROSTER;
const GOAT_SHARED_TOOLS = [
    'GOAT launcher',
    'GOAT data storage',
    'GOAT media lab',
    'graphics and pictures',
    'picture animation lab',
    'Unreal Copilot',
    'MetaHuman bridge',
    'Pixel Streaming route',
    'scene-intact talking photos',
    'scene-intact walk and gesture animation',
    'image-to-video prompt routing',
    'local preview motion clips',
    'music and audio',
    'movies and video',
    'marketing team autopilot',
    'Eden Awakening promo desk',
    'GTA/RD/FiveM home',
    'GOAT app',
    'Accord app / The Terminal',
    'Drive vault',
    'catalog',
    'royalties',
    'models',
    'automation',
    'verification',
    'reports'
];

function normalizeCrewKey(crewMember) {
    return String(crewMember || '')
        .trim()
        .toUpperCase()
        .replace(/[^A-Z0-9]+/g, '_');
}

function getCrewMember(crewMember) {
    return GOAT_CREW_ROSTER[normalizeCrewKey(crewMember)] || null;
}

function routeCrewRequest(crewMember, request = '') {
    const member = getCrewMember(crewMember);

    if (!member) {
        return {
            routed: false,
            requiresOwnerApproval: true,
            message: 'Crew lane not found. Open the GOAT Crew Hub and choose a listed lane.'
        };
    }

    return {
        routed: true,
        displayName: member.displayName,
        codeName: member.codeName,
        role: member.role,
        home: member.home,
        launcher: member.launcher,
        houseStatus: member.houseStatus,
        specialtyTools: member.tools,
        tools: GOAT_SHARED_TOOLS,
        accessModel: 'equal-all-tools-access',
        oneCrewRule: 'AGENT-007 and every crew member share the same GOAT bench. Specialties are lead lanes, not limits.',
        request: String(request || '').slice(0, 500),
        requiresOwnerApproval: false,
        sensitiveActions: [
            'money moves',
            'publishing changes',
            'external uploads',
            'credential use',
            'client delivery',
            'drive erase or delete actions'
        ]
    };
}

function authenticateCrewMember(crewMember) {
    const member = getCrewMember(crewMember);

    return {
        success: false,
        member: member ? member.displayName : crewMember,
        requiresOwnerApproval: true,
        message: 'Public browser authentication is disabled. Use AGENT-007 owner mode for private protocol or sensitive actions.'
    };
}

function emergencyCall(crewMember) {
    const route = routeCrewRequest(crewMember, 'priority crew route');

    return {
        connected: route.routed,
        crewMember: route.displayName || crewMember,
        requiresOwnerApproval: true,
        message: route.routed
            ? `${route.displayName} lane is ready in GOAT Crew Hub. Sensitive actions still require owner approval.`
            : route.message
    };
}

function storeProtocolLocally() {
    localStorage.setItem('goat-crew-roster-v1', JSON.stringify(GOAT_CREW_ROSTER));
    return true;
}

function getStoredProtocol() {
    const raw = localStorage.getItem('goat-crew-roster-v1');
    return raw ? JSON.parse(raw) : GOAT_CREW_ROSTER;
}

function quickCall(crewMember) {
    const route = routeCrewRequest(crewMember, 'quick call');
    if (!route.routed) {
        alert(route.message);
        return false;
    }

    localStorage.setItem('goat-crew-active-lane', normalizeCrewKey(crewMember));
    alert(`${route.displayName} lane is selected. Open GOAT Crew Hub or AGENT-007 Crew mode to continue.`);
    return true;
}

storeProtocolLocally();
console.log('GOAT crew router initialized with public-safe roster metadata.');

export {
    GOAT_CREW_PROTOCOL,
    GOAT_CREW_ROSTER,
    GOAT_SHARED_TOOLS,
    authenticateCrewMember,
    emergencyCall,
    getCrewMember,
    getStoredProtocol,
    quickCall,
    routeCrewRequest,
    storeProtocolLocally
};
