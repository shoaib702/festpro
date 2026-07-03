import express from "express";
import dotenv from "dotenv";
import mysql from "mysql2";
dotenv.config();
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));


// MySQL connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,

  
  ssl: {
    rejectUnauthorized: false,  
  },
});
db.connect((err) => {
  if (err) {
    console.error("❌ MySQL Connection Failed:", err.message);
    return;
  }
  console.log("✅ MySQL Connected Successfully");
});

// Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "uploads");
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext);
  },
});
const upload = multer({ storage });

// ---------------- AUTH ----------------

// User Register
app.post("/register", (req, res) => {
  const { name, email, password, address, mobile } = req.body;
  if (!name || !email || !password || !address || !mobile)
    return res.status(400).json({ error: "All fields are required." });

  const hashedPassword = bcrypt.hashSync(password, 10);
  const sql =
    "INSERT INTO users (name, email, password, address, mobile) VALUES (?, ?, ?, ?, ?)";
  db.query(sql, [name, email, hashedPassword, address, mobile], (err) => {
    if (err) return res.status(500).json({ error: "Database error." });
    res.json({ message: "User registered successfully!" });
  });
});

// User Login
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const sql = "SELECT * FROM users WHERE email = ?";
  db.query(sql, [email], (err, data) => {
    if (err) return res.status(500).json({ error: err });
    if (data.length === 0)
      return res.status(404).json({ message: "User not found" });

    const user = data[0];
    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    res.json({ message: "Login successful", token, id: user.id });
  });
});

// Vendor Register
app.post("/vendor/register", (req, res) => {
  const { name, email, password, address, mobile } = req.body;
  if (!name || !email || !password || !address || !mobile)
    return res.status(400).json({ error: "All fields are required." });

  const hashedPassword = bcrypt.hashSync(password, 10);
  const sql =
    "INSERT INTO vendors (name, email, password, address, mobile) VALUES (?, ?, ?, ?, ?)";
  db.query(sql, [name, email, hashedPassword, address, mobile], (err) => {
    if (err) return res.status(500).json({ error: "Database error." });
    res.json({ message: "Vendor registered successfully!" });
  });
});

// Vendor Login
app.post("/vendor/login", (req, res) => {
  const { email, password } = req.body;
  const sql = "SELECT * FROM vendors WHERE email = ?";
  db.query(sql, [email], (err, data) => {
    if (err) return res.status(500).json({ error: err });
    if (data.length === 0)
      return res.status(404).json({ message: "Vendor not found" });

    const vendor = data[0];
    const isMatch = bcrypt.compareSync(password, vendor.password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { vendor_id: vendor.id },
      process.env.VENDOR_JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );

    res.json({
      message: "Login successful",
      token,
      vendorId: vendor.id,
    });
  });
});

// ---------------- VENUE ROUTES ----------------

