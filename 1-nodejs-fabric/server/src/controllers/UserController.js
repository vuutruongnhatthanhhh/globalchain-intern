const UserService = require('../services/UserService')
const JwtService = require('../services/JwtService')
const User = require("../models/UserModel")
// Controller sẽ gọi qua service
const createUser = async(req, res) => {
    try{
        // Lấy ra những thuộc tính request sau khi send bằng TC
        // req.body mình có thể dùng console log in ra khi nhập thông tin từ json content vào, nó hiển thị ở cmd, hiển thị đầy đủ thuộc tính của user
        // const { email, password, confirmPassword, name, phone, isAdmin, isDoctor} = req.body
        // // Kiểm tra xem có phải email hay không (check sau khi nhấn send trong TC)
        // const reg = /^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/
        // const isCheckEmail = reg.test(email)

        // if( !email || !password || !confirmPassword ){
        //     return res.status(200).json({
        //         status: 'ERR',
        //         message: 'The input is required'

        //     })
        // } else if(!isCheckEmail){
        //     return res.status(200).json({
        //         status: 'ERR',
        //         message: 'The input is email'

        //     }) 
        // } else if (password !== confirmPassword){
        //     return res.status(200).json({
        //         status: 'ERR',
        //         message: 'The password and confirm password is not equal'

        //     }) 
        // }
    //   Nếu không dính các trường hợp trên thì đưa cái request qua bên service (req.body)
      const response =   await UserService.createUser(req.body)
        return res.status(200).json(response)
    } catch (e) {
        return res.status(404).json({
            message: e
        })
    }
}


const createProduct = async(req, res) => {
    try{
        // Lấy ra những thuộc tính request sau khi send bằng TC
        // req.body mình có thể dùng console log in ra khi nhập thông tin từ json content vào, nó hiển thị ở cmd, hiển thị đầy đủ thuộc tính của user
        // const { email, password, confirmPassword, name, phone, isAdmin, isDoctor} = req.body
        // // Kiểm tra xem có phải email hay không (check sau khi nhấn send trong TC)
        // const reg = /^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/
        // const isCheckEmail = reg.test(email)

        // if( !email || !password || !confirmPassword ){
        //     return res.status(200).json({
        //         status: 'ERR',
        //         message: 'The input is required'

        //     })
        // } else if(!isCheckEmail){
        //     return res.status(200).json({
        //         status: 'ERR',
        //         message: 'The input is email'

        //     }) 
        // } else if (password !== confirmPassword){
        //     return res.status(200).json({
        //         status: 'ERR',
        //         message: 'The password and confirm password is not equal'

        //     }) 
        // }
    //   Nếu không dính các trường hợp trên thì đưa cái request qua bên service (req.body)
      const response =   await UserService.createProduct(req.body)
        return res.status(200).json(response)
    } catch (e) {
        return res.status(404).json({
            message: e
        })
    }
}

const checkEmail = async(req, res) => {
    try{
        // Lấy ra những thuộc tính request sau khi send bằng TC
        // req.body mình có thể dùng console log in ra khi nhập thông tin từ json content vào, nó hiển thị ở cmd, hiển thị đầy đủ thuộc tính của user
        const { email} = req.body
       
            const reg = /^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/
            const isCheckEmail = reg.test(email)

        if(!isCheckEmail){
                return res.status(200).json({
                    status: 'ERR',
                    message: 'Không đúng định dạng Email'

                }) 
            } 
    //   Nếu không dính các trường hợp trên thì đưa cái request qua bên service (req.body)
    const checkUser = await User.findOne({
        email : email
    })
    // console.log('checkusser',checkUser)
  if(checkUser!==null){
    return res.status(200).json({
        status: 'ERH',
        message: 'Email đã tồn tại trong hệ thống'

    }) 
  }

  return res.status(200).json({
    status: 'OK',
    message: 'Email hợp lệ và chưa tồn tại trong hệ thống'
});
        
    } catch (e) {
        return res.status(404).json({
            message: e
        })
    }
}  

const loginUser = async(req, res) => {
    try{
        // Lấy ra những thuộc tính request sau khi send bằng TC
        const {email, password} = req.body
        // Kiểm tra xem có phải email hay không (check sau khi nhấn send trong TC)
        const reg = /^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/
        const isCheckEmail = reg.test(email)

        if(!email || !password ){
            return res.status(200).json({
                status: 'ERR',
                message: 'The input is required'

            })
        } else if(!isCheckEmail){
            return res.status(200).json({
                status: 'ERR',
                message: 'The input is email'

            }) 
        } 
    //   Nếu không dính các trường hợp trên thì đưa cái request qua bên service (req.body)
      const response =   await UserService.loginUser(req.body)
    //   Lưu refresh_toke vào một biến riêng và các thông tin còn lại vào 1 biến riêng
    // Cái newResponse không có chứa refresh_token
      const { refresh_token,...newResponse } =response
    //   Đưa cái refresh_token này vào cookie, kiểm tra bằng TC tab cookie
      res.cookie('refresh_token', refresh_token, {
        httpOnly: true, //chỉ lấy được nó thông qua http, ko lấy được qua js
        secure: false,  //Thêm những bảo mật ở phía client, khi nào deploy thì để thành true (https)
        samesite: 'strict'
      })
    //   console.log('response',response)

        return res.status(200).json({...newResponse, refresh_token})
    } catch (e) {
        return res.status(404).json({
            message: e
        })
    }
}  

