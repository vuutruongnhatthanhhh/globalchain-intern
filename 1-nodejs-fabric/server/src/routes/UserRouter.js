const express = require("express");
const router  = express.Router()
const userController = require('../controllers/UserController');
const { authMiddleware, authUserMiddleware } = require("../middleware/authMiddleware");

// Thiết kế theo mô hình MVC thì router sẽ gọi qua controller
router.post('/sign-up', userController.createUser )
router.post('/create-product-blockchain', userController.createProduct )

router.post('/checkemail', userController.checkEmail )
router.post('/sign-in', userController.loginUser )
router.post('/log-out', userController.logoutUser )
router.put('/update-user/:id', userController.updateUser )
// Có 1 bước xác thực authMiddleware để xem có phải admin hay không
router.delete('/delete-user/:id', userController.deleteUser )

router.get('/getAll', userController.getAllUser )
router.get('/getAllProduct-blockchain', userController.getAllProduct )


// admin thì lấy được tất cả user, user lấy được của chính nó
router.get('/get-details/:id', userController.getDetailsUser )
router.get('/get-details-blockchain/:id', userController.getDetailsUserBlockchain )

router.post('/refresh-token', userController.refreshToken )
router.post('/delete-many',authMiddleware, userController.deleteMany )

module.exports = router