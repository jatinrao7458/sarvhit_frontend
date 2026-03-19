import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, Send, Mic, MicOff, Phone, PhoneOff,
    Bot, Sparkles, Volume2, Settings, Key, Check
} from 'lucide-react';
import { getGeminiResponse, setGeminiApiKey, getGeminiApiKey, isGeminiConfigured } from '../../services/geminiService';
import { useTheme } from '../../context/ThemeContext';
import './AIChatbot.css';

/* Quick reply suggestions */
var QUICK_REPLIES = ['How do I create an event?', 'Show my stats', 'Find volunteers', 'What is Sarvhit?'];

/* ── Local fallback responses (used when Gemini API is unavailable) ── */
var LOCAL_RESPONSES = {
    // Platform - Core Features
    'how do i create an event': 'Great question! Here\'s how to create an event:\n1. Navigate to the **Events** page from the sidebar\n2. Click the **Create Event** button (top-right corner, NGO role only)\n3. Fill in your event details: title, date, location, and cause category\n4. Set volunteer requirements and funding goals\n5. Click **Publish** to make it live!\n\nVolunteers will be able to discover and join your event right away.',
    'show my stats': 'Your key metrics are available in two places:\n- **Dashboard**: Quick stat cards at the top showing your most important numbers\n- **Profile page**: Detailed breakdown with clickable stats\n\nDepending on your role, you\'ll see events hosted/joined, hours logged, funds raised/donated, badges earned, and your **Impact Score**. Click any stat card to dive deeper!',
    'find volunteers': 'Here are two effective ways to find volunteers:\n1. **Discover page**: Go to Discover > Volunteers tab. Filter by skills, location, and availability to find the perfect match\n2. **Create an event**: Post your event with clear requirements - volunteers actively browse and apply to events that match their interests\n\nPro tip: Be specific about skills needed in your event description to attract the right volunteers!',
    'how to donate': 'As a **Sponsor**, you can fund events in a few simple steps:\n1. Go to the **Events** page and browse available events\n2. Click on an event card that aligns with your mission\n3. Select **Fund This Event**\n4. Choose your donation amount (in INR)\n5. Complete the payment\n\nYou\'ll automatically receive an **80G tax receipt** and can track your donation\'s impact through **Impact Reports**.',
    'what is sarvhit': '**Sarvhit** is India\'s social impact platform that connects three key stakeholders:\n- **NGOs**: Host events, manage volunteers, raise funds, generate impact reports\n- **Volunteers**: Discover events, contribute skills, log hours, earn badges and certificates\n- **Sponsors**: Fund projects, track donations, measure ROI, receive tax receipts\n\nTogether, we\'re building a more connected and impactful social ecosystem across India!',
    'impact map': 'The **Impact Map** is your full-screen, Google Maps-style view of social impact across India:\n- **Live location**: Blue pulsing dot shows where you are\n- **Search**: Find any location with autocomplete search\n- **Nearby people**: See volunteers and coordinators near you (green = online, grey = offline)\n- **Project markers**: Click markers to see project details\n- **Report concerns**: Click anywhere to report an affected area\n\nAccess it from the sidebar navigation!',
    'my events': 'The **My Events** page shows your event history based on your role:\n- **NGO**: All events you\'ve hosted with volunteer count, funds raised, and ratings\n- **Volunteer**: Events you\'ve participated in with hours logged, role filled, and NGO name\n- **Sponsor**: Events you\'ve funded with donation amounts and impact metrics\n\nAccess it by going to **Events** > click the **My Events** button in the top-right corner.',
    'manage team': 'The **Manage Team** page (NGO role) lets you:\n- Search and filter team members by name or skills\n- View volunteer cards with details: role, skills, availability, join date\n- **Schedule meetings**: Click the schedule button to set date, time, and agenda\n- **Invite members**: Send invitations to new volunteers\n- **Activate/Deactivate** members as needed\n\nAccess it from your Dashboard by clicking \"Volunteers Enrolled\" or from your Profile.',
    'leaderboard': 'The **Leaderboard** ranks users by **Impact Score** across the platform. You earn points by:\n- Hosting successful events (NGOs)\n- Logging volunteer hours (Volunteers)\n- Funding projects (Sponsors)\n- Getting high feedback ratings from participants\n\nFilter by role and time period to see where you stand. It\'s a great motivator to increase your social impact!',
    'profile': 'Your **Profile** page is your social impact resume:\n- **Personal info**: Name, bio, avatar, role, location, join date\n- **Edit Profile**: Update any of your details\n- **Key stats**: Events, hours, funds, badges (click any stat for details)\n- **Achievements**: Badges earned and certificates received\n- **Settings**: Account preferences and notifications\n\nPro tip: A complete profile helps you connect with more people on the platform!',
    'discover': 'The **Discover** page helps you find and connect with people:\n- Switch between **NGOs**, **Volunteers**, and **Sponsors** tabs\n- Search by name, skills, location, or interests\n- View detailed profiles and connect with users\n\nIt\'s the best way to grow your network and find collaboration opportunities!',
    'messages': 'The **Messages** section lets you communicate with connected users in real-time:\n- Start conversations from any user\'s profile\n- Send and receive messages in threaded conversations\n- Great for coordinating events, discussing projects, or networking\n\nAccess it from the sidebar navigation!',
    'reports': 'The **Reports** section (NGO role) provides comprehensive analytics:\n- Event performance dashboards with charts and graphs\n- Volunteer engagement metrics and participation trends\n- Fund utilization breakdowns showing how donations were used\n- Detailed event reports accessible from your hosted events\n\nGreat for transparency and sharing impact with sponsors!',
    'settings': 'You can manage your settings from the **Profile** page:\n- Edit personal information and bio\n- Update avatar and display preferences\n- Manage notification settings\n- Account security and password changes',
    'notification': 'The **notification bell** in your dashboard header shows recent activity:\n- New event invitations and registrations\n- Volunteer applications and confirmations\n- Donation receipts and fund updates\n- Badge and achievement unlocks\n\nEach notification is clickable and takes you directly to the relevant page!',

    // Platform - Specific Features
    'badge': '**Badges** are achievements you earn on Sarvhit:\n- **First Event**: Join your first event\n- **Hour Hero**: Log 50+ volunteer hours\n- **Impact Maker**: Get consistently high feedback scores\n- **Team Player**: Collaborate on 5+ events\n- **Leader**: Lead a team or zone at an event\n\nView your badges on the **Profile > Achievements** section. They\'re great for your resume!',
    'certificate': 'Sarvhit automatically generates **certificates** for your contributions:\n- Participation certificates for each event\n- Special recognition for outstanding volunteers\n- Downloadable as PDF from your Profile\n- Perfect for resumes and LinkedIn profiles\n\nKeep logging hours and joining events to build your certificate collection!',
    'tax receipt': 'As a **Sponsor**, you automatically receive **80G tax receipts** for every donation:\n- Generated instantly after payment\n- Available in the **Tax Receipts** section\n- Includes all legally required details\n- Downloadable as PDF for your records\n\nThis makes donating through Sarvhit both impactful and tax-efficient!',
    'impact score': 'Your **Impact Score** is a comprehensive rating calculated from:\n- Number and quality of events participated in or hosted\n- Total volunteer hours logged\n- Funds raised or donated\n- Community feedback and ratings from other users\n\nCheck your score on the **Dashboard** and see how you rank on the **Leaderboard**!',
    'schedule meeting': 'To schedule a meeting with your team:\n1. Go to **Manage Team** (from Dashboard or sidebar)\n2. Click the **Schedule Meeting** button (top-right)\n3. Set the date, time, and agenda\n4. Select team members to invite\n5. Confirm and send invitations\n\nAll participants will receive a notification about the meeting!',

    // General Greetings & Conversation
    'hello': 'Hey there! Welcome to Sarvhit AI. I\'m here to help you navigate the platform, answer questions about social impact, or just chat. What would you like to know?',
    'hi': 'Hi! Great to see you on Sarvhit. Whether you need help with events, volunteering, donations, or anything else, I\'m here for you. What\'s on your mind?',
    'hey': 'Hey! I\'m Sarvhit AI, your personal guide to making social impact. Ask me anything about the platform or social work in general!',
    'good morning': 'Good morning! Ready to make a difference today? I can help you find events, manage your team, or learn about social impact. What would you like to do?',
    'good afternoon': 'Good afternoon! Hope your day is going well. How can I help you on Sarvhit today?',
    'good evening': 'Good evening! Whether you\'re wrapping up the day or planning tomorrow\'s impact, I\'m here to help. What do you need?',
    'good night': 'Good night! Rest well and recharge for more impact tomorrow. I\'ll be here whenever you need me!',
    'how are you': 'I\'m doing great, thanks for asking! I\'m always ready and energized to help you make a difference. What can I assist you with today?',
    'who are you': 'I\'m **Sarvhit AI**, your intelligent assistant built right into the platform! I know everything about Sarvhit\'s features and can also help with general questions about social work, volunteering, fundraising, and more. Think of me as your always-available teammate!',
    'what can you do': 'I\'m pretty versatile! Here\'s what I can help with:\n- **Platform navigation**: How to use any Sarvhit feature\n- **Event management**: Creating, finding, and managing events\n- **Volunteering**: Finding opportunities, logging hours, earning badges\n- **Donations**: Funding events, tax receipts, impact tracking\n- **General knowledge**: Social work, environment, education, healthcare topics\n- **Voice calls**: Start a call and talk to me directly!\n\nJust ask away, or click any quick reply to get started.',
    'thank': 'You\'re very welcome! Happy I could help. Don\'t hesitate to reach out if you need anything else. Keep making an impact!',
    'thanks': 'My pleasure! Glad I could assist. Remember, I\'m always here if you have more questions. Have a great day!',
    'bye': 'Goodbye! Thank you for using Sarvhit. Keep doing amazing work and making a difference!',
    'ok': 'Sounds good! Let me know if you\'d like to explore any other feature or have any questions.',
    'yes': 'Perfect! What would you like to know more about? I\'m ready to help!',
    'no': 'No problem at all! I\'m here whenever you need assistance. Just type your question anytime.',

    // General Knowledge - Social Work
    'what is ngo': 'An **NGO** (Non-Governmental Organization) is a non-profit entity that operates independently from the government to tackle social, environmental, or humanitarian challenges. On Sarvhit, NGOs can:\n- Host and manage social events\n- Recruit and coordinate volunteers\n- Raise funds from sponsors\n- Generate detailed impact reports\n\nNGOs are the backbone of social change!',
    'what is volunteering': '**Volunteering** is the act of freely giving your time and skills to help others without financial compensation. Benefits include:\n- Building real-world experience and skills\n- Expanding your professional network\n- Earning certificates and badges for your resume\n- Making a tangible difference in communities\n\nOn Sarvhit, volunteers can discover events, log hours, and build their social impact profile!',
    'what is sponsoring': '**Sponsoring** on Sarvhit means providing financial support to social events and causes. As a sponsor, you get:\n- Transparent tracking of how your funds are used\n- Detailed **Impact Reports** showing the results of your donation\n- Automatic **80G tax receipts** for tax benefits\n- A growing **Impact Score** reflecting your contributions\n\nEvery rupee you donate goes directly towards creating social change!',
    'social impact': '**Social impact** refers to the measurable positive changes created in communities through organized efforts. On Sarvhit, we quantify impact through:\n- Events successfully conducted\n- Volunteer hours contributed\n- Funds raised and utilized\n- Number of beneficiaries reached\n- Community feedback and ratings\n\nYour personal **Impact Score** reflects your unique contribution to society!',
    'sustainability': '**Sustainability** means meeting today\'s needs without compromising the ability of future generations to meet theirs. It spans:\n- **Environmental**: Conservation, renewable energy, waste reduction\n- **Social**: Education access, healthcare equity, community welfare\n- **Economic**: Fair trade, ethical business, local empowerment\n\nMany Sarvhit events focus on sustainable development goals. Check the Events page to get involved!',

    // General Knowledge - Topics
    'education': 'Education is a powerful driver of social change. On Sarvhit, education events include:\n- **Digital Literacy Camps**: Teaching technology skills to underserved communities\n- **Code for Kids**: Programming workshops for children\n- **Rural Education Drives**: Bringing learning resources to remote areas\n- **Skill Development**: Professional training for youth employment\n\nBrowse **Events > Education** filter to find initiatives near you!',
    'healthcare': 'Healthcare accessibility is critical in India. Sarvhit healthcare events include:\n- **Rural Health Camps**: Free medical checkups in villages\n- **First Aid Training**: Emergency response skills for communities\n- **Mental Health Awareness**: Reducing stigma, providing support resources\n- **Blood Donation Drives**: Regular campaigns saving lives\n\nFilter events by **Healthcare** to find opportunities to contribute!',
    'environment': 'Environmental conservation is one of the most popular causes on Sarvhit:\n- **Tree Plantation Drives**: Restoring green cover across cities\n- **Beach & River Cleanups**: Removing pollution from water bodies\n- **Waste Management Workshops**: Teaching recycling and composting\n- **Wildlife Conservation**: Protecting endangered species and habitats\n\nFind environment events on the **Events** page or check the **Impact Map** for nearby projects!',
    'climate change': 'Climate change is the long-term shift in global temperatures driven by human activities like burning fossil fuels and deforestation. It causes:\n- Rising sea levels and extreme weather events\n- Threats to food security and biodiversity\n- Disproportionate impact on vulnerable communities\n\nOn Sarvhit, you can take direct action through **Environment** events like tree plantations and cleanup drives. Every small effort counts!',
    'poverty': 'Poverty alleviation is a core focus of many NGOs on Sarvhit. Events targeting poverty include:\n- Skill development and employment workshops\n- Food and essential supply distribution\n- Microfinance and livelihood programs\n- Community development initiatives\n\nBrowse **Events > Community** filter to find and support poverty alleviation programs near you.',
    'fundraising': 'Effective fundraising tips for NGOs on Sarvhit:\n1. **Tell a compelling story**: Share your mission with clear impact narratives\n2. **Set specific goals**: Donors connect with concrete targets\n3. **Show transparency**: Post fund utilization reports after events\n4. **Engage regularly**: Update sponsors on progress through the platform\n5. **Leverage the Impact Map**: Visual project markers attract attention\n\nYour track record on Sarvhit builds credibility with potential sponsors!',

    // How-to & Guidance
    'how to register': 'Getting started on Sarvhit is quick and easy:\n1. Visit the **Sign Up** page\n2. Choose your role: **NGO**, **Volunteer**, or **Sponsor**\n3. Fill in your details: name, email, password, and organization (if applicable)\n4. Verify your email address\n5. Complete your profile with a bio, skills, and interests\n\nYou\'ll be ready to make an impact in minutes!',
    'how to login': 'To access your Sarvhit account:\n1. Go to the **Login** page\n2. Enter your registered email and password\n3. Click **Sign In**\n\nForgot your password? Use the reset option to create a new one. Need to create an account? Click Sign Up!',
    'contact': 'You can connect with the Sarvhit community through multiple channels:\n- **In-app Messages**: Direct messaging with any connected user\n- **Profile Connect**: Send connection requests from Discover page\n- **Event Chat**: Communicate with event organizers and participants\n- **Support Email**: support@sarvhit.org for platform help\n\nBuilding connections is key to maximizing your social impact!',

    // Fun
    'joke': 'Here\'s one for you: Why did the volunteer bring a ladder to the event? Because they wanted to reach new heights of impact! Want to actually reach new heights? Check out the **Leaderboard** to see how you rank!',
    'help': 'I\'m here to help! Here\'s what I can assist you with:\n- **Events**: Creating, finding, joining, and managing events\n- **Volunteering**: Discovering opportunities, logging hours, earning badges\n- **Donations**: Funding projects, tracking impact, tax receipts\n- **Navigation**: Finding any feature on the platform\n- **General questions**: Social work, environment, education, and more\n- **Voice calls**: Click the phone icon to talk to me!\n\nJust type your question or click a quick reply to get started.',
};

