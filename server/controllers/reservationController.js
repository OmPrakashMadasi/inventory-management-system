const Reservation = require('../models/Reservation');
const Table = require('../models/Table');

// @desc    Get available tables for a specific date and time slot
// @route   GET /api/reservations/available?date=2024-01-15&timeSlot=7:00 PM&guests=4
// @access  Private
exports.getAvailableTables = async (req, res) => {
  try {
    const { date, timeSlot, guests } = req.query;

    if (!date || !timeSlot || !guests) {
      return res.status(400).json({
        success: false,
        message: 'Please provide date, timeSlot, and number of guests'
      });
    }

    // Parse date to start of day
    const reservationDate = new Date(date);
    reservationDate.setHours(0, 0, 0, 0);

    // Find all tables with sufficient capacity
    const tablesWithCapacity = await Table.find({
      capacity: { $gte: parseInt(guests) },
      isActive: true
    });

    // Find all confirmed reservations for this date and time slot
    const existingReservations = await Reservation.find({
      date: reservationDate,
      timeSlot: timeSlot,
      status: 'confirmed'
    }).select('table');

    // Get IDs of reserved tables
    const reservedTableIds = existingReservations.map(res => res.table.toString());

    // Filter out reserved tables
    const availableTables = tablesWithCapacity.filter(
      table => !reservedTableIds.includes(table._id.toString())
    );

    res.status(200).json({
      success: true,
      count: availableTables.length,
      data: availableTables
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching available tables',
      error: error.message
    });
  }
};

// @desc    Create a new reservation
// @route   POST /api/reservations
// @access  Private (Customer)
exports.createReservation = async (req, res) => {
  try {
    const { tableId, date, timeSlot, numberOfGuests } = req.body;

    // Validate input
    if (!tableId || !date || !timeSlot || !numberOfGuests) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: tableId, date, timeSlot, numberOfGuests'
      });
    }

    // Parse date to start of day
    const reservationDate = new Date(date);
    reservationDate.setHours(0, 0, 0, 0);

    // Check if date is in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (reservationDate < today) {
      return res.status(400).json({
        success: false,
        message: 'Cannot make reservations for past dates'
      });
    }

    // Check if table exists and is active
    const table = await Table.findById(tableId);
    if (!table) {
      return res.status(404).json({
        success: false,
        message: 'Table not found'
      });
    }

    if (!table.isActive) {
      return res.status(400).json({
        success: false,
        message: 'This table is not available for reservations'
      });
    }

    // Check if table has sufficient capacity
    if (table.capacity < numberOfGuests) {
      return res.status(400).json({
        success: false,
        message: `This table can only accommodate ${table.capacity} guests. Please select a larger table.`
      });
    }

    // Check for conflicting reservations (same table, date, time slot)
    const conflictingReservation = await Reservation.findOne({
      table: tableId,
      date: reservationDate,
      timeSlot: timeSlot,
      status: 'confirmed'
    });

    if (conflictingReservation) {
      return res.status(409).json({
        success: false,
        message: 'This table is already reserved for the selected date and time slot'
      });
    }

    // Create reservation
    const reservation = await Reservation.create({
      user: req.user._id,
      table: tableId,
      date: reservationDate,
      timeSlot,
      numberOfGuests,
      status: 'confirmed'
    });

    // Populate table and user details
    await reservation.populate('table', 'tableNumber capacity');
    await reservation.populate('user', 'name email');

    res.status(201).json({
      success: true,
      message: 'Reservation created successfully',
      data: reservation
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating reservation',
      error: error.message
    });
  }
};

// @desc    Get customer's own reservations
// @route   GET /api/reservations/my-reservations
// @access  Private (Customer)
exports.getMyReservations = async (req, res) => {
  try {
    const reservations = await Reservation.find({ user: req.user._id })
      .populate('table', 'tableNumber capacity')
      .sort('-date -createdAt');

    res.status(200).json({
      success: true,
      count: reservations.length,
      data: reservations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching reservations',
      error: error.message
    });
  }
};

// @desc    Cancel a reservation (customer can only cancel their own)
// @route   DELETE /api/reservations/:id
// @access  Private (Customer)
exports.cancelReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);

    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: 'Reservation not found'
      });
    }

    // Check if reservation belongs to the user
    if (reservation.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this reservation'
      });
    }

    // Check if already cancelled
    if (reservation.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'This reservation is already cancelled'
      });
    }

    // Update status to cancelled
    reservation.status = 'cancelled';
    await reservation.save();

    res.status(200).json({
      success: true,
      message: 'Reservation cancelled successfully',
      data: reservation
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error cancelling reservation',
      error: error.message
    });
  }
};
