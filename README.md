# EventBooking / EventEase

A full-stack event venue booking platform that connects customers with venue vendors. Users can browse venues, make bookings, and complete payments, while vendors can manage venues, view reservations, and track revenue.

## ✨ Features

- User registration and login
- Vendor registration and login
- Browse event venues
- View venue details and gallery images
- Check venue availability by date
- Create bookings
- Simulated payment flow with card/UPI options
- Vendor dashboard for venue management
- Booking and revenue reporting
- Image upload support for venue photos

## 🛠️ Tech Stack

### Frontend
- React
- React Router DOM
- Bootstrap
- Axios
- SweetAlert2

### Backend
- Node.js
- Express.js
- MySQL2
- bcryptjs
- jsonwebtoken
- multer

## 📁 Project Structure

```text
EventBooking/
├── client/                # React frontend
├── Server/                # Express backend and uploads
└── README.md              # Project overview
```

## 🚀 Getting Started

### 1) Install dependencies

```bash
cd client
npm install

cd ../Server
npm install
```

### 2) Configure MySQL

Create a MySQL database named `event` and ensure the backend connection settings match your local environment.

### 3) Start the application

```bash
# Backend
cd Server
node server.js

# Frontend (new terminal)
cd client
npm start
```

The frontend will run on `http://localhost:3000` and the backend on `http://localhost:5000`.

## 🔐 Authentication

The application uses JWT for user and vendor authentication.

- Users log in with email and password.
- Vendors log in with separate credentials.
- Tokens are stored in browser local storage.

## 🧩 Main Modules

### For Users
- Register/login
- Explore venues
- View venue details
- Book a venue
- Make payment
- View booking history

### For Vendors
- Register/login
- Add and edit venues
- Upload main and additional photos
- View bookings for their venues
- Review booking reports and income

## 🗄️ Database Overview

The app uses MySQL with tables for:
- `users`
- `vendors`
- `categories`
- `venues`
- `venue_additional_photos`
- `bookings`
- `payments`

## 📡 API Highlights

### Authentication
- `POST /register`
- `POST /login`
- `POST /vendor/register`
- `POST /vendor/login`

### Venues
- `GET /api/venues`
- `GET /api/venues/:id`
- `POST /vendor/venue`
- `PUT /vendor/venue/:id`
- `DELETE /vendor/venue/:id`

### Bookings and Payments
- `POST /api/bookings`
- `GET /api/bookings/user/:userId`
- `POST /api/payments`

## 🧪 Workflow Summary

1. A user registers and logs in.
2. The user browses venues and opens a venue details page.
3. The user selects a date and submits a booking request.
4. The booking is stored in the database.
5. The user proceeds to a payment step.
6. After payment, the booking is marked as paid.
7. Vendors can view those bookings from their dashboard.

## ✅ Notes

This project is a solid full-stack demo and is suitable for learning, academic submission, and further enhancement. The current implementation uses a simple backend structure and a mock payment flow rather than a real payment gateway integration.

## 🔮 Future Improvements

- Integrate Stripe or Razorpay
- Add proper backend JWT middleware
- Move configuration to environment variables
- Improve validation and error handling
- Add testing and deployment automation

## 🗣️ Interview Summary

This project demonstrates full-stack web development skills, including frontend routing, backend API design, authentication, file uploads, database interaction, and business logic for booking and payment flows.
