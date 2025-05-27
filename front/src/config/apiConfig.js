// Configuration de l'API avec l'adresse IP statique
// API Configuration with static IP address

// URL API statique (pas de détection dynamique)
// Static API URL (no dynamic detection)
const DEFAULT_API_URL = "http://172.16.16.238:3000";
export const API_URL = DEFAULT_API_URL;

// Points de terminaison de l'API pour le développement
// Development API endpoints
export const ENDPOINTS = {
  // Points de terminaison pour les utilisateurs
  // User endpoints
  USERS: "/api/users",
  LOGIN: "/api/users/login",
  REGISTER: "/api/users/register",
  USER_BY_ID: (id) => `/api/users/${id}`,
  ALL_USERS: "/api/users",

  // Points de terminaison pour la réinitialisation du mot de passe
  // Password reset endpoints
  FORGOT_PASSWORD: "/api/password/forgot",
  RESET_PASSWORD: "/api/password/reset",

  // Points de terminaison pour les lieux
  // Places endpoints
  PLACES: "/api/places",
  PLACE_BY_ID: (id) => `/api/places/${id}`,
  ADD_PLACE: "/api/places",
  PLACES_BY_PROVIDER: (providerId) => `/api/places/provider/${providerId}`,
  UPDATE_PLACE: (id) => `/api/places/${id}`,
  DELETE_PLACE: (id) => `/api/places/${id}`,

  // Points de terminaison pour les avis
  // Reviews endpoints
  REVIEWS: "/api/reviews",
  REVIEWS_BY_PLACE: (placeId) => `/api/reviews/place/${placeId}`,
  REVIEWS_BY_USER: (userId) => `/api/reviews/user/${userId}`,
  REVIEW_BY_ID: (id) => `/api/reviews/${id}`,
  ADD_REVIEW: "/api/reviews",
  UPDATE_REVIEW: (id) => `/api/reviews/${id}`,
  DELETE_REVIEW: (id) => `/api/reviews/${id}`,

  // Points de terminaison pour les événements
  // Events endpoints
  EVENTS: "/api/events",
  EVENTS_BY_PLACE: (placeId) => `/api/events/place/${placeId}`,
  EVENT_BY_ID: (id) => `/api/events/${id}`,
  ADD_EVENT: "/api/events",
  UPDATE_EVENT: (id) => `/api/events/${id}`,
  DELETE_EVENT: (id) => `/api/events/${id}`,

  // Points de terminaison pour les réservations
  // Reservation endpoints
  RESERVATIONS: "/api/reservations",
  RESERVATION_BY_ID: (id) => `/api/reservations/${id}`,
  ADD_RESERVATION: "/api/reservations",
  UPDATE_RESERVATION: (id) => `/api/reservations/${id}`,
  DELETE_RESERVATION: (id) => `/api/reservations/${id}`,
  CHECK_AVAILABILITY: "/api/reservations/availability",
  RESERVATIONS_BY_USER: (userId) => `/api/reservations/user/${userId}`,
  RESERVATIONS_BY_PLACE: (placeId) => `/api/reservations/place/${placeId}`,
  RESERVATIONS_BY_EVENT: (eventId) => `/api/reservations/event/${eventId}`,

  // Points de terminaison pour la messagerie
  // Messaging endpoints
  SEND_MESSAGE: "/api/messagerie/send",
  GET_CONVERSATION: (userId1, userId2) =>
    `/api/messagerie/conversations/${userId1}/${userId2}`,
  LIST_CONVERSATIONS: (userId) => `/api/messagerie/conversations/${userId}`,

  //promotions
  PROMOTIONS: "/api/promotions",
  PROMOTIONS_BY_PLACE: (placeId) => `/api/promotions/place/${placeId}`,
  PROMOTION_BY_ID: (id) => `/api/promotions/${id}`,
  ADD_PROMOTION: "/api/promotions",
  UPDATE_PROMOTION: (id) => `/api/promotions/${id}`,
  DELETE_PROMOTION: (id) => `/api/promotions/${id}`,
};

// Utility function to construct full API URL - synchronous version
export const getApiUrlSync = (endpoint) => {
  if (!endpoint) {
    console.error("Endpoint is undefined in getApiUrlSync");
    return `${API_URL}/api`;
  }
  return `${API_URL}${endpoint}`;
};

// Utility function to construct full API URL
export const getApiUrl = (endpoint) => {
  if (!endpoint) {
    console.error("Endpoint is undefined in getApiUrl");
    return `${API_URL}/api`;
  }
  return `${API_URL}${endpoint}`;
};

// Export the function for potential future use but make it just return the static URL
export const getBaseApiUrl = () => DEFAULT_API_URL;

// Console log for debugging
console.log("API URL configurée:", API_URL);
console.log("Events endpoint:", getApiUrl(ENDPOINTS.EVENTS));
console.log(
  "Events by place endpoint example:",
  getApiUrl(ENDPOINTS.EVENTS_BY_PLACE(4))
);
