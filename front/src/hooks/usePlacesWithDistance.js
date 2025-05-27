
import { useState, useEffect } from 'react';
import { calculateDistance } from '../../common/calculateDistance';
import { getApiUrl, ENDPOINTS } from '../config/apiConfig';

export const usePlacesWithDistance = (userLocation, maxDistance = null) => {
  const [places, setPlaces] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPlaces = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(getApiUrl(ENDPOINTS.PLACES));
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        let placesData = result.data || [];

        // Calculate distance for each place if user location is available
        if (userLocation?.latitude && userLocation?.longitude) {
          placesData = placesData.map(place => {
            try {
              const locationData = place.location;
              let latitude, longitude;
              
              if (typeof locationData === 'string') {
                const parsedLocation = JSON.parse(locationData);
                latitude = parsedLocation.latitude;
                longitude = parsedLocation.longitude;
              } else {
                latitude = locationData?.latitude;
                longitude = locationData?.longitude;
              }
              
              if (latitude && longitude) {
                const distance = calculateDistance(
                  userLocation.latitude,
                  userLocation.longitude,
                  latitude,
                  longitude
                );
                return { ...place, distance };
              }
              return place;
            } catch (e) {
              console.error('Error calculating distance:', e);
              return place;
            }
          });

          // Filter by distance if maxDistance is provided
          if (maxDistance) {
            placesData = placesData.filter(place => 
              !place.distance || place.distance <= maxDistance
            );
          }

          // Sort by distance
          placesData.sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity));
        }

        setPlaces(placesData);
        setError(null);
      } catch (e) {
        console.error('Error fetching places:', e);
        setError(e.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlaces();
  }, [userLocation, maxDistance]);

  return { places, isLoading, error };
};
