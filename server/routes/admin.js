const express = require('express');
const {
  getAllReservations,
  getReservationsByDate,
  updateReservation,
  cancelAnyReservation,
  getAllTables,
  createTable,
  updateTable
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication and admin role
router.use(protect);
router.use(authorize('admin'));

// Reservation management
router.get('/reservations', getAllReservations);
router.get('/reservations/date/:date', getReservationsByDate);
router.put('/reservations/:id', updateReservation);
router.delete('/reservations/:id', cancelAnyReservation);

// Table management
router.get('/tables', getAllTables);
router.post('/tables', createTable);
router.put('/tables/:id', updateTable);

module.exports = router;
