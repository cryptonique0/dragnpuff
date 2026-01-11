const express = require("express");
const router = express.Router();
const rolesController = require("../controllers/rolesController");

/**
 * House Roles & Loadouts Routes
 */

// Get available roles
router.get("/available", rolesController.getAvailableRoles);

// Get role stats
router.get("/stats", rolesController.getRoleStats);

// Get DragN role
router.get("/dragn/:tokenId", rolesController.getDragNRole);

// Get user loadout
router.get("/user/:userId", rolesController.getUserLoadout);

// Assign role to DragN
router.post("/assign", rolesController.assignRole);

// Update user loadout
router.post("/user/:userId/loadout", rolesController.updateLoadout);

module.exports = router;
