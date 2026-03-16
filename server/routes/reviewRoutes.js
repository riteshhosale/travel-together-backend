const router = require("express").Router()

const auth = require("../middleware/authMiddleware")

const {
createReview,
getReviews
} = require("../controllers/reviewController")

router.post("/",auth,createReview)

router.get("/:tripId",getReviews)

module.exports = router