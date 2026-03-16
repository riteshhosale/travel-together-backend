const router = require("express").Router()

const {
tripPlan,
luggage
} = require("../controllers/aiController")

router.post("/trip-plan",tripPlan)

router.post("/luggage",luggage)

module.exports = router