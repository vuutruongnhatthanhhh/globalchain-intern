const User = require("../models/UserModel")
const bcrypt = require("bcryptjs")
const { generalAccessToken, generalRefreshToken } = require("./JwtService")
const { use } = require("../routes/UserRouter")
const Order = require("../models/OrderProduct")
const Product = require("../models/ProductModel")
const EmailService = require("../services/EmailService")
// Xử lý api ở đây
// const createOrder = (newOrder) =>{
//     return new Promise(async(resolve, reject) =>{
//         // console.log('neworder', newOrder)
//         const {orderItems,paymentMethod, itemsPrice, shippingPrice, totalPrice, fullName, address, city, phone, user,isPaid, paidAt, email} = newOrder
//         try{
          
//         //  console.log('orderItems',{orderItems})
//         const promises = orderItems.map(async(order)=>{
//             const productData = await Product.findOneAndUpdate({
//                 _id: order.product,
//                 // tìm tới có số lượng quality đủ để trừ số lượng mua amount
//                 countInStock: {$gte: order.amount}
//              },
//             //  trả về số lượng mới
//              {$inc:{
//                 countInStock: -order.amount,
//                 selled: +order.amount
//              }},
//              {new: true}
//             )
//             // console.log('productData',productData)
//             if(productData){
//                 // gọi bên model
//                 const createdOrder = await Order.create({
//                     orderItems, 
//                     shippingAddress:{
//                         fullName,
//                         address,
//                         city,
//                         phone
//                     }, 
//                     paymentMethod, 
//                     itemsPrice,
//                     shippingPrice,
//                     totalPrice,
//                     user: user,
//                     isPaid, paidAt
//                 })
//                 if( createdOrder){
//                     await EmailService.sendEmailCreateOrder(email, orderItems)
//                     return{
//                         status: 'OK',
//                         message: 'SUCCESS',
//                     }
//                 }
//                 // nếu không đủ số lượng
//             } else{
//                 return{
//                     status:'OK',
//                     message: 'ERR',
//                     id: order.product
//                 }
//             }
//         })
        
            
//            const results = await Promise.all(promises)
//            const newData = results && results.filter((item) => item.id)
//            if(newData.length){
//             resolve({
//                 status: 'ERR',
//                 message: `San pham voi id ${newData.join(',')} khong du hang`
//             })
//            }
//         //    console.log('results',results)
    
//         resolve({
//             status: 'OK',
//             message:'success'
//         })
//         }catch(e){
//             reject(e)
//         }
//     })
// }

const createOrder = (newOrder) => {
    return new Promise(async (resolve, reject) => {
        const { orderItems, paymentMethod, itemsPrice, shippingPrice, totalPrice, fullName, address, city, phone, user, isPaid, paidAt, email } = newOrder;
        try {
            // Kiểm tra tồn kho cho tất cả các sản phẩm trước
            const stockPromises = orderItems.map(async (order) => {
                const productData = await Product.findOneAndUpdate({
                    _id: order.product,
                    countInStock: { $gte: order.amount }
                }, {
                    $inc: {
                        countInStock: -order.amount,
                        selled: +order.amount
                    }
                }, { new: true });

                if (!productData) {
                    return {
                        status: 'ERR',
                        message: 'ERR',
                        id: order.product
                    };
                }
            });

            const stockResults = await Promise.all(stockPromises);
            const insufficientStock = stockResults.filter(result => result && result.status === 'ERR');
            if (insufficientStock.length) {
                resolve({
                    status: 'ERR',
                    message: `Sản phẩm với id ${insufficientStock.map(item => item.id).join(', ')} không đủ hàng`
                });
                return;
            }

            // Tạo đơn hàng chỉ khi tất cả các sản phẩm còn hàng
            const createdOrder = await Order.create({
                orderItems,
                shippingAddress: {
                    fullName,
                    address,
                    city,
                    phone
                },
                paymentMethod,
                itemsPrice,
                shippingPrice,
                totalPrice,
                user,
                isPaid,
                paidAt
            });

            if (createdOrder) {
                await EmailService.sendEmailCreateOrder(email, orderItems);
                resolve({
                    status: 'OK',
                    message: 'SUCCESS'
                });
            } else {
                resolve({
                    status: 'ERR',
                    message: 'Không thể tạo đơn hàng'
                });
            }
        } catch (e) {
            reject(e);
        }
    });
};


const getAllOrderDetails = (id) =>{
    return new Promise(async(resolve, reject) =>{
        try{
      
            const order = await Order.find({
                user: id
            })
            if(order===null){
                resolve({
                    status: 'OK',
                    message: 'The order is not defined'
                })
            }
                resolve({
                    status: 'OK',
                    message: 'SUCCESS',
                    data: order
                })
            // }
            // resolve({})
        }catch(e){
            reject(e)
        }
    })
}

const  getDetailsOrder = (id) =>{
    return new Promise(async(resolve, reject) =>{
        try{
      
            const order = await Order.findById({
                _id: id
            })
            if(order===null){
                resolve({
                    status: 'OK',
                    message: 'The order is not defined'
                })
            }
                resolve({
                    status: 'OK',
                    message: 'SUCCESS',
                    data: order
                })
            // }
            // resolve({})
        }catch(e){
            reject(e)
        }
    })
}

const  cancelOrder = (id, data) =>{
    return new Promise(async(resolve, reject) =>{
        try{
            let order = []
            const promises = data.map(async(order)=>{
                const productData = await Product.findOneAndUpdate({
                    _id: order.product,
                    selled: {$gte: order.amount}
                 },
                // TTăng lại số lượng khi hủy đơn hàng
                 {$inc:{
                    countInStock: +order.amount,
                    selled: -order.amount
                 }},
                 {new: true}
                )
                console.log('productData',productData)
                if(productData){
                     order = await Order.findByIdAndDelete(id)
                    if(order===null){
                        resolve({
                            status: 'OK',
                            message: 'The order is not defined'
                        })
                    }
                    
                    // nếu không đủ số lượng
                } else{
                    return{
                        status:'OK',
                        message: 'ERR',
                        id: order.product
                    }
                }
            })
            
                
               const results = await Promise.all(promises)
               const newData = results && results.filter((item) => item)
               if(newData.length){
                resolve({
                    status: 'ERR',
                    message: `San pham voi id ${newData.join(',')} khong ton tai`
                })
               }
            //    console.log('results',results)
            resolve({
                status: 'OK',
                message:'success',
                data: order
            })
        }catch(e){
            reject(e)
        }
    })
}

const getAllOrder = () =>{
    return new Promise(async(resolve, reject) =>{
        try{
  
           const allOrder =  await Order.find()
                resolve({
                    status: 'OK',
                    message: 'SUCCESS',
                    data: allOrder
                })
            // }
            // resolve({})
        }catch(e){
            reject(e)
        }
    })
}






module.exports = {
    createOrder,
    getAllOrderDetails,
    getDetailsOrder,
    cancelOrder,
    getAllOrder
}