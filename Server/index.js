import express from "express";
import mysql from "mysql";
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
const port = 5000;

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "root",
  database: "jobs",
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

    const token = jwt.sign({ id: user.id }, "secretkey", { expiresIn: "1h" });
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

        res.json({ message: "Login successful", token, vendorId: vendor.id });
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
      (err) => {
        if (err) return res.status(500).json({ error: "Error adding venue" });
        res.json({ message: "Venue added successfully!" });
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
  // Get venues for a vendor (include categories)
  app.get("/vendor/venues/:vendorId", (req, res) => {
    const sql = "SELECT * FROM venues WHERE vendor_id = ?";
    db.query(sql, [req.params.vendorId], (err, result) => {
      if (err) return res.status(500).json({ error: err });


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

  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
