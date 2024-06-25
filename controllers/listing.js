const Listing = require("../models/listing");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

module.exports.index = async (req, res) => {
    const allListings = await Listing.find({});
    
    // const onlyprice = await Listing.find(req.query);
    // console.log(req.query);
    // console.log(onlyprice);
    // let trending = req.query
    // console.log(trending);
    // const allListings = await Listing.find(trending)
    // // console.log(allListings);
    
    res.render("listings/index.ejs", {allListings});

};

module.exports.renderNewForm = (req,res)=>{
    
    res.render("listings/new.ejs");
    
};

module.exports.showListing = async (req, res)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id)
    .populate({
        path: 'reviews', 
        populate: {
            path: 'author',
        }
    })
    .populate('owner');
    if(!listing){
        req.flash("error", "Listing you requested for does not exist!")
        res.redirect("/listings");
    }
    // console.log(listing);    
    res.render("listings/show.ejs", {listing});
};

module.exports.createListing = async (req, res, next)=>{
    // let {title, description, image, price, location, coutry} = req.body

    // 1st way to Hnadle SChema Validation
    // if(!req.body.listing){
    //     throw new ExpressError(400, "send valid data for listind")
    // }
    // 2nd way to Hnadle SChema Validation
    // let result =  listingSchema.validate(req.body);
    // // console.log(result);
    // if(result.error){
    //     throw new ExpressError(400, result.error);
    // }

    let response = await geocodingClient.forwardGeocode({
        query: req.body.listing.location,
        limit: 1
      })
        .send();

    let url = req.file.path;
    let filename = req.file.filename;
    // console.log(url, "..", filename);
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = {url, filename};
    newListing.geometry = response.body.features[0].geometry;
    let saveListing = await newListing.save();
    // console.log(saveListing);
    req.flash("success", "New Listing Created!");
    res.redirect("/listings");

};

module.exports.renderEditForm = async (req, res)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id);
    if(!listing){
        req.flash("error", "Listing you requested for does not exist!")
        res.redirect("/listings");
    }
    res.render("listings/edit.ejs", {listing})
};

module.exports.updateListing = async (req, res)=>{
    // if(!req.body.listing){
    //     throw new ExpressError(400, "send valid data for listind")
    // }
    let {id} = req.params;
    let listing = await Listing.findByIdAndUpdate(id, {...req.body.listing });

   if(typeof req.file != "undefined"){
    let url = req.file.path;
    let filename = req.file.filename;
    listing.image = {url, filename};
    await listing.save();
   }

    req.flash("success", "Listing Updated!");
    res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async(req, res)=>{
    let {id} = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    // console.log(deletedListing);
    req.flash("success", "Listing Deleted!")
    res.redirect("/listings");

};