const jwt = require('jsonwebtoken')
const dotenv = require('dotenv');
const { use } = require('../routes/UserRouter');
dotenv.config()

//jwt là json web token, dùng token thay cho session 


//*Khi đăng nhập access token sẽ được tạo ra cho phiên làm việc
//      + Dùng để xác thực và ủy quyền truy cập của người dùng đến các dịch vụ (id, role)
// *Không lấy những thông tin đó trực tiếp từ db vì
//      + Nhanh hơn, giảm tải cho db nếu có lượng người dùng lớn
//      + Bảo mật, thông tin nhạy cảm có thể bị lộ (sql injection)
//      + Quản lý phiên làm việc (session), quản lý phiên làm việc linh hoạt hơn, bao gồm việc xác định
// thời gian hết hạn cho phiên làm việc, thuận tiện cho việc tái sử dụng phiên làm việc (vd: remember me)




// * Vì access token hết hạn (thường thời gian sẽ ngắn để đảm bảo tính bảo mật ) nó sẽ bắt 
// người dùng đăng nhập lại để lấy access token mới, refresh token giải quyết vấn đề này, tạo ra một access_token 
// mới mà không yêu cầu người dùng phải đăng nhập lại
// 


// Cái key secret và thời gian hết hạn cho nó
const generalAccessToken = async(payload) => {
    const access_token = jwt.sign({
        // ... để lấy ra từng thuộc tính của payload chứ không phải một chuỗi
        ...payload
    }, process.env.ACCESS_TOKEN, { expiresIn: '365d' })

    return access_token
}


const generalRefreshToken = async(payload) => {
    const refresh_token = jwt.sign({
        ...payload
    }, process.env.REFRESH_TOKEN, { expiresIn: '365d' })

    return refresh_token
}

const refreshTokenJWTService =(token) => {
    return new Promise((resolve, reject) =>{
        try{
      
          console.log('token', token)
        //   verify lỗi thì trả về err, thành công thì trả về user
          jwt.verify(token, process.env.REFRESH_TOKEN, async(err, user)=>{
            if(err){
                resolve({
                    status: 'ERROR',
                    message:'The authentication'
                })
            }
           

            // Tạo ra 1 cái access_token mới ứng với id và isAdmin
            const access_token = await generalAccessToken({
              id: user?.id,
              isAdmin: user?.isAdmin
            })
            console.log('access_token', access_token)
            resolve({
                status: 'OK',
                message: 'SUCCESS',
                access_token
            })
          })
         
                
            // }
            // resolve({})
        }catch(e){
            reject(e)
        }
    })
    

    
}


// Nơi đưa method ra ngoài mới sử dụng được
module.exports = {
    generalAccessToken,
    generalRefreshToken,
    refreshTokenJWTService
}