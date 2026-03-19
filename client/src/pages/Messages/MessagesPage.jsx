import { useAuth } from '../../context/AuthContext';
import { fadeUp } from '../../hooks/useAnimations';
import { motion } from 'framer-motion';
import { MessageCircle, Send, Search } from 'lucide-react';
import { useState } from 'react';
import './MessagesPage.css';

const CONVERSATIONS = {
    ngo: [
        { id: 1, name: 'Priya Sharma', role: 'Volunteer', avatar: 'PS', lastMsg: 'I can make it to the cleanup drive this Saturday!', time: '2h ago', unread: 2 },
        { id: 2, name: 'Apex Technologies', role: 'Sponsor', avatar: 'AT', lastMsg: 'We\'d like to discuss the CSR partnership proposal.', time: '5h ago', unread: 1 },
        { id: 3, name: 'Rahul Kumar', role: 'Volunteer', avatar: 'RK', lastMsg: 'Thank you for confirming my registration.', time: '1d ago', unread: 0 },
        { id: 4, name: 'GreenFund Corp', role: 'Sponsor', avatar: 'GF', lastMsg: 'Impact report received. Looks great!', time: '2d ago', unread: 0 },
    ],
    volunteer: [
        { id: 1, name: 'Green Earth Foundation', role: 'NGO', avatar: 'GE', lastMsg: 'Your application has been accepted! Welcome aboard.', time: '1h ago', unread: 1 },
        { id: 2, name: 'Teach India', role: 'NGO', avatar: 'TI', lastMsg: 'Great session today, thanks for volunteering!', time: '3h ago', unread: 0 },
        { id: 3, name: 'Helping Hands NGO', role: 'NGO', avatar: 'HH', lastMsg: 'Can you join next week\'s event?', time: '1d ago', unread: 3 },
    ],
    sponsor: [
        { id: 1, name: 'Green Earth Foundation', role: 'NGO', avatar: 'GE', lastMsg: 'Here\'s the quarterly impact report you requested.', time: '2h ago', unread: 1 },
        { id: 2, name: 'Digital Literacy Project', role: 'NGO', avatar: 'DL', lastMsg: 'We reached 80% of our funding goal!', time: '6h ago', unread: 0 },
        { id: 3, name: 'Rural Health Initiative', role: 'NGO', avatar: 'RH', lastMsg: 'Thank you for your generous donation.', time: '1d ago', unread: 2 },
    ],
};

