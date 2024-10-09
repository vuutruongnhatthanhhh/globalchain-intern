const express = require("express");
const router  = express.Router()
const ProductController = require('../controllers/ProductController');
const { authMiddleware } = require("../middleware/authMiddleware");

// Thiết kế theo mô hình MVC thì router sẽ gọi qua controller
router.post('/create', ProductController.createProduct )
router.put('/update/:id',authMiddleware, ProductController.updateProduct )
router.get('/get-details/:id', ProductController.getDetailProduct )
router.delete('/delete/:id',authMiddleware, ProductController.deleteProduct )
router.get('/get-all', ProductController.getAllProduct )
// post là do mình nhận dữ liệu qua request.body
router.post('/delete-many',authMiddleware, ProductController.deleteManyProduct )
router.get('/get-all-type', ProductController.getAllType )


module.exports = router