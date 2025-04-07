const { Router } = require("express");
const UserController = require("../controllers/UserController");
const authMiddleware = require("../middlewares/authMiddleware");
const router = Router();

router.post("/create", UserController.store);
router.post("/login", UserController.login);

router.use(authMiddleware);

router.get("/list", UserController.index);
router.get("/:id", UserController.show);
router.put("/:id", UserController.update);
router.delete("/:id", UserController.destroy);

module.exports = router;
