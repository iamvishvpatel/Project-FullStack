const express = require("express");
const router = express.Router({mergeParams: true}); 
const Review = require("../models/review.js");
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const {validateReview, isLoggedIn, isReviewAuthor} = require("../middleware.js")

const reviewController = require("../controllers/review.js")
//post reviews route
router.post("/", isLoggedIn, validateReview, wrapAsync(reviewController.createReview));

//delete Review routes
router.delete("/:reviewid", isLoggedIn, isReviewAuthor, wrapAsync(reviewController.destroyReview));

module.exports = router;