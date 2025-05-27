const Place = require("../models/placeModel");
const { validationResult } = require("express-validator");

exports.getAllPlaces = async (req, res) => {
  try {
    const places = await Place.getAll();
    
    const formattedPlaces = places.map(place => ({
      id: place.id,
      name: place.name,
      type: place.type,
      description: place.description,
      location: typeof place.location === 'string' ? JSON.parse(place.location || '{}') : place.location,
      images: typeof place.images === 'string' ? JSON.parse(place.images || '[]') : place.images,
      openingHours: typeof place.openingHours === 'string' ? JSON.parse(place.openingHours || '{}') : place.openingHours,
      entranceFee: typeof place.entranceFee === 'string' ? JSON.parse(place.entranceFee || '{}') : place.entranceFee,
      provider: typeof place.provider === 'string' ? JSON.parse(place.provider || '{}') : place.provider,
      average_rating: place.average_rating,
      createdAt: place.createdAt,
      updatedAt: place.updatedAt
    }));
    
    res.status(200).json({
      status: 200,
      data: formattedPlaces
    });
  } catch (error) {
    console.error("Error in getAllPlaces:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.searchPlaces = async (req, res) => {
  try {
    const places = await Place.search(req.query);
    
    if (req.query.near) {
      res.json(places);
    } else {
      res.json(places);
    }
  } catch (error) {
    console.error("Error in searchPlaces:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.getPlaceById = async (req, res) => {
  try {
    const place = await Place.getById(req.params.id);
    if (!place) {
      return res.status(404).json({ message: "Place not found" });
    }
    
    const formattedPlace = {
      ...place,
      location: typeof place.location === 'string' ? JSON.parse(place.location || '{}') : place.location,
      images: typeof place.images === 'string' ? JSON.parse(place.images || '[]') : place.images,
      openingHours: typeof place.openingHours === 'string' ? JSON.parse(place.openingHours || '{}') : place.openingHours,
      entranceFee: typeof place.entranceFee === 'string' ? JSON.parse(place.entranceFee || '{}') : place.entranceFee,
      provider: typeof place.provider === 'string' ? JSON.parse(place.provider || '{}') : place.provider
    };
    
    res.status(200).json({
      status: 200,
      data: formattedPlace
    });
  } catch (error) {
    console.error("Error in getPlaceById:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.getPlacesByRegion = async (req, res) => {
  try {
    const region = req.params.region;
    const places = await Place.getByRegion(region);
    res.json(places);
  } catch (error) {
    console.error("Error in getPlacesByRegion:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.getPopularPlaces = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const places = await Place.getPopular(limit);
    res.json(places);
  } catch (error) {
    console.error("Error in getPopularPlaces:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.createPlace = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const placeData = { ...req.body };
    
    const placeId = await Place.create(placeData);
    
    const place = await Place.getById(placeId);
    
    const formattedPlace = {
      ...place,
      location: typeof place.location === 'string' ? JSON.parse(place.location || '{}') : place.location,
      images: typeof place.images === 'string' ? JSON.parse(place.images || '[]') : place.images,
      openingHours: typeof place.openingHours === 'string' ? JSON.parse(place.openingHours || '{}') : place.openingHours,
      entranceFee: typeof place.entranceFee === 'string' ? JSON.parse(place.entranceFee || '{}') : place.entranceFee
    };
    
    res.status(201).json({
      status: 201,
      message: "Place created successfully",
      data: formattedPlace
    });
  } catch (error) {
    console.error("Error in createPlace:", error);
    res.status(400).json({ message: error.message });
  }
};

exports.updatePlace = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const place = await Place.getById(req.params.id);
    if (!place) {
      return res.status(404).json({ message: "Place not found" });
    }

    await Place.update(req.params.id, req.body);
    
    const updatedPlace = await Place.getById(req.params.id);
    
    const formattedPlace = {
      ...updatedPlace,
      location: typeof updatedPlace.location === 'string' ? JSON.parse(updatedPlace.location || '{}') : updatedPlace.location,
      images: typeof updatedPlace.images === 'string' ? JSON.parse(updatedPlace.images || '[]') : updatedPlace.images,
      openingHours: typeof updatedPlace.openingHours === 'string' ? JSON.parse(updatedPlace.openingHours || '{}') : updatedPlace.openingHours,
      entranceFee: typeof updatedPlace.entranceFee === 'string' ? JSON.parse(updatedPlace.entranceFee || '{}') : updatedPlace.entranceFee
    };
    
    res.status(200).json({
      status: 200,
      message: "Place updated successfully",
      data: formattedPlace
    });
  } catch (error) {
    console.error("Error in updatePlace:", error);
    res.status(400).json({ message: error.message });
  }
};

exports.deletePlace = async (req, res) => {
  try {
    const place = await Place.getById(req.params.id);
    if (!place) {
      return res.status(404).json({ message: "Lieu non trouvé" });
    }

    const success = await Place.toggleActive(req.params.id);
    if (success) {
      res.status(200).json({ 
        status: 200,
        message: `Le lieu a été ${place.isActive ? 'désactivé' : 'activé'} avec succès` 
      });
    } else {
      res.status(400).json({ message: "Erreur lors de la modification du statut du lieu" });
    }
  } catch (error) {
    console.error("Erreur dans togglePlaceActive:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.getProviderPlaces = async (req, res) => {
  try {
    const providerId = req.params.providerId;
    const places = await Place.getAllForProvider(providerId);
    
    const formattedPlaces = places.map(place => ({
      ...place,
      location: typeof place.location === 'string' ? JSON.parse(place.location || '{}') : place.location,
      images: typeof place.images === 'string' ? JSON.parse(place.images || '[]') : place.images,
      openingHours: typeof place.openingHours === 'string' ? JSON.parse(place.openingHours || '{}') : place.openingHours,
      entranceFee: typeof place.entranceFee === 'string' ? JSON.parse(place.entranceFee || '{}') : place.entranceFee
    }));
    
    res.status(200).json({
      status: 200,
      data: formattedPlaces
    });
  } catch (error) {
    console.error("Erreur dans getProviderPlaces:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.getPlacesByProvider = async (req, res) => {
  try {
    const providerId = req.params.providerId;
    
    const places = await Place.getByProviderId(providerId);
    res.json(places);
  } catch (error) {
    console.error("Error in getPlacesByProvider:", error);
    res.status(500).json({ message: error.message });
  }
};
