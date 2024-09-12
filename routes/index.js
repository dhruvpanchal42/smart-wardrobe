const express = require("express");
const router = express.Router();
const flash = require("flash")


router.get("/", (req, res) => {
    
    res.render("index");
});

router.get("/intro", (req, res) => {
    res.render("intro");
});

module.exports = router;