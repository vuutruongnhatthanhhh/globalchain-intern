const express = require("express");
const router  = express.Router()
const OrderController = require('../controllers/OrderController');
const { authUserMiddleware } = require("../middleware/authMiddleware");

router.post('/create', OrderController.createOrder )
router.get('/get-all-order/:id', OrderController.getAllOrderDetails )
router.get('/get-details-order/:id', OrderController.getDetailsOrder )
router.delete('/cancel-order/:id', OrderController.cancelOrder )
router.get('/get-all-order', OrderController.getAllOrder )


module.exports = router