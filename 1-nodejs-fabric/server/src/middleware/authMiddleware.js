const jwt = require('jsonwebtoken')
const dotenv = require('dotenv')
dotenv.config()

const authMiddleware = (req, res,next) =>{
    // Lấy được cái token tài khoản khi delete
    // Chỉ admin mới được xóa các tài khoản khác

    // lấy cái token trong phần headers của TC, lấy ở vị trí thứ 2 sau chữ Beare, vị trí thứ nhất là [0]
    const token = req.headers.token.split(' ')[1]
    // kiểm tra token nhập vào headers trùng với cái access_token hiện tại
  jwt.verify(token,process.env.ACCESS_TOKEN, function(err, user){
    if(err){
        return res.status(404).json({
            message:'The authentication',
            status: 'ERROR'
        })
    }

  //  Nếu isAdmin trả về là true thì được thực hiện tiếp các bước tiếp theo
  // Nghĩa là cái access token trong header token Beare là admin thì dc xóa
   if(user?.isAdmin) {
    next()
   }else {
    return res.status(404).json({
      message:'The authentication',
      status: 'ERROR'
  })
   }
  });  
}


// Chỉ admin và chính tài khoản của user đó
const authUserMiddleware = (req, res,next) =>{
  // Lấy được cái token tài khoản khi delete
  // Chỉ admin mới được xóa các tài khoản khác

  // lấy cái token trong phần headers của TC (hoặc userService phía front end), lấy ở vị trí thứ 2 sau chữ Beare, vị trí thứ nhất là [0]
  const token = req.headers.token.split(' ')[1]
  const userId = req.params.id
jwt.verify(token,process.env.ACCESS_TOKEN, function(err, user){
  if(err){
      return res.status(404).json({
          message:'The authentication',
          status: 'ERROR'
      })
  }

//  Nếu là admin và là chính userId của tài khoản đó thì được đi tiếp
 if(user?.isAdmin || user?.id === userId) {
  next()
 }else {
  return res.status(404).json({
    message:'The authentication',
    status: 'ERROR'
})
 }
});  
}


module.exports = {
    authMiddleware,
    authUserMiddleware
}