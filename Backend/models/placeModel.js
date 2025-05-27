const db = require("../config/db");

class Place {
  // Obtenir tous les lieux actifs avec les informations du prestataire
  static async getAll() {
    const [rows] = await db.query(`
      SELECT p.*, 
        JSON_OBJECT(
          'id', u.id,
          'firstName', u.firstName,
          'lastName', u.lastName,
          'email', u.email,
          'phone', u.phone
        ) as provider
      FROM places p
      LEFT JOIN users u ON p.provider_id = u.id
      WHERE p.isActive = 1 
      ORDER BY p.createdAt DESC
    `);
    return rows;
  }

  // Obtenir tous les lieux d'un prestataire (y compris inactifs)
  static async getAllForProvider(providerId) {
    const [rows] = await db.query(
      "SELECT * FROM places WHERE provider_id = ? ORDER BY createdAt DESC",
      [providerId]
    );
    return rows;
  }

  // Basculer le statut actif d'un lieu
  static async toggleActive(id) {
    const [place] = await db.query("SELECT isActive FROM places WHERE id = ?", [id]);
    if (!place[0]) return false;

    const newStatus = place[0].isActive ? 0 : 1;
    const [result] = await db.query(
      "UPDATE places SET isActive = ? WHERE id = ?",
      [newStatus, id]
    );
    return result.affectedRows > 0;
  }

  // Obtenir un lieu par son ID avec les informations du prestataire
  static async getById(id) {
    const [rows] = await db.query(`
      SELECT p.*, 
        JSON_OBJECT(
          'id', u.id,
          'firstName', u.firstName,
          'lastName', u.lastName,
          'email', u.email,
          'phone', u.phone
        ) as provider
      FROM places p
      LEFT JOIN users u ON p.provider_id = u.id
      WHERE p.id = ?
    `, [id]);
    return rows[0];
  }

  // Rechercher des lieux avec filtres
  static async search(filters) {
    let query = "SELECT * FROM places WHERE 1=1";
    const params = [];

    if (filters.type) {
      query += " AND type = ?";
      params.push(filters.type);
    }

    if (filters.name) {
      query += " AND name LIKE ?";
      params.push(`%${filters.name}%`);
    }

    if (filters.region) {
      query += " AND JSON_EXTRACT(location, '$.region') = ?";
      params.push(filters.region);
    }

    if (filters.near) {
      // Ajouter la formule haversine pour calculer la distance
      const [lat, lng] = filters.near.split(',').map(Number);
      const radius = filters.radius || 10; // Rayon par défaut de 10km
      
      query = `
        SELECT *, 
        (6371 * acos(cos(radians(?)) * cos(radians(JSON_EXTRACT(location, '$.latitude'))) * 
        cos(radians(JSON_EXTRACT(location, '$.longitude')) - radians(?)) + 
        sin(radians(?)) * sin(radians(JSON_EXTRACT(location, '$.latitude'))))) AS distance 
        FROM places 
        HAVING distance < ? 
        ORDER BY distance
      `;
      
      params.push(lat, lng, lat, radius);
    } else {
      // Tri par défaut
      query += " ORDER BY createdAt DESC";
    }

    // Ajouter une limite si spécifiée
    if (filters.limit) {
      query += " LIMIT ?";
      params.push(parseInt(filters.limit));
    }

    const [rows] = await db.query(query, params);
    return rows;
  }

  // Obtenir les lieux par région
  static async getByRegion(region) {
    const [rows] = await db.query(
      "SELECT * FROM places WHERE JSON_EXTRACT(location, '$.region') = ? ORDER BY createdAt DESC", 
      [region]
    );
    return rows;
  }

  // Obtenir les lieux populaires (par note ou nombre de visites)
  static async getPopular(limit = 10) {
    const [rows] = await db.query(
      "SELECT * FROM places ORDER BY average_rating DESC LIMIT ?", 
      [limit]
    );
    return rows;
  }

  // Obtenir les lieux par prestataire
  static async getByProviderId(providerId) {
    const [rows] = await db.query(
      "SELECT * FROM places WHERE provider_id = ? ORDER BY createdAt DESC", 
      [providerId]
    );
    return rows;
  }

  // Créer un nouveau lieu
  static async create(placeData) {
    // Convertir les objets et tableaux en chaînes JSON pour le stockage
    const location = JSON.stringify(placeData.location || {});
    const images = JSON.stringify(placeData.images || []);
    const openingHours = JSON.stringify(placeData.openingHours || {});
    const entranceFee = JSON.stringify(placeData.entranceFee || {});

    const [result] = await db.query(
      `INSERT INTO places 
      (name, type, description, location, images, openingHours, entranceFee, provider_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        placeData.name,
        placeData.type,
        placeData.description,
        location,
        images,
        openingHours,
        entranceFee,
        placeData.provider_id || null
      ]
    );
    
    return result.insertId;
  }

  // Mettre à jour un lieu existant
  static async update(id, updates) {
    // Préparer les mises à jour, conversion des objets et tableaux en JSON si nécessaire
    const updateData = { ...updates };
    
    if (updates.location) {
      updateData.location = JSON.stringify(updates.location);
    }
    
    if (updates.images) {
      updateData.images = JSON.stringify(updates.images);
    }
    
    if (updates.openingHours) {
      updateData.openingHours = JSON.stringify(updates.openingHours);
    }
    
    if (updates.entranceFee) {
      updateData.entranceFee = JSON.stringify(updates.entranceFee);
    }

    const fields = Object.keys(updateData).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(updateData), id];

    const [result] = await db.query(`UPDATE places SET ${fields} WHERE id = ?`, values);
    return result.affectedRows > 0;
  }

  // Supprimer un lieu
  static async delete(id) {
    const [result] = await db.query("DELETE FROM places WHERE id = ?", [id]);
    return result.affectedRows > 0;
  }

  // Obtenir tous les lieux appartenant à un prestataire
  static async getAllByProvider(providerId) {
    const [rows] = await db.query(
      "SELECT * FROM places WHERE provider_id = ?", 
      [providerId]
    );
    return rows;
  }
}

module.exports = Place;
