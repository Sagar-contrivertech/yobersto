const express = require('express')
const router = express.Router()
const MenuController = require('../controllers/MenuController')


const multer = require('multer')

const storage = multer.memoryStorage();
const uploadService = multer({
    storage: storage
});


router.post('/add/menu', uploadService.fields([{
    name: 'Image'
},
]), MenuController.addMenu)

module.exports = router