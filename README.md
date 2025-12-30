# Restaurant Reservation Management System

A full-stack web application for managing Spicy Meal restaurant table reservations with role-based access control.

## Features

### Customer Features
- User registration and authentication
- Check table availability by date, time slot, and number of guests
- Create table reservations
- View personal reservation history
- Cancel own reservations

### Admin Features
- View all reservations
- Filter reservations by specific date
- Cancel any reservation
- Manage restaurant tables (add, activate/deactivate)
- View table capacity and availability

## Technology Stack

### Frontend
- React.js
- React Router for navigation
- Axios for API calls
- Bootstrap 5 for UI styling

### Backend
- Node.js with Express.js
- MongoDB with Mongoose ODM
- JWT for authentication
- bcryptjs for password hashing

## Project Structure

```
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/    # Reusable components (Navbar, Footer)
│   │   ├── pages/         # Page components
│   │   │   ├── Home       # Home
│   │   │   ├── Login      # Login, Register
│   │   │   ├── Register   # Register, Login
│   │   │   ├── customer/  # Customer Dashboard
│   │   │   └── admin/     # Admin Dashboard
│   │   └── utils/         # Helper functions (auth, axios)
│   └── package.json
│
└── server/                # Node.js backend
    ├── config/            # Database configuration
    ├── models/            # Mongoose models
    ├── routes/            # API routes
    ├── controllers/       # Business logic
    ├── middleware/        # Auth middleware
    ├── utils/             # Utility functions
    └── package.json
```

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB Atlas account (or local MongoDB)
- npm or yarn

### Backend Setup

1. Navigate to server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file in server directory:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=7d
NODE_ENV=development
```

4. Seed tables (optional):
```bash
node utils/seedTables.js
```

5. Start the server:
```bash
npm run dev
```

Server runs on `http://localhost:5000`

### Frontend Setup

1. Navigate to client directory:
```bash
cd client
```

2. Install dependencies:
```bash
npm install
```

3. Update API URL in `client/src/utils/axios.js` if needed (default: `http://localhost:5000/api`)

4. Start the React app:
```bash
npm start
```

App runs on `http://localhost:3000`

## Database Schema

### User Model
- name: String
- email: String (unique)
- password: String (hashed)
- role: String (customer/admin)

### Table Model
- tableNumber: Number (unique)
- capacity: Number
- isActive: Boolean

### Reservation Model
- user: ObjectId (ref: User)
- table: ObjectId (ref: Table)
- date: Date
- timeSlot: String (enum of time slots)
- numberOfGuests: Number
- status: String (confirmed/cancelled)

## Reservation Logic & Availability

### Availability Check
The system checks table availability by:
1. Finding tables with capacity >= requested number of guests
2. Checking for existing confirmed reservations for the same date and time slot
3. Filtering out already-reserved tables
4. Returning available tables to the customer

### Conflict Prevention
Double booking is prevented by:
- Database query checking for existing reservations with same table, date, and time slot
- Returning 409 Conflict error if table is already booked
- Using MongoDB indexes on (table, date, timeSlot, status) for fast queries

### Time Slots
Fixed time slots available:
- Lunch: 11:00 AM, 12:00 PM, 1:00 PM, 2:00 PM
- Dinner: 6:00 PM, 7:00 PM, 8:00 PM, 9:00 PM, 10:00 PM

## Role-Based Access Control

### Authentication
- JWT tokens stored in localStorage
- Token sent in Authorization header for protected routes
- Tokens expire after 1 days

### Authorization
- **Public routes**: Register, Login
- **Customer routes**: Create reservation, view own reservations, cancel own reservation
- **Admin routes**: View all reservations, cancel any reservation, manage tables

### Middleware
- `protect`: Verifies JWT token
- `authorize`: Checks user role matches required role

## API Endpoints

### Auth Routes
```
POST /api/auth/register - Register new user
POST /api/auth/login - Login user
GET  /api/auth/me - Get current user (Protected)
```

### Customer Routes (Protected)
```
GET    /api/reservations/available - Check availability
POST   /api/reservations - Create reservation
GET    /api/reservations/my-reservations - Get own reservations
DELETE /api/reservations/:id - Cancel own reservation
```

### Admin Routes (Protected - Admin Only)
```
GET    /api/admin/reservations - Get all reservations
GET    /api/admin/reservations/date/:date - Get reservations by date
PUT    /api/admin/reservations/:id - Update reservation
DELETE /api/admin/reservations/:id - Cancel any reservation
GET    /api/admin/tables - Get all tables
POST   /api/admin/tables - Create table
PUT    /api/admin/tables/:id - Update table
```


## Testing

### Manual Testing Checklist

**Authentication:**
- [x] Register as customer
- [x] Change to admin
- [x] Login with valid credentials
- [x] Login with invalid credentials
- [x] Access protected routes without login
- [x] Logout functionality

**Customer Features:**
- [x] Check table availability
- [x] Create reservation
- [x] Prevent double booking
- [x] View own reservations
- [x] Cancel own reservation
- [x] Cannot cancel other user's reservation

**Admin Features:**
- [x] View all reservations
- [x] Filter by date
- [x] Cancel any reservation
- [x] View all tables
- [x] Add new table
- [x] Activate/deactivate table

## Deployment


## Live URLs

- **Frontend**: []
- **Backend**: []
- **GitHub**: [https://github.com/OmPrakashMadasi/spicymeal.git]

## Author

Created as part of a full-stack developer assessment.

## License

This project is for assessment purposes only.
