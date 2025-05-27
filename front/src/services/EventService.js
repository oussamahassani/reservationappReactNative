import { API_URL, ENDPOINTS, getApiUrl } from "../config/apiConfig";

export const EventService = {
  getAllEvents: async () => {
    try {
      const response = await fetch(getApiUrl(ENDPOINTS.EVENTS));

      if (!response.ok) {
        const errorText = await response.text();
        console.error(" HTTP error body:", errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const text = await response.text();
      if (!text) {
        console.warn(" Empty response body");
        return { data: [], count: 0 };
      }

      const result = JSON.parse(text);
      return result.data;
    } catch (error) {
      console.error("Error fetching events:", error);
      throw error;
    }
  },

  // Get events by place
  getEventsByPlace: async (placeId) => {
    if (!placeId) {
      throw new Error("Place ID is required");
    }

    try {
      const response = await fetch(
        getApiUrl(ENDPOINTS.EVENTS_BY_PLACE(placeId))
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      return result.data || [];
    } catch (error) {
      console.error("Error fetching events by place:", error);
      throw error;
    }
  },

  // Get event by ID
  getEventById: async (id) => {
    try {
      const response = await fetch(getApiUrl(ENDPOINTS.EVENT_BY_ID(id)));
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const text = await response.text();
      const result = text ? JSON.parse(text) : {};
      return result.data || null;
    } catch (error) {
      console.error("Error fetching event:", error);
      throw error;
    }
  },

  // Create new event
  createEvent: async (eventData) => {
    try {
      const response = await fetch(getApiUrl(ENDPOINTS.ADD_EVENT), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(eventData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(" Backend returned error text:", errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const text = await response.text();
      const result = text ? JSON.parse(text) : {};
      return result.data || null;
    } catch (error) {
      console.error("Error creating event:", error);
      throw error;
    }
  },

  // Update existing event
  updateEvent: async (id, eventData) => {
    try {
      const response = await fetch(getApiUrl(ENDPOINTS.UPDATE_EVENT(id)), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(eventData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error("Error updating event:", error);
      throw error;
    }
  },

  // Delete event
  deleteEvent: async (id) => {
    try {
      const response = await fetch(getApiUrl(ENDPOINTS.DELETE_EVENT(id)), {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return true;
    } catch (error) {
      console.error("Error deleting event:", error);
      throw error;
    }
  },
};

// Create aliases for easier imports
export const getAllEvents = EventService.getAllEvents;
export const getEventsByPlace = EventService.getEventsByPlace;
export const getEventById = EventService.getEventById;
export const createEvent = EventService.createEvent;
export const updateEvent = EventService.updateEvent;
export const deleteEvent = EventService.deleteEvent;
