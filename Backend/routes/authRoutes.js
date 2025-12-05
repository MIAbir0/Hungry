const router = require("express").Router();
const auth = require("../controllers/authController");

router.post("/signup", auth.signup);
router.post("/login", auth.login);
router.get("/logout", auth.logout);
router.get("/profile", auth.getProfile);
router.put("/profile", auth.updateProfile);

module.exports = router;
