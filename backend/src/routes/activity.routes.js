const router = require("express").Router();
const c = require("../controllers/activity.controller");
const { verifyToken } = require("../middleware/auth");

router.get("/activity", verifyToken, c.list);
router.get("/activity/:id", verifyToken, c.detail);

module.exports = router;
