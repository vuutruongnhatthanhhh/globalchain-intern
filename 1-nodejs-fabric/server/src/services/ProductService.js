const Product = require("../models/ProductModel")


// Xử lý api ở đây
const createProduct = (newProduct) =>{
    return new Promise(async(resolve, reject) =>{
        const {name, type, price,  unit} = newProduct
        try{
            
              const checkProduct = await Product.findOne({
                name : name
            })
          if(checkProduct!==null){
            resolve({
                status: 'OK',
                message: 'The name of product is already'
            })
          }
            // gọi bên model
            const createdProduct = await Product.create({
                name, 
                type, 
                price,
                unit
            })
            if(createdProduct){
                resolve({
                    status: 'OK',
                    message: 'SUCCESS',
                    data: createdProduct
                })
            }
            resolve({})
        }catch(e){
            reject(e)
        }
    })
}

const updateProduct = (id, data) =>{
    return new Promise(async(resolve, reject) =>{
        try{
      
            const checkProduct = await Product.findOne({
                _id: id
            })
            if(checkProduct===null){
                resolve({
                    status: 'OK',
                    message: 'The product is not defined'
                })
            }
            // update product
            const updatedProduct = await Product.findByIdAndUpdate(id, data, {new : true})
                resolve({
                    status: 'OK',
                    message: 'SUCCESS',
                    // Trả về user mới sau khi update
                    data: updatedProduct
                })
            // }
            // resolve({})
        }catch(e){
            reject(e)
        }
    })
}

const getDetailProduct = (id) =>{
    return new Promise(async(resolve, reject) =>{
        try{
      
            const product = await Product.findOne({
                _id: id
            })
            if(product===null){
                resolve({
                    status: 'OK',
                    message: 'The product is not defined'
                })
            }
                resolve({
                    status: 'OK',
                    message: 'SUCCESS',
                    data: product
                })
            // }
            // resolve({})
        }catch(e){
            reject(e)
        }
    })
}

const deleteProduct = (id) =>{
    return new Promise(async(resolve, reject) =>{
        try{
      
            const checkProduct = await Product.findOne({
                _id: id
            })
            if(checkProduct===null){
                resolve({
                    status: 'OK',
                    message: 'The product is not defined'
                })
            }
            // delete product
             await Product.findByIdAndDelete(id)
                resolve({
                    status: 'OK',
                    message: 'DELETE PRODUCT SUCCESS',
                   
                })
        }catch(e){
            reject(e)
        }
    })
}

const deleteManyProduct = (ids) =>{
    return new Promise(async(resolve, reject) =>{
        try{
      
           
            // delete product
             await Product.deleteMany({_id: ids})
                resolve({
                    status: 'OK',
                    message: 'DELETE PRODUCT SUCCESS',
                   
                })
        }catch(e){
            reject(e)
        }
    })
}

// limit là số lượng sản phẩm trên 1 trang (phân trang)
const getAllProduct = (limit, page, sort, filter) =>{
    // console.log('sort', sort)
    return new Promise(async(resolve, reject) =>{
        try{
      
           const totalProduct = await Product.countDocuments()
            let allProduct = []
        //    console.log('filter', filter)
           if(filter){
            const objectFilter = {}
            // Do ở đây mình đang đặt key là phần tử đầu tiên  get-all?page=1&limit=2&filter=name&filter=product2
            const label = filter[0]
            const allProductFilter =  await Product.find({
                // regex là tìm những từ có chứa từ khóa đó
                [label]: {'$regex': filter[1]}
            }).limit(limit).skip(page * limit)
            resolve({
                status: 'OK',
                message: 'SUCCESS',
                data: allProductFilter,
                total: totalProduct,
                pageCurrent: Number(page+1),
                totalPage: Math.ceil(totalProduct / limit)
            })    
           }
           if(sort){
            // Ví dụ get-all?page=1&limit=2&sort=asc&sort=name, thì kết quả sẽ ra name:asc
            const objectSort = {}
            objectSort[sort[1]] = sort[0]
            console.log('objectSort', objectSort)
            const allProductSort =  await Product.find().limit(limit).skip(page * limit).sort(objectSort)
            resolve({
                status: 'OK',
                message: 'SUCCESS',
                data: allProductSort,
                total: totalProduct,
                pageCurrent: Number(page+1),
                totalPage: Math.ceil(totalProduct / limit)
            })
           }

           if(!limit){
            allProduct =  await Product.find()
           } 
        
                resolve({
                    status: 'OK',
                    message: 'SUCCESS',
                    data: allProduct,
                    total: totalProduct,
                    pageCurrent: Number(page+1),
                    totalPage: Math.ceil(totalProduct / limit)
                })
        }catch(e){
            reject(e)
        }
    })
}

const getAllType = () =>{
    return new Promise(async(resolve, reject) =>{
        try{
         
            // distinct: chọn cái field mình muốn lấy dữ liệu
           const allType =  await Product.distinct('type')
                resolve({
                    status: 'OK',
                    message: 'SUCCESS',
                    data: allType,
                })
        }catch(e){
            reject(e)
        }
    })
}


module.exports = {
    createProduct,
    updateProduct,
    getDetailProduct,
    deleteProduct,
    getAllProduct,
    deleteManyProduct,
    getAllType
  
}