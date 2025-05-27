const db = require("../config/db");

const Event = {
  async getAll(filters = {}) {
    try {
      const [columns] = await db.query(
        'SHOW COLUMNS FROM events LIKE "place_id"'
      );
      if (columns.length === 0) {
        console.warn("Warning: place_id column is missing from events table!");
      }

      let query = `
        SELECT e.*, 
          JSON_OBJECT(
            'id', p.id,
            'name', p.name,
            'type', p.type,
            'location', p.location,
            'images', p.images,
            'openingHours', p.openingHours,
            'entranceFee', p.entranceFee,
            'average_rating', p.average_rating
          ) as place
        FROM events e
        LEFT JOIN places p ON e.place_id = p.id
        WHERE 1=1
      `;
      const params = [];

      if (filters.location) {
        query += " AND e.location LIKE ?";
        params.push(`%${filters.location}%`);
      }
      if (filters.organizer) {
        query += " AND e.organizer = ?";
        params.push(filters.organizer);
      }
      if (filters.provider_id) {
        query += " AND e.provider_id = ?";
        params.push(filters.provider_id);
      }
      if (filters.place_id) {
        query += " AND e.place_id = ?";
        params.push(filters.place_id);
      }
      if (filters.status) {
        query += " AND e.status = ?";
        params.push(filters.status);
      }
      if (filters.startDate) {
        query += " AND e.startDate >= ?";
        params.push(filters.startDate);
      }
      if (filters.endDate) {
        query += " AND e.endDate <= ?";
        params.push(filters.endDate);
      }

      const sortField = filters.sortBy || "startDate";
      const sortOrder =
        filters.sortOrder?.toUpperCase() === "DESC" ? "DESC" : "ASC";
      query += ` ORDER BY e.${sortField} ${sortOrder}`;

      if (filters.limit && parseInt(filters.limit) > 0) {
        query += " LIMIT ?";
        params.push(parseInt(filters.limit));
      }

      const [rows] = await db.query(query, params);
      return rows.map(formatEventData);
    } catch (error) {
      console.error("Database error in getAll events:", error);
      throw new Error(`Failed to retrieve events: ${error.message}`);
    }
  },

  async getById(id) {
    try {
      const [rows] = await db.query(
        `
        SELECT e.*, 
          JSON_OBJECT(
            'id', p.id,
            'name', p.name,
            'type', p.type,
            'location', p.location,
            'images', p.images,
            'openingHours', p.openingHours,
            'entranceFee', p.entranceFee,
            'average_rating', p.average_rating
          ) as place
        FROM events e
        LEFT JOIN places p ON e.place_id = p.id
        WHERE e.id = ?
      `,
        [id]
      );

      if (rows.length === 0) return null;
      return formatEventData(rows[0]);
    } catch (error) {
      console.error("Database error in getById event:", error);
      throw new Error(`Failed to retrieve event: ${error.message}`);
    }
  },

  async create(eventData) {
    if (
      !eventData.title ||
      !eventData.description ||
      !eventData.startDate ||
      !eventData.endDate ||
      !eventData.location
    ) {
      throw new Error("Missing required fields");
    }

    const startDate = new Date(eventData.startDate);
    const endDate = new Date(eventData.endDate);
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw new Error("Invalid date format");
    }
    if (endDate <= startDate)
      throw new Error("End date must be after start date");

    let images = eventData.images || [];
    if (!Array.isArray(images)) {
      try {
        if (typeof images === "string") images = JSON.parse(images);
        else images = [];
      } catch {
        images = [];
      }
    }

    try {
      const [result] = await db.query(
        `INSERT INTO events 
         (title, description, startDate, endDate, location, organizer, 
          ticketPrice, capacity, images, provider_id, place_id, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          eventData.title,
          eventData.description,
          eventData.startDate,
          eventData.endDate,
          eventData.location,
          eventData.organizer || null,
          eventData.ticketPrice || null,
          eventData.capacity || null,
          JSON.stringify(images),
          eventData.provider_id || null,
          eventData.place_id || null,
          eventData.status || "ongoing",
        ]
      );
      return result.insertId;
    } catch (error) {
      console.error("Database error in create event:", error);
      throw new Error(`Failed to create event: ${error.message}`);
    }
  },

  async update(id, updates) {
    if (updates.status && !["ongoing", "cancel"].includes(updates.status)) {
      throw new Error("Invalid status value. Must be 'ongoing' or 'cancel'");
    }

    if (updates.startDate || updates.endDate) {
      const existing = await Event.getById(id);
      if (!existing) throw new Error("Event not found");

      const start = new Date(updates.startDate || existing.startDate);
      const end = new Date(updates.endDate || existing.endDate);
      if (isNaN(start) || isNaN(end)) throw new Error("Invalid date");
      if (end <= start) throw new Error("End date must be after start date");
    }

    if (updates.images) {
      if (Array.isArray(updates.images)) {
        updates.images = JSON.stringify(updates.images);
      } else if (
        typeof updates.images === "string" &&
        !updates.images.startsWith("[")
      ) {
        updates.images = JSON.stringify([updates.images]);
      }
    }

    const fields = Object.keys(updates);
    if (fields.length === 0) throw new Error("No fields to update");

    const setClause = fields.map((f) => `${f} = ?`).join(", ");
    const values = fields.map((f) => updates[f]);

    try {
      await db.query(`UPDATE events SET ${setClause} WHERE id = ?`, [
        ...values,
        id,
      ]);
    } catch (error) {
      console.error("Database error in update event:", error);
      throw new Error(`Failed to update event: ${error.message}`);
    }
  },

  async delete(id) {
    try {
      await db.query("DELETE FROM events WHERE id = ?", [id]);
    } catch (error) {
      console.error("Database error in delete event:", error);
      throw new Error(`Failed to delete event: ${error.message}`);
    }
  },

  async getUpcomingEvents(limit = 10) {
    const now = new Date().toISOString().slice(0, 19).replace("T", " ");
    try {
      const [rows] = await db.query(
        `SELECT * FROM events 
         WHERE startDate > ? 
         ORDER BY startDate ASC LIMIT ?`,
        [now, limit]
      );
      return rows.map(formatEventData);
    } catch (error) {
      console.error("Database error in getUpcomingEvents:", error);
      throw new Error(`Failed to retrieve upcoming events: ${error.message}`);
    }
  },

  async getByPlaceId(placeId) {
    try {
      const [rows] = await db.query(
        `SELECT e.*, 
            JSON_OBJECT(
              'id', p.id,
              'name', p.name,
              'type', p.type,
              'location', p.location,
              'images', p.images,
              'openingHours', p.openingHours,
              'entranceFee', p.entranceFee,
              'average_rating', p.average_rating
            ) as place
         FROM events e
         JOIN places p ON e.place_id = p.id
         WHERE p.id = ?
         ORDER BY e.startDate ASC`,
        [placeId]
      );
      return rows.map(formatEventData);
    } catch (error) {
      console.error("Database error in getByPlaceId:", error);
      throw new Error(
        `Failed to retrieve events by place ID: ${error.message}`
      );
    }
  },

  async getByProviderId(providerId) {
    try {
      const [rows] = await db.query(
        `SELECT * FROM events 
         WHERE provider_id = ?
         ORDER BY startDate ASC`,
        [providerId]
      );
      return rows.map(formatEventData);
    } catch (error) {
      console.error("Database error in getByProviderId:", error);
      throw new Error(
        `Failed to retrieve events by provider ID: ${error.message}`
      );
    }
  },
};

function formatEventData(event) {
  if (!event) return null;

  if (event.images && typeof event.images === "string") {
    try {
      event.images = JSON.parse(event.images);
    } catch {
      event.images = [];
    }
  }

  if (event.place && typeof event.place === "string") {
    try {
      const place = JSON.parse(event.place);

      if (typeof place.location === "string") {
        try {
          place.location = JSON.parse(place.location);
        } catch {
          place.location = {};
        }
      }
      if (typeof place.images === "string") {
        try {
          place.images = JSON.parse(place.images);
        } catch {
          place.images = [];
        }
      }
      if (typeof place.openingHours === "string") {
        try {
          place.openingHours = JSON.parse(place.openingHours);
        } catch {
          place.openingHours = {};
        }
      }
      if (typeof place.entranceFee === "string") {
        try {
          place.entranceFee = JSON.parse(place.entranceFee);
        } catch {
          place.entranceFee = {};
        }
      }

      event.place = place;
    } catch (e) {
      console.error("Error parsing place data:", e);
      event.place = null;
    }
  }

  return event;
}

module.exports = Event;
