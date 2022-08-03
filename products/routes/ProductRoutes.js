const express = require('express')
const router = express.Router()
const ProductController = require('../controllers/productController')


const multer = require('multer')

const storage = multer.memoryStorage();
const uploadService = multer({
    storage: storage
});

router.post("/add/product", uploadService.fields([{
    name: 'image'
}]), ProductController.addProduct)


module.exports = router