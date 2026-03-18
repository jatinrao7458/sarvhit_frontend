export const ENTITIES = {
    ngos: [
        {
            id: 1, name: 'Green Earth Foundation', type: 'ngo', location: 'Mumbai',
            causes: ['Environment', 'Education'], rating: 4.8, events: 47, icon: '🌿',
            bio: 'Working towards a sustainable future through grassroots environmental conservation, community education, and youth empowerment across 8 states in India.',
            email: 'contact@greenearthfoundation.org', founded: '2018',
            eventsHosted: 47, volunteersConnected: 420, fundsReceived: 1850000,
            posts: [
                { id: 1, type: 'event', title: 'Clean River Drive 2025', desc: 'Successfully organized a 3-day cleanup drive along the Yamuna. 320 volunteers joined, collected 2.5 tonnes of waste.', date: 'Dec 2025', tags: ['Environment', '320 Volunteers'] },
                { id: 2, type: 'achievement', title: '🏆 Best NGO Award — National Social Impact Forum', desc: 'Recognized for outstanding grassroots work in environmental conservation across 5 states.', date: 'Nov 2025', tags: ['Award', 'National Recognition'] },
                { id: 3, type: 'event', title: 'Tree Plantation Week', desc: 'Planted 5,000+ saplings across 12 cities with 8 schools and 3 corporates.', date: 'Oct 2025', tags: ['Environment', '5,000 Trees'] },
            ],
        },
        {
            id: 2, name: 'Vidya Foundation', type: 'ngo', location: 'Noida',
            causes: ['Education'], rating: 4.6, events: 31, icon: '📖',
            bio: 'Empowering underprivileged children through quality education, mentorship, and scholarship programs. Operating 12 weekend schools across NCR.',
            email: 'hello@vidyafoundation.in', founded: '2019',
            eventsHosted: 31, volunteersConnected: 180, fundsReceived: 920000,
            posts: [
                { id: 1, type: 'event', title: 'Teach India — Annual Fest', desc: '450 students showcased projects in science, art, and coding. 8 students won district-level awards.', date: 'Jan 2026', tags: ['Education', '450 Students'] },
                { id: 2, type: 'certification', title: '📜 GuideStar India Gold Seal', desc: 'Achieved Gold Seal for transparency and accountability in non-profit operations.', date: 'Nov 2025', tags: ['Certification', 'Transparency'] },
            ],
        },
        {
            id: 3, name: 'Swasthya Sewa', type: 'ngo', location: 'Palghar',
            causes: ['Healthcare'], rating: 4.9, events: 22, icon: '💊',
            bio: 'Providing free healthcare services to tribal and rural communities in Maharashtra. Running mobile health clinics and vaccination drives.',
            email: 'info@swasthyasewa.org', founded: '2017',
            eventsHosted: 22, volunteersConnected: 95, fundsReceived: 1200000,
            posts: [
                { id: 1, type: 'event', title: 'Rural Health Camp — Palghar', desc: 'Screened 800 patients, identified 45 critical cases, vaccinated 200 children.', date: 'Dec 2025', tags: ['Healthcare', '800 Patients'] },
                { id: 2, type: 'achievement', title: '🏆 Maharashtra State Health Award', desc: 'Recognized for reducing infant mortality by 22% in target villages over 3 years.', date: 'Oct 2025', tags: ['Award', 'Healthcare'] },
            ],
        },
        {
            id: 4, name: 'TechBridge India', type: 'ngo', location: 'Pune',
            causes: ['Education', 'Technology'], rating: 4.7, events: 15, icon: '🖥️',
            bio: 'Bridging the digital divide by teaching coding, digital literacy, and internet safety to students in Tier-2 and Tier-3 cities across India.',
            email: 'team@techbridgeindia.org', founded: '2021',
            eventsHosted: 15, volunteersConnected: 140, fundsReceived: 750000,
            posts: [
                { id: 1, type: 'event', title: 'Digital Literacy — Batch 3 Graduation', desc: '50 students graduated. 28 secured internships, 5 launched freelancing businesses.', date: 'Jan 2026', tags: ['Education', '50 Graduates'] },
                { id: 2, type: 'certification', title: '📜 Google.org Impact Challenge Winner', desc: 'Selected among top 10 for innovative approach to digital education in underserved areas.', date: 'Sep 2025', tags: ['Award', 'Google.org'] },
            ],
        },
        {
            id: 5, name: 'Ocean Warriors', type: 'ngo', location: 'Mumbai',
            causes: ['Environment'], rating: 4.5, events: 38, icon: '🌊',
            bio: 'Dedicated to ocean conservation through monthly beach cleanups, marine research, and policy advocacy. Protecting Mumbai\'s 150km coastline.',
            email: 'hello@oceanwarriors.in', founded: '2020',
            eventsHosted: 38, volunteersConnected: 310, fundsReceived: 680000,
            posts: [
                { id: 1, type: 'event', title: '12-Month Juhu Cleanup Results', desc: 'Removed 18 tonnes of waste in 2025. Data led to a municipal ban on single-use plastics in beach shops.', date: 'Dec 2025', tags: ['Environment', '18 Tonnes'] },
                { id: 2, type: 'achievement', title: '🐢 Olive Ridley Turtle Rescue Season', desc: 'Rescued and safely released 23 Olive Ridley turtles during nesting season in partnership with Wildlife SOS.', date: 'Nov 2025', tags: ['Conservation', '23 Rescues'] },
            ],
        },
    ],
    volunteers: [
        {
            id: 6, name: 'Priya Sharma', type: 'volunteer', location: 'Delhi',
            skills: ['Teaching', 'Photography', 'Content Writing'], hours: 186, badge: '⭐', icon: '👩',
            bio: 'Passionate educator and photographer. Loves teaching underprivileged kids and documenting social impact through lens. 3+ years of volunteering.',
            email: 'priya.sharma@email.com',
            hoursLogged: 186, eventsJoined: 23, badgesEarned: 8,
            posts: [
                { id: 1, type: 'event', title: 'Teach India — Science Fair Mentor', desc: 'Mentored 12 students for the regional science fair. 3 won prizes! Photography of the event reached 5K views.', date: 'Jan 2026', tags: ['Education', '12 Students'] },
                { id: 2, type: 'achievement', title: '🏅 "First Responder" Badge Earned', desc: 'Awarded for being among the first 10 to respond to 5+ emergency events in a single quarter.', date: 'Nov 2025', tags: ['Badge', 'Top Performer'] },
                { id: 3, type: 'certification', title: '📜 First Aid & CPR — Red Cross', desc: 'Completed 40-hour training in emergency first aid, CPR, and AED usage.', date: 'Oct 2025', tags: ['Certification', 'Healthcare'] },
            ],
        },
        {
            id: 7, name: 'Rahul Kumar', type: 'volunteer', location: 'Mumbai',
            skills: ['First Aid', 'Cooking', 'Event Management'], hours: 124, badge: '🏅', icon: '👨',
            bio: 'Community kitchen organizer and trained first-aid responder. Believes in serving society through practical skills and hands-on volunteering.',
            email: 'rahul.kumar@email.com',
            hoursLogged: 124, eventsJoined: 18, badgesEarned: 5,
            posts: [
                { id: 1, type: 'event', title: 'Beach Cleanup Rally — Juhu', desc: 'Led a team of 15 volunteers. Sorted and recycled 800kg of plastic waste along the Mumbai coastline.', date: 'Jan 2026', tags: ['Environment', '800kg Recycled'] },
                { id: 2, type: 'event', title: 'Community Kitchen — Diwali Drive', desc: 'Prepared and served 1,200 meals to homeless families across 4 locations in Mumbai.', date: 'Nov 2025', tags: ['Community', '1,200 Meals'] },
            ],
        },
        {
            id: 8, name: 'Ananya Patel', type: 'volunteer', location: 'Bangalore',
            skills: ['Coding', 'Design', 'Mentoring'], hours: 210, badge: '🏆', icon: '👩‍💻',
            bio: 'Full-stack developer and design mentor. Builds donation portals for NGOs and teaches coding to underprivileged youth. Top volunteer 2025.',
            email: 'ananya.patel@email.com',
            hoursLogged: 210, eventsJoined: 18, badgesEarned: 5,
            posts: [
                { id: 1, type: 'event', title: 'NGO Portal Launch — Green Earth', desc: 'Designed and built a donation tracking portal for Green Earth Foundation, processing ₹12L in donations.', date: 'Jan 2026', tags: ['Technology', '₹12L Processed'] },
                { id: 2, type: 'achievement', title: '🏆 Top Volunteer of 2025', desc: 'Recognized for 210+ hours, 18 events, and building tech solutions for 3 NGOs.', date: 'Dec 2025', tags: ['Award', 'Top Performer'] },
                { id: 3, type: 'certification', title: '📜 Disaster Management — NDMA', desc: 'Certified in disaster response protocols, evacuation and relief coordination.', date: 'Sep 2025', tags: ['Certification', 'Safety'] },
            ],
        },
        {
            id: 9, name: 'Vikram Singh', type: 'volunteer', location: 'Gurugram',
            skills: ['Logistics', 'Driving', 'Supply Chain'], hours: 95, badge: '⭐', icon: '🧑',
            bio: 'Logistics professional who volunteers transport and supply chain expertise for relief operations and event management.',
            email: 'vikram.singh@email.com',
            hoursLogged: 95, eventsJoined: 12, badgesEarned: 3,
            posts: [
                { id: 1, type: 'event', title: 'Flood Relief — Assam Transport Ops', desc: 'Coordinated transport of 5 tonnes of relief material to 8 flood-affected villages.', date: 'Dec 2025', tags: ['Relief', '5 Tonnes'] },
                { id: 2, type: 'event', title: 'Tree Plantation Logistics — Aravalli', desc: 'Managed delivery of 1,000 saplings and irrigation equipment across 8 plantation sites.', date: 'Oct 2025', tags: ['Environment', '1,000 Saplings'] },
            ],
        },
    ],
    sponsors: [
        {
            id: 10, name: 'Apex Technologies', type: 'sponsor', location: 'Bangalore',
            sectors: ['Education', 'Healthcare'], donated: '₹7.5L', projects: 12, icon: '🏢',
            bio: 'Leading IT services company committed to social impact through CSR. Focus areas: digital education for underserved youth and rural healthcare infrastructure.',
            email: 'csr@apextechnologies.com',
            totalDonated: 750000, projectsFunded: 12, impactScore: 98,
            posts: [
                { id: 1, type: 'event', title: 'Funded: Digital Literacy Batch 1 Graduation', desc: 'Sponsored coding bootcamp graduating 50 students. 72% placement rate, 8 full-time offers.', date: 'Jan 2026', tags: ['Education', '₹5.2L Funded'] },
                { id: 2, type: 'achievement', title: '🏆 CSR Excellence Award — CII Foundation', desc: 'Recognized for impactful CSR spending with measurable social outcomes.', date: 'Dec 2025', tags: ['Award', 'CSR Excellence'] },
                { id: 3, type: 'event', title: 'Rural Health Clinics — Jharkhand', desc: 'Funded mobile clinics serving 1,800+ patients across 7 villages.', date: 'Nov 2025', tags: ['Healthcare', '1,800 Patients'] },
            ],
        },
        {
            id: 11, name: 'GreenVentures Capital', type: 'sponsor', location: 'Mumbai',
            sectors: ['Environment'], donated: '₹12L', projects: 8, icon: '🌱',
            bio: 'Impact investment firm focused on environmental sustainability. Supporting clean water, reforestation, and coastal conservation projects.',
            email: 'impact@greenventures.in',
            totalDonated: 1200000, projectsFunded: 8, impactScore: 92,
            posts: [
                { id: 1, type: 'event', title: 'Clean Water Initiative — Rajasthan', desc: 'Funded 3 borewells providing clean drinking water to 4,500 people across 7 villages.', date: 'Dec 2025', tags: ['Environment', '4,500 Beneficiaries'] },
                { id: 2, type: 'achievement', title: '🌿 Carbon Neutral Certified', desc: 'Achieved carbon neutral status through offsetting 500 tonnes of CO₂ via reforestation partners.', date: 'Oct 2025', tags: ['Environment', 'Carbon Neutral'] },
            ],
        },
        {
            id: 12, name: 'TrustFund India', type: 'sponsor', location: 'Delhi',
            sectors: ['Education', 'Community'], donated: '₹5.2L', projects: 6, icon: '🤝',
            bio: 'Philanthropic fund focused on community development and education access. Funding scholarships, community centers, and skill development programs.',
            email: 'grants@trustfundindia.org',
            totalDonated: 520000, projectsFunded: 6, impactScore: 85,
            posts: [
                { id: 1, type: 'event', title: 'Scholarship Program — 2026 Batch', desc: 'Awarded full scholarships to 25 first-generation college students from rural backgrounds.', date: 'Jan 2026', tags: ['Education', '25 Scholarships'] },
                { id: 2, type: 'certification', title: '📜 Platinum Donor — Sarvhit Platform', desc: 'Achieved Platinum status for donating over ₹5L across 6+ verified social impact projects.', date: 'Oct 2025', tags: ['Certification', 'Platinum Tier'] },
            ],
        },
    ],
};