// Get all venues
// server.js
app.get('/api/venues', (req, res) => {
  const { category } = req.query;
  let sql = 'SELECT * FROM venues';
  let params = [];

  if (category) {
    sql = `
      SELECT v.* 
      FROM venues v
      WHERE FIND_IN_SET(?, v.categories) > 0
    `;
    params = [category];
  }

  db.query(sql, params, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(result);
  });
});
// Add venue with categories
app.post("/vendor/venue", upload.single("photo"), (req, res) => {
  const { vendor_id, name, info, rate, capacity, location } = req.body;
  const photo = req.file ? req.file.filename : null;

  const categories = Array.isArray(req.body.categories) ? req.body.categories : [];
  const categoriesString = categories.join(',');

  const sql = `
    INSERT INTO venues (vendor_id, name, info, rate, photo, capacity, location, categories)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [vendor_id, name, info, rate, photo, capacity, location, categoriesString],
    (err, result) => {
      if (err) return res.status(500).json({ error: "Error adding venue" });
      const venueId = result.insertId; // ✅
      res.json({
        message: "Venue added successfully!",
        id: venueId // ✅
      });
    }
  );
});

// Update venue with categories
app.put("/vendor/venue/:id", upload.single("photo"), (req, res) => {
  const venueId = req.params.id;
  const { vendor_id, name, info, rate, capacity, location } = req.body;
  const photo = req.file ? req.file.filename : null;

  const categories = Array.isArray(req.body.categories) ? req.body.categories : [];
  const categoriesString = categories.join(',');

  db.query(
    "SELECT * FROM venues WHERE id = ? AND vendor_id = ?",
    [venueId, vendor_id],
    (err, result) => {
      if (err || result.length === 0)
        return res.status(403).json({ error: "Unauthorized or not found." });

      let sql, values;
      if (photo) {
        sql =
          "UPDATE venues SET name=?, info=?, rate=?, capacity=?, location=?, photo=?, categories=? WHERE id=?";
        values = [name, info, rate, capacity, location, photo, categoriesString, venueId];
      } else {
        sql =
          "UPDATE venues SET name=?, info=?, rate=?, capacity=?, location=?, categories=? WHERE id=?";
        values = [name, info, rate, capacity, location, categoriesString, venueId];
      }

      db.query(sql, values, (err) => {
        if (err) return res.status(500).json({ error: err });
        res.json({ message: "Venue updated successfully!" });
      });
    }
  );
});


// Add additional photos to a venue
// Add this to your server.js
// Update the additional photos endpoint
app.post("/venue/:id/additional-photos", upload.array("additionalPhotos", 10), (req, res) => {
  const venueId = req.params.id; // Get venueId from URL params
  const { vendor_id } = req.body; // Get vendor_id from request body

  if (!vendor_id) {
    return res.status(401).json({ error: "Vendor authentication required" });
  }

  // Verify venue belongs to vendor
  db.query(
    "SELECT 1 FROM venues WHERE id = ? AND vendor_id = ?",
    [venueId, vendor_id],
    (err, result) => {
      if (err) return res.status(500).json({ error: "Database error" });
      if (result.length === 0) {
        return res.status(403).json({ error: "Unauthorized or venue not found" });
      }

      // Process photos upload
      const photos = req.files ? req.files.map(file => file.filename) : [];

      if (photos.length === 0) {
        return res.status(400).json({ error: "No photos provided" });
      }

      const sql = "INSERT INTO venue_additional_photos (venue_id, image_path) VALUES ?";
      const values = photos.map(photo => [venueId, photo]);

      db.query(sql, [values], (err) => {
        if (err) {
          // Clean up uploaded files if DB operation fails
          req.files.forEach(file => {
            fs.unlinkSync(file.path);
          });
          return res.status(500).json({ error: "Error adding photos" });
        }
        res.json({
          message: "Photos added successfully",
          count: photos.length,
          photos: photos.map((photo, index) => ({
            id: index + 1, // Temporary ID for frontend reference
            image_path: photo
          }))
        });
      });
    }
  );
});
// Get additional photos for a venue
app.get("/venue/:id/additional-photos", (req, res) => {
  const sql = "SELECT id, image_path FROM venue_additional_photos WHERE venue_id = ?";
  db.query(sql, [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.json(result);
  });
});

// Delete an additional photo
app.delete("/venue/additional-photo/:id", (req, res) => {
  const { vendor_id } = req.body;

  // Verify the photo belongs to a venue owned by this vendor
  const verifySql = `
    SELECT 1 FROM venues v
    JOIN venue_additional_photos vap ON v.id = vap.venue_id
    WHERE vap.id = ? AND v.vendor_id = ?
  `;

  db.query(verifySql, [req.params.id, vendor_id], (err, result) => {
    if (err || result.length === 0) {
      return res.status(403).json({ error: "Unauthorized or not found" });
    }

    const deleteSql = "DELETE FROM venue_additional_photos WHERE id = ?";
    db.query(deleteSql, [req.params.id], (err) => {
      if (err) return res.status(500).json({ error: err });
      res.json({ message: "Photo deleted successfully" });
    });
  });
});


// Get venues for a vendor (include categories)
app.get("/vendor/venues/:vendorId", (req, res) => {
  const sql = "SELECT * FROM venues WHERE vendor_id = ?";
  db.query(sql, [req.params.vendorId], (err, result) => {
    if (err) return res.status(500).json({ error: err });

    // Parse categories string into array for each venue
    const venuesWithCategories = result.map(venue => ({
      ...venue,
      categories: venue.categories ? venue.categories.split(',').map(Number) : []
    }));

    res.json(venuesWithCategories);
  });
});

// Delete venue
app.delete("/vendor/venue/:id", (req, res) => {
  const venueId = req.params.id;
  const { vendor_id } = req.body;

  db.query(
    "DELETE FROM venues WHERE id = ? AND vendor_id = ?",
    [venueId, vendor_id],
    (err, result) => {
      if (err || result.affectedRows === 0)
        return res
          .status(403)
          .json({ error: "Unauthorized: Venue not found or not yours." });

      res.json({ message: "Venue deleted successfully!" });
    }
  );
});

// Get all categories
app.get("/categories", (req, res) => {
  const sql = "SELECT * FROM categories";
  db.query(sql, (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.json(result);
  });
});

// GET /categories/:id
// app.get("/categories/:id", (req, res) => {
//   const categoryId = req.params.id;
//   const sql = "SELECT name FROM categories WHERE id = ?";

//   db.query(sql, [categoryId], (err, result) => {
//     if (err) return res.status(500).json({ error: err });
//     if (result.length === 0) return res.status(404).json({ error: "Category not found" });

//     res.json({ name: result[0].name });
//   });
// });


// ---------------- USER PROFILE ----------------

// Get user by ID
app.get('/api/users/:id', (req, res) => {
  const { id } = req.params;
  const sql = "SELECT id, name, email, address, mobile FROM users WHERE id = ?";
  db.query(sql, [id], (err, result) => {
    if (err) return res.status(500).json({ error: "Internal Server Error" });
    if (result.length === 0) return res.status(404).json({ error: "User not found" });
    res.json(result[0]);
  });
});

// Update user info
app.put('/api/users/:id', (req, res) => {
  const { id } = req.params;
  const { name, email, address, mobile } = req.body;
  db.query('UPDATE users SET name = ?, email = ?, address = ?, mobile = ? WHERE id = ?', [name, email, address, mobile, id], (err) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json({ message: 'User updated successfully' });
  });
});

// Update password
app.put('/api/users/:id/password', async (req, res) => {
  const { id } = req.params;
  const { oldPassword, newPassword } = req.body;

  db.query('SELECT password FROM users WHERE id = ?', [id], async (err, result) => {
    if (err || result.length === 0) return res.status(400).json({ error: 'User not found' });

    const match = await bcrypt.compare(oldPassword, result[0].password);
    if (!match) return res.status(401).json({ error: 'Old password is incorrect' });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    db.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, id], (err2) => {
      if (err2) return res.status(500).json({ error: 'Error updating password' });
      res.json({ message: 'Password updated successfully' });
    });
  });
});

app.get('/api/venues/:id', (req, res) => {
  const { id } = req.params;
  db.query('SELECT * FROM venues WHERE id = ?', [id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.length === 0) return res.status(404).json({ error: 'Venue not found' });
    res.json(result[0]);
  });
});

app.get('/api/vendors/:id', (req, res) => {
  const { id } = req.params;
  db.query('SELECT id, name FROM vendors WHERE id = ?', [id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.length === 0) return res.status(404).json({ error: 'Vendor not found' });
    res.json(result[0]);
  });
});

// Check venue availability
app.get('/api/venues/:id/availability', (req, res) => {
  const { id } = req.params;
  const { date } = req.query;

  if (!date) {
    return res.status(400).json({ error: "Date parameter is required" });
  }

  const sql = `
      SELECT 1 FROM bookings 
      WHERE venue_id = ? AND booking_date = ? AND status != 'cancelled'
    `;

  db.query(sql, [id, date], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ available: result.length === 0 });
  });
});

// Create a booking
// In your server.js (backend)
app.post('/api/bookings', (req, res) => {
  const {
    user_id,
    venue_id,
    booking_date,
    booking_time,
    people,
    message
  } = req.body;

  // First check availability
  const checkSql = `
    SELECT 1 FROM bookings 
    WHERE venue_id = ? AND booking_date = ? AND status != 'cancelled'
  `;

  db.query(checkSql, [venue_id, booking_date], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });

    if (result.length > 0) {
      return res.status(400).json({ error: "Venue already booked for this date" });
    }

    // Get venue rate first
    const venueSql = 'SELECT rate FROM venues WHERE id = ?';
    db.query(venueSql, [venue_id], (err, venueResult) => {
      if (err) return res.status(500).json({ error: err.message });
      if (venueResult.length === 0) return res.status(404).json({ error: "Venue not found" });

      const venueRate = venueResult[0].rate;

      // Create booking with venue rate
      const insertSql = `
        INSERT INTO bookings 
        (user_id, venue_id, booking_date, booking_time, people, message, amount)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;

      db.query(
        insertSql,
        [user_id, venue_id, booking_date, booking_time, people, message, venueRate],
        (err, result) => {
          if (err) return res.status(500).json({ error: err.message });
          res.json({
            message: "Booking created successfully",
            bookingId: result.insertId,
            amount: venueRate
          });
        }
      );
    });
  });
});
// Get bookings for a user
app.get('/api/users/:id/bookings', (req, res) => {
  const { id } = req.params;

  const sql = `
      SELECT b.*, v.name as venue_name, v.photo as venue_photo
      FROM bookings b
      JOIN venues v ON b.venue_id = v.id
      WHERE b.user_id = ?
      ORDER BY b.booking_date DESC
    `;

  db.query(sql, [id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(result);
  });
});

