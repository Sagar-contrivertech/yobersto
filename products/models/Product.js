const mongoose = require('mongoose')

const productSchema = mongoose.Schema({
    name: {
        type: String,
    },
    Quantity: {
        type: Number
    },
    Price: {
        type: Number
    },
    image: {
        type: String
    },
    Menu_Name: {
        type: String
    },
    Estimate: {
        type: String
    },
    Catgeory: {
        type: String
    },
    item_descriptions: {
        type: String
    },
    Inventory: {
        type: String
    },
    unlist: {
        type: Boolean,
        default: false
    }
})


module.exports = mongoose.model('Product', productSchema)