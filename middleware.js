const User = require("./models/User");

module.exports.isLoggedin = ((req, res, next) => {
    console.log(req.user);
    req.session.redirectUrl = req.originalUrl;
    if (!req.isAuthenticated()) {
        req.flash("error", "You must be logged in to create a new listing");
        return res.redirect("/login"); // Use `return` to stop execution here
    }
    next();
});

module.exports.saveRedirecturl = ((req, res, next) => {
    if (req.session.redirectUrl) {
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
})