const router = require("express").Router();
const order = require("../controllers/orderController");

router.post("/create", order.createOrder);
router.get("/my", order.myOrders);

module.exports = router;
