const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  table: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Table',
    required: true
  },
  date: {
    type: Date,
    required: [true, 'Please provide a reservation date']
  },
  timeSlot: {
    type: String,
    required: [true, 'Please provide a time slot'],
    enum: ['11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '6:00 PM', '7:00 PM', '8:00 PM', '9:00 PM', '10:00 PM']
  },
  numberOfGuests: {
    type: Number,
    required: [true, 'Please provide number of guests'],
    min: 1
  },
  status: {
    type: String,
    enum: ['confirmed', 'cancelled'],
    default: 'confirmed'
  }
}, {
  timestamps: true
});

// Index for faster queries on availability checks
reservationSchema.index({ table: 1, date: 1, timeSlot: 1, status: 1 });

module.exports = mongoose.model('Reservation', reservationSchema);
