
export const calculateDistance = (
  userLatitude,
  userLongitude,
  locationLatitude,
  locationLongitude
) => {
  // If any parameter is missing, return null
  if (
    userLatitude === null ||
    userLongitude === null ||
    locationLatitude === null ||
    locationLongitude === null
  ) {
    return null;
  }

  // Convert degrees to radians
  const toRadians = (degree) => (degree * Math.PI) / 180;

  // Earth's radius in kilometers
  const earthRadiusKm = 6371;

  // Calculate the difference between the latitudes and longitudes
  const deltaLatitude = toRadians(locationLatitude - userLatitude);
  const deltaLongitude = toRadians(locationLongitude - userLongitude);

  // Convert latitudes to radians
  const userLatInRadians = toRadians(userLatitude);
  const locationLatInRadians = toRadians(locationLatitude);

  // Haversine formula
  const a =
    Math.sin(deltaLatitude / 2) * Math.sin(deltaLatitude / 2) +
    Math.cos(userLatInRadians) *
      Math.cos(locationLatInRadians) *
      Math.sin(deltaLongitude / 2) *
      Math.sin(deltaLongitude / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  // Distance in kilometers
  const distance = earthRadiusKm * c;

  // Return the distance with 1 decimal place
  return parseFloat(distance.toFixed(1));
};
