import React from 'react';
import { Link } from 'react-router-dom';
import { isAuthenticated, getUser } from '../utils/auth';

const Home = () => {
  const authenticated = isAuthenticated();
  const user = getUser();

  return (
    <div className="container bg-white mt-5">
      <div className="row justify-content-center">
        <div className="col-md-8 text-center">
          <h1 className="display-4 mb-4">Restaurant Reservation System</h1>
          <p className="lead mb-5">
            Book your table easily and manage reservations
          </p>

          {!authenticated ? (
            <div>
              <Link to="/register" className="btn btn-primary btn-lg me-3">
                Register
              </Link>
              <Link to="/login" className="btn btn-outline-primary btn-lg">
                Login
              </Link>
            </div>
          ) : (
            <div>
              <Link 
                to={user?.role === 'admin' ? '/admin/dashboard' : '/customer/dashboard'}
                className="btn btn-primary btn-lg"
              >
                Go to Dashboard
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
