const mongoose = require('mongoose')

const orderSchema = new mongoose.Schema({
    orderItems: [
        {
            name: { type: String, required: true },
            amount: { type: Number, required: true },
            image: { type: String, required: true },
            price: { type: Number, required: true },
            discount: { type: Number },
            // join bảng Product vào trong bảng Order
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product',
                required: true,
            },
        },
    ],
    shippingAddress: {
        fullName: { type: String, required: true },
        address: { type: String, required: true },
        city: { type: String, required: true },
        phone: { type: Number, required: true },
    },
    paymentMethod: { type: String, required: true },
    //total price product
    itemsPrice: { type: Number, required: true },
    shippingPrice: { type: Number, required: true },
    totalPrice: { type: Number, required: true },
    // join cái bảng User vào đây
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    // Đã thanh toán hay chưa
    isPaid: { type: Boolean, default: false },
    // Thanh toán vào lúc nào
    paidAt: { type: Date },
    // Đã được giao hay chưa
    isDelivered: { type: Boolean, default: false },
    // Giao vào lúc nào
    deliveredAt: { type: Date },
},
    {
        timestamps: true,
    }
);
const Order = mongoose.model('Order', orderSchema);
module.exports = Order