const express = require("express");
const router = express.Router();


// @route  GET api/users
// @desc   test
// @access public

router.get("/", (req, res) => {
    res.send("Posts route")
})

module.exports = router