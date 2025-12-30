import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_URL, { getAxiosConfig } from '../../utils/axios';

const CustomerDashboard = () => {
  // State for new reservation form
  const [date, setDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('');
  const [guests, setGuests] = useState('');
  const [availableTables, setAvailableTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState('');
  
  // State for my reservations
  const [myReservations, setMyReservations] = useState([]);
  
  // UI states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showAvailability, setShowAvailability] = useState(false);

  const timeSlots = [
    '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM',
    '6:00 PM', '7:00 PM', '8:00 PM', '9:00 PM', '10:00 PM'
  ];

  // Fetch my reservations on load
  useEffect(() => {
    fetchMyReservations();
  }, []);

  const fetchMyReservations = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/reservations/my-reservations`,
        getAxiosConfig()
      );
      setMyReservations(response.data.data);
    } catch (err) {
      console.error('Error fetching reservations:', err);
    }
  };

  const checkAvailability = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setShowAvailability(false);
    setAvailableTables([]);
    setSelectedTable('');

    if (!date || !timeSlot || !guests) {
      setError('Please fill all fields');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.get(
        `${API_URL}/reservations/available?date=${date}&timeSlot=${timeSlot}&guests=${guests}`,
        getAxiosConfig()
      );
      
      setAvailableTables(response.data.data);
      setShowAvailability(true);
      
      if (response.data.data.length === 0) {
        setError('No tables available for selected date, time and number of guests');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error checking availability');
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = async () => {
    if (!selectedTable) {
      setError('Please select a table');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await axios.post(
        `${API_URL}/reservations`,
        {
          tableId: selectedTable,
          date: date,
          timeSlot: timeSlot,
          numberOfGuests: parseInt(guests)
        },
        getAxiosConfig()
      );

      setSuccess('Reservation created successfully!');
      
      // Reset form
      setDate('');
      setTimeSlot('');
      setGuests('');
      setSelectedTable('');
      setAvailableTables([]);
      setShowAvailability(false);
      
      // Refresh reservations list
      fetchMyReservations();
    } catch (err) {
      setError(err.response?.data?.message || 'Error creating reservation');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelReservation = async (reservationId) => {
    if (!window.confirm('Are you sure you want to cancel this reservation?')) {
      return;
    }

    try {
      await axios.delete(
        `${API_URL}/reservations/${reservationId}`,
        getAxiosConfig()
      );
      
      setSuccess('Reservation cancelled successfully');
      fetchMyReservations();
    } catch (err) {
      setError(err.response?.data?.message || 'Error cancelling reservation');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Get minimum date (today)
  const getTodayDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Customer Dashboard</h2>

      {error && (
        <div className="alert alert-danger alert-dismissible fade show">
          {error}
          <button type="button" className="btn-close" onClick={() => setError('')}></button>
        </div>
      )}

      {success && (
        <div className="alert alert-success alert-dismissible fade show">
          {success}
          <button type="button" className="btn-close" onClick={() => setSuccess('')}></button>
        </div>
      )}

      <div className="row">
        {/* New Reservation Form */}
        <div className="col-md-6">
          <div className="card mb-4">
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0">Make a Reservation</h5>
            </div>
            <div className="card-body">
              <form onSubmit={checkAvailability}>
                <div className="mb-3">
                  <label className="form-label">Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={date}
                    min={getTodayDate()}
                    onChange={(e) => setDate(e.target.value)}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Time Slot</label>
                  <select
                    className="form-select"
                    value={timeSlot}
                    onChange={(e) => setTimeSlot(e.target.value)}
                    required
                  >
                    <option value="">Select time slot</option>
                    {timeSlots.map((slot) => (
                      <option key={slot} value={slot}>{slot}</option>
                    ))}
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label">Number of Guests</label>
                  <input
                    type="number"
                    className="form-control"
                    value={guests}
                    min="1"
                    max="10"
                    onChange={(e) => setGuests(e.target.value)}
                    required
                  />
                </div>

                <button 
                  type="submit" 
                  className="btn btn-primary w-100"
                  disabled={loading}
                >
                  {loading ? 'Checking...' : 'Check Availability'}
                </button>
              </form>

              {/* Available Tables */}
              {showAvailability && availableTables.length > 0 && (
                <div className="mt-4">
                  <h6>Available Tables:</h6>
                  <div className="list-group mb-3">
                    {availableTables.map((table) => (
                      <label 
                        key={table._id}
                        className={`list-group-item list-group-item-action ${selectedTable === table._id ? 'active' : ''}`}
                      >
                        <input
                          type="radio"
                          name="table"
                          value={table._id}
                          checked={selectedTable === table._id}
                          onChange={(e) => setSelectedTable(e.target.value)}
                          className="me-2"
                        />
                        Table {table.tableNumber} - Capacity: {table.capacity} persons
                      </label>
                    ))}
                  </div>

                  <button 
                    className="btn btn-success w-100"
                    onClick={handleBooking}
                    disabled={loading || !selectedTable}
                  >
                    {loading ? 'Booking...' : 'Confirm Reservation'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* My Reservations */}
        <div className="col-md-6">
          <div className="card">
            <div className="card-header bg-secondary text-white">
              <h5 className="mb-0">My Reservations</h5>
            </div>
            <div className="card-body">
              {myReservations.length === 0 ? (
                <p className="text-muted">No reservations yet</p>
              ) : (
                <div className="list-group">
                  {myReservations.map((reservation) => (
                    <div 
                      key={reservation._id} 
                      className={`list-group-item ${reservation.status === 'cancelled' ? 'list-group-item-secondary' : ''}`}
                    >
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <h6 className="mb-1">
                            Table {reservation.table.tableNumber}
                            {reservation.status === 'cancelled' && (
                              <span className="badge bg-danger ms-2">Cancelled</span>
                            )}
                          </h6>
                          <p className="mb-1">
                            <strong>Date:</strong> {formatDate(reservation.date)}
                          </p>
                          <p className="mb-1">
                            <strong>Time:</strong> {reservation.timeSlot}
                          </p>
                          <p className="mb-0">
                            <strong>Guests:</strong> {reservation.numberOfGuests}
                          </p>
                        </div>
                        {reservation.status === 'confirmed' && (
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => handleCancelReservation(reservation._id)}
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;
