import React from 'react';
import { Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import logo from '../assets/logo/spicymeal.png';
const Footer = () => {
  return (
    <footer className="bg-dark text-white mt-5 py-4">
      <div className="container">
        <div className="row">
          <div className="col-md-4 mb-3">
            <Link className="navbar-brand" to="/">
                      <img 
                        src={logo} 
                        alt="App Logo" 
                        width="50" 
                        height="40" 
                        className="d-inline-block align-top"
                      />
                      
                    </Link>
            <p className="">
              Book your table easily and manage your reservations online.
            </p>
          </div>
          
          <div className="col-md-4 mb-3">
            <h5>Quick Links</h5>
            <ul className="list-unstyled">
              <li><a href="/" className=" text-white text-decoration-none">Home</a></li>
              <li><a href="/login" className=" text-white text-decoration-none">Login</a></li>
              <li><a href="/register" className=" text-white text-decoration-none">Register</a></li>
            </ul>
          </div>
          
          <div className="col-md-4 mb-3">
            <h5>Contact</h5>
            <p className=" mb-1">
              Email: bookings@spicymeal.com
            </p>
            <p className=" mb-1">
              Phone: 9100177915
            </p>
            <p className="">
              Address: L.B Nagar, Hyderabad, India
            </p>
          </div>
        </div>
        
        <hr className="bg-secondary" />
        
        <div className="row">
          <div className="col-md-12 text-center">
            <p className=" mb-0">
              &copy; {new Date().getFullYear()} Spicy Meal Restaurant. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
