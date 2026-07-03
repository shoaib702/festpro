# EventBooking / EventEase Technical Documentation

## 1. Project Overview

EventBooking is a full-stack event venue booking web application that allows users to browse venues, book them for specific dates, make payments, and view their bookings. It also provides a vendor dashboard where venue providers can register, add venues, upload images, manage their listings, and track bookings and income.

The project is structured as a React frontend and an Express + MySQL backend. It is designed as a practical marketplace-style system for event venue reservation.

---

## 2. Purpose of the Project

The main goal of this project is to make venue booking simple and digital for both customers and vendors. The application helps:

- Users discover venues for events.
- Vendors list and manage venue availability.
- Customers reserve venues online.
- Vendors track payments and bookings.
- The system stores venue images, booking details, and payments in one place.

In short, this is a simplified event management and venue booking platform.

---

## 3. Tech Stack

### Frontend
- React 19
- React Router DOM
- Bootstrap 5
- Axios for HTTP requests
- SweetAlert2 for alerts and confirmation dialogs
- Create React App (CRA)

### Backend
- Node.js
- Express.js
- MySQL2
- bcryptjs for password hashing
- jsonwebtoken for JWT authentication
- multer for file upload handling

### Database
- MySQL

### Other Tools
- CORS
- Static file serving via Express

---

## 4. Folder Structure

```text
EventBooking/
├── client/
│   ├── public/
│   │   ├── index.html
│   │   ├── manifest.json
│   │   ├── robots.txt
│   │   └── images/
│   └── src/
│       ├── App.css
│       ├── App.js
│       ├── index.css
│       ├── index.js
│       ├── setupTests.js
│       └── Components/
│           ├── ProtectedRoute.js
│           ├── VendorProtectedRoute.js
│           ├── Admin/
│           │   ├── AllBooking.js
│           │   ├── BookingsTable.js
│           │   ├── Report.js
│           │   ├── Sidebar.js
│           │   ├── VendorDashboard.js
│           │   ├── VendorLogin.js
│           │   ├── VendorRegister.js
│           │   ├── VenueForm.js
│           │   ├── VenuesAll.js
│           │   └── VenuesList.js
│           ├── Dashboard/
│           │   ├── Categories.js
│           │   ├── Dashboard.js
│           │   ├── EventCard.js
│           │   ├── EventSection.js
│           │   ├── Header.js
│           │   ├── Myprofile.js
│           │   └── venues.js
│           ├── Home/
│           │   └── Home.js
│           ├── User/
│           │   ├── Login.js
│           │   └── Register.js
│           └── Venue/
│               ├── MyBooking.js
│               ├── VenueBooking.js
│               ├── VenueDetails.js
│               └── VenuePayment.js
├── Server/
│   ├── index.js
│   ├── package.json
│   ├── server.js
│   └── uploads/
```

### Notes
- The main backend logic is implemented in [Server/server.js](Server/server.js).
- [Server/index.js](Server/index.js) appears to be a duplicate or older version and is not the main runtime file.

---

## 5. Frontend Architecture

The frontend is a React single-page application with route-based navigation. It is organized by feature and role.

### Frontend Responsibilities
- User authentication screens: login and registration.
- Home page and explore page for browsing venues.
- Venue detail page with image gallery and booking CTA.
- Booking form and payment page.
- User profile page.
- Vendor dashboard for listing and editing venues.
- Booking and reporting screens for vendors.

### Routing Structure
The app uses React Router and defines the following route groups:
- Public routes: home, login, register, vendor login, vendor register.
- Protected user routes: explore, profile, venue details, booking, payment, my bookings.
- Protected vendor routes: vendor dashboard, venue list, bookings, all venues, reports.

### Frontend State Handling
- Local component state is used with React hooks.
- No Redux or Context API is used for global state.
- Authentication status is stored in localStorage.

### Frontend Design Notes
- The UI uses Bootstrap classes and custom CSS.
- Images are loaded from the backend upload server using URLs such as `/uploads/<filename>`.

---

