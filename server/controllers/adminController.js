const Reservation = require('../models/Reservation');
const Table = require('../models/Table');

// @desc    Get all reservations (Admin only)
// @route   GET /api/admin/reservations
// @access  Private (Admin)
exports.getAllReservations = async (req, res) => {
  try {
    const reservations = await Reservation.find()
      .populate('user', 'name email')
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

// @desc    Get reservations by specific date (Admin only)
// @route   GET /api/admin/reservations/date/:date
// @access  Private (Admin)
exports.getReservationsByDate = async (req, res) => {
  try {
    const date = new Date(req.params.date);
    date.setHours(0, 0, 0, 0);

    const nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);

    const reservations = await Reservation.find({
      date: { $gte: date, $lt: nextDay }
    })
      .populate('user', 'name email')
      .populate('table', 'tableNumber capacity')
      .sort('timeSlot');

    res.status(200).json({
      success: true,
      count: reservations.length,
      date: req.params.date,
      data: reservations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching reservations by date',
      error: error.message
    });
  }
};

// @desc    Update any reservation (Admin only)
// @route   PUT /api/admin/reservations/:id
// @access  Private (Admin)
exports.updateReservation = async (req, res) => {
  try {
    const { date, timeSlot, numberOfGuests, status } = req.body;

    const reservation = await Reservation.findById(req.params.id);

    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: 'Reservation not found'
      });
    }

    // Update fields if provided
    if (date) {
      const newDate = new Date(date);
      newDate.setHours(0, 0, 0, 0);
      reservation.date = newDate;
    }
    if (timeSlot) reservation.timeSlot = timeSlot;
    if (numberOfGuests) reservation.numberOfGuests = numberOfGuests;
    if (status) reservation.status = status;

    await reservation.save();
    await reservation.populate('user', 'name email');
    await reservation.populate('table', 'tableNumber capacity');

    res.status(200).json({
      success: true,
      message: 'Reservation updated successfully',
      data: reservation
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating reservation',
      error: error.message
    });
  }
};

// @desc    Cancel any reservation (Admin only)
// @route   DELETE /api/admin/reservations/:id
// @access  Private (Admin)
exports.cancelAnyReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);

    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: 'Reservation not found'
      });
    }

    reservation.status = 'cancelled';
    await reservation.save();

    res.status(200).json({
      success: true,
      message: 'Reservation cancelled successfully by admin',
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

// @desc    Get all tables (Admin only)
// @route   GET /api/admin/tables
// @access  Private (Admin)
exports.getAllTables = async (req, res) => {
  try {
    const tables = await Table.find().sort('tableNumber');

    res.status(200).json({
      success: true,
      count: tables.length,
      data: tables
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching tables',
      error: error.message
    });
  }
};

// @desc    Create a new table (Admin only)
// @route   POST /api/admin/tables
// @access  Private (Admin)
exports.createTable = async (req, res) => {
  try {
    const { tableNumber, capacity } = req.body;

    if (!tableNumber || !capacity) {
      return res.status(400).json({
        success: false,
        message: 'Please provide tableNumber and capacity'
      });
    }

    // Check if table number already exists
    const existingTable = await Table.findOne({ tableNumber });
    if (existingTable) {
      return res.status(400).json({
        success: false,
        message: 'Table number already exists'
      });
    }

    const table = await Table.create({ tableNumber, capacity });

    res.status(201).json({
      success: true,
      message: 'Table created successfully',
      data: table
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating table',
      error: error.message
    });
  }
};

// @desc    Update a table (Admin only)
// @route   PUT /api/admin/tables/:id
// @access  Private (Admin)
exports.updateTable = async (req, res) => {
  try {
    const { capacity, isActive } = req.body;

    const table = await Table.findById(req.params.id);

    if (!table) {
      return res.status(404).json({
        success: false,
        message: 'Table not found'
      });
    }

    if (capacity) table.capacity = capacity;
    if (typeof isActive !== 'undefined') table.isActive = isActive;

    await table.save();

    res.status(200).json({
      success: true,
      message: 'Table updated successfully',
      data: table
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating table',
      error: error.message
    });
  }
};
