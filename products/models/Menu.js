const mongoose = require('mongoose')

const menuSchema = mongoose.Schema({
    name: {
        type: String,
        require: true
    },
    Image: {
        type: String
    },
})


module.exports = mongoose.model('Menu', menuSchema)