// Per-conversation messages keyed by "role-convoId"
const MESSAGES = {
    // ── NGO conversations ──
    'ngo-1': [ // Priya Sharma (Volunteer)
        { id: 1, from: 'them', text: 'Hi! I saw your post about the river cleanup drive.', time: '9:10 AM' },
        { id: 2, from: 'me', text: 'Hey Priya! Yes, we need volunteers this Saturday at Yamuna Ghat.', time: '9:12 AM' },
        { id: 3, from: 'them', text: 'I have experience with waste segregation. Would that be helpful?', time: '9:15 AM' },
        { id: 4, from: 'me', text: 'Absolutely! We need someone to lead the sorting station. Can you be there by 8 AM?', time: '9:17 AM' },
        { id: 5, from: 'them', text: 'I can make it to the cleanup drive this Saturday! 💪', time: '9:20 AM' },
    ],
    'ngo-2': [ // Apex Technologies (Sponsor)
        { id: 1, from: 'me', text: 'Hello Apex team, thank you for your interest in our CSR programs.', time: '2:00 PM' },
        { id: 2, from: 'them', text: 'We\'ve reviewed your impact report from last quarter. Impressive numbers!', time: '2:05 PM' },
        { id: 3, from: 'me', text: 'Thank you! We impacted over 5,000 beneficiaries across 12 events.', time: '2:08 PM' },
        { id: 4, from: 'them', text: 'We\'d like to discuss the CSR partnership proposal. Can we schedule a call?', time: '2:12 PM' },
        { id: 5, from: 'me', text: 'Of course! How about Thursday at 3 PM? I\'ll send a calendar invite.', time: '2:14 PM' },
        { id: 6, from: 'them', text: 'Thursday works. Looking forward to it! 🤝', time: '2:16 PM' },
    ],
    'ngo-3': [ // Rahul Kumar (Volunteer)
        { id: 1, from: 'them', text: 'Hello, I just signed up for the Tree Plantation Week event.', time: '11:00 AM' },
        { id: 2, from: 'me', text: 'Welcome aboard, Rahul! We\'re glad to have you.', time: '11:03 AM' },
        { id: 3, from: 'them', text: 'Is there anything I need to bring? I have my own gardening tools.', time: '11:05 AM' },
        { id: 4, from: 'me', text: 'That\'s great! Just bring gloves and a water bottle. We\'ll provide saplings and compost.', time: '11:08 AM' },
        { id: 5, from: 'them', text: 'Thank you for confirming my registration. See you there!', time: '11:10 AM' },
    ],
    'ngo-4': [ // GreenFund Corp (Sponsor)
        { id: 1, from: 'them', text: 'Hi, we received the Q3 impact report. The data visualization is excellent.', time: '4:30 PM' },
        { id: 2, from: 'me', text: 'Thank you! We put extra effort into making the metrics transparent this quarter.', time: '4:35 PM' },
        { id: 3, from: 'them', text: 'The rural education program stats stood out. 1,200 students benefited!', time: '4:38 PM' },
        { id: 4, from: 'me', text: 'Yes, that program has grown 40% since your initial funding. Would you like to extend support for Q4?', time: '4:42 PM' },
        { id: 5, from: 'them', text: 'Impact report received. Looks great! Let us discuss renewal next week.', time: '4:45 PM' },
    ],

    // ── Volunteer conversations ──
    'volunteer-1': [ // Green Earth Foundation (NGO)
        { id: 1, from: 'them', text: 'Hi! We reviewed your volunteer application. Your skills in first aid are exactly what we need.', time: '10:00 AM' },
        { id: 2, from: 'me', text: 'That\'s amazing to hear! I\'ve been wanting to contribute to environmental causes.', time: '10:05 AM' },
        { id: 3, from: 'them', text: 'We have a beach cleanup next weekend. Would you like to join as our medical volunteer?', time: '10:08 AM' },
        { id: 4, from: 'me', text: 'Definitely! I\'ll bring my first aid kit. What\'s the location?', time: '10:12 AM' },
        { id: 5, from: 'them', text: 'Your application has been accepted! Welcome aboard. 🌿 Details sent to your email.', time: '10:15 AM' },
    ],
    'volunteer-2': [ // Teach India (NGO)
        { id: 1, from: 'me', text: 'Hi, I just completed my session with the Grade 5 batch today.', time: '3:00 PM' },
        { id: 2, from: 'them', text: 'How did it go? The kids were really excited about the science experiment.', time: '3:05 PM' },
        { id: 3, from: 'me', text: 'They loved it! We built a volcano model. All 28 students participated actively.', time: '3:08 PM' },
        { id: 4, from: 'them', text: 'That\'s wonderful! We\'ll log 4 hours for you. Same time next Tuesday?', time: '3:12 PM' },
        { id: 5, from: 'me', text: 'Yes, I\'ll prepare a lesson on the solar system next. 🚀', time: '3:15 PM' },
        { id: 6, from: 'them', text: 'Great session today, thanks for volunteering! The kids adore you.', time: '3:18 PM' },
    ],
    'volunteer-3': [ // Helping Hands NGO
        { id: 1, from: 'them', text: 'Hey! We noticed your profile lists web development as a skill. We need help building our donation page.', time: '9:30 AM' },
        { id: 2, from: 'me', text: 'Sure, I\'d love to help! What tech stack are you using?', time: '9:35 AM' },
        { id: 3, from: 'them', text: 'We have a basic WordPress site, but want to add a secure payment gateway.', time: '9:38 AM' },
        { id: 4, from: 'me', text: 'I can integrate Razorpay. Should take about 2 weekends. When do you need it?', time: '9:42 AM' },
        { id: 5, from: 'them', text: 'Can you join next week\'s event? We can discuss the project in person.', time: '9:45 AM' },
        { id: 6, from: 'me', text: 'Count me in! I\'ll bring my laptop so we can prototype together. 💻', time: '9:48 AM' },
    ],

    // ── Sponsor conversations ──
    'sponsor-1': [ // Green Earth Foundation (NGO)
        { id: 1, from: 'me', text: 'Hello, I\'d like to get an update on the rural water project I funded.', time: '11:00 AM' },
        { id: 2, from: 'them', text: 'Hi! Great timing. We just completed Phase 2 — 3 new borewells installed.', time: '11:05 AM' },
        { id: 3, from: 'me', text: 'That\'s excellent progress! How many villages are benefiting now?', time: '11:08 AM' },
        { id: 4, from: 'them', text: '7 villages, approximately 4,500 people now have clean drinking water.', time: '11:12 AM' },
        { id: 5, from: 'me', text: 'Outstanding. Can you send the quarterly impact report with photos?', time: '11:15 AM' },
        { id: 6, from: 'them', text: 'Here\'s the quarterly impact report you requested. 📊 Sent to your email!', time: '11:18 AM' },
    ],
    'sponsor-2': [ // Digital Literacy Project (NGO)
        { id: 1, from: 'them', text: 'Exciting news! Our coding bootcamp graduated its first batch of 50 students.', time: '1:00 PM' },
        { id: 2, from: 'me', text: 'That\'s fantastic! What\'s the placement rate looking like?', time: '1:05 PM' },
        { id: 3, from: 'them', text: '72% got internships, and 8 students received full-time offers from tech companies!', time: '1:08 PM' },
        { id: 4, from: 'me', text: 'Incredible ROI on that investment. How much more funding do you need for Batch 2?', time: '1:12 PM' },
        { id: 5, from: 'them', text: 'We reached 80% of our funding goal! ₹3.2L more would cover everything. 🎯', time: '1:15 PM' },
    ],
    'sponsor-3': [ // Rural Health Initiative (NGO)
        { id: 1, from: 'them', text: 'Your donation helped us set up a mobile health clinic in Jharkhand!', time: '5:00 PM' },
        { id: 2, from: 'me', text: 'Wonderful! How many patients have been treated so far?', time: '5:05 PM' },
        { id: 3, from: 'them', text: 'Over 1,800 patients in just 3 months. We\'re running weekly camps now.', time: '5:08 PM' },
        { id: 4, from: 'me', text: 'That\'s making a real difference. Do you need additional medical supplies?', time: '5:12 PM' },
        { id: 5, from: 'them', text: 'Yes, we need BP monitors and glucometers. An additional ₹45K would cover it.', time: '5:15 PM' },
        { id: 6, from: 'me', text: 'Consider it done. I\'ll transfer the funds today. 🏥', time: '5:18 PM' },
        { id: 7, from: 'them', text: 'Thank you for your generous donation. You\'re saving lives! 🙏', time: '5:20 PM' },
    ],
};