## 6. Backend Architecture

The backend is a monolithic Express application. All route logic and database queries are implemented directly inside [Server/server.js](Server/server.js).

### Backend Responsibilities
- Accept user and vendor authentication requests.
- Handle venue CRUD operations.
- Upload and serve images.
- Create and retrieve bookings.
- Handle payment processing simulation.
- Query the MySQL database.

### Current Architecture Pattern
This project does not currently use a layered architecture such as:
- controllers/
- services/
- models/
- middleware/

Instead, it uses a single-file server with route handlers directly inline. That makes the project easy to understand but harder to scale.

### Database Connection
The backend connects to MySQL using `mysql2` and creates a connection pool-like single connection instance:
- Host: localhost
- User: root
- Password: root@123
- Database: event

---

## 7. Database Design

### Tables Used
The backend uses the following tables:

1. users
2. vendors
3. categories
4. venues
5. venue_additional_photos
6. bookings
7. payments

### Relationships

- A user can make many bookings.
- A vendor can own many venues.
- A venue belongs to one vendor and can have many bookings.
- A venue can have many additional photos.
- A booking can have one payment record.
- A payment belongs to one booking and one user.

### Important Design Note
The project uses a simple and somewhat denormalized design for categories. Category IDs are stored inside the `venues.categories` column as a comma-separated string instead of a proper join table. This works for the current scope but is not ideal for scaling.

### Table Explanations

#### users
Stores customer user accounts.
- id
- name
- email
- password
- address
- mobile

Used for:
- user login/registration
- profile management
- booking ownership

#### vendors
Stores vendor accounts.
- id
- name
- email
- password
- address
- mobile

Used for:
- vendor registration/login
- association with listed venues

#### categories
Stores venue categories such as wedding, conference, party, etc.
- id
- name

Used by:
- venue filtering and display

#### venues
Stores venue listings.
- id
- vendor_id
- name
- info
- rate
- photo
- capacity
- location
- categories

Used for:
- listing venues on the user side
- vendor venue management
- booking calculations

#### venue_additional_photos
Stores extra images for a venue.
- id
- venue_id
- image_path

Used for:
- gallery display on the venue details page

#### bookings
Stores each venue reservation request.
- id
- user_id
- venue_id
- booking_date
- booking_time
- people
- message
- amount
- status
- created_at

Used for:
- user booking history
- vendor booking tracking
- payment association

#### payments
Stores payment transaction records.
- id
- booking_id
- user_id
- amount
- payment_method
- transaction_id
- status
- card_last4
- card_expiry
- card_name
- upi_id
- created_at

Used for:
- confirming bookings after payment
- vendor income reporting

---

## 8. Authentication Flow (JWT)

The application uses JWT-based authentication for both users and vendors.

### User Authentication Flow
1. User submits registration form.
2. Server hashes the password with bcrypt.
3. User record is stored in the `users` table.
4. User logs in with email and password.
5. Server verifies password.
6. Server creates a JWT signed with a secret key.
7. The token and user ID are returned to the frontend.
8. The frontend saves them in `localStorage`.
9. Protected routes check for the presence of the token.

### Vendor Authentication Flow
1. Vendor registers.
2. Credentials are stored in the `vendors` table.
3. Vendor logs in.
4. Server issues a vendor JWT signed with a different secret.
5. The frontend saves the token in `localStorage` as `vendorToken`.

### Important Note
The current implementation uses client-side route protection only. Most backend routes do not enforce the JWT token on the server side with an authentication middleware. That means the token is used more as a frontend session indicator than as a fully secured backend guard.

---

## 9. API Endpoints

The backend exposes the following main API endpoints.

### Authentication Endpoints

| Method | Route | Request | Response |
|---|---|---|---|
| POST | /register | name, email, password, address, mobile | Success message or validation error |
| POST | /login | email, password | JWT token, user id, success message |
| POST | /vendor/register | name, email, password, address, mobile | Vendor created successfully |
| POST | /vendor/login | email, password | JWT token, vendorId, success message |

