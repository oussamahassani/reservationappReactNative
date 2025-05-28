const Reservation = require("../models/reservationModel");
const Place = require("../models/placeModel");
const Event = require("../models/eventModel");
const { validationResult } = require("express-validator");
const User = require("../models/userModel");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false, // true for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
  tls: {
    // Do not fail on invalid certificates
    rejectUnauthorized: false,
  },
});

// Get all reservations
exports.getAllReservations = async (req, res) => {
  try {
    console.log(req.query)
    const reservations = await Reservation.getAll(req.query);
    res.status(200).json({
      success: true,
      data: reservations,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get a reservation by ID
exports.getReservationById = async (req, res) => {
  try {
    const reservation = await Reservation.getById(req.params.id);

    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: "Reservation not found",
      });
    }

    res.status(200).json({
      success: true,
      data: reservation,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Create a new reservation
exports.createReservation = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array(),
    });
  }

  try {
    // Simplified reservation data with core fields
    const reservationData = {
      userId: req.body.userId,
      eventId: req.body.eventId || null,
      placeId: req.body.placeId || null,
      numberOfTickets: req.body.numberOfTickets || null,
      status: req.body.status || "pending",
      totalPrice: 0, // Will be calculated below
    };

    // Handle event-place relationship
    if (reservationData.eventId) {
      // If eventId is provided, check if event exists and get its placeId
      const event = await Event.getById(reservationData.eventId);
      if (!event) {
        return res.status(404).json({
          success: false,
          message: "Event not found",
        });
      }

      // If event has a place_id, use it
      if (event.place_id) {
        reservationData.placeId = event.place_id;
      }

      // Calculate price based on event ticket price
      if (reservationData.numberOfTickets && event.ticketPrice) {
        reservationData.totalPrice =
          event.ticketPrice * reservationData.numberOfTickets;
      }
    } else if (reservationData.placeId) {
      // If only placeId is provided, ensure eventId is null
      reservationData.eventId = null;

      // Get place information
      const place = await Place.getById(reservationData.placeId);
      if (!place) {
        return res.status(404).json({
          success: false,
          message: "Place not found",
        });
      }

      // Set number of persons from tickets for places
      reservationData.numberOfPersons = reservationData.numberOfTickets;

      // Calculate price based on basic place entrance fee
      let entranceFee = 10; // Default value
      if (place.entranceFee) {
        try {
          const fees = JSON.parse(place.entranceFee);
          entranceFee = fees.adult || entranceFee;
        } catch (e) {
          // Use default value if parsing fails
        }
      }

      if (reservationData.numberOfTickets) {
        reservationData.totalPrice =
          entranceFee * reservationData.numberOfTickets;
      }
    } else {
      return res.status(400).json({
        success: false,
        message: "Either eventId or placeId must be provided",
      });
    }

    // Round total price to 2 decimal places
    reservationData.totalPrice =
      Math.round(reservationData.totalPrice * 100) / 100;

    const reservationId = await Reservation.create(reservationData);
    const reservation = await Reservation.getById(reservationId);
    const user = await User.findById(reservationData.userId);
    const userEmail = user?.email;

    res.status(201).json({
      success: true,
      message: "Reservation created successfully",
      data: reservation,
    });
  } catch (error) {
    console.log(error);
    if (
      error.message.includes("Not enough tickets") ||
      error.message.includes("Place not available")
    ) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
    res.status(500).json({
      success: false,
      message: "Error creating reservation",
      error: error.message,
    });
  }
};

// Update a reservation
exports.updateReservation = async (req, res) => {
  try {
    const reservation = await Reservation.getById(req.params.id);
    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: "Reservation not found",
      });
    }
    const user = await User.findById(reservation.userId);
        const userEmail = user?.email;
