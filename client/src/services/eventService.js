const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

export const eventService = {
  // Get all published events
  getAllEvents: async (filters = {}) => {
    try {
      const queryParams = new URLSearchParams();
      if (filters.cause) queryParams.append('cause', filters.cause);
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.sort) queryParams.append('sort', filters.sort);

      const response = await fetch(`${API_BASE_URL}/events?${queryParams.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch events');
      return await response.json();
    } catch (error) {
      console.error('Error fetching events:', error);
      throw error;
    }
  },

  // Get single event by ID
  getEventById: async (eventId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/events/${eventId}`);
      if (!response.ok) throw new Error('Failed to fetch event');
      return await response.json();
    } catch (error) {
      console.error('Error fetching event:', error);
      throw error;
    }
  },

  // Create new event (NGO only)
  createEvent: async (eventData, token) => {
    try {
      console.log('=== EVENT SERVICE: CREATE EVENT ===');
      console.log('API_BASE_URL:', API_BASE_URL);
      console.log('Full URL:', `${API_BASE_URL}/events`);
      console.log('Token present:', !!token);
      console.log('Event data:', eventData);
      
      const response = await fetch(`${API_BASE_URL}/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(eventData),
      });
      
      console.log('Response status:', response.status);
      console.log('Response statusText:', response.statusText);
      console.log('Response ok:', response.ok);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: response.statusText }));
        console.error('Server error response:', errorData);
        throw new Error(errorData.error || errorData.message || `Failed to create event (${response.status})`);
      }
      
      const jsonResponse = await response.json();
      console.log('Event created successfully:', jsonResponse);
      return jsonResponse;
    } catch (error) {
      console.error('=== EVENT SERVICE ERROR ===');
      console.error('Error message:', error.message);
      console.error('Error type:', error.name);
      console.error('Full error:', error);
      throw error;
    }
  },

  // Update event (NGO owner only)
  updateEvent: async (eventId, eventData, token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/events/${eventId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(eventData),
      });
      if (!response.ok) throw new Error('Failed to update event');
      return await response.json();
    } catch (error) {
      console.error('Error updating event:', error);
      throw error;
    }
  },

  // Delete event (NGO owner only)
  deleteEvent: async (eventId, token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/events/${eventId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error('Failed to delete event');
      return await response.json();
    } catch (error) {
      console.error('Error deleting event:', error);
      throw error;
    }
  },

  // Get organizer's events
  getOrganizerEvents: async (token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/events/organizer/my-events`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch organizer events');
      return await response.json();
    } catch (error) {
      console.error('Error fetching organizer events:', error);
      throw error;
    }
  },

  // Join event as volunteer
  joinEventAsVolunteer: async (eventId, token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/events/${eventId}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error('Failed to join event');
      return await response.json();
    } catch (error) {
      console.error('Error joining event:', error);
      throw error;
    }
  },

  // Fund event as sponsor
  fundEvent: async (eventId, amount, token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/events/${eventId}/fund`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ amount }),
      });
      if (!response.ok) throw new Error('Failed to fund event');
      return await response.json();
    } catch (error) {
      console.error('Error funding event:', error);
      throw error;
    }
  },

  // Publish event
  publishEvent: async (eventId, token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/events/${eventId}/publish`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error('Failed to publish event');
      return await response.json();
    } catch (error) {
      console.error('Error publishing event:', error);
      throw error;
    }
  },
};

export default eventService;
