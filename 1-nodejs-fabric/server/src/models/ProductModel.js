const mongoose = require('mongoose')

const productSchema = new mongoose.Schema(
    {
        // có required true là bắt buộc phải có
        name: { type: String, required: true, unique: true },
        
        type: { type: String, required: true },
        price: { type: Number, required: true },
        
       
        unit:{type: String}
    },
    {
        timestamps: true,
    }
);
const Product = mongoose.model('Product', productSchema);

module.exports = Product;