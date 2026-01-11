/**
 * DragNPuff API Server
 * Express.js REST API for blockchain interactions
 */

const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
const port = process.env.API_PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Request logging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Routes
app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/nft", require("./routes/nft.routes"));
app.use("/api/token", require("./routes/token.routes"));
app.use("/api/marketplace", require("./routes/marketplace.routes"));
app.use("/api/staking", require("./routes/staking.routes"));
app.use("/api/governance", require("./routes/governance.routes"));
app.use("/api/user", require("./routes/user.routes"));
app.use("/api/seasons", require("./routes/season.routes"));
app.use("/api/roles", require("./routes/roles.routes"));
@@app.use("/api/infusions", require("./routes/infusions.routes"));

// Error handling
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({
    success: false,
    message: err.message,
    error: process.env.NODE_ENV === "development" ? err : {},
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Not Found",
  });
});

// Start server
app.listen(port, () => {
  console.log(`🚀 DragNPuff API running on port ${port}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || "development"}`);
});

module.exports = app;
