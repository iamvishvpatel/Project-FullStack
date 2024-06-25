const Listing = require("./models/listing");
const Review = require("./models/review");
const ExpressError = require("./utils/ExpressError.js");
const {listingSchema} = require("./schema.js");
const {reviewSchema} = require("./schema.js");



module.exports.isLoggedIn = (req, res, next)=>{
    if(!req.isAuthenticated()){
        
        req.session.redirectUrl = req.originalUrl;
        req.flash("error", "you must be logged in to create listing!");
         return res.redirect("/login")
    }
    next();
};

module.exports.saveRedirectUrl = (req, res, next)=>{
    if(req.session.redirectUrl){
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
}

module.exports.isOwner = async(req, res, next)=>{
    let {id} = req.params;
    let listing = await Listing.findById(id);
    if(!listing.owner.equals(res.locals.currUser._id)){
        req.flash("error", "You are not Owner of this Listing..!");
        return res.redirect(`/listings/${id}`);
    }
    next();

}

//Validate Listing Using Joi Middlewarw Function
module.exports.validateListing = (req, res, next)=>{
    let {error} = listingSchema.validate(req.body);
    // console.log(result.error.details);
    // console.log(error);
    if(error){
        let errMsg = error.details.map((el)=> el.message).join(",")
        // console.log(errMsg);
        throw new ExpressError(400, errMsg);
    }else{
        next();
    }
}

//validate Review
module.exports.validateReview = (req, res, next)=>{
    let {error} = reviewSchema.validate(req.body);
    // console.log(result.error.details);
    // console.log(error);
    if(error){
        let errMsg = error.details.map((el)=> el.message).join(",")
        // console.log(errMsg);
        throw new ExpressError(400, errMsg);
    }else{
        next();
    }
}

module.exports.isReviewAuthor = async(req, res, next)=>{
    let {id, reviewid} = req.params;
    let review = await Review.findById(reviewid);
    if(!review.author.equals(res.locals.currUser._id)){
        req.flash("error", "You are not Author of this Review..!");
        return res.redirect(`/listings/${id}`);
    }
    next();

}
