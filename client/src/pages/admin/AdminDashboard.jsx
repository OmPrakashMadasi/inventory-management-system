import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_URL, { getAxiosConfig } from '../../utils/axios';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('all'); // 'all' or 'byDate' or 'tables'
  
  // Reservations state
  const [allReservations, setAllReservations] = useState([]);
  const [filteredReservations, setFilteredReservations] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  
  // Tables state
  const [tables, setTables] = useState([]);
  const [newTable, setNewTable] = useState({ tableNumber: '', capacity: '' });
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchAllReservations();
    fetchTables();
  }, []);

  const fetchAllReservations = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${API_URL}/admin/reservations`,
        getAxiosConfig()
      );
      setAllReservations(response.data.data);
    } catch (err) {
      setError('Error fetching reservations');
    } finally {
      setLoading(false);
    }
  };

  const fetchReservationsByDate = async () => {
    if (!selectedDate) {
      setError('Please select a date');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const response = await axios.get(
        `${API_URL}/admin/reservations/date/${selectedDate}`,
        getAxiosConfig()
      );
      setFilteredReservations(response.data.data);
    } catch (err) {
      setError('Error fetching reservations by date');
    } finally {
      setLoading(false);
    }
  };

  const fetchTables = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/admin/tables`,
        getAxiosConfig()
      );
      setTables(response.data.data);
    } catch (err) {
      setError('Error fetching tables');
    }
  };

  const handleCancelReservation = async (reservationId) => {
    if (!window.confirm('Cancel this reservation?')) {
      return;
    }

    try {
      await axios.delete(
        `${API_URL}/admin/reservations/${reservationId}`,
        getAxiosConfig()
      );
      
      setSuccess('Reservation cancelled successfully');
      fetchAllReservations();
      if (selectedDate) {
        fetchReservationsByDate();
      }
    } catch (err) {
      setError('Error cancelling reservation');
    }
  };

  const handleCreateTable = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await axios.post(
        `${API_URL}/admin/tables`,
        {
          tableNumber: parseInt(newTable.tableNumber),
          capacity: parseInt(newTable.capacity)
        },
        getAxiosConfig()
      );
      
      setSuccess('Table created successfully');
      setNewTable({ tableNumber: '', capacity: '' });
      fetchTables();
    } catch (err) {
      setError(err.response?.data?.message || 'Error creating table');
    }
  };

  const handleToggleTableStatus = async (tableId, currentStatus) => {
    try {
      await axios.put(
        `${API_URL}/admin/tables/${tableId}`,
        { isActive: !currentStatus },
        getAxiosConfig()
      );
      
      setSuccess('Table status updated');
      fetchTables();
    } catch (err) {
      setError('Error updating table status');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Admin Dashboard</h2>

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

      {/* Tabs */}
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            All Reservations
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'byDate' ? 'active' : ''}`}
            onClick={() => setActiveTab('byDate')}
          >
            By Date
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'tables' ? 'active' : ''}`}
            onClick={() => setActiveTab('tables')}
          >
            Manage Tables
          </button>
        </li>
      </ul>

      {/* All Reservations Tab */}
      {activeTab === 'all' && (
        <div className="card">
          <div className="card-header">
            <h5 className="mb-0">All Reservations ({allReservations.length})</h5>
          </div>
          <div className="card-body">
            {loading ? (
              <div className="text-center">
                <div className="spinner-border" role="status"></div>
              </div>
            ) : allReservations.length === 0 ? (
              <p className="text-muted">No reservations yet</p>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Customer</th>
                      <th>Table</th>
                      <th>Date</th>
                      <th>Time</th>
                      <th>Guests</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allReservations.map((reservation) => (
                      <tr key={reservation._id}>
                        <td>
                          {reservation.user.name}
                          <br />
                          <small className="text-muted">{reservation.user.email}</small>
                        </td>
                        <td>Table {reservation.table.tableNumber}</td>
                        <td>{formatDate(reservation.date)}</td>
                        <td>{reservation.timeSlot}</td>
                        <td>{reservation.numberOfGuests}</td>
                        <td>
                          <span className={`badge ${reservation.status === 'confirmed' ? 'bg-success' : 'bg-danger'}`}>
                            {reservation.status}
                          </span>
                        </td>
                        <td>
                          {reservation.status === 'confirmed' && (
                            <button
                              className="btn btn-sm btn-danger"
                              onClick={() => handleCancelReservation(reservation._id)}
                            >
                              Cancel
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* By Date Tab */}
      {activeTab === 'byDate' && (
        <div className="card">
          <div className="card-header">
            <h5 className="mb-0">Reservations by Date</h5>
          </div>
          <div className="card-body">
            <div className="row mb-4">
              <div className="col-md-4">
                <input
                  type="date"
                  className="form-control"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              </div>
              <div className="col-md-2">
                <button 
                  className="btn btn-primary"
                  onClick={fetchReservationsByDate}
                  disabled={loading}
                >
                  Filter
                </button>
              </div>
            </div>

            {selectedDate && (
              <>
                <h6>Reservations for {formatDate(selectedDate)} ({filteredReservations.length})</h6>
                
                {filteredReservations.length === 0 ? (
                  <p className="text-muted">No reservations for this date</p>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead>
                        <tr>
                          <th>Customer</th>
                          <th>Table</th>
                          <th>Time</th>
                          <th>Guests</th>
                          <th>Status</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredReservations.map((reservation) => (
                          <tr key={reservation._id}>
                            <td>
                              {reservation.user.name}
                              <br />
                              <small className="text-muted">{reservation.user.email}</small>
                            </td>
                            <td>Table {reservation.table.tableNumber}</td>
                            <td>{reservation.timeSlot}</td>
                            <td>{reservation.numberOfGuests}</td>
                            <td>
                              <span className={`badge ${reservation.status === 'confirmed' ? 'bg-success' : 'bg-danger'}`}>
                                {reservation.status}
                              </span>
                            </td>
                            <td>
                              {reservation.status === 'confirmed' && (
                                <button
                                  className="btn btn-sm btn-danger"
                                  onClick={() => handleCancelReservation(reservation._id)}
                                >
                                  Cancel
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* Tables Management Tab */}
      {activeTab === 'tables' && (
        <div className="row">
          <div className="col-md-4">
            <div className="card mb-4">
              <div className="card-header bg-primary text-white">
                <h5 className="mb-0">Add New Table</h5>
              </div>
              <div className="card-body">
                <form onSubmit={handleCreateTable}>
                  <div className="mb-3">
                    <label className="form-label">Table Number</label>
                    <input
                      type="number"
                      className="form-control"
                      value={newTable.tableNumber}
                      onChange={(e) => setNewTable({...newTable, tableNumber: e.target.value})}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Capacity</label>
                    <input
                      type="number"
                      className="form-control"
                      value={newTable.capacity}
                      min="1"
                      onChange={(e) => setNewTable({...newTable, capacity: e.target.value})}
                      required
                    />
                  </div>
                  <button type="submit" className="btn btn-primary w-100">
                    Add Table
                  </button>
                </form>
              </div>
            </div>
          </div>

          <div className="col-md-8">
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">All Tables ({tables.length})</h5>
              </div>
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Table Number</th>
                        <th>Capacity</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tables.map((table) => (
                        <tr key={table._id}>
                          <td>Table {table.tableNumber}</td>
                          <td>{table.capacity} persons</td>
                          <td>
                            <span className={`badge ${table.isActive ? 'bg-success' : 'bg-secondary'}`}>
                              {table.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td>
                            <button
                              className={`btn btn-sm ${table.isActive ? 'btn-warning' : 'btn-success'}`}
                              onClick={() => handleToggleTableStatus(table._id, table.isActive)}
                            >
                              {table.isActive ? 'Deactivate' : 'Activate'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