function getLocalResponse(input) {
    var lower = input.toLowerCase().trim();

    // Direct match
    for (var key in LOCAL_RESPONSES) {
        if (lower.includes(key)) return LOCAL_RESPONSES[key];
    }

    // Keyword fallbacks - Platform
    if (lower.includes('event') || lower.includes('create')) return LOCAL_RESPONSES['how do i create an event'];
    if (lower.includes('volunteer')) return LOCAL_RESPONSES['find volunteers'];
    if (lower.includes('donate') || lower.includes('fund') || lower.includes('sponsor') || lower.includes('money')) return LOCAL_RESPONSES['how to donate'];
    if (lower.includes('map') || lower.includes('location')) return LOCAL_RESPONSES['impact map'];
    if (lower.includes('team') || lower.includes('member')) return LOCAL_RESPONSES['manage team'];
    if (lower.includes('leader') || lower.includes('rank') || lower.includes('score')) return LOCAL_RESPONSES['leaderboard'];
    if (lower.includes('stat') || lower.includes('dashboard') || lower.includes('metric')) return LOCAL_RESPONSES['show my stats'];
    if (lower.includes('discover') || lower.includes('find') || lower.includes('search')) return LOCAL_RESPONSES['discover'];
    if (lower.includes('message') || lower.includes('chat') || lower.includes('inbox')) return LOCAL_RESPONSES['messages'];
    if (lower.includes('report') || lower.includes('analytics')) return LOCAL_RESPONSES['reports'];
    if (lower.includes('setting') || lower.includes('preference')) return LOCAL_RESPONSES['settings'];
    if (lower.includes('notification') || lower.includes('bell') || lower.includes('alert')) return LOCAL_RESPONSES['notification'];
    if (lower.includes('meeting') || lower.includes('schedule')) return LOCAL_RESPONSES['schedule meeting'];
    if (lower.includes('sign up') || lower.includes('register') || lower.includes('account')) return LOCAL_RESPONSES['how to register'];
    if (lower.includes('login') || lower.includes('sign in') || lower.includes('password')) return LOCAL_RESPONSES['how to login'];
    if (lower.includes('connect') || lower.includes('contact') || lower.includes('reach')) return LOCAL_RESPONSES['contact'];

    // General knowledge
    if (lower.includes('ngo') || lower.includes('organization')) return LOCAL_RESPONSES['what is ngo'];
    if (lower.includes('impact') || lower.includes('social')) return LOCAL_RESPONSES['social impact'];
    if (lower.includes('sustain') || lower.includes('eco')) return LOCAL_RESPONSES['sustainability'];
    if (lower.includes('educat') || lower.includes('school') || lower.includes('learn') || lower.includes('teach')) return LOCAL_RESPONSES['education'];
    if (lower.includes('health') || lower.includes('medical') || lower.includes('hospital') || lower.includes('doctor')) return LOCAL_RESPONSES['healthcare'];
    if (lower.includes('environment') || lower.includes('tree') || lower.includes('clean') || lower.includes('pollution') || lower.includes('green')) return LOCAL_RESPONSES['environment'];
    if (lower.includes('climate') || lower.includes('warming') || lower.includes('carbon')) return LOCAL_RESPONSES['climate change'];
    if (lower.includes('poverty') || lower.includes('poor') || lower.includes('hunger')) return LOCAL_RESPONSES['poverty'];
    if (lower.includes('fundrais') || lower.includes('raise fund') || lower.includes('collect fund')) return LOCAL_RESPONSES['fundraising'];
    if (lower.includes('certificate') || lower.includes('resume')) return LOCAL_RESPONSES['certificate'];
    if (lower.includes('badge') || lower.includes('achievement') || lower.includes('milestone')) return LOCAL_RESPONSES['badge'];
    if (lower.includes('tax') || lower.includes('receipt') || lower.includes('80g')) return LOCAL_RESPONSES['tax receipt'];
    if (lower.includes('name') || lower.includes('who') || lower.includes('bot')) return LOCAL_RESPONSES['who are you'];
    if (lower.includes('funny') || lower.includes('laugh')) return LOCAL_RESPONSES['joke'];

    // Math detection
    var mathMatch = lower.match(/^[\d\s+\-*/().]+$/);
    if (mathMatch) {
        try {
            var result = Function('"use strict"; return (' + lower + ')')();
            return 'The answer is **' + result + '**. Need help with anything else?';
        } catch (e) { /* not valid math */ }
    }

    return 'That\'s an interesting question! While I\'m specialized in the Sarvhit platform, I can help with a wide range of topics. Try asking about:\n- **Platform features**: Events, volunteering, donations, map, profile\n- **Social impact**: NGOs, sustainability, education, healthcare, environment\n- **Getting started**: Registration, login, navigation\n\nOr type **help** for a complete guide of what I can do!';
}