// Get bookings for a vendor
app.get('/api/vendors/:id/bookings', (req, res) => {
  const { id } = req.params;

  const sql = `
      SELECT b.*, v.name as venue_name, u.name as user_name, u.email as user_email
      FROM bookings b
      JOIN venues v ON b.venue_id = v.id
      JOIN users u ON b.user_id = u.id
      WHERE v.vendor_id = ?
      ORDER BY b.booking_date DESC
    `;

  db.query(sql, [id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(result);
  });
});





// // Add this to get payment details
// app.get('/api/payments/:id', (req, res) => {
//   const paymentId = req.params.id;
//   const sql = `
//     SELECT p.*, b.booking_date, b.booking_time, v.name as venue_name
//     FROM payments p
//     JOIN bookings b ON p.booking_id = b.id
//     JOIN venues v ON b.venue_id = v.id
//     WHERE p.id = ?
//   `;

//   db.query(sql, [paymentId], (err, result) => {
//     if (err) return res.status(500).json({ error: err.message });
//     if (result.length === 0) return res.status(404).json({ error: 'Payment not found' });
//     res.json(result[0]);
//   });
// });



app.get('/api/bookings/user/:userId', (req, res) => {
  console.log("Fetching bookings for user:", req.params.userId);
  const { userId } = req.params;
  const sql = `
      SELECT b.*, v.name AS venue_name, v.photo AS venue_photo, v.location AS venue_location 
      FROM bookings b 
      JOIN venues v ON b.venue_id = v.id 
      WHERE b.user_id = ?
      ORDER BY b.booking_date DESC
    `;

  db.query(sql, [userId], (err, result) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: 'Database error' });
    }
    console.log("Query result:", result);
    res.json(result);
  });
});
// Update your server endpoint


