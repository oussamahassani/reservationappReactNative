
// Fix the type error by converting price to number
// In the handleSubmit function, update this line:
const propertyData = {
  owner_id: user?.id.toString(),
  title: title,
  address: address,
  price: parseFloat(price), // Convert string to number
  type: type,
  status: status,
  property_type: propertyType,
  description: description,
  workstations: parseInt(workstations, 10),
  meeting_rooms: parseInt(meetingRooms, 10),
  private_offices: parseInt(privateOffices, 10),
  phone_booths: parseInt(phoneBooths, 10),
  relaxation_areas: parseInt(relaxationAreas, 10),
  kitchenette: kitchenette,
  printer: printer,
  wifi: wifi,
  garden: garden,
  air_conditioning: airConditioning,
  city: city,
  region: region,
};