### Venue Endpoints

| Method | Route | Request | Response |
|---|---|---|---|
| GET | /api/venues | optional category query | List of venues |
| GET | /api/venues/:id | venue id | Single venue details |
| GET | /api/venues/:id/availability | date query | availability status |
| POST | /vendor/venue | multipart form: vendor_id, name, info, rate, capacity, location, photo, categories[] | Venue created |
| PUT | /vendor/venue/:id | multipart form with updated venue data | Venue updated |
| DELETE | /vendor/venue/:id | vendor_id in body | Venue deleted |
| GET | /vendor/venues/:vendorId | vendorId | Venues owned by vendor |

### Category Endpoints

| Method | Route | Request | Response |
|---|---|---|---|
| GET | /categories | none | List of categories |

### User Profile Endpoints

| Method | Route | Request | Response |
|---|---|---|---|
| GET | /api/users/:id | user id | User profile |
| PUT | /api/users/:id | name, email, address, mobile | Profile updated |
| PUT | /api/users/:id/password | oldPassword, newPassword | Password updated |

### Booking Endpoints

| Method | Route | Request | Response |
|---|---|---|---|
| POST | /api/bookings | user_id, venue_id, booking_date, booking_time, people, message | Booking created with bookingId |
| GET | /api/users/:id/bookings | user id | User booking history |
| GET | /api/bookings/user/:userId | userId | Booking list for user |
| GET | /api/vendors/:id/bookings | vendor id | Bookings for vendor venues |
| GET | /api/vendors/:id/bookings-details | vendor id | Bookings with payment and customer details |

### Payment Endpoints

| Method | Route | Request | Response |
|---|---|---|---|
| POST | /api/payments | bookingId, amount, paymentDetails, userId | Payment saved and booking marked paid |

### Image Upload Endpoints

| Method | Route | Request | Response |
|---|---|---|---|
| POST | /venue/:id/additional-photos | multipart form with additionalPhotos and vendor_id | Additional images stored |
| GET | /venue/:id/additional-photos | venue id | List of images |
| DELETE | /venue/additional-photo/:id | vendor_id in body | Photo removed |

---

## 10. User Flow

The typical user flow is:

1. User visits the home page.
2. User registers or logs in.
3. User browses available venues on the explore page.
4. User clicks a venue to view details and gallery.
5. User selects a date and submits a booking request.
6. If the venue is available, the booking is created.
7. User proceeds to payment.
8. After payment, the booking is confirmed.
9. User can view all bookings from the My Bookings section.

---

## 11. Admin Flow

In this project, the “admin” role is effectively represented by the vendor dashboard. A vendor can:

1. Register and log in.
2. Add new venues.
3. Upload main and additional venue photos.
4. Assign categories to venues.
5. Edit and delete venues.
6. Review customer bookings.
7. View total income and booking reports.

---

## 12. Vendor Flow

A vendor follows this path:

1. Registers on the vendor registration page.
2. Logs in using the vendor login page.
3. Reaches the vendor dashboard.
4. Adds venue information such as name, description, capacity, rate, and location.
5. Uploads a main venue photo and additional images.
6. Selects categories for the venue.
7. Saves the venue to the database.
8. Views bookings made for that venue.
9. Reviews booking details and total revenue.

---

## 13. Booking Flow

The booking flow works as follows:

1. User opens a venue detail page.
2. User clicks “Book Now”.
3. The booking form opens.
4. The user enters event date, time, number of people, and message.
5. The frontend checks venue availability for the selected date.
6. If available, the booking is created through the backend.
7. The backend stores the booking record and returns a booking ID.
8. The user is redirected to the payment page.

### Availability Logic
The backend checks for existing bookings for the same venue and same date. If one exists, the booking is blocked.

---

## 14. Payment Flow

The payment flow is currently a simulated payment process rather than a real gateway integration.

