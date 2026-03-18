/**
 * Leaderboard scoring algorithm & mock data — separated by role.
 *
 * Points formula:
 *   events × 10  +  hours × 2  +  funds ÷ 1000
 *
 * Ties broken by: events → hours → name (alphabetical).
 */

export function calculatePoints({ events = 0, hours = 0, funds = 0 }) {
    return Math.round(events * 10 + hours * 2 + funds / 1000);
}

function sortByPoints(users) {
    return users
        .map((u) => ({ ...u, points: calculatePoints(u) }))
        .sort((a, b) => {
            if (b.points !== a.points) return b.points - a.points;
            if (b.events !== a.events) return b.events - a.events;
            if (b.hours !== a.hours) return b.hours - a.hours;
            return a.name.localeCompare(b.name);
        });
}

// ── Volunteer leaderboard ──
const RAW_VOLUNTEERS = [
    { id: 'v-01', name: 'Aarav Mehta',    initials: 'AM', role: 'volunteer', location: 'Mumbai',     events: 42, hours: 310, funds: 0 },
    { id: 'v-02', name: 'Sneha Iyer',     initials: 'SI', role: 'volunteer', location: 'Chennai',    events: 38, hours: 275, funds: 0 },
    { id: 'v-03', name: 'Priya Sharma',   initials: 'PS', role: 'volunteer', location: 'Delhi',      events: 23, hours: 186, funds: 0 },
    { id: 'v-04', name: 'Rohan Gupta',    initials: 'RG', role: 'volunteer', location: 'Pune',       events: 30, hours: 200, funds: 0 },
    { id: 'v-05', name: 'Nisha Kapoor',   initials: 'NK', role: 'volunteer', location: 'Jaipur',     events: 28, hours: 160, funds: 0 },
    { id: 'v-06', name: 'Ananya Patel',   initials: 'AP', role: 'volunteer', location: 'Ahmedabad',  events: 18, hours: 210, funds: 0 },
    { id: 'v-07', name: 'Karan Singh',    initials: 'KS', role: 'volunteer', location: 'Chandigarh', events: 20, hours: 130, funds: 0 },
    { id: 'v-08', name: 'Meera Joshi',    initials: 'MJ', role: 'volunteer', location: 'Nagpur',     events: 15, hours: 110, funds: 0 },
    { id: 'v-09', name: 'Arjun Nair',     initials: 'AN', role: 'volunteer', location: 'Kochi',      events: 12, hours: 95,  funds: 0 },
    { id: 'v-10', name: 'Diya Verma',     initials: 'DV', role: 'volunteer', location: 'Lucknow',    events: 10, hours: 80,  funds: 0 },
];

// ── NGO leaderboard ──
const RAW_NGOS = [
    { id: 'n-01', name: 'Green Earth Fdn',    initials: 'GE', role: 'ngo', location: 'Mumbai',    events: 47, hours: 220, funds: 245000 },
    { id: 'n-02', name: 'Hope Foundation',     initials: 'HF', role: 'ngo', location: 'Kolkata',   events: 35, hours: 180, funds: 180000 },
    { id: 'n-03', name: 'Rural Aid Trust',     initials: 'RA', role: 'ngo', location: 'Lucknow',   events: 22, hours: 140, funds: 120000 },
    { id: 'n-04', name: 'Shakti Welfare',      initials: 'SW', role: 'ngo', location: 'Delhi',     events: 30, hours: 160, funds: 95000  },
    { id: 'n-05', name: 'Udaan Society',       initials: 'US', role: 'ngo', location: 'Jaipur',    events: 25, hours: 130, funds: 80000  },
    { id: 'n-06', name: 'Sahay Trust',         initials: 'ST', role: 'ngo', location: 'Pune',      events: 20, hours: 110, funds: 65000  },
    { id: 'n-07', name: 'Prerna Foundation',   initials: 'PF', role: 'ngo', location: 'Chennai',   events: 18, hours: 100, funds: 55000  },
    { id: 'n-08', name: 'Jeevan Jyoti',       initials: 'JJ', role: 'ngo', location: 'Bhopal',    events: 15, hours: 90,  funds: 40000  },
    { id: 'n-09', name: 'Annapurna Trust',     initials: 'AT', role: 'ngo', location: 'Hyderabad', events: 12, hours: 70,  funds: 35000  },
    { id: 'n-10', name: 'Nirmaan Society',     initials: 'NS', role: 'ngo', location: 'Bangalore', events: 10, hours: 60,  funds: 25000  },
];

// ── Sponsor leaderboard ──
const RAW_SPONSORS = [
    { id: 's-01', name: 'Apex Technologies',  initials: 'AT', role: 'sponsor', location: 'Bangalore', events: 12, hours: 0, funds: 750000 },
    { id: 's-02', name: 'Vikram Enterprises', initials: 'VE', role: 'sponsor', location: 'Hyderabad', events: 8,  hours: 0, funds: 520000 },
    { id: 's-03', name: 'TechForGood Inc',    initials: 'TG', role: 'sponsor', location: 'Delhi',     events: 15, hours: 0, funds: 380000 },
    { id: 's-04', name: 'BrightStar Corp',    initials: 'BC', role: 'sponsor', location: 'Gurgaon',   events: 10, hours: 0, funds: 290000 },
    { id: 's-05', name: 'Zenith Group',       initials: 'ZG', role: 'sponsor', location: 'Mumbai',    events: 7,  hours: 0, funds: 220000 },
    { id: 's-06', name: 'Pinnacle Labs',      initials: 'PL', role: 'sponsor', location: 'Pune',      events: 6,  hours: 0, funds: 180000 },
    { id: 's-07', name: 'Vertex Infra',       initials: 'VI', role: 'sponsor', location: 'Chennai',   events: 5,  hours: 0, funds: 150000 },
    { id: 's-08', name: 'Nimbus Capital',     initials: 'NC', role: 'sponsor', location: 'Kolkata',   events: 4,  hours: 0, funds: 120000 },
    { id: 's-09', name: 'Aurora Partners',    initials: 'AP', role: 'sponsor', location: 'Jaipur',    events: 3,  hours: 0, funds: 95000  },
    { id: 's-10', name: 'Solaris Ventures',   initials: 'SV', role: 'sponsor', location: 'Ahmedabad', events: 2,  hours: 0, funds: 70000  },
];

export const LEADERBOARD = {
    volunteer: sortByPoints(RAW_VOLUNTEERS),
    ngo:       sortByPoints(RAW_NGOS),
    sponsor:   sortByPoints(RAW_SPONSORS),
};
