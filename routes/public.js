const express = require('express');
const path = require("path");
//const fs = require("fs").promises;

const router = express.Router();

// endpoint: /
const publicPath = path.resolve("./public");
;

/*
//debug middleware router
router.use(async (req, res, next) => {
  console.log(publicPath);
  const files = await fs.readdir(publicPath + "/avatars");
  console.log(files);
  next();
})
*/

router.use('/', express.static(publicPath));

module.exports = router;