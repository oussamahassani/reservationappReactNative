import { useState, useEffect } from "react";
import { Alert } from "react-native";
import { getApiUrlSync, getApiUrl, ENDPOINTS } from "../config/apiConfig";

// Hook personnalisé pour gérer les données des lieux
// Custom hook to manage places data
export const usePlacesData = () => {
  const [places, setPlaces] = useState([]); // État pour stocker les lieux / State to store places
  const [isLoading, setIsLoading] = useState(true); // État pour le chargement / Loading state
  const [error, setError] = useState(null); // État pour les erreurs / Error state

  // Fonction pour récupérer tous les lieux
  // Function to fetch all places
  const fetchPlaces = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const url = getApiUrlSync(ENDPOINTS.PLACES);
      console.log("Récupération des lieux depuis:", url); // Log de l'URL / Log the URL
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Erreur HTTP! statut: ${response.status}`);
      }
      const result = await response.json();
      setPlaces(result.data || []);
    } catch (e) {
      console.error("Erreur lors de la récupération des lieux:", e);
      setPlaces([]);
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction pour récupérer les lieux par prestataire
  // Function to fetch places by provider
  const fetchPlacesByProvider = async (providerId) => {
    setIsLoading(true);
    setError(null);
    try {
      const url = getApiUrlSync(ENDPOINTS.PLACES_BY_PROVIDER(providerId));
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Erreur HTTP! statut: ${response.status}`);
      }
      const result = await response.json();

      return result || [];
    } catch (e) {
      console.error(
        "Erreur lors de la récupération des lieux du prestataire:",
        e
      );
      setError(e.message);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction pour supprimer un lieu
  // Function to delete a place
  const deletePlace = async (id) => {
    try {
      const response = await fetch(getApiUrl(ENDPOINTS.DELETE_PLACE(id)), {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP! statut: ${response.status}`);
      }

      // Supprimer le lieu de l'état / Remove the deleted place from state
      setPlaces(places.filter((place) => place.id !== id));
      return true;
    } catch (e) {
      console.error("Erreur lors de la suppression du lieu:", e);
      Alert.alert("Erreur", `Impossible de supprimer le lieu: ${e.message}`);
      return false;
    }
  };

  // Fonction pour mettre à jour un lieu selon l'API fournie
  // Function to update a place according to the provided API
  const updatePlace = async (id, updatedData) => {
    try {
      console.log("Mise à jour du lieu avec ID:", id);
      console.log("Données de mise à jour:", JSON.stringify(updatedData));

      // Utilisation de l'API directement basée sur la documentation fournie
      // Direct use of the API based on the provided documentation
      const response = await fetch(getApiUrl(ENDPOINTS.UPDATE_PLACE(id)), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error("Réponse d'erreur du serveur:", errorData);
        throw new Error(`Erreur HTTP! statut: ${response.status}`);
      }

      const result = await response.json();
      console.log("Mise à jour réussie, réponse du serveur:", result);

      // Mettre à jour le lieu dans l'état s'il existe
      // Update the place in state if it exists
      setPlaces(
        places.map((place) =>
          place.id === id ? { ...place, ...result.data } : place
        )
      );

      return result.data;
    } catch (e) {
      console.error("Erreur lors de la mise à jour du lieu:", e);
      Alert.alert(
        "Erreur",
        `Impossible de mettre à jour le lieu: ${e.message}`
      );
      throw e;
    }
  };

  // Fonction pour ajouter un nouveau lieu
  // Function to add a new place
  const addPlace = async (placeData) => {
    try {
      console.log("Ajout d'un nouveau lieu:", JSON.stringify(placeData));

      // Création d'un nouveau lieu en utilisant l'API
      // Creating a new place using the API
      // L'API attend une requête POST avec les données du lieu au format JSON
      // The API expects a POST request with place data in JSON format
      const response = await fetch(getApiUrl(ENDPOINTS.ADD_PLACE), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(placeData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error("Réponse d'erreur du serveur:", errorData);
        throw new Error(`Erreur HTTP! statut: ${response.status}`);
      }

      const result = await response.json();
      console.log("Lieu ajouté avec succès:", result);

      // Ajouter le nouveau lieu à l'état local
      // Add the new place to local state
      setPlaces([...places, result.data]);

      return result.data;
    } catch (e) {
      console.error("Erreur lors de l'ajout du lieu:", e);
      Alert.alert("Erreur", `Impossible d'ajouter le lieu: ${e.message}`);
      throw e;
    }
  };

  // Charger les lieux au montage du composant
  // Load places when component mounts
  useEffect(() => {
    fetchPlaces();
  }, []);

  return {
    places,
    isLoading,
    error,
    fetchPlaces,
    fetchPlacesByProvider,
    deletePlace,
    updatePlace,
    addPlace,
  };
};
