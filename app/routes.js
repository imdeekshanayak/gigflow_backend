module.exports = function (app) {
    require("./controllers/auth.controller")(app);
    require("./controllers/gig.controller")(app);
    require("./controllers/bid.controller")(app);
};
