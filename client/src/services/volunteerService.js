const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:5005/api';

export const volunteerService = {
  // Get all volunteers for map display
  getAllVolunteers: async () => {
    try {
      console.log('Fetching volunteers from:', `${API_BASE_URL}/volunteer/all`);
      const response = await fetch(`${API_BASE_URL}/volunteer/all`);
      if (!response.ok) throw new Error('Failed to fetch volunteers');
      return await response.json();
    } catch (error) {
      console.error('Error fetching volunteers:', error);
      throw error;
    }
  },

  // Log volunteer hours
  logVolunteerHours: async (eventId, hoursLogged, roleFilledAt, description, token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/volunteers/log-hours`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          eventId,
          hoursLogged,
          roleFilledAt,
          description,
        }),
      });
      
      if (!response.ok) throw new Error('Failed to log volunteer hours');
      return await response.json();
    } catch (error) {
      console.error('Error logging volunteer hours:', error);
      throw error;
    }
  },

  // Get volunteer logs
  getVolunteerLogs: async (token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/volunteers/my-logs`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!response.ok) throw new Error('Failed to fetch volunteer logs');
      return await response.json();
    } catch (error) {
      console.error('Error fetching volunteer logs:', error);
      throw error;
    }
  },

  // Get pending logs (for NGO to approve)
  getPendingLogs: async (token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/volunteers/pending`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!response.ok) throw new Error('Failed to fetch pending logs');
      return await response.json();
    } catch (error) {
      console.error('Error fetching pending logs:', error);
      throw error;
    }
  },

  // Approve volunteer hours
  approveVolunteerHours: async (logId, token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/volunteers/${logId}/approve`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!response.ok) throw new Error('Failed to approve volunteer hours');
      return await response.json();
    } catch (error) {
      console.error('Error approving volunteer hours:', error);
      throw error;
    }
  },

  // Reject volunteer hours
  rejectVolunteerHours: async (logId, token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/volunteers/${logId}/reject`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!response.ok) throw new Error('Failed to reject volunteer hours');
      return await response.json();
    } catch (error) {
      console.error('Error rejecting volunteer hours:', error);
      throw error;
    }
  },
};
