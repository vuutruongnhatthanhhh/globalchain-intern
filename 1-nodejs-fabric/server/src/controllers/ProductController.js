const ProductService = require('../services/ProductService')


// Controller sẽ gọi qua service
const createProduct = async(req, res) => {
    try{
        // Lấy ra những thuộc tính request sau khi send bằng TC
        const {name,  type, price, unit} = req.body
        
      

        if(!name ||  !type || !price || !unit){
            return res.status(200).json({
                status: 'ERR',
                message: 'The input is required'

            })
        }
    //   Nếu không dính các trường hợp trên thì đưa cái request qua bên service (req.body)
      const response =   await ProductService.createProduct(req.body)
        return res.status(200).json(response)
    } catch (e) {
        return res.status(404).json({
            message: e
        })
    }
}  

const updateProduct = async(req, res) => {
    try{
        // Lấy ra được cái id từ access token
      const productId = req.params.id
    //   Lấy ra những thông tin cần thay đổi
    const data = req.body
        if(!productId){
            return res.status(200).json({
                status: 'ERR',
                message: 'The productId is required'

            })
        }
 
    
      const response =   await ProductService.updateProduct(productId, data)
        return res.status(200).json(response)
    } catch (e) {
        return res.status(404).json({
            message: e
        })
    }
}  

const getDetailProduct = async(req, res) => {
    try{
        // Lấy ra được cái id từ access token
      const productId = req.params.id
        if(!productId){
            return res.status(200).json({
                status: 'ERR',
                message: 'The productId is required'

            })
        }
    
      const response =   await ProductService.getDetailProduct(productId)
        return res.status(200).json(response)
    } catch (e) {
        return res.status(404).json({
            message: e
        })
    }
} 

const deleteProduct = async(req, res) => {
    try{
        // Lấy ra được cái id từ access token
      const productId = req.params.id
        if(!productId){
            return res.status(200).json({
                status: 'ERR',
                message: 'The productId is required'

            })
        }
    
      const response =   await ProductService.deleteProduct(productId)
        return res.status(200).json(response)
    } catch (e) {
        return res.status(404).json({
            message: e
        })
    }
}  

const deleteManyProduct = async(req, res) => {
    try{
    //    Nhận vào 1 mảng id
      const ids = req.body.ids
        if(!ids){
            return res.status(200).json({
                status: 'ERR',
                message: 'The ids is required'

            })
        }
    
      const response =   await ProductService.deleteManyProduct(ids)
        return res.status(200).json(response)
    } catch (e) {
        return res.status(404).json({
            message: e
        })
    }
}  

const getAllProduct = async(req, res) => {
    try{
    //   filter là tìm kiếm
      const { limit, page, sort, filter } = req.query
    //   Nếu không có number nó sẽ hiểu nhầm là string  
    // Nếu không có limit thì sẽ là 8, không có page thì sẽ là 0
      const response =   await ProductService.getAllProduct(Number(limit) || null, Number(page) || 0, sort, filter)
        return res.status(200).json(response)
    } catch (e) {
        return res.status(404).json({
            message: e
        })
    }
}  

const getAllType = async(req, res) => {
    try{
  
      const response =   await ProductService.getAllType()
        return res.status(200).json(response)
    } catch (e) {
        return res.status(404).json({
            message: e
        })
    }
}  




// Phải export nó ra ngoài mới sử dụng được
module.exports = {
    createProduct,
    updateProduct,
    getDetailProduct,
    deleteProduct,
    getAllProduct,
    deleteManyProduct,
    getAllType
} 