export default function MessagesPage() {
    const { user } = useAuth();
    const role = user?.role || 'ngo';
    const conversations = CONVERSATIONS[role] || [];
    const [activeConvo, setActiveConvo] = useState(conversations[0]?.id || null);
    const [search, setSearch] = useState('');
    const [newMsg, setNewMsg] = useState('');

    const filtered = conversations.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase())
    );
    const selected = conversations.find(c => c.id === activeConvo);
    const chatMessages = MESSAGES[`${role}-${activeConvo}`] || [];

    const handleSend = (e) => {
        e.preventDefault();
        if (!newMsg.trim()) return;
        setNewMsg('');
    };

    return (
        <div className="messages-page">
            {/* Conversation List */}
            <motion.div className="messages__sidebar" {...fadeUp(0)}>
                <div className="messages__sidebar-header">
                    <h2><MessageCircle size={20} /> Messages</h2>
                </div>
                <div className="messages__search">
                    <Search size={16} />
                    <input
                        type="text"
                        placeholder="Search conversations..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
                <div className="messages__list">
                    {filtered.map((convo, i) => (
                        <motion.div
                            key={convo.id}
                            className={`message-convo ${activeConvo === convo.id ? 'message-convo--active' : ''}`}
                            onClick={() => setActiveConvo(convo.id)}
                            {...fadeUp(i + 1)}
                            whileHover={{ x: 4 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                        >
                            <div className="message-convo__avatar">{convo.avatar}</div>
                            <div className="message-convo__info">
                                <div className="message-convo__top">
                                    <span className="message-convo__name">{convo.name}</span>
                                    <span className="message-convo__time">{convo.time}</span>
                                </div>
                                <div className="message-convo__bottom">
                                    <span className="message-convo__preview">{convo.lastMsg}</span>
                                    {convo.unread > 0 && (
                                        <span className="message-convo__badge">{convo.unread}</span>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </motion.div>

            {/* Chat Area */}
            <motion.div className="messages__chat" {...fadeUp(1)}>
                {selected ? (
                    <>
                        <div className="messages__chat-header">
                            <div className="messages__chat-avatar">{selected.avatar}</div>
                            <div>
                                <span className="messages__chat-name">{selected.name}</span>
                                <span className="messages__chat-role">{selected.role}</span>
                            </div>
                        </div>

                        <div className="messages__chat-body">
                            {chatMessages.map(msg => (
                                <div
                                    key={msg.id}
                                    className={`chat-bubble ${msg.from === 'me' ? 'chat-bubble--me' : 'chat-bubble--them'}`}
                                >
                                    <p>{msg.text}</p>
                                    <span className="chat-bubble__time">{msg.time}</span>
                                </div>
                            ))}
                        </div>

                        <form className="messages__chat-input" onSubmit={handleSend}>
                            <input
                                type="text"
                                placeholder="Type a message..."
                                value={newMsg}
                                onChange={e => setNewMsg(e.target.value)}
                            />
                            <button type="submit" className="messages__send-btn">
                                <Send size={18} />
                            </button>
                        </form>
                    </>
                ) : (
                    <div className="messages__empty">
                        <MessageCircle size={48} />
                        <p>Select a conversation to start chatting</p>
                    </div>
                )}
            </motion.div>
        </div>
    );
}
