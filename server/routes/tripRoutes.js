const router = require('express').Router();
const authMiddleware = require("../middleware/authMiddleware");

const {
    createTrip,
    getTrips,
    getTripById,
    getTripMembers,
    joinTrip} = require("../controllers/tripController");

router.post("/", authMiddleware, createTrip);
router.get("/", authMiddleware, getTrips);
router.get("/:id/members", authMiddleware, getTripMembers);
router.get("/:id", authMiddleware, getTripById);
router.post("/join/:id", authMiddleware, joinTrip);

module.exports = router;