const express = require("express");
const router = express.Router();   
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const {listingSchema} = require("../schema.js");
const listings = require("../routes/listing.js");
const Listing = require("../models/listing.js");
const {isLoggedIn, isOwner, validateListing} = require("../middleware.js");
const multer  = require('multer');
//from cloudconfig
const {storage} = require("../cloudConfig.js");
const upload = multer({storage})

const listingController = require("../controllers/listing.js");


router
    .route("/")
    //index route
    .get(wrapAsync(listingController.index))
    //create route
    .post(isLoggedIn, upload.single('listing[image]'), validateListing, wrapAsync(listingController.createListing));

//new route
router.get("/new", isLoggedIn, listingController.renderNewForm);

router
    .route("/:id")  
    //show route
    .get(wrapAsync(listingController.showListing))
    //update route
    .put(isLoggedIn, isOwner, upload.single('listing[image]'), validateListing, wrapAsync(listingController.updateListing))
    //delete Route
    .delete(isLoggedIn, isOwner, wrapAsync(listingController.destroyListing));
    
//listing edit route
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(listingController.renderEditForm));

module.exports = router;