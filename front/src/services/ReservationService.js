import { getApiUrl, ENDPOINTS } from '../config/apiConfig';

export const ReservationService = {
  // Obtenir toutes les réservations avec filtres optionnels
  getReservations: async (filters = {}) => {
    const queryParams = new URLSearchParams(filters);
    const response = await fetch(getApiUrl(`${ENDPOINTS.RESERVATIONS}?${queryParams}`));
    if (!response.ok) {
      throw new Error(`Erreur HTTP! statut: ${response.status}`);
    }
    return response.json();
  },

  // Obtenir les détails d'une réservation
  getReservationDetails: async (id) => {
    const response = await fetch(getApiUrl(ENDPOINTS.RESERVATION_BY_ID(id)));
    if (!response.ok) {
      throw new Error(`Erreur HTTP! statut: ${response.status}`);
    }
    return response.json();
  },

  // Créer une nouvelle réservation
  createReservation: async (reservationData) => {
    // Valider que soit placeId soit eventId est fourni, mais pas les deux
    if ((!reservationData.placeId && !reservationData.eventId) || 
        (reservationData.placeId && reservationData.eventId)) {
      throw new Error('Soit placeId soit eventId doit être fourni, mais pas les deux');
    }

    const response = await fetch(getApiUrl(ENDPOINTS.ADD_RESERVATION), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(reservationData),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Erreur lors de la création de la réservation');
    }
    return response.json();
  },

  // Mettre à jour une réservation
  updateReservation: async (id, updateData) => {
    const response = await fetch(getApiUrl(ENDPOINTS.UPDATE_RESERVATION(id)), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    });
    if (!response.ok) {
      throw new Error(`Erreur HTTP! statut: ${response.status}`);
    }
    return response.json();
  },

  // Supprimer une réservation
  deleteReservation: async (id) => {
    const response = await fetch(getApiUrl(ENDPOINTS.DELETE_RESERVATION(id)), {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error(`Erreur HTTP! statut: ${response.status}`);
    }
    return response.json();
  },

  // Calculer le prix total (exemple)
  calculateTotalPrice: (entityType, entityData, quantity) => {
    const basePrice = entityType === 'event' ? entityData.ticketPrice : entityData.pricePerPerson;
    return basePrice * quantity;
  }
};
