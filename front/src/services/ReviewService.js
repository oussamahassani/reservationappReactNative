import { getApiUrl, ENDPOINTS } from "../config/apiConfig";

export const ReviewService = {
  // Get all reviews (optionally filtered)
  getAllReviews: async () => {
    try {
      const response = await fetch(getApiUrl(ENDPOINTS.REVIEWS));
      if (!response.ok) {
        const text = await response.text();
        throw new Error(`HTTP error! status: ${response.status} - ${text}`);
      }
      const result = await response.json();
      return result.data || [];
    } catch (error) {
      console.error("Error fetching all reviews:", error);
      throw error;
    }
  },

    getAllReviewsProved: async () => {
    try {
      const response = await fetch(getApiUrl(`${ENDPOINTS.REVIEWS}/gelAllAproved`));
      if (!response.ok) {
        const text = await response.text();
        throw new Error(`HTTP error! status: ${response.status} - ${text}`);
      }
      const result = await response.json();
      return result.data || [];
    } catch (error) {
      console.error("Error fetching all reviews:", error);
      throw error;
    }
  },

  // Get reviews by place ID
  getReviewsByPlace: async (placeId) => {
    try {
      const response = await fetch(
        getApiUrl(ENDPOINTS.REVIEWS_BY_PLACE(placeId))
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      return result.data || [];
    } catch (error) {
      console.error("Error fetching reviews by place:", error);
      throw error;
    }
  },

  // Get reviews by user ID
  getReviewsByUser: async (userId) => {
    try {
      const response = await fetch(
        getApiUrl(ENDPOINTS.REVIEWS_BY_USER(userId))
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      return result.data || [];
    } catch (error) {
      console.error("Error fetching reviews by user:", error);
      throw error;
    }
  },

  // Get review by ID
  getReviewById: async (id) => {
    try {
      const response = await fetch(getApiUrl(ENDPOINTS.REVIEW_BY_ID(id)));
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      return result.data || null;
    } catch (error) {
      console.error("Error fetching review by ID:", error);
      throw error;
    }
  },

  // Create a new review
  createReview: async (reviewData) => {
    try {
      const response = await fetch(getApiUrl(ENDPOINTS.ADD_REVIEW), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(reviewData),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`HTTP error! status: ${response.status} - ${text}`);
      }

      const result = await response.json();
      return result.data || null;
    } catch (error) {
      console.error("Error creating review:", error);
      throw error;
    }
  },

  // Update a review
  updateReview: async (id, reviewData) => {
    console.log(reviewData)
    try {
      const response = await fetch(getApiUrl(ENDPOINTS.UPDATE_REVIEW(id)), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(reviewData),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`HTTP error! status: ${response.status} - ${text}`);
      }

      const result = await response.json();
      return result.data || null;
    } catch (error) {
      console.error("Error updating review:", error);
      throw error;
    }
  },

  // Delete a review
  deleteReview: async (id) => {
    try {
      const response = await fetch(getApiUrl(ENDPOINTS.DELETE_REVIEW(id)), {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return true;
    } catch (error) {
      console.error("Error deleting review:", error);
      throw error;
    }
  },
};

// Aliases
export const getAllReviews = ReviewService.getAllReviews;
export const getReviewsByPlace = ReviewService.getReviewsByPlace;
export const getReviewsByUser = ReviewService.getReviewsByUser;
export const getReviewById = ReviewService.getReviewById;
export const createReview = ReviewService.createReview;
export const updateReview = ReviewService.updateReview;
export const deleteReview = ReviewService.deleteReview;
