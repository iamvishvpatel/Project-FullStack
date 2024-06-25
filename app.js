
if(process.env.NODE_ENV != 'production'){
    require('dotenv').config()
}

const express = require("express");
const app = express();
const mongoose = require('mongoose');
const path = require("path");
const methodOverride = require("method-override")
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const MongoStore = require('connect-mongo');
const flash = require("connect-flash");
const Passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");
//dburl
const dbUrl = process.env.ALTASDB_URL;

const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto: {
        secret: process.env.SECRET
    },
    touchAfter: 24*3600,
});

const sessionOptions = {
    store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
    },
}
store.on("error", ()=>{
    console.log("ERROR in MONGO SESSION STORE", err);
})

app.use(session(sessionOptions));
app.use(flash())

app.use(Passport.initialize());
app.use(Passport.session());
// passport+ passport-local + model.authenticate 
Passport.use(new LocalStrategy(User.authenticate()));

Passport.serializeUser(User.serializeUser());
Passport.deserializeUser(User.deserializeUser());

app.use((req, res, next)=>{
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    // console.log(res.locals.success)
    next();
})
//authentication-passport
// app.get("/demoUsers", async(req, res)=>{
//     let fakeUser = new User({
//         email: "students@gmail.com",
//         username: 'delta-student',
//     });

//     let registredUser = await User.register(fakeUser, "helloworld");
//     res.send(registredUser);

// })

const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");
const passport = require("passport");
const { log } = require('console');

main()
    .then((res)=>{
        console.log("connected to DB");
    })
    .catch(err => console.log(err));

async function main() {
  await mongoose.connect(dbUrl);
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

// app.get("/", (req, res)=>{
//     res.send("i'm root");
// });
app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter)
app.use("/", userRouter)

app.all("*", (req, res, next)=>{
    next(new ExpressError(404, "Page Not Found!"))
})
//middleware
app.use((err, req, res, next)=>{
    let {status=500, message="Something Went Wrond!"} = err;
    res.status(status).render("listings/error.ejs", {message})
    // res.status(status).send(message);
    // res.send("something went wrong")
})













// app.get("/testListing", async (req, res)=>{
//     let sampleListing = new Listing({
//         title: "My New Villa",
//         description: "By the Beach", 
//         price: 1200,
//         location: "calangute, Goa",
//         country: "India"
//     })
//     await sampleListing.save();
//     console.log("sample was saved");
//     res.send("successful testing");
// });

app.listen("3000", ()=>{
    console.log("Server is listenin to port 8080");
})