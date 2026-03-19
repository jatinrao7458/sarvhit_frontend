const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:5005/api';

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
      const response = await fetch(`${API_BASE_URL}/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(eventData),
      });
      if (!response.ok) throw new Error('Failed to create event');
      return await response.json();
    } catch (error) {
      console.error('Error creating event:', error);
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