// In your server.js or routes file
app.get('/api/vendors/:id/bookings-details', (req, res) => {
  const { id } = req.params;

  const bookingsSql = `
    SELECT 
      b.*, 
      v.name as venue_name, 
      v.rate as venue_rate,
      u.name as user_name, 
      u.email as user_email,
      u.mobile as user_phone,
      u.address as user_address,
      p.transaction_id,
      p.payment_method,
      p.status as payment_status,
      p.created_at as payment_date
    FROM bookings b
    JOIN venues v ON b.venue_id = v.id
    JOIN users u ON b.user_id = u.id
    LEFT JOIN payments p ON b.id = p.booking_id
    WHERE v.vendor_id = ?
    ORDER BY b.booking_date DESC
  `;

  const incomeSql = `
    SELECT COALESCE(SUM(v.rate), 0) as total_income
    FROM bookings b
    JOIN venues v ON b.venue_id = v.id
    WHERE v.vendor_id = ? AND b.status = 'paid'
  `;

  db.query(bookingsSql, [id], (err, bookings) => {
    if (err) return res.status(500).json({ error: err.message });

    db.query(incomeSql, [id], (err, incomeResult) => {
      if (err) return res.status(500).json({ error: err.message });

      res.json({
        bookings,
        totalIncome: incomeResult[0].total_income
      });
    });
  });
});

