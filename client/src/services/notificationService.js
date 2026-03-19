const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:5005/api';

export const notificationService = {
  // Get all notifications for the logged-in user
  getNotifications: async (token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/notifications`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch notifications');
      return await response.json();
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  },

  // Get unread notification count
  getUnreadCount: async (token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/notifications/unread-count`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch unread count');
      return await response.json();
    } catch (error) {
      console.error('Error fetching unread count:', error);
      throw error;
    }
  },

  // Mark a notification as read
  markAsRead: async (notificationId, token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/notifications/${notificationId}/read`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error('Failed to mark notification as read');
      return await response.json();
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  },

  // Approve a volunteer for an event
  approveVolunteer: async (eventId, volunteerId, token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/events/${eventId}/volunteers/${volunteerId}/approve`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error('Failed to approve volunteer');
      return await response.json();
    } catch (error) {
      console.error('Error approving volunteer:', error);
      throw error;
    }
  },

  // Reject a volunteer for an event
  rejectVolunteer: async (eventId, volunteerId, token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/events/${eventId}/volunteers/${volunteerId}/reject`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error('Failed to reject volunteer');
      return await response.json();
    } catch (error) {
      console.error('Error rejecting volunteer:', error);
      throw error;
    }
  },
};

export default notificationService;
