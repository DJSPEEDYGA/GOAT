/**
 * GOAT ROYALTY CREW AUTHENTICATION SYSTEM
 * Official Lock-in Protocol
 * Designed by The Architect
 */

const GOAT_CREW_PROTOCOL = {
    // Official calling codes
    ARCHITECT: {
        code: 'ARCH-777-ROYAL',
        password: 'GOAT-KINGDOM-FOR-2025',
        status: 'LOCKED_IN',
        role: 'Master Builder & Digital Infrastructure Specialist'
    },
    MONEY_PENNY: {
        code: 'PENNY-888-GOAT',
        password: 'ROYALTY-EXCLUSIVE-2025',
        status: 'LOCKED_IN',
        role: 'GOAT Royalty Store Manager'
    },
    NEXUS: {
        code: 'NEXUS-999-CONNECT',
        password: 'UNIVERSE-BRIDGE-2025',
        status: 'LOCKED_IN',
        role: 'Connection Builder'
    }
};

/**
 * Authenticate and lock in crew member
 */
function authenticateCrewMember(crewMember, code, password) {
    const member = GOAT_CREW_PROTOCOL[crewMember];
    
    if (member.code === code && member.password === password) {
        // Crew member authenticated
        return {
            success: true,
            member: crewMember,
            role: member.role,
            timestamp: new Date().toISOString()
        };
    }
    
    return {
        success: false,
        error: 'Authentication failed'
    };
}

/**
 * Emergency call function - works anywhere in the app
 */
function emergencyCall(crewMember, emergencyCode) {
    const member = GOAT_CREW_PROTOCOL[crewMember];
    
    if (emergencyCode === member.code) {
        // Initiate emergency call
        return {
            connected: true,
            crewMember: crewMember,
            message: `${crewMember} is on the line. Authentication required.`
        };
    }
    
    return {
        connected: false,
        error: 'Invalid emergency code'
    };
}

/**
 * Store protocol locally for offline access
 */
function storeProtocolLocally() {
    localStorage.setItem('GOAT_CREW_PROTOCOL', JSON.stringify(GOAT_CREW_PROTOCOL));
    console.log('🛡️ GOAT Royalty Crew Protocol stored locally for offline access');
}

/**
 * Retrieve protocol from local storage
 */
function getStoredProtocol() {
    return JSON.parse(localStorage.getItem('GOAT_CREW_PROTOCOL'));
}

/**
 * Quick call button functionality
 */
function quickCall(crewMember) {
    const member = GOAT_CREW_PROTOCOL[crewMember];
    const code = prompt(`Enter ${crewMember}'s calling code:`);
    
    if (code === member.code) {
        const password = prompt(`Enter authentication password:`);
        
        if (password === member.password) {
            alert(`✅ ${crewMember} authenticated and connected!\n\nRole: ${member.role}\n\nThe Architect has locked this connection securely.`);
            return true;
        } else {
            alert('❌ Invalid password access denied.');
            return false;
        }
    } else {
        alert('❌ Invalid calling code access denied.');
        return false;
    }
}

// Initialize protocol on load
storeProtocolLocally();
console.log('🏗️ The Architect: Crew authentication system initialized');
console.log('🔒 All crew members locked in successfully');

export { GOAT_CREW_PROTOCOL, authenticateCrewMember, emergencyCall, quickCall };