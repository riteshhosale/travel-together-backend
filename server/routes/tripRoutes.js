const router = require('express').Router();
const authMiddleware = require("../middleware/authMiddleware");

const {
    createTrip,
    getTrips,
    joinTrip} = require("../controllers/tripController");

router.post("/", authMiddleware, createTrip);
router.get("/", authMiddleware, getTrips);
router.post("/join/:id", authMiddleware, joinTrip);

module.exports = router;