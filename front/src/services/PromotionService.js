import { API_URL, ENDPOINTS, getApiUrl } from "../config/apiConfig";

export const PromotionService = {
  // Get all promotions (with optional query filters)
  getAllPromotions: async (filters = {}) => {
    try {
      const query = new URLSearchParams(filters).toString();
      const url = getApiUrl(ENDPOINTS.PROMOTIONS) + (query ? `?${query}` : "");

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result; // Return complete result
    } catch (error) {
      console.error("Error fetching promotions:", error);
      throw error;
    }
  },

  // Get promotions by place
  getPromotionsByPlace: async (placeId) => {
    if (!placeId) throw new Error("Place ID is required");

    try {
      const response = await fetch(
        getApiUrl(ENDPOINTS.PROMOTIONS_BY_PLACE(placeId))
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.data || [];
    } catch (error) {
      console.error("Error fetching promotions by place:", error);
      throw error;
    }
  },

  // Get promotion by ID
  getPromotionById: async (id) => {
    try {
      const response = await fetch(getApiUrl(ENDPOINTS.PROMOTION_BY_ID(id)));
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error("Error fetching promotion by ID:", error);
      throw error;
    }
  },

  // Create new promotion
  createPromotion: async (promotionData) => {
    try {
      const response = await fetch(getApiUrl(ENDPOINTS.ADD_PROMOTION), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(promotionData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error("Error creating promotion:", error);
      throw error;
    }
  },

  // Update promotion
  updatePromotion: async (id, promotionData) => {
    try {
      const response = await fetch(getApiUrl(ENDPOINTS.UPDATE_PROMOTION(id)), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(promotionData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error("Error updating promotion:", error);
      throw error;
    }
  },

  // Delete promotion
  deletePromotion: async (id) => {
    try {
      const response = await fetch(getApiUrl(ENDPOINTS.DELETE_PROMOTION(id)), {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return true;
    } catch (error) {
      console.error("Error deleting promotion:", error);
      throw error;
    }
  },
};

// Aliases for easier imports
export const getAllPromotions = PromotionService.getAllPromotions;
export const getPromotionsByPlace = PromotionService.getPromotionsByPlace;
export const getPromotionById = PromotionService.getPromotionById;
export const createPromotion = PromotionService.createPromotion;
export const updatePromotion = PromotionService.updatePromotion;
export const deletePromotion = PromotionService.deletePromotion;
