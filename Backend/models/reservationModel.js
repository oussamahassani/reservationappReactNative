const db = require("../config/db");

class Reservation {
  // Get all reservations with optional filters
  static async getAll(filters = {}) {
    let query = "SELECT rv.*, u.firstName , u.lastName , u.phone FROM reservations  rv Left JOIN users u ON rv.userId  = u.id WHERE 1=1";
    const params = [];

    // Filter by user
    if (filters.userId) {
      query += " AND userId = ?";
      params.push(filters.userId);
    }

    // Filter by place
    if (filters.placeId) {
      query += " AND placeId = ?";
      params.push(filters.placeId);
    }

    // Filter by event
    if (filters.eventId) {
      query += " AND eventId = ?";
      params.push(filters.eventId);
    }

    // Filter by status
    if (filters.status) {
      query += " AND status = ?";
      params.push(filters.status);
    }

    // Filter by date range
    if (filters.fromDate) {
      query += " AND (visitDate >= ? OR createdAt >= ?)";
      params.push(filters.fromDate, filters.fromDate);
    }

    if (filters.toDate) {
      query += " AND (visitDate <= ? OR createdAt <= ?)";
      params.push(filters.toDate, filters.toDate);
    }

    // Order by creation date (descending)
    query += " ORDER BY createdAt DESC";

    const [rows] = await db.query(query, params);
    return rows;
  }

  // Get a reservation by its ID
  static async getById(id) {
    const [rows] = await db.query("SELECT * FROM reservations WHERE id = ?", [
      id,
    ]);
    return rows[0];
  }

  // Create a new reservation with automatic capacity check
  static async create(reservationData) {
    // Start a transaction to ensure data consistency
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      // Check capacity based on entity type
      if (reservationData.eventId) {
        // Check event capacity
        const [eventRows] = await connection.query(
          `SELECT capacity, 
            (SELECT COALESCE(SUM(numberOfTickets), 0) 
             FROM reservations 
             WHERE eventId = ? AND status != 'cancelled') as bookedTickets
           FROM events WHERE id = ?`,
          [reservationData.eventId, reservationData.eventId]
        );

        // if (
        //   !eventRows[0] ||
        //   eventRows[0].bookedTickets + reservationData.numberOfTickets >
        //     eventRows[0].capacity
        // ) {
        //   throw new Error("Not enough tickets available");
        // }
      }

      if (reservationData.placeId) {
        // Check place availability for the date
        const [placeRows] = await connection.query(
          `SELECT COUNT(*) as existingReservations 
           FROM reservations 
           WHERE placeId = ? AND DATE(visitDate) = DATE(?) AND status != 'cancelled'`,
          [reservationData.placeId, reservationData.visitDate || new Date()]
        );

        // if (placeRows[0].existingReservations > 0) {
        //   throw new Error("Place not available for this date");
        // }
      }

      // If all checks pass, create the reservation
      const [result] = await connection.query(
        `INSERT INTO reservations 
        (userId, eventId, placeId, numberOfTickets, numberOfPersons, totalPrice, status, paymentMethod, paymentId, visitDate)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          reservationData.userId,
          reservationData.eventId || null,
          reservationData.placeId || null,
          reservationData.numberOfTickets || null,
          reservationData.numberOfPersons || null,
          reservationData.totalPrice || null,
          reservationData.status || "pending",
          reservationData.paymentMethod || null,
          reservationData.paymentId || null,
          reservationData.visitDate || new Date(),
        ]
      );

      await connection.commit();
      return result.insertId;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  // Update an existing reservation
  static async update(id, updates) {
    // Add the updatedAt timestamp
    updates.updatedAt = new Date();

    const fields = Object.keys(updates).join(" = ?, ") + " = ?";
    const values = Object.values(updates);

    await db.query(`UPDATE reservations SET ${fields} WHERE id = ?`, [
      ...values,
      id,
    ]);
  }

  // Delete a reservation
  static async delete(id) {
    await db.query("DELETE FROM reservations WHERE id = ?", [id]);
  }

  // Check availability (for events or places based on capacity and existing reservations)
  static async checkAvailability(
    entityType,
    entityId,
    date = null,
    numberOfTickets = 1
  ) {
    let query;
    let params;

    if (entityType === "event") {
      // For events, check if there are enough tickets available
      query = `
        SELECT e.capacity, COALESCE(SUM(r.numberOfTickets), 0) as bookedTickets
        FROM events e
        LEFT JOIN reservations r ON e.id = r.eventId AND r.status != 'cancelled'
        WHERE e.id = ?
        GROUP BY e.id
      `;
      params = [entityId];
    } else if (entityType === "place" && date) {
      // For places, check if the place is available on the specified date
      query = `
        SELECT COUNT(*) as existingReservations
        FROM reservations
        WHERE placeId = ? AND DATE(visitDate) = DATE(?) AND status != 'cancelled'
      `;
      params = [entityId, date];
    } else {
      throw new Error("Invalid entity type or missing required parameters");
    }

    const [rows] = await db.query(query, params);

    if (entityType === "event") {
      if (!rows.length) return false; // Event not found
      const { capacity, bookedTickets } = rows[0];
      return capacity - bookedTickets >= numberOfTickets;
    } else {
      // For places, implement your availability logic based on your business rules
      // This is a simple example that just checks if there are any reservations on that date
      return rows[0].existingReservations === 0;
    }
  }
}

module.exports = Reservation;
