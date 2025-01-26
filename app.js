const express = require("express");
const app = express();
const mongoose = require("mongoose");
const listing = require("./models/listing.js");
const path = require("path");
const ejsMate = require("ejs-mate");
const ejs = require("ejs");
app.set("view engine", "ejs");
const wrapAsync = require("./utils/wrapAsync.js");
// const Joi = require('joi');
const { listingschema } = require("./schema.js");
const Review = require("./models/reviews.js");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const Localstrategy = require("passport-local");
const User = require("./models/User.js");
const { isLoggedin, saveRedirecturl } = require("./middleware.js");

const Listing = require("./models/listing.js");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
const methodoverride = require("method-override");
app.use(methodoverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "public")));

Mongo_url = "mongodb://127.0.0.1:27017/wanderlust";
main()
    .then(() => {
        console.log("Connect to DB");
    })
    .catch((err) => {
        console.log(err);
    });

async function main() {
    mongoose.connect(Mongo_url);
}

const sessionOptions = {
    secret: "mysupersecretcode",
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
    },
};
app.use(session(sessionOptions));
app.use(flash());
//flash middleware





app.use(passport.initialize());
app.use(passport.session());
passport.use(new Localstrategy(User.authenticate()));
app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    console.log("Current user:", req.user);

    res.locals.currentuser = req.user;

    next();
});

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.get("/", (req, res) => {
    res.send("Hi!! I am root");
});
//demo user

// app.get("/demo", async (req, res) => {
//     let fakeUser = new User({
//         email: "ab@gmail.com",
//         username: "Userfake",
//     });
//     let registeredUser = await User.register(fakeUser, "123hello");
//     res.send(registeredUser);
// });

//index route
app.get("/listings", async (req, res) => {
    const allListings = await listing.find({});
    res.render("listings/index.ejs", { allListings });
});
// New route for creating listings
app.get("/listings/new", isLoggedin, (req, res) => {

    res.render("listings/newListing.ejs"); // Only runs if the user is authenticated
});

//show route
app.get("/listings/:id", async (req, res) => {
    let { id } = req.params;
    const listingData = await listing.findById(id).populate("reviews").populate("owner");
    console.log(listingData);
    res.render("listings/show.ejs", { listingData });
});
//create route
app.post("/listings", isLoggedin, async (req, res, next) => {
    listingschema.validate(req.body);

    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    await newListing.save();
    console.log(newListing);
    req.flash("success", "New Listing created");
    res.redirect("/listings");
});
//edit route
app.get("/listings/:id/edit", isLoggedin, async (req, res) => {
    let { id } = req.params;
    const listingData = await listing.findById(id);
    res.render("listings/edit.ejs", { listingData });
});
//update route
app.put("/listings/:id", isLoggedin, async (req, res) => {
    let { id } = req.params;
    await listing.findByIdAndUpdate(id, { ...req.body.listing });

    res.redirect(`/listings/${id}`);
});

//delete route
app.delete("/listings/:id", isLoggedin, async (req, res) => {
    let { id } = req.params;
    let deletedlist = await listing.findByIdAndDelete(id);
    console.log(deletedlist);
    res.redirect("/listings");
});

//reviews
//post route
// app.post("/listings/:id/review",async(req,res)=>{
//    let listing= await listing.findById(req.body.params);
//    let newreview=new Review(req.body.review);
//     listing.reviews.push(newreview);

//     await newreview.save();
//     await listing.save();

//     res.send("new review saved");

// })
app.post("/listings/:id/review", async (req, res) => {
    try {
        // Use Listing model to find listing by ID
        let listing = await Listing.findById(req.params.id);
        if (!listing) return res.status(404).send("Listing not found");

        // Create a new review and push to listing's reviews array
        let newreview = new Review(req.body.review);
        listing.reviews.push(newreview);

        // Save the new review and update listing
        await newreview.save();
        await listing.save();

        //    res.send("New review saved");
        res.redirect(`/listings/${listing._id}`);
    } catch (error) {
        console.error(error);
        res.status(500).send("An error occurred while saving the review");
    }
});
//delete route review
app.delete("/listings/:id/review/:reviewId", async (req, res) => {
    let { id, reviewId } = req.params;
    await Listing.findByIdAndUpdate(id, { $pull: { review: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/listings/${id}`);
});

// app.get("/testlisting",async(req,res)=>{
//     let sampleListing= await new listing({
//         title:"My new villa",
//         description:"By the beach",
//         price:1200,
//         location:"Goa",
//         country:"India"
//     })
//     sampleListing.save();
//     console.log(sampleListing);
//     res.send("Testing succesful");
// });
// app.all("*",(req,res,next)=>{
//     next(new ExpressError(404,"Page not found"));
// });
// app.use((err,req,res,next)=>{
//     let{statuscode=500,message="Something went wrong!"}=err;
//     res.render("error.ejs");
//     // res.status(statuscode).send(message);
// })
//------------user signup signin forms--------
app.get("/signup", (req, res) => {
    res.render("users/signup.ejs");
});

app.post("/signup", async (req, res, next) => {
    try {
        const { username, email, password } = req.body;
        const newUser = new User({ email, username });

        // Attempt to register the user
        let registeredUser = await User.register(newUser, password);

        // Log in the user after successful registration
        req.logIn(registeredUser, (err) => {
            if (err) {
                return next(err); // Pass error to Express error handler
            }
            req.flash("success", "Welcome");
            return res.redirect("/listings");
        });
    } catch (err) {
        // Handle duplicate username error
        if (err.name === "UserExistsError") {
            req.flash("error", "A user with that username already exists.");
            return res.redirect("/signup");
        }
        next(err); // Pass other errors to Express error handler
    }
});


app.get("/login", (req, res) => {
    res.render("users/login.ejs");
});
app.post("/login", saveRedirecturl, passport.authenticate("local", { failureRedirect: '/login', failureFlash: true }), async (req, res) => {
    req.flash("success", "Welcome to Wanderlust");
    let redirectUrl = res.locals.redirectUrl || "/listings";
    res.redirect(redirectUrl);
    // res.send("Welcome to wanderlust");

});

app.get("/logout", (req, res, next) => {
    req.logOut((err) => {
        if (err) {
            return next();
        }
        req.flash("success", "logged out successfully");
        res.redirect("/listings");
    })
})
// app.post("/login", (req, res) => {
//     res.send("Login");
// })
app.listen(8000, (req, res) => {
    console.log("App is listening on port 8000");
});
