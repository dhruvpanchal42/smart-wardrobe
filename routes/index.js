const express = require("express");
const router = express.Router();
const flash = require("flash")
const isLoggedIn = require('../middlewares/isLoggedIn')
const UserCloth = require('../models/userclothmodel');


router.get("/", (req, res) => {
    const messages = {
        error: req.flash("error"),
        success: req.flash("success"),
    };
    res.render("index",{messages});
});

router.get("/intro",isLoggedIn, (req, res) => {
    const messages = {
        error: req.flash("error"),
        success: req.flash("success"),
    };
    res.render("intro",{messages});
});



    
  


module.exports = router;