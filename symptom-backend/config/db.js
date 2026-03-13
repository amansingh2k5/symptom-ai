/**
 * config/db.js — MongoDB connection (optional standalone module)
 * server.js already calls mongoose.connect(), so this file
 * exists if you ever want to import db logic separately.
 */

const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ DB Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