// Update the payment endpoint to match what your frontend is sending
app.post('/api/payments', async (req, res) => {
  console.log('Received payment request:', req.body);

  const { bookingId, amount, paymentDetails, userId } = req.body;

  try {
    // Validate required fields
    if (!bookingId || !amount || !paymentDetails || !userId) {
      console.error('Missing required fields');
      return res.status(400).json({
        error: 'Missing required fields',
        details: {
          bookingId: !!bookingId,
          amount: !!amount,
          paymentDetails: !!paymentDetails,
          userId: !!userId
        }
      });
    }

    // Validate payment details
    if (!paymentDetails.method) {
      return res.status(400).json({ error: 'Payment method is required' });
    }

    const transactionId = `txn_${Date.now()}`;
    const paymentMethod = paymentDetails.method;

    let cardLast4 = null;
    let cardExpiry = null;
    let cardName = null;
    let upiId = null;

    if (paymentMethod === 'card') {
      if (!paymentDetails.cardNumber || !paymentDetails.expiry || !paymentDetails.name) {
        return res.status(400).json({ error: 'Card details incomplete' });
      }
      cardLast4 = paymentDetails.cardNumber.replace(/\s/g, '').slice(-4);
      cardExpiry = paymentDetails.expiry;
      cardName = paymentDetails.name;
    } else if (paymentMethod === 'upi') {
      if (!paymentDetails.upiId) {
        return res.status(400).json({ error: 'UPI ID is required' });
      }
      upiId = paymentDetails.upiId;
    }

    // First verify the booking exists and belongs to this user
    db.query(
      'SELECT id FROM bookings WHERE id = ? AND user_id = ?',
      [bookingId, userId],
      (err, bookingResult) => {
        if (err) {
          console.error('Booking verification error:', err);
          return res.status(500).json({ error: 'Error verifying booking' });
        }

        if (bookingResult.length === 0) {
          return res.status(404).json({ error: 'Booking not found or unauthorized' });
        }

        // Process payment
        const paymentSql = `
          INSERT INTO payments 
          (booking_id, user_id, amount, payment_method, transaction_id, status, 
           card_last4, card_expiry, card_name, upi_id)
          VALUES (?, ?, ?, ?, ?, 'completed', ?, ?, ?, ?)
        `;

        db.query(
          paymentSql,
          [
            bookingId,
            userId,
            amount,
            paymentMethod,
            transactionId,
            cardLast4,
            cardExpiry,
            cardName,
            upiId
          ],
          (err, result) => {
            if (err) {
              console.error('Payment insertion error:', err);
              return res.status(500).json({
                error: 'Payment processing failed',
                sqlError: err.message
              });
            }

            // Update booking status
            db.query(
              'UPDATE bookings SET status = "paid" WHERE id = ?',
              [bookingId],
              (err) => {
                if (err) {
                  console.error('Booking update error:', err);
                  return res.status(500).json({
                    error: 'Failed to update booking',
                    sqlError: err.message
                  });
                }

                console.log('Payment processed successfully');
                res.json({
                  success: true,
                  transactionId,
                  paymentId: result.insertId,
                  message: 'Payment processed successfully'
                });
              }
            );
          }
        );
      }
    );
  } catch (err) {
    console.error('Unexpected payment processing error:', err);
    res.status(500).json({
      error: 'Server error during payment processing',
      details: err.message
    });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