/* Strip markdown for speech */
function stripMarkdown(text) {
    return text.replace(/\*\*/g, '').replace(/\n/g, '. ').replace(/- /g, '').replace(/\d+\. /g, '');
}

/* Speech Synthesis */
function speak(text, onStart, onEnd) {
    var synth = window.speechSynthesis;
    synth.cancel();
    var utter = new SpeechSynthesisUtterance(stripMarkdown(text));
    utter.rate = 1.05;
    utter.pitch = 1.0;
    utter.volume = 1.0;
    var voices = synth.getVoices();
    var preferred = voices.find(function (v) { return v.lang.startsWith('en') && v.name.toLowerCase().includes('female'); })
        || voices.find(function (v) { return v.lang.startsWith('en') && v.name.toLowerCase().includes('google'); })
        || voices.find(function (v) { return v.lang.startsWith('en'); });
    if (preferred) utter.voice = preferred;
    utter.onstart = onStart || null;
    utter.onend = onEnd || null;
    utter.onerror = onEnd || null;
    synth.speak(utter);
}

var SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

export default function AIChatbot() {
    const { theme } = useTheme();
    const [isOpen, setIsOpen] = useState(false);
    const [mode, setMode] = useState('chat');
    const [messages, setMessages] = useState([
        { id: 1, sender: 'bot', text: 'Hi there! I\'m **Sarvhit AI**. Ask me anything about the platform, events, volunteering, or even general questions!', time: new Date() }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    // Call mode state
    const [callActive, setCallActive] = useState(false);
    const [callDuration, setCallDuration] = useState(0);
    const [callText, setCallText] = useState('');
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [userMuted, setUserMuted] = useState(false);
    const [userTranscript, setUserTranscript] = useState('');
    const callTimerRef = useRef(null);
    const recognitionRef = useRef(null);
    const callActiveRef = useRef(false);

    // Settings modal
    const [showSettings, setShowSettings] = useState(false);
    const [apiKeyInput, setApiKeyInput] = useState(getGeminiApiKey());
    const [keySaved, setKeySaved] = useState(false);

    // Load voices
    useEffect(function () {
        var synth = window.speechSynthesis;
        synth.getVoices();
        synth.onvoiceschanged = function () { synth.getVoices(); };
    }, []);

    // Auto-scroll
    useEffect(function () {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isTyping]);

    // Call timer
    useEffect(function () {
        if (callActive) {
            callTimerRef.current = setInterval(function () {
                setCallDuration(function (d) { return d + 1; });
            }, 1000);
        } else {
            clearInterval(callTimerRef.current);
            setCallDuration(0);
        }
        return function () { clearInterval(callTimerRef.current); };
    }, [callActive]);

    useEffect(function () {
        callActiveRef.current = callActive;
    }, [callActive]);

    function formatTime(s) {
        var mins = Math.floor(s / 60).toString().padStart(2, '0');
        var secs = (s % 60).toString().padStart(2, '0');
        return mins + ':' + secs;
    }

    /* ── Get AI response (Gemini first, then local fallback) ── */
    async function getSmartResponse(userMessage, voiceMode) {
        try {
            var geminiReply = await getGeminiResponse(userMessage, voiceMode || false);
            if (geminiReply) return geminiReply;
        } catch (e) {
            // fallback
        }
        return getLocalResponse(userMessage);
    }

    /* ── Speech Recognition ── */
    function startListening() {
        if (!SpeechRecognition || userMuted) return;
        try {
            var recognition = new SpeechRecognition();
            recognition.lang = 'en-US';
            recognition.continuous = false;
            recognition.interimResults = true;
            recognition.maxAlternatives = 1;

            recognition.onstart = function () {
                setIsListening(true);
                setUserTranscript('');
            };

            recognition.onresult = function (event) {
                var transcript = '';
                for (var i = 0; i < event.results.length; i++) {
                    transcript += event.results[i][0].transcript;
                }
                setUserTranscript(transcript);
            };

            recognition.onend = function () {
                setIsListening(false);
                setUserTranscript(function (finalTranscript) {
                    if (finalTranscript && finalTranscript.trim() && callActiveRef.current) {
                        handleVoiceInput(finalTranscript.trim());
                    }
                    return finalTranscript;
                });
            };

            recognition.onerror = function () {
                setIsListening(false);
                if (callActiveRef.current && !userMuted) {
                    setTimeout(function () {
                        if (callActiveRef.current) startListening();
                    }, 1500);
                }
            };

            recognitionRef.current = recognition;
            recognition.start();
        } catch (e) {
            console.warn('Speech recognition error:', e);
        }
    }

    function stopListening() {
        if (recognitionRef.current) {
            try { recognitionRef.current.abort(); } catch (e) { /* ignore */ }
            recognitionRef.current = null;
        }
        setIsListening(false);
    }

    /* Voice input handler */
    function handleVoiceInput(text) {
        if (!text) return;
        setCallText('You said: "' + text + '"');
        setUserTranscript('');

        setTimeout(async function () {
            if (!callActiveRef.current) return;
            var reply = await getSmartResponse(text, true);
            setCallText(reply);
            setIsSpeaking(true);

            speak(reply,
                null,
                function () {
                    setIsSpeaking(false);
                    if (callActiveRef.current && !userMuted) {
                        setTimeout(function () {
                            if (callActiveRef.current) startListening();
                        }, 600);
                    }
                }
            );
        }, 800);
    }

    /* Start call */
    function startCall() {
        setMode('call');
        setCallActive(true);
        setCallText('');
        setUserMuted(false);
        setUserTranscript('');

        var greeting = 'Hello! This is Sarvhit AI assistant. How can I help you today?';
        setCallText(greeting);
        setIsSpeaking(true);

        setTimeout(function () {
            speak(greeting,
                null,
                function () {
                    setIsSpeaking(false);
                    setTimeout(function () {
                        if (callActiveRef.current) startListening();
                    }, 500);
                }
            );
        }, 300);
    }

    /* End call */
    function endCall() {
        window.speechSynthesis.cancel();
        stopListening();
        setCallActive(false);
        setMode('chat');
        setIsSpeaking(false);
        setCallText('');
        setUserTranscript('');
    }

    /* Toggle mute */
    function toggleMute() {
        setUserMuted(function (m) {
            var newMuted = !m;
            if (newMuted) {
                stopListening();
            } else if (callActiveRef.current && !isSpeaking) {
                setTimeout(function () { startListening(); }, 300);
            }
            return newMuted;
        });
    }

    /* Chat send message (async with Gemini) */
    var sendMessage = useCallback(function (text) {
        if (!text.trim()) return;
        var userMsg = { id: Date.now(), sender: 'user', text: text.trim(), time: new Date() };
        setMessages(function (prev) { return prev.concat([userMsg]); });
        setInput('');
        setIsTyping(true);

        getSmartResponse(text, false).then(function (reply) {
            setMessages(function (prev) { return prev.concat([{ id: Date.now() + 1, sender: 'bot', text: reply, time: new Date() }]); });
            setIsTyping(false);
        });
    }, []);

    function handleSubmit(e) {
        e.preventDefault();
        sendMessage(input);
    }

    /* Save API key */
    function handleSaveKey() {
        setGeminiApiKey(apiKeyInput.trim());
        setKeySaved(true);
        setTimeout(function () { setKeySaved(false); setShowSettings(false); }, 1200);
    }

    /* Render markdown bold */
    function renderText(text) {
        var lines = text.split('\n');
        return lines.map(function (line, i) {
            var parts = line.split(/(\*\*.*?\*\*)/);
            var rendered = parts.map(function (part, j) {
                if (part.startsWith('**') && part.endsWith('**')) {
                    return <strong key={j}>{part.slice(2, -2)}</strong>;
                }
                return part;
            });
            return (
                <span key={i}>
                    {rendered}
                    {i < lines.length - 1 && <br />}
                </span>
            );
        });
    }

    return (
        <>
            {/* Floating button */}
            <AnimatePresence>
                {!isOpen && (
                    <motion.button
                        className="chatbot-fab"
                        onClick={function () { setIsOpen(true); }}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                    >
                        <Sparkles size={22} className="chatbot-fab__sparkle" />
                        <Bot size={24} />
                    </motion.button>
                )}
            </AnimatePresence>

            {/* Chat panel */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        className={'chatbot-panel' + (theme === 'light' ? ' chatbot--light' : '')}
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                    >
                        {/* Header */}
                        <div className="chatbot-panel__header">
                            <div className="chatbot-panel__title">
                                <div className="chatbot-panel__avatar"><Bot size={18} /></div>
                                <div>
                                    <span className="chatbot-panel__name">Sarvhit AI</span>
                                    <span className="chatbot-panel__status">
                                        {mode === 'call'
                                            ? 'On call \u00b7 ' + formatTime(callDuration)
                                            : isGeminiConfigured() ? 'Gemini Powered' : 'Online'}
                                    </span>
                                </div>
                            </div>
                            <div className="chatbot-panel__header-actions">
                                <button className="chatbot-panel__settings-btn" onClick={function () { setShowSettings(function (s) { return !s; }); }} title="API Settings">
                                    <Settings size={14} />
                                </button>
                                {mode === 'chat' && (
                                    <button className="chatbot-panel__call-btn" onClick={startCall} title="Start voice call">
                                        <Phone size={16} />
                                    </button>
                                )}
                                <button className="chatbot-panel__close" onClick={function () { setIsOpen(false); endCall(); setShowSettings(false); }}>
                                    <X size={18} />
                                </button>
                            </div>
                        </div>

                        {/* API Key Settings */}
                        <AnimatePresence>
                            {showSettings && (
                                <motion.div
                                    className="chatbot-settings"
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <div className="chatbot-settings__inner">
                                        <div className="chatbot-settings__label">
                                            <Key size={13} />
                                            <span>Gemini API Key</span>
                                            {isGeminiConfigured() && <span className="chatbot-settings__active">Active</span>}
                                        </div>
                                        <div className="chatbot-settings__row">
                                            <input
                                                type="password"
                                                placeholder="Paste your Gemini API key..."
                                                value={apiKeyInput}
                                                onChange={function (e) { setApiKeyInput(e.target.value); }}
                                                className="chatbot-settings__input"
                                            />
                                            <button
                                                className={'chatbot-settings__save' + (keySaved ? ' chatbot-settings__save--done' : '')}
                                                onClick={handleSaveKey}
                                                disabled={!apiKeyInput.trim()}
                                            >
                                                {keySaved ? <Check size={14} /> : 'Save'}
                                            </button>
                                        </div>
                                        <a className="chatbot-settings__link" href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer">
                                            Get free API key from Google AI Studio
                                        </a>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Chat mode */}
                        {mode === 'chat' && (
                            <>
                                <div className="chatbot-panel__messages">
                                    {messages.map(function (msg) {
                                        return (
                                            <div key={msg.id} className={'chatbot-msg chatbot-msg--' + msg.sender}>
                                                {msg.sender === 'bot' && (
                                                    <div className="chatbot-msg__avatar"><Bot size={14} /></div>
                                                )}
                                                <div className="chatbot-msg__bubble">
                                                    {renderText(msg.text)}
                                                </div>
                                            </div>
                                        );
                                    })}
                                    {isTyping && (
                                        <div className="chatbot-msg chatbot-msg--bot">
                                            <div className="chatbot-msg__avatar"><Bot size={14} /></div>
                                            <div className="chatbot-msg__bubble chatbot-msg__typing">
                                                <span className="typing-dot" />
                                                <span className="typing-dot" />
                                                <span className="typing-dot" />
                                            </div>
                                        </div>
                                    )}
                                    <div ref={messagesEndRef} />
                                </div>

                                {/* Quick replies */}
                                {messages.length <= 1 && (
                                    <div className="chatbot-panel__quick">
                                        {QUICK_REPLIES.map(function (q) {
                                            return (
                                                <button key={q} className="chatbot-quick-btn" onClick={function () { sendMessage(q); }}>
                                                    {q}
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}

                                {/* Input */}
                                <form className="chatbot-panel__input" onSubmit={handleSubmit}>
                                    <input
                                        type="text"
                                        placeholder="Ask Sarvhit AI..."
                                        value={input}
                                        onChange={function (e) { setInput(e.target.value); }}
                                        autoFocus
                                    />
                                    <button type="submit" disabled={!input.trim()}>
                                        <Send size={16} />
                                    </button>
                                </form>
                            </>
                        )}

                        {/* Call mode */}
                        {mode === 'call' && (
                            <div className="chatbot-call">
                                <div className="chatbot-call__visual">
                                    <div className={'chatbot-call__orb' + (isSpeaking ? ' chatbot-call__orb--speaking' : '') + (isListening ? ' chatbot-call__orb--listening' : '')}>
                                        <div className="chatbot-call__orb-ring chatbot-call__orb-ring--1" />
                                        <div className="chatbot-call__orb-ring chatbot-call__orb-ring--2" />
                                        <div className="chatbot-call__orb-ring chatbot-call__orb-ring--3" />
                                        <div className="chatbot-call__orb-core">
                                            {isListening ? <Mic size={28} /> : <Volume2 size={28} />}
                                        </div>
                                    </div>
                                </div>

                                <div className="chatbot-call__label">
                                    {isSpeaking ? 'Sarvhit AI is speaking...' : isListening ? 'Listening to you...' : 'Processing...'}
                                </div>

                                <div className="chatbot-call__transcript">
                                    <p className="chatbot-call__text">
                                        {callText}
                                        {isListening && userTranscript && (
                                            <span className="chatbot-call__user-voice">{'\n\nYou: "' + userTranscript + '"'}</span>
                                        )}
                                    </p>
                                </div>

                                <div className="chatbot-call__timer">{formatTime(callDuration)}</div>

                                <div className="chatbot-call__controls">
                                    <button
                                        className={'chatbot-call__control' + (userMuted ? ' chatbot-call__control--muted' : '')}
                                        onClick={toggleMute}
                                    >
                                        {userMuted ? <MicOff size={20} /> : <Mic size={20} />}
                                    </button>
                                    <button className="chatbot-call__control chatbot-call__control--end" onClick={endCall}>
                                        <PhoneOff size={20} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