if(req.body != null && req.body.status !="rappler"){
    await Reservation.update(req.params.id, req.body);
}
if(req.body.status =="rappler")
   {
      const mailOptions =    { from: `"JendoubaLife Reservations" <${process.env.SENDER_EMAIL}>`,
            to: userEmail,
            subject: "🎟️ Rapelle  de votre réservation",
            html: `
          <div style="font-family: Arial, sans-serif; padding: 20px;">
       
            <ul>
              
              <li><strong>Prix total :</strong> ${reservation.totalPrice} TND</li>
               <li><strong>Nombre de billets :</strong> ${
                reservation.numberOfTickets
              }</li>
                 <li><strong>date de Reservation :</strong> ${
                reservation.visitDate 
              }</li>
            </ul>
            <p>📧 Si vous avez des questions, n'hésitez pas à répondre à ce mail.</p>
            <hr />
            <p style="font-size: 12px; color: gray;">JendoubaLife – Réservation automatique</p>
          </div>
        `,
          };
            try {
        await transporter.sendMail(mailOptions);
        console.log(`📧 Email de confirmation envoyé à ${userEmail}`);
      } catch (emailError) {
        console.error(
          "Erreur lors de l'envoi de l'email de réservation :",
          emailError.message
        );
        // Optionally continue without blocking the main response
      }
}
    const updatedReservation = await Reservation.getById(req.params.id);
    if (userEmail && reservation.reservation && req.body.status  && req.body.status=="confirmed") {
      const mailOptions = reservation.eventId
        ? {
            from: `"JendoubaLife Reservations" <${process.env.SENDER_EMAIL}>`,
            to: userEmail,
            subject: "🎟️ Confirmation de votre réservation",
            html: `
          <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2>Merci pour votre réservation !</h2>
            <p>Votre réservation a été créée avec succès.</p>
            <ul>
              <li><strong>Nombre de billets :</strong> ${
                reservation.numberOfTickets
              }</li>
              <li><strong>Prix total :</strong> ${
                reservation.totalPrice
              } TND</li>
              ${
                reservation.eventId
                  ? `<li><strong>Événement :</strong> ${reservation.eventId}</li>`
                  : ""
              }
             
            </ul>
            <p>📧 Si vous avez des questions, n'hésitez pas à répondre à ce mail.</p>
            <hr />
            <p style="font-size: 12px; color: gray;">JendoubaLife – Réservation automatique</p>
          </div>
        `,
          }
        : {
            from: `"JendoubaLife Reservations" <${process.env.SENDER_EMAIL}>`,
            to: userEmail,
            subject: "🎟️ Confirmation de votre réservation",
            html: `
          <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2>Merci pour votre réservation !</h2>
            <p>Votre réservation a été créée avec succès.</p>
            <ul>
              
              <li><strong>Prix total :</strong> ${reservation.totalPrice} TND</li>
              
             
            </ul>
            <p>📧 Si vous avez des questions, n'hésitez pas à répondre à ce mail.</p>
            <hr />
            <p style="font-size: 12px; color: gray;">JendoubaLife – Réservation automatique</p>
          </div>
        `,
          };

      try {
        await transporter.sendMail(mailOptions);
        console.log(`📧 Email de confirmation envoyé à ${userEmail}`);
      } catch (emailError) {
        console.error(
          "Erreur lors de l'envoi de l'email de réservation :",
          emailError.message
        );
        // Optionally continue without blocking the main response
      }
    }
    res.status(200).json({
      success: true,
      message: "Reservation updated successfully",
      data: updatedReservation,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete a reservation
exports.deleteReservation = async (req, res) => {
  try {
    const reservation = await Reservation.getById(req.params.id);
    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: "Reservation not found",
      });
    }

    await Reservation.delete(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Check availability for events or places
exports.checkAvailability = async (req, res) => {
  try {
    const { entityType, entityId, date, numberOfTickets } = req.query;

    if (!entityType || !entityId) {
      return res.status(400).json({
        success: false,
        message: "Entity type and ID are required",
      });
    }

    // Convert numberOfTickets to number with default of 1
    const tickets = numberOfTickets ? parseInt(numberOfTickets, 10) : 1;

    const available = await Reservation.checkAvailability(
      entityType,
      entityId,
      date,
      tickets
    );

    res.status(200).json({
      success: true,
      data: {
        available,
        message: available
          ? `${entityType} is available`
          : `${entityType} is not available for the requested date/tickets`,
      },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = exports;
