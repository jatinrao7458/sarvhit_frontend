import { createContext, useContext, useState, useCallback } from 'react';

const AuthContext = createContext(null);

const MOCK_USERS = {
  ngo: {
    id: '1',
    name: 'Green Earth Foundation',
    email: 'contact@greenearth.org',
    role: 'ngo',
    avatar: null,
    bio: 'Working towards a sustainable future through community action and environmental education.',
    location: 'Mumbai, India',
    founded: '2018',
    eventsHosted: 47,
    volunteersConnected: 312,
    fundsReceived: 245000,
  },
  volunteer: {
    id: '2',
    name: 'Priya Sharma',
    email: 'priya.sharma@email.com',
    role: 'volunteer',
    avatar: null,
    bio: 'Passionate about making a difference. Weekend warrior for social causes.',
    location: 'Delhi, India',
    hoursLogged: 186,
    eventsJoined: 23,
    badgesEarned: 8,
    skills: ['Teaching', 'First Aid', 'Cooking', 'Photography'],
  },
  sponsor: {
    id: '3',
    name: 'Apex Technologies',
    email: 'csr@apextech.com',
    role: 'sponsor',
    avatar: null,
    bio: 'Committed to giving back through strategic social investments and corporate partnerships.',
    location: 'Bangalore, India',
    totalDonated: 750000,
    projectsFunded: 12,
    impactScore: 94,
    sectors: ['Education', 'Healthcare', 'Environment'],
  },
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const login = useCallback((role) => {
    const mockUser = MOCK_USERS[role];
    setUser(mockUser);
    setIsAuthenticated(true);
  }, []);

  const signup = useCallback((name, email, role) => {
    const base = MOCK_USERS[role];
    setUser({ ...base, name, email });
    setIsAuthenticated(true);
  }, []);

  const updateUser = useCallback((updates) => {
    setUser(prev => prev ? { ...prev, ...updates } : prev);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, signup, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}

export default AuthContext;