1. After booking creation, the app routes the user to the payment page.
2. The user selects a payment method: card or UPI.
3. The user enters payment details.
4. The frontend sends the payment data to `/api/payments`.
5. The backend inserts a payment row into the `payments` table.
6. The booking status is updated to `paid`.
7. A transaction ID is generated for the payment.
8. The user sees a success confirmation and is redirected to My Bookings.

### Important Note
No real payment provider such as Stripe or Razorpay is integrated. The current flow is a mock/transaction-recording flow.

---

## 15. Image Upload Flow

The project supports image upload for venues and their gallery pictures.

1. The vendor selects one or more image files.
2. The frontend sends them as `multipart/form-data`.
3. The backend uses `multer` to save the files into the `Server/uploads` folder.
4. The file name is saved in the database.
5. The frontend displays images using the public upload URL.

### Main Photo
- Stored in the `venues.photo` column.

### Additional Photos
- Stored in `venue_additional_photos.image_path`.

---

## 16. Database Schema Explanation

### users
Represents the normal customers of the platform.
- Used for login, booking history, profile management.

### vendors
Represents the venue owners/providers.
- Used for managing venues and seeing reservations.

### categories
Represents tags that classify venues.
- Example: wedding, conference, party, birthday.

### venues
Represents each venue listing.
- Contains core venue information.
- Links to a vendor.
- Stores a main photo and categories.

### venue_additional_photos
Represents extra photos for a venue.
- Useful for displaying a gallery.

### bookings
Represents a booking made by a user for a specific venue.
- Stores event date, time, people, and message.
- Used for availability checks.

### payments
Represents the completed or pending payment for a booking.
- Stores payment method and transaction details.

---

## 17. Middleware Explanation

The backend uses Express middleware for request handling.

### Built-in Middleware
- `cors()` allows requests from the React frontend.
- `express.json()` parses JSON request bodies.
- `express.static()` serves uploaded image files from the uploads directory.

### Upload Middleware
- `multer.diskStorage()` defines where uploaded files are saved.
- `upload.single("photo")` handles a single main image upload.
- `upload.array("additionalPhotos", 10)` handles multiple gallery images.

### Frontend Route Guards
- `ProtectedRoute` and `VendorProtectedRoute` act as UI-level authorization guards.

### Missing Middleware
There is no dedicated server-side JWT authorization middleware. This means the backend does not currently verify tokens for each protected route.

---

## 18. Security Features

The project includes some basic security practices:

- Passwords are hashed using bcrypt before storage.
- SQL queries use parameterized values rather than string interpolation.
- Basic validation is applied on forms in the frontend and server.
- File uploads are handled safely with multer.
- Protected routes prevent unauthorized access at the UI level.

### Security Gaps / Limitations
- JWT is not enforced consistently on the backend.
- No refresh token mechanism.
- No role-based authorization model.
- No email verification.
- No two-factor authentication.
- No HTTPS configuration.

---

## 19. Environment Variables

The project currently uses hard-coded configuration values inside the backend source code.

### Hardcoded Values Found
- MySQL connection details
- JWT secrets
- Port number
- API base URL values in the frontend

### Best Practice Recommendation
The project should move to environment variables such as:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=root@123
DB_NAME=event
JWT_SECRET=secretkey
VENDOR_JWT_SECRET=vendorSecretKey
PORT=5000
REACT_APP_API_URL=http://localhost:5000
```

---

## 20. External Libraries Used

### Frontend Dependencies
- react
- react-dom
- react-router-dom
- axios
- bootstrap
- jquery
- sweetalert2
- react-scripts
- @testing-library/*

### Backend Dependencies
- express
- cors
- bcryptjs
- jsonwebtoken
- multer
- mysql2

---

## 21. Deployment Requirements

To run this project locally or in production, the following are required:

### Required Software
- Node.js and npm
- MySQL server

### Database Setup
- Create a MySQL database named `event`
- Create the required tables:
  - users
  - vendors
  - categories
  - venues
  - venue_additional_photos
  - bookings
  - payments

### Backend Setup
- Install dependencies in the Server folder.
- Start the server with Node.
- Ensure the backend is reachable at `http://localhost:5000`.

