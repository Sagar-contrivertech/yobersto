const express = require('express')
const router = express.Router()
const CategoryController = require('../controllers/CatgeoryController')


const multer = require('multer')

const storage = multer.memoryStorage();
const uploadService = multer({
    storage: storage
});


router.post('/add/category', uploadService.fields([{
    name: 'icon'
},
]), CategoryController.addCategory)


router.get('/get/category',CategoryController.getCategory)

router.get('/category/:id', CategoryController.getCategoryById)


module.exports = router