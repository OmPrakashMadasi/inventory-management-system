const express = require('express');
const {
  getAvailableTables,
  createReservation,
  getMyReservations,
  cancelReservation
} = require('../controllers/reservationController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(protect);

router.get('/available', getAvailableTables);
router.post('/', createReservation);
router.get('/my-reservations', getMyReservations);
router.delete('/:id', cancelReservation);

module.exports = router;