### Frontend Setup
- Install dependencies in the client folder.
- Start React development server.
- Ensure the frontend calls the backend API at the correct address.

### Production Recommendation
- Build the frontend for production.
- Serve the frontend static files using a web server.
- Use a reverse proxy such as Nginx.
- Run the backend as a process manager such as PM2.

---

## 22. Current Limitations

The project is functional for a learning/demo level, but there are several limitations:

- No real payment gateway integration.
- No server-side JWT validation middleware.
- Authentication is mostly based on localStorage and frontend route checks.
- No email verification or password reset flow.
- No admin panel separate from vendor panel.
- Categories are stored as comma-separated text rather than a normalized many-to-many table.
- No unit or integration tests are present.
- No environment variable configuration.
- No containerization or deployment automation.
- Upload cleanup is not fully robust if database operations fail.

---

## 23. Future Improvements

The project can be improved in the following ways:

- Integrate a real payment gateway like Stripe or Razorpay.
- Add proper JWT middleware for backend route protection.
- Move secrets and configuration to environment variables.
- Introduce role-based access control.
- Add email verification and password reset.
- Use a proper normalized database schema for categories.
- Refactor the backend into separate routes/controllers/services.
- Add automated tests.
- Add pagination and search for venues and bookings.
- Improve file storage and cleanup logic.
- Add dashboard analytics and charts.

---

## 24. Complete Project Workflow Step-by-Step

This section explains the complete flow from user registration to successful booking.

### Step 1: User Registration
- The user opens the registration page.
- The user submits name, email, password, address, and mobile.
- The frontend sends the data to `/register`.
- The backend hashes the password and inserts the record into the `users` table.

### Step 2: User Login
- The user logs in with email and password.
- The backend checks the user record in the database.
- If successful, the backend generates a JWT.
- The frontend stores the token in `localStorage`.

### Step 3: Venue Browsing
- After login, the user is redirected to the explore/dashboard page.
- The frontend requests `/api/venues` from the backend.
- The backend returns all venues from the `venues` table.
- The user can click a venue card to view its details.

### Step 4: Venue Details View
- The user sees venue name, description, price, capacity, location, and gallery images.
- The frontend requests additional image data from `/venue/:id/additional-photos`.
- The details page is rendered with the venue information.

### Step 5: Booking Request
- The user clicks “Book Now”.
- The booking form is shown with user details prefilled.
- The user enters the event date, time, guest count, and message.
- The frontend checks venue availability by calling `/api/venues/:id/availability`.

### Step 6: Booking Creation
- If the selected date is available, the frontend sends a booking request to `/api/bookings`.
- The backend creates a booking record in the `bookings` table.
- The response includes the booking ID and amount.

### Step 7: Payment Process
- The app navigates to the payment page.
- The user chooses a payment method and enters payment details.
- The frontend sends the payment request to `/api/payments`.
- The backend saves the payment record.
- The booking status is updated to `paid`.

### Step 8: Confirmation
- The user is shown a success message with the transaction ID.
- The user is redirected to the My Bookings page.
- The booking appears in the user’s booking history.

### Step 9: Vendor Side Visibility
- The vendor can see the booking in the vendor dashboard.
- The vendor can view booking details, customer information, and payment status.
- Revenue can be calculated from completed payments.

---

## 25. Project Explanation for Interview

This project is a venue booking platform built with React on the frontend and Node.js with Express on the backend. It allows users to register, browse venues, book them for specific dates, and pay for reservations. Vendors can also register, add venues, upload photos, and manage bookings through a dashboard. The project uses MySQL for data storage, JWT for authentication, and multer for image uploads. It demonstrates core full-stack concepts such as REST APIs, database design, form handling, protected routes, file uploads, booking logic, and payment flow.

In simple terms, I built an online marketplace where customers can find and book event venues, and vendors can manage their offerings efficiently. The project shows my ability to connect a frontend interface with a backend server, manage data persistence, and implement real-world user flows such as authentication, booking, and payment.
