const { Router } = require("express");
const UserController = require("../controllers/UserController");
const authMiddleware = require("../middlewares/authMiddleware");
const router = Router();

router.post("/create", UserController.store);
router.post("/login", UserController.login);

router.use(authMiddleware);

router.post("/save", UserController.save);

module.exports = router;
