const OrderService = require('../services/OrderService')


// Controller sẽ gọi qua service
const createOrder = async(req, res) => {
    try{
        // Lấy ra những thuộc tính request sau khi send bằng TC
        const {paymentMethod, itemsPrice, shippingPrice, totalPrice, fullName, address, city, phone} = req.body
        
      

        if(!paymentMethod || !itemsPrice || !shippingPrice || !totalPrice || !fullName || !address || !city || !phone){
            return res.status(200).json({
                status: 'ERR',
                message: 'The input is required'

            })
        }
    //   Nếu không dính các trường hợp trên thì đưa cái request qua bên service (req.body)
      const response =   await OrderService.createOrder(req.body)
        return res.status(200).json(response)
    } catch (e) {
        return res.status(404).json({
            message: e
        })
    }
}  

const getAllOrderDetails = async(req, res) => {
    try{
        // Lấy ra được cái id từ access token
      const userId = req.params.id
        if(!userId){
            return res.status(200).json({
                status: 'ERR',
                message: 'The userId is required'

            })
        }
    
      const response =   await OrderService.getAllOrderDetails(userId)
        return res.status(200).json(response)
    } catch (e) {
        return res.status(404).json({
            message: e
        })
    }
} 

const getDetailsOrder = async(req, res) => {
    try{
        // Lấy ra được cái id từ access token
      const orderId = req.params.id
        if(!orderId){
            return res.status(200).json({
                status: 'ERR',
                message: 'The orderId is required'

            })
        }
    
      const response =   await OrderService.getDetailsOrder(orderId)
        return res.status(200).json(response)
    } catch (e) {
        return res.status(404).json({
            message: e
        })
    }
} 

const cancelOrder = async(req, res) => {
    try{
        // Lấy ra được cái id từ access token
      const orderId = req.params.id
      const data = req.body
        if(!orderId){
            return res.status(200).json({
                status: 'ERR',
                message: 'The orderId is required'

            })
        }
    
      const response =   await OrderService.cancelOrder(orderId, data)
        return res.status(200).json(response)
    } catch (e) {
        return res.status(404).json({
            message: e
        })
    }
} 

const  getAllOrder = async(req, res) => {
    try{
       
    
      const data =   await OrderService.getAllOrder()
        return res.status(200).json(data)
    } catch (e) {
        return res.status(404).json({
            message: e
        })
    }
} 








// Phải export nó ra ngoài mới sử dụng được
module.exports = {
    createOrder,
    getAllOrderDetails,
    getDetailsOrder,
    cancelOrder,
    getAllOrder
} 