const updateUser = async(req, res) => {
    try{
        // Lấy ra được cái id từ access token
      const userId = req.params.id
      console.log('req.params.id',req.params.id)
    //   Lấy ra những thông tin cần thay đổi
    const data = req.body
        if(!userId){
            return res.status(200).json({
                status: 'ERR',
                message: 'The userId is required'

            })
        }
    //   console.log('user id', userId)
    
      const response =   await UserService.updateUser(userId, data)
        return res.status(200).json(response)
    } catch (e) {
        return res.status(404).json({
            message: e
        })
    }
}  

const deleteUser = async(req, res) => {
    try{
        // Lấy ra được cái id từ access token
      const userId = req.params.id
      const token = req.headers
        if(!userId){
            return res.status(200).json({
                status: 'ERR',
                message: 'The userId is required'

            })
        }
    //   console.log('user id', userId)
    
      const response =   await UserService.deleteUser(userId)
        return res.status(200).json(response)
    } catch (e) {
        return res.status(404).json({
            message: e
        })
    }
}  

const deleteMany = async(req, res) => {
    try{
        // Lấy ra được cái id từ access token
      const ids = req.body.ids
      const token = req.headers
        if(!ids){
            return res.status(200).json({
                status: 'ERR',
                message: 'The ids is required'

            })
        }
    //   console.log('user id', userId)
    
      const response =   await UserService.deleteManyUser(ids)
        return res.status(200).json(response)
    } catch (e) {
        return res.status(404).json({
            message: e
        })
    }
} 

const getAllUser = async(req, res) => {
    try{
      
    
      const response =   await UserService.getAllUser()
        return res.status(200).json(response)
    } catch (e) {
        return res.status(404).json({
            message: e
        })
    }
}  


const getAllProduct = async(req, res) => {
    try{
      
    
      const response =   await UserService.getAllProduct()
        return res.status(200).json(response)
    } catch (e) {
        return res.status(404).json({
            message: e
        })
    }
}  

const getDetailsUser = async(req, res) => {
    try{
        // Lấy ra được cái id từ access token
      const userId = req.params.id
        if(!userId){
            return res.status(200).json({
                status: 'ERR',
                message: 'The userId is required'

            })
        }
    //   console.log('user id', userId)
    
      const response =   await UserService.getDetailsUser(userId)
        return res.status(200).json(response)
    } catch (e) {
        return res.status(404).json({
            message: e
        })
    }
}  


const getDetailsUserBlockchain = async(req, res) => {
    try{
        // Lấy ra được cái id từ access token
      const userId = req.params.id
        if(!userId){
            return res.status(200).json({
                status: 'ERR',
                message: 'The userId is required'

            })
        }
    //   console.log('user id', userId)
    
      const response =   await UserService.getDetailsUserBlockchain(userId)
        return res.status(200).json(response)
    } catch (e) {
        return res.status(404).json({
            message: e
        })
    }
}  


const refreshToken = async(req, res) => {
    // console.log('req.cookies.refresh_token', req.cookies.refresh_token)
    try{
        // Lấy ra được cái id từ access token
      let token = req.headers.token.split(' ')[1]

        if(!token){
            return res.status(200).json({
                status: 'ERR',
                message: 'The token is required'

            })
        }
    
      const response =   await JwtService.refreshTokenJWTService(token)
        return res.status(200).json(response)
    return 
    } catch (e) {
        return res.status(404).json({
            message: e
        })
    }
}

const logoutUser = async(req, res) => {
    try{
        // Xóa cái cookie lấy vào khi login
        res.clearCookie('refresh_token')

       
            return res.status(200).json({
                status: 'OK',
                message: 'Logout successfully'

            })
    } catch (e) {
        return res.status(404).json({
            message: e
        })
    }
}



// Phải export nó ra ngoài mới sử dụng được
module.exports = {
    createUser,
    loginUser,
    updateUser,
    deleteUser,
    getAllUser,
    getDetailsUser,
    refreshToken,
    logoutUser,
    deleteMany,
    checkEmail,
    getDetailsUserBlockchain,
    createProduct,
    getAllProduct
} 